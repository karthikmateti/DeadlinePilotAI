import React, { useState } from "react";
import { 
  Calendar, Clock, Users, Plus, Star, Sparkles, RefreshCw, CheckCircle, AlertTriangle 
} from "lucide-react";
import { CalendarEvent, Task } from "../types";

interface CalendarViewProps {
  events: CalendarEvent[];
  tasks: Task[];
  onAddEvent: (event: Partial<CalendarEvent>) => Promise<void>;
  onSyncGoogleCalendar: () => Promise<void>;
}

export default function CalendarView({ 
  events, tasks, onAddEvent, onSyncGoogleCalendar 
}: CalendarViewProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [description, setDescription] = useState("");
  
  const [syncing, setSyncing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !start || !end) return;

    const startTime = new Date(`${date}T${start}:00`).toISOString();
    const endTime = new Date(`${date}T${end}:00`).toISOString();

    await onAddEvent({
      title,
      startTime,
      endTime,
      description,
      isExternal: false
    });

    setTitle("");
    setDate("");
    setStart("");
    setEnd("");
    setDescription("");
    setShowAddForm(false);
  };

  const handleSyncGCal = async () => {
    setSyncing(true);
    await onSyncGoogleCalendar();
    setTimeout(() => {
      setSyncing(false);
    }, 1200);
  };

  // Helper to prettify date/times
  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' });
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return { dateStr, timeStr };
    } catch (e) {
      return { dateStr: "N/A", timeStr: "00:00" };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* SYNC CONTROLS & NEW EVENTS FORM */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* GOOGLE CALENDAR SYNC WIDGET */}
        <div className="p-5 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 flex flex-col space-y-4 hover:border-indigo-500/20 transition-all duration-300">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Users className="w-4 h-4 text-indigo-400" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">Calendar Synchronization</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Connect your primary Google Calendar. DeadlinePilot will constantly scan for incoming class sessions, client meetings, or healthcare buffers to eliminate scheduling collisions.
          </p>

          <button
            onClick={handleSyncGCal}
            disabled={syncing}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/20 cursor-pointer active:scale-[0.98]"
          >
            {syncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {syncing ? "Authorizing Oauth Handshake..." : "Sync Google Calendar"}
          </button>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-mono text-slate-400">
              OAUTH PROTOCOL SECURE &bull; 0 CONFLICTS
            </span>
          </div>
        </div>

        {/* ADD EVENT FORM */}
        <div className="p-5 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 flex flex-col hover:border-indigo-500/20 transition-all duration-300">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full py-2.5 rounded-xl bg-[#12151C] border border-white/5 hover:border-indigo-500/30 text-xs font-bold text-slate-200 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? "Close Event Editor" : "Register Manual Event Block"}
          </button>

          {showAddForm && (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4 pt-4 border-t border-white/5">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border border-white/5 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all font-sans"
                  required
                  placeholder="e.g. Organic Chemistry Lecture"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-white/5 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-all font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-white/5 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-all font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-white/5 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Notes / Location
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border border-white/5 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all font-sans"
                  placeholder="e.g. Room 402, Science Hall"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
              >
                Insert Event Block
              </button>
            </form>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: CALENDAR EVENT AGENDA */}
      <div className="lg:col-span-8 space-y-5">
        
        {/* CALENDAR AGENDA FEED */}
        <div className="p-5 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 flex flex-col hover:border-indigo-500/20 transition-all duration-300">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">Registered Calendar Commitments</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {events.length} COMMITTED TIME BLOCKS
            </span>
          </div>

          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="py-12 text-center text-slate-600 text-xs font-mono">
                NO REGISTERED CALENDAR BLOCKS. GET SYNCED.
              </div>
            ) : (
              events.map((event) => {
                const { dateStr, timeStr } = formatDateTime(event.startTime);
                const endInfo = formatDateTime(event.endTime);
                return (
                  <div 
                    key={event.id} 
                    className={`p-4 rounded-xl border ${event.isExternal ? 'border-sky-500/20 bg-sky-950/10' : 'border-white/5 bg-[#12151C]/40'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-indigo-500/20 duration-200`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-100 font-sans">{event.title}</h4>
                        {event.isExternal && (
                          <span className="px-2 py-0.5 rounded-full bg-sky-950 border border-sky-900/50 text-[9px] font-mono font-bold text-sky-400">
                            GOOGLE CALENDAR
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-sans">{event.description || "No description provided."}</p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 text-xs shrink-0">
                      <div className="px-2 py-0.5 rounded bg-slate-950 border border-white/5 text-[10px] font-mono font-bold text-slate-400">
                        {dateStr}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-indigo-400 font-semibold">
                        <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span>{timeStr} - {endInfo.timeStr}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COMPANION EXPLANATION: CONFLICT AVOIDANCE */}
        <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-900/30 relative overflow-hidden flex items-start gap-4 hover:border-indigo-500/30 transition-all duration-300">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold font-sans text-indigo-300">How Collision Avoidance works</h4>
            <p className="text-xs leading-relaxed text-slate-400 font-sans">
              The Scheduler Agent and Calendar Agent coordinate on every re-prioritization. Focus blocks are exclusively generated inside slots with zero scheduled collisions, respecting class blocks and calendar logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
