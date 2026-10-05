import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { sendForbidden, sendUnauthorized } from '../utils/response.util';

/**
 * Guard untuk memastikan role user sesuai.
 * Contoh: guardRole('ADMIN') atau guardRole(['MEDIS', 'HUKUM'])
 */
export const guardRole = (...allowedRoles: (UserRole | UserRole[])[]) => {
  // Flatten nested arrays
  const roles = allowedRoles.flat() as UserRole[];

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, 'Tidak terautentikasi');
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      sendForbidden(res, `Akses ditolak. Role yang diizinkan: ${roles.join(', ')}`);
      return;
    }

    next();
  };
};

/**
 * Guard untuk memastikan user adalah ADMIN
 */
export const guardAdmin = guardRole('ADMIN');

/**
 * Guard untuk memastikan user adalah PENGAJU atau ADMIN
 */
export const guardPengajuOrAdmin = guardRole('PENGAJU', 'ADMIN');

/**
 * Guard untuk memastikan user bukan PENGAJU (internal team only)
 */
export const guardInternalTeam = guardRole('ADMIN', 'MEDIS', 'HUKUM');

/**
 * Guard untuk Tim Asesmen (MEDIS atau HUKUM)
 */
export const guardTimAsesmen = guardRole('MEDIS', 'HUKUM');

/**
 * Guard self or admin — User bisa akses data miliknya sendiri atau admin
 */
export const guardSelfOrAdmin = (userIdParam: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, 'Tidak terautentikasi');
      return;
    }

    const targetId = req.params[userIdParam];
    if (req.user.role === 'ADMIN' || req.user.id === targetId) {
      next();
      return;
    }

    sendForbidden(res, 'Anda hanya bisa mengakses data milik sendiri');
  };
};
