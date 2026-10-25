import React, { useState, useEffect } from 'react';
import { api } from '../../server/api';
import { Room, Booking, Ticket, User, AdminAuditLog, TicketStateLog } from '../../types';
import { StateBadge, PriorityBadge, BookingBadge, RoleBadge } from '../common/Badge';
import { Shield, UserCheck, UserX, AlertCircle, RefreshCw, Cpu, Activity } from 'lucide-react';
import { ConcurrencyTester } from '../testing/ConcurrencyTester';
import { JMeterTestSuite } from '../jmeter/JMeterTestSuite';

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
  const [activeTab, setActiveTab] = useState<'oversight' | 'users' | 'suspensions' | 'audit' | 'concurrency' | 'jmeter'>('oversight');
  const [userList, setUserList] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [overrideRoomId, setOverrideRoomId] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const [u, a] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getAuditLogs().catch(() => []),
      ]);
      setUserList(u);
      setAuditLogs(a);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const suspendedRooms = rooms.filter((r) => r.isSuspended);

  const handleToggleUserStatus = async (user: User) => {
    try {
      await api.toggleUserStatus(user.id, `Admin toggled status for ${user.email}`);
      await fetchAdminData();
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleOverrideSuspension = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideRoomId) return;
    setOverrideLoading(true);
    try {
      await api.overrideSuspension(overrideRoomId, overrideReason || 'Manual administrative override');
      setOverrideRoomId('');
      setOverrideReason('');
      setMsg('Suspension successfully lifted and affected bookings restored.');
      setTimeout(() => setMsg(null), 4000);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to override suspension');
    } finally {
      setOverrideLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {msg && (
        <div className="p-3 bg-stone-100 border border-stone-300 rounded text-xs text-stone-800">
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab('oversight')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            activeTab === 'oversight' ? 'bg-stone-800 text-stone-50' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          System Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            activeTab === 'users' ? 'bg-stone-800 text-stone-50' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          User Accounts ({userList.length})
        </button>
        <button
          onClick={() => setActiveTab('suspensions')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            activeTab === 'suspensions' ? 'bg-stone-800 text-stone-50' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Room Suspensions ({suspendedRooms.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            activeTab === 'audit' ? 'bg-stone-800 text-stone-50' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: OVERSIGHT */}
      {activeTab === 'oversight' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-stone-200 rounded p-4">
            <div className="text-xs text-stone-500 uppercase">Total Rooms</div>
            <div className="text-2xl font-semibold text-stone-900 mt-1">{rooms.length}</div>
          </div>
          <div className="bg-white border border-stone-200 rounded p-4">
            <div className="text-xs text-stone-500 uppercase">Suspended Rooms</div>
            <div className={`text-2xl font-semibold mt-1 ${suspendedRooms.length > 0 ? 'text-red-700' : 'text-stone-900'}`}>
              {suspendedRooms.length}
            </div>
          </div>
          <div className="bg-white border border-stone-200 rounded p-4">
            <div className="text-xs text-stone-500 uppercase">Active Bookings</div>
            <div className="text-2xl font-semibold text-stone-900 mt-1">
              {bookings.filter((b) => b.status === 'Confirmed').length}
            </div>
          </div>
          <div className="bg-white border border-stone-200 rounded p-4">
            <div className="text-xs text-stone-500 uppercase">Open Incidents</div>
            <div className="text-2xl font-semibold text-stone-900 mt-1">
              {tickets.filter((t) => t.state === 'Open').length}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER ACCOUNTS */}
      {activeTab === 'users' && (
        <div className="bg-white border border-stone-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {userList.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-3 font-medium text-stone-900">{u.name}</td>
                    <td className="py-2.5 px-3 font-mono text-stone-500">{u.email}</td>
                    <td className="py-2.5 px-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="py-2.5 px-3 text-stone-600">{u.department}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                        u.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-500'
                      }`}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        className="text-xs text-stone-700 hover:text-stone-900 font-medium hover:underline"
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUSPENSIONS */}
      {activeTab === 'suspensions' && (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded p-4">
            <h3 className="text-xs font-semibold text-stone-900 uppercase">Admin Manual Override</h3>
            <p className="text-xs text-stone-500 mt-1">
              Manually reopen a room currently locked by safety tickets and automatically restore its scheduled bookings.
            </p>
            {suspendedRooms.length === 0 ? (
              <div className="text-xs text-stone-400 mt-3">No rooms are currently suspended.</div>
            ) : (
              <form onSubmit={handleOverrideSuspension} className="mt-3 space-y-3 max-w-lg text-xs">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Select Suspended Room</label>
                  <select
                    value={overrideRoomId}
                    onChange={(e) => setOverrideRoomId(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 text-stone-800 focus:outline-none"
                    required
                  >
                    <option value="">-- Select room --</option>
                    {suspendedRooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.suspensionReason})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Override Justification</label>
                  <input
                    type="text"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="e.g. Cleared by Facilities Director for urgent session"
                    className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 text-stone-800 focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={overrideLoading}
                  className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-50 rounded font-medium disabled:opacity-50"
                >
                  {overrideLoading ? 'Processing...' : 'Lift Suspension'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-stone-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Admin</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Reason / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700 font-mono">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-stone-400 font-sans">
                      No administrative audit logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50/50">
                      <td className="py-2.5 px-3 text-stone-500 whitespace-nowrap">{log.timestamp.replace('T', ' ').slice(0, 19)}</td>
                      <td className="py-2.5 px-3 font-semibold text-stone-800">{log.action}</td>
                      <td className="py-2.5 px-3 font-sans">{log.adminName}</td>
                      <td className="py-2.5 px-3 font-sans text-stone-600">{log.targetName}</td>
                      <td className="py-2.5 px-3 font-sans text-stone-600 max-w-sm truncate">{log.reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* TAB 5: CONCURRENCY ENGINE */}
      {activeTab === 'concurrency' && (
        <div className="space-y-4">
          <ConcurrencyTester rooms={rooms} onRefreshData={onRefreshData} />
        </div>
      )}

      {/* TAB 6: JMETER DIAGNOSTICS */}
      {activeTab === 'jmeter' && (
        <div className="space-y-4">
          <JMeterTestSuite />
        </div>
      )}
    </div>
  );
};
