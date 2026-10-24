import type { NextFunction, Request, Response } from 'express';
import { db } from '../db';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  // Support Bearer token (e.g. "Bearer demo-token-usr_student_1") or X-User-Id header for compatibility
  const authHeader = req.get('authorization') || '';
  let userId = '';

  if (authHeader.startsWith('Bearer demo-token-')) {
    userId = authHeader.slice('Bearer demo-token-'.length).trim();
  } else if (authHeader.startsWith('Bearer ')) {
    userId = authHeader.slice('Bearer '.length).trim();
  }

  if (!userId) {
    userId = req.get('x-user-id') || '';
  }

  if (!userId) {
    res.status(401).json({ error: '401 Unauthorized: Missing or invalid authentication token.' });
    return;
  }

  const user = db.getUserById(userId);

  if (!user) {
    res.status(401).json({ error: '401 Unauthorized: Unknown user.' });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: '403 Forbidden: User account has been deactivated.' });
    return;
  }

  res.locals.user = user;
  next();
}
