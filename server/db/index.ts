import {
  User,
  Room,
  Booking,
  Ticket,
  TicketStateLog,
  AdminAuditLog,
  PushNotification,
  UserRole,
  TicketCategory,
  TicketPriority,
  TicketState,
  ConcurrencyTestSummary,
} from '../../src/types';
import { randomUUID } from 'node:crypto';

const createId = (prefix: string) => `${prefix}_${randomUUID()}`;

// Pre-seeded users
export const INITIAL_USERS: User[] = [
  {
    id: 'usr_student_1',
    name: 'Aarav Sharma',
    email: '112415012@cse.iiitp.ac.in',
    role: 'Student',
    department: 'Computer Science & Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'usr_student_2',
    name: 'Neha Gupta',
    email: 'neha.gupta@iiitp.ac.in',
    role: 'Student',
    department: 'Electronics & Communication',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-08-05T10:30:00Z',
  },
  {
    id: 'usr_staff_1',
    name: 'Ramesh Patel',
    email: 'ramesh.patel@iiitp.ac.in',
    role: 'Maintenance Staff',
    department: 'Campus Electrical & AV Services',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-06-12T08:00:00Z',
  },
  {
    id: 'usr_staff_2',
    name: 'Suresh Kumar',
    email: 'suresh.kumar@iiitp.ac.in',
    role: 'Maintenance Staff',
    department: 'Campus IT & Network Infrastructure',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-06-15T08:30:00Z',
  },
  {
    id: 'usr_admin_1',
    name: 'Dr. Priya Rao',
    email: 'admin.facilities@iiitp.ac.in',
    role: 'Admin',
    department: 'Estate & Facilities Directorate',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-01-10T09:00:00Z',
  },
];

// Pre-seeded campus rooms
export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room_sh101',
    name: 'Seminar Hall 101',
    building: 'Academic Block A',
    floor: '1st Floor',
    capacity: 120,
    equipment: ['Ceiling Projector', 'Surround Sound', 'Podium Mic', 'Dual HVAC', 'Gigabit LAN'],
    isSuspended: false,
    activeTicketId: null,
    suspensionReason: null,
    suspendedAt: null,
  },
  {
    id: 'room_lab3',
    name: 'Computer Lab 3 (AI/ML)',
    building: 'CSE Wing',
    floor: '2nd Floor',
    capacity: 45,
    equipment: ['45 High-End Workstations', 'NVIDIA GPUs', 'Fiber Switch', 'Precision Cooling'],
    isSuspended: true, // Initially suspended for quick Event Bridge demo!
    activeTicketId: 'tkt_001',
    suspensionReason: 'Overheating server rack & tripping circuit breaker (Priority: High)',
    suspendedAt: '2026-10-11T19:45:00Z',
    suspendedByTicketPriority: 'High',
  },
  {
    id: 'room_iot_lab',
    name: 'Robotics & IoT Lab',
    building: 'Tech Innovation Park',
    floor: 'Ground Floor',
    capacity: 35,
    equipment: ['Oscilloscopes', 'Soldering Stations', '3D Printers', 'RF Shielded Enclosure'],
    isSuspended: false,
    activeTicketId: null,
    suspensionReason: null,
    suspendedAt: null,
  },
  {
    id: 'room_conf_b',
    name: 'Executive Conference Room B',
    building: 'Administrative Complex',
    floor: '3rd Floor',
    capacity: 22,
    equipment: ['Video Conference Bar', 'Smart Whiteboard', 'Executive Seating', 'Acoustic Paneling'],
    isSuspended: false,
    activeTicketId: null,
    suspensionReason: null,
    suspendedAt: null,
  },
  {
    id: 'room_aud_main',
    name: 'Main Auditorium',
    building: 'Central Cultural Center',
    floor: 'Ground Floor',
    capacity: 350,
    equipment: ['Stage Lighting Truss', 'Dolby Atmos System', 'Dual 4K Laser Projectors', 'Green Room'],
    isSuspended: false,
    activeTicketId: null,
    suspensionReason: null,
    suspendedAt: null,
  },
  {
    id: 'room_sc204',
    name: 'Smart Classroom 204',
    building: 'Academic Block B',
    floor: '2nd Floor',
    capacity: 65,
    equipment: ['Interactive Touch Panel', 'Omnidirectional Mics', 'Lecture Capture Camera'],
    isSuspended: false,
    activeTicketId: null,
    suspensionReason: null,
    suspendedAt: null,
  },
];

