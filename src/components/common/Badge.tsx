import React from 'react';
import { TicketPriority, TicketState, BookingStatus, UserRole } from '../../types';

export const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({ priority }) => {
  const styles = {
    High: 'bg-red-50 text-red-700 border-red-200',
    Medium: 'bg-amber-50 text-amber-800 border-amber-200',
    Low: 'bg-stone-100 text-stone-700 border-stone-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[priority]}`}>
      {priority}
    </span>
  );
};

export const StateBadge: React.FC<{ state: TicketState }> = ({ state }) => {
  const styles = {
    Open: 'bg-amber-50 text-amber-800 border-amber-200',
    Assigned: 'bg-blue-50 text-blue-800 border-blue-200',
    Resolved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[state]}`}>
      {state}
    </span>
  );
};

export const BookingBadge: React.FC<{ status: BookingStatus; isSuspendedByEB?: boolean }> = ({ status, isSuspendedByEB }) => {
  if (isSuspendedByEB || status === 'Suspended') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-red-50 text-red-700 border-red-200">
        Suspended
      </span>
    );
  }

  const styles = {
    Confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Cancelled: 'bg-stone-100 text-stone-500 border-stone-200',
    Suspended: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[status]}`}>
      {status}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const styles = {
    Student: 'bg-stone-100 text-stone-700 border-stone-200',
    'Maintenance Staff': 'bg-stone-200 text-stone-800 border-stone-300',
    Admin: 'bg-stone-800 text-stone-100 border-stone-700',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[role]}`}>
      {role}
    </span>
  );
};
