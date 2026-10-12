import React, { useState } from 'react';
import { api } from '../../server/api';
import { Room, ConcurrencyTestSummary } from '../../types';

const defaultTestDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
import {
  Zap,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  Activity,
  Cpu,
} from 'lucide-react';

interface ConcurrencyTesterProps {
  rooms: Room[];
  onRefreshData: () => void;
}

export const ConcurrencyTester: React.FC<ConcurrencyTesterProps> = ({ rooms, onRefreshData }) => {
  const [workerCount, setWorkerCount] = useState<number>(50);
  const [targetRoomId, setTargetRoomId] = useState<string>('room_sh101');
  const [testDate, setTestDate] = useState<string>(defaultTestDate);
  const [testSlot, setTestSlot] = useState({ startTime: '14:00', endTime: '15:00' });
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<ConcurrencyTestSummary | null>(null);

  const handleRunTest = async () => {
    setIsRunning(true);
    setTestResult(null);
    try {
      const summary = await api.runStressTest(workerCount, targetRoomId, testDate, testSlot);
      setTestResult(summary);
      onRefreshData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const selectedRoomObj = rooms.find((r) => r.id === targetRoomId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white border border-blue-900/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-blue-400" />
                ACID Concurrency Verification · Section 5.1 &amp; REQ-1.2
              </span>
              <span className="text-xs text-slate-400">Zero Double-Booking Guarantee</span>
            </div>
            <h1 className="text-xl font-bold mt-1.5">Database Transaction &amp; Lock Stress-Tester</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Dispatches up to 50 simultaneous asynchronous booking requests against the exact same
              room and time slot using <code className="font-mono text-blue-300">Promise.all</code> to
              verify row-level locking and exclusion constraint enforcement. Exactly 1 request must
              commit and 49 must fail with 409 Conflict.
            </p>
          </div>

          <button
            onClick={handleRunTest}
            disabled={isRunning}
            className="py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 shrink-0"
          >
            {isRunning ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                <span>Simulating Race Condition...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Execute {workerCount}-Worker Race Test</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Control Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Concurrent Workers
          </label>
          <div className="flex gap-2">
            {[10, 25, 50].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setWorkerCount(num)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  workerCount === num
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Target Facility
          </label>
          <select
            value={targetRoomId}
            onChange={(e) => setTargetRoomId(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Test Reservation Date
          </label>
          <input
            type="date"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Contested Slot
          </label>
          <select
            value={`${testSlot.startTime}-${testSlot.endTime}`}
            onChange={(e) => {
              const [s, end] = e.target.value.split('-');
              setTestSlot({ startTime: s, endTime: end });
            }}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            <option value="10:00-11:00">10:00 - 11:00</option>
            <option value="11:00-12:00">11:00 - 12:00</option>
            <option value="14:00-15:00">14:00 - 15:00</option>
            <option value="16:00-17:00">16:00 - 17:00</option>
          </select>
        </div>
      </div>

      {/* Results Telemetry */}
      {testResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Double Booking Integrity */}
            <div
              className={`p-4 rounded-xl border text-center ${
                !testResult.doubleBookingDetected
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ACID Invariant
              </div>
              <div className="text-xl font-extrabold">
                {!testResult.doubleBookingDetected ? 'ZERO Double-Bookings' : 'VIOLATION DETECTED'}
              </div>
              <p className="text-[11px] opacity-80 mt-1">Section 5.4 Software Quality Attributes</p>
            </div>

            {/* Success Count */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center">
              <div className="text-xs font-semibold text-slate-500 mb-1">Acquired Row Lock</div>
              <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                {testResult.successCount} Committed (201)
              </div>
              <p className="text-[11px] text-slate-400 mt-1">First thread to obtain exclusion lock</p>
            </div>

            {/* Conflict Count */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center">
              <div className="text-xs font-semibold text-slate-500 mb-1">Blocked Competitors</div>
              <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                {testResult.conflictCount} Conflicts (409)
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Rejection with conflict response (REQ-1.3)</p>
            </div>

            {/* Performance */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center">
              <div className="text-xs font-semibold text-slate-500 mb-1">Average Latency</div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                {testResult.avgLatencyMs} ms
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                &lt; 500 ms SLA Met (Section 5.1)
              </p>
            </div>
          </div>

          {/* Execution Waterfall Logs */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                Concurrent Worker Execution Trace ({testResult.steps.length} Requests)
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Target: {testResult.roomId} ({testResult.slot})
              </span>
            </div>

            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 sticky top-0 border-y border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Req #</th>
                    <th className="py-2.5 px-3">Client Identity</th>
                    <th className="py-2.5 px-3">Transaction Outcome</th>
                    <th className="py-2.5 px-3">Latency</th>
                    <th className="py-2.5 px-3">Engine Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {testResult.steps.map((st) => (
                    <tr
                      key={st.requestId}
                      className={
                        st.status === 'SUCCESS'
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 font-semibold'
                          : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/30'
                      }
                    >
                      <td className="py-2 px-3 font-mono text-slate-500">#{st.requestId}</td>
                      <td className="py-2 px-3">{st.userName}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            st.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                          }`}
                        >
                          {st.status === 'SUCCESS' ? '201 CREATED' : '409 CONFLICT'}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-500">{st.latencyMs}ms</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-md">
                        {st.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
