import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess, sendError, sendUnauthorized } from '../../../utils/response.util';

/**
 * GET /api/auth/me
 * Mendapatkan profil user yang sedang login
 */
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendUnauthorized(res);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        nip: true,
        agency: true,
        position: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      sendError(res, 'User tidak ditemukan', 404);
      return;
    }

    sendSuccess(res, user, 'Data profil berhasil diambil');
  } catch (err) {
    next(err);
  }
};
