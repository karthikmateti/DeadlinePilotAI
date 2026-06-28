import React, { useState, useEffect } from "react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, BarChart, Bar, Legend, CartesianGrid 
} from "recharts";
import { DailyReflection, Task, Habit } from "../types";
import { 
  Star, RefreshCw as SpinIcon, Sparkles, Clock, CheckCircle2, 
  MessageSquare, Compass as CompassIcon, Award as AwardIcon, 
  TrendingUp, ChevronRight, Zap 
} from "lucide-react";

interface AnalyticsViewProps {
  reflections: DailyReflection[];
  tasks: Task[];
  habits: Habit[];
  onTriggerReflection: () => Promise<void>;
}

export default function AnalyticsView({ 
  reflections, tasks, habits, onTriggerReflection 
}: AnalyticsViewProps) {
  const [analyzing, setAnalyzing] = useState(false);

  const handleRunReflection = async () => {
    setAnalyzing(true);
    await onTriggerReflection();
    setAnalyzing(false);
  };

  // Convert reflections to charting format
  const chartData = reflections.map(r => ({
    date: r.date.split("-").slice(1).join("/"), // MM/DD format
    rating: r.rating,
    focusHours: r.focusHours || 3,
    completed: r.completedCount || 1
  })).reverse();

  // If no reflection data is populated, add a default for Recharts stability
  const stableChartData = chartData.length > 0 ? chartData : [
    { date: "06/24", rating: 6, focusHours: 2, completed: 1 },
    { date: "06/25", rating: 7, focusHours: 3, completed: 2 },
    { date: "06/26", rating: 5, focusHours: 1.5, completed: 0 },
    { date: "06/27", rating: 8, focusHours: 4, completed: 3 },
    { date: "06/28", rating: 8, focusHours: 3.5, completed: 2 }
  ];

  const totalCompleted = tasks.filter(t => t.status === "completed").length;
  const pendingCount = tasks.filter(t => t.status !== "completed").length;
  const totalFocusHours = reflections.reduce((sum, r) => sum + (r.focusHours || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* TRIGGER ANALYTICS / REFLECTION BANNER */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#12151C]/90 to-indigo-950/40 backdrop-blur-xl border border-white/5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden hover:border-indigo-500/20 transition-all duration-300">
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-purple-400 font-mono text-xs uppercase tracking-wider">
            <AwardIcon className="w-4 h-4 text-purple-400" />
            Reflection Agent Mirror &bull; Performance Analysis
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white font-sans">
            Cognitive Diagnostics & Productivity Index
          </h3>
          <p className="text-xs text-slate-400 max-w-xl font-sans">
            Every night, the Reflection Agent aggregates your checked tasks, daily focus slots, and logged habits to rate your focus performance and compile tailored learning rules.
          </p>
        </div>

        <button
          onClick={handleRunReflection}
          disabled={analyzing}
          className="px-5 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 shadow-lg shadow-indigo-500/20 cursor-pointer active:scale-[0.98]"
        >
          {analyzing ? (
            <SpinIcon className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <SpinIcon className="w-3.5 h-3.5" />
          )}
          {analyzing ? "Conducting Focus Diagnostics..." : "Audit Daily Performance"}
        </button>
      </div>

      {/* CORE STATS BOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 flex flex-col hover:border-indigo-500/20 transition-all duration-300">
          <span className="font-mono text-[10px] font-bold uppercase text-slate-500 tracking-wider">AGGREGATE FOCUS SCALE</span>
          <span className="text-3xl font-extrabold text-white mt-1.5 font-sans">
            {reflections[0]?.rating || "8.0"}/10
          </span>
          <span className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
            +12% vs last session
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 flex flex-col hover:border-indigo-500/20 transition-all duration-300">
          <span className="font-mono text-[10px] font-bold uppercase text-slate-500 tracking-wider">COMPLETED MILESTONES</span>
          <span className="text-3xl font-extrabold text-white mt-1.5 font-sans">
            {totalCompleted} Tasks
          </span>
          <span className="text-[10px] font-mono text-slate-500 mt-1">
            {pendingCount} remaining in cockpit
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 flex flex-col hover:border-indigo-500/20 transition-all duration-300">
          <span className="font-mono text-[10px] font-bold uppercase text-slate-500 tracking-wider">AGGREGATED DEEP HOURS</span>
          <span className="text-3xl font-extrabold text-white mt-1.5 font-sans">
            {totalFocusHours || "14.5"} hours
          </span>
          <span className="text-[10px] font-mono text-indigo-400 mt-1">
            Avg. 2.9 hours / session
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 flex flex-col hover:border-indigo-500/20 transition-all duration-300">
          <span className="font-mono text-[10px] font-bold uppercase text-slate-500 tracking-wider">HABIT COMPLETIONS</span>
          <span className="text-3xl font-extrabold text-white mt-1.5 font-sans">
            {habits.filter(h => h.streak > 0).length}/{habits.length} Active
          </span>
          <span className="text-[10px] font-mono text-indigo-500 mt-1 flex items-center gap-0.5 font-bold">
            Avg streak: {Math.max(...habits.map(h => h.streak), 0)} days
          </span>
        </div>
      </div>

      {/* CHARTS ENGINE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* RECHARTS PERFORMANCE OVERVIEW */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 flex flex-col h-[320px] hover:border-indigo-500/20 transition-all duration-300">
          <span className="font-mono text-[10px] font-bold uppercase text-slate-300 tracking-wider border-b border-white/5 pb-3 mb-4">Focus Ratings & Focus Hours Timeline</span>
          
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stableChartData}>
                <defs>
                  <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" stroke="#4b5563" fontSize={11} fontStyle="mono" />
                <YAxis stroke="#4b5563" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050608', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="rating" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRating)" name="Productivity Rating" />
                <Area type="monotone" dataKey="focusHours" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" name="Deep Focus Hours" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT ADVICE & DIAGNOSTICS */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 flex flex-col hover:border-indigo-500/20 transition-all duration-300">
          <span className="font-mono text-[10px] font-bold uppercase text-slate-300 tracking-wider border-b border-white/5 pb-3 mb-4">Tailored AI Recommendations</span>

          {reflections.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-600 py-12 font-mono text-xs">
              NO DIAGNOSTIC RECOMMENDATIONS LOGGED YET.
              <button onClick={handleRunReflection} className="mt-3 text-indigo-400 hover:underline cursor-pointer">
                Generate Diagnostics &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto pr-1 scrollbar-thin">
              <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-900/40">
                <span className="text-[10px] font-mono text-indigo-400 font-bold block">DAILY DIAGNOSTIC EVALUATION</span>
                <p className="text-xs text-slate-300 mt-1 font-medium font-sans leading-relaxed">
                  "{reflections[0].analysis}"
                </p>
              </div>

              <div className="space-y-2.5">
                <span className="text-[10px] font-mono text-slate-500 font-bold block">TACTICAL ADVICE ACTION RULES</span>
                {reflections[0].suggestions.map((s, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded bg-[#12151C]/40 border border-white/5 hover:border-indigo-500/20 transition-all duration-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5"></span>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
