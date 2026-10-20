import {
  PrismaClient,
  ApplicationStatus,
  AssessmentStatus,
  StatusPleno,
  JenisRekomendasiFinal,
  AnalisisPeran,
  RekomendasiHukum,
  StatusPengesah,
  StatusUjiLab,
} from '@prisma/client';

/**
 * Seeder khusus untuk data Riwayat & Arsip Asesmen TAT (/dashboard/riwayat)
 * Data 100% tersimpan di database backend PostgreSQL & terhubung ke 4 canonical user:
 * - admin@gmail.com
 * - pengaju@gmail.com
 * - medis@gmail.com
 * - etatsiappulih@gmail.com
 */
export async function seedRiwayatData(prisma: PrismaClient) {
  console.log('📦 Seeding Riwayat & Arsip Asesmen TAT data (Database)...');

  const pengajuUser =
    (await prisma.user.findFirst({ where: { email: 'pengaju@gmail.com' } })) ||
    (await prisma.user.findFirst({ where: { role: 'PENGAJU' } }));

  const adminUser =
    (await prisma.user.findFirst({ where: { email: 'admin@gmail.com' } })) ||
    (await prisma.user.findFirst({ where: { role: 'ADMIN' } }));

  const medisUser =
    (await prisma.user.findFirst({ where: { email: 'medis@gmail.com' } })) ||
    (await prisma.user.findFirst({ where: { role: 'MEDIS' } }));

  const hukumUser =
    (await prisma.user.findFirst({ where: { email: 'etatsiappulih@gmail.com' } })) ||
    (await prisma.user.findFirst({ where: { role: 'HUKUM' } }));

  if (!pengajuUser || !adminUser || !medisUser || !hukumUser) {
    console.warn('⚠️ User canonical belum lengkap. Pastikan seed akun utama berjalan sebelum seed riwayat.');
    return;
  }

  // =========================================================================
  // 1. Kasus Riwayat 1: Rekomendasi Terbit & Rawat Inap Selesai
  // Nomor: TAT/2026/08/0012 | Tersangka: [TEST] Tersangka 7
  // =========================================================================
  const existing0012 = await prisma.permohonanAsesmen.findFirst({
    where: { nomorPermohonan: 'TAT/2026/08/0012' },
  });

  if (!existing0012) {
    await prisma.permohonanAsesmen.create({
      data: {
        nomorPermohonan: 'TAT/2026/08/0012',
        trackingNumber: 'TRACK-202608-012',
        pengaju: { connect: { id: pengajuUser.id } },
        instansiPengaju: pengajuUser.agency || 'Satresnarkoba Polres Metro Jakarta Pusat',
        satuanKerjaTujuan: 'BNNP DKI Jakarta',
        tanggalPengajuan: new Date('2026-08-12T09:15:00Z'),
        applicationStatus: ApplicationStatus.RESULTS_ISSUED,
        medicalStatus: AssessmentStatus.COMPLETED,
        legalStatus: AssessmentStatus.COMPLETED,
        tenggatSlaTanggal: new Date('2026-08-18T17:00:00Z'),
        isMendekatiTenggat: false,
        isMelewatiTenggat: false,
        terperiksa: {
          create: {
            namaLengkap: '[TEST] Tersangka 7',
            alias: 'Tersangka Uji 7',
            nik: '3171012345670088',
            isNikVerified: true,
            tempatLahir: 'Jakarta',
            tanggalLahir: new Date('1992-05-15'),
            usia: 34,
            jenisKelamin: 'Laki-Laki',
            pekerjaan: 'Wiraswasta Swasta',
            alamatKtp: 'Jl. Kramat Raya No. 45, Senen, Jakarta Pusat',
            alamatDomisili: 'Jl. Kramat Raya No. 45, Senen, Jakarta Pusat',
            namaWaliPendamping: 'Wali Tersangka 7',
            kontakWali: '081299887766',
          },
        },
        perkara: {
          create: {
            nomorLaporanPolisi: 'LP/A/302/VIII/2026/SPKT/POLRES_JAKPUS',
            tanggalLp: new Date('2026-08-10'),
            instansiPenyidik: 'Satresnarkoba Polres Metro Jakarta Pusat',
            namaPenyidik: pengajuUser.name,
            nomorHpPenyidik: '081298765432',
            pasalDipersangkakan: 'Pasal 127 ayat (1) huruf a UU No. 35 Tahun 2009 tentang Narkotika',
            tempatKejadianPerkara: 'Sebuah indekos di wilayah Senen, Jakarta Pusat',
            tanggalWaktuPenangkapan: new Date('2026-08-10T14:00:00Z'),
            kronologiSingkat:
              'Tersangka diamankan di indekos wilayah Senen dengan barang bukti 1 plastik klip berisi sabu sisa pakai 0.45 gram. Hasil tes urin awal menunjukkan Positif Metamfetamina.',
            barangBuktiList: {
              create: [
                {
                  jenisZat: 'Metamfetamina (Sabu)',
                  beratBersihGram: 0.45,
                  statusUjiLab: StatusUjiLab.positif,
                  keterangan: '1 Plastik Klip Bening Sisa Pakai (Disita Sah)',
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
            jadwalPemeriksaanMedis: new Date('2026-08-14T09:00:00Z'),
            jadwalPemeriksaanHukum: new Date('2026-08-14T13:00:00Z'),
            jadwalPleno: new Date('2026-08-15T10:00:00Z'),
            lokasiPemeriksaan: 'Ruang Asesmen Terpadu BNNP DKI Jakarta',
          },
        },
        asesmenMedis: {
          create: {
            asesorId: medisUser.id,
            asesorNama: medisUser.name,
            status: AssessmentStatus.COMPLETED,
            kondisiFisik: 'Kondisi fisik stabil, tanda vital normal, tidak ditemukan infeksi akut.',
            tekananDarah: '120/80 mmHg',
            denyutNadi: '80 bpm',
            kondisiPsikologis: 'Kontak mata baik, afek adekuat, motivasi pulih cukup kuat.',
            instrumen: 'ASSIST',
            skorInstrumen: 32.0,
            tingkatRisikoInstrumen: 'Tinggi (Ketergantungan)',
            diagnosisKlinisIcd: 'F15.2 (Sindrom Ketergantungan Stimulansia)',
            interpretasiKlinis: 'Klien menunjukkan adiksi stimulan sedang-berat. Memerlukan rehabilitasi rawat inap.',
            kebutuhanRawat: 'Rawat Inap',
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
          },
        },
        asesmenHukum: {
          create: {
            asesorId: hukumUser.id,
            asesorNama: hukumUser.name,
            status: AssessmentStatus.COMPLETED,
            pernahDitangkap: false,
            terverifikasiDatabase: true,
            analisisPeran: AnalisisPeran.Penyalahguna_Murni,
            argumentasiPeran:
              'Barang bukti netto 0.45 gram di bawah batasan SEMA No. 4/2010. Bukan bagian jaringan pengedar narkotika.',
            kesimpulanHukum: 'Direkomendasikan rehabilitasi medis dan sosial sesuai ketentuan Pasal 54 dan 127 UU Narkotika.',
            rekomendasiHukum: RekomendasiHukum.Proses_Hukum_Dilanjutkan_dengan_Rehabilitasi,
          },
        },
        sidangPleno: {
          create: {
            tanggalPleno: new Date('2026-08-15T10:00:00Z'),
            tempat: 'Ruang Sidang Pleno TAT BNNP',
            pimpinanPleno: adminUser.name,
            nomorBeritaAcara: 'BA-PLENO/TAT/2026/08/0012',
            statusPleno: StatusPleno.selesai_sepakat,
            kesepakatanRekomendasi: 'Disepakati secara bulat rekomendasi rehabilitasi medis rawat inap selama 3 bulan.',
            jenisRekomendasiFinal: JenisRekomendasiFinal.rehabilitasi_rawat_inap,
            durasiRehabBulan: 3,
            fasilitasRujukanUsulan: 'Balai Rehabilitasi BNN Tanah Merah',
          },
        },
        rekomendasiResmi: {
          create: {
            nomorSurat: 'REK-TAT/2026/08/0012',
            tanggalTerbit: new Date('2026-08-16T10:00:00Z'),
            dibuatOleh: adminUser.name,
            rekomendasiFinalText: 'Rehabilitasi Medis Rawat Inap selama 3 bulan di Balai Rehabilitasi BNN Tanah Merah.',
            qrVerificationCode: 'QR-VALID-TAT-0012',
            daftarPengesah: {
              create: [
                {
                  nama: adminUser.name,
                  jabatan: 'Ketua Tim TAT / Sekretariat',
                  instansi: 'BNNP DKI Jakarta',
                  status: StatusPengesah.disahkan,
                  tanggalPengesahan: new Date('2026-08-16T09:00:00Z'),
                },
                {
                  nama: medisUser.name,
                  jabatan: 'Dokter Asesor Medis TAT',
                  instansi: 'Klinik Pratama BNNP',
                  status: StatusPengesah.disahkan,
                  tanggalPengesahan: new Date('2026-08-16T09:30:00Z'),
                },
                {
                  nama: hukumUser.name,
                  jabatan: 'Jaksa Asesor Hukum TAT',
                  instansi: 'Kejaksaan Tinggi',
                  status: StatusPengesah.disahkan,
                  tanggalPengesahan: new Date('2026-08-16T09:45:00Z'),
                },
              ],
            },
          },
        },
        auditLogs: {
          create: [
            {
              actorId: pengajuUser.id,
              actorNama: pengajuUser.name,
              actorPeran: 'PENGAJU',
              aksi: 'SUBMIT_PERMOHONAN',
              rincian: 'Penyidik mendaftarkan permohonan asesmen TAT untuk [TEST] Tersangka 7.',
              timestamp: new Date('2026-08-12T09:15:00Z'),
            },
            {
              actorId: adminUser.id,
              actorNama: adminUser.name,
              actorPeran: 'ADMIN',
              aksi: 'PENGESAHAN_TTE',
              rincian: 'Surat Rekomendasi Resmi disahkan 100% TTE dan diterbitkan.',
              timestamp: new Date('2026-08-16T10:00:00Z'),
            },
          ],
        },
      },
    });
    console.log('  ✔ Riwayat TAT/2026/08/0012 ([TEST] Tersangka 7) seeded.');
  }

  // =========================================================================
  // 2. Kasus Riwayat 2: Selesai Tindak Lanjut Rawat Jalan
  // Nomor: TAT/2026/07/0088 | Tersangka: [TEST] Tersangka 8
  // =========================================================================
  const existing0088 = await prisma.permohonanAsesmen.findFirst({
    where: { nomorPermohonan: 'TAT/2026/07/0088' },
  });

  if (!existing0088) {
    await prisma.permohonanAsesmen.create({
      data: {
        nomorPermohonan: 'TAT/2026/07/0088',
        trackingNumber: 'TRACK-202607-088',
        pengaju: { connect: { id: pengajuUser.id } },
        instansiPengaju: pengajuUser.agency || 'Satresnarkoba Polres Metro Jakarta Barat',
        satuanKerjaTujuan: 'BNNP DKI Jakarta',
        tanggalPengajuan: new Date('2026-07-20T10:30:00Z'),
        applicationStatus: ApplicationStatus.VERIFIED_IMPLEMENTED,
        medicalStatus: AssessmentStatus.COMPLETED,
        legalStatus: AssessmentStatus.COMPLETED,
        tenggatSlaTanggal: new Date('2026-07-26T17:00:00Z'),
        isMendekatiTenggat: false,
        isMelewatiTenggat: false,
        terperiksa: {
          create: {
            namaLengkap: '[TEST] Tersangka 8',
            alias: 'Tersangka Uji 8',
            nik: '3172025508940005',
            isNikVerified: true,
            tempatLahir: 'Jakarta',
            tanggalLahir: new Date('1994-08-25'),
            usia: 32,
            jenisKelamin: 'Perempuan',
            pekerjaan: 'Karyawan Swasta',
            alamatKtp: 'Jl. Palmerah Barat No. 12, Jakarta Barat',
            alamatDomisili: 'Jl. Palmerah Barat No. 12, Jakarta Barat',
            namaWaliPendamping: 'Wali Tersangka 8',
            kontakWali: '081377665544',
          },
        },
        perkara: {
          create: {
            nomorLaporanPolisi: 'LP/A/215/VII/2026/SPKT/POLRES_JAKBAR',
            tanggalLp: new Date('2026-07-18'),
            instansiPenyidik: 'Satresnarkoba Polres Metro Jakarta Barat',
            namaPenyidik: pengajuUser.name,
            nomorHpPenyidik: '081298765432',
            pasalDipersangkakan: 'Pasal 127 ayat (1) huruf a UU No. 35 Tahun 2009 tentang Narkotika',
            tempatKejadianPerkara: 'Sebuah kafe daerah Palmerah, Jakarta Barat',
            tanggalWaktuPenangkapan: new Date('2026-07-18T22:00:00Z'),
            kronologiSingkat:
              'Tersangka diamankan di kafe daerah Palmerah saat menggunakan psikotropika golongan IV. BB berupa 2 butir Alprazolam.',
            barangBuktiList: {
              create: [
                {
                  jenisZat: 'Alprazolam (Benzodiazepin)',
                  beratBersihGram: 0.2,
                  statusUjiLab: StatusUjiLab.positif,
                  keterangan: '2 Butir Tablet Alprazolam 1mg',
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
            jadwalPemeriksaanMedis: new Date('2026-07-22T10:00:00Z'),
            jadwalPemeriksaanHukum: new Date('2026-07-22T14:00:00Z'),
            jadwalPleno: new Date('2026-07-24T09:00:00Z'),
            lokasiPemeriksaan: 'Klinik Pratama BNNP DKI',
          },
        },
        asesmenMedis: {
          create: {
            asesorId: medisUser.id,
            asesorNama: medisUser.name,
            status: AssessmentStatus.COMPLETED,
            kondisiFisik: 'Kondisi umum baik, tidak ada ketergantungan fisik berat.',
            instrumen: 'DAST-10',
            skorInstrumen: 18.0,
            tingkatRisikoInstrumen: 'Sedang (Penggunaan Rekreasional)',
            diagnosisKlinisIcd: 'F13.1 (Penggunaan Penenang yang Merugikan)',
            kebutuhanRawat: 'Rawat Jalan',
            durasiUsulanBulan: 6,
            interpretasiKlinis: 'Penggunaan rekreasional akibat kecemasan kerja. Direkomendasikan konseling individu rawat jalan 6 bulan.',
            hasilUrin: {
              create: [
                { parameter: 'BZO', hasil: 'Positif' },
                { parameter: 'MET', hasil: 'Negatif' },
              ],
            },
          },
        },
        asesmenHukum: {
          create: {
            asesorId: hukumUser.id,
            asesorNama: hukumUser.name,
            status: AssessmentStatus.COMPLETED,
            pernahDitangkap: false,
            terverifikasiDatabase: true,
            analisisPeran: AnalisisPeran.Penyalahguna_Murni,
            argumentasiPeran: 'Barang bukti di bawah batasan. Kooperatif dan belum pernah berurusan dengan hukum sebelumnya.',
            kesimpulanHukum: 'Rekomendasi Rehabilitasi Rawat Jalan.',
            rekomendasiHukum: RekomendasiHukum.Proses_Hukum_Dilanjutkan_dengan_Rehabilitasi,
          },
        },
        sidangPleno: {
          create: {
            tanggalPleno: new Date('2026-07-24T09:00:00Z'),
            tempat: 'Ruang Pleno BNNP',
            pimpinanPleno: adminUser.name,
            nomorBeritaAcara: 'BA-PLENO/TAT/2026/07/0088',
            statusPleno: StatusPleno.selesai_sepakat,
            kesepakatanRekomendasi: 'Sidang Pleno menyetujui rawat jalan di Klinik Pratama BNNP.',
            jenisRekomendasiFinal: JenisRekomendasiFinal.rehabilitasi_rawat_jalan,
            durasiRehabBulan: 6,
            fasilitasRujukanUsulan: 'Klinik Pratama BNNP DKI Jakarta',
          },
        },
        rekomendasiResmi: {
          create: {
            nomorSurat: 'REK-TAT/2026/07/0088',
            tanggalTerbit: new Date('2026-07-25T14:00:00Z'),
            dibuatOleh: adminUser.name,
            rekomendasiFinalText: 'Rehabilitasi Medis Rawat Jalan 6 Bulan di Klinik Pratama BNNP DKI Jakarta.',
            qrVerificationCode: 'QR-VALID-TAT-0088',
          },
        },
        auditLogs: {
          create: [
            {
              actorId: pengajuUser.id,
              actorNama: pengajuUser.name,
              actorPeran: 'PENGAJU',
              aksi: 'SUBMIT_PERMOHONAN',
              rincian: 'Permohonan diajukan untuk [TEST] Tersangka 8.',
              timestamp: new Date('2026-07-20T10:30:00Z'),
            },
            {
              actorId: adminUser.id,
              actorNama: adminUser.name,
              actorPeran: 'ADMIN',
              aksi: 'PENGESAHAN_TTE',
              rincian: 'Rekomendasi terbit.',
              timestamp: new Date('2026-07-25T14:00:00Z'),
            },
          ],
        },
      },
    });
    console.log('  ✔ Riwayat TAT/2026/07/0088 ([TEST] Tersangka 8) seeded.');
  }

  // =========================================================================
  // 3. Kasus Riwayat 3: Permohonan Ditolak / Terindikasi Jaringan
  // Nomor: TAT/2026/06/0045 | Tersangka: [TEST] Tersangka 9
  // =========================================================================
  const existing0045 = await prisma.permohonanAsesmen.findFirst({
    where: { nomorPermohonan: 'TAT/2026/06/0045' },
  });

  if (!existing0045) {
    await prisma.permohonanAsesmen.create({
      data: {
        nomorPermohonan: 'TAT/2026/06/0045',
        trackingNumber: 'TRACK-202606-045',
        pengaju: { connect: { id: pengajuUser.id } },
        instansiPengaju: pengajuUser.agency || 'Ditresnarkoba Polda Metro Jaya',
        satuanKerjaTujuan: 'BNNP DKI Jakarta',
        tanggalPengajuan: new Date('2026-06-05T14:00:00Z'),
        applicationStatus: ApplicationStatus.REJECTED,
        medicalStatus: AssessmentStatus.COMPLETED,
        legalStatus: AssessmentStatus.COMPLETED,
        tenggatSlaTanggal: new Date('2026-06-11T17:00:00Z'),
        isMendekatiTenggat: false,
        isMelewatiTenggat: false,
        terperiksa: {
          create: {
            namaLengkap: '[TEST] Tersangka 9',
            alias: 'Tersangka Uji 9',
            nik: '3173041102880002',
            isNikVerified: true,
            tempatLahir: 'Bandung',
            tanggalLahir: new Date('1988-02-11'),
            usia: 38,
            jenisKelamin: 'Laki-Laki',
            pekerjaan: 'Pengusaha hiburan malam',
            alamatKtp: 'Jl. Mangga Besar IX No. 88, Jakarta Barat',
            alamatDomisili: 'Jl. Mangga Besar IX No. 88, Jakarta Barat',
            namaWaliPendamping: 'Wali Tersangka 9',
            kontakWali: '081122334455',
          },
        },
        perkara: {
          create: {
            nomorLaporanPolisi: 'LP/A/140/VI/2026/SPKT/POLDA_METRO',
            tanggalLp: new Date('2026-06-03'),
            instansiPenyidik: 'Ditresnarkoba Polda Metro Jaya',
            namaPenyidik: pengajuUser.name,
            nomorHpPenyidik: '081399887766',
            pasalDipersangkakan: 'Pasal 114 ayat (2) jo Pasal 112 ayat (2) UU No. 35 Tahun 2009 tentang Narkotika',
            tempatKejadianPerkara: 'Kamar hotel bintang 3 di Jakarta Barat',
            tanggalWaktuPenangkapan: new Date('2026-06-03T23:30:00Z'),
            kronologiSingkat:
              'Tersangka ditangkap saat transaksi narkotika jenis Ekstasi (MDMA) sejumlah 500 butir (145 gram). Hasil pendalaman forensik mengonfirmasi keterlibatan dalam jaringan pengedar.',
            barangBuktiList: {
              create: [
                {
                  jenisZat: 'Ekstasi (MDMA)',
                  beratBersihGram: 145.0,
                  statusUjiLab: StatusUjiLab.positif,
                  keterangan: '500 Butir Tablet Ekstasi Logo Minion (145 gram)',
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
            jadwalPemeriksaanMedis: new Date('2026-06-08T10:00:00Z'),
            jadwalPemeriksaanHukum: new Date('2026-06-08T14:00:00Z'),
            jadwalPleno: new Date('2026-06-09T15:00:00Z'),
            lokasiPemeriksaan: 'Ruang Tahanan BNNP',
          },
        },
        asesmenMedis: {
          create: {
            asesorId: medisUser.id,
            asesorNama: medisUser.name,
            status: AssessmentStatus.COMPLETED,
            kondisiFisik: 'Kondisi fisik normal, tidak ditemukan gejala ketergantungan fisik.',
            instrumen: 'ASSIST',
            skorInstrumen: 8.0,
            tingkatRisikoInstrumen: 'Rendah (Non-Ketergantungan)',
            diagnosisKlinisIcd: 'Z72.8 (Masalah Gaya Hidup)',
            kebutuhanRawat: 'Rawat Jalan',
            durasiUsulanBulan: 0,
            interpretasiKlinis: 'Subjek tidak menunjukkan ketergantungan fisik maupun psikologis pada zat.',
            hasilUrin: {
              create: [
                { parameter: 'MET', hasil: 'Negatif' },
                { parameter: 'AMP', hasil: 'Negatif' },
              ],
            },
          },
        },
        asesmenHukum: {
          create: {
            asesorId: hukumUser.id,
            asesorNama: hukumUser.name,
            status: AssessmentStatus.COMPLETED,
            pernahDitangkap: true,
            terverifikasiDatabase: true,
            analisisPeran: AnalisisPeran.Kurir_Perantara,
            argumentasiPeran: 'Barang bukti 145 gram MDMA (500 butir) jauh melampaui batas maksimal SEMA 04/2010. Tersangka terbukti bertindak sebagai kurir/penyedia.',
            kesimpulanHukum: 'TIDAK Memenuhi Kriteria Rehabilitasi. Proses hukum dilanjutkan sesuai ketentuan peradilan umum.',
            rekomendasiHukum: RekomendasiHukum.Proses_Hukum_Dilanjutkan_Tanpa_Rehabilitasi,
          },
        },
        sidangPleno: {
          create: {
            tanggalPleno: new Date('2026-06-09T15:00:00Z'),
            tempat: 'Ruang Sidang TAT',
            pimpinanPleno: adminUser.name,
            nomorBeritaAcara: 'BA-PLENO/TAT/2026/06/0045',
            statusPleno: StatusPleno.selesai_sepakat,
            kesepakatanRekomendasi: 'Keputusan bulat Pleno TAT: Permohonan ditolak karena tersangka terbukti jaringan pengedar.',
            jenisRekomendasiFinal: JenisRekomendasiFinal.proses_hukum_lanjut,
          },
        },
        auditLogs: {
          create: [
            {
              actorId: pengajuUser.id,
              actorNama: pengajuUser.name,
              actorPeran: 'PENGAJU',
              aksi: 'SUBMIT_PERMOHONAN',
              rincian: 'Permohonan TAT diajukan untuk [TEST] Tersangka 9.',
              timestamp: new Date('2026-06-05T14:00:00Z'),
            },
            {
              actorId: adminUser.id,
              actorNama: adminUser.name,
              actorPeran: 'ADMIN',
              aksi: 'PENOLAKAN_PLENO',
              rincian: 'Permohonan ditolak berdasarkan keputusan Pleno TAT.',
              timestamp: new Date('2026-06-09T15:30:00Z'),
            },
          ],
        },
      },
    });
    console.log('  ✔ Riwayat TAT/2026/06/0045 ([TEST] Tersangka 9) seeded.');
  }

  console.log('✅ Riwayat Asesmen TAT database seed completed successfully!');
}
