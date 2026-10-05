import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Berhasil',
  statusCode = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  } as ApiResponse<T>);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Berhasil'
): Response => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  } as ApiResponse<T[]>);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  error?: string
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  } as ApiResponse);
};

export const sendCreated = <T>(res: Response, data: T, message = 'Data berhasil dibuat'): Response => {
  return sendSuccess(res, data, message, 201);
};

export const sendNotFound = (res: Response, message = 'Data tidak ditemukan'): Response => {
  return sendError(res, message, 404);
};

export const sendForbidden = (res: Response, message = 'Tidak memiliki akses'): Response => {
  return sendError(res, message, 403);
};

export const sendUnauthorized = (res: Response, message = 'Tidak terautentikasi'): Response => {
  return sendError(res, message, 401);
};
