import { Request } from 'express';

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Mengekstrak parameter pagination dari query string request
 */
export const getPagination = (req: Request): PaginationOptions => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Mengekstrak string search dari query
 */
export const getSearch = (req: Request): string => {
  return (req.query.search as string) || '';
};
