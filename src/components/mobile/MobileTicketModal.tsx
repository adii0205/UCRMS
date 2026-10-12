import React, { useState } from 'react';
import { api } from '../../server/api';
import { Room, TicketCategory, TicketPriority } from '../../types';
import { AlertTriangle, Camera, Check, X, Image as ImageIcon, Flame } from 'lucide-react';

interface MobileTicketModalProps {
  rooms: Room[];
  initialRoomId?: string;
  onClose: () => void;
  onSuccess: (ticketId: string) => void;
}

const SAMPLE_PHOTOS = [
  {
    name: 'Electrical Hazard',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Damaged AV Cables',
    url: 'https://images.unsplash.com/photo-1517430816045-df4b7de81d48?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Broken Furniture',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Network Rack / Fiber',
    url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80',
  },
];

export const MobileTicketModal: React.FC<MobileTicketModalProps> = ({
  rooms,
  initialRoomId,
  onClose,
  onSuccess,
}) => {
  const [roomId, setRoomId] = useState(initialRoomId || (rooms[0]?.id ?? ''));
  const [category, setCategory] = useState<TicketCategory>('Electrical');
  const [priority, setPriority] = useState<TicketPriority>('High');
  const [description, setDescription] = useState(
    'Tripping main circuit breaker causing intermittent blackout and burning odor in server rack.'
  );
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(SAMPLE_PHOTOS[0].url);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const categories: TicketCategory[] = [
    'Electrical',
    'Network/IT',
    'HVAC/AC',
    'Audio/Visual',
    'Furniture',
    'Plumbing',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    if (!description.trim()) {
      setErrorBanner('Please describe the problem.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ticket = await api.createTicket({
        roomId,
        category,
        description,
        priority,
        photoUrl: selectedPhoto,
      });
      onSuccess(ticket.id);
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to submit maintenance ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRoomObj = rooms.find((r) => r.id === roomId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-6 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Report Campus Issue
              </h2>
              <p className="text-xs text-slate-500">Fast 3-Tap Mobile Incident Submission (REQ-5.1)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error banner convention (Section 4.1 / REQ-4.1) */}
        {errorBanner && (
          <div className="mx-5 mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorBanner}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Target Room */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              1. Affected Room / Facility
            </label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.building}) {r.isSuspended ? '[Currently Suspended]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Issue Category (Interactive Filter Buttons) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              2. Issue Category
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {categories.map((cat) => {
                const isActive = category === cat;
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-2.5 py-2 text-xs font-medium rounded-lg text-left transition-all border ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Level with Event Bridge notice */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              3. Severity / Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Low', 'Medium', 'High'] as TicketPriority[]).map((p) => {
                const isSelected = priority === p;
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? p === 'High'
                          ? 'bg-red-500 text-white border-red-500 shadow-sm'
                          : p === 'Medium'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{p}</span>
                    {p === 'High' && (
                      <span className="text-[10px] opacity-90 font-normal">Triggers Event Bridge</span>
                    )}
                  </button>
                );
              })}
            </div>

            {priority === 'High' && (
              <div className="mt-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                <Flame className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Event Bridge will trigger:</strong> This room will be automatically suspended from booking. Active booking holders will receive an immediate FCM push notification (REQ-4.1).
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Problem Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the hazard, location, or equipment symptoms..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Photo Attachment (REQ-5.1) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Photo Attachment (Camera Mock)
              </label>
              <button
                type="button"
                onClick={() => setShowPhotoPicker(!showPhotoPicker)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" />
                {selectedPhoto ? 'Change Photo' : 'Attach Photo'}
              </button>
            </div>

            {selectedPhoto ? (
              <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 h-24 bg-slate-100 group">
                <img
                  src={selectedPhoto}
                  alt="Issue preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowPhotoPicker(true)}
                className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:border-blue-400 transition-colors"
              >
                <ImageIcon className="w-5 h-5 mb-1 text-slate-400" />
                <span className="text-xs">Tap to attach camera snapshot (REQ-5.1)</span>
              </button>
            )}

            {showPhotoPicker && (
              <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800/80 rounded-lg space-y-1">
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Select sample camera snapshot:
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {SAMPLE_PHOTOS.map((p) => (
                    <button
                      type="button"
                      key={p.name}
                      onClick={() => {
                        setSelectedPhoto(p.url);
                        setShowPhotoPicker(false);
                      }}
                      className="p-1.5 text-left text-[11px] rounded bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-slate-200 dark:border-slate-600 flex items-center justify-between"
                    >
                      <span className="truncate">{p.name}</span>
                      {selectedPhoto === p.url && <Check className="w-3 h-3 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg text-white shadow-sm flex items-center justify-center gap-1.5 transition-all ${
              priority === 'High'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <span>Dispatching...</span>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>Submit Ticket {priority === 'High' ? '& Trigger Bridge' : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
