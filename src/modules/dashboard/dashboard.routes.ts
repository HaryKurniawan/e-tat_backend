import { Router } from 'express';
import { getDashboardSummary, getAnalytics } from './dashboard.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/dashboard/summary:
 *   get:
 *     tags:
 *       - Dashboard & Analytics
 *     summary: Ambil ringkasan statistik KPI & SLA dashboard sesuai role
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Data ringkasan dashboard berhasil dimuat
 */
router.get('/summary', getDashboardSummary);

/**
 * @openapi
 * /api/dashboard/analytics:
 *   get:
 *     tags:
 *       - Dashboard & Analytics
 *     summary: Ambil data analitik tren kasus dan efisiensi waktu SLA
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Data analitik berhasil dimuat
 */
router.get('/analytics', getAnalytics);

export default router;
