-- =============================================================
-- 001_2fa.sql  -  Autenticación de 2 pasos (TOTP)
-- Ejecutar manualmente en la base farmaciadosul ANTES de desplegar
-- la versión del servidor que incluye 2FA.
--
-- IMPORTANTE: NO se modifica la tabla usuario (la usa también el ERP).
-- Los datos del 2FA se guardan en usuarioPacote, la tabla de login de esta app.
-- Se asume que usuarioPacote tiene la columna idUsuario (la que devuelve sp_usuarioPassPacote).
-- =============================================================

IF COL_LENGTH('usuarioPacote', 'totpSecret') IS NULL
BEGIN
  ALTER TABLE usuarioPacote ADD
    totpSecret        NVARCHAR(255) NULL,            -- secreto cifrado AES-256-GCM (iv:tag:cipher)
    totpHabilitado    BIT NOT NULL CONSTRAINT DF_usuarioPacote_totpHabilitado DEFAULT 0,
    totpUltimoPaso    BIGINT NULL,                   -- último paso TOTP aceptado (anti-replay)
    intentos2FA       INT NOT NULL CONSTRAINT DF_usuarioPacote_intentos2FA DEFAULT 0,
    bloqueado2FAHasta DATETIME NULL;
END
GO

IF OBJECT_ID('usuarioCodigoRecuperacion', 'U') IS NULL
BEGIN
  CREATE TABLE usuarioCodigoRecuperacion (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    idUsuario     INT NOT NULL,                      -- idUsuario de usuarioPacote
    codigoHash    NVARCHAR(100) NOT NULL,            -- bcrypt
    usado         BIT NOT NULL DEFAULT 0,
    fechaCreacion DATETIME NOT NULL DEFAULT GETDATE()
  );
  CREATE INDEX IX_usuarioCodigoRecuperacion_idUsuario ON usuarioCodigoRecuperacion(idUsuario);
END
GO

-- Para resetear el 2FA de un usuario manualmente (pérdida de teléfono y códigos):
-- UPDATE usuarioPacote SET totpSecret = NULL, totpHabilitado = 0, totpUltimoPaso = NULL,
--        intentos2FA = 0, bloqueado2FAHasta = NULL WHERE idUsuario = <id>;
-- DELETE FROM usuarioCodigoRecuperacion WHERE idUsuario = <id>;
