import React from 'react';
import { User, UserRole } from '../../types';
import { RoleBadge } from '../common/Badge';
import {
  User as UserIcon,
  Shield,
  Bell,
  RefreshCw,
  LogOut,
  Smartphone,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface MobileProfileProps {
  currentUser: User;
  onSwitchUser: (role: UserRole) => void;
  onSendTestPush: () => void;
  onResetDb: () => void;
}

export const MobileProfile: React.FC<MobileProfileProps> = ({
  currentUser,
  onSwitchUser,
  onSendTestPush,
  onResetDb,
}) => {
  return (
    <div className="space-y-4 pb-6">
      {/* Profile Header */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={currentUser.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-500/30"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {currentUser.name}
              </h2>
              <RoleBadge role={currentUser.role} />
            </div>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{currentUser.department}</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
          <span className="text-slate-500">Account Status:</span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5" />
            Active (IIIT Pune LDAP Verified)
          </span>
        </div>
      </div>

      {/* Role Switcher (Persona Testing) */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Switch Persona for Demo / Evaluation
          </h3>
          <span className="text-[11px] text-blue-600 dark:text-blue-400">RBAC Testing</span>
        </div>
        <p className="text-xs text-slate-500">
          UCRMS serves 3 distinct user classes. Select any role to instantly experience their native
          mobile client view and API authorization scope:
        </p>

        <div className="grid grid-cols-3 gap-2 pt-1">
          {(['Student', 'Maintenance Staff', 'Admin'] as UserRole[]).map((r) => {
            const isSelected = currentUser.role === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => onSwitchUser(r)}
                className={`py-2 px-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                }`}
              >
                <div>{r === 'Maintenance Staff' ? 'Staff' : r}</div>
                <div className="text-[10px] opacity-80 font-normal">
                  {r === 'Student' ? 'Aarav' : r === 'Maintenance Staff' ? 'Ramesh' : 'Dr. Priya'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Push Notification Simulator (REQ-5.2) */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-blue-500" />
          Push Notification Service (FCM Simulator)
        </h3>
        <p className="text-xs text-slate-500">
          Per REQ-5.2, affected users receive a push notification within 30 seconds of an Event
          Bridge suspension. Test the mobile alert delivery:
        </p>
        <button
          type="button"
          onClick={onSendTestPush}
          className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-600 transition-colors"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Trigger Sample Push Notification (REQ-5.2)</span>
        </button>
      </div>

      {/* Reset State */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          Reset Demo Environment
        </h3>
        <p className="text-xs text-slate-500">
          Restore seed rooms, bookings, tickets, and Event Bridge state to factory defaults.
        </p>
        <button
          type="button"
          onClick={onResetDb}
          className="w-full py-2 px-3 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-red-200 dark:border-red-900 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset All Data to Initial Seeds</span>
        </button>
      </div>
    </div>
  );
};
