import type {
  AdminAuditLog,
  Booking,
  ConcurrencyTestSummary,
  PushNotification,
  Room,
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStateLog,
  TimeSlot,
  User,
  UserRole,
} from '../types';

export interface ApiCallLog {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  endpoint: string;
  statusCode: number;
  durationMs: number;
  requestBody?: unknown;
  responseBody?: unknown;
  userRole?: UserRole;
  curlCommand: string;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

const DEFAULT_USER: User = {
  id: 'usr_student_1',
  name: 'Aarav Sharma',
  email: '112415012@cse.iiitp.ac.in',
  role: 'Student',
  department: 'Computer Science & Engineering',
  isActive: true,
  createdAt: '2026-08-01T09:00:00Z',
};

type HttpMethod = ApiCallLog['method'];

class ApiController {
  private trafficLogs: ApiCallLog[] = [];
  private currentUser: User = DEFAULT_USER;
  private listeners = new Set<() => void>();

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public getCurrentUser() {
    return this.currentUser;
  }

  public getTrafficLogs() {
    return [...this.trafficLogs];
  }

  public clearTrafficLogs() {
    this.trafficLogs = [];
    this.notify();
  }

  private recordLog(
    method: HttpMethod,
    endpoint: string,
    statusCode: number,
    durationMs: number,
    requestBody?: unknown,
    responseBody?: unknown,
  ) {
    this.trafficLogs.unshift({
      id: `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      statusCode,
      durationMs,
      requestBody,
      responseBody,
      userRole: this.currentUser.role,
      curlCommand: this.generateCurl(method, endpoint, requestBody),
    });
    this.trafficLogs = this.trafficLogs.slice(0, 50);
    this.notify();
  }

  private generateCurl(method: HttpMethod, endpoint: string, requestBody?: unknown) {
    const lines = [
      `curl -X ${method} "http://localhost:3000/api${endpoint}"`,
      `  -H "X-User-Id: ${this.currentUser.id}"`,
    ];
    if (requestBody !== undefined) {
      lines.push('  -H "Content-Type: application/json"');
      lines.push(`  -d '${JSON.stringify(requestBody)}'`);
    }
    return lines.join(' \\\n');
  }

  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    requestBody?: unknown,
  ): Promise<T> {
    const start = performance.now();
    let response: Response;
    try {
      response = await fetch(`/api${endpoint}`, {
        method,
        headers: {
          'X-User-Id': this.currentUser.id,
          ...(requestBody === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        ...(requestBody === undefined ? {} : { body: JSON.stringify(requestBody) }),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network request failed.';
      this.recordLog(method, endpoint, 0, Math.round(performance.now() - start), requestBody, { error: message });
      throw new ApiError(`Cannot reach the UCRMS server: ${message}`, 0);
    }

    const raw = response.status === 204 ? '' : await response.text();
    let data: unknown;
    try {
      data = raw ? JSON.parse(raw) : undefined;
    } catch {
      data = raw;
    }
    const duration = Math.round(performance.now() - start);
    this.recordLog(method, endpoint, response.status, duration, requestBody, data);

    if (!response.ok) {
      const message =
        data && typeof data === 'object' && 'error' in data
          ? String((data as { error: unknown }).error)
          : `HTTP ${response.status} ${response.statusText}`;
      throw new ApiError(message, response.status);
    }
    return data as T;
  }

  public async login(email: string) {
    const result = await this.request<{ token: string; user: User }>('POST', '/auth/login', { email });
    this.currentUser = result.user;
    this.notify();
    return result;
  }

  public async switchUserByRole(role: UserRole) {
    this.currentUser = await this.request<User>('POST', '/auth/switch-role', { role });
    this.notify();
  }

  public getRooms() {
    return this.request<Room[]>('GET', '/rooms');
  }

  public getRoomAvailability(roomId: string, date: string) {
    return this.request<TimeSlot[]>(
      'GET',
      `/rooms/${encodeURIComponent(roomId)}/availability?date=${encodeURIComponent(date)}`,
    );
  }

  public createBooking(payload: {
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    purpose: string;
  }) {
    return this.request<Booking>('POST', '/bookings', payload);
  }

  public cancelBooking(bookingId: string, reason?: string) {
    return this.request<Booking>('DELETE', `/bookings/${encodeURIComponent(bookingId)}`, { reason });
  }

  public getBookings() {
    return this.request<Booking[]>('GET', '/bookings');
  }

  public getTickets() {
    return this.request<Ticket[]>('GET', '/tickets');
  }

  public createTicket(payload: {
    roomId: string;
    category: TicketCategory;
    description: string;
    priority: TicketPriority;
    photoUrl?: string | null;
  }) {
    return this.request<Ticket>('POST', '/tickets', payload);
  }

  public getTicketLogs(ticketId?: string) {
    return ticketId
      ? this.request<TicketStateLog[]>('GET', `/tickets/${encodeURIComponent(ticketId)}/logs`)
      : this.request<TicketStateLog[]>('GET', '/admin/ticket-logs');
  }

  public assignTicket(ticketId: string, note?: string) {
    return this.request<Ticket>('PATCH', `/tickets/${encodeURIComponent(ticketId)}/assign`, { note });
  }

  public resolveTicket(ticketId: string, note?: string) {
    return this.request<Ticket>('PATCH', `/tickets/${encodeURIComponent(ticketId)}/resolve`, { note });
  }

  public overrideSuspension(roomId: string, justification: string) {
    return this.request<Room>('POST', `/rooms/${encodeURIComponent(roomId)}/override-suspension`, { justification });
  }

  public updateUserRole(userId: string, newRole: UserRole, reason: string) {
    return this.request<User>('PATCH', `/users/${encodeURIComponent(userId)}/role`, { newRole, reason });
  }

  public toggleUserStatus(userId: string, reason: string) {
    return this.request<User>('PATCH', `/users/${encodeURIComponent(userId)}/status`, { reason });
  }

  public getUsers() {
    return this.request<User[]>('GET', '/users');
  }

  public getAuditLogs() {
    return this.request<AdminAuditLog[]>('GET', '/admin/audit-logs');
  }

  public getNotifications() {
    return this.request<PushNotification[]>('GET', '/notifications');
  }

  public sendTestPush() {
    return this.request<PushNotification>('POST', '/notifications/test', {});
  }

  public markNotificationAsRead(id: string) {
    return this.request<void>('PATCH', `/notifications/${encodeURIComponent(id)}/read`);
  }

  public resetDatabase() {
    return this.request<void>('POST', '/admin/reset');
  }

  public runStressTest(
    count: number,
    roomId: string,
    date: string,
    slot: { startTime: string; endTime: string },
  ) {
    return this.request<ConcurrencyTestSummary>('POST', '/concurrency-stress-test', {
      count,
      roomId,
      date,
      slot,
    });
  }
}

export const api = new ApiController();
