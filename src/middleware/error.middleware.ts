import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Global error handling middleware.
 * Menangani ZodError, AppError, dan generic error.
 */
export const errorMiddleware = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validasi input gagal',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  // Prisma known errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'Data sudah ada (duplikat)',
        error: `Field yang duplikat: ${prismaErr.meta?.target}`,
      });
      return;
    }
    if (prismaErr.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Data tidak ditemukan',
      });
      return;
    }
  }

  // Operational errors (yang kita throw sendiri)
  if (err.isOperational) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Unhandled errors
  console.error('🚨 Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server',
    error: env.NODE_ENV === 'development' ? err.message : undefined,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export const errorHandler = errorMiddleware;

/**
 * 404 Route not found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Rute ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
};

/**
 * Helper untuk membuat error operasional
 */
export const createError = (message: string, statusCode: number = 400): AppError => {
  const err: AppError = new Error(message);
  err.statusCode = statusCode;
  err.isOperational = true;
  return err;
};

