import React, { useState, useEffect } from 'react';
import { api } from '../../server/api';
import { Room, Booking, Ticket, User, UserRole, AdminAuditLog, TicketStateLog } from '../../types';
import { StateBadge, PriorityBadge, BookingBadge, RoleBadge } from '../common/Badge';
import {
  ShieldAlert,
  Users,
  Calendar,
  Wrench,
  CheckCircle,
  AlertTriangle,
  History,
  Unlock,
  Filter,
  UserCheck,
  UserX,
  FileText,
} from 'lucide-react';

interface AdminConsoleProps {
  currentUser: User;
  rooms: Room[];
  bookings: Booking[];
  tickets: Ticket[];
  onRefreshData: () => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  currentUser,
  rooms,
  bookings,
  tickets,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'oversight' | 'users' | 'suspensions' | 'audit'>('oversight');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Suspension override modal state (REQ-4.5)
  const [overrideTargetRoom, setOverrideTargetRoom] = useState<Room | null>(null);
  const [overrideReason, setOverrideReason] = useState(
    'Special Academic Senate convocation approved by Dean of Student Affairs'
  );
  const [isProcessingOverride, setIsProcessingOverride] = useState(false);

  // User management state (REQ-2.3)
  const [userList, setUserList] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [ticketStateLogs, setTicketStateLogs] = useState<TicketStateLog[]>([]);

  const [messageBanner, setMessageBanner] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchAdminData = async () => {
    try {
      const [u, a, l] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getAuditLogs().catch(() => []),
        api.getTicketLogs().catch(() => []),
      ]);
      setUserList(u);
      setAuditLogs(a);
      setTicketStateLogs(l);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const buildings = ['All', ...Array.from(new Set(rooms.map((r) => r.building)))];
  const suspendedRooms = rooms.filter((r) => r.isSuspended);

  const handleManualOverride = async () => {
    if (!overrideTargetRoom) return;
    setIsProcessingOverride(true);
    setMessageBanner(null);
    try {
      await api.overrideSuspension(overrideTargetRoom.id, overrideReason);
      setMessageBanner({
        text: `Manually lifted Event Bridge suspension for ${overrideTargetRoom.name}. Action logged to audit trail (REQ-4.5).`,
        type: 'success',
      });
      setOverrideTargetRoom(null);
      await fetchAdminData();
      onRefreshData();
    } catch (err: any) {
      setMessageBanner({ text: err.message || 'Override failed', type: 'error' });
    } finally {
      setIsProcessingOverride(false);
    }
  };

  const handleRoleChange = async (targetUser: User, newRole: UserRole) => {
    setMessageBanner(null);
    try {
      await api.updateUserRole(
        targetUser.id,
        newRole,
        `Administrative update initiated by ${currentUser.name}`
      );
      await fetchAdminData();
      setMessageBanner({
        text: `Updated role for ${targetUser.name} to ${newRole} (REQ-2.3).`,
        type: 'success',
      });
      onRefreshData();
    } catch (err: any) {
      setMessageBanner({ text: err.message || 'Failed to update role', type: 'error' });
    }
  };

  const handleToggleUserStatus = async (targetUser: User) => {
    setMessageBanner(null);
    try {
      await api.toggleUserStatus(
        targetUser.id,
        `Administrative account toggle by ${currentUser.name}`
      );
      await fetchAdminData();
      setMessageBanner({
        text: `Account status toggled for ${targetUser.name} (REQ-2.3).`,
        type: 'success',
      });
      onRefreshData();
    } catch (err: any) {
      setMessageBanner({ text: err.message || 'Failed to modify account', type: 'error' });
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchBuilding = selectedBuilding === 'All' || t.building === selectedBuilding;
    const matchStatus = selectedStatus === 'All' || t.state === selectedStatus;
    return matchBuilding && matchStatus;
  });

