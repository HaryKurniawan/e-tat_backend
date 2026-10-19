import { Router } from 'express';
import {
  getRegistrasiList,
  getRegistrasiById,
  submitRegistrasi,
  approveRegistrasi,
  rejectRegistrasi,
  checkStatusRegistrasi,
} from './registrasi.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { guardAdmin } from '../../middleware/role.middleware';

const router = Router();

/**
 * GET /api/registrasi/status/:identifier
 * Publik: Cek status pendaftaran akun berdasarkan email atau nomorRegistrasi atau NRP
 */
router.get('/status/:identifier', checkStatusRegistrasi);

/**
 * @openapi
 * /api/registrasi:
 *   post:
 *     tags:
 *       - Registrasi
 *     summary: Pendaftaran akun penyidik / instansi baru (Publik)
 *     description: Mengajukan pendaftaran akun dinas untuk penyidik polri / BNN / kejaksaan yang memerlukan peninjauan oleh Admin Sekretariat TAT.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistrasiRequest'
 *     responses:
 *       201:
 *         description: Pendaftaran berhasil diajukan dan menunggu verifikasi
 *   get:
 *     tags:
 *       - Registrasi
 *     summary: Ambil daftar seluruh permohonan registrasi akun (Admin Only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar registrasi pengguna berhasil diambil
 */
router.post('/', submitRegistrasi);
router.get('/', authMiddleware, guardAdmin, getRegistrasiList);

/**
 * @openapi
 * /api/registrasi/{id}:
 *   get:
 *     tags:
 *       - Registrasi
 *     summary: Detail permohonan registrasi akun (Admin Only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail registrasi pengguna
 */
router.get('/:id', authMiddleware, guardAdmin, getRegistrasiById);

/**
 * @openapi
 * /api/registrasi/{id}/approve:
 *   patch:
 *     tags:
 *       - Registrasi
 *     summary: Setujui registrasi akun dan buat user aktif (Admin Only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               catatanAdmin:
 *                 type: string
 *                 example: Dokumen dinas valid
 *     responses:
 *       200:
 *         description: Akun berhasil disetujui
 */
router.patch('/:id/approve', authMiddleware, guardAdmin, approveRegistrasi);

/**
 * @openapi
 * /api/registrasi/{id}/reject:
 *   patch:
 *     tags:
 *       - Registrasi
 *     summary: Tolak permohonan registrasi akun (Admin Only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - catatanAdmin
 *             properties:
 *               catatanAdmin:
 *                 type: string
 *                 example: KTA tidak terbaca dengan jelas
 *     responses:
 *       200:
 *         description: Registrasi ditolak
 */
router.patch('/:id/reject', authMiddleware, guardAdmin, rejectRegistrasi);

export default router;
