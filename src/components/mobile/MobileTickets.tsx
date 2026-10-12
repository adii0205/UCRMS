import React, { useState } from 'react';
import { Ticket, User } from '../../types';
import { PriorityBadge, StateBadge } from '../common/Badge';
import {
  AlertTriangle,
  Plus,
  Flame,
  CheckCircle,
  Clock,
  Wrench,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface MobileTicketsProps {
  currentUser: User;
  tickets: Ticket[];
  onOpenReportModal: () => void;
  onSelectTicket: (ticket: Ticket) => void;
  onFastAssignTicket: (ticketId: string) => void;
}

export const MobileTickets: React.FC<MobileTicketsProps> = ({
  currentUser,
  tickets,
  onOpenReportModal,
  onSelectTicket,
  onFastAssignTicket,
}) => {
  const [filterState, setFilterState] = useState<'All' | 'Open' | 'Assigned' | 'Resolved'>('All');

  // Role-appropriate listing (REQ-3.4, Section 4.1 & 4.2)
  let visibleTickets = tickets;
  if (currentUser.role === 'Student') {
    // Student sees tickets they personally reported (REQ-3.4)
    visibleTickets = tickets.filter((t) => t.reportedBy === currentUser.id);
  } else if (currentUser.role === 'Maintenance Staff') {
    // Staff sees Open tickets OR their assigned tickets (Section 4.2)
    visibleTickets = tickets.filter(
      (t) => t.state === 'Open' || t.assignedTo === currentUser.id
    );
  }

  const filtered = visibleTickets.filter((t) => {
    if (filterState === 'All') return true;
    return t.state === filterState;
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {currentUser.role === 'Student'
              ? 'My Maintenance Reports'
              : currentUser.role === 'Maintenance Staff'
              ? 'Work Order Tickets'
              : 'Campus Tickets (Admin View)'}
          </h2>
          <p className="text-xs text-slate-500">
            {currentUser.role === 'Student'
              ? 'Track incident resolution & Event Bridge status'
              : 'Open → Assigned → Resolved state machine workflow'}
          </p>
        </div>
        <button
          onClick={onOpenReportModal}
          className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Report Issue</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        {(['All', 'Open', 'Assigned', 'Resolved'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilterState(s)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              filterState === s
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
          <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          No maintenance tickets found for this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <div
              key={t.id}
              onClick={() => onSelectTicket(t)}
              className={`p-3.5 rounded-xl border bg-white dark:bg-slate-800 hover:border-blue-400 cursor-pointer transition-all shadow-2xs ${
                t.priority === 'High' && t.state !== 'Resolved'
                  ? 'border-red-300 dark:border-red-900/80 bg-red-50/15 dark:bg-red-950/10'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">#{t.id}</span>
                    <StateBadge state={t.state} />
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                    {t.roomName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{t.category}</span>
                    <span>·</span>
                    <span>{t.building}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
              </div>

              <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {t.description}
              </p>

              {/* Event Bridge indicator */}
              {t.priority === 'High' && t.state !== 'Resolved' && (
                <div className="mt-2 text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                  <Flame className="w-3 h-3 text-red-500 animate-pulse" />
                  <span>Event Bridge: Room suspended until ticket is resolved.</span>
                </div>
              )}

              {/* Footer info */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Reported by {t.reportedByName} ({t.reportedByRole})
                </span>
                <span>
                  {t.assignedToName ? `Assigned to: ${t.assignedToName}` : 'Unassigned'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
