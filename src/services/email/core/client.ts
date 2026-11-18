import { env } from '../../../config/env';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: { filename: string; content: string }[]; // content = base64
}

/**
 * Mengirim email menggunakan Resend REST API
 */
export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  attachments,
}: SendEmailOptions): Promise<{ success: boolean; data?: any; error?: string }> => {
  const apiKey = env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ [Email Service] RESEND_API_KEY tidak dikonfigurasi. Pengiriman email dibatalkan.');
    return { success: false, error: 'RESEND_API_KEY is not configured' };
  }

  const recipients = Array.isArray(to) ? to : [to];
  const fromAddress =
    env.EMAIL_FROM && env.EMAIL_FROM.includes('@')
      ? env.EMAIL_FROM
      : 'E-TAT POLRI <onboarding@resend.dev>';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: recipients,
        subject,
        html,
        text,
        ...(attachments && attachments.length > 0 ? { attachments } : {}),
      }),
    });

    const data = (await res.json()) as any;

    if (!res.ok) {
      console.error('❌ [Email Service] Gagal mengirim email via Resend:', data);
      return { success: false, error: data?.message || 'Resend API error', data };
    }

    console.log(`✅ [Email Service] Email berhasil dikirim ke: ${recipients.join(', ')} (ID: ${data.id})`);
    return { success: true, data };
  } catch (err: any) {
    console.error('❌ [Email Service] Error saat memanggil Resend API:', err.message);
    return { success: false, error: err.message };
  }
};
