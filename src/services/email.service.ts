import { env } from '../config/env';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Mengirim email menggunakan Resend REST API
 */
export const sendEmail = async ({ to, subject, html, text }: SendEmailOptions): Promise<{ success: boolean; data?: any; error?: string }> => {
  const apiKey = env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ [Email Service] RESEND_API_KEY tidak dikonfigurasi. Pengiriman email dibatalkan.');
    return { success: false, error: 'RESEND_API_KEY is not configured' };
  }

  const recipients = Array.isArray(to) ? to : [to];
  const fromAddress = env.EMAIL_FROM && env.EMAIL_FROM.includes('@') 
    ? env.EMAIL_FROM 
    : 'E-TAT POLRI <onboarding@resend.dev>';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: recipients,
        subject,
        html,
        text,
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

interface PenugasanHukumDetails {
  asesorEmail: string;
  asesorNama: string;
  nomorPermohonan: string;
  trackingNumber?: string | null;
  jadwalPemeriksaanHukum?: Date | string | null;
  jadwalPleno?: Date | string | null;
  lokasiPemeriksaan?: string | null;
  sekretariatNama?: string | null;
  terperiksa: {
    namaLengkap: string;
    alias?: string | null;
    nik?: string | null;
    usia?: number | null;
    jenisKelamin?: string | null;
    pekerjaan?: string | null;
    alamatKtp?: string | null;
  };
  perkara?: {
    nomorLaporanPolisi: string;
    tanggalLp?: Date | string | null;
    instansiPenyidik: string;
    namaPenyidik: string;
    nomorHpPenyidik: string;
    pasalDipersangkakan: string;
    tempatKejadianPerkara: string;
    kronologiSingkat?: string | null;
    barangBuktiList?: Array<{
      jenisZat: string;
      beratBersihGram: number;
      beratKotorGram?: number | null;
      statusUjiLab?: string;
    }>;
  } | null;
}

/**
 * Format tanggal Indonesia
 */
const formatTglIndo = (d?: Date | string | null): string => {
  if (!d) return '-';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
};

/**
 * Mengirim notifikasi email penugasan tugas asesmen ke Asesor Hukum
 */
