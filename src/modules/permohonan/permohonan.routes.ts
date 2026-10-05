import { Router } from 'express';
import {
  getPermohonanList,
  getPermohonanById,
  createPermohonan,
  submitPermohonan,
  verifikasiPermohonan,
  mintaPerbaikan,
  catatDisposisi,
  tugaskanTimAsesmen,
  lacakPermohonan,
} from './permohonan.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { guardAdmin, guardPengajuOrAdmin } from '../../middleware/role.middleware';

const router = Router();

// Publik
router.get('/lacak/:trackingNumber', lacakPermohonan);

// Private
router.use(authMiddleware);

router.get('/', getPermohonanList);
router.get('/:id', getPermohonanById);
router.post('/', guardPengajuOrAdmin, createPermohonan);
router.post('/:id/submit', guardPengajuOrAdmin, submitPermohonan);

// Admin only
router.post('/:id/verifikasi', guardAdmin, verifikasiPermohonan);
router.post('/:id/minta-perbaikan', guardAdmin, mintaPerbaikan);
router.post('/:id/disposisi', guardAdmin, catatDisposisi);
router.post('/:id/tugaskan', guardAdmin, tugaskanTimAsesmen);

export default router;
