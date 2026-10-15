import { Router } from 'express';
import {
  getRekomendasiByPermohonan,
  verifikasiPublikQr,
  createDraftRekomendasi,
  prosesTandaTangan,
  konfirmasiTandaTerima,
  generateRekomendasiPdf,
} from './rekomendasi.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { guardRole } from '../../middleware/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * @openapi
 * /api/rekomendasi/verifikasi/{qrCode}:
 *   get:
 *     tags:
 *       - Rekomendasi & Tanda Tangan QR
 *     summary: Verifikasi keabsahan dokumen rekomendasi via scan QR (Publik)
 *     description: Memvalidasi kode QR untuk memastikan surat rekomendasi dikeluarkan secara sah oleh Tim Asesmen Terpadu POLRI/BNN.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: qrCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dokumen valid dan terverifikasi
 *       404:
 *         description: Dokumen tidak valid atau tidak ditemukan
 */
router.get('/verifikasi/:qrCode', verifikasiPublikQr);

// Rute lainnya membutuhkan autentikasi
router.use(authMiddleware);

/**
 * @openapi
 * /api/rekomendasi/{permohonanId}:
 *   get:
 *     tags:
 *       - Rekomendasi & Tanda Tangan QR
 *     summary: Ambil detail dokumen rekomendasi resmi
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permohonanId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail surat rekomendasi dan status tanda tangan seluruh pengesah
 */
router.get('/:permohonanId', getRekomendasiByPermohonan);

/**
 * @openapi
 * /api/rekomendasi/{permohonanId}/pdf:
 *   get:
 *     tags:
 *       - Rekomendasi & Tanda Tangan QR
 *     summary: Download / Preview dokumen rekomendasi resmi dalam format PDF berlogo POLRI
 *     security:
 *       - BearerAuth: []
 */
router.get('/:permohonanId/pdf', generateRekomendasiPdf);

/**
 * @openapi
 * /api/rekomendasi/{permohonanId}/draft:
 *   post:
 *     tags:
 *       - Rekomendasi & Tanda Tangan QR
 *     summary: Buat draf surat rekomendasi resmi (Admin Only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permohonanId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomorSurat:
 *                 type: string
 *               ringkasanMedis:
 *                 type: string
 *               ringkasanHukum:
 *                 type: string
 *               rekomendasiFinalText:
 *                 type: string
 *     responses:
 *       201:
 *         description: Draf rekomendasi berhasil dibuat
 */
router.post(
  '/:permohonanId/draft',
  guardRole([UserRole.ADMIN]),
  createDraftRekomendasi
);

/**
 * @openapi
 * /api/rekomendasi/{permohonanId}/tanda-tangan:
 *   post:
 *     tags:
 *       - Rekomendasi & Tanda Tangan QR
 *     summary: Proses tanda tangan digital / persetujuan rekomendasi (Admin, Medis, Hukum)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permohonanId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               catatanKoreksi:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tanda tangan digital berhasil dicatat
 */
router.post(
  '/:permohonanId/tanda-tangan',
  guardRole([UserRole.ADMIN, UserRole.MEDIS, UserRole.HUKUM, UserRole.PENGAJU]),
  prosesTandaTangan
);

/**
 * @openapi
 * /api/rekomendasi/{permohonanId}/tanda-terima:
 *   post:
 *     tags:
 *       - Rekomendasi & Tanda Tangan QR
 *     summary: Konfirmasi penerimaan surat rekomendasi oleh penyidik/pengaju
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permohonanId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               diterimaOleh:
 *                 type: string
 *               nomorTandaTerima:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tanda terima berhasil dicatat
 */
router.post(
  '/:permohonanId/tanda-terima',
  guardRole([UserRole.PENGAJU, UserRole.ADMIN]),
  konfirmasiTandaTerima
);

export default router;
