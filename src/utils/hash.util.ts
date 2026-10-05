import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SALT_ROUNDS = 12;

/**
 * Hash password menggunakan bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Verifikasi password dengan hash tersimpan
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate QR verification code unik untuk rekomendasi
 */
export const generateQrCode = (): string => {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
};

/**
 * Generate SHA-256 hash untuk verifikasi integritas dokumen
 */
export const generateDocumentHash = (content: string): string => {
  return crypto.createHash('sha256').update(content).digest('hex');
};

export const generateSha256Hash = generateDocumentHash;

