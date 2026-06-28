import React, { useState, useEffect } from "react";
import { 
  Zap, Clock, ShieldAlert, Sparkles, CheckSquare, Square, Flame, 
  Calendar, RefreshCw, Star, Compass, Play
} from "lucide-react";
import { Task, Habit, ScheduledSlot } from "../types";

interface DashboardViewProps {
  tasks: Task[];
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  onOptimiseSchedule: () => void;
  onNavigateTo: (page: string) => void;
}

export default function DashboardView({ 
  tasks, habits, onToggleHabit, onOptimiseSchedule, onNavigateTo 
}: DashboardViewProps) {
  const [briefing, setBriefing] = useState<any>({
    summary: "Initializing core flight parameters...",
    atRiskTasksCount: 0,
    unassignedHoursCount: 0,
    habitsProgress: 0,
    nudges: []
  });
  const [loading, setLoading] = useState(false);

  const fetchBriefing = async () => {
    try {
      const res = await fetch("/api/briefing");
      if (res.ok) {
        const data = await res.json();
        setBriefing(data);
      }
    } catch (e) {
      console.error("Error fetching briefing:", e);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, [tasks, habits]);

  const handleTriggerReschedule = async () => {
    setLoading(true);
    await onOptimiseSchedule();
    await fetchBriefing();
    setLoading(false);
  };

  // Filter tasks at risk
  const atRiskTasks = tasks.filter(t => t.isFlaggedForAtRisk && t.status !== "completed");
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Flight Banner Briefing */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#12151C]/90 to-indigo-950/40 backdrop-blur-xl border border-white/5 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-indigo-500/20 transition-all duration-300">
        <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Core Daily Briefing &bull; Autonomous Pilot Update
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white font-sans leading-snug max-w-3xl">
            {briefing.summary}
          </h2>
          {briefing.nudges && briefing.nudges.length > 0 && (
            <div className="mt-3 py-2 px-3.5 bg-slate-950/60 border border-white/5 rounded-xl max-w-2xl text-xs font-medium text-slate-300 font-sans flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
              <span>{briefing.nudges[0]}</span>
            </div>
          )}
        </div>

        <div className="flex flex-row md:flex-col gap-3 shrink-0">
          <button 
            onClick={handleTriggerReschedule}
            disabled={loading}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Optimize Today's Schedule
          </button>
        </div>
      </div>

      {/* Primary Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Urgent Warnings & Subtask Checklist (Left Panel) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Urgent Focus Area */}
          <div className="p-5 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 flex flex-col hover:border-indigo-500/20 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">Urgency Guardian Alerts</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-950/50 border border-rose-900 text-rose-400 text-[10px] font-mono">
                {atRiskTasks.length} AT RISK
              </span>
            </div>

            {atRiskTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-600 text-xs font-mono">
                ✓ ALL DEADLINES ARE IN HIGH SAFETY ZONES
              </div>
            ) : (
              <div className="space-y-3">
                {atRiskTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="p-4 rounded-xl bg-[#12151C]/40 border border-white/5 flex items-start justify-between gap-4 transition-all hover:border-indigo-500/30 hover:bg-[#12151C]/60 duration-200"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-slate-100 font-sans">{task.title}</h4>
                      <p className="text-xs text-slate-400 font-sans line-clamp-1">{task.description}</p>
                      <div className="flex items-center gap-3 pt-1 text-[10px] font-mono text-slate-500">
                        <span>Deadline: <strong className="text-rose-400">{task.deadline}</strong></span>
                        <span>&bull;</span>
                        <span>Effort: <strong className="text-slate-300">{task.estimatedTime}h</strong></span>
                      </div>
                    </div>
                    <button 
                      onClick={() => onNavigateTo("Tasks")}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900 text-[10px] font-bold text-rose-400 flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <Play className="w-2.5 h-2.5" /> Tackle Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Schedule Slots */}
          <div className="p-5 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 flex flex-col hover:border-indigo-500/20 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">Today's Flight Timeline</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {briefing.dailySchedule?.length || 0} BLOCKS RESERVED
              </span>
            </div>

            {!briefing.dailySchedule || briefing.dailySchedule.length === 0 ? (
              <div className="py-12 text-center text-slate-600 text-xs font-mono space-y-2">
                <div>NO ACTIVE SCHEDULE BLOCKS BOOKED TODAY</div>
                <button 
                  onClick={handleTriggerReschedule} 
                  className="text-xs font-sans text-indigo-400 hover:underline"
                >
                  Click to generate customized focus slots
                </button>
              </div>
            ) : (
              <div className="relative border-l border-white/5 ml-3.5 pl-5 space-y-6 my-2">
                {briefing.dailySchedule.map((slot: ScheduledSlot, index: number) => (
                  <div key={index} className="relative">
                    {/* Circle timeline dot */}
                    <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    </span>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/50 border border-indigo-900/50 px-2 py-0.5 rounded">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <h4 className="font-bold text-sm text-slate-200 pt-1 font-sans">{slot.label}</h4>
                      <p className="text-xs text-slate-400 font-sans">Lock down absolute silence, toggle Deep Work mode.</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Habit Trackers & Stats (Right Panel) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Habits Checklists */}
          <div className="p-5 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 flex flex-col hover:border-indigo-500/20 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-indigo-500" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">Habit Streaks Checklist</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {briefing.habitsProgress}% COMPLETED TODAY
              </span>
            </div>

            <div className="space-y-3.5">
              {habits.map((habit) => {
                const isCompleted = habit.completedDates.includes(today);
                return (
                  <div 
                    key={habit.id} 
                    onClick={() => onToggleHabit(habit.id)}
                    className="p-3.5 rounded-xl bg-[#12151C]/40 border border-white/5 flex items-center justify-between gap-3 cursor-pointer hover:border-indigo-500/30 hover:bg-[#12151C]/60 transition-all duration-200 animate-fade-in"
                  >
                    <div className="flex items-center gap-3">
                      {isCompleted ? (
                        <CheckSquare className="w-5 h-5 text-indigo-500 shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-700 shrink-0" />
                      )}
                      <span className={`text-xs font-medium font-sans ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                        {habit.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-indigo-950/30 border border-indigo-900/50 text-indigo-500 text-[10px] font-mono font-bold">
                      <Flame className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span>{habit.streak}d streak</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workspace Quick-Links */}
          <div className="p-5 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 flex flex-col space-y-3 hover:border-indigo-500/20 transition-all duration-300">
            <h4 className="font-mono text-[10px] font-bold uppercase text-slate-500 tracking-wider">WORKSPACE COCKPIT QUICK BUTTONS</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onNavigateTo("Tasks")}
                className="p-3 rounded-xl bg-[#12151C]/40 border border-white/5 hover:border-indigo-500/30 hover:bg-[#12151C]/80 text-xs font-semibold font-sans text-slate-300 text-center transition-all flex flex-col items-center gap-2 hover:shadow-[0_0_15px_rgba(245,158,11,0.08)]"
              >
                <CheckSquare className="w-4 h-4 text-indigo-400" />
                Task Desk
              </button>
              <button 
                onClick={() => onNavigateTo("Calendar")}
                className="p-3 rounded-xl bg-[#12151C]/40 border border-white/5 hover:border-indigo-500/30 hover:bg-[#12151C]/80 text-xs font-semibold font-sans text-slate-300 text-center transition-all flex flex-col items-center gap-2 hover:shadow-[0_0_15px_rgba(245,158,11,0.08)]"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                Calendar Sync
              </button>
              <button 
                onClick={() => onNavigateTo("AI Chat")}
                className="p-3 rounded-xl bg-[#12151C]/40 border border-white/5 hover:border-indigo-500/30 hover:bg-[#12151C]/80 text-xs font-semibold font-sans text-slate-300 text-center transition-all flex flex-col items-center gap-2 hover:shadow-[0_0_15px_rgba(245,158,11,0.08)]"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Agent Chat
              </button>
              <button 
                onClick={() => onNavigateTo("Analytics")}
                className="p-3 rounded-xl bg-[#12151C]/40 border border-white/5 hover:border-indigo-500/30 hover:bg-[#12151C]/80 text-xs font-semibold font-sans text-slate-300 text-center transition-all flex flex-col items-center gap-2 hover:shadow-[0_0_15px_rgba(245,158,11,0.08)]"
              >
                <Star className="w-4 h-4 text-purple-400" />
                Reflections
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
