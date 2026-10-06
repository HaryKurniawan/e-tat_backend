import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Ensure upload directories exist (support serverless /tmp directory)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
export const uploadBaseDir = isServerless
  ? path.join('/tmp', 'uploads')
  : path.join(process.cwd(), 'uploads');

const directories = ['dokumen', 'ktp', 'kta', 'rekomendasi', 'bukti', 'berita_acara'];

try {
  directories.forEach((dir) => {
    const fullPath = path.join(uploadBaseDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
} catch (err: any) {
  console.warn('⚠️ Upload directory initialization warning:', err.message);
}

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    let subfolder = 'dokumen';
    if (file.fieldname.includes('ktp')) subfolder = 'ktp';
    else if (file.fieldname.includes('kta')) subfolder = 'kta';
    else if (file.fieldname.includes('rekomendasi')) subfolder = 'rekomendasi';
    else if (file.fieldname.includes('bukti')) subfolder = 'bukti';
    else if (file.fieldname.includes('berita')) subfolder = 'berita_acara';

    const targetDir = path.join(uploadBaseDir, subfolder);
    cb(null, targetDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipe file tidak didukung: ${ext}. Gunakan PDF, JPG, PNG, atau DOC.`));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
  },
  fileFilter,
});
