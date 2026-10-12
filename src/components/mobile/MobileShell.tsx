import React, { useState } from 'react';
import { User, Room, Booking, Ticket, PushNotification, UserRole } from '../../types';
import { MobileHome } from './MobileHome';
import { MobileBookings } from './MobileBookings';
import { MobileTickets } from './MobileTickets';
import { MobileProfile } from './MobileProfile';
import { MobileTicketModal } from './MobileTicketModal';
import { MobileBookingModal } from './MobileBookingModal';
import { TicketDetailModal } from './TicketDetailModal';
import { RoleBadge } from '../common/Badge';
import {
  Home,
  Calendar,
  Wrench,
  User as UserIcon,
  Wifi,
  Battery,
  Signal,
  Bell,
  AlertTriangle,
  Flame,
  CheckCircle,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface MobileShellProps {
  currentUser: User;
  rooms: Room[];
  bookings: Booking[];
  tickets: Ticket[];
  notifications: PushNotification[];
  activeNotification: PushNotification | null;
  onDismissNotification: (id: string) => void;
  onSwitchUser: (role: UserRole) => void;
  onRefreshData: () => void;
  onSendTestPush: () => void;
  onResetDb: () => void;
}

export type MobileTab = 'Home' | 'Bookings' | 'Tickets' | 'Profile';

export const MobileShell: React.FC<MobileShellProps> = ({
  currentUser,
  rooms,
  bookings,
  tickets,
  notifications,
  activeNotification,
  onDismissNotification,
  onSwitchUser,
  onRefreshData,
  onSendTestPush,
  onResetDb,
}) => {
  const [currentTab, setCurrentTab] = useState<MobileTab>('Home');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [initialReportRoomId, setInitialReportRoomId] = useState<string | undefined>(undefined);
  const [bookingModalRoom, setBookingModalRoom] = useState<Room | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleOpenReportModal = (roomId?: string) => {
    setInitialReportRoomId(roomId);
    setIsReportModalOpen(true);
  };

  const handleDeepLink = (notif: PushNotification) => {
    onDismissNotification(notif.id);
    if (notif.targetRoute?.tab) {
      setCurrentTab(notif.targetRoute.tab);
      if (notif.targetRoute.tab === 'Tickets' && notif.targetRoute.id) {
        const t = tickets.find((tk) => tk.id === notif.targetRoute?.id);
        if (t) setSelectedTicket(t);
      }
    }
  };

  return (
    <div className="w-full flex justify-center py-4">
      {/* Android Device Mockup Shell */}
      <div className="w-full max-w-[420px] bg-slate-900 rounded-[44px] p-3 shadow-2xl ring-1 ring-slate-800 border-4 border-slate-700/80 relative">
        {/* Device Speaker Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full flex items-center justify-center gap-2 z-30">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800 ring-1 ring-slate-700" />
          <div className="w-10 h-1 bg-slate-800 rounded-full" />
        </div>

        {/* Screen Bezel Container */}
        <div className="w-full bg-slate-50 dark:bg-slate-950 rounded-[36px] overflow-hidden flex flex-col h-[780px] relative border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
          {/* Android Status Bar */}
          <div className="pt-2 px-6 pb-1 bg-slate-100 dark:bg-slate-900/90 flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 z-20 select-none">
            <span>09:41</span>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px]">98%</span>
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Android Top App Bar */}
          <div className="px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-20 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                U
              </div>
              <div>
                <h1 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white">
                  UCRMS Mobile
                </h1>
                <p className="text-[10px] text-slate-500 -mt-0.5">IIIT Pune Campus Net</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <RoleBadge role={currentUser.role} />
            </div>
          </div>

          {/* FCM Push Notification Toast Banner (REQ-5.2) */}
          {activeNotification && (
            <div className="absolute top-14 left-3 right-3 z-40 animate-in slide-in-from-top duration-300">
              <div
                onClick={() => handleDeepLink(activeNotification)}
                className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 flex items-start gap-2.5 cursor-pointer hover:bg-slate-800 transition-all ring-2 ring-red-500/40"
              >
                <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">
                      {activeNotification.title}
                    </span>
                    <span className="text-[10px] text-slate-400">Now (FCM)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5 leading-snug">
                    {activeNotification.body}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 font-semibold mt-1">
                    Tap to open affected item <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismissNotification(activeNotification.id);
                  }}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Screen Content Scroll Area */}
          <div className="flex-1 overflow-y-auto px-4 pt-3.5 pb-20 scrollbar-none">
            {currentTab === 'Home' && (
              <MobileHome
                currentUser={currentUser}
                rooms={rooms}
                tickets={tickets}
                onSelectRoomToBook={(room) => setBookingModalRoom(room)}
                onOpenReportModal={handleOpenReportModal}
                onSelectTicket={(ticket) => setSelectedTicket(ticket)}
                onFastAssignTicket={async (ticketId) => {
                  await onRefreshData();
                }}
              />
            )}

            {currentTab === 'Bookings' && (
              <MobileBookings
                currentUser={currentUser}
                bookings={bookings}
                onRefresh={onRefreshData}
                onOpenBookingModal={() => setBookingModalRoom(rooms[0])}
              />
            )}

            {currentTab === 'Tickets' && (
              <MobileTickets
                currentUser={currentUser}
                tickets={tickets}
                onOpenReportModal={() => handleOpenReportModal()}
                onSelectTicket={(ticket) => setSelectedTicket(ticket)}
                onFastAssignTicket={async (ticketId) => {
                  await onRefreshData();
                }}
              />
            )}

            {currentTab === 'Profile' && (
              <MobileProfile
                currentUser={currentUser}
                onSwitchUser={onSwitchUser}
                onSendTestPush={onSendTestPush}
                onResetDb={onResetDb}
              />
            )}
          </div>

          {/* Android Material Bottom Navigation (Section 4.1 & REQ-5.3) */}
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around z-30">
            <button
              type="button"
              onClick={() => setCurrentTab('Home')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                currentTab === 'Home'
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-full transition-colors ${
                  currentTab === 'Home' ? 'bg-blue-100 dark:bg-blue-950/60' : ''
                }`}
              >
                <Home className="w-4 h-4" />
              </div>
              <span className="text-[10px]">Home</span>
            </button>

            {/* Bookings Tab: Hidden for Staff per Section 4.2 RBAC */}
            {currentUser.role !== 'Maintenance Staff' && (
              <button
                type="button"
                onClick={() => setCurrentTab('Bookings')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                  currentTab === 'Bookings'
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
                }`}
              >
                <div
                  className={`p-1 rounded-full transition-colors ${
                    currentTab === 'Bookings' ? 'bg-blue-100 dark:bg-blue-950/60' : ''
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-[10px]">Bookings</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setCurrentTab('Tickets')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                currentTab === 'Tickets'
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-full transition-colors ${
                  currentTab === 'Tickets' ? 'bg-blue-100 dark:bg-blue-950/60' : ''
                }`}
              >
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-[10px]">Tickets</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('Profile')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                currentTab === 'Profile'
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-full transition-colors ${
                  currentTab === 'Profile' ? 'bg-blue-100 dark:bg-blue-950/60' : ''
                }`}
              >
                <UserIcon className="w-4 h-4" />
              </div>
              <span className="text-[10px]">Profile</span>
            </button>
          </div>

          {/* Android Home Bar Indicator */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-300 dark:bg-slate-700 rounded-full pointer-events-none z-30" />
        </div>
      </div>

      {/* Modals */}
      {isReportModalOpen && (
        <MobileTicketModal
          rooms={rooms}
          initialRoomId={initialReportRoomId}
          onClose={() => setIsReportModalOpen(false)}
          onSuccess={(ticketId) => {
            setIsReportModalOpen(false);
            onRefreshData();
            setCurrentTab('Tickets');
          }}
        />
      )}

      {bookingModalRoom && (
        <MobileBookingModal
          room={bookingModalRoom}
          onClose={() => setBookingModalRoom(null)}
          onSuccess={(bookingId) => {
            setBookingModalRoom(null);
            onRefreshData();
            setCurrentTab('Bookings');
          }}
        />
      )}

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          currentUser={currentUser}
          onClose={() => setSelectedTicket(null)}
          onUpdated={() => {
            onRefreshData();
            setSelectedTicket(null);
          }}
        />
      )}
    </div>
  );
};
