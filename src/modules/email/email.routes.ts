import { Router } from 'express';
import { handleSendEmail } from './email.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// POST /api/email/send - guarded with JWT authentication
router.post('/send', authMiddleware, handleSendEmail);

export default router;
