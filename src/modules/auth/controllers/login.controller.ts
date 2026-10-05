import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { verifyPassword } from '../../../utils/hash.util';
import { sendSuccess, sendUnauthorized } from '../../../utils/response.util';
import { loginSchema } from '../auth.schema';
import { generateTokens } from '../auth.helper';
import { logAudit } from '../../../utils/audit.util';

/**
 * POST /api/auth/login
 * Login dengan email & password, mengembalikan access + refresh token
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, password: true, role: true, name: true, isActive: true },
    });

    if (!user) {
      sendUnauthorized(res, 'Email atau password salah');
      return;
    }

    if (!user.isActive) {
      sendUnauthorized(res, 'Akun belum aktif atau telah dinonaktifkan');
      return;
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      sendUnauthorized(res, 'Email atau password salah');
      return;
    }

    const tokens = generateTokens(user);

    await logAudit({
      actorId: user.id,
      actorNama: user.name,
      actorPeran: user.role,
      aksi: 'LOGIN',
      rincian: `Login berhasil dari ${req.ip}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
        ...tokens,
      },
      'Login berhasil'
    );
  } catch (err) {
    next(err);
  }
};
