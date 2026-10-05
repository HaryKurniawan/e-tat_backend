import { Router } from 'express';
import {
  getRegistrasiList,
  getRegistrasiById,
  submitRegistrasi,
  approveRegistrasi,
  rejectRegistrasi,
} from './registrasi.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { guardAdmin } from '../../middleware/role.middleware';

const router = Router();

// Publik: submit pendaftaran
router.post('/', submitRegistrasi);

// Admin only
router.get('/', authMiddleware, guardAdmin, getRegistrasiList);
router.get('/:id', authMiddleware, guardAdmin, getRegistrasiById);
router.patch('/:id/approve', authMiddleware, guardAdmin, approveRegistrasi);
router.patch('/:id/reject', authMiddleware, guardAdmin, rejectRegistrasi);

export default router;
