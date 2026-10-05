import { Router } from 'express';
import { getAuditLogs } from './audit.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { guardRole } from '../../middleware/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/audit:
 *   get:
 *     tags:
 *       - Audit Trail
 *     summary: Ambil catatan riwayat jejak audit sistem (Admin Only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: permohonanId
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Log audit trail berhasil diambil
 */
router.get('/', guardRole([UserRole.ADMIN]), getAuditLogs);

export default router;
