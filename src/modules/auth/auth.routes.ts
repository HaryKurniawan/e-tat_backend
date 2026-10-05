import { Router } from 'express';
import { login, refresh, logout, getMe } from './auth.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @route  POST /api/auth/login
 * @access Public
 */
router.post('/login', login);

/**
 * @route  POST /api/auth/refresh
 * @access Public (requires valid refresh token)
 */
router.post('/refresh', refresh);

/**
 * @route  POST /api/auth/logout
 * @access Private
 */
router.post('/logout', authMiddleware, logout);

/**
 * @route  GET /api/auth/me
 * @access Private
 */
router.get('/me', authMiddleware, getMe);

export default router;
