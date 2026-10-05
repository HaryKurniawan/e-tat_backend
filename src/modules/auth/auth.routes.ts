import { Router } from 'express';
import { login, refresh, logout, getMe } from './auth.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login pengguna (Semua Role)
 *     description: Mengautentikasi pengguna menggunakan email dan password, mengembalikan JWT access token dan refresh token.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Validasi input gagal
 *       401:
 *         description: Kredensial tidak valid
 */
router.post('/login', login);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh JWT Access Token
 *     description: Mendapatkan access token baru menggunakan refresh token yang masih aktif.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token berhasil diperbarui
 *       401:
 *         description: Refresh token tidak valid atau kedaluwarsa
 */
router.post('/refresh', refresh);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout pengguna
 *     description: Mengakhiri sesi pengguna yang sedang aktif.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout berhasil
 */
router.post('/logout', authMiddleware, logout);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Ambil profil pengguna yang sedang login
 *     description: Mengembalikan data lengkap pengguna dari token otentikasi saat ini.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profil berhasil dimuat
 *       401:
 *         description: Tidak terotentikasi
 */
router.get('/me', authMiddleware, getMe);

export default router;
