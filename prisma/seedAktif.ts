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
  console.log('📦 Seeding Permohonan Asesmen Aktif data...');

  // Cari user pengaju sesuai akun yang diminta
  const pengaju = await prisma.user.findFirst({
    where: { email: 'code72694@gmail.com' },
  });

  if (!pengaju) {
    console.warn('⚠️ User pengaju code72694@gmail.com tidak ditemukan. Lewati seeding aktif.');
    return;
  }

  // Cari admin/sekretariat
  const adminUser = await prisma.user.findFirst({
    where: { email: 'etatsiappulih@gmail.com' },
  }) || pengaju;

  // Cari asesor medis
  const medisUser = await prisma.user.findFirst({
    where: { email: 'k300gamers@gmail.com' },
  }) || pengaju;

  // Cari asesor hukum
  const hukumUser = await prisma.user.findFirst({
    where: { email: 'harykurniawan155@gmail.com' },
  }) || pengaju;

  // =========================================================================
  // 1. PERMOHONAN AKTIF 1: TAT/2026/10/0099 (Sidang Pleno Selesai, Menunggu TTE)
  // =========================================================================
  const existing099 = await prisma.permohonanAsesmen.findFirst({
    where: { nomorPermohonan: 'TAT/2026/10/0099' },
  });

  if (!existing099) {
    console.log('  -> Membuat permohonan TAT/2026/10/0099 (CONFERENCE_HELD)...');
    await prisma.permohonanAsesmen.create({
      data: {
        nomorPermohonan: 'TAT/2026/10/0099',
        trackingNumber: 'TRACK-202610-099',
        tanggalPengajuan: new Date('2026-10-02T08:30:00Z'),
        jenisPengajuan: JenisPengajuan.penangkapan_dengan_bb,
        metodePelaksanaan: MetodePelaksanaan.luring,
        satuanKerjaTujuan: 'BNNP Kalimantan Timur',
        instansiPengaju: pengaju.agency || 'Satresnarkoba Polresta Samarinda',
        pengajuId: pengaju.id,
        applicationStatus: ApplicationStatus.CONFERENCE_HELD,
        medicalStatus: AssessmentStatus.COMPLETED,
        legalStatus: AssessmentStatus.COMPLETED,
        tenggatSlaTanggal: new Date('2026-10-12T17:00:00Z'),
        isMendekatiTenggat: true,
        isMelewatiTenggat: false,

        terperiksa: {
          create: {
            namaLengkap: 'Dedi Kurniawan',
            alias: 'Dedi Bin Sukardi',
            nik: '6472011504950003',
            isNikVerified: true,
            statusIdentitasKhusus: 'KTP Terverifikasi Dukcapil',
            tempatLahir: 'Samarinda',
            tanggalLahir: new Date('1995-04-15'),
            usia: 31,
            jenisKelamin: 'Laki-laki',
            pekerjaan: 'Karyawan Swasta',
            alamatKtp: 'Jl. Pahlawan No. 24 RT 12, Kel. Dadi Mulya, Kec. Samarinda Ulu',
            alamatDomisili: 'Jl. Pahlawan No. 24 RT 12, Kel. Dadi Mulya, Kec. Samarinda Ulu',
            namaWaliPendamping: 'Sukardi',
            kontakWali: '081347891234',
          },
        },

        perkara: {
          create: {
            nomorLaporanPolisi: 'LP/A/142/X/2026/SPKT/POLRESTA_SMD',
            tanggalLp: new Date('2026-10-01'),
            instansiPenyidik: 'Satresnarkoba Polresta Samarinda',
            namaPenyidik: 'Ipda Budi Santoso, S.H.',
            nomorHpPenyidik: '081298765432',
            pasalDipersangkakan: 'Pasal 127 ayat (1) huruf a UU RI No. 35 Tahun 2009 tentang Narkotika',
            tempatKejadianPerkara: 'Sebuah rumah tinggal di Jl. Juanda No. 88, Samarinda',
            tanggalWaktuPenangkapan: new Date('2026-10-01T21:30:00Z'),
            kronologiSingkat:
              'Tersangka diamankan saat berada di kediamannya. Petugas mengamankan 1 paket klip kecil berisi kristal putih diduga narkotika jenis sabu dengan berat bruto 0.42 gram di dalam saku celana depan kanan beserta alat hisap bong.',
            barangBuktiList: {
              create: [
                {
                  jenisZat: 'Metamfetamina (Sabu)',
                  beratKotorGram: 0.42,
                  beratBersihGram: 0.18,
                  statusUjiLab: StatusUjiLab.positif,
                  nomorSuratLab: 'LAB-NN/1420/X/2026/PUSLABFOR',
                  tanggalSuratLab: new Date('2026-10-03'),
                  keterangan: 'Kristal putih positif mengandung Metamfetamina Golongan I',
                },
                {
                  jenisZat: 'Peralatan Konsumsi (Bong)',
                  beratKotorGram: 15.0,
                  beratBersihGram: 0.0,
                  statusUjiLab: StatusUjiLab.positif,
                  nomorSuratLab: 'LAB-NN/1421/X/2026/PUSLABFOR',
                  tanggalSuratLab: new Date('2026-10-03'),
                  keterangan: 'Pipet kaca dan sedotan plastik sisa pakai sabu',
                },
              ],
            },
          },
        },

        dokumenList: {
          create: [
            {
              nama: 'Surat Permohonan Asesmen dari Penyidik',
              kode: 'DOK-01',
              wajib: true,
              keterangan: 'Asli bertanda tangan Kasat Resnarkoba',
              fileName: 'Surat_Permohonan_TAT_Polresta_SMD_099.pdf',
              fileSize: '1.2 MB',
              statusVerifikasi: StatusVerifikasiDokumen.sesuai,
              uploadedAt: new Date('2026-10-02T08:35:00Z'),
            },
            {
              nama: 'Laporan Polisi (LP)',
              kode: 'DOK-02',
              wajib: true,
              keterangan: 'Legalisir SPKT',
              fileName: 'LP_A_142_X_2026_Polresta_SMD.pdf',
              fileSize: '2.4 MB',
              statusVerifikasi: StatusVerifikasiDokumen.sesuai,
              uploadedAt: new Date('2026-10-02T08:36:00Z'),
            },
            {
              nama: 'Surat Perintah Penyidikan (Spindik)',
              kode: 'DOK-03',
              wajib: true,
              keterangan: 'Salinan resmi',
              fileName: 'SP_Sidik_142_2026.pdf',
              fileSize: '1.1 MB',
              statusVerifikasi: StatusVerifikasiDokumen.sesuai,
              uploadedAt: new Date('2026-10-02T08:37:00Z'),
            },
            {
              nama: 'Berita Acara Penangkapan & Penggeledahan',
              kode: 'DOK-04',
              wajib: true,
              keterangan: 'Lengkap tanda tangan tersangka dan saksi',
              fileName: 'BA_Penangkapan_Dedi_K.pdf',
              fileSize: '1.8 MB',
              statusVerifikasi: StatusVerifikasiDokumen.sesuai,
              uploadedAt: new Date('2026-10-02T08:38:00Z'),
            },
            {
              nama: 'Berita Acara Penyitaan Barang Bukti',
              kode: 'DOK-05',
              wajib: true,
              keterangan: 'Rincian BB narkotika dan pipet',
              fileName: 'BA_Sita_BB_099.pdf',
              fileSize: '1.5 MB',
              statusVerifikasi: StatusVerifikasiDokumen.sesuai,
              uploadedAt: new Date('2026-10-02T08:39:00Z'),
            },
            {
              nama: 'Surat Hasil Uji Laboratorium Urine Puslabfor',
              kode: 'DOK-06',
              wajib: true,
              keterangan: 'Hasil parameter MET Positif',
              fileName: 'Hasil_Lab_Urine_Puslabfor.pdf',
              fileSize: '950 KB',
              statusVerifikasi: StatusVerifikasiDokumen.sesuai,
              uploadedAt: new Date('2026-10-03T10:00:00Z'),
            },
          ],
        },

        prasyaratPemeriksaan: {
          create: {
            waktuKedatangan: new Date('2026-10-04T09:00:00Z'),
            kehadiranSubjek: true,
            pencocokanIdentitas: true,
            catatanPencocokanIdentitas: 'Identitas fisik cocok dengan KTP Elektronik.',
            namaPengantar: 'Bripka Hendra Gunawan',
            instansiPengantar: 'Satresnarkoba Polresta Samarinda',
            jabatanPengantar: 'Banit Opsnal Unit 1',
            kehadiranPengantar: true,
            kehadiranPendamping: true,
            namaPendamping: 'Sukardi',
            hubunganPendamping: 'Ayah Kandung',
            dasarKeterlibatan: 'Keluarga Inti / Wali',
            kontakPendamping: '081347891234',
            sudahDisetujui: true,
            jenisFormPersetujuan: 'Informed Consent (Dewasa)',
            tanggalPersetujuan: new Date('2026-10-04T09:15:00Z'),
            penandatanganPersetujuan: 'Dedi Kurniawan & Sukardi',
            pernyataanBebasBiaya: true,
            tanggalPernyataanBebasBiaya: new Date('2026-10-04T09:20:00Z'),
            petugasPenerimaId: adminUser.id,
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
            jadwalPemeriksaanMedis: new Date('2026-10-05T09:30:00Z'),
            jadwalPemeriksaanHukum: new Date('2026-10-05T13:30:00Z'),
            jadwalPleno: new Date('2026-10-08T10:00:00Z'),
            lokasiPemeriksaan: 'Ruang Asesmen Terpadu BNNP Kalimantan Timur',
            disposisiHasil: 'Disetujui untuk dilaksanakan Asesmen Terpadu',
            disposisiKetua: adminUser.name,
            disposisiJabatan: 'Ketua Tim TAT BNNP Kaltim',
            disposisiTanggal: new Date('2026-10-03T11:00:00Z'),
          },
        },

        asesmenMedis: {
          create: {
            asesorId: medisUser.id,
            asesorNama: medisUser.name,
            tanggalPemeriksaan: new Date('2026-10-05T10:00:00Z'),
            status: AssessmentStatus.COMPLETED,
            kondisiFisik:
              'Keadaan umum baik, gizi cukup, compos mentis, tidak ditemukan bekas luka infeksi akut.',
            tekananDarah: '120/80 mmHg',
            denyutNadi: '78 x/menit',
            tandaBekasSuntikan: false,
            kondisiPsikologis:
              'Cemas ringan terkontrol, tilikan diri derajat 4 (menyadari ketergantungan dan berkeinginan pulih).',
            instrumen: 'ASSIST',
            skorInstrumen: 24,
            tingkatRisikoInstrumen: 'Risiko Sedang - Ketergantungan Metamfetamina',
            diagnosisKlinisIcd:
              'F15.2 (Gangguan Mental dan Perilaku Akibat Penggunaan Stimulansia - Sindrom Ketergantungan)',
            interpretasiKlinis:
              'Klien memenuhi kriteria ketergantungan sedang zat jenis metamfetamina. Direkomendasikan menjalani rehabilitasi rawat inap intensif.',
            kebutuhanRawat: 'Rehabilitasi Rawat Inap',
            durasiUsulanBulan: 3,
            catatanKhusus: 'Perlu konseling keluarga pendukung dan terapi suportif relaps.',
            finalizedAt: new Date('2026-10-06T15:00:00Z'),
            finalizedBy: medisUser.name,
            riwayatZat: {
              create: [
                {
                  jenisZat: 'Metamfetamina (Sabu)',
                  caraPakai: 'Hisap',
                  frekuensi: '2-3 kali seminggu',
                  lamaPemakaianBulan: 14,
                  terakhirPakai: '1 hari sebelum diamankan',
                },
                {
                  jenisZat: 'Tembakau / Rokok',
                  caraPakai: 'Hisap',
                  frekuensi: 'Setiap hari (1 bungkus)',
                  lamaPemakaianBulan: 96,
                  terakhirPakai: 'Hari penangkapan',
                },
              ],
            },
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
            tanggalTelaah: new Date('2026-10-05T14:00:00Z'),
            status: AssessmentStatus.COMPLETED,
            pernahDitangkap: false,
            keteranganPerkaraLalu: 'Tidak memiliki catatan tindak pidana sebelumnya (bukan residivis).',
            terverifikasiDatabase: true,
            analisisPeran: AnalisisPeran.Penyalahguna_Murni,
            argumentasiPeran:
              'Barang bukti netto 0.18 gram jauh di bawah batas SEMA No. 4/2010 (1 gram). Tidak ditemukan bukti transaksi, daftar pembeli, atau keterkaitan dengan jaringan sindikat gelap peredaran narkoba.',
            faktaPendukung: [
              'Barang bukti netto 0.18 gram di bawah ambang batas SEMA 4/2010',
              'Hasil tes laboratorium urine positif mengandung metamfetamina',
              'Tidak ditemukan jejak transaksi digital atau aliran dana peredaran narkotika',
              'Pengakuan jujur dan kooperatif selama pemeriksaan hukum',
            ],
            analisisBarangBukti: 'Barang bukti dikuasai semata-mata untuk konsumsi pribadi.',
            kesimpulanHukum:
              'Terperiksa terbukti sebagai Penyalahguna Narkotika bagi diri sendiri sebagaimana dimaksud dalam Pasal 127 ayat (1) huruf a UU RI No. 35/2009.',
            rekomendasiHukum: RekomendasiHukum.Proses_Hukum_Dilanjutkan_dengan_Rehabilitasi,
            finalizedAt: new Date('2026-10-06T17:00:00Z'),
            finalizedBy: hukumUser.name,
          },
        },

        sidangPleno: {
          create: {
            tanggalPleno: new Date('2026-10-08T10:00:00Z'),
            waktu: '10:00 - 12:30 WITA',
            tempat: 'Ruang Rapat Pleno TAT BNNP Kalimantan Timur',
            nomorBeritaAcara: 'BA-PLENO/142/TAT/X/2026/BNNP-KALTIM',
            pimpinanPleno: adminUser.name,
            pokokBahasan:
              'Pembahasan hasil asesmen medis dan asesmen hukum atas nama Dedi Kurniawan (LP/A/142/X/2026/SPKT/POLRESTA_SMD).',
            kesepakatanRekomendasi:
              'Forum pleno sepakat bulat merekomendasikan Terperiksa untuk menjalani Rehabilitasi Rawat Inap selama 3 (tiga) bulan di Balai Rehabilitasi BNN Tanah Merah Samarinda.',
            jenisRekomendasiFinal: JenisRekomendasiFinal.Rehabilitasi_Rawat_Inap,
            durasiRehabBulan: 3,
            fasilitasRujukanUsulan: 'Balai Rehabilitasi BNN Tanah Merah, Samarinda',
            statusPleno: StatusPleno.selesai_sepakat,
            daftarHadir: {
              create: [
                {
                  nama: adminUser.name,
                  peran: 'Ketua Tim TAT / Pimpinan Pleno',
                  instansi: 'Sekretariat TAT BNNP Kaltim',
                  hadir: true,
                },
                {
                  nama: medisUser.name,
                  peran: 'Dokter Asesor Medis',
                  instansi: 'Tim Medis TAT BNNP Kaltim',
                  hadir: true,
                },
                {
                  nama: hukumUser.name,
                  peran: 'Asesor Hukum / Kejaksaan',
                  instansi: 'Kejaksaan Tinggi Kalimantan Timur',
                  hadir: true,
                },
                {
                  nama: 'Ipda Budi Santoso, S.H.',
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
            ringkasanMedis:
              'Klien mengalami Ketergantungan Metamfetamina taraf sedang (F15.2). Membutuhkan rehabilitasi medis dan psikososial rawat inap selama 3 bulan.',
            ringkasanHukum:
              'Terperiksa merupakan Penyalahguna Narkotika bagi diri sendiri (Pasal 127 ayat 1 huruf a UU 35/2009). Tidak terindikasi jaringan pengedar.',
            rekomendasiFinalText:
              'Direkomendasikan menjalani Rehabilitasi Medis dan Sosial Rawat Inap selama 3 (tiga) bulan di Balai Rehabilitasi BNN Tanah Merah Samarinda dengan proses hukum dilanjutkan sesuai ketentuan.',
            isLengkapPengesahan: false,
            qrVerificationCode: 'QR-TAT-202610-0099-VERIFIED',
            daftarPengesah: {
              create: [
                {
                  nama: adminUser.name,
                  jabatan: 'Ketua Tim TAT BNNP Kaltim',
                  instansi: 'BNNP Kalimantan Timur',
                  status: StatusPengesah.disahkan,
                  tanggalPengesahan: new Date('2026-10-09T15:30:00Z'),
                  tandaTanganDigitalHash:
                    'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
                },
                {
                  nama: medisUser.name,
                  jabatan: 'Dokter Asesor Medis',
                  instansi: 'BNNP Kalimantan Timur',
                  status: StatusPengesah.menunggu,
                },
                {
                  nama: hukumUser.name,
                  jabatan: 'Asesor Tim Hukum',
                  instansi: 'Kejati Kalimantan Timur',
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
              rincian: 'Penyidik mengajukan permohonan asesmen terpadu atas nama Dedi Kurniawan.',
              timestamp: new Date('2026-10-02T08:30:00Z'),
            },
            {
              actorId: adminUser.id,
              actorNama: adminUser.name,
              actorPeran: 'ADMIN',
              aksi: 'VERIFIKASI_BERKAS',
              rincian: 'Sekretariat TAT memverifikasi seluruh kelengkapan berkas persyaratan permohonan.',
              timestamp: new Date('2026-10-03T09:15:00Z'),
            },
            {
              actorId: adminUser.id,
              actorNama: adminUser.name,
              actorPeran: 'ADMIN',
              aksi: 'DISPOSISI_TIM',
              rincian: 'Ketua Tim TAT menetapkan Tim Asesor Medis dan Tim Asesor Hukum.',
              timestamp: new Date('2026-10-03T11:00:00Z'),
            },
            {
              actorId: adminUser.id,
              actorNama: adminUser.name,
              actorPeran: 'ADMIN',
              aksi: 'PENERIMAAN_SUBJEK',
              rincian: 'Penerimaan subjek terperiksa bersama penyidik pengantar dan wali keluarga.',
              timestamp: new Date('2026-10-04T09:00:00Z'),
            },
            {
              actorId: medisUser.id,
              actorNama: medisUser.name,
              actorPeran: 'MEDIS',
              aksi: 'ASESMEN_MEDIS_SELESAI',
              rincian: 'Pemeriksaan medis dan urine diselesaikan dengan diagnosis F15.2.',
              timestamp: new Date('2026-10-06T15:00:00Z'),
            },
            {
              actorId: hukumUser.id,
              actorNama: hukumUser.name,
              actorPeran: 'HUKUM',
              aksi: 'ASESMEN_HUKUM_SELESAI',
              rincian: 'Telaah hukum menyimpulkan Terperiksa adalah Penyalahguna Murni.',
              timestamp: new Date('2026-10-06T17:00:00Z'),
            },
            {
              actorId: adminUser.id,
              actorNama: adminUser.name,
              actorPeran: 'ADMIN',
              aksi: 'PELAKSANAAN_PLENO',
              rincian: 'Sidang Pleno TAT selesai dengan kesepakatan Rawat Inap 3 bulan.',
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
    console.log('  ✔ Permohonan TAT/2026/10/0099 seeded successfully.');
  } else {
    console.log('  ℹ Permohonan TAT/2026/10/0099 sudah ada, lewati.');
  }

  // =========================================================================
  // 2. PERMOHONAN AKTIF 2: TAT/2026/10/0103 (Sedang Asesmen Berjalan)
  // =========================================================================
  const existing103 = await prisma.permohonanAsesmen.findFirst({
    where: { nomorPermohonan: 'TAT/2026/10/0103' },
  });

  if (!existing103) {
    console.log('  -> Membuat permohonan TAT/2026/10/0103 (ASSESSMENT_ACTIVE)...');
    await prisma.permohonanAsesmen.create({
      data: {
        nomorPermohonan: 'TAT/2026/10/0103',
        trackingNumber: 'TRACK-202610-103',
        tanggalPengajuan: new Date('2026-10-09T10:15:00Z'),
        jenisPengajuan: JenisPengajuan.penangkapan_dengan_bb,
        metodePelaksanaan: MetodePelaksanaan.luring,
        satuanKerjaTujuan: 'BNNP Kalimantan Timur',
        instansiPengaju: pengaju.agency || 'Satresnarkoba Polresta Samarinda',
        pengajuId: pengaju.id,
        applicationStatus: ApplicationStatus.ASSESSMENT_ACTIVE,
        medicalStatus: AssessmentStatus.DRAFT,
        legalStatus: AssessmentStatus.NOT_STARTED,
        tenggatSlaTanggal: new Date('2026-10-16T17:00:00Z'),
        isMendekatiTenggat: false,
        isMelewatiTenggat: false,

        terperiksa: {
          create: {
            namaLengkap: 'Fitriani Rahayu',
            alias: 'Fitri Binti Rahmad',
            nik: '6472025510980005',
            isNikVerified: true,
            statusIdentitasKhusus: 'KTP Terverifikasi Dukcapil',
            tempatLahir: 'Balikpapan',
            tanggalLahir: new Date('1998-10-15'),
            usia: 28,
            jenisKelamin: 'Perempuan',
            pekerjaan: 'Pegawai Honorer',
            alamatKtp: 'Jl. Antasari No. 12 RT 05, Kel. Teluk Lerong Ilir, Samarinda',
            alamatDomisili: 'Jl. Antasari No. 12 RT 05, Kel. Teluk Lerong Ilir, Samarinda',
            namaWaliPendamping: 'Rahmad Hidayat',
            kontakWali: '082155678901',
          },
        },

        perkara: {
          create: {
            nomorLaporanPolisi: 'LP/A/148/X/2026/SPKT/POLRESTA_SMD',
            tanggalLp: new Date('2026-10-08'),
            instansiPenyidik: 'Satresnarkoba Polresta Samarinda',
            namaPenyidik: 'Ipda Budi Santoso, S.H.',
            nomorHpPenyidik: '081298765432',
            pasalDipersangkakan: 'Pasal 127 ayat (1) huruf a UU RI No. 35 Tahun 2009 tentang Narkotika',
            tempatKejadianPerkara: 'Sebuah kamar kos di Jl. Banggeris, Kel. Karang Anyar, Samarinda',
            tanggalWaktuPenangkapan: new Date('2026-10-08T19:00:00Z'),
            kronologiSingkat:
              'Tersangka diamankan oleh tim opsnal satresnarkoba saat berada di kamar kos. Ditemukan 1 plastik klip kecil sisa pakai dengan serbuk sabu seberat 0.25 gram bruto dan sedotan pipet kaca.',
            barangBuktiList: {
              create: [
                {
                  jenisZat: 'Metamfetamina (Sabu)',
                  beratKotorGram: 0.25,
                  beratBersihGram: 0.08,
                  statusUjiLab: StatusUjiLab.proses_lab,
                  nomorSuratLab: 'LAB-NN/1460/X/2026/PUSLABFOR',
                  tanggalSuratLab: new Date('2026-10-09'),
                  keterangan: 'Serbuk putih dalam proses pengujian laboratorium Puslabfor',
                },
              ],
            },
          },
        },

        dokumenList: {
          create: [
            {
              nama: 'Surat Permohonan Asesmen dari Penyidik',
              kode: 'DOK-01',
              wajib: true,
              keterangan: 'Surat resmi permohonan TAT',
              fileName: 'Surat_Permohonan_TAT_Polresta_SMD_103.pdf',
              fileSize: '1.1 MB',
              statusVerifikasi: StatusVerifikasiDokumen.sesuai,
              uploadedAt: new Date('2026-10-09T10:20:00Z'),
            },
            {
              nama: 'Laporan Polisi (LP)',
              kode: 'DOK-02',
              wajib: true,
              keterangan: 'LP/A/148/X/2026/SPKT/POLRESTA_SMD',
              fileName: 'LP_A_148_X_2026_Polresta_SMD.pdf',
              fileSize: '2.1 MB',
              statusVerifikasi: StatusVerifikasiDokumen.sesuai,
              uploadedAt: new Date('2026-10-09T10:21:00Z'),
            },
            {
              nama: 'Surat Perintah Penyidikan (Spindik)',
              kode: 'DOK-03',
              wajib: true,
              keterangan: 'Salinan resmi',
              fileName: 'SP_Sidik_148_2026.pdf',
              fileSize: '1.0 MB',
              statusVerifikasi: StatusVerifikasiDokumen.sesuai,
              uploadedAt: new Date('2026-10-09T10:22:00Z'),
            },
            {
              nama: 'Berita Acara Penangkapan & Penggeledahan',
              kode: 'DOK-04',
              wajib: true,
              keterangan: 'Tanda tangan lengkap',
              fileName: 'BA_Penangkapan_Fitriani_R.pdf',
              fileSize: '1.7 MB',
              statusVerifikasi: StatusVerifikasiDokumen.sesuai,
              uploadedAt: new Date('2026-10-09T10:23:00Z'),
            },
            {
              nama: 'Berita Acara Penyitaan Barang Bukti',
              kode: 'DOK-05',
              wajib: true,
              keterangan: 'Penyitaan plastik klip dan bong',
              fileName: 'BA_Sita_BB_103.pdf',
              fileSize: '1.4 MB',
              statusVerifikasi: StatusVerifikasiDokumen.sesuai,
              uploadedAt: new Date('2026-10-09T10:24:00Z'),
            },
            {
              nama: 'Surat Pengantar Pengujian Labfor',
              kode: 'DOK-06',
              wajib: true,
              keterangan: 'Tanda terima sampel urine & BB di Puslabfor',
              fileName: 'Tanda_Terima_Labfor_1460.pdf',
              fileSize: '880 KB',
              statusVerifikasi: StatusVerifikasiDokumen.sesuai,
              uploadedAt: new Date('2026-10-09T10:25:00Z'),
            },
          ],
        },

        prasyaratPemeriksaan: {
          create: {
            waktuKedatangan: new Date('2026-10-10T09:30:00Z'),
            kehadiranSubjek: true,
            pencocokanIdentitas: true,
            catatanPencocokanIdentitas: 'Identitas fisik cocok dengan KTP Elektronik.',
            namaPengantar: 'Aipda Rudi Hartono',
            instansiPengantar: 'Satresnarkoba Polresta Samarinda',
            jabatanPengantar: 'Penyidik Pembantu',
            kehadiranPengantar: true,
            kehadiranPendamping: true,
            namaPendamping: 'Rahmad Hidayat',
            hubunganPendamping: 'Ayah Kandung',
            dasarKeterlibatan: 'Keluarga Inti / Wali',
            kontakPendamping: '082155678901',
            sudahDisetujui: true,
            jenisFormPersetujuan: 'Informed Consent (Dewasa)',
            tanggalPersetujuan: new Date('2026-10-10T09:40:00Z'),
            penandatanganPersetujuan: 'Fitriani Rahayu & Rahmad Hidayat',
            pernyataanBebasBiaya: true,
            tanggalPernyataanBebasBiaya: new Date('2026-10-10T09:45:00Z'),
            petugasPenerimaId: adminUser.id,
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
            jadwalPemeriksaanMedis: new Date('2026-10-11T10:00:00Z'),
            jadwalPemeriksaanHukum: new Date('2026-10-12T13:30:00Z'),
            lokasiPemeriksaan: 'Ruang Asesmen Terpadu BNNP Kalimantan Timur',
            disposisiHasil: 'Disetujui untuk dilaksanakan Asesmen Terpadu',
            disposisiKetua: adminUser.name,
            disposisiJabatan: 'Ketua Tim TAT BNNP Kaltim',
            disposisiTanggal: new Date('2026-10-09T14:00:00Z'),
          },
        },

        asesmenMedis: {
          create: {
            asesorId: medisUser.id,
            asesorNama: medisUser.name,
            tanggalPemeriksaan: new Date('2026-10-11T10:00:00Z'),
            status: AssessmentStatus.DRAFT,
            kondisiFisik:
              'Pemeriksaan fisik awal: tekanan darah 110/70 mmHg, nadi 82 x/menit, tidak ada kelainan fisik akut.',
            tekananDarah: '110/70 mmHg',
            denyutNadi: '82 x/menit',
            tandaBekasSuntikan: false,
            kondisiPsikologis: 'Klien kooperatif, tampak gelisah, orientasi waktu dan tempat baik.',
            instrumen: 'ASSIST',
            skorInstrumen: 18,
            tingkatRisikoInstrumen: 'Risiko Sedang - Metamfetamina',
            kebutuhanRawat: 'Rehabilitasi Rawat Jalan / Konseling Intensif',
            durasiUsulanBulan: 2,
            catatanKhusus: 'Pemeriksaan lanjutan wawancara mendalam masih berlangsung (Draf).',
            riwayatZat: {
              create: [
                {
                  jenisZat: 'Metamfetamina (Sabu)',
                  caraPakai: 'Hisap',
                  frekuensi: '1-2 kali seminggu',
                  lamaPemakaianBulan: 6,
                  terakhirPakai: '2 hari sebelum diamankan',
                },
              ],
            },
            hasilUrin: {
              create: [
                { parameter: 'MET', hasil: 'Positif' },
                { parameter: 'AMP', hasil: 'Negatif' },
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
              rincian: 'Penyidik mengajukan permohonan asesmen terpadu atas nama Fitriani Rahayu.',
              timestamp: new Date('2026-10-09T10:15:00Z'),
            },
            {
              actorId: adminUser.id,
              actorNama: adminUser.name,
              actorPeran: 'ADMIN',
              aksi: 'VERIFIKASI_BERKAS',
              rincian: 'Sekretariat TAT memverifikasi berkas persyaratan dan menyetujui jadwal.',
              timestamp: new Date('2026-10-09T14:00:00Z'),
            },
            {
              actorId: adminUser.id,
              actorNama: adminUser.name,
              actorPeran: 'ADMIN',
              aksi: 'PENERIMAAN_SUBJEK',
              rincian: 'Subjek terperiksa tiba di ruang asesmen didampingi penyidik dan keluarga.',
              timestamp: new Date('2026-10-10T09:30:00Z'),
            },
            {
              actorId: medisUser.id,
              actorNama: medisUser.name,
              actorPeran: 'MEDIS',
              aksi: 'MULAI_ASESMEN_MEDIS',
              rincian: 'Dokter pemeriksa memulai pemeriksaan medis dan tes urine.',
              timestamp: new Date('2026-10-11T10:00:00Z'),
            },
          ],
        },
      },
    });
    console.log('  ✔ Permohonan TAT/2026/10/0103 seeded successfully.');
  } else {
    console.log('  ℹ Permohonan TAT/2026/10/0103 sudah ada, lewati.');
  }

  console.log('✨ Selesai seeding Permohonan Asesmen Aktif!');
}
