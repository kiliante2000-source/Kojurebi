import type { NextFunction, Request, Response } from 'express';
import { env } from '../utils/env.js';
import { AppError } from '../utils/errors.js';
import { verifyToken, type JwtPayload } from '../utils/jwt.js';

export type AuthedRequest = Request & {
  user?: JwtPayload;
};

export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[env.COOKIE_NAME] as string | undefined;
    if (!token) {
      throw new AppError(401, 'No autenticado', 'UNAUTHORIZED');
    }
    req.user = verifyToken(token);
    next();
  } catch {
    next(new AppError(401, 'Sesión inválida o expirada', 'UNAUTHORIZED'));
  }
}

export function requireAdmin(req: AuthedRequest, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new AppError(401, 'No autenticado', 'UNAUTHORIZED'));
  }
  if (req.user.role !== 'admin') {
    return next(new AppError(403, 'Solo el estudio puede entrar aquí', 'FORBIDDEN'));
  }
  next();
}
