import { Router } from 'express';
import {
  getAsesmenMedisByPermohonan,
  saveDraftMedis,
  finalisasiMedis,
  amandemenMedis,
  saveKriteriaPlasemen,
} from './asesmen-medis.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { guardRole } from '../../middleware/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Semua rute asesmen medis membutuhkan autentikasi
router.use(authMiddleware);

/**
 * @route   GET /api/asesmen-medis/:permohonanId
 * @desc    Mendapatkan hasil asesmen medis permohonan
 * @access  ADMIN, MEDIS, HUKUM
 */
router.get(
  '/:permohonanId',
  guardRole([UserRole.ADMIN, UserRole.MEDIS, UserRole.HUKUM]),
  getAsesmenMedisByPermohonan
);

/**
 * @route   POST /api/asesmen-medis/:permohonanId/draft
 * @desc    Menyimpan draf pemeriksaan fisik & medis
 * @access  MEDIS, ADMIN
 */
router.post(
  '/:permohonanId/draft',
  guardRole([UserRole.MEDIS, UserRole.ADMIN]),
  saveDraftMedis
);

/**
 * @route   POST /api/asesmen-medis/:permohonanId/finalisasi
 * @desc    Memfinalisasi berkas asesmen medis
 * @access  MEDIS, ADMIN
 */
router.post(
  '/:permohonanId/finalisasi',
  guardRole([UserRole.MEDIS, UserRole.ADMIN]),
  finalisasiMedis
);

/**
 * @route   POST /api/asesmen-medis/:permohonanId/amandemen
 * @desc    Membuka status asesmen medis untuk amandemen
 * @access  MEDIS, ADMIN
 */
router.post(
  '/:permohonanId/amandemen',
  guardRole([UserRole.MEDIS, UserRole.ADMIN]),
  amandemenMedis
);

/**
 * @route   POST /api/asesmen-medis/:permohonanId/kriteria-penempatan
 * @desc    Menyimpan data ASAM 6 Dimensi
 * @access  MEDIS, ADMIN
 */
router.post(
  '/:permohonanId/kriteria-penempatan',
  guardRole([UserRole.MEDIS, UserRole.ADMIN]),
  saveKriteriaPlasemen
);

export default router;
