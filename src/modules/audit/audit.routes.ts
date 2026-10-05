import { Router } from 'express';
import { getAuditLogs } from './audit.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { guardRole } from '../../middleware/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

/**
 * @route   GET /api/audit
 * @desc    Mengambil log audit trail
 * @access  ADMIN
 */
router.get('/', guardRole([UserRole.ADMIN]), getAuditLogs);

export default router;
