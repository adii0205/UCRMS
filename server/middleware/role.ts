import type { RequestHandler } from 'express';
import type { User, UserRole } from '../../src/types';

export function requireRole(...allowedRoles: UserRole[]): RequestHandler {
  return (_req, res, next) => {
    const user = res.locals.user as User | undefined;
    if (!user || !allowedRoles.includes(user.role)) {
      res.status(403).json({ error: '403 Forbidden: Insufficient permissions for this operation.' });
      return;
    }
    next();
  };
}