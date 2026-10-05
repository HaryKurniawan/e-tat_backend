import { Router } from 'express';
import { getDashboardSummary, getAnalytics } from './dashboard.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

/**
 * @route   GET /api/dashboard/summary
 * @desc    Mengambil metrik ringkasan dashboard sesuai role yang sedang login
 * @access  Semua role terautentikasi
 */
router.get('/summary', getDashboardSummary);

/**
 * @route   GET /api/dashboard/analytics
 * @desc    Mengambil data grafik dan agregasi sistem
 * @access  Semua role terautentikasi
 */
router.get('/analytics', getAnalytics);

export default router;
