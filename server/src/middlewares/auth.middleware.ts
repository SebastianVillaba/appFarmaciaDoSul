import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../utils/env";

export type AuthStage = "full" | "mfa" | "enroll";

export interface AuthUser {
  idUsuario: number;
  idSucursal: number;
  administrador: boolean;
  stage: AuthStage;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const TOKEN_TTL: Record<AuthStage, string> = {
  full: "30m",
  mfa: "5m",
  enroll: "10m",
};

export const signToken = (user: Omit<AuthUser, "stage">, stage: AuthStage): string =>
  jwt.sign(
    { idUsuario: user.idUsuario, idSucursal: user.idSucursal, administrador: user.administrador, stage },
    env.JWT_SECRET,
    { expiresIn: TOKEN_TTL[stage] as jwt.SignOptions["expiresIn"], algorithm: "HS256" }
  );

const readToken = (req: Request): AuthUser | null => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET, { algorithms: ["HS256"] }) as AuthUser;
    return payload;
  } catch {
    return null;
  }
};

/** Exige un token de sesión completa (contraseña + 2FA). */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  requireStage("full")(req, res, next);
};

/** Exige un token en una etapa concreta del login (mfa/enroll/full). */
export const requireStage =
  (stage: AuthStage) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const user = readToken(req);
    if (!user || user.stage !== stage) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }
    req.user = user;
    next();
  };

/** Debe usarse después de requireAuth. */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user?.administrador) {
    res.status(403).json({ message: "Acceso restringido a administradores" });
    return;
  }
  next();
};
