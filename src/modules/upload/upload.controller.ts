import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { uploadFileToCloudinary, uploadBase64ToCloudinary } from '../../utils/cloudinary.util';
import { uploadPdfToSupabase, uploadPdfBase64ToSupabase } from '../../utils/supabase.util';
import { sendSuccess, sendError } from '../../utils/response.util';

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

/**
 * POST /api/upload/image & POST /api/upload
 * Automatically routes PDF documents to Supabase Storage (bucket: dokumen)
 * and images to Cloudinary.
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
      const isPdf = isPdfFile(req.file);

      if (isPdf) {
        // Upload PDF ke Supabase Storage (bucket: dokumen)
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

      // Upload Gambar ke Cloudinary
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
 * Upload multiple files (PDF goes to Supabase, Images to Cloudinary)
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

    const uploadPromises = files.map(async file => {
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

