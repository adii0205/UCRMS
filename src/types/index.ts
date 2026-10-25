export type UserRole = 'Student' | 'Maintenance Staff' | 'Admin';

export type TicketCategory =
  | 'Electrical'
  | 'Network/IT'
  | 'Furniture'
  | 'HVAC/AC'
  | 'Plumbing'
  | 'Audio/Visual';

export type TicketPriority = 'Low' | 'Medium' | 'High';

export type TicketState = 'Open' | 'Assigned' | 'Resolved';

export type BookingStatus = 'Confirmed' | 'Cancelled' | 'Suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: string;
  capacity: number;
  equipment: string[];
  imageUrl?: string;
  isSuspended: boolean;
  activeTicketId?: string | null;
  suspensionReason?: string | null;
  suspendedAt?: string | null;
  suspendedByTicketPriority?: TicketPriority | null;
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  purpose: string;
  status: BookingStatus;
  createdAt: string;
  suspendedByEventBridge?: boolean;
  suspensionNotice?: string;
}

export interface Ticket {
  id: string;
  roomId: string;
  roomName: string;
  building: string;
  reportedBy: string; // userId
  reportedByName: string;
  reportedByRole: UserRole;
  assignedTo?: string | null; // userId
  assignedToName?: string | null;
  category: TicketCategory;
  priority: TicketPriority;
  state: TicketState;
  description: string;
  photoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
}

export interface TicketStateLog {
  id: string;
  ticketId: string;
  fromState: TicketState;
  toState: TicketState;
  changedBy: string; // userId
  changedByName: string;
  changedByRole: UserRole;
  timestamp: string;
  note?: string;
}

export interface AdminAuditLog {
  id: string;
  action: 'MANUAL_OVERRIDE_SUSPENSION' | 'ROLE_CHANGE' | 'ACCOUNT_STATUS_CHANGE' | 'MANUAL_BOOKING_CANCEL';
  adminId: string;
  adminName: string;
  targetId: string; // roomId, userId, etc.
  targetName: string;
  reason: string;
  timestamp: string;
}

export interface PushNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  category: 'event_bridge_alert' | 'booking_confirmed' | 'ticket_update' | 'system';
  targetRoute?: {
    tab: 'Home' | 'Bookings' | 'Tickets' | 'Profile';
    id?: string;
  };
  timestamp: string;
  isRead: boolean;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookingId?: string;
  isSuspended: boolean;
}

export interface ConcurrencyTestStep {
  requestId: number;
  userName: string;
  timestamp: number;
  status: 'PENDING' | 'SUCCESS' | 'CONFLICT';
  latencyMs: number;
  message: string;
}

export interface ConcurrencyTestSummary {
  totalRequests: number;
  successCount: number;
  conflictCount: number;
  avgLatencyMs: number;
  roomId: string;
  slot: string;
  doubleBookingDetected: boolean;
  steps: ConcurrencyTestStep[];
}
