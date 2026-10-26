import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendNotFound, sendForbidden, sendError } from '../../utils/response.util';
import { getParam } from '../../utils/param.util';
import { logAudit } from '../../utils/audit.util';
import {
  loadPermohonan,
  isSuratJawabanAvailable,
  ensureSuratJawabanMeta,
  buildSuratJawabanPdf,
  suratJawabanFilename,
  kirimSuratJawabanKePengaju,
} from './surat-jawaban.service';

/**
 * GET /api/permohonan/:id/surat-jawaban/pdf
 * Admin: semua berkas. Pengaju: hanya berkas miliknya. Role lain: ditolak.
 */
export const getSuratJawabanPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req, 'id');
    const user = req.user!;

    const permohonan = await loadPermohonan(id);
    if (!permohonan) {
      sendNotFound(res, 'Permohonan tidak ditemukan');
      return;
    }

    const isAdmin = user.role === 'ADMIN';
    const isOwner = user.role === 'PENGAJU' && permohonan.pengajuId === user.id;
    if (!isAdmin && !isOwner) {
      sendForbidden(res, 'Surat jawaban hanya dapat dilihat oleh Admin dan Pengaju berkas');
      return;
    }

    if (!isSuratJawabanAvailable(permohonan)) {
      sendError(res, 'Surat jawaban tersedia setelah berkas diverifikasi dan tim asesmen ditugaskan', 409);
      return;
    }

    const meta = await ensureSuratJawabanMeta(permohonan);
    const pdf = await buildSuratJawabanPdf(permohonan, meta);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${suratJawabanFilename(meta.nomor)}"`);
    res.setHeader('X-Surat-Nomor', encodeURIComponent(meta.nomor));
    res.setHeader('Access-Control-Expose-Headers', 'X-Surat-Nomor, Content-Disposition');
    res.send(pdf);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/permohonan/:id/surat-jawaban/kirim
 * Admin: kirim ulang surat jawaban (PDF) ke email pengaju.
 */
export const kirimUlangSuratJawaban = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = getParam(req, 'id');
    const user = req.user!;

    const result = await kirimSuratJawabanKePengaju(id, { force: true });
    if (!result.sent) {
      sendError(res, result.reason || 'Gagal mengirim surat jawaban', 422);
      return;
    }

    await logAudit({
      actorId: user.id,
      actorNama: user.name,
      actorPeran: user.role,
      permohonanId: id,
      aksi: 'KIRIM_ULANG_SURAT_JAWABAN',
      rincian: `Surat jawaban dikirim ulang ke ${result.email}`,
    });

    sendSuccess(res, { email: result.email }, `Surat jawaban berhasil dikirim ke ${result.email}`);
  } catch (err) {
    next(err);
  }
};
