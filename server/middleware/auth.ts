import type { NextFunction, Request, Response } from 'express';
import { db } from '../db';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const userId = req.get('x-user-id') || 'usr_student_1';
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