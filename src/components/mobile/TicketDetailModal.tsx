import React, { useState, useEffect } from 'react';
import { api } from '../../server/api';
import { Ticket, User, TicketStateLog } from '../../types';
import { StateBadge, PriorityBadge } from '../common/Badge';
import {
  X,
  Clock,
  User as UserIcon,
  MapPin,
  CheckCircle,
  Wrench,
  AlertTriangle,
  History,
  ShieldCheck,
} from 'lucide-react';

interface TicketDetailModalProps {
  ticket: Ticket;
  currentUser: User;
  onClose: () => void;
  onUpdated: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  currentUser,
  onClose,
  onUpdated,
}) => {
  const [logs, setLogs] = useState<TicketStateLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionNote, setActionNote] = useState('');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const data = await api.getTicketLogs(ticket.id);
      setLogs(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [ticket.id]);

  const canAssign =
    (currentUser.role === 'Maintenance Staff' || currentUser.role === 'Admin') &&
    ticket.state === 'Open';

  const canResolve =
    (currentUser.role === 'Maintenance Staff' || currentUser.role === 'Admin') &&
    ticket.state === 'Assigned';

  const handleAssign = async () => {
    setErrorBanner(null);
    setIsProcessing(true);
    try {
      await api.assignTicket(ticket.id, actionNote || `Assigned to ${currentUser.name}`);
      await fetchLogs();
      onUpdated();
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to assign ticket');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolve = async () => {
    setErrorBanner(null);
    setIsProcessing(true);
    try {
      await api.resolveTicket(ticket.id, actionNote || 'Work verified and resolved by facility staff.');
      await fetchLogs();
      onUpdated();
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to resolve ticket');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-6 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500">#{ticket.id}</span>
              <StateBadge state={ticket.state} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mt-1">
              {ticket.roomName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {errorBanner && (
          <div className="mx-5 mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorBanner}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Photo attachment if available */}
          {ticket.photoUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <img
                src={ticket.photoUrl}
                alt="Ticket incident"
                className="w-full h-44 object-cover"
              />
            </div>
          )}

          {/* Details Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-slate-500">Category: </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{ticket.category}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5" />
                <span>{ticket.building}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Issue Description:</span>
              <p className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 leading-relaxed">
                {ticket.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-500 block">Reported By:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {ticket.reportedByName} ({ticket.reportedByRole})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Assigned Engineer:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {ticket.assignedToName || 'Unassigned (In Open Queue)'}
                </span>
              </div>
            </div>
          </div>

          {/* Event Bridge Alert Note */}
          {ticket.priority === 'High' && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                Event Bridge Automation Active
              </div>
              <p className="text-[11px] mt-1 leading-relaxed">
                Because this ticket is High priority, room availability is suspended. When resolved, the
                Event Bridge will automatically lift the suspension and notify booking holders (REQ-4.4).
              </p>
            </div>
          )}

          {/* Staff State Machine Action Box */}
          {(canAssign || canResolve) && (
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                Staff State Machine Action (REQ-3.2)
              </h3>
              <input
                type="text"
                placeholder="Optional work notes or dispatch log..."
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
              />

              <div className="flex gap-2">
                {canAssign && (
                  <button
                    type="button"
                    onClick={handleAssign}
                    disabled={isProcessing}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Assign to Me (Open → Assigned)</span>
                  </button>
                )}
                {canResolve && (
                  <button
                    type="button"
                    onClick={handleResolve}
                    disabled={isProcessing}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark Resolved (Assigned → Resolved)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Ticket State History Audit Log (REQ-3.3, REQ-3.4) */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-blue-500" />
              State Machine Audit History (REQ-3.3)
            </h3>
            <div className="space-y-2 border-l-2 border-slate-200 dark:border-slate-700 ml-2 pl-3">
              {logs.map((log) => (
                <div key={log.id} className="text-xs space-y-0.5 relative">
                  <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {log.fromState} → {log.toState}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    By <span className="font-medium">{log.changedByName}</span> ({log.changedByRole})
                  </div>
                  {log.note && (
                    <div className="text-[11px] text-slate-500 italic mt-0.5">
                      "{log.note}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