// Pre-seeded bookings
export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk_101',
    roomId: 'room_sh101',
    roomName: 'Seminar Hall 101',
    userId: 'usr_student_1',
    userName: 'Aarav Sharma',
    userEmail: '112415012@cse.iiitp.ac.in',
    userRole: 'Student',
    date: '2026-10-12',
    startTime: '10:00',
    endTime: '12:00',
    purpose: 'ACM Student Chapter Technical Workshop on Distributed Systems',
    status: 'Confirmed',
    createdAt: '2026-10-10T14:30:00Z',
  },
  {
    id: 'bk_102',
    roomId: 'room_lab3',
    roomName: 'Computer Lab 3 (AI/ML)',
    userId: 'usr_student_1',
    userName: 'Aarav Sharma',
    userEmail: '112415012@cse.iiitp.ac.in',
    userRole: 'Student',
    date: '2026-10-12',
    startTime: '14:00',
    endTime: '16:00',
    purpose: 'Deep Learning Model Fine-Tuning Session',
    status: 'Suspended',
    createdAt: '2026-10-09T11:00:00Z',
    suspendedByEventBridge: true,
    suspensionNotice: 'Auto-suspended by Event Bridge due to Ticket #tkt_001 (High Priority Electrical Hazard)',
  },
  {
    id: 'bk_103',
    roomId: 'room_conf_b',
    roomName: 'Executive Conference Room B',
    userId: 'usr_student_2',
    userName: 'Neha Gupta',
    userEmail: 'neha.gupta@iiitp.ac.in',
    userRole: 'Student',
    date: '2026-10-13',
    startTime: '11:00',
    endTime: '13:00',
    purpose: 'Robotics Club Annual Budget & Logistics Review',
    status: 'Confirmed',
    createdAt: '2026-10-10T16:20:00Z',
  },
];

// Pre-seeded tickets
export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'tkt_001',
    roomId: 'room_lab3',
    roomName: 'Computer Lab 3 (AI/ML)',
    building: 'CSE Wing',
    reportedBy: 'usr_student_2',
    reportedByName: 'Neha Gupta',
    reportedByRole: 'Student',
    assignedTo: null,
    assignedToName: null,
    category: 'Electrical',
    priority: 'High',
    state: 'Open',
    description: 'Server rack breaker in corner 4 is tripping under GPU compute load with audible sparking.',
    photoUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80',
    createdAt: '2026-10-11T19:45:00Z',
    updatedAt: '2026-10-11T19:45:00Z',
  },
  {
    id: 'tkt_002',
    roomId: 'room_sh101',
    roomName: 'Seminar Hall 101',
    building: 'Academic Block A',
    reportedBy: 'usr_student_1',
    reportedByName: 'Aarav Sharma',
    reportedByRole: 'Student',
    assignedTo: 'usr_staff_1',
    assignedToName: 'Ramesh Patel',
    category: 'Audio/Visual',
    priority: 'Medium',
    state: 'Assigned',
    description: 'Main podium HDMI passthrough cable has intermittent color distortion.',
    photoUrl: 'https://images.unsplash.com/photo-1517430816045-df4b7de81d48?w=500&auto=format&fit=crop&q=80',
    createdAt: '2026-10-11T14:15:00Z',
    updatedAt: '2026-10-11T15:00:00Z',
  },
  {
    id: 'tkt_003',
    roomId: 'room_sc204',
    roomName: 'Smart Classroom 204',
    building: 'Academic Block B',
    reportedBy: 'usr_staff_2',
    reportedByName: 'Suresh Kumar',
    reportedByRole: 'Maintenance Staff',
    assignedTo: 'usr_staff_2',
    assignedToName: 'Suresh Kumar',
    category: 'Network/IT',
    priority: 'Low',
    state: 'Resolved',
    description: 'Wall RJ45 port #8 had loose termination. Re-crimped and verified 1 Gbps link.',
    photoUrl: null,
    createdAt: '2026-10-10T09:30:00Z',
    updatedAt: '2026-10-10T11:20:00Z',
    resolvedAt: '2026-10-10T11:20:00Z',
  },
];

