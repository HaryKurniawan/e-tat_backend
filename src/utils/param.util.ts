import { Request } from 'express';

/**
 * Safely extracts a route parameter string from Express Request
 */
export const getParam = (req: Request, key: string): string => {
  const val = req.params[key];
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
};
