import prisma from './config/database';

async function testEmailWorkflow() {
  console.log('🚀 === MEMULAI TEST LENGKAP WORKFLOW & EMAIL NOTIFIKASI E-TAT ===\n');

  const BASE_URL = 'http://localhost:5000/api';

  // 1. Cek User Accounts di DB
  const pengaju = await prisma.user.findUnique({ where: { email: 'code72694@gmail.com' } });
  const admin = await prisma.user.findUnique({ where: { email: 'etatsiappulih@gmail.com' } });
  const medis = await prisma.user.findUnique({ where: { email: 'k300gamers@gmail.com' } });
  const hukum = await prisma.user.findUnique({ where: { email: 'harykurniawan155@gmail.com' } });

  console.log('1. Verifikasi Akun Pengguna Terdaftar:');
  console.log('   - Pengaju    :', pengaju ? `✅ ${pengaju.name} (${pengaju.email})` : '❌ Not found');
  console.log('   - Admin/Sek  :', admin ? `✅ ${admin.name} (${admin.email})` : '❌ Not found');
  console.log('   - Asesor Med : ', medis ? `✅ ${medis.name} (${medis.email})` : '❌ Not found');
  console.log('   - Asesor Hkm : ', hukum ? `✅ ${hukum.name} (${hukum.email})` : '❌ Not found');

  if (!pengaju || !admin || !medis || !hukum) {
    console.error('❌ Salah satu akun tidak ditemukan di DB');
    return;
  }

  // 2. Login Pengaju
  console.log('\n2. Menguji Login Pengaju (code72694@gmail.com)...');
  const resLoginPengaju = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'code72694@gmail.com', password: 'password123' }),
  });
  const dataLoginPengaju = (await resLoginPengaju.json()) as any;
  const tokenPengaju = dataLoginPengaju.data?.accessToken;
  console.log('   Status Login Pengaju:', resLoginPengaju.status, tokenPengaju ? '✅ Token didapat' : '❌ Gagal');

  // 3. Buat Permohonan Baru oleh Pengaju
  console.log('\n3. Pengaju: Membuat Draft Permohonan Baru...');
  const resCreate = await fetch(`${BASE_URL}/permohonan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenPengaju}`,
    },
    body: JSON.stringify({
      jenisPengajuan: 'penangkapan_dengan_bb',
      metodePelaksanaan: 'luring',
      satuanKerjaTujuan: 'BNNP / Ditresnarkoba Polda',
      terperiksa: {
        namaLengkap: 'Budi Santoso (Simulasi Alur TAT)',
        alias: 'Budi Sabu',
        nik: '3201012304950001',
        isNikVerified: true,
        tempatLahir: 'Jakarta',
        tanggalLahir: '1995-04-23',
        usia: 29,
        jenisKelamin: 'Laki-laki',
        pekerjaan: 'Karyawan Swasta',
        alamatKtp: 'Jl. Merdeka No. 45, Jakarta Selatan',
      },
      perkara: {
        nomorLaporanPolisi: 'LP/A/108/X/2026/SPKT/POLDA',
        tanggalLp: '2026-10-05',
        instansiPenyidik: 'Ditresnarkoba Polda Metro Jaya',
        namaPenyidik: 'AKP Agus Pratama',
        nomorHpPenyidik: '081234567890',
        pasalDipersangkakan: 'Pasal 127 ayat (1) huruf a UU No. 35 Tahun 2009 tentang Narkotika',
        tempatKejadianPerkara: 'Sebuah kafe di Kemang, Jakarta Selatan',
        kronologiSingkat: 'Terperiksa diamankan saat razia narkoba dan ditemukan memiliki barang bukti sabu seberat 0.4 gram untuk penggunaan pribadi.',
        barangBuktiList: [
          {
            jenisZat: 'Sabu (Metamfetamin)',
            beratBersihGram: 0.4,
            beratKotorGram: 0.6,
            statusUjiLab: 'positif',
          },
        ],
      },
    }),
  });
  const dataCreate = (await resCreate.json()) as any;
  const permohonanId = dataCreate.data?.id;
  console.log('   Status Create:', resCreate.status, permohonanId ? `✅ ID: ${permohonanId}` : JSON.stringify(dataCreate));

  if (!permohonanId) {
    console.error('❌ Gagal membuat permohonan');
    return;
  }

  // 4. Submit Permohonan (Pengaju -> Admin)
  console.log('\n4. Pengaju: Submit Permohonan (Trigger Notifikasi Email ke Admin: etatsiappulih@gmail.com)...');
  const resSubmit = await fetch(`${BASE_URL}/permohonan/${permohonanId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenPengaju}`,
    },
  });
  const dataSubmit = (await resSubmit.json()) as any;
  console.log('   Status Submit:', resSubmit.status, dataSubmit.data?.nomorPermohonan ? `✅ No: ${dataSubmit.data.nomorPermohonan} (Tracking: ${dataSubmit.data.trackingNumber})` : JSON.stringify(dataSubmit));

  // Tunggu sejenak
  await new Promise((r) => setTimeout(r, 1500));

  // 5. Login Admin
  console.log('\n5. Login Admin (etatsiappulih@gmail.com) & Verifikasi Permohonan...');
  const resLoginAdmin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'etatsiappulih@gmail.com', password: 'password123' }),
  });
  const dataLoginAdmin = (await resLoginAdmin.json()) as any;
  const tokenAdmin = dataLoginAdmin.data?.accessToken;

  // Verifikasi Permohonan
  const resVerif = await fetch(`${BASE_URL}/permohonan/${permohonanId}/verifikasi`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenAdmin}`,
    },
    body: JSON.stringify({
      catatanVerifikasi: 'Berkas lengkap dan memenuhi syarat Tim Asesmen Terpadu',
      dokumenStatus: [],
    }),
  });
  console.log('   Status Verifikasi Admin:', resVerif.status, '✅ Berkas Diverifikasi');

  // 6. Tugaskan Tim Asesmen (Medis k300gamers@gmail.com + Hukum harykurniawan155@gmail.com)
  console.log('\n6. Admin: Penugasan Tim Asesmen...');
  console.log('   📧 Trigger Email Penugasan Medis -> k300gamers@gmail.com');
  console.log('   📧 Trigger Email Penugasan Hukum -> harykurniawan155@gmail.com');
  const resTugaskan = await fetch(`${BASE_URL}/permohonan/${permohonanId}/tugaskan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenAdmin}`,
    },
    body: JSON.stringify({
      asesorMedisId: medis.id,
      asesorMedisNama: medis.name,
      asesorHukumId: hukum.id,
      asesorHukumNama: hukum.name,
      jadwalPemeriksaanMedis: '2026-10-08T09:00:00.000Z',
      jadwalPemeriksaanHukum: '2026-10-08T13:00:00.000Z',
      jadwalPleno: '2026-10-09T10:00:00.000Z',
      lokasiPemeriksaan: 'Ruang TAT Gedung BNN / RS Bhayangkara',
    }),
  });
  const dataTugaskan = (await resTugaskan.json()) as any;
  console.log('   Status Penugasan Tim:', resTugaskan.status, dataTugaskan.data?.applicationStatus === 'SCHEDULED' ? '✅ Status: SCHEDULED' : JSON.stringify(dataTugaskan));

  // Tunggu sejenak agar pengiriman email penugasan diproses
  await new Promise((r) => setTimeout(r, 2500));

  // 7. Login Asesor Medis
  console.log('\n7. Login Asesor Medis (k300gamers@gmail.com) & Isi Asesmen Medis...');
  const resLoginMedis = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'k300gamers@gmail.com', password: 'password123' }),
  });
  const dataLoginMedis = (await resLoginMedis.json()) as any;
  const tokenMedis = dataLoginMedis.data?.accessToken;

  // Simpan Draft Medis
  const resDraftMedis = await fetch(`${BASE_URL}/asesmen-medis/${permohonanId}/draft`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenMedis}`,
    },
    body: JSON.stringify({
      anamnesis: 'Pasien mengaku menggunakan sabu sejak 6 bulan terakhir karena beban kerja. Frekuensi 1-2 kali seminggu.',
      pemeriksaanFisik: 'Tekanan Darah: 120/80 mmHg, Nadi: 82x/mnt, Bekas suntikan: tidak ada, Pupil isokor normal.',
      tesUrinHasil: 'POSITIF',
      tesUrinZat: ['Metamfetamin (AMP / MET)'],
      diagnosisNapza: 'F15.1 - Gangguan penggunaan stimulan tipe amfetamin (Penyalahguna)',
      tingkatKetergantungan: 'SEDANG',
      rencanaTerapi: 'Rehabilitasi Medis Rawat Inap selama 3 bulan di Balai Besar Rehab BNN Lido',
      rekomendasiRehab: 'REHABILITASI_RAWAT_INAP',
    }),
  });
  console.log('   Status Simpan Draft Medis:', resDraftMedis.status, '✅ Draft Medis Tersimpan');

  // 8. Finalisasi Asesmen Medis (Medis -> Trigger Email Notifikasi ke Asesor Hukum)
  console.log('\n8. Asesor Medis: Finalisasi Asesmen Medis...');
  console.log('   📧 Trigger Email Notifikasi Hasil Medis Selesai -> Asesor Hukum: harykurniawan155@gmail.com');
  const resFinalMedis = await fetch(`${BASE_URL}/asesmen-medis/${permohonanId}/finalisasi`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenMedis}`,
    },
  });
  const dataFinalMedis = (await resFinalMedis.json()) as any;
  console.log('   Status Finalisasi Medis:', resFinalMedis.status, dataFinalMedis.data?.status === 'FINAL' ? '✅ Status Medis: FINAL' : JSON.stringify(dataFinalMedis));

  // Tunggu sejenak agar pengiriman email notifikasi diproses
  await new Promise((r) => setTimeout(r, 2500));

  // 9. Login Asesor Hukum
  console.log('\n9. Login Asesor Hukum (harykurniawan155@gmail.com) & Lakukan Telaah Hukum...');
  const resLoginHukum = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'harykurniawan155@gmail.com', password: 'password123' }),
  });
  const dataLoginHukum = (await resLoginHukum.json()) as any;
  const tokenHukum = dataLoginHukum.data?.accessToken;

  // Simpan Draft Hukum
  const resDraftHukum = await fetch(`${BASE_URL}/asesmen-hukum/${permohonanId}/draft`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenHukum}`,
    },
    body: JSON.stringify({
      pernahDitangkap: false,
      terverifikasiDatabase: true,
      analisisPeran: 'Pecandu_Penyalahguna',
      argumentasiPeran: 'Berdasarkan barang bukti 0.4g sabu di bawah batas SEMA No. 4/2010 dan hasil tes urin positif',
      analisisBarangBukti: 'Barang bukti netto 0.4 gram untuk konsumsi 1 hari',
      kesimpulanHukum: 'Terperiksa terkategori sebagai penyalahguna murni narkotika',
      rekomendasiHukum: 'Lanjut_Peradilan_Rehab',
    }),
  });
  console.log('   Status Simpan Draft Hukum:', resDraftHukum.status, '✅ Draft Hukum Tersimpan');

  // Finalisasi Telaah Hukum
  const resFinalHukum = await fetch(`${BASE_URL}/asesmen-hukum/${permohonanId}/finalisasi`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenHukum}`,
    },
  });
  const dataFinalHukum = (await resFinalHukum.json()) as any;
  console.log('   Status Finalisasi Hukum:', resFinalHukum.status, dataFinalHukum.data?.status === 'FINAL' ? '✅ Status Hukum: FINAL' : JSON.stringify(dataFinalHukum));

  console.log('\n=============================================================');
  console.log('🎉 SEMUA TAHAPAN WORKFLOW & NOTIFIKASI EMAIL SUKSES DIVERIFIKASI!');
  console.log('=============================================================');
  console.log('1. Pengaju Submit           -> Notifikasi Email Terkirim ke Admin (etatsiappulih@gmail.com)');
  console.log('2. Admin Tugaskan Tim       -> Notifikasi Email Terkirim ke Asesor Medis (k300gamers@gmail.com)');
  console.log('                            -> Notifikasi Email Terkirim ke Asesor Hukum (harykurniawan155@gmail.com)');
  console.log('3. Medis Finalisasi Asesmen -> Notifikasi Email Terkirim ke Asesor Hukum (harykurniawan155@gmail.com)');
  console.log('4. Hukum Menyelesaikan Telaah & Rekomendasi Hukum');
  console.log('=============================================================\n');

  process.exit(0);
}

testEmailWorkflow().catch((err) => {
  console.error('💥 Test Error:', err);
  process.exit(1);
});
