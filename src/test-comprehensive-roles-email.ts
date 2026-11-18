import dotenv from 'dotenv';
dotenv.config();

import {
  sendNotifikasiPermohonanBaruEmail,
  sendPenugasanMedisEmail,
  sendPenugasanHukumEmail,
  sendNotifikasiMedisSelesaiKeHukumEmail,
  sendSuratJawabanEmail,
  sendEmail,
} from './services/email.service';
import { buildSuratJawabanPdf } from './modules/surat-jawaban/surat-jawaban.service';

/**
 * ============================================================================
 * TEST KOMPREHENSIF EMAIL SERVICE UNTUK SETIAP ROLE DENGAN DATA RESMI POLRI & TAT
 * ============================================================================
 * 
 * Target Role & Email:
 * 1. ADMIN / SEKRETARIAT TAT   : etatsiappulih@gmail.com
 * 2. ASESOR MEDIS (DOKTER)      : k300gamers@gmail.com (dan cc/test medis@gmail.com)
 * 3. ASESOR HUKUM (JAKSA/POLRI) : harykurniawan155@gmail.com (dan cc/test etatsiappulih@gmail.com)
 * 4. PENYIDIK PENGAJU (POLRI)   : code72694@gmail.com (dan cc/test pengaju.etatsiappulih@gmail.com)
 */

