import React, { useState } from 'react';
import { api } from '../../server/api';
import { Room, ConcurrencyTestSummary } from '../../types';
import { Play, CheckCircle2, AlertOctagon, Clock } from 'lucide-react';

export const ConcurrencyTester: React.FC<{ rooms: Room[]; onRefreshData: () => void }> = ({
  rooms,
  onRefreshData,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '');
  const [requestCount, setRequestCount] = useState<number>(20);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState<ConcurrencyTestSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const testDate = tomorrow.toISOString().split('T')[0];

  const handleRunTest = async () => {
    setIsRunning(true);
    setError(null);
    setSummary(null);

    try {
      const result = await api.runStressTest(
        requestCount,
        selectedRoomId,
        testDate,
        { startTime: '11:00', endTime: '12:00' },
      );
      setSummary(result);
      onRefreshData();
    } catch (err: any) {
      setError(err.message || 'Error executing concurrency test');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="bg-white border border-stone-200 rounded p-6">
        <h2 className="text-base font-semibold text-stone-900">Live Concurrency &amp; Row Lock Verification</h2>
        <p className="text-xs text-stone-500 mt-1">
          Fires concurrent requests against your actual backend to confirm that exactly 1 booking succeeds (201 Created) and competing requests receive 409 Conflict.
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl text-xs">
          <div>
            <label className="block text-stone-600 font-medium mb-1">Target Facility</label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 text-stone-800 focus:outline-none"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-stone-600 font-medium mb-1">Concurrent Workers</label>
            <select
              value={requestCount}
              onChange={(e) => setRequestCount(Number(e.target.value))}
              className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 text-stone-800 focus:outline-none"
            >
              <option value={10}>10 simultaneous requests</option>
              <option value={20}>20 simultaneous requests</option>
              <option value={50}>50 simultaneous requests</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunTest}
              disabled={isRunning}
              className="w-full py-1.5 px-3 bg-stone-800 hover:bg-stone-700 text-stone-50 rounded font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? 'Executing...' : 'Fire Concurrent Test'}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 rounded">
          {error}
        </div>
      )}

      {/* Summary Metrics */}
      {summary && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-stone-200 rounded">
              <div className="text-xs text-stone-500 uppercase">Total Workers</div>
              <div className="text-2xl font-semibold text-stone-900 mt-1">{summary.totalRequests}</div>
            </div>
            <div className="p-4 bg-white border border-stone-200 rounded">
              <div className="text-xs text-stone-500 uppercase">Accepted (201)</div>
              <div className="text-2xl font-semibold text-emerald-700 mt-1">{summary.successCount}</div>
            </div>
            <div className="p-4 bg-white border border-stone-200 rounded">
              <div className="text-xs text-stone-500 uppercase">Rejected (409)</div>
              <div className="text-2xl font-semibold text-stone-700 mt-1">{summary.conflictCount}</div>
            </div>
            <div className="p-4 bg-white border border-stone-200 rounded">
              <div className="text-xs text-stone-500 uppercase">Double-Booking</div>
              <div className="text-2xl font-semibold mt-1">
                {summary.doubleBookingDetected ? (
                  <span className="text-red-700">DETECTED</span>
                ) : (
                  <span className="text-emerald-700">None (Safe)</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-200 font-medium text-xs text-stone-700 bg-stone-50">
              Transaction Resolution Order
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase">
                  <tr>
                    <th className="py-2 px-3 font-sans">#</th>
                    <th className="py-2 px-3 font-sans">Worker</th>
                    <th className="py-2 px-3 font-sans">Status</th>
                    <th className="py-2 px-3 font-sans">Latency</th>
                    <th className="py-2 px-3 font-sans">Result Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {summary.steps.map((step) => (
                    <tr key={step.requestId} className="hover:bg-stone-50/50">
                      <td className="py-2 px-3 text-stone-400">{step.requestId}</td>
                      <td className="py-2 px-3 font-sans text-stone-800">{step.userName}</td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          step.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}>
                          {step.status}
                        </span>
                      </td>
                      <td className="py-2 px-3">{step.latencyMs} ms</td>
                      <td className="py-2 px-3 font-sans text-stone-600 truncate max-w-sm">{step.message}</td>
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
