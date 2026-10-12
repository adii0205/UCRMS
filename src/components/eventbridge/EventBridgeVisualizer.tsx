import React, { useState } from 'react';
import { api } from '../../server/api';
import { Room, Ticket, Booking, User } from '../../types';
import { StateBadge, PriorityBadge } from '../common/Badge';
import {
  Flame,
  ArrowRight,
  ShieldAlert,
  Bell,
  Wrench,
  CheckCircle2,
  RefreshCw,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

interface EventBridgeVisualizerProps {
  rooms: Room[];
  tickets: Ticket[];
  bookings: Booking[];
  currentUser: User;
  onRefreshData: () => void;
}

export const EventBridgeVisualizer: React.FC<EventBridgeVisualizerProps> = ({
  rooms,
  tickets,
  bookings,
  currentUser,
  onRefreshData,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [simulatedTicketId, setSimulatedTicketId] = useState<string | null>(null);
  const [isRunningAuto, setIsRunningAuto] = useState<boolean>(false);
  const [logMessages, setLogMessages] = useState<string[]>([
    'Event Bridge daemon online. Listening to Ticketing event bus...',
  ]);

  const addLog = (msg: string) => {
    setLogMessages((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 15)]);
  };

  // Target room for the interactive demo: Seminar Hall 101
  const demoRoom = rooms.find((r) => r.id === 'room_sh101') || rooms[0];

  // Step 1: Create a High Priority Ticket on Seminar Hall 101
  const handleTriggerHighTicket = async () => {
    try {
      addLog(`Triggering REQ-4.1: Filing High Priority ticket for ${demoRoom.name}...`);
      const t = await api.createTicket({
        roomId: demoRoom.id,
        category: 'Electrical',
        priority: 'High',
        description: 'Smoke detected from projector power supply in ceiling grid.',
      });
      setSimulatedTicketId(t.id);
      setActiveStep(1);
      addLog(`Ticket #${t.id} dispatched! Priority: High.`);
      addLog(`Event Bridge detected High Priority event! Automatically suspended ${demoRoom.name}.`);
      onRefreshData();
    } catch (err: any) {
      addLog(`Error: ${err.message}`);
    }
  };

  // Step 2: Push Notifications dispatched
  const handleShowNotifications = () => {
    setActiveStep(2);
    addLog(`REQ-4.3 / REQ-5.2: Dispatched FCM push notifications to all overlapping booking holders.`);
  };

  // Step 3: Staff Assigns Ticket
  const handleStaffAssign = async () => {
    if (!simulatedTicketId) return;
    try {
      addLog(`REQ-3.2: Staff technician self-assigning Ticket #${simulatedTicketId}...`);
      await api.assignTicket(simulatedTicketId, 'Technician dispatched with replacement transformer');
      setActiveStep(3);
      addLog(`State changed: Open → Assigned. Facility staff on site.`);
      onRefreshData();
    } catch (err: any) {
      addLog(`Error: ${err.message}`);
    }
  };

  // Step 4: Resolve Ticket & Trigger Auto-Lift
  const handleResolveAndLift = async () => {
    if (!simulatedTicketId) return;
    try {
      addLog(`REQ-3.2 / REQ-4.4: Staff marking Ticket #${simulatedTicketId} as Resolved...`);
      await api.resolveTicket(simulatedTicketId, 'Power supply replaced and thermal testing passed');
      setActiveStep(4);
      addLog(`State changed: Assigned → Resolved.`);
      addLog(`REQ-4.4: Event Bridge checked room active High tickets: None remaining.`);
      addLog(`Event Bridge automatically LIFTED suspension on ${demoRoom.name}! Bookings restored.`);
      onRefreshData();
    } catch (err: any) {
      addLog(`Error: ${err.message}`);
    }
  };

  // Run full automated sequence
  const handleRunFullCycle = async () => {
    setIsRunningAuto(true);
    await handleTriggerHighTicket();
    await new Promise((r) => setTimeout(r, 1800));
    handleShowNotifications();
    await new Promise((r) => setTimeout(r, 1800));
    await handleStaffAssign();
    await new Promise((r) => setTimeout(r, 2000));
    await handleResolveAndLift();
    setIsRunningAuto(false);
  };

  const steps = [
    {
      num: 1,
      title: 'High-Priority Hazard Reported',
      desc: 'User reports high-priority hazard (e.g. electrical fault).',
      req: 'REQ-4.1',
      badge: 'Ticketing Module',
    },
    {
      num: 2,
      title: 'Event Bridge Auto-Suspension',
      desc: 'Event Bridge catches event and immediately sets room is_suspended = true.',
      req: 'REQ-4.1, REQ-4.2',
      badge: 'Event Bridge',
    },
    {
      num: 3,
      title: 'FCM Alerts Dispatched (<30s)',
      desc: 'Users with existing bookings are alerted of temporary suspension.',
      req: 'REQ-4.3, REQ-5.2',
      badge: 'Notification Module',
    },
    {
      num: 4,
      title: 'Staff Assignment & Repair',
      desc: 'Maintenance staff assigns ticket (Open → Assigned) and conducts repairs.',
      req: 'REQ-3.2',
      badge: 'State Machine',
    },
    {
      num: 5,
      title: 'Auto-Release on Resolution',
      desc: 'Ticket marked Resolved. Event Bridge verifies no other High tickets and lifts block.',
      req: 'REQ-4.4',
      badge: 'Event Bridge Release',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Visualizer Hero Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 text-white border border-red-900/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3 text-red-400" />
                The Core UCRMS Innovation · Section 3.4
              </span>
              <span className="text-xs text-slate-400">Zero-Manual Admin Synchronization</span>
            </div>
            <h1 className="text-xl font-bold mt-1.5">Automated Event Bridge Live Engine</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              When a serious maintenance ticket gets raised against a room, UCRMS automatically takes
              that room off the bookable list and informs overlapping booking holders — and lifts the
              suspension once the fix is resolved!
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRunFullCycle}
              disabled={isRunningAuto}
              className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isRunningAuto ? 'Running Pipeline...' : 'Run Full Automated Lifecycle'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Step Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {steps.map((st, idx) => {
          const isDone = activeStep >= st.num;
          const isCurrent = activeStep === st.num - 1;

          return (
            <div
              key={st.num}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isDone
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                  : isCurrent
                  ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-400 dark:border-blue-700 ring-2 ring-blue-400/40'
                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    STEP 0{st.num}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                    {st.req}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {st.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">{st.desc}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-400">{st.badge}</span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Step Controls & Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Step Triggers */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Manual Step-by-Step Triggers
          </h2>

          <div className="space-y-2.5">
            <button
              onClick={handleTriggerHighTicket}
              className="w-full py-2.5 px-3 text-left rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/50 text-xs text-red-900 dark:text-red-300 flex items-center justify-between transition-colors"
            >
              <div>
                <span className="font-bold block">1. File High-Priority Issue</span>
                <span className="text-[10px] text-slate-500">
                  Creates High Ticket on {demoRoom.name}
                </span>
              </div>
              <Flame className="w-4 h-4 text-red-500" />
            </button>

            <button
              onClick={handleShowNotifications}
              disabled={activeStep < 1}
              className="w-full py-2.5 px-3 text-left rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50 text-xs text-blue-900 dark:text-blue-300 flex items-center justify-between transition-colors disabled:opacity-40"
            >
              <div>
                <span className="font-bold block">2. Verify Push Alerts</span>
                <span className="text-[10px] text-slate-500">
                  Simulates FCM push dispatch &lt;30s (REQ-5.2)
                </span>
              </div>
              <Bell className="w-4 h-4 text-blue-500" />
            </button>

            <button
              onClick={handleStaffAssign}
              disabled={activeStep < 1 || !simulatedTicketId}
              className="w-full py-2.5 px-3 text-left rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/50 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between transition-colors disabled:opacity-40"
            >
              <div>
                <span className="font-bold block">3. Staff Assigns (Open → Assigned)</span>
                <span className="text-[10px] text-slate-500">Enforces REQ-3.2 state transition</span>
              </div>
              <Wrench className="w-4 h-4 text-amber-500" />
            </button>

            <button
              onClick={handleResolveAndLift}
              disabled={activeStep < 3 || !simulatedTicketId}
              className="w-full py-2.5 px-3 text-left rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/50 text-xs text-emerald-900 dark:text-emerald-300 flex items-center justify-between transition-colors disabled:opacity-40"
            >
              <div>
                <span className="font-bold block">4. Resolve Ticket &amp; Auto-Release</span>
                <span className="text-[10px] text-slate-500">
                  Event Bridge lifts suspension (REQ-4.4)
                </span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </button>
          </div>

          <button
            onClick={() => {
              setActiveStep(0);
              setSimulatedTicketId(null);
              addLog('Reset visualizer state.');
            }}
            className="w-full py-1.5 text-center text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Timeline</span>
          </button>
        </div>

        {/* Live Facility Status Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Target Facility Real-Time State
          </h2>

          <div
            className={`p-4 rounded-xl border ${
              demoRoom.isSuspended
                ? 'border-red-300 dark:border-red-900 bg-red-50/40 dark:bg-red-950/30'
                : 'border-emerald-300 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{demoRoom.name}</h3>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  demoRoom.isSuspended
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {demoRoom.isSuspended ? 'SUSPENDED' : 'BOOKABLE'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {demoRoom.building} · Cap: {demoRoom.capacity}
            </p>

            {demoRoom.isSuspended ? (
              <div className="mt-3 text-xs text-red-800 dark:text-red-300 space-y-1 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-red-200 dark:border-red-900">
                <div className="font-semibold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Active Suspension Trigger
                </div>
                <div>Ticket: #{demoRoom.activeTicketId}</div>
                <div>Reason: {demoRoom.suspensionReason}</div>
              </div>
            ) : (
              <div className="mt-3 text-xs text-emerald-800 dark:text-emerald-300 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Room is clear and available for student/staff reservations.</span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 space-y-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">
              Multi-Ticket Check (Appendix C):
            </span>
            <span>
              If a second High-priority ticket is filed against the same room, resolving one ticket
              will <strong>NOT</strong> release the room until all active High tickets are resolved!
            </span>
          </div>
        </div>

        {/* Live Event Bus Terminal Log */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 flex flex-col font-mono text-xs text-slate-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Event Bus Dispatcher Log
            </span>
            <span className="text-[10px] text-slate-500">Live Stream</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pt-3 max-h-[300px] text-[11px] leading-relaxed scrollbar-none">
            {logMessages.map((msg, i) => (
              <div
                key={i}
                className={
                  msg.includes('suspended') || msg.includes('High')
                    ? 'text-red-400'
                    : msg.includes('LIFTED') || msg.includes('Resolved')
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }
              >
                {msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
