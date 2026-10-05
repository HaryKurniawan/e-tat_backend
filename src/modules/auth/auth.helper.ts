import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

// In-memory blacklist untuk refresh token logout (produksi: pakai Redis)
export const revokedTokens = new Set<string>();

export const generateTokens = (user: { id: string; email: string; role: string; name: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES as jwt.SignOptions['expiresIn'] }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES as jwt.SignOptions['expiresIn'] }
  );

  return { accessToken, refreshToken };
};
