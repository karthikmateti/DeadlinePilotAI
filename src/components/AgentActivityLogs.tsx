import React from "react";
import { AgentLog } from "../types";
import { Compass, Shield, Clock, Users, Zap, RefreshCw, Sparkles, Terminal } from "lucide-react";

interface AgentActivityLogsProps {
  logs: AgentLog[];
  onRefresh: () => void;
}

export default function AgentActivityLogs({ logs, onRefresh }: AgentActivityLogsProps) {
  const getAgentIcon = (name: string) => {
    switch (name) {
      case "Planner":
        return <Compass className="w-4 h-4 text-emerald-400" />;
      case "Priority":
        return <Shield className="w-4 h-4 text-rose-400" />;
      case "Scheduler":
        return <Clock className="w-4 h-4 text-amber-400" />;
      case "Calendar":
        return <Users className="w-4 h-4 text-sky-400" />;
      case "Execution":
        return <Zap className="w-4 h-4 text-blue-400" />;
      case "Reflection":
        return <RefreshCw className="w-4 h-4 text-purple-400" />;
      case "Notification":
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
      default:
        return <Terminal className="w-4 h-4 text-slate-400" />;
    }
  };

  const getAgentStyles = (name: string) => {
    switch (name) {
      case "Planner":
        return "bg-emerald-950/40 text-emerald-400 border-emerald-900/50";
      case "Priority":
        return "bg-rose-950/40 text-rose-400 border-rose-900/50";
      case "Scheduler":
        return "bg-amber-950/40 text-amber-400 border-amber-900/50";
      case "Calendar":
        return "bg-sky-950/40 text-sky-400 border-sky-900/50";
      case "Execution":
        return "bg-blue-950/40 text-blue-400 border-blue-900/50";
      case "Reflection":
        return "bg-purple-950/40 text-purple-400 border-purple-900/50";
      case "Notification":
        return "bg-cyan-950/40 text-cyan-400 border-cyan-900/50";
      default:
        return "bg-slate-900 text-slate-400 border-slate-800";
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return "00:00:00";
    }
  };

  return (
    <div className="w-full h-full bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">Agent Flight telemetry</h3>
        </div>
        <button 
          onClick={onRefresh}
          className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3 animate-spin" />
          Sync
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin scrollbar-thumb-[#12151C]">
        {logs.length === 0 ? (
          <div className="py-12 text-center text-slate-600 text-xs font-mono">
            NO ACTIVE AGENT TELEMETRY LOGS
          </div>
        ) : (
          logs.map((log, idx) => (
            <div 
              key={idx} 
              className={`p-3.5 rounded-xl border ${getAgentStyles(log.agentName)} flex flex-col gap-1.5 transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
                  {getAgentIcon(log.agentName)}
                  <span>{log.agentName} Agent</span>
                </div>
                <span className="text-[10px] font-mono opacity-60">
                  {formatTime(log.timestamp)}
                </span>
              </div>
              <p className="text-xs leading-relaxed font-sans text-slate-300 font-medium">
                {log.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
