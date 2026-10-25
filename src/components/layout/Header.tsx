import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import {
  Shield,
  Layers,
  BarChart3,
  LogOut,
  RotateCcw,
  LayoutDashboard,
  Calendar,
  ChevronDown
} from 'lucide-react';

export type MainViewMode =
  | 'home'
  | 'dashboard'
  | 'admin'
  | 'concurrency'
  | 'jmeter';

interface HeaderProps {
  currentView: MainViewMode;
  onSelectView: (view: MainViewMode) => void;
  currentUser: User;
  onSwitchRole: (role: UserRole) => void;
  onResetDb: () => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  currentUser,
  onSwitchRole,
  onResetDb,
  onOpenLogin,
}) => {
  const [showRoleSelect, setShowRoleSelect] = useState(false);

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-2xs">
      {/* Official IIIT Pune Large Center Banner */}
      <div className="w-full bg-[#1b365d] border-b border-blue-950 py-3 px-4 sm:px-8 flex flex-col items-center justify-center text-center shadow-xs">
        <img
          src="/images/Screenshot 2026-10-25 092543.png"
          alt="Indian Institute of Information Technology Pune Banner"
          className="h-14 sm:h-16 md:h-20 w-auto object-contain max-w-full drop-shadow-sm cursor-pointer"
          onClick={() => onSelectView('home')}
        />
        <div className="mt-1 flex items-center justify-center gap-2">
          <span className="text-[11px] sm:text-xs font-semibold text-blue-100 tracking-wider uppercase px-3 py-0.5 rounded-full bg-blue-900/80 border border-blue-600/40">
            Unified Campus Resource &amp; Maintenance System (UCRMS)
          </span>
        </div>
      </div>

      {/* Main Navigation Row (IBTE Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Main Links */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onSelectView('home')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center font-extrabold text-base shadow-xs group-hover:bg-[#4338CA] transition-colors">
                U
              </div>
              <div>
                <span className="font-extrabold text-base text-stone-900 tracking-tight block leading-tight">
                  UCRMS Portal
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  IIIT Pune Campus Network
                </span>
              </div>
            </button>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
              <button
                onClick={() => onSelectView('home')}
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  currentView === 'home'
                    ? 'text-[#4F46E5] bg-indigo-50 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                Overview &amp; Home
              </button>
              <button
                onClick={() => onSelectView('dashboard')}
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  currentView === 'dashboard'
                    ? 'text-[#4F46E5] bg-indigo-50 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                Facilities &amp; Booking
              </button>
              <button
                onClick={() => onSelectView('concurrency')}
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  currentView === 'concurrency'
                    ? 'text-[#4F46E5] bg-indigo-50 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                Concurrency Engine
              </button>
              <button
                onClick={() => onSelectView('jmeter')}
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  currentView === 'jmeter'
                    ? 'text-[#4F46E5] bg-indigo-50 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                JMeter Load Testing
              </button>
              {currentUser.role === 'Admin' && (
                <button
                  onClick={() => onSelectView('admin')}
                  className={`px-3.5 py-2 rounded-lg transition-colors ${
                    currentView === 'admin'
                      ? 'text-[#4F46E5] bg-indigo-50 font-bold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  Administration
                </button>
              )}
            </nav>
          </div>

          {/* Right Action Controls: Quick Reset & Persona Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={onResetDb}
              title="Reset sample data to defaults"
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleSelect(!showRoleSelect)}
                className="inline-flex items-center gap-2.5 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors shadow-2xs"
              >
                <div className="text-left">
                  <span className="font-bold text-stone-900 block leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-stone-500 font-medium block leading-tight">
                    {currentUser.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {showRoleSelect && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-xl shadow-xl p-2 z-50 text-xs animate-in fade-in duration-150">
                  <div className="px-2 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Switch Test Account
                  </div>
                  {(['Student', 'Maintenance Staff', 'Admin'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        onSwitchRole(role);
                        setShowRoleSelect(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-center justify-between ${
                        currentUser.role === role
                          ? 'bg-indigo-50 font-bold text-[#4F46E5]'
                          : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span>{role}</span>
                      {currentUser.role === role && (
                        <span className="text-[10px] text-[#4F46E5] font-bold">Active</span>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-stone-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setShowRoleSelect(false);
                        onOpenLogin();
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-stone-700 hover:bg-stone-50 rounded-lg flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 text-stone-500" />
                      <span>Sign in with Email</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Button */}
            <button
              onClick={() => onSelectView('dashboard')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Reserve Facility</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
