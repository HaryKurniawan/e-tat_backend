import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { uploadFileToCloudinary, uploadBase64ToCloudinary } from '../../utils/cloudinary.util';
import { uploadPdfToSupabase, uploadPdfBase64ToSupabase } from '../../utils/supabase.util';
import { sendSuccess, sendError } from '../../utils/response.util';
import { env } from '../../config/env';
import { uploadBaseDir } from '../../utils/upload.util';

/**
 * Check if a file or base64 string is PDF
 */
const isPdfFile = (file?: Express.Multer.File, base64?: string): boolean => {
  if (file) {
    const ext = path.extname(file.originalname).toLowerCase();
    return file.mimetype === 'application/pdf' || ext === '.pdf';
  }
  if (base64) {
    return base64.startsWith('data:application/pdf') || base64.startsWith('JVBERi0');
  }
  return false;
};

const sanitizeFolder = (folder: string): string => {
  const cleaned = folder.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  return cleaned || 'dokumen';
};

const saveMulterFileLocally = (file: Express.Multer.File, folder: string) => {
  const safeFolder = sanitizeFolder(folder);
  const targetDir = path.join(uploadBaseDir, safeFolder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const targetPath = path.join(targetDir, file.filename);
  if (path.resolve(file.path) !== path.resolve(targetPath)) {
    fs.renameSync(file.path, targetPath);
  }
  const ext = path.extname(file.originalname).replace('.', '').toLowerCase() || 'bin';
  return {
    url: `/uploads/${safeFolder}/${file.filename}`,
    publicId: `${safeFolder}/${file.filename}`,
    format: ext,
    resourceType: isPdfFile(file) ? 'raw' : 'image',
    bytes: file.size,
    storage: 'local',
  };
};

const saveBase64Locally = (base64Data: string, folder: string) => {
  const safeFolder = sanitizeFolder(folder);
  const targetDir = path.join(uploadBaseDir, safeFolder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  let ext = 'png';
  let rawBase64 = base64Data;
  const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    const mime = match[1].toLowerCase();
    rawBase64 = match[2];
    if (mime.includes('pdf')) ext = 'pdf';
    else if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
    else if (mime.includes('webp')) ext = 'webp';
    else if (mime.includes('png')) ext = 'png';
  } else if (base64Data.startsWith('JVBERi0')) {
    ext = 'pdf';
  }

  const filename = `file-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
  const targetPath = path.join(targetDir, filename);
  const buffer = Buffer.from(rawBase64, 'base64');
  fs.writeFileSync(targetPath, buffer);

  return {
    url: `/uploads/${safeFolder}/${filename}`,
    publicId: `${safeFolder}/${filename}`,
    format: ext,
    resourceType: ext === 'pdf' ? 'raw' : 'image',
    bytes: buffer.length,
    storage: 'local',
  };
};

/**
 * POST /api/upload/image & POST /api/upload
 * Supports STORAGE_MODE=local (VPS disk storage) or cloud (Supabase + Cloudinary).
 */
export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const folder = (req.body.folder as string) || 'dokumen';

    // 1. Check if multipart file uploaded
    if (req.file) {
      if (env.STORAGE_MODE === 'local') {
        const result = saveMulterFileLocally(req.file, folder);
        sendSuccess(res, result, 'File berhasil disimpan di storage lokal VPS');
        return;
      }

      const isPdf = isPdfFile(req.file);

      if (isPdf) {
        const result = await uploadPdfToSupabase(req.file.path, folder, true);
        sendSuccess(
          res,
          {
            url: result.url,
            publicId: result.publicId,
            format: result.format,
            resourceType: result.resource_type,
            bytes: result.bytes,
            storage: 'supabase',
            bucket: result.bucket,
          },
          'Dokumen PDF berhasil diunggah ke Supabase Storage'
        );
        return;
      }

      const result = await uploadFileToCloudinary(req.file.path, folder, true);
      sendSuccess(
        res,
        {
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          resourceType: result.resource_type,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
          storage: 'cloudinary',
        },
        'File berhasil diunggah ke Cloudinary'
      );
      return;
    }

    // 2. Check if base64 provided in body
    if (req.body.base64 || req.body.image) {
      const base64Data = req.body.base64 || req.body.image;

      if (env.STORAGE_MODE === 'local') {
        const result = saveBase64Locally(base64Data, folder);
        sendSuccess(res, result, 'File base64 berhasil disimpan di storage lokal VPS');
        return;
      }

      const isPdf = isPdfFile(undefined, base64Data);

      if (isPdf) {
        const result = await uploadPdfBase64ToSupabase(base64Data, folder);
        sendSuccess(
          res,
          {
            url: result.url,
            publicId: result.publicId,
            format: result.format,
            resourceType: result.resource_type,
            bytes: result.bytes,
            storage: 'supabase',
            bucket: result.bucket,
          },
          'Dokumen PDF base64 berhasil diunggah ke Supabase Storage'
        );
        return;
      }

      const result = await uploadBase64ToCloudinary(base64Data, folder);
      sendSuccess(
        res,
        {
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          resourceType: result.resource_type,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
          storage: 'cloudinary',
        },
        'Gambar base64 berhasil diunggah ke Cloudinary'
      );
      return;
    }

    sendError(res, 'Tidak ada file atau gambar yang diunggah.', 400);
  } catch (error: any) {
    console.error('Upload processing error:', error);
    next(error);
  }
};

/**
 * POST /api/upload/multiple
 * Upload multiple files (local VPS storage or cloud)
 */
export const uploadMultiple = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const folder = (req.body.folder as string) || 'dokumen';
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      sendError(res, 'Tidak ada berkas yang diunggah.', 400);
      return;
    }

    if (env.STORAGE_MODE === 'local') {
      const results = files.map((file) => saveMulterFileLocally(file, folder));
      sendSuccess(res, results, `${results.length} berkas berhasil disimpan di storage lokal VPS`);
      return;
    }

    const uploadPromises = files.map(async (file) => {
      if (isPdfFile(file)) {
        const r = await uploadPdfToSupabase(file.path, folder, true);
        return {
          url: r.url,
          publicId: r.publicId,
          format: r.format,
          bytes: r.bytes,
          storage: 'supabase',
          bucket: r.bucket,
        };
      }
      const r = await uploadFileToCloudinary(file.path, folder, true);
      return {
        url: r.secure_url,
        publicId: r.public_id,
        format: r.format,
        bytes: r.bytes,
        width: r.width,
        height: r.height,
        storage: 'cloudinary',
      };
    });

    const results = await Promise.all(uploadPromises);

    sendSuccess(res, results, `${results.length} berkas berhasil diunggah (PDF -> Supabase, Gambar -> Cloudinary)`);
  } catch (error: any) {
    console.error('Multiple upload error:', error);
    next(error);
  }
};
