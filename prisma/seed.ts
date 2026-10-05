import { PrismaClient, UserRole, ApplicationStatus, AssessmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for POLRI E-TAT...');

  const passwordHash = await bcrypt.hash('password123', 12);

  // 1. Seed 4 Canonical Role Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'sekretariat@polri.go.id' },
    update: {},
    create: {
      email: 'sekretariat@polri.go.id',
      password: passwordHash,
      role: UserRole.ADMIN,
      name: 'Kompol Arya Wicaksono, S.I.K.',
      nip: '79080512',
      agency: 'Sekretariat TAT Polda Metro Jaya',
      position: 'Ketua Tim Sekretariat TAT',
      phone: '081234567890',
    },
  });
  console.log('✔ User Sekretariat (Admin) created:', adminUser.email);

  const pengajuUser = await prisma.user.upsert({
    where: { email: 'penyidik@polres.go.id' },
    update: {},
    create: {
      email: 'penyidik@polres.go.id',
      password: passwordHash,
      role: UserRole.PENGAJU,
      name: 'Ipda Budi Santoso, S.H.',
      nip: '85010234',
      agency: 'Satresnarkoba Polres Metro Jakarta Pusat',
      position: 'Penyidik Pembantu Unit I',
      phone: '081298765432',
    },
  });
  console.log('✔ User Pengaju (Penyidik) created:', pengajuUser.email);

  const medisUser = await prisma.user.upsert({
    where: { email: 'medis@tat.go.id' },
    update: {},
    create: {
      email: 'medis@tat.go.id',
      password: passwordHash,
      role: UserRole.MEDIS,
      name: 'dr. Ratna Sp.KJ',
      nip: '198205122008012001',
      agency: 'BNNP DKI Jakarta / RS Pengayoman',
      position: 'Dokter Asesor Medis TAT',
      phone: '081311223344',
    },
  });
  console.log('✔ User Asesor Medis created:', medisUser.email);

  const hukumUser = await prisma.user.upsert({
    where: { email: 'hukum@tat.go.id' },
    update: {},
    create: {
      email: 'hukum@tat.go.id',
      password: passwordHash,
      role: UserRole.HUKUM,
      name: 'Agus Pratama, S.H., M.H.',
      nip: '197903152003121002',
      agency: 'Kejaksaan Tinggi DKI Jakarta',
      position: 'Jaksa Pratama / Asesor Hukum TAT',
      phone: '081399887766',
    },
  });
  console.log('✔ User Asesor Hukum created:', hukumUser.email);

  // 2. Seed Sample Permohonan Asesmen
  const existingPermohonan = await prisma.permohonanAsesmen.findFirst({
    where: { nomorPermohonan: 'TAT/2026/10/0001' },
  });

  if (!existingPermohonan) {
    const samplePermohonan = await prisma.permohonanAsesmen.create({
      data: {
        nomorPermohonan: 'TAT/2026/10/0001',
        trackingNumber: 'TRACK-202610-001',
        satuanKerjaTujuan: 'BNNP DKI Jakarta',
        pengajuId: pengajuUser.id,
        instansiPengaju: pengajuUser.agency || 'Satresnarkoba',
        applicationStatus: ApplicationStatus.IN_ASSESSMENT,
        medicalStatus: AssessmentStatus.IN_PROGRESS,
        legalStatus: AssessmentStatus.NOT_STARTED,
        tenggatSlaTanggal: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 hari ke depan (SLA 6 hari)
        isMendekatiTenggat: false,
        terperiksa: {
          create: {
            namaLengkap: 'Rian Saputra',
            alias: 'Rian Bin Slamet',
            nik: '3171012345670001',
            isNikVerified: true,
            tempatLahir: 'Jakarta',
            tanggalLahir: new Date('1998-05-14'),
            usia: 28,
            jenisKelamin: 'Laki-laki',
            pekerjaan: 'Wiraswasta',
            alamatKtp: 'Jl. Kemayoran No. 12, Jakarta Pusat',
            namaWaliPendamping: 'Siti Aminah',
            kontakWali: '081288889999',
          },
        },
        perkara: {
          create: {
            nomorLaporanPolisi: 'LP/A/142/X/2026/SPKT.SATRESNARKOBA',
            tanggalLp: new Date('2026-10-01'),
            instansiPenyidik: 'Satresnarkoba Polres Metro Jakarta Pusat',
            namaPenyidik: pengajuUser.name,
            nomorHpPenyidik: '081298765432',
            pasalDipersangkakan: 'Pasal 127 ayat (1) huruf a UU No. 35 Tahun 2009 tentang Narkotika',
            tempatKejadianPerkara: 'Hotel Grand Menteng Lt. 4 Kamar 402, Jakarta Pusat',
            tanggalWaktuPenangkapan: new Date('2026-10-01T23:30:00Z'),
            kronologiSingkat:
              'Terperiksa diamankan saat penggerebekan di kamar hotel bersama barang bukti sabu sisa pakai. Terperiksa mengaku menggunakan sabu untuk pemakaian pribadi.',
            barangBuktiList: {
              create: [
                {
                  jenisZat: 'Metamfetamina (Sabu)',
                  beratKotorGram: 0.45,
                  beratBersihGram: 0.28,
                  statusUjiLab: 'positif',
                  nomorSuratLab: 'LAB-NNK/X/2026/089',
                  keterangan: '1 bungkus plastik klip berisi kristal putih',
                },
              ],
            },
          },
        },
        timAsesmen: {
          create: {
            sekretariatId: adminUser.id,
            sekretariatNama: adminUser.name,
            asesorMedisId: medisUser.id,
            asesorMedisNama: medisUser.name,
            asesorHukumId: hukumUser.id,
            asesorHukumNama: hukumUser.name,
            jadwalPemeriksaanMedis: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            jadwalPemeriksaanHukum: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            lokasiPemeriksaan: 'Ruang TAT BNNP DKI Jakarta',
          },
        },
        asesmenMedis: {
          create: {
            asesorId: medisUser.id,
            asesorNama: medisUser.name,
            status: AssessmentStatus.IN_PROGRESS,
            kondisiFisik: 'Baik, kesadaran compos mentis, tidak ditemukan luka traumatis akut',
            tekananDarah: '120/80 mmHg',
            denyutNadi: '82 bpm',
            tandaBekasSuntikan: false,
            komorbiditasMedis: 'Tidak ada penyakit penyerta yang signifikan',
            kondisiPsikologis: 'Cemas ringan menghadapi proses hukum, kontak mata adekuat',
            instrumen: 'ASSIST',
            skorInstrumen: 18.0,
            tingkatRisikoInstrumen: 'Sedang (Moderate Risk)',
            diagnosisKlinisIcd: 'F15.1 Gangguan Penggunaan Stimulan Kategori Ringan-Sedang',
            interpretasiKlinis: 'Memerlukan intervensi rehabilitasi rawat jalan intensif',
            kebutuhanRawat: 'Rawat Jalan',
            durasiUsulanBulan: 3,
            hasilUrin: {
              create: [
                { parameter: 'MET', hasil: 'Positif' },
                { parameter: 'AMP', hasil: 'Positif' },
                { parameter: 'THC', hasil: 'Negatif' },
                { parameter: 'BZO', hasil: 'Negatif' },
                { parameter: 'MOP', hasil: 'Negatif' },
              ],
            },
            riwayatZat: {
              create: [
                {
                  jenisZat: 'Sabu (Metamfetamina)',
                  caraPakai: 'Hisap (Bong)',
                  frekuensi: '1-2 kali seminggu',
                  lamaPemakaianBulan: 8,
                  terakhirPakai: '1 hari sebelum penangkapan',
                },
              ],
            },
          },
        },
        asesmenHukum: {
          create: {
            asesorId: hukumUser.id,
            asesorNama: hukumUser.name,
            status: AssessmentStatus.IN_PROGRESS,
            pernahDitangkap: false,
            terverifikasiDatabase: true,
            analisisPeran: 'Pecandu_Penyalahguna',
            argumentasiPeran:
              'Barang bukti di bawah 1 gram (0.28 gram), tidak ditemukan alat timbangan digital atau uang hasil penjualan, tidak terindikasi jaringan pengedar.',
            faktaPendukung: [
              'Barang bukti netto 0.28 gram sesuai SEMA No. 4 Tahun 2010',
              'Hasil tes urine terbukti positif metamfetamin',
              'Tidak ditemukan catatan kriminalitas sebelumnya (residivisme negatif)',
            ],
            kesimpulanHukum: 'Memenuhi kriteria penyalahguna narkotika murni untuk diri sendiri',
            rekomendasiHukum: 'Lanjut_Peradilan_Rehab',
          },
        },
      },
    });

    console.log('✔ Sample permohonan asesmen created:', samplePermohonan.nomorPermohonan);
  }

  console.log('✨ Seeding completed successfully!');
  console.log('--------------------------------------------------');
  console.log('Login credentials for all 4 roles:');
  console.log('1. Sekretariat (Admin) : sekretariat@polri.go.id | password123');
  console.log('2. Pengaju (Penyidik)  : penyidik@polres.go.id     | password123');
  console.log('3. Asesor Medis        : medis@tat.go.id          | password123');
  console.log('4. Asesor Hukum        : hukum@tat.go.id          | password123');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
