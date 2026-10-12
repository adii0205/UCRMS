import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import express from 'express';
import { db } from '../db';
import apiRouter from '../routes/api';

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

let server: ReturnType<typeof app.listen>;
let baseUrl: string;

const futureDate = (daysAhead: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  baseUrl = `http://127.0.0.1:${address.port}/api`;
});

beforeEach(() => db.resetToFactoryDefaults());

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

const request = (path: string, options: RequestInit = {}, userId = 'usr_student_1') =>
  fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
      ...options.headers,
    },
  });

test('serves seeded data and rejects unknown campus accounts', async () => {
  const roomsResponse = await request('/rooms');
  assert.equal(roomsResponse.status, 200);
  assert.equal((await roomsResponse.json()).length, 6);

  const loginResponse = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'unknown@iiitp.ac.in' }),
  });
  assert.equal(loginResponse.status, 401);
});

test('serializes overlapping booking requests and reports a conflict', async () => {
  const booking = {
    roomId: 'room_sc204',
    date: futureDate(3),
    startTime: '09:00',
    endTime: '10:00',
    purpose: 'Concurrency test booking',
  };
  const results = await Promise.all(
    Array.from({ length: 8 }, () =>
      request('/bookings', { method: 'POST', body: JSON.stringify(booking) }),
    ),
  );

  assert.equal(results.filter((response) => response.status === 201).length, 1);
  assert.equal(results.filter((response) => response.status === 409).length, 7);
});

test('protects admin endpoints and validates malformed bookings', async () => {
  const forbidden = await request('/users');
  assert.equal(forbidden.status, 403);

  const allowed = await request('/users', {}, 'usr_admin_1');
  assert.equal(allowed.status, 200);

  const invalidRole = await request('/users/usr_student_2/role', {
    method: 'PATCH',
    body: JSON.stringify({ newRole: 'SuperAdmin' }),
  }, 'usr_admin_1');
  assert.equal(invalidRole.status, 400);

  const invalidBooking = await request('/bookings', {
    method: 'POST',
    body: JSON.stringify({
      roomId: 'room_sc204',
      date: 'not-a-date',
      startTime: '10:00',
      endTime: '09:00',
      purpose: '',
    }),
  });
  assert.equal(invalidBooking.status, 400);
});

test('high-priority tickets suspend the room and notify affected bookings', async () => {
  const response = await request('/tickets', {
    method: 'POST',
    body: JSON.stringify({
      roomId: 'room_sh101',
      category: 'Electrical',
      priority: 'High',
      description: 'Breaker is sparking during normal use.',
    }),
  });
  assert.equal(response.status, 201);
  assert.equal(db.getRoomById('room_sh101')?.isSuspended, true);
  assert.ok(db.getNotifications('usr_student_1').some((notification) => notification.category === 'event_bridge_alert'));

  const reset = await request('/admin/reset', { method: 'POST' }, 'usr_admin_1');
  assert.equal(reset.status, 204);
  assert.equal(db.getRoomById('room_sh101')?.isSuspended, false);
  assert.equal(db.getBookings().find((booking) => booking.id === 'bk_101')?.status, 'Confirmed');
});

test('test push notifications are persisted for the signed-in user', async () => {
  const response = await request('/notifications/test', { method: 'POST', body: '{}' });
  assert.equal(response.status, 201);
  const notification = await response.json();
  assert.equal(notification.userId, 'usr_student_1');
  assert.equal(notification.isRead, false);
});

test('availability reports partial-hour overlaps as booked', async () => {
  const booking = await request('/bookings', {
    method: 'POST',
    body: JSON.stringify({
      roomId: 'room_sc204',
      date: futureDate(2),
      startTime: '10:30',
      endTime: '10:45',
      purpose: 'Short equipment setup',
    }),
  });
  assert.equal(booking.status, 201);

  const response = await request(`/rooms/room_sc204/availability?date=${futureDate(2)}`);
  const slots = await response.json();
  assert.equal(slots.find((slot: { startTime: string }) => slot.startTime === '10:00').isBooked, true);
});