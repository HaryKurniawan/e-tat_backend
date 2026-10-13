import { PrismaClient, ApplicationStatus, AssessmentStatus } from '@prisma/client';

/**
 * Seeder khusus untuk data Riwayat & Arsip Asesmen TAT (/dashboard/riwayat)
 */
export async function seedRiwayatData(prisma: PrismaClient) {
  console.log('📦 Seeding Riwayat & Arsip Asesmen TAT data...');

  // Find or use admin user as default pengaju if needed
  const pengaju =
    (await prisma.user.findFirst({
      where: { role: 'PENGAJU' },
    })) || (await prisma.user.findFirst());

  if (!pengaju) {
    console.warn('⚠️ No user found for seeding riwayat. Skipping database insertion.');
    return;
  }

  // 1. Kasus Riwayat 1: Rekomendasi Terbit & Rawat Inap Selesai
  await prisma.permohonanAsesmen.upsert({
    where: { nomorPermohonan: 'TAT/2026/08/0012' },
    update: {
      applicationStatus: ApplicationStatus.RESULTS_ISSUED,
      medicalStatus: AssessmentStatus.COMPLETED,
      legalStatus: AssessmentStatus.COMPLETED,
    },
    create: {
      nomorPermohonan: 'TAT/2026/08/0012',
      trackingNumber: 'TRACK-202608-012',
      pengajuId: pengaju.id,
      instansiPengaju: pengaju.agency || 'Satresnarkoba Polres Metro Jakarta Pusat',
      satuanKerjaTujuan: 'BNNP DKI Jakarta',
      applicationStatus: ApplicationStatus.RESULTS_ISSUED,
      medicalStatus: AssessmentStatus.COMPLETED,
      legalStatus: AssessmentStatus.COMPLETED,
      tenggatSlaTanggal: new Date('2026-08-18'),
      isMendekatiTenggat: false,
      terperiksa: {
        create: {
          namaLengkap: 'Budi Hermawan',
          alias: 'Budi Bin Slamet',
          nik: '3171012345670088',
          isNikVerified: true,
          tempatLahir: 'Jakarta',
          tanggalLahir: new Date('1992-05-15'),
          usia: 34,
          jenisKelamin: 'Laki-Laki',
          pekerjaan: 'Wiraswasta Swasta',
          alamatKtp: 'Jl. Kramat Raya No. 45, Senen, Jakarta Pusat',
        },
      },
      perkara: {
        create: {
          nomorLaporanPolisi: 'LP/A/302/VIII/2026/SPKT/POLRES_JAKPUS',
          tanggalLp: new Date('2026-08-10'),
          instansiPenyidik: 'Satresnarkoba Polres Metro Jakarta Pusat',
          namaPenyidik: 'Ipda Budi Santoso, S.H.',
          nomorHpPenyidik: '081298765432',
          pasalDipersangkakan: 'Pasal 127 ayat (1) huruf a UU No. 35 Tahun 2009 tentang Narkotika',
          tempatKejadianPerkara: 'Sebuah indekos di wilayah Senen, Jakarta Pusat',
          tanggalWaktuPenangkapan: new Date('2026-08-10T14:00:00Z'),
          kronologiSingkat:
            'Tersangka ditangkap di indekos wilayah Senen dengan barang bukti 1 plastik klip berisi sabu sisa pakai 0.45 gram. Hasil tes urin awal menunjukkan Positif Metamfetamina.',
          barangBuktiList: {
            create: [
              {
                jenisZat: 'Metamfetamina (Sabu)',
                beratBersihGram: 0.45,
                keterangan: '1 Plastik Klip Bening Sisa Pakai (Disita Sah)',
              },
            ],
          },
        },
      },
    },
  });

  // 2. Kasus Riwayat 2: Selesai Tindak Lanjut Rawat Jalan
  await prisma.permohonanAsesmen.upsert({
    where: { nomorPermohonan: 'TAT/2026/07/0088' },
    update: {
      applicationStatus: ApplicationStatus.VERIFIED_IMPLEMENTED,
      medicalStatus: AssessmentStatus.COMPLETED,
      legalStatus: AssessmentStatus.COMPLETED,
    },
    create: {
      nomorPermohonan: 'TAT/2026/07/0088',
      trackingNumber: 'TRACK-202607-088',
      pengajuId: pengaju.id,
      instansiPengaju: pengaju.agency || 'Satresnarkoba Polres Metro Jakarta Barat',
      satuanKerjaTujuan: 'BNNP DKI Jakarta',
      applicationStatus: ApplicationStatus.VERIFIED_IMPLEMENTED,
      medicalStatus: AssessmentStatus.COMPLETED,
      legalStatus: AssessmentStatus.COMPLETED,
      tenggatSlaTanggal: new Date('2026-07-26'),
      isMendekatiTenggat: false,
      terperiksa: {
        create: {
          namaLengkap: 'Siti Nurhaliza',
          alias: 'Siti',
          nik: '3172025508940005',
          isNikVerified: true,
          tempatLahir: 'Jakarta',
          tanggalLahir: new Date('1994-08-25'),
          usia: 32,
          jenisKelamin: 'Perempuan',
          pekerjaan: 'Karyawan Swasta',
          alamatKtp: 'Jl. Palmerah Barat No. 12, Jakarta Barat',
        },
      },
      perkara: {
        create: {
          nomorLaporanPolisi: 'LP/A/215/VII/2026/SPKT/POLRES_JAKBAR',
          tanggalLp: new Date('2026-07-18'),
          instansiPenyidik: 'Satresnarkoba Polres Metro Jakarta Barat',
          namaPenyidik: 'Ipda Budi Santoso, S.H.',
          nomorHpPenyidik: '081298765432',
          pasalDipersangkakan: 'Pasal 127 ayat (1) huruf a UU No. 35 Tahun 2009 tentang Narkotika',
          tempatKejadianPerkara: 'Sebuah kafe daerah Palmerah, Jakarta Barat',
          tanggalWaktuPenangkapan: new Date('2026-07-18T22:00:00Z'),
          kronologiSingkat:
            'Tersangka diamankan di sebuah kafe daerah Palmerah saat menggunakan psikotropika golongan IV. BB berupa 2 butir Alprazolam.',
          barangBuktiList: {
            create: [
              {
                jenisZat: 'Alprazolam (Benzodiazepin)',
                beratBersihGram: 0.2,
                keterangan: '2 Butir Tablet Alprazolam 1mg',
              },
            ],
          },
        },
      },
    },
  });

  // 3. Kasus Riwayat 3: Permohonan Ditolak / Terindikasi Jaringan
  await prisma.permohonanAsesmen.upsert({
    where: { nomorPermohonan: 'TAT/2026/06/0045' },
    update: {
      applicationStatus: ApplicationStatus.REJECTED,
      medicalStatus: AssessmentStatus.COMPLETED,
      legalStatus: AssessmentStatus.COMPLETED,
    },
    create: {
      nomorPermohonan: 'TAT/2026/06/0045',
      trackingNumber: 'TRACK-202606-045',
      pengajuId: pengaju.id,
      instansiPengaju: pengaju.agency || 'Ditresnarkoba Polda Metro Jaya',
      satuanKerjaTujuan: 'BNNP DKI Jakarta',
      applicationStatus: ApplicationStatus.REJECTED,
      medicalStatus: AssessmentStatus.COMPLETED,
      legalStatus: AssessmentStatus.COMPLETED,
      tenggatSlaTanggal: new Date('2026-06-11'),
      isMendekatiTenggat: false,
      terperiksa: {
        create: {
          namaLengkap: 'Hendra Kurniawan',
          alias: 'Hendra / Ko Hendra',
          nik: '3173041102880002',
          isNikVerified: true,
          tempatLahir: 'Bandung',
          tanggalLahir: new Date('1988-02-11'),
          usia: 38,
          jenisKelamin: 'Laki-Laki',
          pekerjaan: 'Pengusaha hiburan malam',
          alamatKtp: 'Jl. Mangga Besar IX No. 88, Jakarta Barat',
        },
      },
      perkara: {
        create: {
          nomorLaporanPolisi: 'LP/A/140/VI/2026/SPKT/POLDA_METRO',
          tanggalLp: new Date('2026-06-03'),
          instansiPenyidik: 'Ditresnarkoba Polda Metro Jaya',
          namaPenyidik: 'AKP Agus Pratama, S.H.',
          nomorHpPenyidik: '081399887766',
          pasalDipersangkakan: 'Pasal 114 ayat (2) jo Pasal 112 ayat (2) UU No. 35 Tahun 2009 tentang Narkotika',
          tempatKejadianPerkara: 'Kamar hotel bintang 3 di Jakarta Barat',
          tanggalWaktuPenangkapan: new Date('2026-06-03T23:30:00Z'),
          kronologiSingkat:
            'Tersangka ditangkap saat transaksi narkotika jenis Ekstasi (MDMA) sejumlah 500 butir (145 gram). Hasil pendalaman digital forensik mengonfirmasi keterlibatan tersangka dalam jaringan pengedar antarprovinsi.',
          barangBuktiList: {
            create: [
              {
                jenisZat: 'Ekstasi (MDMA)',
                beratBersihGram: 145.0,
                keterangan: '500 Butir Tablet Ekstasi Logo Minion (145 gram)',
              },
            ],
          },
        },
      },
    },
  });

  console.log('✅ Riwayat Asesmen TAT seed data inserted successfully!');
}
