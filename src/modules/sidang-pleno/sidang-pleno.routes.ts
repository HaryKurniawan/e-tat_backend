import { Router } from 'express';
import {
  getSidangPlenoByPermohonan,
  jadwalkanPleno,
  simpanHasilPleno,
  uploadBeritaAcaraSigned,
} from './sidang-pleno.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { guardRole } from '../../middleware/role.middleware';
import { UserRole } from '@prisma/client';
import { upload } from '../../utils/upload.util';

const router = Router();

router.use(authMiddleware);

/**
 * @route   GET /api/sidang-pleno/:permohonanId
 * @desc    Mengambil data sidang pleno permohonan
 * @access  ADMIN, MEDIS, HUKUM, PENGAJU
 */
router.get('/:permohonanId', getSidangPlenoByPermohonan);

/**
 * @route   POST /api/sidang-pleno/:permohonanId/jadwal
 * @desc    Menjadwalkan sidang pleno
 * @access  ADMIN
 */
router.post(
  '/:permohonanId/jadwal',
  guardRole([UserRole.ADMIN]),
  jadwalkanPleno
);

/**
 * @route   POST /api/sidang-pleno/:permohonanId/hasil
 * @desc    Mencatat notula dan hasil pleno
 * @access  ADMIN
 */
router.post(
  '/:permohonanId/hasil',
  guardRole([UserRole.ADMIN, UserRole.HUKUM, UserRole.MEDIS]),
  simpanHasilPleno
);

/**
 * @route   POST /api/sidang-pleno/:permohonanId/upload-ba
 * @desc    Mengunggah Berita Acara yang telah ditandatangani
 * @access  ADMIN, HUKUM, MEDIS
 */
router.post(
  '/:permohonanId/upload-ba',
  guardRole([UserRole.ADMIN, UserRole.HUKUM, UserRole.MEDIS]),
  upload.single('fileBeritaAcara'),
  uploadBeritaAcaraSigned
);

export default router;
