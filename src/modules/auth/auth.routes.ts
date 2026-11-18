import { Router } from 'express';
import { login, googleLogin, refresh, logout, getMe, createUser, getAllUsers } from './auth.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { guardAdmin } from '../../middleware/role.middleware';

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
router.post('/google', googleLogin);

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

/**
 * @openapi
 * /api/auth/users:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Ambil daftar seluruh pengguna aktif
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar pengguna berhasil dimuat
 *   post:
 *     tags:
 *       - Auth
 *     summary: Buat akun pengguna baru (Admin Only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [PENGAJU, ADMIN, MEDIS, HUKUM]
 *               nip:
 *                 type: string
 *               agency:
 *                 type: string
 *               position:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pengguna baru berhasil dibuat
 */
router.get('/users', authMiddleware, getAllUsers);
router.post('/users', authMiddleware, guardAdmin, createUser);

export default router;
