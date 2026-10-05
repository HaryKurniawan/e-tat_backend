import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { sendUnauthorized } from '../utils/response.util';
import prisma from '../config/database';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

/**
 * Middleware untuk memverifikasi JWT access token.
 * Menyimpan user info ke req.user
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendUnauthorized(res, 'Token autentikasi tidak ditemukan');
      return;
    }

    const token = authHeader.split(' ')[1];

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    } catch {
      sendUnauthorized(res, 'Token tidak valid atau sudah kedaluwarsa');
      return;
    }

    // Verifikasi user masih aktif di database
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, name: true, agency: true, isActive: true },
    });

    if (!user || !user.isActive) {
      sendUnauthorized(res, 'Akun tidak ditemukan atau tidak aktif');
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      agency: user.agency || undefined,
    };

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware optional auth — tidak reject jika token tidak ada
 * Dipakai untuk endpoint publik yang sedikit berbeda jika user login
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: { id: true, email: true, role: true, name: true, isActive: true },
      });
      if (user && user.isActive) {
        req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
      }
    } catch {
      // Silently ignore invalid token in optional auth
    }

    next();
  } catch (err) {
    next(err);
  }
};
