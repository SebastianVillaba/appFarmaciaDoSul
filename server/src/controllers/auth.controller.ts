import { Request, Response } from "express";
import { executeRequest, sql } from "../utils/dbHandler";
import { signToken, AuthUser } from "../middlewares/auth.middleware";
import {
  getUsuario2FA,
  iniciarEnrolamiento,
  verificarCodigo,
  generarCodigosRecuperacion,
  usarCodigoRecuperacion,
  resetear2FA,
  VerifyResult,
} from "../services/twoFactor.service";

const CREDENCIALES_INVALIDAS = "Usuario o contraseña incorrectos";

const sessionResponse = (user: AuthUser) => ({
  message: "Login exitoso",
  success: true,
  token: signToken(user, "full"),
  user: { id: user.idUsuario, idSucursal: user.idSucursal },
});

const responderFallo = (res: Response, result: VerifyResult): void => {
  if (result === "locked") {
    res.status(429).json({ message: "Demasiados intentos fallidos. Intente nuevamente en 15 minutos." });
  } else {
    res.status(400).json({ message: "Código inválido" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Nombre de usuario y contraseña son obligatorios!" });
    return;
  }

  try {
    const result = await executeRequest({
      query: "sp_usuarioPassPacote",
      isStoredProcedure: true,
      inputs: [
        {
          name: 'usuario',
          type: sql.VarChar(20),
          value: String(username)
        },
        {
          name: 'pass',
          type: sql.VarChar(20),
          value: String(password)
        }
      ]
    });

    const { resultado, idUsuario, idSucursal } = result.recordset[0];

    if (resultado === 1 || resultado === 2) {
      res.status(401).json({ message: CREDENCIALES_INVALIDAS });
      return;
    } else if (resultado === 3) {
      const usuario2FA = await getUsuario2FA(idUsuario);
      if (!usuario2FA) {
        res.status(401).json({ message: CREDENCIALES_INVALIDAS });
        return;
      }

      const user = { idUsuario, idSucursal, administrador: usuario2FA.administrador };

      // La contraseña es correcta, pero la sesión solo se emite tras el segundo factor
      if (usuario2FA.totpHabilitado) {
        res.json({ success: true, requires2FA: true, tempToken: signToken(user, "mfa") });
      } else {
        res.json({ success: true, requiresEnrollment: true, tempToken: signToken(user, "enroll") });
      }
    } else {
      res.status(500).json({ message: "Error desconocido en autenticación" });
    }
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

/** Etapa enroll: genera el secreto TOTP y devuelve el QR. */
export const setup2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await iniciarEnrolamiento(req.user!.idUsuario);
    if (!data) {
      res.status(409).json({ message: "El 2FA ya está activado para este usuario" });
      return;
    }
    res.json(data);
  } catch (error) {
    console.error("Error en setup2FA:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

/** Etapa enroll: confirma el primer código, activa el 2FA y emite la sesión. */
export const enable2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const result = await verificarCodigo(user.idUsuario, req.body.code, true);
    if (result !== "ok") {
      responderFallo(res, result);
      return;
    }
    const recoveryCodes = await generarCodigosRecuperacion(user.idUsuario);
    res.json({ ...sessionResponse(user), recoveryCodes });
  } catch (error) {
    console.error("Error en enable2FA:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

/** Etapa mfa: verifica el código de la app y emite la sesión. */
export const verify2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const result = await verificarCodigo(user.idUsuario, req.body.code, false);
    if (result !== "ok") {
      responderFallo(res, result);
      return;
    }
    res.json(sessionResponse(user));
  } catch (error) {
    console.error("Error en verify2FA:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

/** Etapa mfa: consume un código de recuperación y emite la sesión. */
export const recovery2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const result = await usarCodigoRecuperacion(user.idUsuario, req.body.recoveryCode);
    if (result !== "ok") {
      responderFallo(res, result);
      return;
    }
    res.json(sessionResponse(user));
  } catch (error) {
    console.error("Error en recovery2FA:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

/** Admin: elimina el 2FA de un usuario para que vuelva a enrolarse. */
export const reset2FA = async (req: Request, res: Response): Promise<void> => {
  const idUsuario = Number(req.params.id);
  if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
    res.status(400).json({ message: "idUsuario inválido" });
    return;
  }
  try {
    const ok = await resetear2FA(idUsuario);
    if (!ok) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }
    res.json({ success: true, message: "2FA reseteado. El usuario deberá configurarlo en su próximo inicio de sesión." });
  } catch (error) {
    console.error("Error en reset2FA:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
