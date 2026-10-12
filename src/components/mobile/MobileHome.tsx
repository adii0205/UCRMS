import React, { useState } from 'react';
import { Room, User, Ticket } from '../../types';
import { PriorityBadge, StateBadge } from '../common/Badge';
import {
  Search,
  Building,
  Users,
  Calendar,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  Flame,
  CheckCircle,
  Wrench,
} from 'lucide-react';

interface MobileHomeProps {
  currentUser: User;
  rooms: Room[];
  tickets: Ticket[];
  onSelectRoomToBook: (room: Room) => void;
  onOpenReportModal: (roomId?: string) => void;
  onSelectTicket: (ticket: Ticket) => void;
  onFastAssignTicket: (ticketId: string) => void;
}

export const MobileHome: React.FC<MobileHomeProps> = ({
  currentUser,
  rooms,
  tickets,
  onSelectRoomToBook,
  onOpenReportModal,
  onSelectTicket,
  onFastAssignTicket,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('All');

  const buildings = ['All', ...Array.from(new Set(rooms.map((r) => r.building)))];

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.equipment.some((eq) => eq.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesBuilding = selectedBuilding === 'All' || r.building === selectedBuilding;
    return matchesSearch && matchesBuilding;
  });

  // Open queue for Maintenance Staff (Section 4.2)
  const openQueue = tickets
    .filter((t) => t.state === 'Open')
    .sort((a, b) => {
      const pScore = { High: 3, Medium: 2, Low: 1 };
      return pScore[b.priority] - pScore[a.priority];
    });

  // STUDENT VIEW (Section 4.1)
  if (currentUser.role === 'Student') {
    return (
      <div className="space-y-4 pb-6">
        {/* Quick Kicker Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-200">
            IIIT Pune SE Lab 2026
          </span>
          <h2 className="text-base font-bold mt-0.5">Welcome, {currentUser.name}</h2>
          <p className="text-xs text-blue-100 mt-1 leading-relaxed">
            Reserve academic halls and computer labs with instant ACID-locked concurrency protection.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onOpenReportModal()}
              className="py-1.5 px-3 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg backdrop-blur-xs flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              <span>Report Hazard (3 Taps)</span>
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search seminar halls, labs, equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
          </div>

          {/* Interactive filter buttons */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {buildings.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setSelectedBuilding(b)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors border ${
                  selectedBuilding === b
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Room List (REQ-1.1) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Campus Rooms & Availability ({filteredRooms.length})
            </h3>
            <span className="text-[11px] text-slate-400">Query latency &lt;50ms</span>
          </div>

          <div className="space-y-2.5">
            {filteredRooms.map((room) => {
              return (
                <div
                  key={room.id}
                  className={`p-3.5 rounded-xl border bg-white dark:bg-slate-800/90 transition-all ${
                    room.isSuspended
                      ? 'border-red-300 dark:border-red-900/80 bg-red-50/20 dark:bg-red-950/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {room.name}
                        </h4>
                        {room.isSuspended ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded">
                            <Flame className="w-3 h-3 text-red-500 animate-pulse" />
                            Event Bridge Suspended
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                            Available
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          {room.building} ({room.floor})
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          Cap: {room.capacity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Suspension reason banner */}
                  {room.isSuspended && (
                    <div className="mt-2.5 p-2 rounded-lg bg-red-100/70 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300 flex items-start gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Booking Blocked: </span>
                        <span>{room.suspensionReason}</span>
                      </div>
                    </div>
                  )}

                  {/* Equipment tags */}
                  <div className="mt-2 text-[11px] text-slate-500">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Amenities: </span>
                    {room.equipment.slice(0, 3).join(', ')}
                    {room.equipment.length > 3 && ` +${room.equipment.length - 3} more`}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onOpenReportModal(room.id)}
                      className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      <span>Report Issue</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectRoomToBook(room)}
                      disabled={room.isSuspended}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        room.isSuspended
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                      }`}
                    >
                      <span>Check Slots & Book</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // MAINTENANCE STAFF VIEW (Section 4.2)
  if (currentUser.role === 'Maintenance Staff') {
    return (
      <div className="space-y-4 pb-6">
        {/* Staff Header */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-700 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-200">
              Facility Ops Queue
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-white/20 font-mono">
              {openQueue.length} Open Tickets
            </span>
          </div>
          <h2 className="text-base font-bold mt-1">{currentUser.name} (Technician)</h2>
          <p className="text-xs text-amber-100 mt-0.5">
            {currentUser.department}. High priority tickets trigger room suspensions via Event Bridge.
          </p>
        </div>

        {/* Open Queue sorted by priority (Section 4.2) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Open Maintenance Queue (Prioritized)
            </h3>
            <span className="text-[11px] text-slate-400">Open → Assigned → Resolved</span>
          </div>

          {openQueue.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All maintenance tickets are assigned or resolved!
            </div>
          ) : (
            <div className="space-y-2.5">
              {openQueue.map((t) => (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-xl border bg-white dark:bg-slate-800 transition-all ${
                    t.priority === 'High'
                      ? 'border-red-300 dark:border-red-900 bg-red-50/20 dark:bg-red-950/10'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">#{t.id}</span>
                        <PriorityBadge priority={t.priority} />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {t.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                        {t.roomName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{t.building}</span>
                        <span>·</span>
                        <span>By {t.reportedByName}</span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed">
                    {t.description}
                  </p>

                  {t.priority === 'High' && (
                    <div className="mt-2 text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Room currently suspended. Resolving will auto-release availability.</span>
                    </div>
                  )}

                  {/* Actions (REQ-3.2: Open -> Assigned) */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onSelectTicket(t)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Details & History
                    </button>

                    <button
                      type="button"
                      onClick={() => onFastAssignTicket(t.id)}
                      className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Assign to Me</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ADMIN OVERVIEW (Section 4.3)
  const suspendedRooms = rooms.filter((r) => r.isSuspended);
  const totalBookings = rooms.length; // placeholder
  return (
    <div className="space-y-4 pb-6">
      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-sm">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-200">
          Executive Facility Administration
        </span>
        <h2 className="text-base font-bold mt-1">{currentUser.name} (Director)</h2>
        <p className="text-xs text-purple-100 mt-0.5">
          Campus-wide oversight, RBAC enforcement, and manual Event Bridge override authority.
        </p>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/20">
          <div className="bg-white/10 p-2 rounded-lg text-center">
            <span className="text-lg font-bold block">{suspendedRooms.length}</span>
            <span className="text-[10px] text-purple-200">Suspended Rooms</span>
          </div>
          <div className="bg-white/10 p-2 rounded-lg text-center">
            <span className="text-lg font-bold block">{openQueue.length}</span>
            <span className="text-[10px] text-purple-200">Open Tickets</span>
          </div>
          <div className="bg-white/10 p-2 rounded-lg text-center">
            <span className="text-lg font-bold block">{rooms.length}</span>
            <span className="text-[10px] text-purple-200">Total Rooms</span>
          </div>
        </div>
      </div>

      {/* Active Suspensions List */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Active Room Suspensions ({suspendedRooms.length})
        </h3>
        {suspendedRooms.length === 0 ? (
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-emerald-600 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Zero rooms currently suspended. Full campus booking availability active.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {suspendedRooms.map((sr) => (
              <div
                key={sr.id}
                className="p-3.5 rounded-xl border border-red-300 dark:border-red-900/80 bg-red-50/30 dark:bg-red-950/20"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-red-950 dark:text-red-200">
                      {sr.name}
                    </h4>
                    <span className="text-xs text-slate-500">
                      {sr.building} · Suspended by Ticket #{sr.activeTicketId}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200">
                    EB Blocked
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-red-800 dark:text-red-300">
                  {sr.suspensionReason}
                </p>
                <div className="mt-2 text-[11px] text-slate-500">
                  Admins can manually override this suspension from the Admin &amp; Ops Hub.
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Room Directory */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Campus Resources Quick Directory
        </h3>
        <div className="space-y-2">
          {rooms.map((r) => (
            <div
              key={r.id}
              className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">{r.name}</span>
                <span className="text-slate-400 block text-[11px]">{r.building} · Cap: {r.capacity}</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectRoomToBook(r)}
                className="py-1 px-2.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 hover:text-white transition-colors"
              >
                Inspect
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
