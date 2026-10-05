import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../../config/database';
import { env } from '../../../config/env';
import { sendSuccess, sendUnauthorized } from '../../../utils/response.util';
import { refreshSchema } from '../auth.schema';
import { generateTokens, revokedTokens } from '../auth.helper';

/**
 * POST /api/auth/refresh
 * Generate access token baru menggunakan refresh token yang valid
 */
export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);

    if (revokedTokens.has(refreshToken)) {
      sendUnauthorized(res, 'Refresh token sudah tidak berlaku');
      return;
    }

    let payload: { id: string };
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string };
    } catch {
      sendUnauthorized(res, 'Refresh token tidak valid');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, name: true, isActive: true },
    });

    if (!user || !user.isActive) {
      sendUnauthorized(res, 'Akun tidak ditemukan');
      return;
    }

    const tokens = generateTokens(user);
    // Revoke refresh token lama
    revokedTokens.add(refreshToken);

    sendSuccess(res, tokens, 'Token berhasil diperbarui');
  } catch (err) {
    next(err);
  }
};