export const INITIAL_TICKET_LOGS: TicketStateLog[] = [
  {
    id: 'log_001',
    ticketId: 'tkt_001',
    fromState: 'Open',
    toState: 'Open',
    changedBy: 'usr_student_2',
    changedByName: 'Neha Gupta',
    changedByRole: 'Student',
    timestamp: '2026-10-11T19:45:00Z',
    note: 'Ticket created with priority High. Event Bridge triggered room suspension.',
  },
  {
    id: 'log_002',
    ticketId: 'tkt_002',
    fromState: 'Open',
    toState: 'Open',
    changedBy: 'usr_student_1',
    changedByName: 'Aarav Sharma',
    changedByRole: 'Student',
    timestamp: '2026-10-11T14:15:00Z',
    note: 'Initial report filed.',
  },
  {
    id: 'log_003',
    ticketId: 'tkt_002',
    fromState: 'Open',
    toState: 'Assigned',
    changedBy: 'usr_staff_1',
    changedByName: 'Ramesh Patel',
    changedByRole: 'Maintenance Staff',
    timestamp: '2026-10-11T15:00:00Z',
    note: 'Self-assigned ticket to inspect HDMI cable harness.',
  },
  {
    id: 'log_004',
    ticketId: 'tkt_003',
    fromState: 'Open',
    toState: 'Assigned',
    changedBy: 'usr_staff_2',
    changedByName: 'Suresh Kumar',
    changedByRole: 'Maintenance Staff',
    timestamp: '2026-10-10T10:00:00Z',
    note: 'Assigned to self for RJ45 inspection.',
  },
  {
    id: 'log_005',
    ticketId: 'tkt_003',
    fromState: 'Assigned',
    toState: 'Resolved',
    changedBy: 'usr_staff_2',
    changedByName: 'Suresh Kumar',
    changedByRole: 'Maintenance Staff',
    timestamp: '2026-10-10T11:20:00Z',
    note: 'Re-crimped RJ45 keystones and tested throughput.',
  },
];

export const INITIAL_NOTIFICATIONS: PushNotification[] = [
  {
    id: 'notif_001',
    userId: 'usr_student_1',
    title: '⚠️ Event Bridge Alert: Room Suspended',
    body: 'Computer Lab 3 has been suspended due to High Priority Ticket #tkt_001. Your booking on 2026-10-12 (14:00-16:00) is temporarily paused.',
    category: 'event_bridge_alert',
    targetRoute: { tab: 'Bookings', id: 'bk_102' },
    timestamp: '2026-10-11T19:45:05Z',
    isRead: false,
  },
  {
    id: 'notif_002',
    userId: 'usr_student_1',
    title: '✅ Booking Confirmed',
    body: 'Your reservation for Seminar Hall 101 on 2026-10-12 (10:00-12:00) is confirmed.',
    category: 'booking_confirmed',
    targetRoute: { tab: 'Bookings', id: 'bk_101' },
    timestamp: '2026-10-10T14:30:02Z',
    isRead: true,
  },
];

export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'audit_001',
    action: 'ROLE_CHANGE',
    adminId: 'usr_admin_1',
    adminName: 'Dr. Priya Rao',
    targetId: 'usr_staff_2',
    targetName: 'Suresh Kumar',
    reason: 'Promoted to Lead Campus IT & Network Infrastructure',
    timestamp: '2026-09-01T11:00:00Z',
  },
];

// In-Memory Database Store Class with ACID Transaction Simulation & Mutex Locking
class CampusDatabase {
  private users: User[] = structuredClone(INITIAL_USERS);
  private rooms: Room[] = structuredClone(INITIAL_ROOMS);
  private bookings: Booking[] = structuredClone(INITIAL_BOOKINGS);
  private tickets: Ticket[] = structuredClone(INITIAL_TICKETS);
  private ticketLogs: TicketStateLog[] = structuredClone(INITIAL_TICKET_LOGS);
  private notifications: PushNotification[] = structuredClone(INITIAL_NOTIFICATIONS);
  private auditLogs: AdminAuditLog[] = structuredClone(INITIAL_AUDIT_LOGS);

  // Mutex promise queue for serializable execution
  private mutexChain: Promise<void> = Promise.resolve();

  public resetToFactoryDefaults() {
    this.users = structuredClone(INITIAL_USERS);
    this.rooms = structuredClone(INITIAL_ROOMS);
    this.bookings = structuredClone(INITIAL_BOOKINGS);
    this.tickets = structuredClone(INITIAL_TICKETS);
    this.ticketLogs = structuredClone(INITIAL_TICKET_LOGS);
    this.notifications = structuredClone(INITIAL_NOTIFICATIONS);
    this.auditLogs = structuredClone(INITIAL_AUDIT_LOGS);
  }

