import crypto from "crypto";
import bcrypt from "bcrypt";
import QRCode from "qrcode";
import { authenticator } from "otplib";
import { executeRequest, sql } from "../utils/dbHandler";
import { encrypt, decrypt } from "../utils/crypto";

const ISSUER = "Farmacia Do Sul";
const STEP_SECONDS = 30;
const MAX_INTENTOS = 5;
const MINUTOS_BLOQUEO = 15;
const CANT_CODIGOS_RECUPERACION = 10;

// Acepta el código anterior y el siguiente para tolerar desfase de reloj
authenticator.options = { window: 1, step: STEP_SECONDS };

export type VerifyResult = "ok" | "invalid" | "locked";

export interface Usuario2FA {
  administrador: boolean;
  totpHabilitado: boolean;
}

const idInput = (idUsuario: number) => ({ name: "idUsuario", type: sql.Int(), value: idUsuario });

// El 2FA se guarda en usuarioPacote (propia de esta app). La tabla usuario la comparte
// el ERP y aquí solo se lee para saber si es administrador.
export const getUsuario2FA = async (idUsuario: number): Promise<Usuario2FA | null> => {
  const result = await executeRequest({
    query: `SELECT u.administrador, up.totpHabilitado
            FROM usuarioPacote up
            INNER JOIN usuario u ON u.idUsuario = up.idUsuario
            WHERE up.idUsuario = @idUsuario`,
    inputs: [idInput(idUsuario)],
  });
  const row = result.recordset[0];
  if (!row) return null;
  return { administrador: !!row.administrador, totpHabilitado: !!row.totpHabilitado };
};

/** Genera un secreto nuevo (solo si el 2FA todavía no está habilitado) y devuelve el QR. */
export const iniciarEnrolamiento = async (
  idUsuario: number
): Promise<{ qrDataUrl: string; manualKey: string } | null> => {
  const secret = authenticator.generateSecret(20);
  const result = await executeRequest({
    query: `UPDATE usuarioPacote SET totpSecret = @secret, totpUltimoPaso = NULL
            WHERE idUsuario = @idUsuario AND totpHabilitado = 0`,
    inputs: [idInput(idUsuario), { name: "secret", type: sql.NVarChar(255), value: encrypt(secret) }],
  });
  if (result.rowsAffected[0] === 0) return null;

  const uri = authenticator.keyuri(`Usuario ${idUsuario}`, ISSUER, secret);
  const qrDataUrl = await QRCode.toDataURL(uri);
  return { qrDataUrl, manualKey: secret };
};

const registrarFallo = async (idUsuario: number): Promise<void> => {
  await executeRequest({
    query: `UPDATE usuarioPacote SET
              intentos2FA = CASE WHEN intentos2FA + 1 >= @max THEN 0 ELSE intentos2FA + 1 END,
              bloqueado2FAHasta = CASE WHEN intentos2FA + 1 >= @max
                                       THEN DATEADD(MINUTE, @minutos, GETDATE())
                                       ELSE bloqueado2FAHasta END
            WHERE idUsuario = @idUsuario`,
    inputs: [
      idInput(idUsuario),
      { name: "max", type: sql.Int(), value: MAX_INTENTOS },
      { name: "minutos", type: sql.Int(), value: MINUTOS_BLOQUEO },
    ],
  });
};

const estaBloqueado = (row: { bloqueado: number }): boolean => row.bloqueado === 1;

const leerEstado = async (idUsuario: number) => {
  const result = await executeRequest({
    // El bloqueo se evalúa en SQL: GETDATE() es hora local y el driver lee DATETIME como UTC
    query: `SELECT totpSecret, totpHabilitado, totpUltimoPaso,
                   CASE WHEN bloqueado2FAHasta > GETDATE() THEN 1 ELSE 0 END AS bloqueado
            FROM usuarioPacote WHERE idUsuario = @idUsuario`,
    inputs: [idInput(idUsuario)],
  });
  return result.recordset[0] as
    | { totpSecret: string | null; totpHabilitado: boolean; totpUltimoPaso: string | null; bloqueado: number }
    | undefined;
};

/**
 * Verifica un código TOTP. `habilitar` = true durante el enrolamiento:
 * si el código es válido marca el 2FA como habilitado.
 */
