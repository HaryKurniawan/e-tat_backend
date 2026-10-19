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
  cekNikPermohonan,
} from './permohonan.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { guardAdmin, guardPengajuOrAdmin } from '../../middleware/role.middleware';

const router = Router();

/**
 * @openapi
 * /api/permohonan/lacak/{trackingNumber}:
 *   get:
 *     tags:
 *       - Permohonan
 *     summary: Pelacakan status permohonan publik (Tanpa Login)
 *     description: Digunakan oleh masyarakat / penyidik untuk memeriksa status berkas secara realtime menggunakan nomor tracking.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: trackingNumber
 *         required: true
 *         schema:
 *           type: string
 *           example: TRACK-202610-001
 *     responses:
 *       200:
 *         description: Informasi status pelacakan berkas
 *       404:
 *         description: Berkas tidak ditemukan
 */
router.get('/lacak/:trackingNumber', lacakPermohonan);

// Private Routes
router.use(authMiddleware);

/**
 * GET /api/permohonan/cek-nik/:nik
 * Pengecekan riwayat rekam jejak NIK di seluruh database e-TAT
 */
router.get('/cek-nik/:nik', cekNikPermohonan);

/**
 * @openapi
 * /api/permohonan:
 *   get:
 *     tags:
 *       - Permohonan
 *     summary: Ambil daftar seluruh permohonan asesmen (Sesuai Role Pengguna)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Daftar permohonan berhasil diambil
 *   post:
 *     tags:
 *       - Permohonan
 *     summary: Buat draf permohonan asesmen baru (Pengaju / Admin)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - terperiksa
 *               - perkara
 *             properties:
 *               satuanKerjaTujuan:
 *                 type: string
 *                 example: BNNP DKI Jakarta
 *               terperiksa:
 *                 type: object
 *               perkara:
 *                 type: object
 *     responses:
 *       201:
 *         description: Draf permohonan berhasil dibuat
 */
router.get('/', getPermohonanList);
router.post('/', guardPengajuOrAdmin, createPermohonan);

/**
 * @openapi
 * /api/permohonan/{id}:
 *   get:
 *     tags:
 *       - Permohonan
 *     summary: Ambil detail lengkap permohonan asesmen
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
 *         description: Data detail permohonan, terperiksa, perkara, dokumen, tim asesmen, dan rekomendasi
 *       404:
 *         description: Permohonan tidak ditemukan
 */
router.get('/:id', getPermohonanById);

/**
 * @openapi
 * /api/permohonan/{id}/submit:
 *   post:
 *     tags:
 *       - Permohonan
 *     summary: Kirim berkas permohonan ke Sekretariat TAT (Pengaju)
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
 *         description: Permohonan berhasil dikirim ke Admin
 */
router.post('/:id/submit', guardPengajuOrAdmin, submitPermohonan);

/**
 * @openapi
 * /api/permohonan/{id}/verifikasi:
 *   post:
 *     tags:
 *       - Permohonan
 *     summary: Verifikasi kelengkapan dokumen administrasi (Admin Only)
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
 *         description: Status telaah berkas diperbarui
 */
router.post('/:id/verifikasi', guardAdmin, verifikasiPermohonan);

/**
 * @openapi
 * /api/permohonan/{id}/minta-perbaikan:
 *   post:
 *     tags:
 *       - Permohonan
 *     summary: Kembalikan berkas ke penyidik untuk perbaikan (Admin Only)
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
 *               - catatanKoreksi
 *             properties:
 *               catatanKoreksi:
 *                 type: string
 *                 example: Mohon lampirkan fotokopi KTP terperiksa yang jelas
 *     responses:
 *       200:
 *         description: Permintaan perbaikan berkas dikirim
 */
router.post('/:id/minta-perbaikan', guardAdmin, mintaPerbaikan);

/**
 * @openapi
 * /api/permohonan/{id}/disposisi:
 *   post:
 *     tags:
 *       - Permohonan
 *     summary: Catat disposisi persetujuan dari Ketua Tim TAT (Admin Only)
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
 *             properties:
 *               disposisiHasil:
 *                 type: string
 *                 example: Disetujui untuk asesmen terpadu
 *               disposisiKetua:
 *                 type: string
 *                 example: Kombes Pol Dr. Hendra
 *     responses:
 *       200:
 *         description: Disposisi berhasil dicatat
 */
router.post('/:id/disposisi', guardAdmin, catatDisposisi);

/**
 * @openapi
 * /api/permohonan/{id}/tugaskan:
 *   post:
 *     tags:
 *       - Permohonan
 *     summary: Penugasan Asesor Medis, Asesor Hukum, dan Jadwal Pemeriksaan (Admin Only)
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
 *             properties:
 *               asesorMedisId:
 *                 type: string
 *               asesorHukumId:
 *                 type: string
 *               jadwalPemeriksaanMedis:
 *                 type: string
 *                 format: date-time
 *               jadwalPemeriksaanHukum:
 *                 type: string
 *                 format: date-time
 *               lokasiPemeriksaan:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tim Asesor berhasil ditugaskan
 */
router.post('/:id/tugaskan', guardAdmin, tugaskanTimAsesmen);

export default router;
