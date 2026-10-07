import { sendPenugasanHukumEmail, sendNotifikasiMedisSelesaiKeHukumEmail } from './services/email.service';

async function testSendKeHukum() {
  const hukumEmail = 'harykurniawan155@gmail.com';
  const hukumNama = 'Agus Pratama, S.H., M.H.';

  console.log(`🚀 Mengirim email penugasan & notifikasi ke Asesor Hukum: ${hukumEmail}...\n`);

  // 1. Kirim Email Penugasan Asesmen Hukum
  console.log('1. Mengirim Email [Penugasan Asesmen Hukum]...');
  await sendPenugasanHukumEmail({
    asesorEmail: hukumEmail,
    asesorNama: hukumNama,
    nomorPermohonan: 'TAT/2026/10/0008',
    trackingNumber: 'TRK-20261007-8899',
    jadwalPemeriksaanHukum: new Date(Date.now() + 24 * 3600 * 1000), // Besok
    jadwalPleno: new Date(Date.now() + 48 * 3600 * 1000), // Lusa
    lokasiPemeriksaan: 'Ruang Rapat Tim Asesmen Terpadu (TAT) Gedung Ditresnarkoba Polda',
    sekretariatNama: 'Kompol Arya Wicaksono, S.I.K.',
    terperiksa: {
      namaLengkap: 'Rian Saputra',
      alias: 'Rian',
      nik: '3171012304950002',
      usia: 28,
      jenisKelamin: 'Laki-laki',
      pekerjaan: 'Karyawan Swasta',
      alamatKtp: 'Jl. Tebet Raya No. 12, Jakarta Selatan',
    },
    perkara: {
      nomorLaporanPolisi: 'LP/A/112/X/2026/SPKT/POLDA',
      tanggalLp: new Date(),
      instansiPenyidik: 'Ditresnarkoba Polda Metro Jaya',
      namaPenyidik: 'Ipda Budi Santoso, S.H.',
      nomorHpPenyidik: '081298765432',
      pasalDipersangkakan: 'Pasal 127 ayat (1) huruf a UU No. 35 Tahun 2009 tentang Narkotika',
      tempatKejadianPerkara: 'Sebuah apartemen di kawasan Kuningan, Jakarta Selatan',
      kronologiSingkat: 'Terperiksa diamankan saat penggeledahan dan ditemukan memiliki barang bukti sabu dengan berat netto 0.35 gram untuk pemakaian pribadi (bukan pengedar/sindikat).',
      barangBuktiList: [
        {
          jenisZat: 'Sabu (Metamfetamin)',
          beratBersihGram: 0.35,
          beratKotorGram: 0.52,
          statusUjiLab: 'positif',
        },
      ],
    },
  });

  // Tunggu 1.5 detik
  await new Promise((r) => setTimeout(r, 1500));

  // 2. Kirim Email Notifikasi Asesmen Medis Selesai ke Asesor Hukum
  console.log('\n2. Mengirim Email [Asesmen Medis Selesai - Telaah Hukum]...');
  await sendNotifikasiMedisSelesaiKeHukumEmail({
    asesorHukumEmail: hukumEmail,
    asesorHukumNama: hukumNama,
    asesorMedisNama: 'dr. Ratna Sp.KJ',
    nomorPermohonan: 'TAT/2026/10/0008',
    trackingNumber: 'TRK-20261007-8899',
    jadwalPemeriksaanHukum: new Date(Date.now() + 24 * 3600 * 1000),
    jadwalPleno: new Date(Date.now() + 48 * 3600 * 1000),
    lokasiPemeriksaan: 'Ruang Rapat Tim Asesmen Terpadu (TAT) Gedung Ditresnarkoba Polda',
    terperiksa: {
      namaLengkap: 'Rian Saputra',
      alias: 'Rian',
      nik: '3171012304950002',
      usia: 28,
      jenisKelamin: 'Laki-laki',
    },
    hasilMedis: {
      tesUrinHasil: 'POSITIF (Reaktif)',
      tesUrinZat: ['Metamfetamin (AMP / MET)', 'Benzodiazepin (BZO)'],
      diagnosisNapza: 'F19.2 - Gangguan mental dan perilaku akibat penggunaan zat multipel (Kategori Penyalahguna)',
      tingkatKetergantungan: 'SEDANG (Ketergantungan Psikologis)',
      rekomendasiRehab: 'REHABILITASI MEDIS RAWAT INAP 3 BULAN',
      rencanaTerapi: 'Program Detoksifikasi Medis + Terapi Perilaku Kognitif (CBT) di Balai Rehabilitasi BNN',
    },
  });

  console.log('\n✅ Semua email uji ke akun hukum berhasil diproses!');
  process.exit(0);
}

testSendKeHukum().catch((err) => {
  console.error('💥 Gagal mengirim email ke akun hukum:', err);
  process.exit(1);
});
