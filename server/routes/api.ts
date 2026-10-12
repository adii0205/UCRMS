import { Router, type Request, type RequestHandler, type Response } from 'express';
import { db } from '../db';
import type { User, UserRole } from '../../src/types';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

const route = (handler: (req: Request, res: Response) => unknown): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(handler(req, res)).catch(next);
  };

const actor = (res: Response): User => res.locals.user as User;
const body = (req: Request) => (req.body && typeof req.body === 'object' ? req.body : {});

function requiredString(value: unknown, field: string, maxLength: number) {
  if (typeof value !== 'string' || !value.trim() || value.length > maxLength) {
    throw new Error(`400 Bad Request: '${field}' must be a non-empty string of at most ${maxLength} characters.`);
  }
  return value.trim();
}

function validateDate(value: unknown) {
  const date = requiredString(value, 'date', 10);
  const parsedDate = new Date(`${date}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(parsedDate.valueOf()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  ) {
    throw new Error('400 Bad Request: Date must use YYYY-MM-DD format.');
  }
  return date;
}

function validateFutureBookingDate(date: string) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (date < today) {
    throw new Error('400 Bad Request: Bookings must be made for today or a future date.');
  }
  return date;
}

function validateTimeRange(startValue: unknown, endValue: unknown) {
  const startTime = requiredString(startValue, 'startTime', 5);
  const endTime = requiredString(endValue, 'endTime', 5);
  const isTime = (time: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
  if (!isTime(startTime) || !isTime(endTime) || startTime >= endTime) {
    throw new Error('400 Bad Request: A valid startTime must be earlier than endTime (HH:mm).');
  }
  return { startTime, endTime };
}

router.post('/auth/login', route((req, res) => {
  const email = String(body(req).email || '').trim().toLowerCase();
  const user = db.getUsers().find((candidate) => candidate.email.toLowerCase() === email);
  if (!user) {
    res.status(401).json({ error: '401 Unauthorized: Invalid campus credentials.' });
    return;
  }
  if (!user.isActive) {
    res.status(403).json({ error: '403 Forbidden: User account has been deactivated by administration.' });
    return;
  }
  res.json({ token: `demo-token-${user.id}`, user });
}));

router.use(authenticate);

router.get('/auth/me', (_req, res) => res.json(actor(res)));

router.post('/auth/switch-role', route((req, res) => {
  const role = body(req).role as UserRole;
  const user = db.getUsers().find((candidate) => candidate.role === role && candidate.isActive);
  if (!user) {
    res.status(400).json({ error: '400 Bad Request: No active persona exists for that role.' });
    return;
  }
  res.json(user);
}));

router.get('/rooms', (_req, res) => res.json(db.getRooms()));

router.get('/rooms/:id/availability', (req, res) => {
  res.json(db.getRoomAvailability(req.params.id, String(req.query.date || '')));
});

router.post('/bookings', route(async (req, res) => {
  const request = body(req);
  const date = validateFutureBookingDate(validateDate(request.date));
  const { startTime, endTime } = validateTimeRange(request.startTime, request.endTime);
  const booking = await db.createBooking(actor(res), {
    roomId: requiredString(request.roomId, 'roomId', 100),
    date,
    startTime,
    endTime,
    purpose: requiredString(request.purpose, 'purpose', 500),
  });
  res.status(201).json(booking);
}));

router.get('/bookings', (_req, res) => {
  const user = actor(res);
  res.json(db.getBookings(user.id, user.role));
});

router.delete('/bookings/:id', (req, res) => {
  res.json(db.cancelBooking(actor(res), req.params.id, body(req).reason));
});

router.get('/tickets', (_req, res) => {
  const user = actor(res);
  res.json(db.getTickets(user.role, user.id));
});

router.post('/tickets', (req, res) => {
  const request = body(req);
  const categories = ['Electrical', 'Network/IT', 'Furniture', 'HVAC/AC', 'Plumbing', 'Audio/Visual'];
  const priorities = ['Low', 'Medium', 'High'];
  if (!categories.includes(String(request.category)) || !priorities.includes(String(request.priority))) {
    throw new Error('400 Bad Request: Ticket category or priority is invalid.');
  }
  const photoUrl = request.photoUrl === null || request.photoUrl === undefined
    ? request.photoUrl
    : requiredString(request.photoUrl, 'photoUrl', 2048);
  if (photoUrl && !/^https?:\/\//i.test(photoUrl)) {
    throw new Error('400 Bad Request: photoUrl must use HTTP or HTTPS.');
  }
  res.status(201).json(db.createTicket(actor(res), {
    roomId: requiredString(request.roomId, 'roomId', 100),
    category: request.category,
    priority: request.priority,
    description: requiredString(request.description, 'description', 2000),
    photoUrl,
  }));
});

router.get('/tickets/:id/logs', (req, res) => {
  const user = actor(res);
  const visibleTicket = db.getTickets(user.role, user.id).some((ticket) => ticket.id === req.params.id);
  if (!visibleTicket) {
    res.status(404).json({ error: '404 Not Found: Ticket not found.' });
    return;
  }
  res.json(db.getTicketLogs(req.params.id));
});

router.patch('/tickets/:id/assign', (req, res) => {
  res.json(db.assignTicket(actor(res), req.params.id, body(req).note));
});

router.patch('/tickets/:id/resolve', (req, res) => {
  res.json(db.resolveTicket(actor(res), req.params.id, body(req).note));
});

router.post('/rooms/:id/override-suspension', (req, res) => {
  res.json(db.adminOverrideSuspension(actor(res), req.params.id, String(body(req).justification || '')));
});

router.patch('/users/:id/role', (req, res) => {
  const request = body(req);
  const roles: UserRole[] = ['Student', 'Maintenance Staff', 'Admin'];
  if (!roles.includes(request.newRole)) {
    throw new Error('400 Bad Request: User role is invalid.');
  }
  res.json(db.updateUserRole(
    actor(res),
    req.params.id,
    request.newRole,
    typeof request.reason === 'string' ? request.reason : '',
  ));
});

router.patch('/users/:id/status', (req, res) => {
  res.json(db.toggleUserStatus(actor(res), req.params.id, String(body(req).reason || '')));
});

router.get('/users', requireRole('Admin'), (_req, res) => res.json(db.getUsers()));

router.get('/admin/audit-logs', requireRole('Admin'), (_req, res) => res.json(db.getAuditLogs()));

router.get('/admin/ticket-logs', requireRole('Admin'), (_req, res) => res.json(db.getAllTicketLogs()));

router.get('/notifications', (req, res) => {
  res.json(db.getNotifications(actor(res).id));
});

router.post('/notifications/test', (_req, res) => {
  res.status(201).json(db.sendTestPush(actor(res)));
});

router.patch('/notifications/:id/read', (req, res) => {
  const isOwned = db.getNotifications(actor(res).id).some((notification) => notification.id === req.params.id);
  if (!isOwned) {
    res.status(404).json({ error: '404 Not Found: Notification not found.' });
    return;
  }
  db.markNotificationAsRead(req.params.id);
  res.sendStatus(204);
});

router.post('/concurrency-stress-test', route(async (req, res) => {
  const request = body(req);
  const count = Number(request.count);
  if (!Number.isInteger(count) || count < 1 || count > 50) {
    throw new Error('400 Bad Request: count must be an integer between 1 and 50.');
  }
  const date = validateDate(request.date);
  const { startTime, endTime } = validateTimeRange(request.slot?.startTime, request.slot?.endTime);
  const result = await db.runConcurrencyStressTest(
    count,
    requiredString(request.roomId, 'roomId', 100),
    date,
    { startTime, endTime },
  );
  res.json(result);
}));

router.post('/admin/reset', requireRole('Admin'), (_req, res) => {
  db.resetToFactoryDefaults();
  res.sendStatus(204);
});

router.use((error: unknown, _req: Request, res: Response, _next: (error?: unknown) => void) => {
  const message = error instanceof Error ? error.message : '500 Internal Server Error';
  const match = message.match(/\b(400|401|403|404|409)\b/);
  res.status(match ? Number(match[1]) : 500).json({ error: message });
});

export default router;