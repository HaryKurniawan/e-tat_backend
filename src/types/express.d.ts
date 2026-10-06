import { UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  agency?: string;
}

declare global {
  namespace Express {
    interface User extends AuthUser {}
    interface Request {
      user?: AuthUser;
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

declare module 'express' {
  interface Request {
    user?: AuthUser;
  }
}

export {};
