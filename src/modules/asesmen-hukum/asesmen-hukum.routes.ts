import { Router } from 'express';
import {
  getAsesmenHukumByPermohonan,
  saveDraftHukum,
  finalisasiHukum,
  amandemenHukum,
} from './asesmen-hukum.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { guardRole } from '../../middleware/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

/**
 * @route   GET /api/asesmen-hukum/:permohonanId
 * @desc    Mengambil telaah hukum permohonan
 * @access  ADMIN, MEDIS, HUKUM
 */
router.get(
  '/:permohonanId',
  guardRole([UserRole.ADMIN, UserRole.MEDIS, UserRole.HUKUM]),
  getAsesmenHukumByPermohonan
);

/**
 * @route   POST /api/asesmen-hukum/:permohonanId/draft
 * @desc    Menyimpan draf telaah hukum
 * @access  HUKUM, ADMIN
 */
router.post(
  '/:permohonanId/draft',
  guardRole([UserRole.HUKUM, UserRole.ADMIN]),
  saveDraftHukum
);

/**
 * @route   POST /api/asesmen-hukum/:permohonanId/finalisasi
 * @desc    Memfinalisasi berkas telaah hukum
 * @access  HUKUM, ADMIN
 */
router.post(
  '/:permohonanId/finalisasi',
  guardRole([UserRole.HUKUM, UserRole.ADMIN]),
  finalisasiHukum
);

/**
 * @route   POST /api/asesmen-hukum/:permohonanId/amandemen
 * @desc    Membuka status telaah hukum untuk amandemen
 * @access  HUKUM, ADMIN
 */
router.post(
  '/:permohonanId/amandemen',
  guardRole([UserRole.HUKUM, UserRole.ADMIN]),
  amandemenHukum
);

export default router;
