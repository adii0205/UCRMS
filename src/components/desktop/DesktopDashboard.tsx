import React, { useState, useEffect } from 'react';
import { User, Room, Booking, Ticket, TimeSlot } from '../../types';
import { StateBadge, PriorityBadge, BookingBadge } from '../common/Badge';
import { api } from '../../server/api';
import { 
  Building2, 
  Calendar, 
  Wrench, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  X, 
  Filter,
  Check,
  Search,
  Users,
  MapPin,
  ChevronRight,
  Info
} from 'lucide-react';

interface DesktopDashboardProps {
  currentUser: User;
  rooms: Room[];
  bookings: Booking[];
  tickets: Ticket[];
  onRefreshData: () => void;
  initialTab?: 'rooms' | 'bookings' | 'tickets';
  openBookingDirectly?: boolean;
  openTicketDirectly?: boolean;
}

export const DesktopDashboard: React.FC<DesktopDashboardProps> = ({
  currentUser,
  rooms,
  bookings,
  tickets,
  onRefreshData,
  initialTab = 'rooms',
  openBookingDirectly = false,
  openTicketDirectly = false,
}) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'bookings' | 'tickets'>(initialTab);
  
  // Selected Room for detailed schedule & booking modal
  const [isBookModalOpen, setIsBookModalOpen] = useState(openBookingDirectly);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '');
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [purpose, setPurpose] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Live Slot Availability State for Modal & Schedule View
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Ticket Form State
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(openTicketDirectly);
  const [ticketRoomId, setTicketRoomId] = useState<string>(rooms[0]?.id || '');
  const [ticketCategory, setTicketCategory] = useState<'Electrical' | 'Network/IT' | 'Furniture' | 'HVAC/AC' | 'Plumbing' | 'Audio/Visual'>('Electrical');
  const [ticketPriority, setTicketPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [ticketLoading, setTicketLoading] = useState(false);

  // Filter State
  const [roomFilterBuilding, setRoomFilterBuilding] = useState<string>('All');
  const [roomSearchQuery, setRoomSearchQuery] = useState<string>('');
  const [ticketFilterState, setTicketFilterState] = useState<string>('All');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const buildings = ['All', ...Array.from(new Set(rooms.map((r) => r.building)))];

  // Fetch slot availability whenever selected room or date changes in booking dialog
  useEffect(() => {
    if (selectedRoomId && bookingDate) {
      setLoadingSlots(true);
      api.getRoomAvailability(selectedRoomId, bookingDate)
        .then((slots) => setAvailableSlots(slots))
        .catch(() => setAvailableSlots([]))
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedRoomId, bookingDate, bookings]);

  const filteredRooms = rooms.filter((r) => {
    const matchBuilding = roomFilterBuilding === 'All' || r.building === roomFilterBuilding;
    const matchSearch =
      r.name.toLowerCase().includes(roomSearchQuery.toLowerCase()) ||
      r.equipment.some((eq) => eq.toLowerCase().includes(roomSearchQuery.toLowerCase()));
    return matchBuilding && matchSearch;
  });

  // Calculate upcoming reservations for each room to show live reservation count badge
  const getRoomBookingsCount = (roomId: string) => {
    return bookings.filter((b) => b.roomId === roomId && b.status === 'Confirmed').length;
  };

  const userBookings = currentUser.role === 'Student'
    ? bookings.filter((b) => b.userId === currentUser.id)
    : bookings;

  const visibleTickets = currentUser.role === 'Student'
    ? tickets.filter((t) => t.reportedBy === currentUser.id)
    : tickets;

  const filteredTickets = visibleTickets.filter((t) => {
    if (ticketFilterState === 'All') return true;
    return t.state === ticketFilterState;
  });

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setBookingLoading(true);
    try {
      await api.createBooking({
        roomId: selectedRoomId,
        date: bookingDate,
        startTime,
        endTime,
        purpose: purpose || 'Academic session',
      });
      setIsBookModalOpen(false);
      setPurpose('');
      setStatusMessage('Booking reservation successfully confirmed.');
      setTimeout(() => setStatusMessage(null), 4000);
      onRefreshData();
    } catch (err: any) {
      setBookingError(err.message || 'Failed to create booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketError(null);
    setTicketLoading(true);
    try {
      await api.createTicket({
        roomId: ticketRoomId,
        category: ticketCategory,
        priority: ticketPriority,
        description: ticketDesc,
      });
      setIsTicketModalOpen(false);
      setTicketDesc('');
      setStatusMessage('Maintenance ticket reported successfully.');
      setTimeout(() => setStatusMessage(null), 4000);
      onRefreshData();
    } catch (err: any) {
      setTicketError(err.message || 'Failed to submit ticket.');
    } finally {
      setTicketLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.cancelBooking(bookingId, 'User requested cancellation');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel');
    }
  };

  const handleAssignTicket = async (ticketId: string) => {
    try {
      await api.assignTicket(ticketId, `Self-assigned by ${currentUser.name}`);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign ticket');
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    const note = window.prompt('Resolution notes / verification:');
    if (note === null) return;
    try {
      await api.resolveTicket(ticketId, note || 'Resolved by staff');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve ticket');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Message */}
      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-2xs">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Tab Bar & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'rooms'
                ? 'bg-[#4F46E5] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            All Facilities ({rooms.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'bookings'
                ? 'bg-[#4F46E5] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            My Reservations ({userBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'tickets'
                ? 'bg-[#4F46E5] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Maintenance Tickets ({visibleTickets.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedRoomId(rooms[0]?.id || '');
              setIsBookModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>New Reservation</span>
          </button>

          <button
            onClick={() => {
              setTicketRoomId(rooms[0]?.id || '');
              setIsTicketModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 text-xs font-bold rounded-lg shadow-2xs transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-stone-500" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ALL ROOMS & FACILITIES */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border border-stone-200 rounded-xl shadow-2xs">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search facility by name or equipment..."
                value={roomSearchQuery}
                onChange={(e) => setRoomSearchQuery(e.target.value)}
                className="w-full text-xs text-stone-800 placeholder-stone-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-stone-100 pt-2 sm:pt-0 sm:pl-3">
              <span className="text-xs text-stone-500 font-medium">Building:</span>
              <select
                value={roomFilterBuilding}
                onChange={(e) => setRoomFilterBuilding(e.target.value)}
                className="text-xs bg-stone-50 border border-stone-200 rounded-md px-2.5 py-1 text-stone-700 font-medium focus:outline-none"
              >
                {buildings.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Room Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              const bookingCount = getRoomBookingsCount(room.id);
              return (
                <div
                  key={room.id}
                  className={`bg-white border rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:shadow-md ${
                    room.isSuspended ? 'border-red-200 ring-1 ring-red-100' : 'border-stone-200'
                  }`}
                >
                  <div>
                    {/* Facility Image with Dynamic Operational Badges */}
                    <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                      <img
                        src={room.imageUrl || '/images/Acad1.jpeg'}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Top Status Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        {/* Reservation Indicator */}
                        {bookingCount > 0 ? (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-600/90 text-white backdrop-blur-xs shadow-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {bookingCount} {bookingCount === 1 ? 'Slot Reserved' : 'Slots Reserved'}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-stone-900/80 text-white backdrop-blur-xs">
                            No Active Bookings
                          </span>
                        )}

                        {/* Operational State Badge */}
                        {room.isSuspended ? (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-600 text-white shadow-xs flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Suspended
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                            Facility Active
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-stone-900 tracking-tight leading-tight">
                          {room.name}
                        </h3>
                      </div>

                      <div className="text-xs text-stone-500 mt-1 flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{room.building} · {room.floor}</span>
                        <span>·</span>
                        <Users className="w-3 h-3 text-stone-400" />
                        <span>Cap: {room.capacity}</span>
                      </div>

                      {room.isSuspended && (
                        <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 leading-snug">
                          <strong>Safety Lock:</strong> {room.suspensionReason}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {room.equipment.map((item, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-[11px] bg-stone-100 text-stone-600 rounded-md border border-stone-200 font-medium"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Controls */}
                  <div className="p-4 pt-3 border-t border-stone-100 flex items-center justify-between bg-stone-50/60">
                    <button
                      onClick={() => {
                        setTicketRoomId(room.id);
                        setIsTicketModalOpen(true);
                      }}
                      className="text-xs text-stone-500 hover:text-stone-800 font-medium"
                    >
                      Report Issue
                    </button>
                    <button
                      disabled={room.isSuspended}
                      onClick={() => {
                        setSelectedRoomId(room.id);
                        setIsBookModalOpen(true);
                      }}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        room.isSuspended
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          : 'bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-2xs'
                      }`}
                    >
                      Reserve / View Slots
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: BOOKINGS VIEW */}
      {activeTab === 'bookings' && (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="px-5 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                {currentUser.role === 'Student' ? 'My Confirmed Reservations' : 'All Campus Reservations'}
              </span>
              <span className="text-[11px] text-stone-500 font-normal">
                ACID Concurrency Exclusion Enforced: Double-booking forbidden across all users
              </span>
            </div>
            <span className="text-xs text-stone-500 font-mono font-semibold">
              {userBookings.length} bookings
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Facility</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Reserved By</th>
                  <th className="py-3 px-4">Purpose / Agenda</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {userBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-stone-400">
                      No reservations recorded. Click 'New Reservation' to schedule a facility.
                    </td>
                  </tr>
                ) : (
                  userBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-stone-50/50">
                      <td className="py-3 px-4 font-bold text-stone-900">{b.roomName}</td>
                      <td className="py-3 px-4 font-mono font-medium">{b.date}</td>
                      <td className="py-3 px-4 font-mono font-medium">{b.startTime} - {b.endTime}</td>
                      <td className="py-3 px-4 text-stone-600 font-medium">{b.userName}</td>
                      <td className="py-3 px-4 max-w-xs truncate text-stone-600">{b.purpose}</td>
                      <td className="py-3 px-4">
                        <BookingBadge status={b.status} isSuspendedByEB={b.suspendedByEventBridge} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {b.status === 'Confirmed' && (
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            className="text-xs text-red-600 hover:text-red-800 font-bold"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TICKETS VIEW */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-white p-3 border border-stone-200 rounded-xl shadow-2xs">
            <span className="text-xs text-stone-500 font-medium">Filter Status:</span>
            <select
              value={ticketFilterState}
              onChange={(e) => setTicketFilterState(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-md px-2.5 py-1 text-stone-700 font-medium focus:outline-none"
            >
              {['All', 'Open', 'Assigned', 'Resolved'].map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Venue</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Staff</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Workflow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-stone-400">
                        No work orders matching this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((t) => (
                      <tr key={t.id} className="hover:bg-stone-50/50">
                        <td className="py-3 px-4 font-mono text-stone-400 font-bold">{t.id}</td>
                        <td className="py-3 px-4 font-bold text-stone-900">{t.roomName}</td>
                        <td className="py-3 px-4 text-stone-600 font-medium">{t.category}</td>
                        <td className="py-3 px-4">
                          <PriorityBadge priority={t.priority} />
                        </td>
                        <td className="py-3 px-4">
                          <StateBadge state={t.state} />
                        </td>
                        <td className="py-3 px-4 text-stone-600 font-medium">{t.assignedToName || '—'}</td>
                        <td className="py-3 px-4 max-w-sm truncate text-stone-600">{t.description}</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {currentUser.role !== 'Student' && t.state === 'Open' && (
                            <button
                              onClick={() => handleAssignTicket(t.id)}
                              className="text-xs text-[#4F46E5] hover:underline font-bold"
                            >
                              Assign Self
                            </button>
                          )}
                          {currentUser.role !== 'Student' && t.state === 'Assigned' && (
                            <button
                              onClick={() => handleResolveTicket(t.id)}
                              className="text-xs text-emerald-700 hover:underline font-bold"
                            >
                              Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL WITH LIVE SLOT SCHEDULE VISUALIZATION */}
      {isBookModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">Schedule Facility Reservation</h3>
                <p className="text-xs text-stone-500">Atomic concurrency mutex locking enforced on all slots</p>
              </div>
              <button onClick={() => setIsBookModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingError && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs font-semibold text-red-800 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Target Facility</label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id} disabled={r.isSuspended}>
                        {r.name} {r.isSuspended ? '(Suspended)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Reservation Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                    required
                  />
                </div>
              </div>

              {/* LIVE SLOT AVAILABILITY GRID FOR CHOSEN DATE */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800">
                    Live Slot Schedule for {bookingDate}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {loadingSlots ? 'Querying database...' : 'Click any green slot to autofill'}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-1">
                  {availableSlots.map((slot) => {
                    const isSelected = startTime === slot.startTime && endTime === slot.endTime;
                    return (
                      <button
                        key={slot.startTime}
                        type="button"
                        disabled={slot.isBooked || slot.isSuspended}
                        onClick={() => {
                          setStartTime(slot.startTime);
                          setEndTime(slot.endTime);
                        }}
                        className={`p-1.5 rounded-lg border text-center transition-all ${
                          slot.isBooked
                            ? 'bg-red-50 border-red-200 text-red-700 cursor-not-allowed opacity-80'
                            : isSelected
                            ? 'bg-[#4F46E5] border-[#4F46E5] text-white font-bold shadow-xs'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-semibold'
                        }`}
                      >
                        <div className="text-[11px] font-mono leading-none">
                          {slot.startTime} - {slot.endTime}
                        </div>
                        <div className="text-[9px] uppercase tracking-wider mt-1 font-bold">
                          {slot.isBooked ? 'Booked' : isSelected ? 'Selected' : 'Open'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Range Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Purpose / Session Subject</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Distributed Systems Lab Seminar"
                  className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold shadow-xs transition-colors disabled:opacity-50"
                >
                  {bookingLoading ? 'Enforcing Mutex Lock...' : 'Confirm Atomic Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT ISSUE MODAL */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">Report Campus Incident</h3>
                <p className="text-xs text-stone-500">Notifies facilities staff &amp; initiates work order</p>
              </div>
              <button onClick={() => setIsTicketModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {ticketError && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs font-semibold text-red-800 rounded-lg">
                {ticketError}
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Affected Facility</label>
                <select
                  value={ticketRoomId}
                  onChange={(e) => setTicketRoomId(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Category</label>
                  <select
                    value={ticketCategory}
                    onChange={(e: any) => setTicketCategory(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Network/IT">Network/IT</option>
                    <option value="Furniture">Furniture</option>
                    <option value="HVAC/AC">HVAC/AC</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Audio/Visual">Audio/Visual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Priority</label>
                  <select
                    value={ticketPriority}
                    onChange={(e: any) => setTicketPriority(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High (Automated Venue Lock)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Fault Description</label>
                <textarea
                  rows={3}
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  placeholder="Detail the issue accurately for maintenance staff..."
                  className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ticketLoading}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-bold shadow-xs transition-colors disabled:opacity-50"
                >
                  {ticketLoading ? 'Submitting Work Order...' : 'Dispatch Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