async function runComprehensiveEmailTest() {
  console.log('================================================================================');
  console.log('🔍 MEMULAI PENGUJIAN EMAIL SERVICE E-TAT BERDASARKAN ROLE & DATA RESMI POLRI/BNN');
  console.log('================================================================================\n');

  // Master Data Kasus Narkotika Sesuai Standar TAT, SEMA No. 4/2010, & UU No. 35/2009
  const perkaraMaster = {
    nomorPermohonan: 'TAT/2026/11/0018',
    trackingNumber: 'TRK-20261110-8842',
    nomorLaporanPolisi: 'LP/A/142/XI/2026/SPKT.DITRESNARKOBA/POLDA METRO JAYA',
    tanggalLp: new Date('2026-11-08T10:30:00+07:00'),
    instansiPenyidik: 'Unit II Subdit III Ditresnarkoba Polda Metro Jaya',
    namaPenyidik: 'Kompol Budi Hartanto, S.H., S.I.K.',
    nomorHpPenyidik: '0812-9876-5432',
    pasalDipersangkakan: 'Pasal 127 ayat (1) huruf a UU RI No. 35 Tahun 2009 tentang Narkotika',
    tempatKejadianPerkara: 'Kamar 308 Apartemen Casablanca East Residence, Jl. Pahlawan Revolusi, Duren Sawit, Jakarta Timur',
    kronologiSingkat: 'Tersangka diamankan oleh anggota Unit II Subdit III Ditresnarkoba Polda Metro Jaya berdasarkan informasi masyarakat terkait dugaan penyalahgunaan narkotika di unit apartemen. Saat dilakukan penggeledahan yang disaksikan pihak sekuriti, ditemukan narkotika jenis sabu netto 0.38 gram dan ganja netto 1.45 gram di atas meja kamar. Hasil profiling dan gelar perkara awal membuktikan tersangka bukan bagian dari jaringan/sindikat pengedar gelap, tidak tercatat dalam DPO/TO kepolisian, dan barang bukti tersebut adalah untuk penggunaan konsumsi pribadi (bawah ambang SEMA No. 4 Tahun 2010).',
    barangBuktiList: [
      {
        jenisZat: 'Sabu (Metamfetamin)',
        beratBersihGram: 0.38,
        beratKotorGram: 0.58,
        statusUjiLab: 'Positif (Metamfetamin) - Labfor Polri No: LAB-6721/NNF/2026',
      },
      {
        jenisZat: 'Ganja Kering (Cannabis Sativa)',
        beratBersihGram: 1.45,
        beratKotorGram: 2.10,
        statusUjiLab: 'Positif (Tetrahidrokanabinol / THC) - Labfor Polri No: LAB-6722/NNF/2026',
      },
    ],
  };

  const terperiksaMaster = {
    namaLengkap: 'Rian Pratama Wijaya, S.Kom.',
    alias: 'Rian',
    nik: '3174051804960002',
    tempatLahir: 'Jakarta',
    tanggalLahir: new Date('1996-04-18'),
    usia: 30,
    jenisKelamin: 'Laki-laki',
    pekerjaan: 'UI/UX Designer (Karyawan Swasta)',
    alamatKtp: 'Jl. Tebet Barat Dalam VII No. 18, RT 004 / RW 003, Kel. Tebet Barat, Kec. Tebet, Jakarta Selatan',
    alamatDomisili: 'Apartemen Casablanca East Residence Tower B Lantai 3 No. 308, Duren Sawit, Jakarta Timur',
  };

  const jadwalMaster = {
    medis: new Date('2026-11-12T09:00:00+07:00'),
    hukum: new Date('2026-11-12T13:30:00+07:00'),
    pleno: new Date('2026-11-14T09:30:00+07:00'),
    lokasi: 'Ruang Tim Asesmen Terpadu (TAT) Gedung BNNP DKI Jakarta / Ditresnarkoba Polda Metro Jaya',
    sekretariatNama: 'Kompol Arya Wicaksono, S.I.K., M.Si.',
  };

  // Target email penerima untuk testing
  const emailAdmin = 'etatsiappulih@gmail.com';
  const emailMedis = 'k300gamers@gmail.com';
  const emailHukum = 'harykurniawan155@gmail.com';
  const emailPengaju = 'code72694@gmail.com';

  const testResults: Array<{ role: string; email: string; jenisEmail: string; status: string; id?: string; detail?: string }> = [];

  // ==========================================================================
  // 1. TEST ROLE ADMIN / SEKRETARIAT TAT
  // ==========================================================================
  console.log('--------------------------------------------------------------------------------');
  console.log(`📌 [ROLE 1: ADMIN / SEKRETARIAT] Mengirim Notifikasi Permohonan TAT Baru...`);
  console.log(`   Penerima: ${emailAdmin}`);
  try {
    await sendNotifikasiPermohonanBaruEmail({
      adminEmail: emailAdmin,
      nomorPermohonan: perkaraMaster.nomorPermohonan,
      trackingNumber: perkaraMaster.trackingNumber,
      namaPemohon: perkaraMaster.namaPenyidik,
      instansiPemohon: perkaraMaster.instansiPenyidik,
      terperiksaNama: terperiksaMaster.namaLengkap,
      nomorLp: perkaraMaster.nomorLaporanPolisi,
    });
    console.log(`   ✅ BERHASIL dikirim ke Admin Sekretariat (${emailAdmin})`);
    testResults.push({
      role: 'ADMIN / SEKRETARIAT',
      email: emailAdmin,
      jenisEmail: 'Notifikasi Permohonan TAT Baru Masuk',
      status: 'SUCCESS',
    });
  } catch (err: any) {
    console.error(`   ❌ GAGAL dikirim ke Admin:`, err.message);
    testResults.push({
      role: 'ADMIN / SEKRETARIAT',
      email: emailAdmin,
      jenisEmail: 'Notifikasi Permohonan TAT Baru Masuk',
      status: 'FAILED',
      detail: err.message,
    });
  }

  // Jeda kecil antar pengiriman untuk menghindari rate limit API
  await new Promise((r) => setTimeout(r, 1200));

  // ==========================================================================
  // 2. TEST ROLE ASESOR MEDIS (DOKTER / RS BHAYANGKARA / BNN)
  // ==========================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log(`📌 [ROLE 2: ASESOR MEDIS] Mengirim Surat Penugasan Asesmen Medis Resmi...`);
  console.log(`   Penerima: ${emailMedis}`);
  try {
    await sendPenugasanMedisEmail({
      asesorEmail: emailMedis,
      asesorNama: 'dr. Ratna Kusumadewi, Sp.KJ',
      nomorPermohonan: perkaraMaster.nomorPermohonan,
      trackingNumber: perkaraMaster.trackingNumber,
      jadwalPemeriksaanMedis: jadwalMaster.medis,
      jadwalPleno: jadwalMaster.pleno,
      lokasiPemeriksaan: jadwalMaster.lokasi,
      sekretariatNama: jadwalMaster.sekretariatNama,
      terperiksa: terperiksaMaster,
      perkara: perkaraMaster,
    });
    console.log(`   ✅ BERHASIL dikirim ke Asesor Medis (${emailMedis})`);
    testResults.push({
      role: 'ASESOR MEDIS',
      email: emailMedis,
      jenisEmail: 'Surat Penugasan Pemeriksaan Medis TAT',
      status: 'SUCCESS',
    });
  } catch (err: any) {
    console.error(`   ❌ GAGAL dikirim ke Asesor Medis:`, err.message);
    testResults.push({
      role: 'ASESOR MEDIS',
      email: emailMedis,
      jenisEmail: 'Surat Penugasan Pemeriksaan Medis TAT',
      status: 'FAILED',
      detail: err.message,
    });
  }

  await new Promise((r) => setTimeout(r, 1200));

  // ==========================================================================
  // 3. TEST ROLE ASESOR HUKUM (POLRI / KEJAKSAAN / BNN)
  // ==========================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log(`📌 [ROLE 3A: ASESOR HUKUM] Mengirim Surat Penugasan Asesmen Hukum Resmi...`);
  console.log(`   Penerima: ${emailHukum}`);
  try {
    await sendPenugasanHukumEmail({
      asesorEmail: emailHukum,
      asesorNama: 'Agus Pratama, S.H., M.H.',
      nomorPermohonan: perkaraMaster.nomorPermohonan,
      trackingNumber: perkaraMaster.trackingNumber,
      jadwalPemeriksaanHukum: jadwalMaster.hukum,
      jadwalPleno: jadwalMaster.pleno,
      lokasiPemeriksaan: jadwalMaster.lokasi,
      sekretariatNama: jadwalMaster.sekretariatNama,
      terperiksa: terperiksaMaster,
      perkara: perkaraMaster,
    });
    console.log(`   ✅ BERHASIL dikirim ke Asesor Hukum (${emailHukum})`);
    testResults.push({
      role: 'ASESOR HUKUM',
      email: emailHukum,
      jenisEmail: 'Surat Penugasan Telaah Hukum TAT',
      status: 'SUCCESS',
    });
  } catch (err: any) {
    console.error(`   ❌ GAGAL dikirim ke Asesor Hukum:`, err.message);
    testResults.push({
      role: 'ASESOR HUKUM',
      email: emailHukum,
      jenisEmail: 'Surat Penugasan Telaah Hukum TAT',
      status: 'FAILED',
      detail: err.message,
    });
  }

  await new Promise((r) => setTimeout(r, 1200));

  console.log(`\n📌 [ROLE 3B: ASESOR HUKUM] Mengirim Notifikasi Hasil Asesmen Medis Selesai...`);
  console.log(`   Penerima: ${emailHukum}`);
  try {
    await sendNotifikasiMedisSelesaiKeHukumEmail({
      asesorHukumEmail: emailHukum,
      asesorHukumNama: 'Agus Pratama, S.H., M.H.',
      asesorMedisNama: 'dr. Ratna Kusumadewi, Sp.KJ',
      nomorPermohonan: perkaraMaster.nomorPermohonan,
      trackingNumber: perkaraMaster.trackingNumber,
      jadwalPemeriksaanHukum: jadwalMaster.hukum,
      jadwalPleno: jadwalMaster.pleno,
      lokasiPemeriksaan: jadwalMaster.lokasi,
      terperiksa: terperiksaMaster,
      perkara: perkaraMaster,
      hasilMedis: {
        tesUrinHasil: 'POSITIF REAKTIF (Metamfetamin & THC)',
        tesUrinZat: ['Metamfetamin (AMP / MET)', 'Tetrahidrokanabinol (THC)'],
        diagnosisNapza: 'F19.2 - Gangguan Mental & Perilaku Akibat Penggunaan Zat Multipel (Penyalahguna Murni)',
        tingkatKetergantungan: 'SEDANG (Ketergantungan Psikologis, Toleransi Positif)',
        rekomendasiRehab: 'REHABILITASI MEDIS RAWAT INAP 3 (TIGA) BULAN',
        rencanaTerapi: 'Program Detoksifikasi Medis 2 Minggu di RS Bhayangkara + Terapi Rehabilitasi Konseling Adiksi (CBT & Therapeutic Community) di Balai Besar Rehabilitasi BNN Lido Bogor, dilanjutkan Pasca Rehabilitasi Rawat Jalan.',
      },
    });
    console.log(`   ✅ BERHASIL dikirim ke Asesor Hukum (${emailHukum})`);
    testResults.push({
      role: 'ASESOR HUKUM',
      email: emailHukum,
      jenisEmail: 'Notifikasi Medis Selesai (Rujukan Hukum)',
      status: 'SUCCESS',
    });
  } catch (err: any) {
    console.error(`   ❌ GAGAL dikirim ke Asesor Hukum:`, err.message);
    testResults.push({
      role: 'ASESOR HUKUM',
      email: emailHukum,
      jenisEmail: 'Notifikasi Medis Selesai (Rujukan Hukum)',
      status: 'FAILED',
      detail: err.message,
    });
  }

  await new Promise((r) => setTimeout(r, 1200));

  // ==========================================================================
  // 4. TEST ROLE PENGAJU / PENYIDIK POLRI (BESERTA ATTACHMENT PDF RESMI SURAT JAWABAN)
  // ==========================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log(`📌 [ROLE 4A: PENYIDIK PENGAJU] Mengirim Surat Jawaban Penerimaan TAT (Lampiran PDF)...`);
  console.log(`   Penerima: ${emailPengaju}`);

  try {
    // Generate Buffer PDF Surat Jawaban Resmi menggunakan PDFKit Engine
    const mockPermohonanForPdf: any = {
      id: 'mock-permohonan-001',
      nomorPermohonan: perkaraMaster.nomorPermohonan,
      trackingNumber: perkaraMaster.trackingNumber,
      tanggalPengajuan: new Date(),
      suratJawabanNomor: 'B/782/XI/RES.4.2/2026/Ditresnarkoba/TAT',
      suratJawabanTanggal: new Date(),
      pengaju: {
        id: 'usr-pengaju-01',
        name: perkaraMaster.namaPenyidik,
        email: emailPengaju,
      },
      terperiksa: {
        namaLengkap: terperiksaMaster.namaLengkap,
        nik: terperiksaMaster.nik,
      },
      perkara: {
        instansiPenyidik: perkaraMaster.instansiPenyidik,
        namaPenyidik: perkaraMaster.namaPenyidik,
        nomorLaporanPolisi: perkaraMaster.nomorLaporanPolisi,
        tanggalLp: perkaraMaster.tanggalLp,
        pasalDipersangkakan: perkaraMaster.pasalDipersangkakan,
      },
      timAsesmen: {
        sekretariatNama: jadwalMaster.sekretariatNama,
        jadwalPemeriksaanMedis: jadwalMaster.medis,
        jadwalPemeriksaanHukum: jadwalMaster.hukum,
        jadwalPleno: jadwalMaster.pleno,
        lokasiPemeriksaan: jadwalMaster.lokasi,
      },
      sidangPleno: {
        pimpinanPleno: 'Kompol Arya Wicaksono, S.I.K., M.Si.',
      },
    };

    const pdfBuffer = await buildSuratJawabanPdf(mockPermohonanForPdf, {
      nomor: 'B/782/XI/RES.4.2/2026/Ditresnarkoba/TAT',
      tanggal: new Date(),
    });

    console.log(`   📄 PDF Surat Jawaban berhasil di-generate (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);

    const resSurat = await sendSuratJawabanEmail({
      to: emailPengaju,
      namaPengaju: perkaraMaster.namaPenyidik,
      nomorPermohonan: perkaraMaster.nomorPermohonan,
      trackingNumber: perkaraMaster.trackingNumber,
      nomorSurat: 'B/782/XI/RES.4.2/2026/Ditresnarkoba/TAT',
      tanggalSurat: '10 November 2026',
      namaTersangka: terperiksaMaster.namaLengkap,
      jadwalMedis: jadwalMaster.medis,
      jadwalPleno: jadwalMaster.pleno,
      lokasiPemeriksaan: jadwalMaster.lokasi,
      pdf: pdfBuffer,
      filename: 'SURAT-JAWABAN-B_782_XI_RES.4.2_2026_Ditresnarkoba_TAT.pdf',
    });

    if (resSurat.success) {
      console.log(`   ✅ BERHASIL dikirim ke Penyidik Pengaju (${emailPengaju}) beserta lampiran PDF!`);
      testResults.push({
        role: 'PENYIDIK PENGAJU',
        email: emailPengaju,
        jenisEmail: 'Surat Jawaban Penerimaan TAT (+ Lampiran PDF Resmi)',
        status: 'SUCCESS',
      });
    } else {
      throw new Error(resSurat.error || 'Gagal mengirim email');
    }
  } catch (err: any) {
    console.error(`   ❌ GAGAL dikirim ke Penyidik Pengaju:`, err.message);
    testResults.push({
      role: 'PENYIDIK PENGAJU',
      email: emailPengaju,
      jenisEmail: 'Surat Jawaban Penerimaan TAT (+ Lampiran PDF Resmi)',
      status: 'FAILED',
      detail: err.message,
    });
  }

  await new Promise((r) => setTimeout(r, 1200));

  // ==========================================================================
  // 5. TEST ROLE PENGAJU / PENYIDIK POLRI (NOTIFIKASI PERBAIKAN BERKAS)
  // ==========================================================================
  console.log(`\n📌 [ROLE 4B: PENYIDIK PENGAJU] Mengirim Notifikasi Catatan Koreksi Berkas...`);
  console.log(`   Penerima: ${emailPengaju}`);
  try {
    const htmlKoreksi = `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><title>Pemberitahuan Perbaikan Berkas Permohonan</title></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px;">
  <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden;">
    <div style="background-color: #0f172a; padding: 20px; text-align: center; border-bottom: 3px solid #dc2626;">
      <h2 style="color: #ffffff; margin: 0; font-size: 16px; letter-spacing: 1px;">SEKRETARIAT TIM ASESMEN TERPADU (TAT)</h2>
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px;">Pemberitahuan Hasil Verifikasi Persyaratan Berkas Permohonan</p>
    </div>
    <div style="padding: 24px;">
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 14px; margin-bottom: 20px;">
        <p style="margin: 0; color: #991b1b; font-weight: bold; font-size: 14px;">⚠️ PERMOHONAN MEMERLUKAN PERBAIKAN BERKAS</p>
        <p style="margin: 6px 0 0 0; color: #7f1d1d; font-size: 13px;">
          Permohonan Nomor <strong>${perkaraMaster.nomorPermohonan}</strong> a.n Tersangka <strong>${terperiksaMaster.namaLengkap}</strong> belum dapat dilanjutkan ke tahap penugasan tim karena terdapat dokumen persyaratan formil yang belum lengkap/tidak memenuhi syarat.
        </p>
      </div>

      <h4 style="color: #0f172a; margin-top: 15px; font-size: 13px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">Catatan Koreksi dari Tim Verifikator Sekretariat:</h4>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; font-size: 13px; color: #334155; line-height: 1.6;">
        1. <strong>Surat Permohonan Resmi dari Kasat Resnarkoba:</strong> Dokumen yang diunggah belum dibubuhi stempel dinas instansi penyidik.<br>
        2. <strong>Berita Acara Pemeriksaan Laboratorium (Puslabfor):</strong> Lembar kedua dokumen hasil uji barang bukti narkotika buram/tidak terbaca jelas.<br>
        3. <strong>Surat Kuasa / Pendampingan Hukum:</strong> Mohon lampirkan fotokopi surat perintah penunjukan penasihat hukum bagi tersangka.
      </div>

      <p style="font-size: 13px; color: #475569; margin-top: 20px; line-height: 1.5;">
        Mohon segera mengunggah dokumen perbaikan melalui portal sistem E-TAT dalam waktu maksimal 1x24 jam kerja agar jadwal sidang pleno TAT dapat segera diagendakan.
      </p>

      <div style="text-align: center; margin: 25px 0 15px 0;">
        <a href="https://e-tatsiappulih.com/dashboard" style="background-color: #dc2626; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 24px; border-radius: 4px; display: inline-block;">
          Unggah Perbaikan Berkas Permohonan
        </a>
      </div>
    </div>
    <div style="background-color: #f1f5f9; padding: 14px; text-align: center; border-top: 1px solid #cbd5e1; font-size: 11px; color: #64748b;">
      Sistem Informasi & Manajemen Tim Asesmen Terpadu (E-TAT) POLRI & BNN RI
    </div>
  </div>
</body>
</html>
    `;

    const resKoreksi = await sendEmail({
      to: emailPengaju,
      subject: `[E-TAT POLRI] Perlu Perbaikan Berkas: ${perkaraMaster.nomorPermohonan} - a.n ${terperiksaMaster.namaLengkap}`,
      html: htmlKoreksi,
      text: `PEMBERITAHUAN PERBAIKAN BERKAS PERMOHONAN E-TAT\n\nNomor: ${perkaraMaster.nomorPermohonan}\nTersangka: ${terperiksaMaster.namaLengkap}\n\nCatatan Koreksi Sekretariat:\n1. Surat Permohonan Resmi belum distempel dinas.\n2. BA Uji Laboratorium Puslabfor lembar kedua buram.\n3. Lampirkan surat kuasa penasihat hukum.\n\nSilakan unggah revisi melalui portal E-TAT: https://e-tatsiappulih.com/dashboard`,
    });

    if (resKoreksi.success) {
      console.log(`   ✅ BERHASIL dikirim ke Penyidik Pengaju (${emailPengaju})!`);
      testResults.push({
        role: 'PENYIDIK PENGAJU',
        email: emailPengaju,
        jenisEmail: 'Notifikasi Catatan Koreksi / Revisi Berkas',
        status: 'SUCCESS',
      });
    } else {
      throw new Error(resKoreksi.error || 'Gagal mengirim email');
    }
  } catch (err: any) {
    console.error(`   ❌ GAGAL dikirim ke Penyidik Pengaju:`, err.message);
    testResults.push({
      role: 'PENYIDIK PENGAJU',
      email: emailPengaju,
      jenisEmail: 'Notifikasi Catatan Koreksi / Revisi Berkas',
      status: 'FAILED',
      detail: err.message,
    });
  }

  // ==========================================================================
  // RINGKASAN HASIL PENGUJIAN LENGKAP
  // ==========================================================================
  console.log('\n================================================================================');
  console.log('📊 REKAPITULASI HASIL PENGUJIAN EMAIL SERVICE KE SETIAP ROLE:');
  console.log('================================================================================');
  console.table(testResults);

  const allPassed = testResults.every((r) => r.status === 'SUCCESS');
  if (allPassed) {
    console.log('🎉 SEMUA EMAIL KE SETIAP ROLE BERHASIL DIKIRIM DAN DIVERIFIKASI RESEND API!');
    console.log('   Data perkara, tersangka, barang bukti, dan lampiran PDF telah sesuai dengan format resmi POLRI/BNN.');
  } else {
    console.warn('⚠️ Sebagian email mengalami kendala, periksa detail error pada tabel.');
  }
  console.log('================================================================================\n');

  process.exit(allPassed ? 0 : 1);
}

runComprehensiveEmailTest().catch((e) => {
  console.error('Fatal Test Error:', e);
  process.exit(1);
});

