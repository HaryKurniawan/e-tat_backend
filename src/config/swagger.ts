import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'POLRI E-TAT (Elektronik Tim Asesmen Terpadu) API',
      version: '1.0.0',
      description: `
Dokumentasi API Terpadu untuk Sistem E-TAT POLRI / BNN RI (SIAP PULIH).
Mendukung 4 peran kanonis:
- **PENGAJU** (Penyidik Satresnarkoba / BNN / Jaksa)
- **ADMIN** (Sekretariat TAT)
- **MEDIS** (Dokter Spesialis Kejiwaan / Asesor Medis)
- **HUKUM** (Jaksa / Ahli Hukum Asesor TAT)

Tersedia alur verifikasi berkas, asesmen medis & kriteria plasemen (ASAM Criteria 6 dimensi), asesmen hukum & telaah peran, sidang pleno, rekomendasi bertanda tangan QR elektronik, hingga monitoring tindak lanjut rehabilitasi.
      `,
      contact: {
        name: 'Sekretariat Tim Asesmen Terpadu POLRI',
        email: 'sekretariat@polri.go.id',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development Server (Local)',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Masukkan JWT Access Token dengan format: Bearer <token>',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operasi berhasil dilakukan' },
            data: { type: 'object' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'sekretariat@polri.go.id' },
            password: { type: 'string', example: 'password123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login berhasil' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string', enum: ['ADMIN', 'PENGAJU', 'MEDIS', 'HUKUM'] },
                    name: { type: 'string' },
                    agency: { type: 'string' },
                    nip: { type: 'string' },
                  },
                },
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
              },
            },
          },
        },
        RegistrasiRequest: {
          type: 'object',
          required: ['namaLengkap', 'nrp', 'jabatan', 'instansi', 'kategoriInstansi', 'wilayahHukum', 'alamatKantor', 'email', 'phone', 'password'],
          properties: {
            namaLengkap: { type: 'string', example: 'AKBP Kurniadi Syafei, S.I.K., M.H.' },
            pangkat: { type: 'string', example: 'AKBP' },
            nrp: { type: 'string', example: '78090822' },
            jabatan: { type: 'string', example: 'Kapolres' },
            instansi: { type: 'string', example: 'Polres Kutai Barat' },
            kategoriInstansi: {
              type: 'string',
              enum: ['Polres_Polresta', 'Polda', 'Polsek', 'BNNK_BNNP', 'Kejaksaan', 'Lainnya'],
              example: 'Polres_Polresta',
            },
            wilayahHukum: { type: 'string', example: 'Kabupaten Kutai Barat' },
            alamatKantor: { type: 'string', example: 'Jl. Sendawar Raya No. 01, Barong Tongkok' },
            email: { type: 'string', format: 'email', example: 'kapolres.kutaibarat@polri.go.id' },
            phone: { type: 'string', example: '0812-5544-3321' },
            teleponKantor: { type: 'string', example: '(0545) 4041110' },
            password: { type: 'string', example: 'password123' },
          },
        },
        PermohonanAsesmen: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nomorPermohonan: { type: 'string', example: 'TAT/2026/10/0001' },
            trackingNumber: { type: 'string', example: 'TRACK-202610-001' },
            applicationStatus: {
              type: 'string',
              enum: [
                'DRAFT',
                'SUBMITTED',
                'ADMIN_REVIEW',
                'NEEDS_CORRECTION',
                'AWAITING_DISPOSITION',
                'APPROVED',
                'SCHEDULED',
                'ASSESSMENT_ACTIVE',
                'READY_FOR_CONFERENCE',
                'CONFERENCE_HELD',
                'CONFERENCE_CLARIFICATION_REQUIRED',
                'OUTCOME_RECORDED_FOR_DRAFT',
                'AWAITING_SIGNED_OUTPUTS',
                'RESULTS_ISSUED',
                'REJECTED',
                'OUT_OF_SCOPE_REFERRED',
              ],
            },
            medicalStatus: {
              type: 'string',
              enum: ['NOT_STARTED', 'DRAFT', 'PENDING_REVIEW', 'FINAL', 'AMENDMENT_REQUIRED', 'SUPERSEDED'],
            },
            legalStatus: {
              type: 'string',
              enum: ['NOT_STARTED', 'DRAFT', 'PENDING_REVIEW', 'FINAL', 'AMENDMENT_REQUIRED', 'SUPERSEDED'],
            },
            tenggatSlaTanggal: { type: 'string', format: 'date-time' },
            isMendekatiTenggat: { type: 'boolean' },
            isMelewatiTenggat: { type: 'boolean' },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
    tags: [
      { name: 'Health', description: 'Pemeriksaan status server' },
      { name: 'Auth', description: 'Autentikasi & Manajemen Sesi Pengguna' },
      { name: 'Registrasi', description: 'Pendaftaran Akun Satuan Kerja & Verifikasi Admin' },
      { name: 'Permohonan', description: 'Pengelolaan Berkas Permohonan Asesmen Terpadu & Tracking Publik' },
      { name: 'Asesmen Medis', description: 'Pemeriksaan Medis, Tes Urin, Instrumen ASSIST & ASAM 6 Dimensi' },
      { name: 'Asesmen Hukum', description: 'Analisis Peran Hukum, SEMA 04/2010, dan Rekomendasi Yuridis' },
      { name: 'Sidang Pleno', description: 'Rapat Pleno Tim Asesmen Terpadu & Berita Acara Kesepakatan' },
      { name: 'Rekomendasi & Tanda Tangan QR', description: 'Penerbitan Surat Rekomendasi Resmi, Tanda Tangan Digital & Verifikasi QR' },
      { name: 'Tindak Lanjut & Monitoring', description: 'Rujukan Fasilitas, Serah Terima Klien, Laporan Kontrol & Wajib Lapor' },
      { name: 'Klarifikasi', description: 'Forum Diskusi Klarifikasi Antara Tim Asesor & Sekretariat/Pengaju' },
      { name: 'Dashboard & Analytics', description: 'Statistik Rekapitulasi Kasus & Notifikasi SLA' },
      { name: 'Audit Trail', description: 'Catatan Log Aktivitas Sistem (Immutable Audit Log)' },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
