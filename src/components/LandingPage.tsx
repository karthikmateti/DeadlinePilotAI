import React from "react";
import { Shield, Sparkles, Zap, Users, Compass, Clock, CheckCircle, RefreshCw } from "lucide-react";

interface LandingPageProps {
  onStartDemo: () => void;
  onGoToLogin: () => void;
}

export default function LandingPage({ onStartDemo, onGoToLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#050608] bg-radial-[at_top_right] from-[#1a1f2c] via-[#050608] to-[#050608] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <header className="max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-900/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-sans font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              DeadlinePilot <span className="text-amber-400 font-semibold font-mono text-xs px-1.5 py-0.5 rounded bg-amber-950/40 ml-1 border border-amber-500/20">AI</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onGoToLogin}
            className="text-sm font-medium text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            Sign In
          </button>
          <button 
            onClick={onStartDemo}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            Launch Free Demo
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-24 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/40 border border-amber-500/20 text-amber-400 text-xs font-mono mb-8 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          The Last-Minute Life Saver is Active
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          The Autonomous AI Companion That <span className="text-indigo-400">Tackles Deadlines</span> Before They Tackle You
        </h1>
        <p className="mt-6 text-lg text-slate-400 max-w-2xl font-sans leading-relaxed">
          Stop relying on static reminder lists. DeadlinePilot deploys a collaborative crew of 7 specialized AI Agents to plan, prioritize, schedule, and execute your heaviest commitments autonomously.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <button 
            onClick={onStartDemo}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-base font-bold text-white transition-all duration-200 shadow-lg shadow-indigo-500/20 transform hover:-translate-y-0.5 cursor-pointer"
          >
            Access AI Flight Deck
          </button>
          <button 
            onClick={onGoToLogin}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#12151C] hover:bg-[#1a1f2c] text-base font-semibold text-slate-300 hover:text-white border border-white/5 hover:border-indigo-500/30 transition-all duration-200 cursor-pointer"
          >
            Account Authorization
          </button>
        </div>

        {/* Client App Mock Preview */}
        <div className="mt-16 w-full max-w-5xl rounded-2xl border border-white/5 bg-[#0B0D11]/60 backdrop-blur-md p-4 shadow-2xl hover:border-indigo-500/10 transition-all duration-300">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
              <span className="text-xs font-mono text-slate-500 ml-2">deadlinepilot-flight-deck.sh</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#12151C] border border-white/5 text-indigo-400 text-xs font-mono">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              7 Agents Online
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-xl bg-[#12151C]/40 border border-white/5 hover:border-indigo-500/20 transition-all duration-200">
              <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider mb-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Scheduler Agent
              </div>
              <p className="text-slate-300 font-sans font-medium text-sm">"Optimized daily focus schedule. Allocated 2h block for 'Chem Lab Report Focus' avoiding morning lecture conflicts."</p>
            </div>
            <div className="p-4 rounded-xl bg-[#12151C]/40 border border-white/5 hover:border-indigo-500/20 transition-all duration-200">
              <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-wider mb-2">
                <Shield className="w-4 h-4 text-rose-400" />
                Priority Agent
              </div>
              <p className="text-slate-300 font-sans font-medium text-sm">"Marked 'Startup Pitch Presentation' as high risk. Due in 48h with 6 hours of work remaining. Re-arranging slot buffer."</p>
            </div>
            <div className="p-4 rounded-xl bg-[#12151C]/40 border border-white/5 hover:border-indigo-500/20 transition-all duration-200">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                Planner Agent
              </div>
              <p className="text-slate-300 font-sans font-medium text-sm">"Broke down Chemistry Kinetics report into 4 sequential steps. Calculation step is 100% completed."</p>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <section className="mt-32 w-full">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4 font-sans">
            Autonomous Crew of 7 Intelligence Profiles
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-16 text-base font-sans">
            These specialized profiles work together behind the scenes to optimize every single aspect of your workday.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 hover:border-indigo-500/20 hover:bg-[#12151C]/40 transition-all duration-300">
              <Compass className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-lg font-bold text-white font-sans">1. Tactical Planner</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed font-sans">
                Breaks down monolithic goals and tasks into atomic, bite-sized subtasks with accurate effort estimation.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 hover:border-rose-500/20 hover:bg-[#12151C]/40 transition-all duration-300">
              <Shield className="w-8 h-8 text-rose-400 mb-4" />
              <h3 className="text-lg font-bold text-white font-sans">2. Urgency Guardian</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed font-sans">
                Maintains a real-time Eisenhower urgency audit. Flags high-risk tasks before you fall behind.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 hover:border-amber-500/20 hover:bg-[#12151C]/40 transition-all duration-300">
              <Clock className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-lg font-bold text-white font-sans">3. Smart Scheduler</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed font-sans">
                Carves out personalized focus block agendas, automatically rescheduling skipped tasks based on cognitive slots.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 hover:border-emerald-500/20 hover:bg-[#12151C]/40 transition-all duration-300">
              <Users className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-lg font-bold text-white font-sans">4. Conflict Deflector</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed font-sans">
                Connects to Google Calendar to read existing commitments and lock down conflict-free deep work slots.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 hover:border-blue-500/20 hover:bg-[#12151C]/40 transition-all duration-300">
              <Zap className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-bold text-white font-sans">5. Execution Copilot</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed font-sans">
                Drafts summaries, explains complex lecture materials, writes high-converting emails, and generates slides instantly.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 hover:border-purple-500/20 hover:bg-[#12151C]/40 transition-all duration-300">
              <RefreshCw className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-bold text-white font-sans">6. Feedback Mirror</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed font-sans">
                Performs nightly cognitive evaluations on your logs. Grades your focus scores and outputs weekly optimizations.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 hover:border-cyan-500/20 hover:bg-[#12151C]/40 transition-all duration-300">
              <Sparkles className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-lg font-bold text-white font-sans">7. Motivational Pilot</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed font-sans">
                Generates context-aware, highly focused nudges and reminders based on actual remaining deadline safety buffers.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 hover:border-violet-500/20 hover:bg-[#12151C]/40 transition-all duration-300">
              <CheckCircle className="w-8 h-8 text-violet-400 mb-4" />
              <h3 className="text-lg font-bold text-white font-sans">File Digestion Core</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed font-sans">
                Upload syllabus plans, research PDFs, or guidelines and let the pilot automatically extract deadlines into active tasks.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-[#050608] py-10">
        <div className="max-w-7xl w-full mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-slate-500 text-xs font-sans">
          <div>
            &copy; 2026 DeadlinePilot AI. Securely operating in AI Studio Container Workspace.
          </div>
          <div className="flex gap-4 mt-4 md:mt-0 font-sans">
            <span className="text-indigo-400 hover:underline cursor-pointer">Security Protocol v4.1</span>
            <span>&bull;</span>
            <span className="text-indigo-400 hover:underline cursor-pointer">API Integration Console</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