export const verificarCodigo = async (
  idUsuario: number,
  code: string,
  habilitar: boolean
): Promise<VerifyResult> => {
  const row = await leerEstado(idUsuario);
  if (!row || !row.totpSecret || row.totpHabilitado === habilitar) return "invalid";
  if (estaBloqueado(row)) return "locked";

  const token = String(code ?? "").replace(/\s/g, "");
  const delta = /^\d{6}$/.test(token) ? authenticator.checkDelta(token, decrypt(row.totpSecret)) : null;
  if (delta === null) {
    await registrarFallo(idUsuario);
    return "invalid";
  }

  const paso = Math.floor(Date.now() / 1000 / STEP_SECONDS) + delta;
  // El WHERE sobre totpUltimoPaso impide reutilizar un código (anti-replay), incluso en paralelo
  const result = await executeRequest({
    query: `UPDATE usuarioPacote SET totpUltimoPaso = @paso, intentos2FA = 0, bloqueado2FAHasta = NULL
              ${habilitar ? ", totpHabilitado = 1" : ""}
            WHERE idUsuario = @idUsuario AND (totpUltimoPaso IS NULL OR totpUltimoPaso < @paso)`,
    inputs: [idInput(idUsuario), { name: "paso", type: sql.BigInt(), value: paso }],
  });
  if (result.rowsAffected[0] === 0) {
    await registrarFallo(idUsuario);
    return "invalid";
  }
  return "ok";
};

const generarCodigo = (): string => {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(8);
  const chars = Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join("");
  return `${chars.slice(0, 4)}-${chars.slice(4)}`;
};

const normalizarCodigo = (code: string): string => String(code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");

/** Reemplaza los códigos de recuperación del usuario y devuelve los nuevos en texto plano (una sola vez). */
export const generarCodigosRecuperacion = async (idUsuario: number): Promise<string[]> => {
  const codigos = Array.from({ length: CANT_CODIGOS_RECUPERACION }, generarCodigo);
  const hashes = await Promise.all(codigos.map((c) => bcrypt.hash(normalizarCodigo(c), 10)));

  await executeRequest({
    query: `DELETE FROM usuarioCodigoRecuperacion WHERE idUsuario = @idUsuario`,
    inputs: [idInput(idUsuario)],
  });
  for (const hash of hashes) {
    await executeRequest({
      query: `INSERT INTO usuarioCodigoRecuperacion (idUsuario, codigoHash) VALUES (@idUsuario, @hash)`,
      inputs: [idInput(idUsuario), { name: "hash", type: sql.NVarChar(100), value: hash }],
    });
  }
  return codigos;
};

/** Consume un código de recuperación. */
export const usarCodigoRecuperacion = async (idUsuario: number, code: string): Promise<VerifyResult> => {
  const row = await leerEstado(idUsuario);
  if (!row || !row.totpHabilitado) return "invalid";
  if (estaBloqueado(row)) return "locked";

  const normalizado = normalizarCodigo(code);
  const result = await executeRequest({
    query: `SELECT id, codigoHash FROM usuarioCodigoRecuperacion WHERE idUsuario = @idUsuario AND usado = 0`,
    inputs: [idInput(idUsuario)],
  });

  for (const { id, codigoHash } of result.recordset) {
    if (normalizado.length === 8 && (await bcrypt.compare(normalizado, codigoHash))) {
      const upd = await executeRequest({
        query: `UPDATE usuarioCodigoRecuperacion SET usado = 1 WHERE id = @id AND usado = 0`,
        inputs: [{ name: "id", type: sql.Int(), value: id }],
      });
      if (upd.rowsAffected[0] === 1) {
        await executeRequest({
          query: `UPDATE usuarioPacote SET intentos2FA = 0, bloqueado2FAHasta = NULL WHERE idUsuario = @idUsuario`,
          inputs: [idInput(idUsuario)],
        });
        return "ok";
      }
    }
  }
  await registrarFallo(idUsuario);
  return "invalid";
};

/** Elimina el 2FA de un usuario; en su próximo login deberá enrolarse de nuevo. */
export const resetear2FA = async (idUsuario: number): Promise<boolean> => {
  const result = await executeRequest({
    query: `UPDATE usuarioPacote SET totpSecret = NULL, totpHabilitado = 0, totpUltimoPaso = NULL,
                   intentos2FA = 0, bloqueado2FAHasta = NULL
            WHERE idUsuario = @idUsuario;
            DELETE FROM usuarioCodigoRecuperacion WHERE idUsuario = @idUsuario;`,
    inputs: [idInput(idUsuario)],
  });
  return result.rowsAffected[0] > 0;
};
