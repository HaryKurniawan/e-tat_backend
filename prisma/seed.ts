import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import process from 'node:process';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for POLRI E-TAT...');

  const passwordHash = await bcrypt.hash('password123', 12);

  // 1. Akun Admin Utama (Sekretariat TAT)
  const adminUser = await prisma.user.upsert({
    where: { email: 'etatsiappulih@gmail.com' },
    update: {
      password: passwordHash,
      role: UserRole.ADMIN,
      name: '[TEST] Admin Sekretariat TAT',
      position: 'Petugas Verifikasi & Sekretariat TAT (Akun Uji)',
    },
    create: {
      email: 'etatsiappulih@gmail.com',
      password: passwordHash,
      role: UserRole.ADMIN,
      name: '[TEST] Admin Sekretariat TAT',
      nip: '79080512',
      agency: 'Sekretariat TAT Polda Metro Jaya',
      position: 'Petugas Verifikasi & Sekretariat TAT (Akun Uji)',
      phone: '081234567890',
    },
  });
  console.log('✔ User Sekretariat (Admin) created/updated:', adminUser.email);

  // 2. Akun Asesor Medis TAT
  const medisUser = await prisma.user.upsert({
    where: { email: 'medis.etatsiappulih@gmail.com' },
    update: {
      password: passwordHash,
      role: UserRole.MEDIS,
      name: '[TEST] Dokter Asesor Medis TAT',
      position: 'Dokter Pemeriksa Medis TAT (Akun Uji)',
    },
    create: {
      email: 'medis.etatsiappulih@gmail.com',
      password: passwordHash,
      role: UserRole.MEDIS,
      name: '[TEST] Dokter Asesor Medis TAT',
      nip: '198205122008012001',
      agency: 'BNNP DKI Jakarta / RS Pengayoman',
      position: 'Dokter Pemeriksa Medis TAT (Akun Uji)',
      phone: '081311223344',
    },
  });
  console.log('✔ User Asesor Medis created/updated:', medisUser.email);

  // 3. Akun Asesor Hukum TAT
  const hukumUser = await prisma.user.upsert({
    where: { email: 'hukum.etatsiappulih@gmail.com' },
    update: {
      password: passwordHash,
      role: UserRole.HUKUM,
      name: '[TEST] Jaksa Asesor Hukum TAT',
      position: 'Jaksa / Penelaah Hukum TAT (Akun Uji)',
    },
    create: {
      email: 'hukum.etatsiappulih@gmail.com',
      password: passwordHash,
      role: UserRole.HUKUM,
      name: '[TEST] Jaksa Asesor Hukum TAT',
      nip: '197903152003121002',
      agency: 'Kejaksaan Tinggi DKI Jakarta',
      position: 'Jaksa / Penelaah Hukum TAT (Akun Uji)',
      phone: '081399887766',
    },
  });
  console.log('✔ User Asesor Hukum created/updated:', hukumUser.email);

  console.log('✨ Seeding completed successfully!');
  console.log('--------------------------------------------------');
  console.log('Akun aktif yang dipertahankan (password: password123):');
  console.log('1. Admin (Sekretariat) : etatsiappulih@gmail.com');
  console.log('2. Asesor Medis        : medis.etatsiappulih@gmail.com');
  console.log('3. Asesor Hukum        : hukum.etatsiappulih@gmail.com');
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
