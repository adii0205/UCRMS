import React, { useState, useEffect } from 'react';
import { api, ApiCallLog } from '../../server/api';
import { User, Room } from '../../types';
import { RoleBadge } from '../common/Badge';
import {
  Terminal,
  Send,
  CheckCircle,
  AlertTriangle,
  Clock,
  Trash2,
  Copy,
  Check,
  Code2,
  Globe,
} from 'lucide-react';

const dateOffset = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

interface ApiExplorerProps {
  currentUser: User;
  rooms: Room[];
  onRefreshData: () => void;
}

export const ApiExplorer: React.FC<ApiExplorerProps> = ({ currentUser, rooms, onRefreshData }) => {
  const [trafficLogs, setTrafficLogs] = useState<ApiCallLog[]>(api.getTrafficLogs());
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('GET /rooms/{id}/availability');
  const [requestPayload, setRequestPayload] = useState<string>(
    JSON.stringify({ date: dateOffset(0) }, null, 2)
  );
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResponse, setExecutionResponse] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = api.subscribe(() => {
      setTrafficLogs(api.getTrafficLogs());
    });
    return unsub;
  }, []);

  const endpoints = [
    {
      method: 'GET',
      path: '/rooms/{id}/availability',
      access: 'Student, Staff, Admin',
      defaultPayload: { date: dateOffset(0) },
      targetId: rooms[0]?.id || 'room_sh101',
    },
    {
      method: 'POST',
      path: '/bookings',
      access: 'Student, Staff, Admin',
      defaultPayload: {
        roomId: rooms[0]?.id || 'room_sh101',
        date: dateOffset(2),
        startTime: '10:00',
        endTime: '11:00',
        purpose: 'REST API Interactive Booking Test',
      },
    },
    {
      method: 'POST',
      path: '/tickets',
      access: 'Student, Staff, Admin',
      defaultPayload: {
        roomId: rooms[0]?.id || 'room_sh101',
        category: 'Network/IT',
        priority: 'High',
        description: 'Core fiber switch port flapping in server closet.',
      },
    },
    {
      method: 'PATCH',
      path: '/tickets/{id}/assign',
      access: 'Maintenance Staff, Admin',
      defaultPayload: { note: 'Self-assigned via REST endpoint test' },
      targetId: 'tkt_001',
    },
    {
      method: 'PATCH',
      path: '/tickets/{id}/resolve',
      access: 'Maintenance Staff, Admin',
      defaultPayload: { note: 'Hardware replaced and tested via API' },
      targetId: 'tkt_002',
    },
    {
      method: 'POST',
      path: '/rooms/{id}/override-suspension',
      access: 'Admin Only',
      defaultPayload: {
        justification: 'Emergency REST API administrative suspension clearance',
      },
      targetId: 'room_lab3',
    },
  ];

  const handleSelectEndpoint = (ep: (typeof endpoints)[0]) => {
    setSelectedEndpoint(`${ep.method} ${ep.path}`);
    setRequestPayload(JSON.stringify(ep.defaultPayload, null, 2));
    setExecutionResponse(null);
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecutionResponse(null);
    try {
      const parsed = requestPayload ? JSON.parse(requestPayload) : {};
      let res: any;

      if (selectedEndpoint.includes('/availability')) {
        res = await api.getRoomAvailability(rooms[0]?.id || 'room_sh101', parsed.date || dateOffset(0));
      } else if (selectedEndpoint.includes('/bookings') && selectedEndpoint.startsWith('POST')) {
        res = await api.createBooking(parsed);
      } else if (selectedEndpoint.includes('/tickets') && selectedEndpoint.startsWith('POST')) {
        res = await api.createTicket(parsed);
      } else if (selectedEndpoint.includes('/assign')) {
        res = await api.assignTicket('tkt_001', parsed.note);
      } else if (selectedEndpoint.includes('/resolve')) {
        res = await api.resolveTicket('tkt_002', parsed.note);
      } else if (selectedEndpoint.includes('/override-suspension')) {
        res = await api.overrideSuspension('room_lab3', parsed.justification);
      }

      setExecutionResponse({ status: 200, data: res });
      onRefreshData();
    } catch (err: any) {
      setExecutionResponse({ error: err.message });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white border border-slate-700 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-400" />
                OpenAPI Specification &amp; REST Layer · Section 5.1
              </span>
              <span className="text-xs text-slate-400">JSON-over-HTTPS · Bearer JWT</span>
            </div>
            <h1 className="text-xl font-bold mt-1.5">REST API Explorer &amp; Live Traffic Log</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Every action in the native client maps directly onto the backend REST endpoints
              documented in Section 5.1. Execute calls live and inspect headers, payload schema, and
              cURL snippets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Current Auth Token:</span>
            <RoleBadge role={currentUser.role} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Endpoint Runner (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Select REST Endpoint (Section 5.1)
            </h2>

            <div className="space-y-1.5">
              {endpoints.map((ep) => {
                const epKey = `${ep.method} ${ep.path}`;
                const isSelected = selectedEndpoint === epKey;

                return (
                  <button
                    key={epKey}
                    type="button"
                    onClick={() => handleSelectEndpoint(ep)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-2xs font-semibold'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          ep.method === 'GET'
                            ? 'bg-blue-100 text-blue-800'
                            : ep.method === 'POST'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ep.method === 'PATCH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 truncate">
                        {ep.path}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{ep.access}</span>
                  </button>
                );
              })}
            </div>

            {/* Request Payload Editor */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                JSON Request Body
              </label>
              <textarea
                rows={5}
                value={requestPayload}
                onChange={(e) => setRequestPayload(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-slate-950 text-emerald-400 rounded-xl border border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isExecuting ? 'Dispatching HTTPS Request...' : 'Send Request'}</span>
            </button>

            {/* Response Preview */}
            {executionResponse && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
                <div className="text-[10px] text-slate-500 mb-1 flex items-center justify-between">
                  <span>Response</span>
                  <span
                    className={
                      executionResponse.error ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'
                    }
                  >
                    {executionResponse.error ? 'HTTP 4xx/5xx' : 'HTTP 200 OK'}
                  </span>
                </div>
                <pre className="text-slate-300 overflow-x-auto max-h-36 scrollbar-none text-[11px]">
                  {JSON.stringify(executionResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Traffic Log & cURL Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-blue-500" />
                Live HTTP Network Traffic ({trafficLogs.length})
              </h2>
              <button
                onClick={() => api.clearTrafficLogs()}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {trafficLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No network requests recorded yet. Make a call on the left or use the mobile app!
                </div>
              ) : (
                trafficLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 text-xs space-y-2 font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.statusCode >= 200 && log.statusCode < 300
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}
                        >
                          {log.statusCode}
                        </span>
                        <span className="font-bold text-white">{log.method}</span>
                        <span className="text-slate-400">{log.endpoint}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span>{log.durationMs}ms</span>
                        <span>·</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {/* cURL Snippet */}
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-400 relative group">
                      <pre className="overflow-x-auto whitespace-pre-wrap">{log.curlCommand}</pre>
                      <button
                        onClick={() => handleCopy(log.curlCommand, log.id)}
                        className="absolute top-1.5 right-1.5 p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                        title="Copy cURL"
                      >
                        {copiedId === log.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Response body */}
                    {log.responseBody !== undefined && log.responseBody !== null && (
                      <div className="text-[10px] text-slate-500">
                        <span>Response Body: </span>
                        <span className="text-slate-400">
                          {String(JSON.stringify(log.responseBody)).slice(0, 120)}...
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
