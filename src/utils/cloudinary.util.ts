import cloudinary from '../config/cloudinary';
import fs from 'fs';

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
}

/**
 * Upload a local file to Cloudinary and optionally remove local temporary file
 */
export const uploadFileToCloudinary = async (
  filePath: string,
  folder: string = 'polri-etat',
  deleteAfterUpload: boolean = true
): Promise<CloudinaryUploadResult> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `polri-etat/${folder}`,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
    });

    if (deleteAfterUpload && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Failed to clean up temp file:', filePath);
      }
    }

    return result as CloudinaryUploadResult;
  } catch (error) {
    if (deleteAfterUpload && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {}
    }
    throw error;
  }
};

/**
 * Upload base64 data string directly to Cloudinary
 */
export const uploadBase64ToCloudinary = async (
  base64String: string,
  folder: string = 'polri-etat'
): Promise<CloudinaryUploadResult> => {
  const result = await cloudinary.uploader.upload(base64String, {
    folder: `polri-etat/${folder}`,
    resource_type: 'auto',
  });
  return result as CloudinaryUploadResult;
};

/**
 * Delete a file from Cloudinary by public ID
 */
export const deleteFromCloudinary = async (publicId: string): Promise<any> => {
  return await cloudinary.uploader.destroy(publicId);
};
