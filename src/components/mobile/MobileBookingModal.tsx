import React, { useState, useEffect } from 'react';
import { api } from '../../server/api';
import { Room, TimeSlot } from '../../types';
import { Calendar, Clock, AlertTriangle, CheckCircle2, X, ShieldAlert } from 'lucide-react';

const dateOffset = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

interface MobileBookingModalProps {
  room: Room;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}

export const MobileBookingModal: React.FC<MobileBookingModalProps> = ({
  room,
  onClose,
  onSuccess,
}) => {
  const [selectedDate, setSelectedDate] = useState(() => dateOffset(0));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [purpose, setPurpose] = useState('Capstone Project Team Discussion & Presentation');
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const availableDates = [dateOffset(0), dateOffset(1), dateOffset(2)];

  useEffect(() => {
    let mounted = true;
    const loadAvailability = async () => {
      setIsLoadingSlots(true);
      setErrorBanner(null);
      try {
        const availableSlots = await api.getRoomAvailability(room.id, selectedDate);
        if (mounted) {
          setSlots(availableSlots);
          // Auto-select first available slot
          const firstAvailable = availableSlots.find((s) => !s.isBooked && !s.isSuspended);
          setSelectedSlot(firstAvailable || null);
        }
      } catch (err: any) {
        if (mounted) setErrorBanner(err.message || 'Failed to fetch slots');
      } finally {
        if (mounted) setIsLoadingSlots(false);
      }
    };
    loadAvailability();
    return () => {
      mounted = false;
    };
  }, [room.id, selectedDate]);

  const handleBook = async () => {
    if (!selectedSlot) {
      setErrorBanner('Please select an available time slot.');
      return;
    }
    setErrorBanner(null);
    setIsSubmitting(true);
    try {
      const res = await api.createBooking({
        roomId: room.id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        purpose,
      });
      onSuccess(res.id);
    } catch (err: any) {
      setErrorBanner(err.message || 'Booking transaction failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-6 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Reserve {room.name}
            </h2>
            <p className="text-xs text-slate-500">
              {room.building} · Floor {room.floor} · Cap: {room.capacity}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suspended Alert Warning (REQ-1.3, REQ-4.2) */}
        {room.isSuspended && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-900 text-red-800 dark:text-red-300 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Event Bridge Room Suspension Active</p>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                This room is blocked from booking due to Ticket #{room.activeTicketId}:{' '}
                {room.suspensionReason}
              </p>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorBanner && (
          <div className="mx-5 mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="leading-tight">{errorBanner}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Date Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              Reservation Date
            </label>
            <div className="flex gap-2">
              {availableDates.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDate(d)}
                  className={`flex-1 py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    selectedDate === d
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {new Date(`${d}T12:00:00`).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </button>
              ))}
            </div>
          </div>

          {/* Slots Grid (REQ-1.1) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                Select 1-Hour Time Slot (REQ-1.1)
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                ACID Concurrency Protected
              </span>
            </label>

            {isLoadingSlots ? (
              <div className="py-8 text-center text-xs text-slate-500">Checking availability...</div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map((s) => {
                  const isSelected = selectedSlot?.startTime === s.startTime;
                  const isBlocked = s.isBooked || room.isSuspended;

                  return (
                    <button
                      key={s.startTime}
                      type="button"
                      disabled={isBlocked}
                      onClick={() => setSelectedSlot(s)}
                      className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
                        isBlocked
                          ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-300 dark:ring-blue-800'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                      }`}
                    >
                      <div className="font-semibold">
                        {s.startTime} - {s.endTime}
                      </div>
                      <div className="text-[10px] mt-0.5">
                        {room.isSuspended
                          ? 'Suspended'
                          : s.isBooked
                          ? 'Booked'
                          : isSelected
                          ? 'Selected'
                          : 'Available'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Academic / Event Purpose
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Equipment list */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-300">Equipped With: </span>
            <span className="text-slate-500 dark:text-slate-400">
              {room.equipment.join(' · ')}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleBook}
            disabled={isSubmitting || room.isSuspended || !selectedSlot}
            className="flex-1 py-2.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-1.5 transition-all"
          >
            {isSubmitting ? (
              <span>Acquiring Lock...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Reservation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
