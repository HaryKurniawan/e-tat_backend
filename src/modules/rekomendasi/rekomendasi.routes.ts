import { Router } from 'express';
import {
  getRekomendasiByPermohonan,
  verifikasiPublikQr,
  createDraftRekomendasi,
  prosesTandaTangan,
  konfirmasiTandaTerima,
} from './rekomendasi.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { guardRole } from '../../middleware/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * @route   GET /api/rekomendasi/verifikasi/:qrCode
 * @desc    Verifikasi publik keabsahan dokumen rekomendasi lewat scan QR Code
 * @access  Public
 */
router.get('/verifikasi/:qrCode', verifikasiPublikQr);

// Rute lainnya membutuhkan autentikasi
router.use(authMiddleware);

/**
 * @route   GET /api/rekomendasi/:permohonanId
 * @desc    Mengambil detail dokumen rekomendasi
 * @access  Semua role terautentikasi
 */
router.get('/:permohonanId', getRekomendasiByPermohonan);

/**
 * @route   POST /api/rekomendasi/:permohonanId/draft
 * @desc    Membuat draf surat rekomendasi resmi
 * @access  ADMIN
 */
router.post(
  '/:permohonanId/draft',
  guardRole([UserRole.ADMIN]),
  createDraftRekomendasi
);

/**
 * @route   POST /api/rekomendasi/:permohonanId/tanda-tangan
 * @desc    Menyetujui / tanda tangan digital rekomendasi
 * @access  ADMIN, MEDIS, HUKUM
 */
router.post(
  '/:permohonanId/tanda-tangan',
  guardRole([UserRole.ADMIN, UserRole.MEDIS, UserRole.HUKUM]),
  prosesTandaTangan
);

/**
 * @route   POST /api/rekomendasi/:permohonanId/tanda-terima
 * @desc    Konfirmasi tanda terima oleh pengaju
 * @access  PENGAJU, ADMIN
 */
router.post(
  '/:permohonanId/tanda-terima',
  guardRole([UserRole.PENGAJU, UserRole.ADMIN]),
  konfirmasiTandaTerima
);

export default router;
