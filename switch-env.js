const fs = require('fs');
const path = require('path');

const target = (process.argv[2] || '').toLowerCase().trim();

if (!target || !['local', 'prod', 'production'].includes(target)) {
  console.log('Cara penggunaan:');
  console.log('  node switch-env.js local  -> mengaktifkan .env.local ke .env');
  console.log('  node switch-env.js prod   -> mengaktifkan .env.prod ke .env');
  process.exit(1);
}

const isLocal = target === 'local';
const sourceFileName = isLocal ? '.env.local' : '.env.prod';
const sourceFilePath = path.join(__dirname, sourceFileName);
const destFilePath = path.join(__dirname, '.env');

if (!fs.existsSync(sourceFilePath)) {
  console.error(`✘ File konfigurasi ${sourceFileName} tidak ditemukan di folder backend!`);
  process.exit(1);
}

try {
  fs.copyFileSync(sourceFilePath, destFilePath);
  console.log(`\n======================================================`);
  console.log(`✔ Berhasil beralih ke environment: ${isLocal ? 'LOCAL (Development)' : 'PROD (Production/Supabase)'}`);
  console.log(`  Sumber : backend/${sourceFileName}`);
  console.log(`  Target : backend/.env`);
  console.log(`======================================================\n`);
} catch (err) {
  console.error('✘ Gagal menyalin file environment:', err);
  process.exit(1);
}
