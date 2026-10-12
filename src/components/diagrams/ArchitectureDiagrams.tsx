import React, { useState } from 'react';
import { Database, GitFork, ArrowRight, ShieldCheck, XCircle, CheckCircle, Layers } from 'lucide-react';

export const ArchitectureDiagrams: React.FC = () => {
  const [selectedDiagram, setSelectedDiagram] = useState<'erd' | 'stateMachine' | 'sequence'>('erd');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Appendix B: Analysis Models &amp; Architecture
              </span>
              <span className="text-xs text-slate-400">IIIT Pune SE Lab Specification</span>
            </div>
            <h1 className="text-xl font-bold mt-1.5">System Architecture &amp; UML Diagrams</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Interactive architectural diagrams matching Appendix B: Relational Entity-Relationship
              Model, Ticket State-Machine Lifecycle, and Event Bridge Synchronization Sequence Flow.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDiagram('erd')}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                selectedDiagram === 'erd'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Figure 2: ER Diagram
            </button>
            <button
              onClick={() => setSelectedDiagram('stateMachine')}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                selectedDiagram === 'stateMachine'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Figure 3: State Machine
            </button>
            <button
              onClick={() => setSelectedDiagram('sequence')}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                selectedDiagram === 'sequence'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Sequence: Event Bridge
            </button>
          </div>
        </div>
      </div>

      {/* DIAGRAM 1: ER DIAGRAM (Figure 2 & Section 3.1) */}
      {selectedDiagram === 'erd' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Figure 2: Entity-Relationship Diagram for UCRMS
              </h2>
              <p className="text-xs text-slate-500">
                Relational schema centered on 5 primary tables + append-only Ticket State Log
              </p>
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
              PostgreSQL Relational Schema
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Table: roles */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-4 space-y-2 text-xs">
              <div className="font-bold text-purple-700 dark:text-purple-300 border-b border-slate-200 dark:border-slate-700 pb-1 flex items-center justify-between">
                <span>roles</span>
                <span className="text-[10px] text-slate-400">Master Data</span>
              </div>
              <ul className="space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                <li className="font-semibold text-amber-600 dark:text-amber-400">🔑 role_id (PK)</li>
                <li>role_name (VARCHAR)</li>
              </ul>
              <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                Seeded with 3 rows: Student, Maintenance Staff, Admin
              </p>
            </div>

            {/* Table: users */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-4 space-y-2 text-xs">
              <div className="font-bold text-blue-700 dark:text-blue-300 border-b border-slate-200 dark:border-slate-700 pb-1 flex items-center justify-between">
                <span>users</span>
                <span className="text-[10px] text-slate-400">Primary Entity</span>
              </div>
              <ul className="space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                <li className="font-semibold text-amber-600 dark:text-amber-400">🔑 user_id (PK)</li>
                <li>name (VARCHAR)</li>
                <li>email (UNIQUE)</li>
                <li>password_hash (bcrypt)</li>
                <li className="text-indigo-600 dark:text-indigo-400">🔗 role_id (FK → roles)</li>
              </ul>
            </div>

            {/* Table: rooms */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-4 space-y-2 text-xs">
              <div className="font-bold text-emerald-700 dark:text-emerald-300 border-b border-slate-200 dark:border-slate-700 pb-1 flex items-center justify-between">
                <span>rooms</span>
                <span className="text-[10px] text-slate-400">Resource Pool</span>
              </div>
              <ul className="space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                <li className="font-semibold text-amber-600 dark:text-amber-400">🔑 room_id (PK)</li>
                <li>room_name (VARCHAR)</li>
                <li>building (VARCHAR)</li>
                <li>capacity (INT)</li>
                <li className="text-red-600 font-bold">⚡ is_suspended (BOOLEAN)</li>
              </ul>
              <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                Flipped by Event Bridge; indexed for fast availability lookups
              </p>
            </div>

            {/* Table: bookings */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-4 space-y-2 text-xs">
              <div className="font-bold text-blue-700 dark:text-blue-300 border-b border-slate-200 dark:border-slate-700 pb-1 flex items-center justify-between">
                <span>bookings</span>
                <span className="text-[10px] text-slate-400">Concurrency Guard</span>
              </div>
              <ul className="space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                <li className="font-semibold text-amber-600 dark:text-amber-400">🔑 booking_id (PK)</li>
                <li className="text-emerald-600 dark:text-emerald-400">🔗 room_id (FK → rooms)</li>
                <li className="text-blue-600 dark:text-blue-400">🔗 user_id (FK → users)</li>
                <li>start_time (TIMESTAMP)</li>
                <li>end_time (TIMESTAMP)</li>
                <li>status (Confirmed / Suspended)</li>
              </ul>
              <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                Exclusion constraint on (room_id, time range) enforces no-overlap at DB level (REQ-1.2)
              </p>
            </div>

            {/* Table: tickets */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-4 space-y-2 text-xs">
              <div className="font-bold text-red-700 dark:text-red-300 border-b border-slate-200 dark:border-slate-700 pb-1 flex items-center justify-between">
                <span>tickets</span>
                <span className="text-[10px] text-slate-400">Event Source</span>
              </div>
              <ul className="space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                <li className="font-semibold text-amber-600 dark:text-amber-400">🔑 ticket_id (PK)</li>
                <li className="text-emerald-600 dark:text-emerald-400">🔗 room_id (FK → rooms)</li>
                <li className="text-blue-600 dark:text-blue-400">🔗 reported_by (FK → users)</li>
                <li className="text-blue-600 dark:text-blue-400">🔗 assigned_to (FK, nullable)</li>
                <li>priority (Low / Med / High)</li>
                <li>state (Open / Assigned / Resolved)</li>
              </ul>
            </div>

            {/* Table: ticket_state_log */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-4 space-y-2 text-xs">
              <div className="font-bold text-indigo-700 dark:text-indigo-300 border-b border-slate-200 dark:border-slate-700 pb-1 flex items-center justify-between">
                <span>ticket_state_log</span>
                <span className="text-[10px] text-slate-400">Audit Trail</span>
              </div>
              <ul className="space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                <li className="font-semibold text-amber-600 dark:text-amber-400">🔑 log_id (PK)</li>
                <li className="text-red-600 dark:text-red-400">🔗 ticket_id (FK → tickets)</li>
                <li>from_state (VARCHAR)</li>
                <li>to_state (VARCHAR)</li>
                <li className="text-blue-600 dark:text-blue-400">🔗 changed_by (FK → users)</li>
                <li>changed_at (TIMESTAMP)</li>
              </ul>
              <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                Append-only log for REQ-3.3 compliance &amp; admin override logging (REQ-4.5)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DIAGRAM 2: STATE MACHINE (Figure 3 & REQ-3.2) */}
      {selectedDiagram === 'stateMachine' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Figure 3: Ticket State-Transition Diagram
              </h2>
              <p className="text-xs text-slate-500">
                Enforced in the Ticketing Service Layer rather than client-side (REQ-3.2)
              </p>
            </div>
            <span className="text-xs text-amber-600 font-semibold">Strict Monotonic Order</span>
          </div>

          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-around gap-6 text-center">
            {/* State: Open */}
            <div className="p-5 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-400 text-amber-900 dark:text-amber-200 w-44 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block mb-1">
                State 1
              </span>
              <div className="text-base font-extrabold">Open</div>
              <p className="text-[10px] mt-1 text-slate-500">Initial creation by any student/staff</p>
            </div>

            {/* Transition 1 */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-1">
                assign_ticket()
              </span>
              <div className="flex items-center gap-1 text-emerald-600 font-mono text-xs">
                <span>[Allowed]</span>
                <ArrowRight className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1">Staff self-assigns</span>
            </div>

            {/* State: Assigned */}
            <div className="p-5 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 border-2 border-indigo-400 text-indigo-900 dark:text-indigo-200 w-44 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400 block mb-1">
                State 2
              </span>
              <div className="text-base font-extrabold">Assigned</div>
              <p className="text-[10px] mt-1 text-slate-500">Technician dispatched on-site</p>
            </div>

            {/* Transition 2 */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                resolve_ticket()
              </span>
              <div className="flex items-center gap-1 text-emerald-600 font-mono text-xs">
                <span>[Allowed]</span>
                <ArrowRight className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1">Work verified fixed</span>
            </div>

            {/* State: Resolved */}
            <div className="p-5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-400 text-emerald-900 dark:text-emerald-200 w-44 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                State 3 (Terminal)
              </span>
              <div className="text-base font-extrabold">Resolved</div>
              <p className="text-[10px] mt-1 text-slate-500">Triggers Event Bridge release</p>
            </div>
          </div>

          {/* Barred Transitions */}
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 space-y-2 text-xs">
            <h4 className="font-bold text-red-900 dark:text-red-300 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-red-600" />
              Explicitly Disallowed Transitions (REQ-3.2 Enforcement)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-red-800 dark:text-red-300 text-[11px]">
              <div>
                <strong>🚫 Open → Resolved (Direct skip barred): </strong>
                Attempting to mark an Open ticket as Resolved without prior assignment throws{' '}
                <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded">400 Bad Request</code>.
              </div>
              <div>
                <strong>🚫 Resolved → Open / Assigned (Reversion barred): </strong>
                Once marked Resolved, tickets cannot be un-resolved without submitting a fresh ticket.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIAGRAM 3: SEQUENCE FLOW */}
      {selectedDiagram === 'sequence' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Sequence Diagram: Automated Event Bridge Lifecycle
              </h2>
              <p className="text-xs text-slate-500">
                Zero-friction synchronization between Ticketing, Event Bridge, Booking Engine &amp; Push Service
              </p>
            </div>
            <span className="text-xs text-purple-600 font-semibold">UML Interaction Diagram</span>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[700px] p-6 bg-slate-950 rounded-2xl font-mono text-xs text-slate-300 space-y-3 border border-slate-800">
              <div className="flex justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-500">
                <span className="w-28 text-center text-blue-400 font-bold">Reporter</span>
                <span className="w-28 text-center text-purple-400 font-bold">Ticketing API</span>
                <span className="w-28 text-center text-red-400 font-bold">Event Bridge</span>
                <span className="w-28 text-center text-amber-400 font-bold">Booking Engine</span>
                <span className="w-28 text-center text-emerald-400 font-bold">FCM Push Svc</span>
              </div>

              {/* Seq step 1 */}
              <div className="space-y-1 text-[11px]">
                <div className="text-blue-300">
                  1. POST /tickets (roomId: 'sh101', priority: 'High') ───────────────────────&gt; [Ticketing API]
                </div>
                <div className="text-purple-300 pl-28">
                  2. Ticket persisted; on_ticket_high_priority event emitted ──────────────────&gt; [Event Bridge]
                </div>
                <div className="text-red-300 pl-56">
                  3. Event Bridge commands: suspend_room('sh101') ────────────────────────────&gt; [Booking Engine]
                </div>
                <div className="text-amber-300 pl-80">
                  4. room.is_suspended = true; queries active bookings ──────────────────────&gt; [Database]
                </div>
                <div className="text-emerald-300 pl-80">
                  5. Overlapping bookings flagged; notify_affected_users() ──────────────────&gt; [FCM Push Svc]
                </div>
                <div className="text-slate-400 pl-96">
                  6. Push delivered to affected mobile client (&lt;30s SLA met) ───────────────&gt; [User Phone]
                </div>
              </div>

              <div className="border-t border-slate-800 my-2 pt-2 text-[11px] text-slate-500">
                --- Maintenance Work Phase: Open → Assigned → Resolved ---
              </div>

              {/* Seq step 2 */}
              <div className="space-y-1 text-[11px]">
                <div className="text-indigo-300">
                  7. PATCH /tickets/101/resolve (note: 'Fixed') ─────────────────────────────&gt; [Ticketing API]
                </div>
                <div className="text-purple-300 pl-28">
                  8. Ticket marked Resolved; on_ticket_resolved event emitted ───────────────&gt; [Event Bridge]
                </div>
                <div className="text-red-300 pl-56">
                  9. Multi-Ticket Check: Query other active High tickets for 'sh101' ─────────&gt; [Database]
                </div>
                <div className="text-emerald-300 pl-56">
                  10. [Count == 0] Auto-Release: release_room('sh101') ────────────────────────&gt; [Booking Engine]
                </div>
                <div className="text-emerald-300 pl-80">
                  11. room.is_suspended = false; notify users of restored availability ──────&gt; [FCM Push Svc]
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