  // Helper to execute inside database lock (simulating SERIALIZABLE row-level locking)
  private runInLock<T>(_lockKey: string, fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.mutexChain = this.mutexChain
        .then(async () => {
          try {
            const result = await fn();
            resolve(result);
          } catch (err) {
            reject(err);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  // --- User Queries ---
  public getUsers(): User[] {
    return [...this.users];
  }

  public getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public updateUserRole(adminUser: User, targetUserId: string, newRole: UserRole, reason: string): User {
    if (adminUser.role !== 'Admin') {
      throw new Error('403 Forbidden: Only Administrators can update user roles (REQ-2.3).');
    }
    const target = this.users.find((u) => u.id === targetUserId);
    if (!target) throw new Error('404 Not Found: Target user not found.');

    const oldRole = target.role;
    target.role = newRole;

    this.auditLogs.unshift({
      id: createId('audit'),
      action: 'ROLE_CHANGE',
      adminId: adminUser.id,
      adminName: adminUser.name,
      targetId: target.id,
      targetName: target.name,
      reason: `Changed role from ${oldRole} to ${newRole}: ${reason || 'Administrative re-assignment'}`,
      timestamp: new Date().toISOString(),
    });

    return target;
  }

  public toggleUserStatus(adminUser: User, targetUserId: string, reason: string): User {
    if (adminUser.role !== 'Admin') {
      throw new Error('403 Forbidden: Only Administrators can activate/deactivate accounts (REQ-2.3).');
    }
    const target = this.users.find((u) => u.id === targetUserId);
    if (!target) throw new Error('404 Not Found: Target user not found.');

    target.isActive = !target.isActive;

    this.auditLogs.unshift({
      id: createId('audit'),
      action: 'ACCOUNT_STATUS_CHANGE',
      adminId: adminUser.id,
      adminName: adminUser.name,
      targetId: target.id,
      targetName: target.name,
      reason: `Account set to ${target.isActive ? 'Active' : 'Deactivated'}: ${reason}`,
      timestamp: new Date().toISOString(),
    });

    return target;
  }

  // --- Room Queries ---
  public getRooms(): Room[] {
    return [...this.rooms];
  }

  public getRoomById(id: string): Room | undefined {
    return this.rooms.find((r) => r.id === id);
  }

  public getRoomAvailability(roomId: string, date: string) {
    const room = this.rooms.find((r) => r.id === roomId);
    if (!room) throw new Error('404 Room not found');

    const standardSlots = [
      { startTime: '09:00', endTime: '10:00' },
      { startTime: '10:00', endTime: '11:00' },
      { startTime: '11:00', endTime: '12:00' },
      { startTime: '12:00', endTime: '13:00' },
      { startTime: '13:00', endTime: '14:00' },
      { startTime: '14:00', endTime: '15:00' },
      { startTime: '15:00', endTime: '16:00' },
      { startTime: '16:00', endTime: '17:00' },
      { startTime: '17:00', endTime: '18:00' },
    ];

    const activeBookings = this.bookings.filter(
      (b) => b.roomId === roomId && b.date === date && b.status !== 'Cancelled'
    );

    return standardSlots.map((slot) => {
      const match = activeBookings.find(
        (b) =>
          slot.startTime < b.endTime && slot.endTime > b.startTime
      );

      return {
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBooked: !!match,
        bookingId: match?.id,
        isSuspended: room.isSuspended,
        suspendedReason: room.isSuspended ? room.suspensionReason : undefined,
      };
    });
  }

  // --- Booking Operations with Database-level Mutex Locking (REQ-1.2, REQ-1.3) ---
  public async createBooking(
    user: User,
    data: {
      roomId: string;
      date: string;
      startTime: string;
      endTime: string;
      purpose: string;
    }
  ): Promise<Booking> {
    if (!user.isActive) {
      throw new Error('403 Forbidden: Your user account is deactivated.');
    }

    const lockKey = `lock:${data.roomId}:${data.date}`;

    return this.runInLock(lockKey, async () => {
      const room = this.rooms.find((r) => r.id === data.roomId);
      if (!room) {
        throw new Error('404 Not Found: Room does not exist.');
      }

      // REQ-1.3 & REQ-4.2: Reject if room is currently suspended
      if (room.isSuspended) {
        throw new Error(
          `409 Conflict: Room '${room.name}' is currently SUSPENDED by Event Bridge due to Ticket #${room.activeTicketId || 'Active'}: ${room.suspensionReason || 'Active safety issue'}`
        );
      }

      // REQ-1.2: Check for overlapping bookings
      const hasOverlap = this.bookings.some((b) => {
        if (b.roomId !== data.roomId || b.date !== data.date || b.status === 'Cancelled') {
          return false;
        }
        // Time overlap check: start < b.end && end > b.start
        return data.startTime < b.endTime && data.endTime > b.startTime;
      });

      if (hasOverlap) {
        throw new Error(
          `409 Conflict: Slot ${data.startTime}-${data.endTime} on ${data.date} is already booked for '${room.name}'. (Database Exclusion Constraint Enforced)`
        );
      }

      // Simulate micro-delay of database transaction serialization (30-50ms)
      await new Promise((r) => setTimeout(r, 35));

      const newBooking: Booking = {
        id: createId('bk'),
        roomId: room.id,
        roomName: room.name,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        purpose: data.purpose || 'Academic session',
        status: 'Confirmed',
        createdAt: new Date().toISOString(),
      };

      this.bookings.unshift(newBooking);

      // Notification
      this.notifications.unshift({
        id: createId('notif'),
        userId: user.id,
        title: '✅ Booking Confirmed',
        body: `Reservation confirmed for ${room.name} on ${data.date} (${data.startTime}-${data.endTime}).`,
        category: 'booking_confirmed',
        targetRoute: { tab: 'Bookings', id: newBooking.id },
        timestamp: new Date().toISOString(),
        isRead: false,
      });

      return newBooking;
    });
  }

  // REQ-1.4: Cancel own booking or admin cancellation
  public cancelBooking(actor: User, bookingId: string, reason?: string): Booking {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new Error('404 Not Found: Booking not found.');
    }

    if (actor.role !== 'Admin' && booking.userId !== actor.id) {
      throw new Error('403 Forbidden: You can only cancel your own bookings (REQ-1.4).');
    }

    booking.status = 'Cancelled';

    if (actor.role === 'Admin' && booking.userId !== actor.id) {
      this.auditLogs.unshift({
        id: createId('audit'),
        action: 'MANUAL_BOOKING_CANCEL',
        adminId: actor.id,
        adminName: actor.name,
        targetId: booking.id,
        targetName: `${booking.roomName} (${booking.date} ${booking.startTime})`,
        reason: reason || 'Administrative cancellation',
        timestamp: new Date().toISOString(),
      });
    }

    return booking;
  }

  public getBookings(filterUserId?: string, filterRole?: UserRole): Booking[] {
    if (filterRole === 'Student' && filterUserId) {
      return this.bookings.filter((b) => b.userId === filterUserId);
    }
    return [...this.bookings];
  }

  // --- Maintenance Ticketing with State Machine & Event Bridge (REQ-3.1 - REQ-4.5) ---
  public createTicket(
    reporter: User,
    data: {
      roomId: string;
      category: TicketCategory;
      description: string;
      priority: TicketPriority;
      photoUrl?: string | null;
    }
  ): Ticket {
    const room = this.rooms.find((r) => r.id === data.roomId);
    if (!room) throw new Error('404 Not Found: Specified room does not exist.');

    const newTicket: Ticket = {
      id: createId('tkt'),
      roomId: room.id,
      roomName: room.name,
      building: room.building,
      reportedBy: reporter.id,
      reportedByName: reporter.name,
      reportedByRole: reporter.role,
      assignedTo: null,
      assignedToName: null,
      category: data.category,
      priority: data.priority,
      state: 'Open',
      description: data.description,
      photoUrl: data.photoUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tickets.unshift(newTicket);

    // Initial state log (REQ-3.3)
    this.ticketLogs.unshift({
      id: createId('log'),
      ticketId: newTicket.id,
      fromState: 'Open',
      toState: 'Open',
      changedBy: reporter.id,
      changedByName: reporter.name,
      changedByRole: reporter.role,
      timestamp: new Date().toISOString(),
      note: `Ticket created with priority '${data.priority}' in category '${data.category}'`,
    });

    // EVENT BRIDGE TRIGGER: REQ-4.1
    // If ticket priority is High -> suspend room and notify affected bookings
    if (data.priority === 'High') {
      this.triggerEventBridgeSuspension(room, newTicket);
    }

    return newTicket;
  }

  // REQ-3.2: Open -> Assigned -> Resolved strictly enforced
  public assignTicket(staffUser: User, ticketId: string, note?: string): Ticket {
    if (staffUser.role !== 'Maintenance Staff' && staffUser.role !== 'Admin') {
      throw new Error('403 Forbidden: Only Maintenance Staff and Admins can assign tickets (REQ-2.4).');
    }

    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) throw new Error('404 Not Found: Ticket not found.');

    if (ticket.state !== 'Open') {
      throw new Error(`400 Bad Request: Ticket cannot be assigned because its current state is '${ticket.state}'. State transition must be Open -> Assigned (REQ-3.2).`);
    }

    const fromState = ticket.state;
    ticket.state = 'Assigned';
    ticket.assignedTo = staffUser.id;
    ticket.assignedToName = staffUser.name;
    ticket.updatedAt = new Date().toISOString();

    this.ticketLogs.unshift({
      id: createId('log'),
      ticketId: ticket.id,
      fromState,
      toState: 'Assigned',
      changedBy: staffUser.id,
      changedByName: staffUser.name,
      changedByRole: staffUser.role,
      timestamp: new Date().toISOString(),
      note: note || `Self-assigned by ${staffUser.name} (${staffUser.department})`,
    });

    // Notification to ticket creator
    this.notifications.unshift({
      id: createId('notif'),
      userId: ticket.reportedBy,
      title: '🛠️ Ticket Update: Assigned',
      body: `Ticket #${ticket.id} (${ticket.roomName}) was assigned to ${staffUser.name}.`,
      category: 'ticket_update',
      targetRoute: { tab: 'Tickets', id: ticket.id },
      timestamp: new Date().toISOString(),
      isRead: false,
    });

    return ticket;
  }

  // REQ-3.2: Assigned -> Resolved strictly enforced
  // REQ-4.4: Auto-lift suspension unless another active High ticket exists!
  public resolveTicket(actor: User, ticketId: string, resolutionNote?: string): Ticket {
    if (actor.role !== 'Maintenance Staff' && actor.role !== 'Admin') {
      throw new Error('403 Forbidden: Only Maintenance Staff and Admins can resolve tickets (REQ-2.4).');
    }

    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) throw new Error('404 Not Found: Ticket not found.');

    if (ticket.state !== 'Assigned') {
      // REQ-3.2 disallows Open -> Resolved directly!
      throw new Error(
        `400 Invalid State Transition: Cannot transition directly from '${ticket.state}' to 'Resolved'. Expected lifecycle: Open → Assigned → Resolved (REQ-3.2).`
      );
    }

    const fromState = ticket.state;
    ticket.state = 'Resolved';
    ticket.updatedAt = new Date().toISOString();
    ticket.resolvedAt = new Date().toISOString();

    this.ticketLogs.unshift({
      id: createId('log'),
      ticketId: ticket.id,
      fromState,
      toState: 'Resolved',
      changedBy: actor.id,
      changedByName: actor.name,
      changedByRole: actor.role,
      timestamp: new Date().toISOString(),
      note: resolutionNote || 'Resolved and verified by staff.',
    });

    // EVENT BRIDGE AUTO-RELEASE: REQ-4.4
    this.checkAndLiftEventBridgeSuspension(ticket);

    // Notify reporter
    this.notifications.unshift({
      id: createId('notif'),
      userId: ticket.reportedBy,
      title: '✅ Ticket Resolved',
      body: `Ticket #${ticket.id} for ${ticket.roomName} has been marked Resolved by ${actor.name}.`,
      category: 'ticket_update',
      targetRoute: { tab: 'Tickets', id: ticket.id },
      timestamp: new Date().toISOString(),
      isRead: false,
    });

    return ticket;
  }

  // REQ-4.1, REQ-4.3: Automated Event Bridge Suspension Logic
  private triggerEventBridgeSuspension(room: Room, ticket: Ticket) {
    room.isSuspended = true;
    room.activeTicketId = ticket.id;
    room.suspensionReason = ticket.description;
    room.suspendedAt = new Date().toISOString();
    room.suspendedByTicketPriority = ticket.priority;

    // Find all future bookings for this room that are Confirmed
    const affectedBookings = this.bookings.filter(
      (b) => b.roomId === room.id && b.status === 'Confirmed'
    );

    affectedBookings.forEach((b) => {
      b.status = 'Suspended';
      b.suspendedByEventBridge = true;
      b.suspensionNotice = `Suspended automatically by Event Bridge due to High Priority Ticket #${ticket.id}: ${ticket.description}`;

      // Push notification delivered to affected user (REQ-4.3, REQ-5.2)
      this.notifications.unshift({
        id: createId(`notif_${b.id}`),
        userId: b.userId,
        title: '⚠️ URGENT: Booking Suspended by Event Bridge',
        body: `Your booking for ${room.name} on ${b.date} (${b.startTime}-${b.endTime}) is suspended due to safety ticket #${ticket.id}: ${ticket.description}`,
        category: 'event_bridge_alert',
        targetRoute: { tab: 'Bookings', id: b.id },
        timestamp: new Date().toISOString(),
        isRead: false,
      });
    });
  }

  // REQ-4.4: Auto-lift suspension when ticket resolved UNLESS other High ticket exists
  private checkAndLiftEventBridgeSuspension(resolvedTicket: Ticket) {
    const room = this.rooms.find((r) => r.id === resolvedTicket.roomId);
    if (!room) return;

    // Check if another active High ticket exists for this room
    const otherActiveHighTickets = this.tickets.filter(
      (t) =>
        t.roomId === room.id &&
        t.id !== resolvedTicket.id &&
        t.priority === 'High' &&
        t.state !== 'Resolved'
    );

    if (otherActiveHighTickets.length > 0) {
      // Keep suspended, switch active ticket pointer to the other High ticket
      const nextTicket = otherActiveHighTickets[0];
      room.activeTicketId = nextTicket.id;
      room.suspensionReason = `Secondary High Priority Issue #${nextTicket.id}: ${nextTicket.description}`;
      return;
    }

    // No other High tickets exist -> Auto-lift suspension!
    room.isSuspended = false;
    room.activeTicketId = null;
    room.suspensionReason = null;
    room.suspendedAt = null;
    room.suspendedByTicketPriority = null;

    // Restore affected bookings that were suspended by Event Bridge
    const previouslySuspended = this.bookings.filter(
      (b) => b.roomId === room.id && b.suspendedByEventBridge && b.status === 'Suspended'
    );

    previouslySuspended.forEach((b) => {
      b.status = 'Confirmed';
      b.suspendedByEventBridge = false;
      b.suspensionNotice = undefined;

      this.notifications.unshift({
        id: createId(`notif_${b.id}`),
        userId: b.userId,
        title: '🟢 Suspension Lifted: Booking Restored',
        body: `Maintenance for ${room.name} has concluded. Your booking on ${b.date} (${b.startTime}-${b.endTime}) is once again active.`,
        category: 'event_bridge_alert',
        targetRoute: { tab: 'Bookings', id: b.id },
        timestamp: new Date().toISOString(),
        isRead: false,
      });
    });
  }

  // REQ-4.5: Admin Manual Override
  public adminOverrideSuspension(adminUser: User, roomId: string, justification: string): Room {
    if (adminUser.role !== 'Admin') {
      throw new Error('403 Forbidden: Only Administrators can manually override room suspensions (REQ-4.5).');
    }

    const room = this.rooms.find((r) => r.id === roomId);
    if (!room) throw new Error('404 Not Found: Room does not exist.');

    if (!room.isSuspended) {
      throw new Error('400 Bad Request: Room is not currently suspended.');
    }

    const previousTicketId = room.activeTicketId;
    room.isSuspended = false;
    room.activeTicketId = null;
    room.suspensionReason = null;
    room.suspendedAt = null;

    // Restore bookings
    const previouslySuspended = this.bookings.filter(
      (b) => b.roomId === room.id && b.suspendedByEventBridge && b.status === 'Suspended'
    );

    previouslySuspended.forEach((b) => {
      b.status = 'Confirmed';
      b.suspendedByEventBridge = false;
      b.suspensionNotice = undefined;
    });

    // REQ-4.5: Override action MUST be logged with acting user's identity and timestamp
    this.auditLogs.unshift({
      id: createId('audit'),
      action: 'MANUAL_OVERRIDE_SUSPENSION',
      adminId: adminUser.id,
      adminName: adminUser.name,
      targetId: room.id,
      targetName: room.name,
      reason: `Manual override of ticket #${previousTicketId || 'N/A'}: ${justification || 'Emergency administrative override for scheduled academic event'}`,
      timestamp: new Date().toISOString(),
    });

    return room;
  }

  // --- Read Queries ---
  public getTickets(filterRole?: UserRole, userId?: string): Ticket[] {
    if (filterRole === 'Student' && userId) {
      return this.tickets.filter((t) => t.reportedBy === userId);
    }
    if (filterRole === 'Maintenance Staff' && userId) {
      // Staff sees Open tickets OR tickets assigned to them
      return this.tickets.filter((t) => t.state === 'Open' || t.assignedTo === userId);
    }
    return [...this.tickets];
  }

  public getTicketLogs(ticketId: string): TicketStateLog[] {
    return this.ticketLogs.filter((l) => l.ticketId === ticketId);
  }

  public getAllTicketLogs(): TicketStateLog[] {
    return [...this.ticketLogs];
  }

  public getAuditLogs(): AdminAuditLog[] {
    return [...this.auditLogs];
  }

  public getNotifications(userId?: string): PushNotification[] {
    if (userId) {
      return this.notifications.filter((n) => n.userId === userId);
    }
    return [...this.notifications];
  }

  public sendTestPush(user: User): PushNotification {
    const notification: PushNotification = {
      id: createId('notif_test'),
      userId: user.id,
      title: 'Campus alert test',
      body: 'This is a test push notification from the UCRMS mobile client.',
      category: 'event_bridge_alert',
      targetRoute: { tab: 'Home' },
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    this.notifications.unshift(notification);
    return notification;
  }

  public markNotificationAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) notif.isRead = true;
  }

  // --- Concurrency Engine Test Suite (Section 5.1 & REQ-1.2) ---
  // Fires up to 50 simultaneous booking requests to guarantee exactly ONE succeeds and all others receive 409 Conflict.
  public async runConcurrencyStressTest(
    requestCount: number = 50,
    targetRoomId: string = 'room_sh101',
    targetDate: string = '2026-10-15',
    targetSlot: { startTime: string; endTime: string } = { startTime: '14:00', endTime: '15:00' }
  ): Promise<ConcurrencyTestSummary> {
    const targetRoom = this.rooms.find((r) => r.id === targetRoomId);
    if (!targetRoom) throw new Error('Target room not found');

    // Clean any existing booking for this slot to have a fair test
    this.bookings = this.bookings.filter(
      (b) =>
        !(
          b.roomId === targetRoomId &&
          b.date === targetDate &&
          b.startTime === targetSlot.startTime &&
          b.endTime === targetSlot.endTime
        )
    );

    const testUsers = Array.from({ length: requestCount }, (_, i) => ({
      id: `sim_user_${i + 1}`,
      name: `Concurrent User #${i + 1}`,
      email: `sim_user_${i + 1}@iiitp.ac.in`,
      role: 'Student' as UserRole,
      department: 'Computer Science',
      isActive: true,
      createdAt: new Date().toISOString(),
    }));

    const steps: ConcurrencyTestSummary['steps'] = [];
    let successCount = 0;
    let conflictCount = 0;
    const startTime = Date.now();

    // Fire all requests simultaneously via Promise.all
    const promises = testUsers.map(async (u, idx) => {
      const reqStart = Date.now();
      try {
        await this.createBooking(u, {
          roomId: targetRoomId,
          date: targetDate,
          startTime: targetSlot.startTime,
          endTime: targetSlot.endTime,
          purpose: `Stress Test Concurrent Worker #${idx + 1}`,
        });
        const latency = Date.now() - reqStart;
        successCount++;
        steps.push({
          requestId: idx + 1,
          userName: u.name,
          timestamp: Date.now(),
          status: 'SUCCESS',
          latencyMs: latency,
          message: '201 Created: Row lock acquired & transaction committed',
        });
      } catch (err: any) {
        const latency = Date.now() - reqStart;
        conflictCount++;
        steps.push({
          requestId: idx + 1,
          userName: u.name,
          timestamp: Date.now(),
          status: 'CONFLICT',
          latencyMs: latency,
          message: err?.message || '409 Conflict: Row locked by competing transaction',
        });
      }
    });

    await Promise.all(promises);

    const totalDuration = Date.now() - startTime;
    const avgLatency = Math.round(totalDuration / requestCount);

    return {
      totalRequests: requestCount,
      successCount,
      conflictCount,
      avgLatencyMs: avgLatency,
      roomId: targetRoom.name,
      slot: `${targetDate} ${targetSlot.startTime}-${targetSlot.endTime}`,
      doubleBookingDetected: successCount > 1,
      steps: steps.sort((a, b) => a.requestId - b.requestId),
    };
  }
}

export const db = new CampusDatabase();