  const filteredBookings = bookings.filter((b) => {
    const matchStatus = selectedStatus === 'All' || b.status === selectedStatus;
    return matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Admin Control Plane · Section 4.3
              </span>
              <span className="text-xs text-slate-400">IIIT Pune Campus Operations</span>
            </div>
            <h1 className="text-xl font-bold mt-1.5">Campus Oversight &amp; RBAC Governance Hub</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Centralized administrative dashboard for managing campus-wide bookings, facility tickets,
              user roles (REQ-2.3), and manual Event Bridge suspension overrides (REQ-4.5).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700 text-center">
              <span className="text-lg font-bold text-red-400 block">{suspendedRooms.length}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Suspended</span>
            </div>
            <div className="bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700 text-center">
              <span className="text-lg font-bold text-amber-400 block">
                {tickets.filter((t) => t.state === 'Open').length}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Open Tkts</span>
            </div>
            <div className="bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700 text-center">
              <span className="text-lg font-bold text-emerald-400 block">
                {bookings.filter((b) => b.status === 'Confirmed').length}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Bookings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Banner message */}
      {messageBanner && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            messageBanner.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {messageBanner.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{messageBanner.text}</span>
          </div>
          <button
            onClick={() => setMessageBanner(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('oversight')}
          className={`py-2 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'oversight'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Campus Oversight (Bookings &amp; Tickets)</span>
        </button>

        <button
          onClick={() => setActiveTab('suspensions')}
          className={`py-2 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'suspensions'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
          <span>Event Bridge Suspensions ({suspendedRooms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'users'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User &amp; Role Management (REQ-2.3)</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`py-2 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'audit'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit Logs (REQ-3.3, REQ-4.5)</span>
        </button>
      </div>

      {/* TAB 1: OVERSIGHT */}
      {activeTab === 'oversight' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Filter By:</span>

              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"
              >
                {buildings.map((b) => (
                  <option key={b} value={b}>
                    Building: {b}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Assigned">Assigned</option>
                <option value="Resolved">Resolved</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <div className="text-xs text-slate-500">
              Showing {filteredTickets.length} tickets &amp; {filteredBookings.length} bookings
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campus Tickets Column */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-500" />
                  Campus Maintenance Tickets ({filteredTickets.length})
                </h2>
                <span className="text-[11px] text-slate-400">Section 4.3</span>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-400">#{t.id}</span>
                          <StateBadge state={t.state} />
                          <PriorityBadge priority={t.priority} />
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mt-1">
                          {t.roomName}
                        </h3>
                        <div className="text-[11px] text-slate-500">
                          {t.building} · {t.category}
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                      {t.description}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Reported by {t.reportedByName}</span>
                      <span>Assigned: {t.assignedToName || 'Unassigned'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Campus Bookings Column */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  Campus Reservations ({filteredBookings.length})
                </h2>
                <span className="text-[11px] text-slate-400">Section 4.3</span>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                      b.status === 'Suspended' || b.suspendedByEventBridge
                        ? 'border-red-300 dark:border-red-900/80 bg-red-50/20 dark:bg-red-950/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-400">#{b.id}</span>
                          <BookingBadge status={b.status} isSuspendedByEB={b.suspendedByEventBridge} />
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mt-1">
                          {b.roomName}
                        </h3>
                        <div className="text-[11px] text-slate-500">
                          {b.date} ({b.startTime} - {b.endTime})
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">
                        {b.userName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Purpose: </span>
                      {b.purpose}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUSPENSION OVERRIDE CONTROL (REQ-4.5) */}
      {activeTab === 'suspensions' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-300">
            <span className="font-semibold">Event Bridge Manual Override Control (REQ-4.5): </span>
            When a High-priority ticket suspends a room, an Administrator may exceptionally lift the
            suspension if urgent academic proceedings require the room. Every override requires a stated
            justification and is permanently recorded in the append-only audit trail.
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4">
              Suspended Campus Facilities ({suspendedRooms.length})
            </h2>

            {suspendedRooms.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                No rooms are currently suspended by Event Bridge. All rooms are available for booking.
              </div>
            ) : (
              <div className="space-y-3">
                {suspendedRooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-4 rounded-xl border border-red-300 dark:border-red-900/80 bg-red-50/30 dark:bg-red-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {room.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white">
                          SUSPENDED
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {room.building} ({room.floor}) · Cap: {room.capacity}
                      </p>
                      <p className="text-xs text-red-800 dark:text-red-300 mt-1">
                        <strong>Reason: </strong>
                        {room.suspensionReason} (Associated Ticket #{room.activeTicketId})
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOverrideTargetRoom(room)}
                      className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors shrink-0"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Manually Lift Suspension (REQ-4.5)</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: USER & ROLE MANAGEMENT (REQ-2.1 - REQ-2.3) */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Campus User Directory &amp; RBAC Control (REQ-2.1, REQ-2.3)
              </h2>
              <p className="text-xs text-slate-500">
                Only Administrators can alter roles or deactivate accounts. Every user belongs to
                exactly one role.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">{userList.length} Registered Users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-y border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Current Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions (Admin Only)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {userList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">{u.email}</td>
                    <td className="py-3 px-3 text-slate-500">{u.department}</td>
                    <td className="py-3 px-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                          className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-xs"
                        >
                          <option value="Student">Student</option>
                          <option value="Maintenance Staff">Maintenance Staff</option>
                          <option value="Admin">Admin</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u)}
                          title={u.isActive ? 'Deactivate Account' : 'Activate Account'}
                          className={`p-1.5 rounded transition-colors ${
                            u.isActive
                              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                          }`}
                        >
                          {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAILS (REQ-3.3, REQ-4.5) */}
      {activeTab === 'audit' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Admin Overrides & Role Audits */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                Administrative Actions Audit Log (REQ-4.5)
              </h2>
              <span className="text-[11px] text-slate-400">Append-Only Ledger</span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-700 dark:text-purple-300">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300">
                    <strong>Target:</strong> {log.targetName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <strong>Acting Admin:</strong> {log.adminName}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700">
                    "{log.reason}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket State Transitions Log (REQ-3.3) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-500" />
                Ticket State Machine Transitions (REQ-3.3)
              </h2>
              <span className="text-[11px] text-slate-400">State Transition Trail</span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {ticketStateLogs.map((tlog) => (
                <div
                  key={tlog.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                      <span>Ticket #{tlog.ticketId}</span>
                      <span>·</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {tlog.fromState} → {tlog.toState}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(tlog.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Changed by <strong>{tlog.changedByName}</strong> ({tlog.changedByRole})
                  </div>
                  {tlog.note && (
                    <div className="text-[11px] text-slate-500 italic bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700">
                      "{tlog.note}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual Override Confirmation Modal (REQ-4.5) */}
      {overrideTargetRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Confirm Manual Suspension Override
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You are lifting the Event Bridge suspension on <strong>{overrideTargetRoom.name}</strong>.
              This will re-open the room for booking even though Ticket #{overrideTargetRoom.activeTicketId}{' '}
              remains unresolved.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mandatory Administrative Justification (REQ-4.5):
              </label>
              <textarea
                rows={3}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Specify the operational necessity and safety clearance..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOverrideTargetRoom(null)}
                className="py-2 px-4 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleManualOverride}
                disabled={isProcessingOverride}
                className="py-2 px-4 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 shadow-sm"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Confirm &amp; Log Override</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
