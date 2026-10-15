import {
  PrismaClient,
  ApplicationStatus,
  AssessmentStatus,
  StatusPleno,
  JenisRekomendasiFinal,
  AnalisisPeran,
  RekomendasiHukum,
  StatusPengesah,
  JenisPengajuan,
  MetodePelaksanaan,
  StatusUjiLab,
  StatusVerifikasiDokumen,
} from '@prisma/client';

export async function seedAktifData(prisma: PrismaClient) {
  console.log('📦 Seeding Permohonan Asesmen Aktif per Role...');

  // 1. Cari users canonical
  const pengaju = await prisma.user.findFirst({
    where: { email: 'pengaju@gmail.com' },
  });

  if (!pengaju) {
    console.warn('⚠️ User pengaju pengaju@gmail.com tidak ditemukan. Lewati seeding aktif.');
    return;
  }

  const pengajuUser = pengaju;

  const adminUser = await prisma.user.findFirst({
    where: { email: 'admin@gmail.com' },
  }) || pengaju;

  const medisUser = await prisma.user.findFirst({
    where: { email: 'medis@gmail.com' },
  }) || pengaju;

  const hukumUser = await prisma.user.findFirst({
    where: { email: 'hukum@gmail.com' },
  }) || pengaju;

  const today = new Date();
  const todayMorning = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0);
  const todayAfternoon = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 30, 0);

  // =========================================================================
  // KASUS 1: ROLE ADMIN (BARU DIAJUKAN - MENUNGGU VERIFIKASI BERKAS & DISPOSISI)
  // Nomor: TAT/2026/10/0105 | Tersangka: [TEST] Tersangka 1
  // =========================================================================
  const existing105 = await prisma.permohonanAsesmen.findFirst({
    where: { nomorPermohonan: 'TAT/2026/10/0105' },
  });

  if (!existing105) {
    console.log('  -> [ADMIN] Membuat permohonan TAT/2026/10/0105 ([TEST] Tersangka 1 - SUBMITTED)...');
    await prisma.permohonanAsesmen.create({
      data: {
        nomorPermohonan: 'TAT/2026/10/0105',
        trackingNumber: 'TRACK-202610-105',
        tanggalPengajuan: today,
        jenisPengajuan: JenisPengajuan.penangkapan_dengan_bb,
        metodePelaksanaan: MetodePelaksanaan.luring,
        satuanKerjaTujuan: 'BNNP Kalimantan Timur',
        instansiPengaju: pengaju.agency || 'Satresnarkoba Polresta Samarinda',
        pengaju: { connect: { id: pengaju.id } },
        applicationStatus: ApplicationStatus.SUBMITTED,
        medicalStatus: AssessmentStatus.NOT_STARTED,
        legalStatus: AssessmentStatus.NOT_STARTED,
        tenggatSlaTanggal: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // SLA 6 hari
        isMendekatiTenggat: false,
        isMelewatiTenggat: false,

        terperiksa: {
          create: {
            namaLengkap: '[TEST] Tersangka 1',
            alias: 'Tersangka Uji 1',
            nik: '6472012408990001',
            isNikVerified: true,
            statusIdentitasKhusus: 'KTP Elektronik Terverifikasi Dukcapil (Data Uji)',
            tempatLahir: 'Samarinda',
            tanggalLahir: new Date('1999-08-24'),
            usia: 27,
            jenisKelamin: 'Laki-laki',
            pekerjaan: 'Wiraswasta / Desain Grafis',
            alamatKtp: 'Jl. Merbabu No. 18 RT 07, Samarinda',
            alamatDomisili: 'Jl. Merbabu No. 18 RT 07, Samarinda',
            namaWaliPendamping: 'Wali Tersangka 1',
            kontakWali: '081254332211',
          },
        },

        perkara: {
          create: {
            nomorLaporanPolisi: 'LP/A/155/X/2026/SPKT/POLRESTA_SMD',
            tanggalLp: today,
            instansiPenyidik: 'Satresnarkoba Polresta Samarinda',
            namaPenyidik: pengajuUser.name,
            nomorHpPenyidik: '081298765432',
            pasalDipersangkakan: 'Pasal 127 ayat (1) huruf a UU No. 35 Tahun 2009 tentang Narkotika',
            tempatKejadianPerkara: 'Sebuah kafe di Jl. Juanda, Samarinda',
            tanggalWaktuPenangkapan: new Date(Date.now() - 12 * 60 * 60 * 1000),
            kronologiSingkat:
              'Subjek [TEST] Tersangka 1 diamankan petugas Satresnarkoba saat berada di area parkir. Ditemukan 1 bungkus plastik klip kecil berisi kristal sabu dengan berat bruto 0.35 gram di dalam saku celana. Hasil tes urine awal di Polresta menunjukkan positif Metamfetamina.',
            barangBuktiList: {
              create: [
                {
                  jenisZat: 'Metamfetamina (Sabu)',
                  beratKotorGram: 0.35,
                  beratBersihGram: 0.22,
                  statusUjiLab: StatusUjiLab.positif,
                  nomorSuratLab: 'LAB-SMD/X/2026/221',
                  keterangan: '1 bungkus plastik klip transparan berisi kristal putih sabu sisa pakai',
                },
                {
                  jenisZat: 'Peralatan Konsumsi Narkotika',
                  beratBersihGram: 0.0,
                  statusUjiLab: StatusUjiLab.belum_uji,
                  keterangan: '1 buah pipa kaca / pipet dan korek api gas modifikasi',
                },
              ],
            },
          },
        },

        dokumenList: {
          create: [
            {
              nama: 'Surat Permohonan Asesmen TAT dari Kasatresnarkoba',
              kode: 'SURAT_PERMOHONAN',
              wajib: true,
              keterangan: 'Surat resmi bernomor B/155/X/2026/Resnarkoba perihal permohonan asesmen terpadu',
              fileUrl: 'https://placehold.co/800x1100/1e293b/white?text=SURAT+PERMOHONAN+TAT-0105.PDF',
              fileName: 'Surat_Permohonan_TAT_105.pdf',
              fileSize: '1.2 MB',
              uploadedAt: today,
              statusVerifikasi: StatusVerifikasiDokumen.belum_diperiksa,
            },
            {
              nama: 'Laporan Polisi (LP) Asli / Legalisir',
              kode: 'LAPORAN_POLISI',
              wajib: true,
              keterangan: 'LP/A/155/X/2026/SPKT/POLRESTA_SMD lengkap dengan tanda tangan KA SPKT',
              fileUrl: 'https://placehold.co/800x1100/1e293b/white?text=LAPORAN+POLISI+LP-155.PDF',
              fileName: 'Laporan_Polisi_LP_155.pdf',
              fileSize: '850 KB',
              uploadedAt: today,
              statusVerifikasi: StatusVerifikasiDokumen.belum_diperiksa,
            },
            {
              nama: 'Surat Perintah Penangkapan & Penahanan (Sp.Kap & Sp.Han)',
              kode: 'SP_KAP_HAN',
              wajib: true,
              keterangan: 'Sp.Kap/155/X/2026/Resnarkoba tanggal penangkapan',
              fileUrl: 'https://placehold.co/800x1100/1e293b/white?text=SP_KAP_HAN_155.PDF',
              fileName: 'Surat_Perintah_Penangkapan_155.pdf',
              fileSize: '620 KB',
              uploadedAt: today,
              statusVerifikasi: StatusVerifikasiDokumen.belum_diperiksa,
            },
            {
              nama: 'Berita Acara Pemeriksaan Urine Awal',
              kode: 'BA_URINE',
              wajib: true,
              keterangan: 'Hasil strip test 6-parameter di Polresta dengan hasil positif MET/AMP',
              fileUrl: 'https://placehold.co/800x1100/1e293b/white?text=BA_URINE_AWAL_155.PDF',
              fileName: 'BA_Urine_Awal_155.pdf',
              fileSize: '740 KB',
              uploadedAt: today,
              statusVerifikasi: StatusVerifikasiDokumen.belum_diperiksa,
            },
            {
              nama: 'Berita Acara Penyitaan dan Penimbangan Barang Bukti',
              kode: 'BA_SITA_TIMBANG',
              wajib: true,
              keterangan: 'BA Sita dan BA Timbang Pegadaian netto 0.22 gram',
              fileUrl: 'https://placehold.co/800x1100/1e293b/white?text=BA_SITA_TIMBANG_155.PDF',
              fileName: 'BA_Sita_Timbang_155.pdf',
              fileSize: '910 KB',
              uploadedAt: today,
              statusVerifikasi: StatusVerifikasiDokumen.belum_diperiksa,
            },
            {
              nama: 'Resume Singkat Perkara Penyidikan',
              kode: 'RESUME_PERKARA',
              wajib: true,
              keterangan: 'Uraian fakta penangkapan, latar belakang tersangka, dan bukti permulaan',
              fileUrl: 'https://placehold.co/800x1100/1e293b/white?text=RESUME_PERKARA_155.PDF',
              fileName: 'Resume_Perkara_155.pdf',
              fileSize: '1.4 MB',
              uploadedAt: today,
              statusVerifikasi: StatusVerifikasiDokumen.belum_diperiksa,
            },
          ],
        },

        auditLogs: {
          create: [
            {
              actorId: pengaju.id,
              actorNama: pengaju.name,
              actorPeran: 'PENGAJU',
              aksi: 'SUBMIT_PERMOHONAN',
              rincian: 'Penyidik Satresnarkoba mendaftarkan permohonan asesmen TAT baru untuk [TEST] Tersangka 1.',
              timestamp: today,
            },
          ],
        },
      },
    });
    console.log('  ✔ Permohonan TAT/2026/10/0105 ([TEST] Tersangka 1 - Admin Verifikasi) seeded.');
  }

  // =========================================================================
  // KASUS 2: ROLE MEDIS (AKTIF ASESMEN MEDIS - MENUNGGU PEMERIKSAAN MEDIS HARI INI)
  // Nomor: TAT/2026/10/0103 | Tersangka: [TEST] Tersangka 2
  // =========================================================================
  const existing103 = await prisma.permohonanAsesmen.findFirst({
    where: { nomorPermohonan: 'TAT/2026/10/0103' },
  });

  if (!existing103) {
    console.log('  -> [MEDIS] Membuat permohonan TAT/2026/10/0103 ([TEST] Tersangka 2 - Medis Draft)...');
    await prisma.permohonanAsesmen.create({
      data: {
        nomorPermohonan: 'TAT/2026/10/0103',
        trackingNumber: 'TRACK-202610-103',
        tanggalPengajuan: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        jenisPengajuan: JenisPengajuan.penangkapan_dengan_bb,
        metodePelaksanaan: MetodePelaksanaan.luring,
        satuanKerjaTujuan: 'BNNP Kalimantan Timur',
        instansiPengaju: pengaju.agency || 'Satresnarkoba Polresta Samarinda',
        pengaju: { connect: { id: pengaju.id } },
        applicationStatus: ApplicationStatus.ASSESSMENT_ACTIVE,
        medicalStatus: AssessmentStatus.DRAFT,
        legalStatus: AssessmentStatus.NOT_STARTED,
        tenggatSlaTanggal: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        isMendekatiTenggat: false,
        isMelewatiTenggat: false,

        terperiksa: {
          create: {
            namaLengkap: '[TEST] Tersangka 2',
            alias: 'Tersangka Uji 2',
            nik: '6472025510980002',
            isNikVerified: true,
            statusIdentitasKhusus: 'KTP Elektronik Terverifikasi Dukcapil (Data Uji)',
            tempatLahir: 'Balikpapan',
            tanggalLahir: new Date('1998-10-15'),
            usia: 28,
            jenisKelamin: 'Perempuan',
            pekerjaan: 'Pegawai Honorer',
            alamatKtp: 'Jl. Antasari No. 12 RT 05, Samarinda',
            alamatDomisili: 'Jl. Antasari No. 12 RT 05, Samarinda',
            namaWaliPendamping: 'Wali Tersangka 2',
            kontakWali: '082155678901',
          },
        },

        perkara: {
          create: {
            nomorLaporanPolisi: 'LP/A/148/X/2026/SPKT/POLRESTA_SMD',
            tanggalLp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            instansiPenyidik: 'Satresnarkoba Polresta Samarinda',
            namaPenyidik: pengajuUser.name,
            nomorHpPenyidik: '081298765432',
            pasalDipersangkakan: 'Pasal 127 ayat (1) huruf a UU RI No. 35 Tahun 2009 tentang Narkotika',
            tempatKejadianPerkara: 'Sebuah kamar kos di Jl. Banggeris, Kel. Karang Anyar, Samarinda',
            tanggalWaktuPenangkapan: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            kronologiSingkat:
              'Subjek [TEST] Tersangka 2 diamankan oleh tim opsnal satresnarkoba saat berada di kamar kos. Ditemukan 1 plastik klip kecil sisa pakai dengan serbuk sabu seberat 0.25 gram bruto dan sedotan pipet kaca.',
            barangBuktiList: {
              create: [
                {
                  jenisZat: 'Metamfetamina (Sabu)',
                  beratKotorGram: 0.25,
                  beratBersihGram: 0.14,
                  statusUjiLab: StatusUjiLab.positif,
                  nomorSuratLab: 'LAB-SMD/X/2026/188',
                  keterangan: '1 bungkus plastik klip kecil berisi serbuk kristal sabu sisa konsumsi',
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
            jadwalPemeriksaanMedis: todayMorning, // Hari ini!
            jadwalPemeriksaanHukum: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            lokasiPemeriksaan: 'Klinik Pratama BNNP Kalimantan Timur (Ruang Asesmen Medis 01)',
          },
        },

        dokumenList: {
          create: [
            {
              nama: 'Surat Permohonan Asesmen TAT dari Penyidik',
              kode: 'SURAT_PERMOHONAN',
              wajib: true,
              keterangan: 'Surat resmi Kasatresnarkoba Polresta Samarinda',
              fileUrl: 'https://placehold.co/800x1100/1e293b/white?text=SURAT+PERMOHONAN+TAT-0103.PDF',
              fileName: 'Surat_Permohonan_TAT_103.pdf',
              fileSize: '1.1 MB',
              uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              statusVerifikasi: StatusVerifikasiDokumen.sesuai,
            },
            {
              nama: 'Laporan Polisi (LP)',
              kode: 'LAPORAN_POLISI',
              wajib: true,
              keterangan: 'LP/A/148/X/2026/SPKT/POLRESTA_SMD',
              fileUrl: 'https://placehold.co/800x1100/1e293b/white?text=LAPORAN+POLISI+LP-148.PDF',
              fileName: 'Laporan_Polisi_LP_148.pdf',
              fileSize: '780 KB',
              uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              statusVerifikasi: StatusVerifikasiDokumen.sesuai,
            },
            {
              nama: 'Hasil Uji Laboratorium Urine & BB',
              kode: 'HASIL_LAB',
              wajib: true,
              keterangan: 'Labfor positif Metamfetamin',
              fileUrl: 'https://placehold.co/800x1100/1e293b/white?text=HASIL+LAB+148.PDF',
              fileName: 'Hasil_Lab_148.pdf',
              fileSize: '650 KB',
              uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              statusVerifikasi: StatusVerifikasiDokumen.sesuai,
            },
          ],
        },

        asesmenMedis: {
          create: {
            asesorId: medisUser.id,
            asesorNama: medisUser.name,
            status: AssessmentStatus.DRAFT,
            kondisiFisik: 'Subjek [TEST] Tersangka 2 tampak sadar, compos mentis, tremor halus pada kedua tangan, pupil isokor dilatasi ringan.',
            tekananDarah: '125/85 mmHg',
            denyutNadi: '86 bpm',
            tandaBekasSuntikan: false,
            komorbiditasMedis: 'Gastritis kronis episodik',
            kondisiPsikologis: 'Afek cemas sedang, insomnia dalam 3 hari terakhir, orientasi ruang dan waktu baik.',
            instrumen: 'DAST-10 / ASSIST',
            skorInstrumen: 16.0,
            tingkatRisikoInstrumen: 'Sedang (Moderate Risk)',
            diagnosisKlinisIcd: 'F15.1 Gangguan Penggunaan Stimulan Kategori Ringan-Sedang',
            interpretasiKlinis: 'Ketergantungan psikologis aktif fase awal dengan toleransi meningkat.',
            kebutuhanRawat: 'Rawat Jalan',
            durasiUsulanBulan: 3,
            hasilUrin: {
              create: [
                { parameter: 'MET', hasil: 'Positif' },
                { parameter: 'AMP', hasil: 'Positif' },
                { parameter: 'THC', hasil: 'Negatif' },
                { parameter: 'BZO', hasil: 'Negatif' },
                { parameter: 'MOP', hasil: 'Negatif' },
                { parameter: 'COC', hasil: 'Negatif' },
              ],
            },
            riwayatZat: {
              create: [
                {
                  jenisZat: 'Sabu (Metamfetamina)',
                  caraPakai: 'Hisap (Bong)',
                  frekuensi: '2-3 kali seminggu saat lembur malam',
                  lamaPemakaianBulan: 6,
                  terakhirPakai: '2 hari sebelum penangkapan',
                },
              ],
            },
          },
        },

        asesmenHukum: {
          create: {
            asesorId: hukumUser.id,
            asesorNama: hukumUser.name,
            status: AssessmentStatus.NOT_STARTED,
            analisisPeran: AnalisisPeran.Belum_Dapat_Disimpulkan,
          },
        },

        auditLogs: {
          create: [
            {
              actorId: pengaju.id,
              actorNama: pengaju.name,
              actorPeran: 'PENGAJU',
              aksi: 'SUBMIT_PERMOHONAN',
              rincian: 'Penyidik mengajukan permohonan asesmen terpadu atas nama [TEST] Tersangka 2.',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            },
            {
              actorId: adminUser.id,
              actorNama: adminUser.name,
              actorPeran: 'ADMIN',
              aksi: 'VERIFIKASI_BERKAS',
              rincian: 'Sekretariat TAT memverifikasi berkas persyaratan 100% lengkap dan menetapkan jadwal tim.',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            },
            {
              actorId: medisUser.id,
              actorNama: medisUser.name,
              actorPeran: 'MEDIS',
              aksi: 'DRAFT_ASESMEN_MEDIS',
              rincian: 'Dokter Asesor Medis menyimpan draf awal asesmen medis dan tes urine.',
              timestamp: todayMorning,
            },
          ],
        },
      },
    });
    console.log('  ✔ Permohonan TAT/2026/10/0103 ([TEST] Tersangka 2 - Dokter Medis) seeded.');
  }

  // =========================================================================
  // KASUS 3: ROLE HUKUM (AKTIF ASESMEN HUKUM - MEDIS FINAL, HUKUM MENELAAH HARI INI)
  // Nomor: TAT/2026/10/0101 | Tersangka: [TEST] Tersangka 3
  // =========================================================================
  const existing101 = await prisma.permohonanAsesmen.findFirst({
    where: { nomorPermohonan: 'TAT/2026/10/0101' },
  });

  if (!existing101) {
    console.log('  -> [HUKUM] Membuat permohonan TAT/2026/10/0101 ([TEST] Tersangka 3 - Hukum Draft)...');
    await prisma.permohonanAsesmen.create({
      data: {
        nomorPermohonan: 'TAT/2026/10/0101',
        trackingNumber: 'TRACK-202610-101',
        tanggalPengajuan: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        jenisPengajuan: JenisPengajuan.penangkapan_dengan_bb,
        metodePelaksanaan: MetodePelaksanaan.luring,
        satuanKerjaTujuan: 'BNNP Kalimantan Timur',
        instansiPengaju: pengaju.agency || 'Satresnarkoba Polresta Samarinda',
        pengaju: { connect: { id: pengaju.id } },
        applicationStatus: ApplicationStatus.ASSESSMENT_ACTIVE,
        medicalStatus: AssessmentStatus.FINAL, // Medis selesai!
        legalStatus: AssessmentStatus.DRAFT,   // Jaksa sedang menelaah hari ini!
        tenggatSlaTanggal: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        isMendekatiTenggat: false,
        isMelewatiTenggat: false,

        terperiksa: {
          create: {
            namaLengkap: '[TEST] Tersangka 3',
            alias: 'Tersangka Uji 3',
            nik: '6472031109960003',
            isNikVerified: true,
            statusIdentitasKhusus: 'KTP Elektronik Terverifikasi Dukcapil (Data Uji)',
            tempatLahir: 'Samarinda',
            tanggalLahir: new Date('1996-09-11'),
            usia: 30,
            jenisKelamin: 'Laki-laki',
            pekerjaan: 'Mekanik Bengkel Motor',
            alamatKtp: 'Jl. Kemakmuran Gang 2 No. 15, Samarinda',
            alamatDomisili: 'Jl. Kemakmuran Gang 2 No. 15, Samarinda',
            namaWaliPendamping: 'Wali Tersangka 3',
            kontakWali: '081347665544',
          },
        },

        perkara: {
          create: {
            nomorLaporanPolisi: 'LP/A/145/X/2026/SPKT/POLRESTA_SMD',
            tanggalLp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            instansiPenyidik: 'Satresnarkoba Polresta Samarinda',
            namaPenyidik: pengajuUser.name,
            nomorHpPenyidik: '081298765432',
            pasalDipersangkakan: 'Pasal 127 ayat (1) huruf a UU RI No. 35 Tahun 2009 tentang Narkotika',
            tempatKejadianPerkara: 'Sebuah bengkel motor di Jl. Gerilya, Samarinda',
            tanggalWaktuPenangkapan: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            kronologiSingkat:
              'Subjek [TEST] Tersangka 3 ditangkap saat istirahat di bengkel. Ditemukan 1 bungkus plastik klip kecil berisi serbuk kristal sabu dengan berat netto 0.18 gram. Subjek mengaku membeli seharga Rp 200.000 untuk dikonsumsi sendiri agar kuat bekerja malam.',
            barangBuktiList: {
              create: [
                {
                  jenisZat: 'Metamfetamina (Sabu)',
                  beratKotorGram: 0.32,
                  beratBersihGram: 0.18,
                  statusUjiLab: StatusUjiLab.positif,
                  nomorSuratLab: 'LAB-SMD/X/2026/195',
                  keterangan: '1 bungkus plastik klip berisi kristal putih sabu netto 0.18 gram',
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
            jadwalPemeriksaanMedis: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            jadwalPemeriksaanHukum: todayAfternoon, // Hari ini!
            lokasiPemeriksaan: 'Ruang Pemeriksaan Hukum Terpadu BNNP Kaltim',
          },
        },

        dokumenList: {
          create: [
            {
              nama: 'Surat Permohonan Asesmen TAT',
              kode: 'SURAT_PERMOHONAN',
              wajib: true,
              keterangan: 'Surat permohonan resmi penyidik',
              fileUrl: 'https://placehold.co/800x1100/1e293b/white?text=SURAT+PERMOHONAN+TAT-0101.PDF',
              fileName: 'Surat_Permohonan_TAT_101.pdf',
              fileSize: '1.0 MB',
              uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              statusVerifikasi: StatusVerifikasiDokumen.sesuai,
            },
            {
              nama: 'Laporan Polisi (LP)',
              kode: 'LAPORAN_POLISI',
              wajib: true,
              keterangan: 'LP/A/145/X/2026/SPKT/POLRESTA_SMD',
              fileUrl: 'https://placehold.co/800x1100/1e293b/white?text=LP_145.PDF',
              fileName: 'Laporan_Polisi_LP_145.pdf',
              fileSize: '820 KB',
              uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              statusVerifikasi: StatusVerifikasiDokumen.sesuai,
            },
          ],
        },

        asesmenMedis: {
          create: {
            asesorId: medisUser.id,
            asesorNama: medisUser.name,
            status: AssessmentStatus.FINAL, // Sudah Final oleh Dokter!
            kondisiFisik: 'Kondisi umum sedang, kesadaran compos mentis, gizi cukup, tanda vital stabil (TD 120/80 mmHg, HR 80 bpm).',
            tekananDarah: '120/80 mmHg',
            denyutNadi: '80 bpm',
            tandaBekasSuntikan: false,
            komorbiditasMedis: 'Tidak ada penyakit penyerta bermakna',
            kondisiPsikologis: 'Kecemasan ringan terkait status hukum, kontak mata adekuat, motivasi pulih cukup kuat.',
            instrumen: 'ASSIST',
            skorInstrumen: 18.0,
            tingkatRisikoInstrumen: 'Sedang (Moderate Risk)',
            diagnosisKlinisIcd: 'F15.1 Penggunaan Merugikan Zat Stimulan Kategori Ringan-Sedang',
            interpretasiKlinis: 'Subjek membutuhkan intervensi rehabilitasi rawat jalan secara terstruktur.',
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
                  lamaPemakaianBulan: 5,
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
            status: AssessmentStatus.DRAFT, // Sedang ditelaah Jaksa!
            pernahDitangkap: false,
            terverifikasiDatabase: true,
            analisisPeran: AnalisisPeran.Penyalahguna_Murni,
            argumentasiPeran:
              'Barang bukti netto 0.18 gram (di bawah batasan SEMA No. 4 Tahun 2010 yaitu 1.0 gram). Tidak ditemukan timbangan digital, plastik klip kosong, atau buku catatan penjualan. Hasil pemeriksaan digital forensik ponsel tidak menunjukkan komunikasi transaksi jual-beli narkotika.',
            faktaPendukung: [
              'Barang bukti netto 0.18 gram di bawah ambang SEMA No. 4/2010',
              'Hasil tes laboratorium forensik urin positif Metamfetamina',
              'Tidak memiliki catatan kriminalitas sebelumnya (Bukan Residivis)',
              'Tidak terindikasi masuk jaringan peredaran gelap narkotika',
            ],
            kesimpulanHukum: 'Tersangka memenuhi kualifikasi yuridis sebagai Penyalahguna Narkotika untuk Diri Sendiri (Korban Penyalahgunaan Narkotika).',
            rekomendasiHukum: RekomendasiHukum.Proses_Hukum_Dilanjutkan_dengan_Rehabilitasi,
          },
        },

        auditLogs: {
          create: [
            {
              actorId: pengaju.id,
              actorNama: pengaju.name,
              actorPeran: 'PENGAJU',
              aksi: 'SUBMIT_PERMOHONAN',
              rincian: 'Penyidik mengajukan permohonan asesmen terpadu atas nama [TEST] Tersangka 3.',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            },
            {
              actorId: medisUser.id,
              actorNama: medisUser.name,
              actorPeran: 'MEDIS',
              aksi: 'FINALISASI_ASESMEN_MEDIS',
              rincian: 'Dokter Asesor Medis memfinalisasi hasil asesmen medis dengan rekomendasi Rawat Jalan 3 bulan.',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            },
            {
              actorId: hukumUser.id,
              actorNama: hukumUser.name,
              actorPeran: 'HUKUM',
              aksi: 'MULAI_TELAAH_HUKUM',
              rincian: 'Jaksa Asesor Hukum mulai melakukan telaah yuridis fakta perkara.',
              timestamp: todayAfternoon,
            },
          ],
        },
      },
    });
    console.log('  ✔ Permohonan TAT/2026/10/0101 ([TEST] Tersangka 3 - Jaksa Hukum) seeded.');
  }

  // =========================================================================
  // KASUS 4: ROLE SIDANG PLENO & TTE (PLENO SELESAI - MENUNGGU TANDA TANGAN DIGITAL)
  // Nomor: TAT/2026/10/0099 | Tersangka: [TEST] Tersangka 4
  // =========================================================================
  const existing099 = await prisma.permohonanAsesmen.findFirst({
    where: { nomorPermohonan: 'TAT/2026/10/0099' },
  });

  if (!existing099) {
    console.log('  -> [PLENO / TTE] Membuat permohonan TAT/2026/10/0099 ([TEST] Tersangka 4 - Pleno Selesai)...');
    await prisma.permohonanAsesmen.create({
      data: {
        nomorPermohonan: 'TAT/2026/10/0099',
        trackingNumber: 'TRACK-202610-099',
        tanggalPengajuan: new Date('2026-10-02T08:30:00Z'),
        jenisPengajuan: JenisPengajuan.penangkapan_dengan_bb,
        metodePelaksanaan: MetodePelaksanaan.luring,
        satuanKerjaTujuan: 'BNNP Kalimantan Timur',
        instansiPengaju: pengaju.agency || 'Satresnarkoba Polresta Samarinda',
        pengaju: { connect: { id: pengaju.id } },
        applicationStatus: ApplicationStatus.CONFERENCE_HELD,
        medicalStatus: AssessmentStatus.COMPLETED,
        legalStatus: AssessmentStatus.COMPLETED,
        tenggatSlaTanggal: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        isMendekatiTenggat: true,
        isMelewatiTenggat: false,

        terperiksa: {
          create: {
            namaLengkap: '[TEST] Tersangka 4',
            alias: 'Tersangka Uji 4',
            nik: '6472011504950004',
            isNikVerified: true,
            statusIdentitasKhusus: 'KTP Elektronik Terverifikasi Dukcapil (Data Uji)',
            tempatLahir: 'Samarinda',
            tanggalLahir: new Date('1995-04-15'),
            usia: 31,
            jenisKelamin: 'Laki-laki',
            pekerjaan: 'Karyawan Swasta',
            alamatKtp: 'Jl. Pahlawan No. 24 RT 12, Samarinda',
            alamatDomisili: 'Jl. Pahlawan No. 24 RT 12, Samarinda',
            namaWaliPendamping: 'Wali Tersangka 4',
            kontakWali: '081347891234',
          },
        },

        perkara: {
          create: {
            nomorLaporanPolisi: 'LP/A/142/X/2026/SPKT/POLRESTA_SMD',
            tanggalLp: new Date('2026-10-01'),
            instansiPenyidik: 'Satresnarkoba Polresta Samarinda',
            namaPenyidik: pengajuUser.name,
            nomorHpPenyidik: '081298765432',
            pasalDipersangkakan: 'Pasal 127 ayat (1) huruf a UU RI No. 35 Tahun 2009 tentang Narkotika',
            tempatKejadianPerkara: 'Sebuah rumah tinggal di Jl. Juanda No. 88, Samarinda',
            tanggalWaktuPenangkapan: new Date('2026-10-01T21:30:00Z'),
            kronologiSingkat:
              'Subjek [TEST] Tersangka 4 diamankan saat berada di kediamannya. Petugas mengamankan 1 paket klip kecil berisi kristal putih diduga narkotika jenis sabu dengan berat bruto 0.42 gram di dalam saku celana depan kanan beserta alat hisap bong.',
            barangBuktiList: {
              create: [
                {
                  jenisZat: 'Metamfetamina (Sabu)',
                  beratKotorGram: 0.42,
                  beratBersihGram: 0.28,
                  statusUjiLab: StatusUjiLab.positif,
                  nomorSuratLab: 'LAB-SMD/X/2026/172',
                  keterangan: '1 bungkus plastik klip kecil berisi serbuk kristal sabu',
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
            jadwalPemeriksaanMedis: new Date('2026-10-04T09:00:00Z'),
            jadwalPemeriksaanHukum: new Date('2026-10-05T13:30:00Z'),
            jadwalPleno: new Date('2026-10-08T10:00:00Z'),
            lokasiPemeriksaan: 'Ruang TAT BNNP Kalimantan Timur, Samarinda',
          },
        },

        dokumenList: {
          create: [
            {
              nama: 'Surat Permohonan Asesmen TAT dari Kasatresnarkoba',
              kode: 'SURAT_PERMOHONAN',
              wajib: true,
              keterangan: 'Surat resmi bernomor B/142/X/2026/Resnarkoba',
              fileUrl: 'https://placehold.co/800x1100/1e293b/white?text=SURAT+PERMOHONAN+TAT-0099.PDF',
              fileName: 'Surat_Permohonan_TAT_099.pdf',
              fileSize: '1.2 MB',
              uploadedAt: new Date('2026-10-02T08:30:00Z'),
              statusVerifikasi: StatusVerifikasiDokumen.sesuai,
            },
            {
              nama: 'Laporan Polisi (LP) Asli / Legalisir',
              kode: 'LAPORAN_POLISI',
              wajib: true,
              keterangan: 'LP/A/142/X/2026/SPKT/POLRESTA_SMD',
              fileUrl: 'https://placehold.co/800x1100/1e293b/white?text=LAPORAN+POLISI+LP-142.PDF',
              fileName: 'Laporan_Polisi_LP_142.pdf',
              fileSize: '950 KB',
              uploadedAt: new Date('2026-10-02T08:30:00Z'),
              statusVerifikasi: StatusVerifikasiDokumen.sesuai,
            },
          ],
        },

        asesmenMedis: {
          create: {
            asesorId: medisUser.id,
            asesorNama: medisUser.name,
            status: AssessmentStatus.COMPLETED,
            kondisiFisik: 'Kondisi umum baik, kesadaran compos mentis, tidak ditemukan bekas luka traumatis.',
            tekananDarah: '120/80 mmHg',
            denyutNadi: '78 bpm',
            tandaBekasSuntikan: false,
            komorbiditasMedis: 'Tidak ada penyakit kronis atau infeksi menular akut.',
            kondisiPsikologis: 'Kecemasan ringan hingga sedang, orientasi ruang dan waktu baik.',
            instrumen: 'ASSIST v3.0 / DAST-10',
            skorInstrumen: 22.0,
            tingkatRisikoInstrumen: 'Sedang-Tinggi (Moderate-High Risk)',
            diagnosisKlinisIcd: 'F15.2 Sindrom Ketergantungan Stimulan (Amfetamin/Metamfetamin)',
            interpretasiKlinis: 'Subjek mengalami ketergantungan stimulan aktif dengan frekuensi penggunaan mingguan.',
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
            riwayatZat: {
              create: [
                {
                  jenisZat: 'Sabu (Metamfetamina)',
                  caraPakai: 'Hisap (Bong)',
                  frekuensi: '3-4 kali seminggu',
                  lamaPemakaianBulan: 14,
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
            status: AssessmentStatus.COMPLETED,
            pernahDitangkap: false,
            terverifikasiDatabase: true,
            analisisPeran: AnalisisPeran.Penyalahguna_Murni,
            argumentasiPeran:
              'Barang bukti netto 0.28 gram di bawah batasan SEMA No. 4 Tahun 2010 (1 gram). Tidak ditemukan indikasi keterlibatan peredaran gelap atau sindikat.',
            faktaPendukung: [
              'Barang bukti netto 0.28 gram di bawah ambang batas SEMA 4/2010',
              'Urine terkonfirmasi Positif Metamfetamin',
              'Bukan residivis narkotika',
              'Tidak ada barang bukti timbangan, uang penjualan, atau alat edar',
            ],
            kesimpulanHukum: 'Tersangka memenuhi kriteria penyalahguna narkotika murni untuk diri sendiri.',
            rekomendasiHukum: RekomendasiHukum.Proses_Hukum_Dilanjutkan_dengan_Rehabilitasi,
          },
        },

        sidangPleno: {
          create: {
            tanggalPleno: new Date('2026-10-08T10:00:00Z'),
            tempat: 'Ruang Sidang Utama TAT Lantai 2 BNNP Kalimantan Timur',
            pimpinanPleno: adminUser.name,
            nomorBeritaAcara: 'BA-PLENO/142/X/2026/BNNP-KALTIM',
            statusPleno: StatusPleno.selesai_sepakat,
            kesepakatanRekomendasi:
              'Tim Asesmen Terpadu bersepakat bulat merekomendasikan tersangka [TEST] Tersangka 4 menjalani Rehabilitasi Medis dan Sosial Rawat Inap selama 3 (tiga) bulan di Balai Rehabilitasi BNN Tanah Merah, dengan proses hukum tetap dilanjutkan.',
            jenisRekomendasiFinal: JenisRekomendasiFinal.rehabilitasi_rawat_inap,
            durasiRehabBulan: 3,
            fasilitasRujukanUsulan: 'Balai Rehabilitasi BNN Tanah Merah Samarinda',
            fileBeritaAcaraSigned: 'https://placehold.co/800x1100/1e293b/white?text=BERITA+ACARA+PLENO+TAT-0099.PDF',
            daftarHadir: {
              create: [
                {
                  nama: adminUser.name,
                  peran: 'Pimpinan Sidang / Sekretariat TAT',
                  instansi: 'BNNP Kalimantan Timur',
                  hadir: true,
                },
                {
                  nama: medisUser.name,
                  peran: 'Asesor Medis / Dokter Pemeriksa',
                  instansi: 'Klinik Pratama BNNP Kalimantan Timur',
                  hadir: true,
                },
                {
                  nama: hukumUser.name,
                  peran: 'Asesor Hukum / Kejaksaan',
                  instansi: 'Kejaksaan Tinggi Kalimantan Timur',
                  hadir: true,
                },
                {
                  nama: pengajuUser.name,
                  peran: 'Penyidik Pengaju',
                  instansi: 'Satresnarkoba Polresta Samarinda',
                  hadir: true,
                },
              ],
            },
          },
        },

        rekomendasiResmi: {
          create: {
            nomorSurat: 'R-TAT/142/X/2026/BNNP-KALTIM',
            tanggalTerbit: new Date('2026-10-09T14:00:00Z'),
            dibuatOleh: adminUser.name,
            ringkasanMedis: 'Diagnosis F15.2 Sindrom Ketergantungan Stimulan, skor ASSIST 22. Rekomendasi Rawat Inap 3 bulan di Balai Rehabilitasi.',
            ringkasanHukum: 'Peran Penyalahguna Murni untuk diri sendiri, BB netto 0.28 gram sesuai batasan SEMA 4/2010. Proses hukum dilanjutkan Pasal 127 UU 35/2009.',
            rekomendasiFinalText: 'Rehabilitasi Medis dan Sosial Rawat Inap selama 3 (tiga) bulan di Balai Rehabilitasi BNN Tanah Merah Samarinda.',
            filePdfUrl: 'https://placehold.co/800x1100/1e293b/white?text=SURAT+REKOMENDASI+RESMI+TAT-0099.PDF',
            qrVerificationCode: 'QR-VALID-TAT-142-X-2026',
            daftarPengesah: {
              create: [
                {
                  nama: adminUser.name,
                  jabatan: 'Ketua Tim Asesmen Terpadu / Kepala BNNP Kaltim',
                  instansi: 'BNNP Kalimantan Timur',
                  status: StatusPengesah.disahkan,
                  tanggalPengesahan: new Date('2026-10-09T15:30:00Z'),
                },
                {
                  nama: medisUser.name,
                  jabatan: 'Asesor Medis TAT (Dokter Pemeriksa)',
                  instansi: 'Klinik Pratama BNNP Kalimantan Timur',
                  status: StatusPengesah.menunggu,
                },
                {
                  nama: hukumUser.name,
                  jabatan: 'Asesor Hukum TAT (Jaksa Penuntut / Kejati)',
                  instansi: 'Kejaksaan Tinggi Kalimantan Timur',
                  status: StatusPengesah.menunggu,
                },
              ],
            },
          },
        },

        auditLogs: {
          create: [
            {
              actorId: pengaju.id,
              actorNama: pengaju.name,
              actorPeran: 'PENGAJU',
              aksi: 'SUBMIT_PERMOHONAN',
              rincian: 'Penyidik mengajukan permohonan asesmen TAT atas nama [TEST] Tersangka 4.',
              timestamp: new Date('2026-10-02T08:30:00Z'),
            },
            {
              actorId: adminUser.id,
              actorNama: adminUser.name,
              actorPeran: 'ADMIN',
              aksi: 'PELAKSANAAN_PLENO',
              rincian: 'Sidang Pleno TAT selesai dengan kesepakatan Rawat Inap 3 bulan di Balai Rehab BNN.',
              timestamp: new Date('2026-10-08T12:30:00Z'),
            },
            {
              actorId: adminUser.id,
              actorNama: adminUser.name,
              actorPeran: 'ADMIN',
              aksi: 'PENGESAHAN_DOKUMEN',
              rincian: 'Ketua Tim menandatangani draf rekomendasi resmi. Menunggu tanda tangan anggota tim.',
              timestamp: new Date('2026-10-09T15:30:00Z'),
            },
          ],
        },
      },
    });
    console.log('  ✔ Permohonan TAT/2026/10/0099 ([TEST] Tersangka 4 - Pleno / TTE) seeded.');
  }

  // =========================================================================
  // KASUS 5: ROLE PENGAJU (PERLU PERBAIKAN BERKAS / KOREKSI FORMIL)
  // Nomor: TAT/2026/10/0095 | Tersangka: [TEST] Tersangka 5
  // =========================================================================
  const existing095 = await prisma.permohonanAsesmen.findFirst({
    where: { nomorPermohonan: 'TAT/2026/10/0095' },
  });

  if (!existing095) {
    console.log('  -> [PENGAJU] Membuat permohonan TAT/2026/10/0095 ([TEST] Tersangka 5 - Perlu Perbaikan)...');
    await prisma.permohonanAsesmen.create({
      data: {
        nomorPermohonan: 'TAT/2026/10/0095',
        trackingNumber: 'TRACK-202610-095',
        tanggalPengajuan: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        jenisPengajuan: JenisPengajuan.penangkapan_dengan_bb,
        metodePelaksanaan: MetodePelaksanaan.luring,
        satuanKerjaTujuan: 'BNNP Kalimantan Timur',
        instansiPengaju: pengaju.agency || 'Satresnarkoba Polresta Samarinda',
        pengaju: { connect: { id: pengaju.id } },
        applicationStatus: ApplicationStatus.NEEDS_CORRECTION,
        medicalStatus: AssessmentStatus.NOT_STARTED,
        legalStatus: AssessmentStatus.NOT_STARTED,
        tenggatSlaTanggal: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        isMendekatiTenggat: true,
        isMelewatiTenggat: false,

        terperiksa: {
          create: {
            namaLengkap: '[TEST] Tersangka 5',
            alias: 'Tersangka Uji 5',
            nik: '6472010803970005',
            isNikVerified: true,
            statusIdentitasKhusus: 'KTP Elektronik Terverifikasi Dukcapil (Data Uji)',
            tempatLahir: 'Samarinda',
            tanggalLahir: new Date('1997-03-08'),
            usia: 29,
            jenisKelamin: 'Laki-laki',
            pekerjaan: 'Pengemudi Ojek Daring',
            alamatKtp: 'Jl. Pemuda No. 45 RT 10, Samarinda',
            alamatDomisili: 'Jl. Pemuda No. 45 RT 10, Samarinda',
            namaWaliPendamping: 'Wali Tersangka 5',
            kontakWali: '081299887711',
          },
        },

        perkara: {
          create: {
            nomorLaporanPolisi: 'LP/A/140/X/2026/SPKT/POLRESTA_SMD',
            tanggalLp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            instansiPenyidik: 'Satresnarkoba Polresta Samarinda',
            namaPenyidik: pengajuUser.name,
            nomorHpPenyidik: '081298765432',
            pasalDipersangkakan: 'Pasal 127 ayat (1) huruf a UU RI No. 35 Tahun 2009 tentang Narkotika',
            tempatKejadianPerkara: 'Pinggir jalan raya Jl. Cendana, Samarinda',
            tanggalWaktuPenangkapan: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            kronologiSingkat:
              'Subjek [TEST] Tersangka 5 diamankan saat menunggu penumpang. Ditemukan 1 bungkus sachet kecil serbuk kristal sabu seberat bruto 0.20 gram di saku jaket.',
            barangBuktiList: {
              create: [
                {
                  jenisZat: 'Metamfetamina (Sabu)',
                  beratKotorGram: 0.20,
                  beratBersihGram: 0.12,
                  statusUjiLab: StatusUjiLab.positif,
                  keterangan: '1 bungkus klip kecil sabu',
                },
              ],
            },
          },
        },

        dokumenList: {
          create: [
            {
              nama: 'Surat Permohonan Asesmen TAT',
              kode: 'SURAT_PERMOHONAN',
              wajib: true,
              keterangan: 'Surat resmi Kasat Resnarkoba',
              fileUrl: 'https://placehold.co/800x1100/1e293b/white?text=SURAT+PERMOHONAN+095.PDF',
              fileName: 'Surat_Permohonan_095.pdf',
              fileSize: '1.0 MB',
              uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
              statusVerifikasi: StatusVerifikasiDokumen.sesuai,
            },
            {
              nama: 'Berita Acara Sita dan Penimbangan Barang Bukti',
              kode: 'BA_SITA_TIMBANG',
              wajib: true,
              keterangan: 'Lembar penimbangan belum dilegalisir basah oleh instansi pegadaian / labfor.',
              fileUrl: 'https://placehold.co/800x1100/1e293b/white?text=BA_SITA_TIMBANG_095.PDF',
              fileName: 'BA_Sita_Timbang_095.pdf',
              fileSize: '890 KB',
              uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
              statusVerifikasi: StatusVerifikasiDokumen.perlu_perbaikan,
              catatanKoreksi: 'Lembar penimbangan belum ada stempel legalisir basah dan tanda tangan pejabat berwenang. Mohon unggah ulang hasil timbang resmi.',
            },
          ],
        },

        auditLogs: {
          create: [
            {
              actorId: pengaju.id,
              actorNama: pengaju.name,
              actorPeran: 'PENGAJU',
              aksi: 'SUBMIT_PERMOHONAN',
              rincian: 'Penyidik mendaftarkan permohonan asesmen TAT untuk [TEST] Tersangka 5.',
              timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            },
            {
              actorId: adminUser.id,
              actorNama: adminUser.name,
              actorPeran: 'ADMIN',
              aksi: 'MINTA_PERBAIKAN',
              rincian: 'Admin Sekretariat meminta perbaikan dokumen Berita Acara Sita dan Timbang BB.',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            },
          ],
        },
      },
    });
    console.log('  ✔ Permohonan TAT/2026/10/0095 ([TEST] Tersangka 5 - Koreksi Pengaju) seeded.');
  }

  console.log('✨ Selesai seeding Permohonan Asesmen Aktif per Role!');
}
