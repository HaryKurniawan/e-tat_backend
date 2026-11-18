import { env } from '../../../config/env';
import { sendEmail } from '../core/client';
import { formatTglIndo } from '../core/formatters';

export interface SuratJawabanEmailDetails {
  to: string;
  namaPengaju: string;
  nomorPermohonan: string;
  trackingNumber?: string | null;
  nomorSurat: string;
  tanggalSurat: string;
  namaTersangka: string;
  jadwalMedis?: Date | string | null;
  jadwalPleno?: Date | string | null;
  lokasiPemeriksaan?: string | null;
  pdf: Buffer;
  filename: string;
}

/**
 * Mengirim Surat Jawaban (PDF terlampir) ke email Pengaju saat berkas dinyatakan
 * lengkap/diterima dan tim asesmen telah ditugaskan.
 */
export const sendSuratJawabanEmail = async (
  params: SuratJawabanEmailDetails
): Promise<{ success: boolean; data?: any; error?: string }> => {
  const {
    to,
    namaPengaju,
    nomorPermohonan,
    trackingNumber,
    nomorSurat,
    tanggalSurat,
    namaTersangka,
    jadwalMedis,
    jadwalPleno,
    lokasiPemeriksaan,
    pdf,
    filename,
  } = params;
  const dashboardUrl = `${env.FRONTEND_URL}/dashboard`;

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Surat Jawaban Permohonan Asesmen Terpadu</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; line-height: 1.5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 650px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; overflow: hidden;">
          <tr>
            <td style="padding: 24px 30px 18px 30px; text-align: center; border-bottom: 2px solid #0f172a;">
              <div style="font-size: 12px; font-weight: 600; letter-spacing: 1.5px; color: #0f172a; text-transform: uppercase;">KEPOLISIAN NEGARA REPUBLIK INDONESIA</div>
              <div style="font-size: 11px; font-weight: 500; letter-spacing: 1px; color: #475569; text-transform: uppercase; margin-top: 2px;">TIM ASESMEN TERPADU (TAT)</div>
              <div style="font-size: 16px; font-weight: 600; color: #0f172a; margin-top: 10px; letter-spacing: 0.5px;">SURAT JAWABAN PENERIMAAN PERMOHONAN ASESMEN</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 3px;">Nomor Surat: ${nomorSurat}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 25px 30px;">
              <p style="margin-top: 0; font-size: 14px; color: #334155;">
                Kepada Yth.<br>
                <strong>${namaPengaju}</strong><br>
                Penyidik Pengaju
              </p>
              <p style="font-size: 14px; color: #334155; text-align: justify;">
                Berkas permohonan asesmen terpadu atas nama tersangka <strong>${namaTersangka}</strong> telah diperiksa oleh Sekretariat TAT dan dinyatakan
                <strong>lengkap serta diterima</strong>. Permohonan selanjutnya diproses oleh Tim Asesmen Terpadu (Tim Medis dan Tim Hukum).
                Surat Jawaban resmi terlampir pada email ini dalam format PDF.
              </p>
              <table role="presentation" width="100%" style="margin: 18px 0 22px 0; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 7px 10px; width: 38%; color: #475569; border-bottom: 1px solid #e2e8f0;">Nomor Permohonan</td>
                  <td style="padding: 7px 10px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${nomorPermohonan}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Tracking ID</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${trackingNumber || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Tanggal Surat</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${tanggalSurat}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Jadwal Pemeriksaan Medis</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${jadwalMedis ? formatTglIndo(jadwalMedis) : 'Akan diinformasikan'}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Jadwal Sidang Pleno TAT</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${jadwalPleno ? formatTglIndo(jadwalPleno) : 'Akan diinformasikan'}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Tempat Pemeriksaan</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${lokasiPemeriksaan || 'Akan diinformasikan'}</td>
                </tr>
              </table>
              <table role="presentation" width="100%" style="margin: 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 500; padding: 10px 24px; border-radius: 4px;">
                      Pantau Status Permohonan
                    </a>
                  </td>
                </tr>
              </table>
              <p style="font-size: 12px; color: #64748b; margin-top: 25px;">
                Demikian pemberitahuan ini disampaikan. Atas perhatian dan kerja sama Saudara, kami ucapkan terima kasih.
              </p>
            </td>
          </tr>
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

  return sendEmail({
    to,
    subject: `[E-TAT POLRI] Surat Jawaban Permohonan Diterima: ${nomorPermohonan} - a.n ${namaTersangka}`,
    html,
    text: `SURAT JAWABAN PENERIMAAN PERMOHONAN ASESMEN TERPADU\n\nKepada Yth. ${namaPengaju}\nBerkas permohonan ${nomorPermohonan} a.n ${namaTersangka} telah dinyatakan lengkap dan diterima. Surat Jawaban No. ${nomorSurat} terlampir (PDF).\n\nPantau status: ${dashboardUrl}`,
    attachments: [{ filename, content: pdf.toString('base64') }],
  });
};
