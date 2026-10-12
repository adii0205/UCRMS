import React, { useState } from 'react';
import { api } from '../../server/api';
import { Booking, User } from '../../types';
import { BookingBadge } from '../common/Badge';
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  CheckCircle,
  Trash2,
} from 'lucide-react';

interface MobileBookingsProps {
  currentUser: User;
  bookings: Booking[];
  onRefresh: () => void;
  onOpenBookingModal?: () => void;
}

export const MobileBookings: React.FC<MobileBookingsProps> = ({
  currentUser,
  bookings,
  onRefresh,
  onOpenBookingModal,
}) => {
  const [filter, setFilter] = useState<'All' | 'Confirmed' | 'Suspended' | 'Cancelled'>('All');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // RBAC Filter: Students see their own bookings; Admins see all (Section 4.1 & 4.3)
  const userBookings =
    currentUser.role === 'Student'
      ? bookings.filter((b) => b.userId === currentUser.id)
      : bookings;

  const filtered = userBookings.filter((b) => {
    if (filter === 'All') return true;
    return b.status === filter;
  });

  const handleCancelBooking = async (bookingId: string) => {
    setErrorBanner(null);
    setSuccessBanner(null);
    setCancellingId(bookingId);
    try {
      await api.cancelBooking(bookingId, 'User requested cancellation from mobile app');
      setSuccessBanner('Booking cancelled successfully.');
      onRefresh();
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to cancel reservation');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {currentUser.role === 'Admin' ? 'Campus Bookings (Admin View)' : 'My Resource Bookings'}
          </h2>
          <p className="text-xs text-slate-500">
            {currentUser.role === 'Admin'
              ? 'Campus-wide reservations directory'
              : 'Upcoming & past reservations with Event Bridge status'}
          </p>
        </div>
        {onOpenBookingModal && currentUser.role !== 'Maintenance Staff' && (
          <button
            onClick={onOpenBookingModal}
            className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            + New Booking
          </button>
        )}
      </div>

      {/* Error / Success Banners */}
      {errorBanner && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}
      {successBanner && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Interactive Filter Tabs */}
      <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        {(['All', 'Confirmed', 'Suspended', 'Cancelled'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              filter === tab
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
          <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          No reservations found under '{filter}'.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const isSuspended = b.status === 'Suspended' || b.suspendedByEventBridge;
            const canCancel =
              (currentUser.role === 'Admin' || b.userId === currentUser.id) &&
              b.status !== 'Cancelled';

            return (
              <div
                key={b.id}
                className={`p-3.5 rounded-xl border bg-white dark:bg-slate-800 transition-all ${
                  isSuspended
                    ? 'border-red-300 dark:border-red-900/80 bg-red-50/20 dark:bg-red-950/10'
                    : 'border-slate-200 dark:border-slate-700 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">#{b.id}</span>
                      <BookingBadge status={b.status} isSuspendedByEB={b.suspendedByEventBridge} />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                      {b.roomName}
                    </h3>
                  </div>

                  {currentUser.role === 'Admin' && (
                    <span className="text-[11px] text-slate-400">
                      By {b.userName}
                    </span>
                  )}
                </div>

                {/* Event Bridge Alert Banner (REQ-4.3) */}
                {isSuspended && (
                  <div className="mt-2.5 p-2 rounded-lg bg-red-100/70 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300 flex items-start gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Event Bridge Notice: </span>
                      <span>
                        {b.suspensionNotice ||
                          'Room is suspended due to an active High Priority maintenance ticket. Push notification sent.'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{b.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {b.startTime} - {b.endTime}
                    </span>
                  </div>
                  <div className="col-span-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                    <span className="font-medium">Purpose: </span>
                    {b.purpose}
                  </div>
                </div>

                {/* Cancel Action (REQ-1.4) */}
                {canCancel && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleCancelBooking(b.id)}
                      disabled={cancellingId === b.id}
                      className="py-1 px-3 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{cancellingId === b.id ? 'Cancelling...' : 'Cancel Reservation'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
