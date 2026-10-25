import React from 'react';
import { Room, Booking, Ticket, User } from '../../types';
import {
  Calendar,
  Wrench,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  BookOpen,
  Building2
} from 'lucide-react';

interface PortalHomeProps {
  currentUser: User;
  rooms: Room[];
  bookings: Booking[];
  tickets: Ticket[];
  onNavigate: (view: 'dashboard' | 'concurrency' | 'jmeter' | 'admin') => void;
  onOpenBooking: () => void;
  onOpenTicket: () => void;
}

export const PortalHome: React.FC<PortalHomeProps> = ({
  currentUser,
  rooms,
  bookings,
  tickets,
  onNavigate,
  onOpenBooking,
  onOpenTicket,
}) => {
  const activeBookingsCount = bookings.filter((b) => b.status === 'Confirmed').length;
  const activeTicketsCount = tickets.filter((t) => t.state !== 'Resolved').length;

  const quickLinks = [
    {
      title: 'Facility Reservations',
      description: 'Book lecture halls, computer labs, conference rooms, and athletic grounds with instant availability.',
      icon: Calendar,
      action: () => onNavigate('dashboard'),
      accentColor: 'text-[#4F46E5] bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Maintenance & Work Orders',
      description: 'Report hardware faults, electrical issues, or network downtime with automated status tracking.',
      icon: Wrench,
      action: () => onNavigate('dashboard'),
      accentColor: 'text-amber-700 bg-amber-50 border-amber-100',
    },
    {
      title: 'Concurrency Engine',
      description: 'Stress-test database mutex locking with 50 simultaneous workers ensuring zero double-bookings.',
      icon: Cpu,
      action: () => onNavigate('concurrency'),
      accentColor: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    },
    {
      title: 'JMeter Load Testing',
      description: 'Download the official test plan and upload authentic JMeter execution traces for performance proof.',
      icon: Layers,
      action: () => onNavigate('jmeter'),
      accentColor: 'text-blue-700 bg-blue-50 border-blue-100',
    },
    {
      title: 'Central Library & Reading',
      description: 'Check seat capacity, study cubicles, and quiet hours at the campus library.',
      icon: BookOpen,
      action: () => onNavigate('dashboard'),
      accentColor: 'text-stone-700 bg-stone-100 border-stone-200',
    },
    {
      title: 'EventBridge Safety Shield',
      description: 'Automatic room locking on critical safety alerts to protect campus occupants.',
      icon: ShieldCheck,
      action: () => onNavigate('dashboard'),
      accentColor: 'text-rose-700 bg-rose-50 border-rose-100',
    },
  ];

  const featuredFacilities = rooms.slice(0, 4);

  return (
    <div className="space-y-16 pb-12">
      {/* HERO SECTION WITH BRIGHT & CLEAR CAMPUS PHOTO */}
      <section className="relative overflow-hidden rounded-3xl border border-stone-200 shadow-sm bg-stone-900 text-white min-h-[460px] flex items-center">
        {/* Bright Campus Background Photo (Removed dark black opacity) */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/Acad6.jpeg"
            alt="IIIT Pune Academic Campus Panorama"
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle semi-transparent gradient on the left only for text legibility while keeping the campus landscape bright & clear */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-900/60 to-transparent" />
        </div>

        <div className="relative z-10 px-6 py-14 sm:px-12 sm:py-16 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-md mb-4 shadow-xs">
            <Building2 className="w-4 h-4 text-indigo-200" />
            <span>Unified Campus Resource &amp; Maintenance System</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
            Empowering Campus Ambitions Through Seamless Infrastructure
          </h1>

          <p className="mt-4 text-base sm:text-lg text-stone-100 leading-relaxed font-normal drop-shadow-xs">
            Indian Institute of Information Technology Pune portal for academic room booking, state-of-the-art laboratory scheduling, work order dispatch, and concurrency-verified facilities.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm sm:text-base font-semibold rounded-xl shadow-md flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Explore Facilities &amp; Book</span>
            </button>

            <button
              onClick={onOpenTicket}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white text-sm sm:text-base font-semibold rounded-xl border border-white/30 backdrop-blur-md flex items-center gap-2 transition-all"
            >
              <Wrench className="w-4 h-4 text-amber-300" />
              <span>Report Campus Issue</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-10 pt-6 border-t border-white/20 grid grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-3xl font-extrabold text-white drop-shadow-xs">{rooms.length}</div>
              <div className="text-sm text-stone-200 font-medium">Campus Facilities</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white drop-shadow-xs">{activeBookingsCount}</div>
              <div className="text-sm text-stone-200 font-medium">Active Bookings</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white drop-shadow-xs">{activeTicketsCount}</div>
              <div className="text-sm text-stone-200 font-medium">Open Work Orders</div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK LINKS SECTION (IBTE Style 3x2 Grid) */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">Quick Links &amp; Campus Services</h2>
          <p className="text-sm sm:text-base text-stone-600 mt-1.5 font-medium">
            Easily access important facilities, resource scheduling, safety logs, and diagnostic performance suites.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={item.action}
                className="group p-5 bg-white border border-stone-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border mb-3 ${item.accentColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-stone-900 group-hover:text-[#4F46E5] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-stone-600 mt-2 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-1.5 text-sm font-semibold text-[#4F46E5]">
                  <span>Access Service</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURED CAMPUS FACILITIES WITH THEIR RESPECTIVE PHOTOS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Key Campus Facilities</h2>
            <p className="text-sm sm:text-base text-stone-600 mt-1 font-medium">
              Equipped with modern infrastructure, high-density networking, and verified safety monitoring.
            </p>
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-sm font-semibold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1"
          >
            <span>View All ({rooms.length}) Facilities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredFacilities.map((room) => (
            <div
              key={room.id}
              onClick={() => onNavigate('dashboard')}
              className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col"
            >
              <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                <img
                  src={room.imageUrl || '/images/Acad1.jpeg'}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 right-2.5">
                  {room.isSuspended ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-xs">
                      Suspended
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                      Available
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-stone-900 group-hover:text-[#4F46E5] transition-colors line-clamp-1">
                    {room.name}
                  </h3>
                  <div className="text-sm text-stone-500 mt-1 font-medium">
                    {room.building} · Cap: {room.capacity}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-sm">
                  <span className="text-stone-500 truncate max-w-[120px]">{room.equipment[0] || 'Standard Tech'}</span>
                  <span className="font-bold text-[#4F46E5] group-hover:underline">
                    Reserve &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY UCRMS / CAMPUS INFRASTRUCTURE PILLARS */}
      <section className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-2xs">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            Campus Infrastructure Management Standards
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-1.5 font-medium">
            Architected specifically for Indian Institute of Information Technology Pune's academic, laboratory, and residential ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="w-10 h-10 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center font-extrabold text-sm mb-4 shadow-xs">
              1
            </div>
            <h3 className="text-base font-bold text-stone-900">Zero Double-Booking Guarantee</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Strict database-level exclusion locking serializes booking requests. Even during high-traffic semester registration, overlapping reservations are strictly prevented.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="w-10 h-10 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center font-extrabold text-sm mb-4 shadow-xs">
              2
            </div>
            <h3 className="text-base font-bold text-stone-900">Automated Safety EventBridge</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              When a high-priority incident is reported in a lab or hall, the venue is suspended automatically, alerting affected students and staff instantly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="w-10 h-10 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center font-extrabold text-sm mb-4 shadow-xs">
              3
            </div>
            <h3 className="text-base font-bold text-stone-900">End-to-End Maintenance Dispatch</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Tickets flow through a strict state machine: Open &rarr; Assigned &rarr; Resolved with timestamped audit logs for estate facilities governance.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
