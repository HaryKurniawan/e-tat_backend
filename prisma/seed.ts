import { PrismaClient, UserRole, ApplicationStatus, AssessmentStatus, KategoriInstansi } from '@prisma/client';
import bcrypt from 'bcryptjs';
import process from 'node:process';
import { seedRiwayatData } from './seedRiwayat';
import { seedAktifData } from './seedAktif';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for POLRI E-TAT...');

  const passwordHash = await bcrypt.hash('password123', 12);

  // 1. Seed 4 Canonical Role Users (All with password: password123)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      password: passwordHash,
      name: '[TEST] Admin Sekretariat TAT',
      position: 'Petugas Verifikasi & Sekretariat TAT (Akun Uji)'
    },
    create: {
      email: 'admin@gmail.com',
      password: passwordHash,
      role: UserRole.ADMIN,
      name: '[TEST] Admin Sekretariat TAT',
      nip: '79080512',
      agency: 'Sekretariat TAT Polda Metro Jaya',
      position: 'Petugas Verifikasi & Sekretariat TAT (Akun Uji)',
      phone: '081234567890',
    },
  });
  console.log('✔ User Sekretariat (Admin) created/updated (password: password123):', adminUser.email);

  const pengajuUser = await prisma.user.upsert({
    where: { email: 'pengaju@gmail.com' },
    update: {
      password: passwordHash,
      name: '[TEST] Penyidik Pengaju Satresnarkoba',
      position: 'Penyidik Pemohon Asesmen TAT (Akun Uji)'
    },
    create: {
      email: 'pengaju@gmail.com',
      password: passwordHash,
      role: UserRole.PENGAJU,
      name: '[TEST] Penyidik Pengaju Satresnarkoba',
      nip: '85010234',
      agency: 'Satresnarkoba Polres Metro Jakarta Pusat',
      position: 'Penyidik Pemohon Asesmen TAT (Akun Uji)',
      phone: '081298765432',
    },
  });
  console.log('✔ User Pengaju (Penyidik) created/updated (password: password123):', pengajuUser.email);

  const medisUser = await prisma.user.upsert({
    where: { email: 'medis@gmail.com' },
    update: {
      password: passwordHash,
      name: '[TEST] Dokter Asesor Medis TAT',
      position: 'Dokter Pemeriksa Medis TAT (Akun Uji)'
    },
    create: {
      email: 'medis@gmail.com',
      password: passwordHash,
      role: UserRole.MEDIS,
      name: '[TEST] Dokter Asesor Medis TAT',
      nip: '198205122008012001',
      agency: 'BNNP DKI Jakarta / RS Pengayoman',
      position: 'Dokter Pemeriksa Medis TAT (Akun Uji)',
      phone: '081311223344',
    },
  });
  console.log('✔ User Asesor Medis created/updated (password: password123):', medisUser.email);

  const hukumUser = await prisma.user.upsert({
    where: { email: 'hukum@gmail.com' },
    update: {
      password: passwordHash,
      name: '[TEST] Jaksa Asesor Hukum TAT',
      position: 'Jaksa / Penelaah Hukum TAT (Akun Uji)'
    },
    create: {
      email: 'hukum@gmail.com',
      password: passwordHash,
      role: UserRole.HUKUM,
      name: '[TEST] Jaksa Asesor Hukum TAT',
      nip: '197903152003121002',
      agency: 'Kejaksaan Tinggi DKI Jakarta',
      position: 'Jaksa / Penelaah Hukum TAT (Akun Uji)',
      phone: '081399887766',
    },
  });
  console.log('✔ User Asesor Hukum created/updated (password: password123):', hukumUser.email);

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
        applicationStatus: ApplicationStatus.ASSESSMENT_ACTIVE,
        medicalStatus: AssessmentStatus.DRAFT,
        legalStatus: AssessmentStatus.NOT_STARTED,
        tenggatSlaTanggal: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 hari ke depan (SLA 6 hari)
        isMendekatiTenggat: false,
        terperiksa: {
          create: {
            namaLengkap: '[TEST] Tersangka 6',
            alias: 'Tersangka Uji 6',
            nik: '3171012345670001',
            isNikVerified: true,
            tempatLahir: 'Jakarta',
            tanggalLahir: new Date('1998-05-14'),
            usia: 28,
            jenisKelamin: 'Laki-laki',
            pekerjaan: 'Wiraswasta',
            alamatKtp: 'Jl. Kemayoran No. 12, Jakarta Pusat',
            namaWaliPendamping: 'Wali Tersangka 6',
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
              'Subjek [TEST] Tersangka 6 diamankan saat penggerebekan di kamar hotel bersama barang bukti sabu sisa pakai. Subjek mengaku menggunakan sabu untuk pemakaian pribadi.',
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
            sekretariat: { connect: { id: adminUser.id } },
            sekretariatNama: adminUser.name,
            asesorMedis: { connect: { id: medisUser.id } },
            asesorMedisNama: medisUser.name,
            asesorHukum: { connect: { id: hukumUser.id } },
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
            status: AssessmentStatus.DRAFT,
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
            status: AssessmentStatus.DRAFT,
            pernahDitangkap: false,
            terverifikasiDatabase: true,
            analisisPeran: 'Penyalahguna_Murni',
            argumentasiPeran:
              'Barang bukti di bawah 1 gram (0.28 gram), tidak ditemukan alat timbangan digital atau uang hasil penjualan, tidak terindikasi jaringan pengedar.',
            faktaPendukung: [
              'Barang bukti netto 0.28 gram sesuai SEMA No. 4 Tahun 2010',
              'Hasil tes urine terbukti positif metamfetamin',
              'Tidak ditemukan catatan kriminalitas sebelumnya (residivisme negatif)',
            ],
            kesimpulanHukum: 'Memenuhi kriteria penyalahguna narkotika murni untuk diri sendiri',
            rekomendasiHukum: 'Proses_Hukum_Dilanjutkan_dengan_Rehabilitasi',
          },
        },
      },
    });

    console.log('✔ Sample permohonan asesmen created:', samplePermohonan.nomorPermohonan);
  }

  // 3. Seed Sample RegistrasiPengguna Accounts for Verification Dashboard
  const sampleRegistrations = [
    {
      nomorRegistrasi: 'REG-TAT/2026/POLRES-001',
      namaLengkap: '[TEST] Penyidik Pengaju Satresnarkoba',
      pangkat: 'Ipda',
      nrp: '85010234',
      jabatan: 'Penyidik Pemohon Asesmen TAT (Akun Uji)',
      instansi: 'Satresnarkoba Polres Metro Jakarta Pusat',
      kategoriInstansi: KategoriInstansi.Polres_Polresta,
      wilayahHukum: 'Polda Metro Jaya',
      alamatKantor: 'Jl. Kramat Raya No. 61, Jakarta Pusat',
      email: 'pengaju@gmail.com',
      phone: '081298765432',
      status: 'approved' as const,
      catatanAdmin: 'Dokumen KTP, KTA, dan Surat Penunjukan terverifikasi sah.',
      approvedAt: new Date(),
      approvedById: adminUser.id,
    },
    {
      nomorRegistrasi: 'REG-TAT/2026/BNNP-002',
      namaLengkap: '[TEST] Dokter Asesor Medis TAT',
      pangkat: 'Penata Tk.I',
      nrp: '198205122008012001',
      jabatan: 'Dokter Pemeriksa Medis TAT (Akun Uji)',
      instansi: 'BNNP DKI Jakarta / RS Pengayoman',
      kategoriInstansi: KategoriInstansi.BNNK_BNNP,
      wilayahHukum: 'DKI Jakarta',
      alamatKantor: 'Jl. MT Haryono No. 11, Jakarta Timur',
      email: 'medis@gmail.com',
      phone: '081311223344',
      status: 'approved' as const,
      catatanAdmin: 'SIP dan Surat Penugasan Tim Medis TAT Valid.',
      approvedAt: new Date(),
      approvedById: adminUser.id,
    },
    {
      nomorRegistrasi: 'REG-TAT/2026/KEJATI-003',
      namaLengkap: '[TEST] Jaksa Asesor Hukum TAT',
      pangkat: 'Jaksa Pratama',
      nrp: '197903152003121002',
      jabatan: 'Jaksa / Penelaah Hukum TAT (Akun Uji)',
      instansi: 'Kejaksaan Tinggi DKI Jakarta',
      kategoriInstansi: KategoriInstansi.Kejaksaan,
      wilayahHukum: 'Kejati DKI Jakarta',
      alamatKantor: 'Jl. Rasuna Said No. 5, Jakarta Selatan',
      email: 'hukum@gmail.com',
      phone: '081399887766',
      status: 'approved' as const,
      catatanAdmin: 'SK Jaksa dan Penugasan TAT Terverifikasi.',
      approvedAt: new Date(),
      approvedById: adminUser.id,
    },
    {
      nomorRegistrasi: 'REG-TAT/2026/POLSEK-004',
      namaLengkap: '[TEST] Penyidik Polsek Samarinda',
      pangkat: 'Bripka',
      nrp: '88081727',
      jabatan: 'Kanit Reskrim (Akun Uji)',
      instansi: 'Polsek Samarinda Kota',
      kategoriInstansi: KategoriInstansi.Polsek,
      wilayahHukum: 'Kota Samarinda / Polda Kaltim',
      alamatKantor: 'Jl. Bhayangkara No. 1, Samarinda',
      email: 'penyidik.polsek.samarinda@polri.go.id',
      phone: '081399887700',
      status: 'pending' as const,
    },
    {
      nomorRegistrasi: 'REG-TAT/2026/POLRES-005',
      namaLengkap: '[TEST] Penyidik Resnarkoba Kukar',
      pangkat: 'AKP',
      nrp: '78091244',
      jabatan: 'Kasat Resnarkoba (Akun Uji)',
      instansi: 'Polres Kutai Kartanegara',
      kategoriInstansi: KategoriInstansi.Polres_Polresta,
      wilayahHukum: 'Polda Kaltim',
      alamatKantor: 'Jl. Wolter Monginsidi No. 1, Tenggarong',
      email: 'satnarkoba.kukar@polri.go.id',
      phone: '081255443322',
      status: 'pending' as const,
    },
  ];

  for (const reg of sampleRegistrations) {
    await prisma.registrasiPengguna.upsert({
      where: { nomorRegistrasi: reg.nomorRegistrasi },
      update: reg,
      create: reg,
    });
  }
  console.log('✔ Sample registrasi pengguna accounts seeded successfully.');

  // Seed Riwayat & Arsip Asesmen TAT data from separate file
  await seedRiwayatData(prisma);

  // Seed Permohonan Asesmen Aktif data
  await seedAktifData(prisma);

  console.log('✨ Seeding completed successfully!');
  console.log('--------------------------------------------------');
  console.log('Login credentials for all 4 roles:');
  console.log('1. Sekretariat (Admin) : admin@gmail.com   | password123');
  console.log('2. Pengaju (Penyidik)  : pengaju@gmail.com | password123');
  console.log('3. Asesor Medis        : medis@gmail.com   | password123');
  console.log('4. Asesor Hukum        : hukum@gmail.com   | password123');
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
