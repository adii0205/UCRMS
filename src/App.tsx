import React, { useState, useEffect, useCallback } from 'react';
import { api } from './server/api';
import { User, Room, Booking, Ticket } from './types';
import { Header, MainViewMode } from './components/layout/Header';
import { PortalHome } from './components/home/PortalHome';
import { DesktopDashboard } from './components/desktop/DesktopDashboard';
import { AdminConsole } from './components/admin/AdminConsole';
import { ConcurrencyTester } from './components/testing/ConcurrencyTester';
import { JMeterTestSuite } from './components/jmeter/JMeterTestSuite';
import { LoginModal } from './components/auth/LoginModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(api.getCurrentUser());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentView, setCurrentView] = useState<MainViewMode>('home');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [bookingModalDirect, setBookingModalDirect] = useState(false);
  const [ticketModalDirect, setTicketModalDirect] = useState(false);

  const refreshData = useCallback(async () => {
    setCurrentUser(api.getCurrentUser());
    try {
      const [r, b, t] = await Promise.all([
        api.getRooms(),
        api.getBookings(),
        api.getTickets(),
      ]);
      setLoadError(null);
      setRooms(r);
      setBookings(b);
      setTickets(t);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load application data.');
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleSwitchRole = async (role: User['role']) => {
    try {
      await api.switchUserByRole(role);
      setCurrentUser(api.getCurrentUser());
      await refreshData();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to switch user.');
    }
  };

  const handleResetDb = async () => {
    if (window.confirm('Reset database to canonical seeds?')) {
      try {
        await api.resetDatabase();
        await refreshData();
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Unable to reset demo data.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-stone-900 flex flex-col font-sans">
      <Header
        currentView={currentView}
        onSelectView={setCurrentView}
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onResetDb={handleResetDb}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {loadError && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-3.5 bg-red-50 border border-red-200 text-xs font-medium text-red-800 rounded-lg flex justify-between items-center">
            <span>{loadError}</span>
            <button onClick={refreshData} className="underline font-semibold">Retry</button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && (
          <PortalHome
            currentUser={currentUser}
            rooms={rooms}
            bookings={bookings}
            tickets={tickets}
            onNavigate={(view) => setCurrentView(view)}
            onOpenBooking={() => {
              setCurrentView('dashboard');
              setBookingModalDirect(true);
            }}
            onOpenTicket={() => {
              setCurrentView('dashboard');
              setTicketModalDirect(true);
            }}
          />
        )}

        {currentView === 'dashboard' && (
          <DesktopDashboard
            currentUser={currentUser}
            rooms={rooms}
            bookings={bookings}
            tickets={tickets}
            onRefreshData={refreshData}
            openBookingDirectly={bookingModalDirect}
            openTicketDirectly={ticketModalDirect}
          />
        )}

        {currentView === 'concurrency' && (
          <ConcurrencyTester rooms={rooms} onRefreshData={refreshData} />
        )}

        {currentView === 'jmeter' && <JMeterTestSuite />}

        {currentView === 'admin' && currentUser.role === 'Admin' && (
          <AdminConsole
            currentUser={currentUser}
            rooms={rooms}
            bookings={bookings}
            tickets={tickets}
            onRefreshData={refreshData}
          />
        )}
      </main>

      {/* Institutional Footer (IBTE Style) */}
      <footer className="border-t border-stone-200 bg-white py-8 text-xs text-stone-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center font-bold text-sm">
                U
              </div>
              <div>
                <span className="font-bold text-sm text-stone-900 block leading-tight">
                  Indian Institute of Information Technology Pune
                </span>
                <span className="text-[11px] text-stone-500">
                  Estate, Academic Infrastructure &amp; Maintenance Management Portal
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="font-medium text-stone-700">Campus Address:</span>
              <span>Talegaon Dabhade, Pune, Maharashtra 410507</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-400">
            <span>© 2026 IIIT Pune. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span>ACID Row Lock Engine</span>
              <span>·</span>
              <span>Safety EventBridge</span>
              <span>·</span>
              <span>JMeter Test Ready</span>
            </div>
          </div>
        </div>
      </footer>

      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={async (email) => {
            await api.login(email);
            setCurrentUser(api.getCurrentUser());
            setIsLoginModalOpen(false);
            await refreshData();
          }}
        />
      )}
    </div>
  );
}
