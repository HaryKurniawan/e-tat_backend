import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import { sendSuccess, sendError } from '../../../utils/response.util';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';

/**
 * Upload Berita Acara yang telah ditandatangani
 */
export const uploadBeritaAcaraSigned = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permohonanId = getParam(req, 'permohonanId');
    const user = req.user!;

    if (!req.file) {
      sendError(res, 'File Berita Acara wajib diunggah', 400);
      return;
    }

    const fileUrl = `/uploads/berita_acara/${req.file.filename}`;

    const updated = await prisma.sidangPleno.update({
      where: { permohonanId },
      data: {
        fileBeritaAcaraSigned: fileUrl,
      },
    });

    await logAudit({
      permohonanId,
      actorId: user.id,
      actorNama: user.name,
      actorPeran: user.role,
      aksi: 'UPLOAD_BERITA_ACARA',
      rincian: `File berita acara signed diunggah oleh ${user.name}`,
    });

    sendSuccess(res, updated, 'Berita acara berhasil diunggah');
  } catch (err) {
    next(err);
  }
};
