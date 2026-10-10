import { Router } from 'express';
import { getPrasyaratPemeriksaan, savePrasyaratPemeriksaan } from './prasyarat-pemeriksaan.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { guardRole } from '../../middleware/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Harus terautentikasi
router.use(authMiddleware);

/**
 * @route   GET /api/prasyarat-pemeriksaan/:permohonanId
 * @desc    Ambil data checklist prasyarat pemeriksaan & kedatangan subjek
 * @access  ADMIN, MEDIS, HUKUM, PENGAJU
 */
router.get(
  '/:permohonanId',
  guardRole([UserRole.ADMIN, UserRole.MEDIS, UserRole.HUKUM, UserRole.PENGAJU]),
  getPrasyaratPemeriksaan
);

/**
 * @route   POST /api/prasyarat-pemeriksaan/:permohonanId
 * @desc    Simpan atau perbarui checklist prasyarat pemeriksaan subjek
 * @access  ADMIN, MEDIS
 */
router.post(
  '/:permohonanId',
  guardRole([UserRole.ADMIN, UserRole.MEDIS]),
  savePrasyaratPemeriksaan
);

export default router;
