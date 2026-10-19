import { supabase, supabaseBucket } from '../config/supabase';
import fs from 'fs';
import path from 'path';

export interface SupabaseUploadResult {
  url: string;
  publicId: string;
  format: string;
  resource_type: string;
  bytes: number;
  bucket: string;
  path: string;
}

/**
 * Upload a local PDF file to Supabase Storage Bucket
 */
export const uploadPdfToSupabase = async (
  filePath: string,
  folder: string = 'dokumen',
  deleteAfterUpload: boolean = true
): Promise<SupabaseUploadResult> => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const originalExt = path.extname(filePath);
    const basename = path.basename(filePath, originalExt).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '') || 'dokumen';
    const destinationPath = `${cleanFolder}/${basename}-${uniqueSuffix}.pdf`;

    const { data, error } = await supabase.storage
      .from(supabaseBucket)
      .upload(destinationPath, fileBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      throw new Error(`Gagal upload PDF ke Supabase Storage: ${error.message}`);
    }

    // Dapatkan Public URL
    const { data: publicUrlData } = supabase.storage
      .from(supabaseBucket)
      .getPublicUrl(data.path);

    const stats = fs.statSync(filePath);

    if (deleteAfterUpload && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Gagal menghapus file temp lokal:', filePath);
      }
    }

    return {
      url: publicUrlData.publicUrl,
      publicId: data.path,
      format: 'pdf',
      resource_type: 'raw',
      bytes: stats.size,
      bucket: supabaseBucket,
      path: data.path,
    };
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
 * Upload Buffer directly to Supabase Storage Bucket (misal hasil generate PDFKit)
 */
export const uploadPdfBufferToSupabase = async (
  buffer: Buffer,
  filename: string,
  folder: string = 'dokumen'
): Promise<SupabaseUploadResult> => {
  const sanitizedName = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '') || 'dokumen';
  const destinationPath = `${cleanFolder}/${Date.now()}-${sanitizedName}`;

  const { data, error } = await supabase.storage
    .from(supabaseBucket)
    .upload(destinationPath, buffer, {
      contentType: 'application/pdf',
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(`Gagal upload buffer PDF ke Supabase Storage: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(supabaseBucket)
    .getPublicUrl(data.path);

  return {
    url: publicUrlData.publicUrl,
    publicId: data.path,
    format: 'pdf',
    resource_type: 'raw',
    bytes: buffer.length,
    bucket: supabaseBucket,
    path: data.path,
  };
};

/**
 * Upload base64 PDF data string to Supabase Storage Bucket
 */
export const uploadPdfBase64ToSupabase = async (
  base64String: string,
  folder: string = 'dokumen',
  filenamePrefix: string = 'dokumen_tat'
): Promise<SupabaseUploadResult> => {
  const base64Data = base64String.replace(/^data:application\/pdf;base64,/, '').replace(/^data:.*;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '') || 'dokumen';
  const destinationPath = `${cleanFolder}/${filenamePrefix}-${Date.now()}.pdf`;

  const { data, error } = await supabase.storage
    .from(supabaseBucket)
    .upload(destinationPath, buffer, {
      contentType: 'application/pdf',
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(`Gagal upload base64 PDF ke Supabase Storage: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(supabaseBucket)
    .getPublicUrl(data.path);

  return {
    url: publicUrlData.publicUrl,
    publicId: data.path,
    format: 'pdf',
    resource_type: 'raw',
    bytes: buffer.length,
    bucket: supabaseBucket,
    path: data.path,
  };
};

