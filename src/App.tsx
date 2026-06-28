import React, { useState, useEffect } from "react";
import { 
  Zap, Compass, Shield, Clock, Users, RefreshCw, Sparkles, Terminal, 
  Settings, MessageSquare, LogOut, CheckSquare, ShieldAlert, FileText, 
  LayoutDashboard, Flame, Moon, Sun, Play, Pause, Square, ChevronRight, X
} from "lucide-react";
import { Task, CalendarEvent, Habit, Goal, AgentLog, ChatMessage, DailyReflection } from "./types";

// Import custom views
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import DashboardView from "./components/DashboardView";
import TasksView from "./components/TasksView";
import CalendarView from "./components/CalendarView";
import AnalyticsView from "./components/AnalyticsView";
import AIChatView from "./components/AIChatView";
import SettingsView from "./components/SettingsView";
import AgentActivityLogs from "./components/AgentActivityLogs";

export default function App() {
  // Navigation states
  const [currentPage, setCurrentPage] = useState<"Landing" | "Login" | "Dashboard" | "Tasks" | "Calendar" | "Analytics" | "AI Chat" | "Settings">("Landing");
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Core Data states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [reflections, setReflections] = useState<DailyReflection[]>([]);
  
  // UI Panel states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const [isProcessingChat, setIsProcessingChat] = useState(false);

  // Deep Work Mode states
  const [deepWorkActive, setDeepWorkActive] = useState(false);
  const [deepWorkTime, setDeepWorkTime] = useState(1500); // 25 minutes default
  const [timerRunning, setTimerRunning] = useState(false);
  const [ambientAudio, setAmbientAudio] = useState(false);

  // Auto-reload data loops
  const syncWorkspaceData = async () => {
    try {
      const endpoints = [
        { path: "/api/tasks", setter: setTasks },
        { path: "/api/habits", setter: setHabits },
        { path: "/api/calendar", setter: setCalendarEvents },
        { path: "/api/logs", setter: setAgentLogs },
        { path: "/api/chat", setter: setChatMessages },
        { path: "/api/reflection", setter: setReflections }
      ];

      await Promise.all(endpoints.map(async (ep) => {
        const res = await fetch(ep.path);
        if (res.ok) {
          const data = await res.json();
          ep.setter(data);
        }
      }));
    } catch (err) {
      console.error("Error syncing flight workspace:", err);
    }
  };

  // Check auth session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser(data.user);
            setCurrentPage("Dashboard");
          }
        }
      } catch (e) {
        console.error("Auth verification failed:", e);
      } finally {
        setAuthChecked(true);
      }
    };
    checkSession();
  }, []);

  // Poll for background agent telemetry changes
  useEffect(() => {
    if (user) {
      syncWorkspaceData();
      const interval = setInterval(syncWorkspaceData, 10000); // sync every 10 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  // Deep work countdown timer effect
  useEffect(() => {
    let interval: any;
    if (timerRunning && deepWorkTime > 0) {
      interval = setInterval(() => {
        setDeepWorkTime(prev => prev - 1);
      }, 1000);
    } else if (deepWorkTime === 0) {
      setTimerRunning(false);
      // Optional browser sound alert if allowed
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(0.5);
      } catch (e) {}
    }
    return () => clearInterval(interval);
  }, [timerRunning, deepWorkTime]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // DISPATCH CRUD OPERATIONS
  // ==========================================

  const handleAddTask = async (newTaskData: Partial<Task>) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTaskData)
      });
      if (res.ok) {
        await syncWorkspaceData();
      }
    } catch (e) {
      console.error("Error adding task:", e);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    // Custom reload handler for upload triggers
    if (id === "trigger_state_reload_only") {
      await syncWorkspaceData();
      return;
    }

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await syncWorkspaceData();
      }
    } catch (e) {
      console.error("Error updating task:", e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await syncWorkspaceData();
      }
    } catch (e) {
      console.error("Error deleting task:", e);
    }
  };

  const handleTriggerPlanner = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/plan`, {
        method: "POST"
      });
      if (res.ok) {
        await syncWorkspaceData();
      }
    } catch (e) {
      console.error("Error planning task with AI:", e);
    }
  };

  const handleOptimiseSchedule = async () => {
    try {
      const res = await fetch("/api/tasks/schedule", {
        method: "POST"
      });
      if (res.ok) {
        await syncWorkspaceData();
      }
    } catch (e) {
      console.error("Error optimizing schedule:", e);
    }
  };

  const handleAddCalendarEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData)
      });
      if (res.ok) {
        await syncWorkspaceData();
      }
    } catch (e) {
      console.error("Error adding event:", e);
    }
  };

  const handleToggleHabit = async (habitId: string) => {
    try {
      const res = await fetch(`/api/habits/${habitId}/toggle`, {
        method: "PUT"
      });
      if (res.ok) {
        await syncWorkspaceData();
      }
    } catch (e) {
      console.error("Error toggling habit:", e);
    }
  };

  const handleSendMessage = async (text: string) => {
    setIsProcessingChat(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      if (res.ok) {
        await syncWorkspaceData();
      }
    } catch (e) {
      console.error("Error sending chat:", e);
    } finally {
      setIsProcessingChat(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await fetch("/api/chat/clear", {
        method: "POST"
      });
      if (res.ok) {
        await syncWorkspaceData();
      }
    } catch (e) {
      console.error("Error clearing chat history:", e);
    }
  };

  const handleTriggerReflection = async () => {
    try {
      const res = await fetch("/api/reflection", {
        method: "POST"
      });
      if (res.ok) {
        await syncWorkspaceData();
      }
    } catch (e) {
      console.error("Error triggering reflection:", e);
    }
  };

  const handleLoginSuccess = (authenticatedUser: any) => {
    setUser(authenticatedUser);
    setCurrentPage("Dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("Landing");
  };

  // Active view router
  const renderPageContent = () => {
    switch (currentPage) {
      case "Dashboard":
        return (
          <DashboardView 
            tasks={tasks}
            habits={habits}
            onToggleHabit={handleToggleHabit}
            onOptimiseSchedule={handleOptimiseSchedule}
            onNavigateTo={setCurrentPage}
          />
        );
      case "Tasks":
        return (
          <TasksView 
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onTriggerPlanner={handleTriggerPlanner}
          />
        );
      case "Calendar":
        return (
          <CalendarView 
            events={calendarEvents}
            tasks={tasks}
            onAddEvent={handleAddCalendarEvent}
            onSyncGoogleCalendar={syncWorkspaceData}
          />
        );
      case "Analytics":
        return (
          <AnalyticsView 
            reflections={reflections}
            tasks={tasks}
            habits={habits}
            onTriggerReflection={handleTriggerReflection}
          />
        );
      case "AI Chat":
        return (
          <AIChatView 
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onClearHistory={handleClearHistory}
            isProcessing={isProcessingChat}
          />
        );
      case "Settings":
        return (
          <SettingsView 
            onRefreshStatus={syncWorkspaceData}
          />
        );
      default:
        return <DashboardView tasks={tasks} habits={habits} onToggleHabit={handleToggleHabit} onOptimiseSchedule={handleOptimiseSchedule} onNavigateTo={setCurrentPage} />;
    }
  };

  // Outer Router for Landing and Auth Screens
  if (!user) {
    if (currentPage === "Login") {
      return <LoginPage onLoginSuccess={handleLoginSuccess} onGoBack={() => setCurrentPage("Landing")} />;
    }
    return <LandingPage onStartDemo={() => handleLoginSuccess({ displayName: "Karthik Mateti", email: "karthikmateti2007@gmail.com" })} onGoToLogin={() => setCurrentPage("Login")} />;
  }

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* DEEP WORK IMMERSIVE LAYER */}
      {deepWorkActive && (
        <div className="fixed inset-0 bg-[#050608]/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6 transition-all duration-300">
          <button 
            onClick={() => {
              setDeepWorkActive(false);
              setTimerRunning(false);
            }}
            className="absolute top-6 right-6 p-2 rounded-xl bg-[#12151C] border border-white/5 text-slate-400 hover:text-white hover:border-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-6 max-w-md w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-500/20 text-amber-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              DEEP WORK TUNNEL ACTIVE
            </div>
            
            <h2 className="text-6xl font-extrabold font-mono text-amber-500 tracking-tight glow-text-amber">
              {formatTimer(deepWorkTime)}
            </h2>

            <div className="p-4 rounded-xl bg-[#12151C]/60 border border-white/5 text-xs text-slate-400 leading-relaxed backdrop-blur-md">
              "Tunnel focus locks out extraneous administrative alerts. The notification agent is deflecting all inbox noises."
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
              >
                {timerRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </button>
              <button
                onClick={() => {
                  setTimerRunning(false);
                  setDeepWorkTime(1500);
                }}
                className="w-14 h-14 rounded-full bg-[#12151C] border border-white/5 text-slate-300 flex items-center justify-center hover:border-white/10 transition-all cursor-pointer"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRIMARY SIDEBAR NAVIGATION */}
      <aside className={`bg-[#050608] border-r border-white/5 flex flex-col transition-all duration-300 z-30 shrink-0 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* LOGO BOX */}
        <div className="h-16 border-b border-white/5 flex items-center px-5 gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow shadow-indigo-900">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-sm tracking-tight text-white truncate">
              DeadlinePilot <span className="text-[10px] text-amber-400 font-mono bg-amber-950/40 px-1.5 py-0.5 rounded ml-1 border border-amber-500/20">AI</span>
            </span>
          )}
        </div>

        {/* PROFILE CARD */}
        <div className="p-4 border-b border-white/5 flex items-center gap-3 shrink-0 overflow-hidden">
          <img 
            src={user.photoURL} 
            alt={user.displayName}
            className="w-9 h-9 rounded-full border border-white/5 object-cover shrink-0" 
          />
          {sidebarOpen && (
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-slate-200 truncate">{user.displayName}</h4>
              <span className="text-[10px] font-mono text-slate-500 block truncate">karthikmateti2007</span>
            </div>
          )}
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-thin">
          {[
            { name: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
            { name: "Tasks", icon: <CheckSquare className="w-4 h-4" /> },
            { name: "Calendar", icon: <Clock className="w-4 h-4" /> },
            { name: "AI Chat", icon: <MessageSquare className="w-4 h-4" /> },
            { name: "Analytics", icon: <Flame className="w-4 h-4" /> },
            { name: "Settings", icon: <Settings className="w-4 h-4" /> }
          ].map((item) => {
            const isActive = currentPage === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setCurrentPage(item.name as any)}
                className={`w-full p-3 rounded-xl flex items-center gap-3.5 transition-all text-left cursor-pointer ${isActive ? 'bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-slate-200 hover:bg-[#12151C]/60'}`}
              >
                <div className="shrink-0">{item.icon}</div>
                {sidebarOpen && <span className="text-xs tracking-wide">{item.name}</span>}
              </button>
            );
          })}

          <div className="pt-4 border-t border-white/5">
            <button
              onClick={() => setDeepWorkActive(true)}
              className="w-full p-3 rounded-xl bg-amber-950/20 border border-amber-500/10 hover:border-amber-500/30 hover:bg-amber-950/30 text-amber-400 font-bold flex items-center gap-3.5 text-left transition-all cursor-pointer"
            >
              <Moon className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
              {sidebarOpen && <span className="text-xs">Deep Work Mode</span>}
            </button>
          </div>
        </nav>

        {/* LOGOUT FOOTER */}
        <div className="p-3 border-t border-white/5 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full p-3 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/15 flex items-center gap-3.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span className="text-xs font-semibold">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP COCKPIT NAVIGATION BAR */}
        <header className="h-16 border-b border-white/5 bg-[#050608]/90 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg border border-white/5 bg-[#12151C] hover:border-indigo-500/30 text-slate-400 transition-all cursor-pointer"
            >
              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${sidebarOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500">SYSTEM COCKPIT PAGE &rarr;</span>
              <span className="px-2.5 py-0.5 rounded bg-[#12151C] border border-white/5 text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                {currentPage}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Telemetry Log panel toggler */}
            <button
              onClick={() => setTelemetryOpen(!telemetryOpen)}
              className={`px-3.5 py-1.5 rounded-lg border ${telemetryOpen ? 'bg-indigo-950/40 border-indigo-900 text-indigo-400' : 'bg-[#12151C] border-white/5 text-slate-400 hover:text-slate-300'} text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Telemetry Logs
            </button>
          </div>
        </header>

        {/* WORKSPACE COMPONENT CANVAS & TELEMETRY SIDE BAR SPLIT */}
        <div className="flex-1 flex min-h-0">
          
          {/* PRIMARY WORK AREA */}
          <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#12151C]">
            {renderPageContent()}
          </main>

          {/* TELEMETRY AGENT SLIDEBAR PANEL */}
          {telemetryOpen && (
            <aside className="w-80 border-l border-white/5 bg-[#050608] p-4 hidden xl:block shrink-0 overflow-hidden">
              <AgentActivityLogs logs={agentLogs} onRefresh={syncWorkspaceData} />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
