import React, { useState } from 'react';
import { User, UserRole, PushNotification } from '../../types';
import { RoleBadge } from '../common/Badge';
import {
  Smartphone,
  Shield,
  Zap,
  Cpu,
  Globe,
  Layers,
  Bell,
  RefreshCw,
  LogIn,
  UserCheck,
  ChevronDown,
  CheckCircle,
  X,
  BarChart3,
} from 'lucide-react';

export type MainViewMode =
  | 'mobile'
  | 'admin'
  | 'eventbridge'
  | 'concurrency'
  | 'jmeter'
  | 'apiexplorer'
  | 'architecture';

interface HeaderProps {
  currentView: MainViewMode;
  onSelectView: (view: MainViewMode) => void;
  currentUser: User;
  onSwitchRole: (role: UserRole) => void;
  notifications: PushNotification[];
  onDismissNotification: (id: string) => void;
  onResetDb: () => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  currentUser,
  onSwitchRole,
  notifications,
  onDismissNotification,
  onResetDb,
  onOpenLogin,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  const navItems = [
    { id: 'mobile' as MainViewMode, label: 'Native Mobile Client', icon: Smartphone, badge: 'Android' },
    { id: 'jmeter' as MainViewMode, label: 'JMeter Testing & Proof', icon: BarChart3, badge: 'Screenshots' },
    { id: 'admin' as MainViewMode, label: 'Admin & Ops Hub', icon: Shield, badge: 'Sec 4.3' },
    { id: 'eventbridge' as MainViewMode, label: 'Event Bridge Engine', icon: Zap, badge: 'Core' },
    { id: 'concurrency' as MainViewMode, label: 'Concurrency Tester', icon: Cpu, badge: '50-Worker' },
    { id: 'apiexplorer' as MainViewMode, label: 'REST API & cURL', icon: Globe, badge: 'Sec 5.1' },
    { id: 'architecture' as MainViewMode, label: 'Architecture Diagrams', icon: Layers, badge: 'App B' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md ring-2 ring-blue-500/20">
            UC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                UCRMS
              </span>
              <span className="text-[10px] uppercase font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-900">
                v1.0 Release
              </span>
              <span className="hidden md:inline-block text-[11px] text-slate-400">
                · IIIT Pune SE Lab 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Unified Campus Resource &amp; Maintenance System with Automated Event Bridge
            </p>
          </div>
        </div>

        {/* Right Tools: Role Switcher & Notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenLogin}
            className="py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-1.5 text-xs transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign in</span>
          </button>

          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2 text-xs transition-colors"
            >
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <div className="text-left hidden sm:block">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-400 -mt-0.5 block">{currentUser.role}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    Switch Test Persona
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Test RBAC views and permission enforcement
                  </span>
                </div>

                <div className="py-1 space-y-1">
                  {[
                    { role: 'Student' as UserRole, name: 'Aarav Sharma', subtitle: 'Bookings & Incident Reports' },
                    { role: 'Maintenance Staff' as UserRole, name: 'Ramesh Patel', subtitle: 'Open Queue & Fix Resolution' },
                    { role: 'Admin' as UserRole, name: 'Dr. Priya Rao', subtitle: 'Oversight, Overrides & RBAC' },
                  ].map((item) => (
                    <button
                      key={item.role}
                      onClick={() => {
                        onSwitchRole(item.role);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full p-2 rounded-xl text-left flex items-start gap-2.5 transition-colors ${
                        currentUser.role === item.role
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 font-semibold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <RoleBadge role={item.role} />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{item.subtitle}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 relative transition-colors"
              title="Push Notifications (FCM Simulator)"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    FCM Push Notification Feed ({notifications.length})
                  </span>
                  <span className="text-[10px] text-slate-400">REQ-5.2 (&lt;30s)</span>
                </div>

                <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-xs">
                      No notifications delivered yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl border text-left transition-colors relative ${
                          n.category === 'event_bridge_alert'
                            ? 'bg-red-50/60 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-red-950 dark:text-red-200'
                            : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] truncate">{n.title}</span>
                          <button
                            onClick={() => onDismissNotification(n.id)}
                            className="text-slate-400 hover:text-slate-600 p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                          {n.body}
                        </p>
                        <span className="text-[9px] text-slate-400 block mt-1">
                          {new Date(n.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick DB Reset */}
          <button
            onClick={onResetDb}
            title="Reset Database to Seed State"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-red-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Mode Navigation Bar */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto py-1.5 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-normal ${
                      isActive
                        ? 'bg-blue-700/80 text-blue-100'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
