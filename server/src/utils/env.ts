import dotenv from "dotenv";

dotenv.config();

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno obligatoria ${name}`);
  }
  return value;
};

export const env = {
  JWT_SECRET: required("JWT_SECRET"),
  // Clave de 32 bytes en base64 para cifrar los secretos TOTP
  TOTP_ENC_KEY: required("TOTP_ENC_KEY"),
  // Orígenes permitidos separados por coma. Vacío = mismo origen (sin CORS)
  CORS_ORIGIN: process.env.CORS_ORIGIN || "",
  TRUST_PROXY: process.env.TRUST_PROXY === "true",
};

if (Buffer.from(env.TOTP_ENC_KEY, "base64").length !== 32) {
  throw new Error("TOTP_ENC_KEY debe ser una clave de 32 bytes codificada en base64");
}
if (env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET debe tener al menos 32 caracteres");
}
