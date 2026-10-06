import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { hashPassword } from '../../../utils/hash.util';
import { sendCreated, sendError, sendSuccess } from '../../../utils/response.util';
import { createUserSchema } from '../auth.schema';
import { logAudit } from '../../../utils/audit.util';

/**
 * POST /api/auth/users
 * Admin / Sekretariat membuat akun baru langsung (Semua Role)
 */
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = createUserSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      sendError(res, 'Email sudah terdaftar dalam sistem', 400);
      return;
    }

    const hashedPassword = await hashPassword(input.password);

    const newUser = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        password: hashedPassword,
        name: input.name,
        role: input.role,
        nip: input.nip,
        agency: input.agency,
        position: input.position,
        phone: input.phone,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        nip: true,
        agency: true,
        position: true,
        phone: true,
        createdAt: true,
      },
    });

    await logAudit({
      actorId: req.user?.id || 'system',
      actorNama: req.user?.name || 'Administrator',
      actorPeran: req.user?.role || 'ADMIN',
      aksi: 'CREATE_USER',
      rincian: `Membuat akun petugas baru: ${newUser.name} (${newUser.role} - ${newUser.email})`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    sendCreated(res, newUser, 'Akun pengguna berhasil dibuat');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/users
 * Mengambil daftar seluruh pengguna aktif sistem
 */
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const roleQuery = req.query.role as any;
    const where: any = { isActive: true };
    if (roleQuery) {
      where.role = roleQuery;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        nip: true,
        agency: true,
        position: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, users, 'Daftar pengguna berhasil dimuat');
  } catch (err) {
    next(err);
  }
};
