import { sendPenugasanMedisEmail } from './services/email.service';

async function testSendKeMedis() {
  const medisEmail = 'k300gamers@gmail.com';
  const medisNama = 'dr. Ratna Sp.KJ';

  console.log(`🚀 Mengirim email penugasan ke Asesor Medis: ${medisEmail}...\n`);

  await sendPenugasanMedisEmail({
    asesorEmail: medisEmail,
    asesorNama: medisNama,
    nomorPermohonan: 'TAT/2026/10/0008',
    trackingNumber: 'TRK-20261007-8899',
    jadwalPemeriksaanMedis: new Date(Date.now() + 20 * 3600 * 1000), // Besok pagi
    jadwalPleno: new Date(Date.now() + 48 * 3600 * 1000),
    lokasiPemeriksaan: 'Klinik Pratama & Lab Narkotika BNN / RS Bhayangkara',
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
      kronologiSingkat: 'Terperiksa diamankan saat penggeledahan dan ditemukan memiliki barang bukti sabu dengan berat netto 0.35 gram untuk pemakaian pribadi.',
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

  console.log('✅ Email penugasan medis berhasil dikirim!');
  process.exit(0);
}

testSendKeMedis().catch((err) => {
  console.error('💥 Gagal mengirim email ke akun medis:', err);
  process.exit(1);
});
