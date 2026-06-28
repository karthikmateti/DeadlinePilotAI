import React, { useState, useRef } from "react";
import { 
  Plus, Trash2, CheckCircle2, Circle, Compass, ShieldAlert, FileText, 
  Upload, Sparkles, Filter, ChevronRight, ChevronDown, RefreshCw, AlertTriangle
} from "lucide-react";
import { Task, PriorityLevel, SubTask } from "../types";

interface TasksViewProps {
  tasks: Task[];
  onAddTask: (task: Partial<Task>) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onTriggerPlanner: (id: string) => Promise<void>;
}

export default function TasksView({ 
  tasks, onAddTask, onUpdateTask, onDeleteTask, onTriggerPlanner 
}: TasksViewProps) {
  // UI states
  const [activeTab, setActiveTab] = useState<"all" | "q1" | "q2" | "q3" | "q4">("all");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  
  // New Task form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [importance, setImportance] = useState<PriorityLevel>("medium");
  const [urgency, setUrgency] = useState<PriorityLevel>("medium");
  const [estimatedTime, setEstimatedTime] = useState("2");
  const [category, setCategory] = useState("Academics");
  const [isAdding, setIsAdding] = useState(false);

  // File upload states
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Agent thinking state
  const [planningTaskId, setPlanningTaskId] = useState<string | null>(null);

  const handleAddTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setIsAdding(true);
    await onAddTask({
      title,
      description,
      deadline: deadline || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      importance,
      urgency,
      estimatedTime: Number(estimatedTime) || 2,
      category
    });
    // Reset
    setTitle("");
    setDescription("");
    setDeadline("");
    setImportance("medium");
    setUrgency("medium");
    setEstimatedTime("2");
    setCategory("Academics");
    setIsAdding(false);
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map(sub => {
      if (sub.id === subtaskId) {
        return { ...sub, completed: !sub.completed };
      }
      return sub;
    });

    const completed = updatedSubtasks.filter(s => s.completed).length;
    const progress = updatedSubtasks.length > 0 
      ? Math.round((completed / updatedSubtasks.length) * 100) 
      : 0;

    await onUpdateTask(taskId, {
      subtasks: updatedSubtasks,
      progress,
      status: progress === 100 ? "completed" : "in_progress"
    });
  };

  const handlePlanWithAI = async (taskId: string) => {
    setPlanningTaskId(taskId);
    await onTriggerPlanner(taskId);
    setPlanningTaskId(null);
    setExpandedTask(taskId); // expand to show subtasks
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    const progress = newStatus === "completed" ? 100 : 0;
    
    // update all subtasks to match status
    const updatedSubtasks = task.subtasks.map(s => ({ ...s, completed: newStatus === "completed" }));

    await onUpdateTask(task.id, {
      status: newStatus,
      progress,
      subtasks: updatedSubtasks
    });
  };

  // Drag and drop / file extraction core handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");
    setUploadSuccess("");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileData: base64
          })
        });

        if (response.ok) {
          const data = await response.json();
          setUploadSuccess(`Extracted ${data.count} tasks from "${file.name}"! Tasks successfully added.`);
          // Trigger a parent reload / app state refresh
          await onUpdateTask("trigger_state_reload_only", {});
        } else {
          setUploadError("Could not extract deadlines from document. Ensure file type is readable.");
        }
      } catch (err) {
        setUploadError("Error contacting cognitive extraction agent.");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Filter list by selected Eisenhower quadrant
  const filteredTasks = tasks.filter(task => {
    if (activeTab === "all") return true;
    if (activeTab === "q1") return task.eisenhowerQuad === 1;
    if (activeTab === "q2") return task.eisenhowerQuad === 2;
    if (activeTab === "q3") return task.eisenhowerQuad === 3;
    if (activeTab === "q4") return task.eisenhowerQuad === 4;
    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT COLUMN: Input Form and PDF Upload */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* ADD TASK FORM */}
        <div className="p-5 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 flex flex-col hover:border-indigo-500/20 transition-all duration-300">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
            <Plus className="w-4 h-4 text-indigo-400" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">File Task Parameter</h3>
          </div>

          <form onSubmit={handleAddTaskSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border border-white/5 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all font-sans"
                required
                placeholder="e.g., Chemistry Lab Kinetics"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Detailed Scope
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border border-white/5 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all font-sans"
                placeholder="Formulas, curves to plot, error analysis..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Target Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-white/5 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-all font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Estimated Effort (h)
                </label>
                <input
                  type="number"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  min="0.5"
                  step="0.5"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-white/5 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-all font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Importance
                </label>
                <select
                  value={importance}
                  onChange={(e) => setImportance(e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-white/5 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="high" className="bg-[#0B0D11]">High</option>
                  <option value="medium" className="bg-[#0B0D11]">Medium</option>
                  <option value="low" className="bg-[#0B0D11]">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Urgency
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-white/5 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="high" className="bg-[#0B0D11]">High</option>
                  <option value="medium" className="bg-[#0B0D11]">Medium</option>
                  <option value="low" className="bg-[#0B0D11]">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Category Label
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border border-white/5 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                placeholder="e.g. Work, Academics, Life"
              />
            </div>

            <button
              type="submit"
              disabled={isAdding}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer active:scale-[0.98]"
            >
              {isAdding ? (
                <span className="w-4 h-4 rounded-full border border-t-indigo-600 animate-spin"></span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Register Task & Classify
                </>
              )}
            </button>
          </form>
        </div>

        {/* AI DEADLINE EXTRACTION DOCUMENT UPLOAD */}
        <div className="p-5 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 flex flex-col hover:border-indigo-500/20 transition-all duration-300">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
            <Upload className="w-4 h-4 text-emerald-400" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">Syllabus PDF ingestion</h3>
          </div>

          <p className="text-xs text-slate-400 font-sans mb-4 leading-relaxed">
            Drop your course syllabus, project brief, or guidelines PDF. Our Planner Agent will automatically catalog deadlines and create tasks.
          </p>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/5 hover:border-indigo-500/40 rounded-xl p-6 text-center cursor-pointer transition-all bg-[#12151C]/20 hover:bg-[#12151C]/40 flex flex-col items-center justify-center gap-3 group"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden" 
              accept=".pdf,.txt,.doc,.docx"
            />
            {uploading ? (
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            ) : (
              <FileText className="w-8 h-8 text-slate-600 group-hover:text-indigo-400 transition-colors" />
            )}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-300">
                {uploading ? "Pilot digesting document..." : "Click or drag files here"}
              </p>
              <p className="text-[10px] font-mono text-slate-500">PDF, TXT, DOCX files up to 10MB</p>
            </div>
          </div>

          {uploadError && (
            <div className="mt-3 p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/30 text-[10px] font-mono text-rose-400 flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: TASK FILTERS & EXPANDABLE LIST */}
      <div className="lg:col-span-8 space-y-5">
        
        {/* FILTERS TABS */}
        <div className="p-1.5 rounded-xl bg-[#0B0D11]/60 border border-white/5 flex items-center gap-1 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all shrink-0 cursor-pointer ${activeTab === "all" ? 'bg-[#12151C] border border-white/5 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            All Tracks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab("q1")}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all shrink-0 cursor-pointer ${activeTab === "q1" ? 'bg-rose-950/50 text-rose-400 border border-rose-900/40' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Q1: Urgent + Important
          </button>
          <button
            onClick={() => setActiveTab("q2")}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all shrink-0 cursor-pointer ${activeTab === "q2" ? 'bg-indigo-950/50 text-indigo-400 border border-indigo-900/40' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Q2: Strategy
          </button>
          <button
            onClick={() => setActiveTab("q3")}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all shrink-0 cursor-pointer ${activeTab === "q3" ? 'bg-indigo-950/20 text-indigo-400 border border-indigo-900/40' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Q3: Urgency Buffer
          </button>
          <button
            onClick={() => setActiveTab("q4")}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all shrink-0 cursor-pointer ${activeTab === "q4" ? 'bg-[#12151C] border border-white/5 text-slate-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Q4: Backlog
          </button>
        </div>

        {/* TASKS LIST */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#0B0D11]/60 backdrop-blur-md border border-white/5 text-center text-slate-600 text-xs font-mono">
              NO REGISTERED MOUNTED TASKS UNDER THIS FILTER
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isExpanded = expandedTask === task.id;
              return (
                <div 
                  key={task.id} 
                  className={`rounded-2xl border transition-all duration-300 ${task.isFlaggedForAtRisk ? 'border-rose-500/30 bg-rose-950/10' : 'border-white/5 bg-[#0B0D11]/60 hover:border-indigo-500/20'} overflow-hidden shadow-sm`}
                >
                  {/* Task Summary Line */}
                  <div className="p-4 sm:p-5 flex items-start gap-4">
                    <button 
                      onClick={() => handleToggleTaskStatus(task)}
                      className="mt-1 text-slate-500 hover:text-indigo-500 transition-colors shrink-0 cursor-pointer"
                    >
                      {task.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-700 hover:text-slate-600" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className={`font-bold text-sm sm:text-base font-sans leading-snug truncate ${task.status === "completed" ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                          {task.title}
                        </h4>
                        
                        <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-white/5 text-[10px] font-mono text-slate-400">
                          {task.category}
                        </span>

                        {task.isFlaggedForAtRisk && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-950/60 text-[10px] font-mono text-rose-400 border border-rose-900 font-bold flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            AT RISK
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-slate-500 pt-1">
                        <span>Deadline: <strong className={task.isFlaggedForAtRisk ? "text-rose-400" : "text-slate-300"}>{task.deadline}</strong></span>
                        <span>&bull;</span>
                        <span>Estimated work: <strong className="text-slate-300">{task.estimatedTime} hours</strong></span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1.5">
                          Progress: <strong className="text-slate-300">{task.progress}%</strong>
                        </span>
                      </div>
                    </div>

                    {/* Quick controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => handlePlanWithAI(task.id)}
                        disabled={planningTaskId === task.id || task.status === "completed"}
                        className="p-2 rounded-lg bg-[#12151C] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-950/30 text-slate-400 hover:text-indigo-400 transition-all text-[11px] font-mono font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        title="Draft execution subtask outline with Planner Agent"
                      >
                        {planningTaskId === task.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Compass className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">AI Plan</span>
                      </button>

                      <button 
                        onClick={() => onDeleteTask(task.id)}
                        className="p-2 rounded-lg bg-[#12151C] border border-white/5 hover:border-rose-500/30 hover:bg-rose-950/30 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button 
                        onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                        className="p-1 text-slate-600 hover:text-slate-400 cursor-pointer"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Subtask List */}
                  {isExpanded && (
                    <div className="border-t border-white/5 bg-slate-950/30 px-5 sm:px-14 py-4 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-500 font-bold uppercase tracking-wider">TACTICAL PLAN SUBTASKS SEQUENCE</span>
                        <span className="text-[10px] font-mono text-slate-400">Estimated Effort: {task.estimatedTime}h</span>
                      </div>

                      {task.subtasks.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-white/5 rounded-xl space-y-2.5">
                          <p className="text-xs text-slate-500 font-sans">No subtasks are currently planned for this target.</p>
                          <button
                            onClick={() => handlePlanWithAI(task.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-bold transition-all cursor-pointer shadow-md"
                          >
                            <Compass className="w-3 h-3" /> Let AI Auto-Plan
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {task.subtasks.map((sub) => (
                            <div 
                              key={sub.id} 
                              onClick={() => handleToggleSubtask(task.id, sub.id)}
                              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 hover:bg-slate-900/50 cursor-pointer border border-white/5 transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                {sub.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-700 hover:text-slate-600 shrink-0" />
                                )}
                                <span className={`text-xs font-medium ${sub.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                  {sub.title}
                                </span>
                              </div>
                              {sub.estimatedTime && (
                                <span className="font-mono text-[10px] text-slate-500 bg-[#12151C] border border-white/5 px-1.5 py-0.5 rounded">{sub.estimatedTime}h</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