export const sendPenugasanHukumEmail = async (params: PenugasanHukumDetails): Promise<void> => {
  const {
    asesorEmail,
    asesorNama,
    nomorPermohonan,
    trackingNumber,
    jadwalPemeriksaanHukum,
    jadwalPleno,
    lokasiPemeriksaan,
    sekretariatNama,
    terperiksa,
    perkara,
  } = params;

  const bbRows = perkara?.barangBuktiList && perkara.barangBuktiList.length > 0
    ? perkara.barangBuktiList
        .map(
          (bb, idx) => `
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
            <td style="padding: 8px 12px; color: #475569;">${idx + 1}</td>
            <td style="padding: 8px 12px; font-weight: 600; color: #1e293b;">${bb.jenisZat}</td>
            <td style="padding: 8px 12px; color: #334155;">${bb.beratBersihGram} gram</td>
            <td style="padding: 8px 12px; color: #334155;">${bb.beratKotorGram ? bb.beratKotorGram + ' gram' : '-'}</td>
            <td style="padding: 8px 12px; color: #0284c7; text-transform: capitalize;">${(bb.statusUjiLab || 'belum_uji').replace(/_/g, ' ')}</td>
          </tr>
        `
        )
        .join('')
    : `<tr><td colspan="5" style="padding: 12px; text-align: center; color: #94a3b8; font-size: 13px;">Tidak ada rincian barang bukti</td></tr>`;

  const dashboardUrl = `${env.FRONTEND_URL}/dashboard`;

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Penugasan Asesmen Hukum - E-TAT POLRI</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Container Utama -->
        <table role="presentation" width="100%" style="max-width: 650px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 30px 25px; text-align: center;">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #93c5fd; text-transform: uppercase; margin-bottom: 6px;">
                KEPOLISIAN NEGARA REPUBLIK INDONESIA
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                SISTEM ELEKTRONIK TIM ASESMEN TERPADU (E-TAT)
              </h1>
              <div style="display: inline-block; margin-top: 14px; background-color: rgba(59, 130, 246, 0.25); border: 1px solid rgba(147, 197, 253, 0.4); border-radius: 20px; padding: 4px 16px;">
                <span style="color: #ffffff; font-size: 13px; font-weight: 600;">⚖️ PENUGASAN ASESMEN HUKUM</span>
              </div>
            </td>
          </tr>

          <!-- Konten Body -->
          <tr>
            <td style="padding: 30px 25px;">
              <p style="font-size: 15px; line-height: 24px; margin-top: 0; color: #1e293b;">
                Yth. <strong>${asesorNama}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 22px; color: #475569;">
                Anda telah ditugaskan oleh Sekretariat (<strong>${sekretariatNama || 'Tim Sekretariat TAT'}</strong>) sebagai <strong>Asesor Hukum</strong> untuk melaksanakan pemeriksaan asesmen hukum pada permohonan berikut:
              </p>

              <!-- Box Ringkasan Penugasan -->
              <table role="presentation" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0; border-collapse: separate; border-spacing: 0;">
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; width: 40%; font-size: 13px; color: #64748b;">No. Permohonan</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 700; color: #0f172a;">${nomorPermohonan}</td>
                </tr>
                ${trackingNumber ? `
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Tracking ID</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #2563eb;">${trackingNumber}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Jadwal Pemeriksaan Hukum</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 700; color: #b91c1c;">📅 ${formatTglIndo(jadwalPemeriksaanHukum)}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">Jadwal Sidang Pleno</td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #4338ca;">👥 ${formatTglIndo(jadwalPleno)}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; font-size: 13px; color: #64748b;">Lokasi / Ruangan</td>
                  <td style="padding: 14px 18px; font-size: 13px; font-weight: 600; color: #334155;">📍 ${lokasiPemeriksaan || 'Gedung TAT / Sesuai Jadwal'}</td>
                </tr>
              </table>

              <!-- Section 1: Data Terperiksa -->
              <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 24px 0 10px 0; border-left: 4px solid #3b82f6; padding-left: 10px;">
                👤 Data Tersangka / Terperiksa
              </h3>
              <table role="presentation" width="100%" style="font-size: 13px; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 6px 0; width: 35%; color: #64748b;">Nama Lengkap:</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${terperiksa.namaLengkap} ${terperiksa.alias ? `(Alias: ${terperiksa.alias})` : ''}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">NIK:</td>
                  <td style="padding: 6px 0; color: #334155;">${terperiksa.nik || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Jenis Kelamin / Usia:</td>
                  <td style="padding: 6px 0; color: #334155;">${terperiksa.jenisKelamin || '-'} / ${terperiksa.usia ? terperiksa.usia + ' Tahun' : '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Pekerjaan:</td>
                  <td style="padding: 6px 0; color: #334155;">${terperiksa.pekerjaan || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Alamat KTP:</td>
                  <td style="padding: 6px 0; color: #334155;">${terperiksa.alamatKtp || '-'}</td>
                </tr>
              </table>

              <!-- Section 2: Data Perkara & Kronologi -->
              ${perkara ? `
              <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 24px 0 10px 0; border-left: 4px solid #ef4444; padding-left: 10px;">
                📄 Perkara & Laporan Polisi
              </h3>
              <table role="presentation" width="100%" style="font-size: 13px; border-collapse: collapse; margin-bottom: 15px;">
                <tr>
                  <td style="padding: 6px 0; width: 35%; color: #64748b;">Nomor LP:</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${perkara.nomorLaporanPolisi}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Instansi / Penyidik:</td>
                  <td style="padding: 6px 0; color: #334155;">${perkara.instansiPenyidik} - ${perkara.namaPenyidik} (${perkara.nomorHpPenyidik})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Pasal Sangkaan:</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #dc2626;">${perkara.pasalDipersangkakan}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">TKP:</td>
                  <td style="padding: 6px 0; color: #334155;">${perkara.tempatKejadianPerkara}</td>
                </tr>
              </table>

              ${perkara.kronologiSingkat ? `
              <div style="background-color: #f8fafc; border-left: 3px solid #cbd5e1; padding: 12px 16px; border-radius: 4px; font-size: 13px; line-height: 20px; color: #475569; margin-bottom: 20px;">
                <strong>Kronologi Singkat:</strong><br>
                ${perkara.kronologiSingkat}
              </div>` : ''}

              <!-- Section 3: Barang Bukti -->
              <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 24px 0 10px 0; border-left: 4px solid #f59e0b; padding-left: 10px;">
                📦 Rincian Barang Bukti
              </h3>
              <table role="presentation" width="100%" style="border-collapse: collapse; margin-bottom: 25px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f1f5f9; text-align: left; font-size: 12px; color: #64748b;">
                    <th style="padding: 8px 12px;">#</th>
                    <th style="padding: 8px 12px;">Jenis Zat</th>
                    <th style="padding: 8px 12px;">Berat Bersih</th>
                    <th style="padding: 8px 12px;">Berat Kotor</th>
                    <th style="padding: 8px 12px;">Status Lab</th>
                  </tr>
                </thead>
                <tbody>
                  ${bbRows}
                </tbody>
              </table>
              ` : ''}

              <!-- CTA Button -->
              <table role="presentation" width="100%" style="margin: 30px 0 15px 0;">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; background-color: #1e3a8a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(30, 58, 138, 0.4);">
                      🚀 Buka Lembar Kerja Asesmen Hukum di Portal E-TAT
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 15px;">
                Harap melakukan asesmen sesuai jadwal dan mengunggah hasil analisis hukum ke sistem sebelum Sidang Pleno TAT.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 20px 25px; text-align: center; color: #94a3b8; font-size: 11px; line-height: 18px;">
              <p style="margin: 0; font-weight: 600; color: #cbd5e1;">TIM ASESMEN TERPADU (TAT) POLRI & BNN</p>
              <p style="margin: 4px 0 0 0;">Email ini dibuat secara otomatis oleh Sistem E-TAT POLRI. Mohon tidak membalas email ini secara langsung.</p>
              <p style="margin: 6px 0 0 0; color: #64748b;">Kerahasiaan Dokumen: Informasi dalam email ini bersifat rahasia kedinasan dan hanya diperuntukkan bagi petugas yang berwenang.</p>
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
    to: asesorEmail,
    subject: `[E-TAT POLRI] Penugasan Asesmen Hukum: ${nomorPermohonan} - a.n ${terperiksa.namaLengkap}`,
    html,
    text: `Pemberitahuan Penugasan Asesmen Hukum E-TAT POLRI\n\nKepada Yth. ${asesorNama},\nAnda telah ditugaskan untuk asesmen hukum permohonan No: ${nomorPermohonan} (Tersangka: ${terperiksa.namaLengkap}).\nJadwal Pemeriksaan: ${formatTglIndo(jadwalPemeriksaanHukum)}\nLokasi: ${lokasiPemeriksaan || '-'}\n\nSilakan login ke portal E-TAT: ${dashboardUrl}`,
  });
};
