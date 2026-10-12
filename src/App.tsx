/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api } from './server/api';
import { User, Room, Booking, Ticket, PushNotification, UserRole } from './types';
import { Header, MainViewMode } from './components/layout/Header';
import { MobileShell } from './components/mobile/MobileShell';
import { AdminConsole } from './components/admin/AdminConsole';
import { EventBridgeVisualizer } from './components/eventbridge/EventBridgeVisualizer';
import { ConcurrencyTester } from './components/testing/ConcurrencyTester';
import { ApiExplorer } from './components/api/ApiExplorer';
import { ArchitectureDiagrams } from './components/diagrams/ArchitectureDiagrams';
import { JMeterTestSuite } from './components/jmeter/JMeterTestSuite';
import { LoginModal } from './components/auth/LoginModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(api.getCurrentUser());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [currentView, setCurrentView] = useState<MainViewMode>('mobile');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Push notification alert toast
  const [activeToast, setActiveToast] = useState<PushNotification | null>(null);

  // Synchronize state with real API
  const refreshData = useCallback(async () => {
    setCurrentUser(api.getCurrentUser());
    try {
      const [r, b, t, n] = await Promise.all([
        api.getRooms(),
        api.getBookings(),
        api.getTickets(),
        api.getNotifications(),
      ]);
      setLoadError(null);
      setRooms(r);
      setBookings(b);
      setTickets(t);
      setNotifications(n);

      const latestUnread = n.find((notif) => !notif.isRead && notif.category === 'event_bridge_alert');
      if (latestUnread && latestUnread.id !== activeToast?.id) {
        setActiveToast(latestUnread);
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load application data.');
    }
  }, [activeToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleSwitchRole = async (role: UserRole) => {
    try {
      await api.switchUserByRole(role);
      setCurrentUser(api.getCurrentUser());
      await refreshData();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to switch user.');
    }
  };

  const handleDismissNotification = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      if (activeToast?.id === id) {
        setActiveToast(null);
      }
      await refreshData();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to dismiss notification.');
    }
  };

  const handleSendTestPush = async () => {
    try {
      const notification = await api.sendTestPush();
      setActiveToast(notification);
      await refreshData();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to send test notification.');
    }
  };

  const handleResetDb = async () => {
    if (window.confirm('Reset database to canonical seeds?')) {
      try {
        await api.resetDatabase();
        setActiveToast(null);
        await refreshData();
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Unable to reset demo data.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Navigation & Persona Header */}
      <Header
        currentView={currentView}
        onSelectView={setCurrentView}
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        notifications={notifications}
        onDismissNotification={handleDismissNotification}
        onResetDb={handleResetDb}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {loadError && (
        <div role="alert" className="mx-auto mt-3 w-full max-w-7xl px-4 text-sm text-red-700 dark:text-red-300">
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/50">
            <span>{loadError}</span>
            <button type="button" onClick={refreshData} className="font-semibold underline">Retry</button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'mobile' && (
          <div className="space-y-4">
            <div className="text-center max-w-lg mx-auto">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Native Mobile Client Simulation · REQ-5.1 - REQ-5.3
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Android Material 3 Client ({currentUser.role} View)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Experience the mobile-first campus client: 3-tap ticket reporting, push notification
                delivery with deep linking, and transaction-protected booking.
              </p>
            </div>

            <MobileShell
              currentUser={currentUser}
              rooms={rooms}
              bookings={bookings}
              tickets={tickets}
              notifications={notifications}
              activeNotification={activeToast}
              onDismissNotification={handleDismissNotification}
              onSwitchUser={handleSwitchRole}
              onRefreshData={refreshData}
              onSendTestPush={handleSendTestPush}
              onResetDb={handleResetDb}
            />
          </div>
        )}

        {currentView === 'admin' && (
          <AdminConsole
            currentUser={currentUser}
            rooms={rooms}
            bookings={bookings}
            tickets={tickets}
            onRefreshData={refreshData}
          />
        )}

        {currentView === 'eventbridge' && (
          <EventBridgeVisualizer
            rooms={rooms}
            tickets={tickets}
            bookings={bookings}
            currentUser={currentUser}
            onRefreshData={refreshData}
          />
        )}

        {currentView === 'concurrency' && (
          <ConcurrencyTester rooms={rooms} onRefreshData={refreshData} />
        )}

        {currentView === 'jmeter' && (
          <JMeterTestSuite rooms={rooms} onRefreshData={refreshData} />
        )}

        {currentView === 'apiexplorer' && (
          <ApiExplorer
            currentUser={currentUser}
            rooms={rooms}
            onRefreshData={refreshData}
          />
        )}

        {currentView === 'architecture' && <ArchitectureDiagrams />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Unified Campus Resource &amp; Maintenance System (UCRMS) · IIIT Pune SE Lab 2026
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span>ACID Concurrency Engine</span>
            <span>·</span>
            <span>Automated Event Bridge</span>
            <span>·</span>
            <span>Role-Based Access Control</span>
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
