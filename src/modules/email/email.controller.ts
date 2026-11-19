import { Request, Response, NextFunction } from 'express';
import { sendEmail } from '../../services/email/core/client';
import { sendSuccess, sendError } from '../../utils/response.util';

/**
 * POST /api/email/send
 * Kirim email resmi via Resend di backend (aman dari CORS dan menjaga kerahasiaan API key)
 */
export const handleSendEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { to, subject, html, text, attachments } = req.body;

    if (!to || !subject || !html) {
      sendError(res, 'Field "to", "subject", dan "html" wajib disertakan.', 400);
      return;
    }

    const result = await sendEmail({
      to,
      subject,
      html,
      text,
      attachments,
    });

    if (result.success) {
      sendSuccess(res, result.data || { id: `email-${Date.now()}` }, 'Email berhasil dikirim');
    } else {
      sendError(res, result.error || 'Gagal mengirim email via layanan email server', 500);
    }
  } catch (err) {
    next(err);
  }
};
