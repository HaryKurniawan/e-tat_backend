import { Router } from 'express';
import {
  getTindakLanjutByPermohonan,
  saveTindakLanjut,
  updatePelaksanaan,
  addLaporanKontrol,
} from './tindak-lanjut.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { guardRole } from '../../middleware/role.middleware';
import { UserRole } from '@prisma/client';
import { upload } from '../../utils/upload.util';

const router = Router();

router.use(authMiddleware);

/**
 * @route   GET /api/tindak-lanjut/:permohonanId
 * @desc    Mengambil data tindak lanjut dan monitoring permohonan
 * @access  Semua role terautentikasi
 */
router.get('/:permohonanId', getTindakLanjutByPermohonan);

/**
 * @route   POST /api/tindak-lanjut/:permohonanId
 * @desc    Menyimpan atau memperbarui data rujukan & status tindak lanjut
 * @access  ADMIN, PENGAJU
 */
router.post(
  '/:permohonanId',
  guardRole([UserRole.ADMIN, UserRole.PENGAJU]),
  saveTindakLanjut
);

/**
 * @route   POST /api/tindak-lanjut/:permohonanId/pelaksanaan
 * @desc    Memperbarui koordinasi & serah terima fasilitas
 * @access  ADMIN, PENGAJU
 */
router.post(
  '/:permohonanId/pelaksanaan',
  guardRole([UserRole.ADMIN, UserRole.PENGAJU]),
  updatePelaksanaan
);

/**
 * @route   POST /api/tindak-lanjut/:permohonanId/laporan-kontrol
 * @desc    Menambahkan laporan kemajuan / kunjungan berkala
 * @access  ADMIN, PENGAJU
 */
router.post(
  '/:permohonanId/laporan-kontrol',
  guardRole([UserRole.ADMIN, UserRole.PENGAJU]),
  upload.single('fileBukti'),
  addLaporanKontrol
);

export default router;
