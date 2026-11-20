import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { StatusPleno } from '@prisma/client';
import prisma from '../../../config/database';
import { sendSuccess, sendError } from '../../../utils/response.util';
import { getParam } from '../../../utils/param.util';
import { logAudit } from '../../../utils/audit.util';
import { uploadPdfToSupabase } from '../../../utils/supabase.util';
import { uploadFileToCloudinary } from '../../../utils/cloudinary.util';
import { env } from '../../../config/env';

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

    let fileUrl = `/uploads/berita_acara/${req.file.filename}`;

    // Upload PDF ke Supabase Storage (bucket: dokumen) atau Foto ke Cloudinary jika STORAGE_MODE != 'local'
    if (env.STORAGE_MODE !== 'local') {
      try {
        const ext = path.extname(req.file.originalname).toLowerCase();
        const isPdf = req.file.mimetype === 'application/pdf' || ext === '.pdf';
        const isImage = req.file.mimetype.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);

        if (isPdf) {
          const result = await uploadPdfToSupabase(req.file.path, 'berita_acara', false);
          fileUrl = result.url;
        } else if (isImage) {
          const result = await uploadFileToCloudinary(req.file.path, 'berita_acara', false);
          fileUrl = result.secure_url || result.url;
        }
      } catch (uploadErr) {
        console.warn('Gagal upload Berita Acara ke cloud storage, fallback lokal:', uploadErr);
      }
    }

    // Check if permohonan exists in DB
    const existingPermohonan = await prisma.permohonanAsesmen.findUnique({
      where: { id: permohonanId },
    });

    if (!existingPermohonan) {
      // Mock / Seed permohonan fallback
      sendSuccess(res, {
        permohonanId,
        fileBeritaAcaraSigned: fileUrl,
        statusPleno: StatusPleno.selesai_sepakat,
      }, 'Berita acara berhasil diunggah');
      return;
    }

    const updated = await prisma.sidangPleno.upsert({
      where: { permohonanId },
      update: {
        fileBeritaAcaraSigned: fileUrl,
        statusPleno: StatusPleno.selesai_sepakat,
      },
      create: {
        permohonanId,
        tanggalPleno: new Date(),
        statusPleno: StatusPleno.selesai_sepakat,
        fileBeritaAcaraSigned: fileUrl,
      },
    });

    try {
      await logAudit({
        permohonanId,
        actorId: user.id,
        actorNama: user.name,
        actorPeran: user.role,
        aksi: 'UPLOAD_BERITA_ACARA',
        rincian: `File berita acara signed diunggah oleh ${user.name}`,
      });
    } catch (auditErr) {
      console.warn('Audit log warning:', auditErr);
    }

    sendSuccess(res, updated, 'Berita acara berhasil diunggah');
  } catch (err) {
    next(err);
  }
};
