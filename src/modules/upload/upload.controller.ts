import { Request, Response, NextFunction } from 'express';
import { uploadFileToCloudinary, uploadBase64ToCloudinary } from '../../utils/cloudinary.util';
import { sendSuccess, sendError } from '../../utils/response.util';

/**
 * POST /api/upload/image
 * Upload single image or document to Cloudinary
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
        },
        'File berhasil diunggah ke Cloudinary'
      );
      return;
    }

    // 2. Check if base64 provided in body
    if (req.body.base64 || req.body.image) {
      const base64Data = req.body.base64 || req.body.image;
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
        },
        'Gambar base64 berhasil diunggah ke Cloudinary'
      );
      return;
    }

    sendError(res, 'Tidak ada file atau gambar yang diunggah.', 400);
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    next(error);
  }
};

/**
 * POST /api/upload/multiple
 * Upload multiple files to Cloudinary
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

    const uploadPromises = files.map(file => uploadFileToCloudinary(file.path, folder, true));
    const results = await Promise.all(uploadPromises);

    const data = results.map(r => ({
      url: r.secure_url,
      publicId: r.public_id,
      format: r.format,
      bytes: r.bytes,
      width: r.width,
      height: r.height,
    }));

    sendSuccess(res, data, `${results.length} berkas berhasil diunggah ke Cloudinary`);
  } catch (error: any) {
    console.error('Cloudinary multiple upload error:', error);
    next(error);
  }
};
