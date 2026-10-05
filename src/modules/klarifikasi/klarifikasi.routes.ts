import { Router } from 'express';
import {
  getKlarifikasiList,
  createKlarifikasi,
  jawabKlarifikasi,
} from './klarifikasi.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

/**
 * @route   GET /api/klarifikasi/:permohonanId
 * @desc    Mengambil daftar klarifikasi untuk suatu permohonan
 * @access  Semua role terautentikasi
 */
router.get('/:permohonanId', getKlarifikasiList);

/**
 * @route   POST /api/klarifikasi/:permohonanId
 * @desc    Mengajukan pertanyaan klarifikasi
 * @access  Semua role terautentikasi
 */
router.post('/:permohonanId', createKlarifikasi);

/**
 * @route   PUT /api/klarifikasi/:id/jawab
 * @desc    Menjawab tiket klarifikasi
 * @access  Semua role terautentikasi
 */
router.put('/:id/jawab', jawabKlarifikasi);

export default router;
