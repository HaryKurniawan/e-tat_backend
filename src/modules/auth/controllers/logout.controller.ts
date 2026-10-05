import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../utils/response.util';
import { revokedTokens } from '../auth.helper';
import { logAudit } from '../../../utils/audit.util';

/**
 * POST /api/auth/logout
 * Revoke refresh token
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      revokedTokens.add(refreshToken);
    }

    if (req.user) {
      await logAudit({
        actorId: req.user.id,
        actorNama: req.user.name,
        actorPeran: req.user.role,
        aksi: 'LOGOUT',
        rincian: 'Logout berhasil',
        ipAddress: req.ip,
      });
    }

    sendSuccess(res, null, 'Logout berhasil');
  } catch (err) {
    next(err);
  }
};
