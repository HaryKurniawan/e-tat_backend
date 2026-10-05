# POLRI E-TAT Backend Service

Backend RESTful API untuk Sistem Elektronik Tim Asesmen Terpadu (E-TAT) POLRI berbasis Express.js, TypeScript, dan Prisma ORM 6.

---

## 🚀 Fitur & Modul

Sistem ini melayani 4 Role utama:
1. **SEKRETARIAT (ADMIN)**: Verifikasi berkas, pencatatan disposisi ketua TAT, penugasan tim asesmen, penjadwalan sidang pleno, penerbitan rekomendasi resmi, approval akun pengaju, dan audit log.
2. **PENGAJU (PENYIDIK)**: Registrasi akun kedinasan, input draft permohonan asesmen tersangka, unggah berkas perkara & barang bukti, lacak status permohonan, dan konfirmasi tanda terima rekomendasi.
3. **ASESOR MEDIS (DOKTER BNN/RS)**: Pemeriksaan fisik, tes urine narkotika, analisis zat adiktif, asesmen instrumen ASAM 6 Dimensi (kriteria penempatan rawat inap/jalan), finalisasi & amandemen medis.
4. **ASESOR HUKUM (JAKSA/POLISI)**: Telaah hukum & residivisme, analisis peran tersangka (korban, penyalahguna, pengedar, kurir, bandar), rekomendasi opsi hukum (diversi, restorative justice, rehabilitasi peradilan).

---

## 🛠️ Persyaratan Sistem

* **Node.js**: v18+ atau v20+ (Direkomendasikan v22)
* **Database**: PostgreSQL v14+
* **Prisma ORM**: v6.4.1

---

## ⚙️ Panduan Menjalankan

### 1. Salin Environment
Pastikan file `.env` sudah dikonfigurasi dengan kredensial database PostgreSQL Anda:
```bash
# Isi DATABASE_URL di backend/.env:
DATABASE_URL="postgresql://postgres:password@localhost:5432/etat_db"
```

### 2. Jalankan Migrasi Database
Untuk membuat seluruh 26 tabel database di PostgreSQL:
```bash
npm run prisma:migrate
```

### 3. Jalankan Database Seeder
Untuk mengisi 4 akun default (1 untuk tiap role) dan 1 data sample kasus:
```bash
npm run prisma:seed
```

#### 🔑 Akun Uji Coba Default:
| Role | Email | Password | Keterangan |
|---|---|---|---|
| **Sekretariat (Admin)** | `sekretariat@polri.go.id` | `password123` | Kompol Arya Wicaksono |
| **Pengaju (Penyidik)** | `penyidik@polres.go.id` | `password123` | Ipda Budi Santoso |
| **Asesor Medis** | `medis@tat.go.id` | `password123` | dr. Ratna Sp.KJ |
| **Asesor Hukum** | `hukum@tat.go.id` | `password123` | Agus Pratama, S.H., M.H. |

### 4. Menjalankan Server Development
```bash
npm run dev
```
Server akan berjalan di: `http://localhost:5000`

Health check endpoint: `GET http://localhost:5000/api/health`

### 5. Build Produksi
```bash
npm run build
npm start
```

---

## 📁 Struktur Direktori Backend

```text
backend/
├── prisma/
│   ├── schema.prisma            # 26 Model database & relasi lengkap
│   └── seed.ts                  # Seeder akun 4 role & sampel permohonan
├── src/
│   ├── app.ts                   # Express app, security middleware & router
│   ├── server.ts                # Server startup & graceful shutdown
│   ├── config/
│   │   ├── database.ts          # Prisma Client singleton
│   │   └── env.ts               # Validasi environment zod
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT authentication guard
│   │   ├── role.middleware.ts   # RBAC permission guard
│   │   ├── error.middleware.ts  # Global error & 404 handler
│   │   └── audit.middleware.ts  # Automatic audit trail logger
│   ├── modules/                 # Modular per-domain
│   │   ├── auth/                # Login, refresh, logout, profile
│   │   ├── registrasi/          # Pendaftaran akun penyidik
│   │   ├── permohonan/          # Workflow permohonan TAT
│   │   ├── asesmen-medis/       # Pemeriksaan dokter & ASAM 6D
│   │   ├── asesmen-hukum/       # Analisis peran & opsi peradilan
│   │   ├── sidang-pleno/        # Notula, BA signed & pleno
│   │   ├── rekomendasi/         # Surat resmi & SHA-256 / QR verification
│   │   ├── tindak-lanjut/       # Rujukan rehabilitasi & monitoring
│   │   ├── klarifikasi/         # Komunikasi asesor <-> pengaju
│   │   ├── dashboard/           # Metrik statistik per role
│   │   └── audit/               # Log aktivitas sistem
│   └── utils/
│       ├── hash.util.ts         # Bcrypt & SHA-256 hash generator
│       ├── nomor.util.ts        # Generator nomor TAT, BA, Rekomendasi, Tracking
│       ├── param.util.ts        # Type-safe parameter extractor
│       ├── response.util.ts     # Standar API JSON response
│       ├── pagination.util.ts   # Pagination & search helper
│       └── upload.util.ts       # Multer multi-directory file upload
└── uploads/                     # File upload storage
```
