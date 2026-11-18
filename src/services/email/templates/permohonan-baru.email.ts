import { env } from '../../../config/env';
import { sendEmail } from '../core/client';

export interface NotifikasiPermohonanBaruDetails {
  adminEmail: string;
  nomorPermohonan: string;
  trackingNumber?: string | null;
  namaPemohon: string;
  instansiPemohon: string;
  terperiksaNama: string;
  nomorLp: string;
}

/**
 * Mengirim notifikasi ke Sekretariat / Admin saat Pengaju men-submit permohonan baru (Format Resmi)
 */
export const sendNotifikasiPermohonanBaruEmail = async (
  params: NotifikasiPermohonanBaruDetails
): Promise<void> => {
  const { adminEmail, nomorPermohonan, trackingNumber, namaPemohon, instansiPemohon, terperiksaNama, nomorLp } = params;
  const dashboardUrl = `${env.FRONTEND_URL}/dashboard`;

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pemberitahuan Permohonan Asesmen TAT Baru</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; line-height: 1.5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 650px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; overflow: hidden;">
          
          <!-- Header Resmi Dinas -->
          <tr>
            <td style="padding: 24px 30px 18px 30px; text-align: center; border-bottom: 2px solid #0f172a;">
              <div style="font-size: 12px; font-weight: 600; letter-spacing: 1.5px; color: #0f172a; text-transform: uppercase;">
                KEPOLISIAN NEGARA REPUBLIK INDONESIA
              </div>
              <div style="font-size: 11px; font-weight: 500; letter-spacing: 1px; color: #475569; text-transform: uppercase; margin-top: 2px;">
                TIM ASESMEN TERPADU (TAT)
              </div>
              <div style="font-size: 16px; font-weight: 600; color: #0f172a; margin-top: 10px; letter-spacing: 0.5px;">
                PEMBERITAHUAN PENGAJUAN PERMOHONAN ASESMEN BARU
              </div>
            </td>
          </tr>

          <!-- Isi Surat -->
          <tr>
            <td style="padding: 25px 30px;">
              <p style="margin-top: 0; font-size: 14px; color: #334155;">
                Kepada Yth.<br>
                <strong>Sekretariat Tim Asesmen Terpadu (TAT)</strong>
              </p>

              <p style="font-size: 14px; color: #334155; text-align: justify;">
                Terdapat permohonan asesmen terpadu baru yang telah disubmit oleh penyidik dan menunggu proses verifikasi berkas persyaratan:
              </p>

              <table role="presentation" width="100%" style="margin: 18px 0 22px 0; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 7px 10px; width: 35%; color: #475569; border-bottom: 1px solid #e2e8f0;">Nomor Permohonan</td>
                  <td style="padding: 7px 10px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${nomorPermohonan}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Tracking ID</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${trackingNumber || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Penyidik / Pemohon</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${namaPemohon} (${instansiPemohon})</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Nama Tersangka</td>
                  <td style="padding: 7px 10px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${terperiksaNama}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Nomor Laporan Polisi</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${nomorLp}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" style="margin: 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 500; padding: 10px 24px; border-radius: 4px;">
                      Verifikasi Berkas &amp; Tugaskan Tim
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #64748b; margin-top: 25px;">
                Demikian pemberitahuan ini disampaikan untuk ditindaklanjuti sesuai prosedur dinas.
              </p>
            </td>
          </tr>

          <!-- Footer Resmi -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 16px 30px; text-align: center; border-top: 1px solid #cbd5e1; font-size: 11px; color: #64748b; line-height: 18px;">
              <div style="font-weight: 600; color: #334155;">SEKRETARIAT TIM ASESMEN TERPADU (TAT) POLRI &amp; BNN</div>
              <div>Sistem Elektronik Tim Asesmen Terpadu (E-TAT)</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `[E-TAT POLRI] Permohonan Baru Disubmit: ${nomorPermohonan} - a.n ${terperiksaNama}`,
    html,
    text: `PEMBERITAHUAN PENGAJUAN PERMOHONAN ASESMEN BARU\n\nPermohonan TAT baru telah disubmit oleh ${namaPemohon} (${instansiPemohon}) untuk tersangka ${terperiksaNama} (No: ${nomorPermohonan}, LP: ${nomorLp}). Silakan login ke portal E-TAT: ${dashboardUrl}`,
  });
};
