import { env } from '../../../config/env';
import { sendEmail } from '../core/client';
import { formatTglHanya, formatTglIndo, renderBarangBuktiTable } from '../core/formatters';
import { PerkaraDetails, TerperiksaDetails } from '../core/types';

export interface NotifikasiMedisSelesaiDetails {
  asesorHukumEmail: string;
  asesorHukumNama: string;
  asesorMedisNama: string;
  nomorPermohonan: string;
  trackingNumber?: string | null;
  jadwalPemeriksaanHukum?: Date | string | null;
  jadwalPleno?: Date | string | null;
  lokasiPemeriksaan?: string | null;
  terperiksa: TerperiksaDetails;
  perkara?: PerkaraDetails | null;
  hasilMedis?: {
    tesUrinHasil?: string | null;
    tesUrinZat?: any;
    diagnosisNapza?: string | null;
    tingkatKetergantungan?: string | null;
    rekomendasiRehab?: string | null;
    rencanaTerapi?: string | null;
  } | null;
}

/**
 * Mengirim notifikasi email ke Asesor Hukum saat Asesmen Medis telah DIFINALISASI (Format Resmi)
 */
export const sendNotifikasiMedisSelesaiKeHukumEmail = async (
  params: NotifikasiMedisSelesaiDetails
): Promise<void> => {
  const {
    asesorHukumEmail,
    asesorHukumNama,
    asesorMedisNama,
    nomorPermohonan,
    trackingNumber,
    jadwalPemeriksaanHukum,
    jadwalPleno,
    lokasiPemeriksaan,
    terperiksa,
    perkara,
    hasilMedis,
  } = params;

  const dashboardUrl = `${env.FRONTEND_URL}/dashboard`;
  const bbRows = renderBarangBuktiTable(perkara?.barangBuktiList);

  const tesUrinDisplay = hasilMedis?.tesUrinHasil || 'Selesai / Terlampir di Rekam Medis';
  const tesZatDisplay = Array.isArray(hasilMedis?.tesUrinZat)
    ? hasilMedis.tesUrinZat.join(', ')
    : typeof hasilMedis?.tesUrinZat === 'string'
    ? hasilMedis.tesUrinZat
    : '-';

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pemberitahuan Hasil Asesmen Medis Selesai</title>
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
                PEMBERITAHUAN HASIL ASESMEN MEDIS SELESAI
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
                <strong>${asesorHukumNama}</strong><br>
                Asesor Hukum Tim Asesmen Terpadu
              </p>

              <p style="font-size: 14px; color: #334155; text-align: justify;">
                Diberitahukan bahwa pemeriksaan medis dan skrining tes urin terhadap perkara tersangka di bawah ini telah <strong>selesai dilaksanakan dan difinalisasi</strong> oleh dokter pemeriksa (<strong>${asesorMedisNama}</strong>). Berkas medis telah tersedia untuk dijadikan rujukan telaah yuridis sebelum pelaksanaan Sidang Pleno TAT.
              </p>

              <!-- I. Ringkasan Perkara & Jadwal Pleno -->
              <table role="presentation" width="100%" style="margin: 18px 0 22px 0; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td colspan="2" style="background-color: #f1f5f9; padding: 7px 10px; font-weight: 600; color: #0f172a; border-left: 3px solid #0f172a;">
                    I. STATUS PENUGASAN &amp; SIDANG PLENO
                  </td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; width: 35%; color: #475569; border-bottom: 1px solid #e2e8f0;">Dokter Pemeriksa Medis</td>
                  <td style="padding: 7px 10px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${asesorMedisNama}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Jadwal Pemeriksaan Hukum</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${formatTglIndo(jadwalPemeriksaanHukum)}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Jadwal Sidang Pleno TAT</td>
                  <td style="padding: 7px 10px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${formatTglIndo(jadwalPleno)}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Lokasi Pelaksanaan</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${lokasiPemeriksaan || 'Ruang TAT Gedung BNN / Polda'}</td>
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
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">NIK</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${terperiksa.nik || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Jenis Kelamin / Usia</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${terperiksa.jenisKelamin || '-'} / ${terperiksa.usia ? terperiksa.usia + ' Tahun' : '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Alamat KTP</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${terperiksa.alamatKtp || '-'}</td>
                </tr>
              </table>

              <!-- III. Ringkasan Temuan & Hasil Asesmen Medis -->
              <table role="presentation" width="100%" style="margin: 18px 0 22px 0; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td colspan="2" style="background-color: #f1f5f9; padding: 7px 10px; font-weight: 600; color: #0f172a; border-left: 3px solid #0f172a;">
                    III. HASIL ASESMEN MEDIS &amp; PEMERIKSAAN URIN
                  </td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; width: 35%; color: #475569; border-bottom: 1px solid #e2e8f0;">Hasil Skrining Urin</td>
                  <td style="padding: 7px 10px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${tesUrinDisplay}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Zat yang Terdeteksi</td>
                  <td style="padding: 7px 10px; font-weight: 600; color: #b91c1c; border-bottom: 1px solid #e2e8f0;">: ${tesZatDisplay}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Diagnosis NAPZA (ICD-10)</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${hasilMedis?.diagnosisNapza || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Tingkat Ketergantungan</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${hasilMedis?.tingkatKetergantungan || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Rencana Terapi / Rekomendasi Medis</td>
                  <td style="padding: 7px 10px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${hasilMedis?.rekomendasiRehab || hasilMedis?.rencanaTerapi || 'Rehabilitasi sesuai Pleno'}</td>
                </tr>
              </table>

              <!-- IV. Data Perkara & Barang Bukti -->
              ${perkara ? `
              <table role="presentation" width="100%" style="margin: 18px 0 22px 0; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td colspan="2" style="background-color: #f1f5f9; padding: 7px 10px; font-weight: 600; color: #0f172a; border-left: 3px solid #0f172a;">
                    IV. DATA PERKARA & KRONOLOGI PENYIDIKAN
                  </td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; width: 35%; color: #475569; border-bottom: 1px solid #e2e8f0;">Nomor LP / Tanggal LP</td>
                  <td style="padding: 7px 10px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${perkara.nomorLaporanPolisi} (${formatTglHanya(perkara.tanggalLp)})</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Instansi / Penyidik</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${perkara.instansiPenyidik} - ${perkara.namaPenyidik}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 10px; color: #475569; border-bottom: 1px solid #e2e8f0;">Pasal Sangkaan / TKP</td>
                  <td style="padding: 7px 10px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">: ${perkara.pasalDipersangkakan} (TKP: ${perkara.tempatKejadianPerkara})</td>
                </tr>
                ${perkara.kronologiSingkat ? `
                <tr>
                  <td style="padding: 7px 10px; color: #475569; vertical-align: top; border-bottom: 1px solid #e2e8f0;">Kronologi Kejadian Singkat</td>
                  <td style="padding: 7px 10px; color: #334155; line-height: 20px; text-align: justify; border-bottom: 1px solid #e2e8f0;">: ${perkara.kronologiSingkat}</td>
                </tr>` : ''}
              </table>

              <!-- Tabel Barang Bukti -->
              <table role="presentation" width="100%" style="margin: 18px 0 25px 0; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td colspan="5" style="background-color: #f1f5f9; padding: 7px 10px; font-weight: 600; color: #0f172a; border-left: 3px solid #0f172a;">
                    V. RINCIAN BARANG BUKTI
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
                Silakan melakukan telaah hukum berdasarkan data medis dan rincian perkara di atas melalui portal sistem E-TAT:
              </p>

              <table role="presentation" width="100%" style="margin: 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 500; padding: 10px 24px; border-radius: 4px;">
                      Buka Lembar Kerja Telaah Hukum
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #64748b; margin-top: 25px;">
                Demikian pemberitahuan ini disampaikan untuk ditindaklanjuti.
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
    to: asesorHukumEmail,
    subject: `[E-TAT POLRI] Asesmen Medis Selesai: ${nomorPermohonan} - a.n ${terperiksa.namaLengkap}`,
    html,
    text: `PEMBERITAHUAN HASIL ASESMEN MEDIS SELESAI E-TAT POLRI\n\nKepada Yth. ${asesorHukumNama}\nNomor Register: ${nomorPermohonan}\nTersangka: ${terperiksa.namaLengkap}\nDokter Pemeriksa: ${asesorMedisNama}\nHasil Urin: ${tesUrinDisplay}\nDiagnosis: ${hasilMedis?.diagnosisNapza || '-'}\n\nSilakan akses lembar kerja hukum di portal E-TAT: ${dashboardUrl}`,
  });
};
