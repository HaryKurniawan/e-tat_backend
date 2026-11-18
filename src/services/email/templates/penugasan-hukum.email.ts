import { env } from '../../../config/env';
import { sendEmail } from '../core/client';
import { formatTglHanya, formatTglIndo, renderBarangBuktiTable } from '../core/formatters';
import { PerkaraDetails, TerperiksaDetails } from '../core/types';

export interface PenugasanHukumDetails {
  asesorEmail: string;
  asesorNama: string;
  nomorPermohonan: string;
  trackingNumber?: string | null;
  jadwalPemeriksaanHukum?: Date | string | null;
  jadwalPleno?: Date | string | null;
  lokasiPemeriksaan?: string | null;
  sekretariatNama?: string | null;
  terperiksa: TerperiksaDetails;
  perkara?: PerkaraDetails | null;
}

/**
 * Mengirim notifikasi email penugasan tugas asesmen ke Asesor Hukum (Format Resmi)
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

  const dashboardUrl = `${env.FRONTEND_URL}/dashboard`;
  const bbRows = renderBarangBuktiTable(perkara?.barangBuktiList);

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pemberitahuan Penugasan Asesmen Hukum TAT</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; line-height: 1.5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 680px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; overflow: hidden;">
          
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
                SURAT PEMBERITAHUAN PENUGASAN ASESMEN HUKUM
              </div>
              <div style="font-size: 12px; color: #64748b; margin-top: 3px;">
                Nomor Register: ${nomorPermohonan} ${trackingNumber ? `| Tracking ID: ${trackingNumber}` : ''}
              </div>
            </td>
          </tr>

          <!-- Isi Surat -->
          <tr>
            <td style="padding: 25px 30px;">
              <p style="margin-top: 0; font-size: 14px; color: #334155;">
                Kepada Yth.<br>
                <strong>${asesorNama}</strong><br>
                Asesor Hukum Tim Asesmen Terpadu
              </p>

              <p style="font-size: 14px; color: #334155; text-align: justify;">
                Berdasarkan permohonan asesmen yang diajukan oleh penyidik dan telah diverifikasi oleh Sekretariat TAT (<strong>${sekretariatNama || 'Sekretariat Tim Asesmen Terpadu'}</strong>), dengan ini diberitahukan penugasan telaah yuridis dan pemeriksaan hukum terhadap perkara tersangka di bawah ini:
              </p>

              <!-- I. Jadwal & Tempat Pelaksanaan -->
              <table role="presentation" width="100%" style="margin: 18px 0 22px 0; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td colspan="2" style="background-color: #f1f5f9; padding: 7px 10px; font-weight: 600; color: #0f172a; border-left: 3px solid #0f172a;">
                    I. JADWAL DAN LOKASI PELAKSANAAN
                  </td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; width: 35%; color: #475569; border-bottom: 1px solid #e2e8f0;">Jadwal Pemeriksaan Hukum</td>
                  <td style="padding: 7px 10px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${formatTglIndo(jadwalPemeriksaanHukum)}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Jadwal Sidang Pleno TAT</td>
                  <td style="padding: 7px 10px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${formatTglIndo(jadwalPleno)}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Tempat / Ruangan Pelaksanaan</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${lokasiPemeriksaan || 'Ruang Sidang / Pemeriksaan TAT'}</td>
                </tr>
              </table>

              <!-- II. Identitas Tersangka / Terperiksa -->
              <table role="presentation" width="100%" style="margin: 18px 0 22px 0; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td colspan="2" style="background-color: #f1f5f9; padding: 7px 10px; font-weight: 600; color: #0f172a; border-left: 3px solid #0f172a;">
                    II. IDENTITAS TERSANGKA / TERPERIKSA
                  </td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; width: 35%; color: #475569; border-bottom: 1px solid #e2e8f0;">Nama Lengkap</td>
                  <td style="padding: 7px 10px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${terperiksa.namaLengkap} ${terperiksa.alias ? `(Alias: ${terperiksa.alias})` : ''}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Nomor Induk Kependudukan (NIK)</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${terperiksa.nik || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Tempat / Tanggal Lahir</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${terperiksa.tempatLahir || '-'}, ${formatTglHanya(terperiksa.tanggalLahir)}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Jenis Kelamin / Usia</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${terperiksa.jenisKelamin || '-'} / ${terperiksa.usia ? terperiksa.usia + ' Tahun' : '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Pekerjaan</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${terperiksa.pekerjaan || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Alamat Tempat Tinggal / KTP</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${terperiksa.alamatKtp || '-'}</td>
                </tr>
              </table>

              <!-- III. Data Perkara & Kronologi Kejadian -->
              ${perkara ? `
              <table role="presentation" width="100%" style="margin: 18px 0 22px 0; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td colspan="2" style="background-color: #f1f5f9; padding: 7px 10px; font-weight: 600; color: #0f172a; border-left: 3px solid #0f172a;">
                    III. DATA PERKARA & KRONOLOGI PENYIDIKAN
                  </td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; width: 35%; color: #475569; border-bottom: 1px solid #e2e8f0;">Nomor Laporan Polisi</td>
                  <td style="padding: 7px 10px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${perkara.nomorLaporanPolisi}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Tanggal Laporan Polisi</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${formatTglHanya(perkara.tanggalLp)}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Instansi / Satuan Penyidik</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${perkara.instansiPenyidik}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Penyidik yang Menangani</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${perkara.namaPenyidik} (Telp/HP: ${perkara.nomorHpPenyidik})</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Pasal yang Dipersangkakan</td>
                  <td style="padding: 7px 10px; font-weight: 600; color: #b91c1c; border-bottom: 1px solid #e2e8f0;">: ${perkara.pasalDipersangkakan}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Tempat Kejadian Perkara (TKP)</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${perkara.tempatKejadianPerkara}</td>
                </tr>
                ${perkara.kronologiSingkat ? `
                <tr>
                  <td style="padding: 7px 10px; color: #475569; vertical-align: top; border-bottom: 1px solid #e2e8f0;">Kronologi Kejadian Singkat</td>
                  <td style="padding: 7px 10px; color: #334155; line-height: 20px; text-align: justify; border-bottom: 1px solid #e2e8f0;">: ${perkara.kronologiSingkat}</td>
                </tr>` : ''}
              </table>

              <!-- IV. Rincian Barang Bukti -->
              <table role="presentation" width="100%" style="margin: 18px 0 25px 0; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td colspan="5" style="background-color: #f1f5f9; padding: 7px 10px; font-weight: 600; color: #0f172a; border-left: 3px solid #0f172a;">
                    IV. RINCIAN BARANG BUKTI
                  </td>
                </tr>
                <tr style="background-color: #f8fafc; font-weight: 600; font-size: 12px; color: #475569;">
                  <th style="padding: 8px 10px; border: 1px solid #cbd5e1; width: 8%;">No</th>
                  <th style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: left;">Jenis Zat / Narkotika</th>
                  <th style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: right; width: 20%;">Berat Bersih</th>
                  <th style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: right; width: 20%;">Berat Kotor</th>
                  <th style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; width: 22%;">Status Lab</th>
                </tr>
                <tbody>
                  ${bbRows}
                </tbody>
              </table>
              ` : ''}

              <!-- Petunjuk & Tautan Sistem -->
              <p style="font-size: 13px; color: #475569; line-height: 20px;">
                Diharapkan untuk melakukan telaah yuridis, verifikasi status keterlibatan sindikat, dan penyusunan rekomendasi hukum sebelum Sidang Pleno TAT dilaksanakan:
              </p>

              <table role="presentation" width="100%" style="margin: 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 500; padding: 10px 24px; border-radius: 4px;">
                      Buka Lembar Kerja Asesmen Hukum
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #64748b; margin-top: 25px;">
                Demikian pemberitahuan ini disampaikan untuk dilaksanakan sebagaimana mestinya.
              </p>
            </td>
          </tr>

          <!-- Footer Resmi -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 16px 30px; text-align: center; border-top: 1px solid #cbd5e1; font-size: 11px; color: #64748b; line-height: 18px;">
              <div style="font-weight: 600; color: #334155;">SEKRETARIAT TIM ASESMEN TERPADU (TAT) POLRI &amp; BNN</div>
              <div>Sistem Elektronik Tim Asesmen Terpadu (E-TAT) - Surat dinas elektronik resmi tanpa tanda tangan basah.</div>
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
    text: `PEMBERITAHUAN PENUGASAN ASESMEN HUKUM E-TAT POLRI\n\nKepada Yth. ${asesorNama}\nNomor Register: ${nomorPermohonan}\nTersangka: ${terperiksa.namaLengkap}\nJadwal Pemeriksaan: ${formatTglIndo(jadwalPemeriksaanHukum)}\nLokasi: ${lokasiPemeriksaan || '-'}\n\nSilakan akses sistem: ${dashboardUrl}`,
  });
};
