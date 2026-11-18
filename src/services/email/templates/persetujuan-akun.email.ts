import { env } from '../../../config/env';
import { sendEmail } from '../core/client';
import { formatTglHanya, formatTglIndo } from '../core/formatters';

export interface NotifikasiPersetujuanAkunDetails {
  emailTujuan: string;
  namaLengkap: string;
  pangkat?: string | null;
  nrp: string;
  jabatan: string;
  instansi: string;
  kategoriInstansi?: string | null;
  wilayahHukum: string;
  alamatKantor: string;
  nomorRegistrasi: string;
  tanggalDaftar?: Date | string | null;
  phone: string;
  teleponKantor?: string | null;
  catatanAdmin?: string | null;
  approvedAt?: Date | string | null;
  approvedByNama?: string | null;
  role: 'PENGAJU' | 'MEDIS' | 'HUKUM' | 'ADMIN' | string;
  passwordAwal: string;
  loginUrl?: string;
}

/**
 * Mengirim Email Resmi Surat Keterangan Persetujuan & Verifikasi Akun Dinas E-TAT
 */
export const sendEmailPemberitahuanPersetujuanAkun = async (
  details: NotifikasiPersetujuanAkunDetails
): Promise<{ success: boolean; data?: any; error?: string }> => {
  const {
    emailTujuan,
    namaLengkap,
    pangkat,
    nrp,
    jabatan,
    instansi,
    kategoriInstansi,
    wilayahHukum,
    alamatKantor,
    nomorRegistrasi,
    tanggalDaftar,
    phone,
    teleponKantor,
    catatanAdmin,
    approvedAt,
    approvedByNama,
    role,
    passwordAwal,
    loginUrl,
  } = details;

  const namaLengkapPangkat = `${pangkat ? pangkat + ' ' : ''}${namaLengkap}`;
  const targetLoginUrl = loginUrl || `${env.FRONTEND_URL || 'https://www.e-tatsiappulih.com'}/login`;

  const roleLabel =
    role === 'PENGAJU'
      ? 'PENGAJU / PEMOHON ASESMEN (PENYIDIK SATRESNARKOBA / BNN)'
      : role === 'MEDIS'
      ? 'TIM ASESOR MEDIS TAT (DOKTER / PSIKOLOG KLINIS)'
      : role === 'HUKUM'
      ? 'TIM ASESOR HUKUM TAT (JAKSA / PENELAAH HUKUM)'
      : 'PERSONEL ADMINISTRATOR SEKRETARIAT TAT';

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Surat Keterangan Persetujuan Akun Dinas E-TAT</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px 0; color: #1e293b;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" width="640" style="max-width: 640px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07); text-align: left;">
          
          <!-- KOP SURAT RESMI -->
          <tr>
            <td style="background-color: #0b172a; padding: 24px 30px; border-bottom: 3px solid #d4af37; text-align: center;">
              <table role="presentation" width="100%">
                <tr>
                  <td align="center">
                    <div style="font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase;">
                      KEPOLISIAN NEGARA REPUBLIK INDONESIA
                    </div>
                    <div style="font-size: 14px; font-weight: 800; color: #f8fafc; letter-spacing: 1px; margin-top: 3px; text-transform: uppercase;">
                      TIM ASESMEN TERPADU (TAT) NARKOTIKA
                    </div>
                    <div style="font-size: 12px; font-weight: 700; color: #d4af37; margin-top: 2px; letter-spacing: 0.5px;">
                      SISTEM INFORMASI ELEKTRONIK ASESMEN TERPADU (E-TAT POLRI)
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BADGE STATUS MINIMALIS FORMAL -->
          <tr>
            <td style="background-color: #f8fafc; padding: 12px 30px; border-bottom: 1px solid #e2e8f0;">
              <table role="presentation" width="100%">
                <tr>
                  <td style="font-size: 12px; color: #64748b; font-weight: 600;">
                    No. Registrasi: <span style="font-family: monospace; color: #0f172a; font-weight: 700;">${nomorRegistrasi}</span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.5px; text-transform: uppercase;">
                      DISETUJUI &amp; AKTIF
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ISI SURAT RESMI -->
          <tr>
            <td style="padding: 28px 30px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; letter-spacing: 0.5px; text-transform: uppercase;">
                  SURAT PEMBERITAHUAN VERIFIKASI &amp; PERSETUJUAN AKUN DINAS
                </h1>
                <p style="font-size: 12px; color: #64748b; margin: 0;">
                  Nomor: <span style="font-family: monospace; color: #334155;">SK-TAT/${nomorRegistrasi}</span>
                </p>
              </div>

              <p style="font-size: 13px; line-height: 22px; color: #334155; margin-bottom: 20px;">
                Kepada Yth.<br>
                <strong style="color: #0f172a; font-size: 14px;">${namaLengkapPangkat}</strong><br>
                ${jabatan} &mdash; ${instansi}
              </p>

              <p style="font-size: 13px; line-height: 22px; color: #334155; margin-bottom: 22px;">
                Berdasarkan hasil verifikasi berkas administrasi dan keabsahan identitas kedinasan oleh Sekretariat Tim Asesmen Terpadu (TAT), diberitahukan bahwa permohonan pendaftaran akun Anda telah <strong>DISETUJUI DAN TELAH DIAKTIFKAN</strong> pada Sistem Informasi E-TAT POLRI.
              </p>

              <!-- BAGIAN 1: KREDENSIAL LOGIN -->
              <table role="presentation" width="100%" style="margin-bottom: 22px; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; border-collapse: separate; border-spacing: 0;">
                <tr>
                  <td colspan="2" style="background-color: #0f172a; padding: 10px 14px; font-size: 12px; font-weight: 700; color: #d4af37; letter-spacing: 0.5px;">
                    I. KREDENSIAL MASUK SISTEM (LOGIN ACCESS)
                  </td>
                </tr>
                <tr style="background-color: #ffffff;">
                  <td style="padding: 10px 14px; width: 35%; font-size: 12px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">
                    Alamat Email Kedinasan
                  </td>
                  <td style="padding: 10px 14px; font-size: 13px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; font-family: monospace;">
                    ${emailTujuan}
                  </td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">
                    Kata Sandi Masuk Awal
                  </td>
                  <td style="padding: 10px 14px; font-size: 13px; font-weight: 700; color: #b91c1c; border-bottom: 1px solid #e2e8f0; font-family: monospace; background-color: #fef2f2;">
                    ${passwordAwal}
                  </td>
                </tr>
                <tr style="background-color: #ffffff;">
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">
                    Hak Akses / Otoritas Role
                  </td>
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #1e40af; border-bottom: 1px solid #e2e8f0;">
                    ${roleLabel}
                  </td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #64748b;">
                    Login Alternatif
                  </td>
                  <td style="padding: 10px 14px; font-size: 12px; color: #334155; line-height: 18px;">
                    Anda juga dapat masuk langsung menggunakan tombol <strong>"Masuk dengan Google"</strong> menggunakan akun email <em>${emailTujuan}</em> tanpa perlu mengetik kata sandi.
                  </td>
                </tr>
              </table>

              <!-- BAGIAN 2: RINCIAN DATA PROFIL PENDAFTAR -->
              <table role="presentation" width="100%" style="margin-bottom: 22px; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; border-collapse: separate; border-spacing: 0;">
                <tr>
                  <td colspan="2" style="background-color: #f1f5f9; padding: 10px 14px; font-size: 12px; font-weight: 700; color: #0f172a; border-left: 4px solid #0f172a;">
                    II. RINCIAN DATA PROFIL PERSONEL TERDAFTAR
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 14px; width: 35%; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Nomor Registrasi</td>
                  <td style="padding: 8px 14px; font-size: 12px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${nomorRegistrasi}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Nama Lengkap Personel</td>
                  <td style="padding: 8px 14px; font-size: 12px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${namaLengkapPangkat}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Pangkat / NRP / NIP</td>
                  <td style="padding: 8px 14px; font-size: 12px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${pangkat || '-'} / NRP/NIP: ${nrp}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Jabatan Kedinasan</td>
                  <td style="padding: 8px 14px; font-size: 12px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${jabatan}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Instansi / Satuan Kerja</td>
                  <td style="padding: 8px 14px; font-size: 12px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${instansi} (${kategoriInstansi || 'Instansi Kedinasan'})</td>
                </tr>
                <tr>
                  <td style="padding: 8px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Wilayah Hukum</td>
                  <td style="padding: 8px 14px; font-size: 12px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${wilayahHukum}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Alamat Kantor</td>
                  <td style="padding: 8px 14px; font-size: 12px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${alamatKantor}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Kontak HP / WhatsApp</td>
                  <td style="padding: 8px 14px; font-size: 12px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${phone} ${teleponKantor ? `(Telp Kantor: ${teleponKantor})` : ''}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 14px; font-size: 12px; color: #64748b;">Tanggal Registrasi</td>
                  <td style="padding: 8px 14px; font-size: 12px; color: #0f172a;">${formatTglHanya(tanggalDaftar || new Date())}</td>
                </tr>
              </table>

              <!-- BAGIAN 3: PENGESAHAN VERIFIKASI ADMIN -->
              <table role="presentation" width="100%" style="margin-bottom: 26px; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; border-collapse: separate; border-spacing: 0;">
                <tr>
                  <td colspan="2" style="background-color: #f1f5f9; padding: 10px 14px; font-size: 12px; font-weight: 700; color: #0f172a; border-left: 4px solid #166534;">
                    III. CATATAN PENGESAHAN ADMINISTRATOR
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 14px; width: 35%; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Waktu Disetujui</td>
                  <td style="padding: 8px 14px; font-size: 12px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${formatTglIndo(approvedAt || new Date())}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 14px; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Diverifikasi Oleh</td>
                  <td style="padding: 8px 14px; font-size: 12px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${approvedByNama || 'Admin Sekretariat TAT'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 14px; font-size: 12px; color: #64748b;">Catatan Verifikator</td>
                  <td style="padding: 8px 14px; font-size: 12px; color: #166534; font-weight: 600;">
                    ${catatanAdmin || 'Dokumen KTP, KTA/Identitas Kedinasan, dan Surat Penunjukan telah diverifikasi sah.'}
                  </td>
                </tr>
              </table>

              <!-- TOMBOL CTA MASUK SISTEM -->
              <table role="presentation" width="100%" style="margin: 24px 0 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${targetLoginUrl}" style="display: inline-block; background-color: #1a3a68; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 32px; border-radius: 6px; letter-spacing: 0.5px; box-shadow: 0 4px 6px -1px rgba(26,58,104,0.3);">
                      MASUK KE PORTAL E-TAT SEKARANG &rarr;
                    </a>
                    <div style="font-size: 11px; color: #64748b; margin-top: 8px;">
                      Tautan akses: <a href="${targetLoginUrl}" style="color: #1a3a68;">${targetLoginUrl}</a>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- PERINGATAN KEAMANAN -->
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 14px; font-size: 11px; color: #92400e; line-height: 18px; border-radius: 0 4px 4px 0;">
                <strong>Perhatian Keamanan Akun Dinas:</strong><br>
                1. Kredensial akun ini bersifat rahasia dan kedinasan. Dilarang memindahtangankan akun kepada pihak lain.<br>
                2. Demi keamanan, Anda disarankan untuk segera memperbarui kata sandi Anda setelah berhasil login pertama kali pada menu Pengaturan Profil.
              </div>

              <p style="font-size: 12px; color: #64748b; margin-top: 25px; line-height: 18px;">
                Demikian surat pemberitahuan ini disampaikan untuk dapat dipergunakan sebagaimana mestinya dalam rangka pelaksanaan tugas asesmen terpadu narkotika.
              </p>
            </td>
          </tr>

          <!-- FOOTER RESMI -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 18px 30px; text-align: center; border-top: 1px solid #cbd5e1; font-size: 11px; color: #64748b; line-height: 18px;">
              <div style="font-weight: 700; color: #1e293b; text-transform: uppercase;">SEKRETARIAT TIM ASESMEN TERPADU (TAT) POLRI &amp; BNN</div>
              <div>Sistem Informasi Terpadu Pelayanan Asesmen Hukum &amp; Medis Narkotika (E-TAT)</div>
              <div style="margin-top: 4px; font-size: 10px; color: #94a3b8;">Email ini dibuat dan dikirim secara otomatis oleh sistem. Surat ini sah tanpa tanda tangan basah.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const plainText = `
SURAT PEMBERITAHUAN VERIFIKASI & PERSETUJUAN AKUN DINAS
SISTEM INFORMASI ELEKTRONIK ASESMEN TERPADU (E-TAT POLRI)
Nomor: SK-TAT/${nomorRegistrasi}

Kepada Yth.
${namaLengkapPangkat}
${jabatan} - ${instansi}

Berdasarkan hasil verifikasi berkas administrasi dan keabsahan identitas kedinasan oleh Sekretariat Tim Asesmen Terpadu (TAT), diberitahukan bahwa permohonan pendaftaran akun Anda telah DISETUJUI DAN TELAH DIAKTIFKAN pada Sistem Informasi E-TAT POLRI.

I. KREDENSIAL MASUK SISTEM:
- Email Akun Kedinasan: ${emailTujuan}
- Kata Sandi Masuk Awal: ${passwordAwal}
- Hak Akses Role: ${roleLabel}
- Tautan Login: ${targetLoginUrl}
(Anda juga dapat langsung masuk menggunakan tombol "Masuk dengan Google" menggunakan akun email ${emailTujuan})

II. RINCIAN DATA PROFIL:
- Nomor Registrasi: ${nomorRegistrasi}
- Nama Lengkap: ${namaLengkapPangkat}
- Pangkat / NRP: ${pangkat || '-'} / ${nrp}
- Jabatan: ${jabatan}
- Instansi: ${instansi} (${kategoriInstansi || '-'})
- Wilayah Hukum: ${wilayahHukum}
- Alamat Kantor: ${alamatKantor}
- Kontak Handphone: ${phone}

III. CATATAN PENGESAHAN ADMINISTRATOR:
- Waktu Disetujui: ${formatTglIndo(approvedAt || new Date())}
- Diverifikasi Oleh: ${approvedByNama || 'Admin Sekretariat TAT'}
- Catatan Verifikasi: ${catatanAdmin || 'Dokumen diverifikasi sah.'}

Demi keamanan akun kedinasan, jangan berikan kredensial akun kepada pihak yang tidak berkepentingan.

SEKRETARIAT TIM ASESMEN TERPADU (TAT) POLRI
  `.trim();

  return sendEmail({
    to: emailTujuan,
    subject: `[E-TAT POLRI] Surat Keterangan Persetujuan Akun Kedinasan: ${nomorRegistrasi} - a.n ${namaLengkapPangkat}`,
    html,
    text: plainText,
  });
};
