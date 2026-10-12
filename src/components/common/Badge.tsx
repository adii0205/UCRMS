import React from 'react';
import { TicketPriority, TicketState, BookingStatus, UserRole } from '../../types';

export const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({ priority }) => {
  const colors = {
    High: 'bg-red-500/15 text-red-700 border-red-300 dark:text-red-400 dark:border-red-800',
    Medium: 'bg-amber-500/15 text-amber-700 border-amber-300 dark:text-amber-400 dark:border-amber-800',
    Low: 'bg-blue-500/15 text-blue-700 border-blue-300 dark:text-blue-400 dark:border-blue-800',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${colors[priority]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${priority === 'High' ? 'bg-red-500 animate-pulse' : priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
      {priority} Priority
    </span>
  );
};

export const StateBadge: React.FC<{ state: TicketState }> = ({ state }) => {
  const configs = {
    Open: 'bg-amber-500/15 text-amber-700 border-amber-300 dark:text-amber-400 dark:border-amber-800',
    Assigned: 'bg-indigo-500/15 text-indigo-700 border-indigo-300 dark:text-indigo-400 dark:border-indigo-800',
    Resolved: 'bg-emerald-500/15 text-emerald-700 border-emerald-300 dark:text-emerald-400 dark:border-emerald-800',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${configs[state]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${state === 'Open' ? 'bg-amber-500' : state === 'Assigned' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
      {state}
    </span>
  );
};

export const BookingBadge: React.FC<{ status: BookingStatus; isSuspendedByEB?: boolean }> = ({ status, isSuspendedByEB }) => {
  if (isSuspendedByEB || status === 'Suspended') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border bg-red-500/15 text-red-700 border-red-300 dark:text-red-400 dark:border-red-800">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        EB Suspended
      </span>
    );
  }

  const styles = {
    Confirmed: 'bg-emerald-500/15 text-emerald-700 border-emerald-300 dark:text-emerald-400 dark:border-emerald-800',
    Cancelled: 'bg-slate-500/15 text-slate-600 border-slate-300 dark:text-slate-400 dark:border-slate-700',
    Suspended: 'bg-red-500/15 text-red-700 border-red-300 dark:text-red-400 dark:border-red-800',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Confirmed' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {status}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const styles = {
    Student: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    'Maintenance Staff': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    Admin: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${styles[role]}`}>
      {role}
    </span>
  );
};
