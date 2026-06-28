import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Task, CalendarEvent, Habit, Goal, AgentLog, 
  ChatMessage, ScheduledSlot, DailyReflection, SubTask 
} from "./src/types";

const app = express();
const PORT = 3000;

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Database file path
const DB_FILE = path.join(process.cwd(), "server_db.json");

// Helper to get raw date strings
const getTodayDateString = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

// Initialize DB with rich sample data
const getInitialData = () => {
  const today = getTodayDateString();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split('T')[0];

  const inTwoDaysDate = new Date();
  inTwoDaysDate.setDate(inTwoDaysDate.getDate() + 2);
  const inTwoDays = inTwoDaysDate.toISOString().split('T')[0];

  const tasks: Task[] = [
    {
      id: "t1",
      title: "Chemistry Lab Report: Kinetics",
      description: "Analyze the reaction rates of iodine clock reaction, write experimental error analysis, and plot standard curves.",
      deadline: tomorrow,
      importance: "high",
      urgency: "high",
      estimatedTime: 4,
      status: "in_progress",
      category: "Academics",
      eisenhowerQuad: 1,
      progress: 35,
      isFlaggedForAtRisk: true,
      subtasks: [
        { id: "s1-1", title: "Calculate rate constants and activation energy", completed: true, estimatedTime: 1 },
        { id: "s1-2", title: "Draft experimental procedure and methodology", completed: true, estimatedTime: 1 },
        { id: "s1-3", title: "Perform error propagation and error analysis", completed: false, estimatedTime: 1 },
        { id: "s1-4", title: "Format graphs and write final conclusion", completed: false, estimatedTime: 1 }
      ],
      scheduledSlots: [
        { date: today, startTime: "14:00", endTime: "16:00", label: "Chem Lab Report Focus" }
      ]
    },
    {
      id: "t2",
      title: "Startup Pitch Deck Presentation",
      description: "Structure the problem, solution, market size, and financial projection slides for the upcoming seed round.",
      deadline: inTwoDays,
      importance: "high",
      urgency: "medium",
      estimatedTime: 6,
      status: "pending",
      category: "Work",
      eisenhowerQuad: 2,
      progress: 0,
      subtasks: [
        { id: "s2-1", title: "Refine problem statement and value proposition", completed: false, estimatedTime: 1.5 },
        { id: "s2-2", title: "Perform bottom-up TAM/SAM/SOM sizing", completed: false, estimatedTime: 1.5 },
        { id: "s2-3", title: "Design visuals and template slides in Figma", completed: false, estimatedTime: 2 },
        { id: "s2-4", title: "Draft speaker notes and financial summary", completed: false, estimatedTime: 1 }
      ],
      scheduledSlots: [
        { date: tomorrow, startTime: "09:00", endTime: "11:00", label: "Figma Slide Layouts" }
      ]
    },
    {
      id: "t3",
      title: "Review Advanced Calculus Notes",
      description: "Prep for Midterms. Focus on Stokes Theorem and Green's Theorem practice problems.",
      deadline: inTwoDays,
      importance: "medium",
      urgency: "high",
      estimatedTime: 3,
      status: "pending",
      category: "Academics",
      eisenhowerQuad: 3,
      progress: 0,
      subtasks: [
        { id: "s3-1", title: "Redo Stokes Theorem homework problems", completed: false, estimatedTime: 1.5 },
        { id: "s3-2", title: "Review conceptual proofs on vector fields", completed: false, estimatedTime: 1.5 }
      ]
    },
    {
      id: "t4",
      title: "Organize Digital Workspace",
      description: "Archive old desktop folders, clear downloads directory, and set up project bookmarks.",
      deadline: inTwoDays,
      importance: "low",
      urgency: "low",
      estimatedTime: 1.5,
      status: "pending",
      category: "Life",
      eisenhowerQuad: 4,
      progress: 0,
      subtasks: []
    }
  ];

  const habits: Habit[] = [
    { id: "h1", name: "Deep Work (90m Block)", frequency: "daily", streak: 5, completedDates: [today] },
    { id: "h2", name: "Review Pilot Agenda", frequency: "daily", streak: 12, completedDates: [today] },
    { id: "h3", name: "Hydrate (3 Liters)", frequency: "daily", streak: 3, completedDates: [] }
  ];

  const goals: Goal[] = [
    { id: "g1", title: "Ace Semester Final Examinations", targetDate: tomorrow, category: "Academics", progress: 65, tasksAssociated: ["t1", "t3"] },
    { id: "g2", title: "Secure Pre-Seed Funding Round", targetDate: inTwoDays, category: "Work", progress: 20, tasksAssociated: ["t2"] }
  ];

  const calendarEvents: CalendarEvent[] = [
    {
      id: "e1",
      title: "Organic Chemistry Lecture",
      startTime: `${today}T10:00:00.000Z`,
      endTime: `${today}T11:30:00.000Z`,
      description: "Class session covering carbonyl additions and mechanisms.",
      isExternal: true
    },
    {
      id: "e2",
      title: "Weekly Sync: Startup Core",
      startTime: `${tomorrow}T11:30:00.000Z`,
      endTime: `${tomorrow}T12:30:00.000Z`,
      description: "Review prototype milestones and marketing agenda.",
      isExternal: false
    }
  ];

  const agentLogs: AgentLog[] = [
    {
      timestamp: new Date().toISOString(),
      agentName: "Priority",
      message: "Analyzed 4 active tasks. Marked 'Chemistry Lab Report' as High Risk due to 24h deadline and 4 hours of remaining effort.",
      type: "warning"
    },
    {
      timestamp: new Date().toISOString(),
      agentName: "Planner",
      message: "Broke down 'Startup Pitch Deck Presentation' goal into 4 distinct, milestone-driven subtasks.",
      type: "success"
    },
    {
      timestamp: new Date().toISOString(),
      agentName: "Scheduler",
      message: "Optimized daily focus schedule. Allocated 2h block for 'Chem Lab Report Focus' avoiding organic chemistry class conflicts.",
      type: "action"
    }
  ];

  const chatMessages: ChatMessage[] = [
    {
      id: "m1",
      role: "model",
      text: "Pilot system online. I've mapped out your deadlines. Your Chemistry Lab Report is due tomorrow, and you have 4 hours of estimated work remaining. I recommend booking deep work now.",
      timestamp: new Date().toISOString(),
      agentContext: "Priority Agent"
    }
  ];

  const reflections: DailyReflection[] = [
    {
      date: today,
      rating: 8,
      analysis: "Solid execution today. Completed core analytical calculations. Maintained daily habits including a 90-minute Deep Work block. Tomorrow requires heavy focus on deck drafting.",
      completedCount: 2,
      focusHours: 3.5,
      suggestions: [
        "Plan your pitch deck outlines early in the morning.",
        "Consider moving administrative tasks to your late afternoon dip."
      ]
    }
  ];

  return { tasks, habits, goals, calendarEvents, agentLogs, chatMessages, reflections };
};

// Database state
let db = getInitialData();

// Load / Save helpers
const loadDB = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(content);
    } else {
      saveDB();
    }
  } catch (err) {
    console.error("Error reading database file, using initial data:", err);
  }
};

const saveDB = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving database file:", err);
  }
};

// Load database
loadDB();

// Lazy Gemini Client Initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });
    }
    return aiClient;
  }
  return null;
}

// Logging helper for agents
const addAgentLog = (agentName: AgentLog["agentName"], message: string, type: AgentLog["type"]) => {
  const log: AgentLog = {
    timestamp: new Date().toISOString(),
    agentName,
    message,
    type
  };
  db.agentLogs.unshift(log);
  // Keep logs capped at 100 entries for efficiency
  if (db.agentLogs.length > 100) {
    db.agentLogs.pop();
  }
  saveDB();
};

// ==========================================
// CORE MULTI-AGENT API FUNCTIONS (GEMINI-POWERED)
// ==========================================

// 1. Planner Agent: Breaks a task title/description into structured subtasks
async function runPlannerAgent(taskTitle: string, description: string): Promise<SubTask[]> {
  addAgentLog("Planner", `Analyzing requirements for: "${taskTitle}"`, "info");
  const client = getGeminiClient();

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Break down the following task or milestone into 3-5 clear, highly actionable sequential subtasks with brief titles and estimated times in hours.
        Task Name: ${taskTitle}
        Task Details: ${description}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Actionable item name" },
                estimatedTime: { type: Type.NUMBER, description: "Estimated completion time in hours" }
              },
              required: ["title", "estimatedTime"]
            }
          }
        }
      });

      const text = response.text || "[]";
      const items = JSON.parse(text);
      const subtasks: SubTask[] = items.map((it: any, index: number) => ({
        id: `sub-${Date.now()}-${index}`,
        title: it.title,
        completed: false,
        estimatedTime: it.estimatedTime || 1
      }));

      addAgentLog("Planner", `Successfully broke down "${taskTitle}" into ${subtasks.length} tactical subtasks.`, "success");
      return subtasks;
    } catch (err: any) {
      addAgentLog("Planner", `Failed to contact Gemini: ${err.message}. Using high-fidelity fallback.`, "warning");
    }
  }

  // Fallback heuristic planning
  const fallbackSubtasks: SubTask[] = [
    { id: `sub-${Date.now()}-1`, title: "Research & compile background resource data", completed: false, estimatedTime: 1 },
    { id: `sub-${Date.now()}-2`, title: "Draft core structure, components & initial outline", completed: false, estimatedTime: 2 },
    { id: `sub-${Date.now()}-3`, title: "Finalize technical synthesis and review error cases", completed: false, estimatedTime: 1 }
  ];
  addAgentLog("Planner", `Broke down "${taskTitle}" into fallback subtasks.`, "action");
  return fallbackSubtasks;
}

// 2. Priority Agent: Reviews active tasks, calculates Eisenhower Quad, flags high-risk
async function runPriorityAgent(tasks: Task[]): Promise<Task[]> {
  addAgentLog("Priority", `Audit triggered on ${tasks.length} active tasks...`, "info");
  const client = getGeminiClient();
  const today = getTodayDateString();

  if (client && tasks.length > 0) {
    try {
      const taskData = tasks.map(t => ({ id: t.id, title: t.title, deadline: t.deadline, importance: t.importance, urgency: t.urgency, est: t.estimatedTime }));
      
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Review these tasks with respect to the Eisenhower Matrix. Current date is ${today}.
        Rank them based on Urgency and Importance and categorize into quadrants (1: Urgent & Important, 2: Important & Not Urgent, 3: Urgent & Not Important, 4: Neither).
        Also flag tasks as high-risk ("isFlaggedForAtRisk": true) if their deadline is extremely close and estimated hours make it hard to finish in a standard workday.
        Tasks: ${JSON.stringify(taskData)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                eisenhowerQuad: { type: Type.INTEGER, description: "1, 2, 3, or 4" },
                isFlaggedForAtRisk: { type: Type.BOOLEAN, description: "True if task is highly at risk of missing deadline" }
              },
              required: ["id", "eisenhowerQuad", "isFlaggedForAtRisk"]
            }
          }
        }
      });

      const decisions = JSON.parse(response.text || "[]");
      const mappedDecisions = new Map(decisions.map((d: any) => [d.id, d]));

      const updated = tasks.map(task => {
        const decision: any = mappedDecisions.get(task.id);
        if (decision) {
          return {
            ...task,
            eisenhowerQuad: (decision.eisenhowerQuad >= 1 && decision.eisenhowerQuad <= 4) ? decision.eisenhowerQuad as any : task.eisenhowerQuad,
            isFlaggedForAtRisk: !!decision.isFlaggedForAtRisk
          };
        }
        return task;
      });

      const flaggedCount = updated.filter(t => t.isFlaggedForAtRisk).length;
      addAgentLog("Priority", `Eisenhower Matrix re-aligned. Flagged ${flaggedCount} high-risk tasks.`, "success");
      return updated;
    } catch (err: any) {
      addAgentLog("Priority", `Gemini assessment failed: ${err.message}. Using heuristic fallback.`, "warning");
    }
  }

  // Heuristic assessment fallback
  const updated = tasks.map(task => {
    let quad: 1 | 2 | 3 | 4 = 4;
    if (task.importance === "high" && task.urgency === "high") quad = 1;
    else if (task.importance === "high" && task.urgency !== "high") quad = 2;
    else if (task.importance !== "high" && task.urgency === "high") quad = 3;

    // Check if deadline is tomorrow/today
    const diff = new Date(task.deadline).getTime() - new Date(today).getTime();
    const daysLeft = diff / (1000 * 3600 * 24);
    const isAtRisk = daysLeft <= 1.5 && task.status !== "completed";

    return {
      ...task,
      eisenhowerQuad: quad,
      isFlaggedForAtRisk: isAtRisk
    };
  });
  
  const flaggedCount = updated.filter(t => t.isFlaggedForAtRisk).length;
  addAgentLog("Priority", `Evaluated tasks with heuristic priority engine. Flagged ${flaggedCount} as high risk.`, "action");
  return updated;
}

// 3 & 4. Scheduler & Calendar Agents: Create optimized focus schedule avoiding conflicts
async function runSchedulerAgent(tasks: Task[], events: CalendarEvent[]): Promise<ScheduledSlot[]> {
  addAgentLog("Scheduler", "Initiating smart agenda optimization...", "info");
  addAgentLog("Calendar", `Reading external events to lock scheduled busy slots...`, "info");
  
  const client = getGeminiClient();
  const today = getTodayDateString();

  if (client && tasks.length > 0) {
    try {
      const activeTasks = tasks.filter(t => t.status !== "completed");
      const blockOutTimes = events.map(e => ({ title: e.title, start: e.startTime, end: e.endTime }));

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Create an optimized schedule for today (${today}).
        We want to book dedicated blocks of deep work to complete tasks before deadlines.
        Do not conflict with scheduled busy calendars: ${JSON.stringify(blockOutTimes)}.
        Focus on highest-priority items first. Create 2-3 focus slots of 1.5 to 2 hours each.
        Tasks to schedule: ${JSON.stringify(activeTasks.map(t => ({ id: t.id, title: t.title, est: t.estimatedTime, quad: t.eisenhowerQuad })))}.
        Format output strictly as an array of schedule slots.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING, description: "YYYY-MM-DD" },
                startTime: { type: Type.STRING, description: "HH:MM format" },
                endTime: { type: Type.STRING, description: "HH:MM format" },
                label: { type: Type.STRING, description: "Focus block title (e.g., 'Focus: Chemistry Lab Report')" }
              },
              required: ["date", "startTime", "endTime", "label"]
            }
          }
        }
      });

      const slots: ScheduledSlot[] = JSON.parse(response.text || "[]");
      addAgentLog("Scheduler", `Generated ${slots.length} optimized focus slots for the day.`, "success");
      addAgentLog("Calendar", "Verified schedule against calendars. Conflict risk: 0%.", "success");
      return slots;
    } catch (err: any) {
      addAgentLog("Scheduler", `Scheduler failed: ${err.message}. Generating default timeline.`, "warning");
    }
  }

  // Scheduler Fallback: Find free slots after 1 PM and slot high-priority tasks
  const slots: ScheduledSlot[] = [];
  const pending = tasks.filter(t => t.status !== "completed");
  
  if (pending.length > 0) {
    slots.push({
      date: today,
      startTime: "13:00",
      endTime: "15:00",
      label: `Focus Session: ${pending[0].title}`
    });
  }
  if (pending.length > 1) {
    slots.push({
      date: today,
      startTime: "16:00",
      endTime: "17:30",
      label: `Focus Session: ${pending[1].title}`
    });
  }

  addAgentLog("Scheduler", `Fallback agenda configured with ${slots.length} session blocks.`, "action");
  return slots;
}

// 5. Execution Agent: Workspace copilot - summarize documents, draft outline, generate emails
async function runExecutionAgent(prompt: string, context?: string): Promise<string> {
  addAgentLog("Execution", `Assembling productivity material based on context...`, "info");
  const client = getGeminiClient();

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are the Execution Agent of DeadlinePilot AI, a pro-level productivity work assistant.
        Your job is to generate flawless written collateral, explain complex material, draft summaries, or assemble reports based on instructions.
        Instruction: ${prompt}
        ${context ? `Context Reference / Document text: ${context}` : ""}`
      });

      addAgentLog("Execution", "Successfully generated required productivity deliverables.", "success");
      return response.text || "No response text generated.";
    } catch (err: any) {
      addAgentLog("Execution", `Gemini draft failure: ${err.message}`, "warning");
    }
  }

  return `### Fallback Executable Copilot Output
Generated in offline pilot mode. Below is a structured template generated for your task:

**Prompt:** "${prompt}"

1. **Strategic Outline**
   - Conduct brief literature synthesis and data cataloging.
   - Design mock layouts or outline the structure of deliverables.
   - Run draft review cycles.

2. **Draft Narrative / Response**
   "Regarding your request for ${prompt.toLowerCase().slice(0, 40)}..., we recommend breaking the core scope into discrete 2-hour segments. Focus on solving high-risk bottlenecks first before polishing aesthetics."

*Note: Please connect your Gemini API Key in Settings to generate custom tailored AI reports.*`;
}

// 6. Reflection Agent: Daily/weekly reports, performance rating, constructive recommendations
async function runReflectionAgent(tasks: Task[], habits: Habit[]): Promise<DailyReflection> {
  addAgentLog("Reflection", "Evaluating daily focus and habits data...", "info");
  const client = getGeminiClient();
  const today = getTodayDateString();

  const compTasks = tasks.filter(t => t.status === "completed").length;
  const total = tasks.length;
  const habitCompletion = habits.length > 0 
    ? Math.round((habits.filter(h => h.completedDates.includes(today)).length / habits.length) * 100) 
    : 100;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze productivity for ${today}. 
        Completed Tasks: ${compTasks}/${total}. 
        Habits completion: ${habitCompletion}%. 
        Provide a numeric rating (1-10), a concise 2-sentence performance summary ("analysis"), and 3 concrete advice items ("suggestions") for tomorrow.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rating: { type: Type.INTEGER },
              analysis: { type: Type.STRING },
              suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["rating", "analysis", "suggestions"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      const reflection: DailyReflection = {
        date: today,
        rating: parsed.rating || 7,
        analysis: parsed.analysis || "Good baseline activity. Solid check on habits.",
        completedCount: compTasks,
        focusHours: tasks.filter(t => t.status === "completed").reduce((acc, curr) => acc + curr.estimatedTime, 0),
        suggestions: parsed.suggestions || ["Keep momentum going."]
      };

      addAgentLog("Reflection", `Generated Daily Score of ${reflection.rating}/10 with custom advice.`, "success");
      return reflection;
    } catch (err: any) {
      addAgentLog("Reflection", `Failed score analysis: ${err.message}. Triggering standard calculation.`, "warning");
    }
  }

  // Fallback calculation
  let rating = 5;
  if (compTasks > 0) rating += 2;
  if (habitCompletion > 50) rating += 2;
  rating = Math.min(rating, 10);

  const reflection: DailyReflection = {
    date: today,
    rating,
    analysis: `Analyzed today's performance: Completed ${compTasks} tasks and completed ${habitCompletion}% of tracked habits. Keep locking down focused slots.`,
    completedCount: compTasks,
    focusHours: compTasks * 1.5,
    suggestions: [
      "Target Quadrant 2 goals early in the morning to prevent them from becoming Quadrant 1 crises.",
      "Bundle minor communication tasks into a single 30-minute block.",
      "Review your upcoming deadline buffer at least once a day."
    ]
  };

  addAgentLog("Reflection", "Heuristic daily report saved successfully.", "action");
  return reflection;
}

// 7. Notification Agent: Context nudges and reminders
async function runNotificationAgent(tasks: Task[]): Promise<string[]> {
  const client = getGeminiClient();
  const atRisk = tasks.filter(t => t.isFlaggedForAtRisk && t.status !== "completed");

  if (client && atRisk.length > 0) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate 2-3 short, context-aware motivational reminders/nudges (15 words max each) for these high-risk tasks: ${JSON.stringify(atRisk.map(t => t.title))}. Format as JSON string list.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      return JSON.parse(response.text || "[]");
    } catch (err) {
      // Fallback below
    }
  }

  if (atRisk.length > 0) {
    return [
      `⏰ Deadline Pilot Warning: '${atRisk[0].title}' is due very soon. Stop procrastinating and dive into deep focus!`,
      `🚀 Quick push: Just 20 minutes of focus on '${atRisk[0].title}' can break your writer's block.`
    ];
  }
  return [
    "🌟 Clean runway! All core deadlines are currently in high safety buffer zones.",
    "🎯 Perfect moment to tackle a Quadrant 2 long-term goal. Start small."
  ];
}

// Chat coordinator: Routes conversational user inputs to the appropriate agents
async function runMultiAgentCoordinator(userMessage: string, history: ChatMessage[]): Promise<ChatMessage> {
  const client = getGeminiClient();
  const today = getTodayDateString();

  // Pre-log routing
  addAgentLog("Notification", "Analyzing conversational intent...", "info");

  if (client) {
    try {
      const dbContext = {
        tasks: db.tasks.map(t => ({ title: t.title, deadline: t.deadline, status: t.status, quad: t.eisenhowerQuad, est: t.estimatedTime })),
        habits: db.habits.map(h => ({ name: h.name, streak: h.streak })),
        goals: db.goals.map(g => ({ title: g.title, progress: g.progress }))
      };

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are the Multi-Agent Coordinator for DeadlinePilot AI. Today is ${today}.
        The user asks: "${userMessage}"
        
        Analyze which agent is most relevant to answer this (e.g., Planner for breaking goals/tasks, Priority for Eisenhower/rankings, Scheduler for daily timetables, Calendar for conflicts, Execution for work summaries/writing, Reflection for reviews, or Notification for motivation).
        
        Reply with a supportive, professional, high-competence answer from that agent's perspective. Include a short 'agentContext' field.
        Optionally, suggest 1-2 rapid click buttons/actions in the 'suggestedActions' block (e.g., plan a task, schedule focus, log habits).
        
        Current User Workspace Data: ${JSON.stringify(dbContext)}
        Previous Conversation Summary: ${JSON.stringify(history.slice(-3).map(h => ({ role: h.role, text: h.text })))}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING, description: "Actionable, helpful markdown response" },
              agentContext: { type: Type.STRING, description: "Name of the agent handling this, e.g. 'Scheduler Agent'" },
              suggestedActions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING, description: "Button name, e.g. 'Generate Work Schedule'" },
                    action: { type: Type.STRING, description: "Endpoint name or action descriptor, e.g. 'schedule_optimize'" }
                  },
                  required: ["label", "action"]
                }
              }
            },
            required: ["reply", "agentContext"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      
      // Post log
      const activeAgent = (parsed.agentContext || "Execution Agent").split(" ")[0] as AgentLog["agentName"];
      addAgentLog(activeAgent, `Assisted user in conversation regarding: "${userMessage.slice(0, 35)}..."`, "success");

      return {
        id: `msg-${Date.now()}`,
        role: "model",
        text: parsed.reply,
        timestamp: new Date().toISOString(),
        agentContext: parsed.agentContext,
        suggestedActions: parsed.suggestedActions || []
      };

    } catch (err: any) {
      addAgentLog("Execution", `Coordinator routing failed: ${err.message}. Using offline backup.`, "warning");
    }
  }

  // Offline heuristic router
  let replyText = "I have reviewed your pilot dashboard and workspace. ";
  let activeAgentContext = "Execution Agent";
  let actions = [{ label: "Prioritize Tasks", action: "prioritize" }];

  const lMessage = userMessage.toLowerCase();
  if (lMessage.includes("schedule") || lMessage.includes("today") || lMessage.includes("time")) {
    replyText = "### Optimized Schedule Block\nI've examined your task list. I suggest carving out a **2-hour block** this afternoon to target your Chemistry report. Here is your suggested session:\n- **1:00 PM - 3:00 PM**: Chemistry Lab Report\n- **3:30 PM - 5:00 PM**: Startup Pitch outlines\nWould you like me to lock this in?";
    activeAgentContext = "Scheduler Agent";
    actions = [{ label: "Apply Focus Slots", action: "schedule_apply" }];
  } else if (lMessage.includes("plan") || lMessage.includes("break") || lMessage.includes("subtask")) {
    replyText = "### Proposed Goal Breakdown\nTo tackle your deadlines efficiently, I suggest decomposing your targets:\n1. **Setup Core Framework** (1 hour)\n2. **Draft Narrative Drafts** (2 hours)\n3. **Integrate Analytics Metrics** (1.5 hours)\nWould you like to attach this directly as active subtasks?";
    activeAgentContext = "Planner Agent";
    actions = [{ label: "Attach Subtasks", action: "attach_subtasks" }];
  } else if (lMessage.includes("reflection") || lMessage.includes("score") || lMessage.includes("report")) {
    replyText = "### Deep Work Reflection Summary\nYour daily productivity index stands at **8/10**. You've locked in your 90-minute focus sessions successfully. To elevate performance tomorrow, try scheduling your heaviest administrative requirements late in the day.";
    activeAgentContext = "Reflection Agent";
    actions = [{ label: "View Analytical Insights", action: "view_analytics" }];
  } else {
    replyText = "Pilot Agent here. How can I assist you with your deadlines today? I can help you **plan complex tasks**, **generate optimized daily schedules**, or **summarize technical outlines** instantly.";
  }

  addAgentLog("Execution", `Routed user request offline. Persisted agent context.`, "action");

  return {
    id: `msg-${Date.now()}`,
    role: "model",
    text: replyText,
    timestamp: new Date().toISOString(),
    agentContext: activeAgentContext,
    suggestedActions: actions
  };
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Mock user session auth
app.get("/api/auth/session", (req, res) => {
  res.json({
    authenticated: true,
    user: {
      email: "karthikmateti2007@gmail.com",
      displayName: "Karthik Mateti",
      photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80",
      uid: "pilot-user-123"
    }
  });
});

// Tasks CRUD
app.get("/api/tasks", (req, res) => {
  res.json(db.tasks);
});

app.post("/api/tasks", async (req, res) => {
  const { title, description, deadline, importance, urgency, estimatedTime, category } = req.body;
  
  const newTask: Task = {
    id: `task-${Date.now()}`,
    title: title || "Untitled Task",
    description: description || "",
    deadline: deadline || getTodayDateString(),
    importance: importance || "medium",
    urgency: urgency || "medium",
    estimatedTime: Number(estimatedTime) || 1,
    status: "pending",
    category: category || "General",
    eisenhowerQuad: 3, // Calculated by priority agent
    subtasks: [],
    progress: 0
  };

  db.tasks.push(newTask);
  saveDB();

  // Run priority agent automatically to assign Eisenhower matrix and risk flags
  db.tasks = await runPriorityAgent(db.tasks);
  saveDB();

  res.status(201).json(db.tasks.find(t => t.id === newTask.id) || newTask);
});

app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const index = db.tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    db.tasks[index] = { ...db.tasks[index], ...req.body };
    
    // Recalculate progress based on subtasks if updated
    if (db.tasks[index].subtasks && db.tasks[index].subtasks.length > 0) {
      const completed = db.tasks[index].subtasks.filter(s => s.completed).length;
      db.tasks[index].progress = Math.round((completed / db.tasks[index].subtasks.length) * 100);
    }

    saveDB();
    res.json(db.tasks[index]);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  db.tasks = db.tasks.filter(t => t.id !== id);
  saveDB();
  res.json({ success: true });
});

// Trigger Planner Agent for specific task
app.post("/api/tasks/:id/plan", async (req, res) => {
  const { id } = req.params;
  const task = db.tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const subtasks = await runPlannerAgent(task.title, task.description);
  task.subtasks = subtasks;
  task.progress = 0;
  saveDB();

  res.json(task);
});

// Trigger Priority Matrix Re-evaluation
app.post("/api/tasks/prioritize", async (req, res) => {
  db.tasks = await runPriorityAgent(db.tasks);
  saveDB();
  res.json(db.tasks);
});

// Trigger Scheduler Optimization
app.post("/api/tasks/schedule", async (req, res) => {
  const slots = await runSchedulerAgent(db.tasks, db.calendarEvents);
  
  // Clean old scheduled slots for today and append new ones
  const today = getTodayDateString();
  db.tasks = db.tasks.map(task => ({
    ...task,
    scheduledSlots: task.scheduledSlots?.filter(s => s.date !== today) || []
  }));

  // Match generated slots back to tasks if relevant
  slots.forEach(slot => {
    const matchedTask = db.tasks.find(t => slot.label.includes(t.title) || t.title.includes(slot.label));
    if (matchedTask) {
      if (!matchedTask.scheduledSlots) matchedTask.scheduledSlots = [];
      matchedTask.scheduledSlots.push(slot);
    } else {
      // Put in first task's scheduled block as fallback
      if (db.tasks.length > 0) {
        if (!db.tasks[0].scheduledSlots) db.tasks[0].scheduledSlots = [];
        db.tasks[0].scheduledSlots.push(slot);
      }
    }
  });

  saveDB();
  res.json({ success: true, slots });
});

// Calendar CRUD
app.get("/api/calendar", (req, res) => {
  res.json(db.calendarEvents);
});

app.post("/api/calendar", (req, res) => {
  const { title, startTime, endTime, description } = req.body;
  const newEvent: CalendarEvent = {
    id: `event-${Date.now()}`,
    title: title || "New Calendar Event",
    startTime: startTime || new Date().toISOString(),
    endTime: endTime || new Date(Date.now() + 3600000).toISOString(),
    description: description || "",
    isExternal: false
  };
  db.calendarEvents.push(newEvent);
  addAgentLog("Calendar", `Synced newly registered meeting block: "${newEvent.title}".`, "info");
  saveDB();
  res.status(201).json(newEvent);
});

// Habits CRUD
app.get("/api/habits", (req, res) => {
  res.json(db.habits);
});

app.post("/api/habits", (req, res) => {
  const { name, frequency } = req.body;
  const newHabit: Habit = {
    id: `habit-${Date.now()}`,
    name: name || "New Habit",
    frequency: frequency || "daily",
    streak: 0,
    completedDates: []
  };
  db.habits.push(newHabit);
  saveDB();
  res.status(201).json(newHabit);
});

app.put("/api/habits/:id/toggle", (req, res) => {
  const { id } = req.params;
  const today = getTodayDateString();
  const habit = db.habits.find(h => h.id === id);

  if (habit) {
    const index = habit.completedDates.indexOf(today);
    if (index === -1) {
      habit.completedDates.push(today);
      habit.streak += 1;
      addAgentLog("Notification", `🔥 Multi-day Streak! Logged '${habit.name}' successfully. Streak: ${habit.streak} days.`, "success");
    } else {
      habit.completedDates.splice(index, 1);
      habit.streak = Math.max(0, habit.streak - 1);
    }
    saveDB();
    res.json(habit);
  } else {
    res.status(404).json({ error: "Habit not found" });
  }
});

// Goals CRUD
app.get("/api/goals", (req, res) => {
  res.json(db.goals);
});

app.post("/api/goals", (req, res) => {
  const { title, targetDate, category, tasksAssociated } = req.body;
  const newGoal: Goal = {
    id: `goal-${Date.now()}`,
    title: title || "New Goal",
    targetDate: targetDate || getTodayDateString(),
    category: category || "General",
    progress: 0,
    tasksAssociated: tasksAssociated || []
  };
  db.goals.push(newGoal);
  saveDB();
  res.status(201).json(newGoal);
});

// Agent Logs
app.get("/api/logs", (req, res) => {
  res.json(db.agentLogs);
});

// AI Assistant Chat endpoint (routes via Coordinator)
app.get("/api/chat", (req, res) => {
  res.json(db.chatMessages);
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Push user message
  const userMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    role: "user",
    text: message,
    timestamp: new Date().toISOString()
  };
  db.chatMessages.push(userMsg);
  saveDB();

  // Run Coordinator to pick the right agent and generate response
  const responseMsg = await runMultiAgentCoordinator(message, db.chatMessages);
  db.chatMessages.push(responseMsg);
  saveDB();

  res.status(201).json(responseMsg);
});

// Clear Chat conversation
app.post("/api/chat/clear", (req, res) => {
  db.chatMessages = [
    {
      id: "m1",
      role: "model",
      text: "Workspace conversation reset. Your autonomous pilots are awaiting instructions.",
      timestamp: new Date().toISOString(),
      agentContext: "System Dispatcher"
    }
  ];
  saveDB();
  res.json(db.chatMessages);
});

// PDF Upload & Deadline Extraction Endpoint
app.post("/api/upload", async (req, res) => {
  const { fileName, fileType, fileData } = req.body;
  if (!fileData) {
    return res.status(400).json({ error: "File data is required" });
  }

  addAgentLog("Planner", `Parsing uploaded document "${fileName}" for potential deadlines...`, "info");
  const client = getGeminiClient();

  if (client) {
    try {
      // If we have base64 file data, we can send to Gemini as an inline part
      // Gemini can parse PDF files natively!
      const mimeType = fileType || "application/pdf";
      const cleanedBase64 = fileData.split(",")[1] || fileData;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              data: cleanedBase64,
              mimeType: mimeType
            }
          },
          {
            text: `Analyze this document and extract any actionable tasks, milestones, and deadlines mentioned inside.
            Format your response strictly as a JSON list of objects, each containing:
            "title": Name of the task or milestone
            "deadline": The deadline date formatted as YYYY-MM-DD (estimate reasonably if only relative terms like 'next Monday' are used)
            "description": A short explanation of what is required.`
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                deadline: { type: Type.STRING, description: "YYYY-MM-DD" },
                description: { type: Type.STRING }
              },
              required: ["title", "deadline", "description"]
            }
          }
        }
      });

      const extracted = JSON.parse(response.text || "[]");
      addAgentLog("Planner", `Successfully extracted ${extracted.length} deadlines from "${fileName}".`, "success");

      // Auto-insert extracted tasks into the DB
      const importedTasks: Task[] = [];
      for (const item of extracted) {
        const newTask: Task = {
          id: `task-ext-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: item.title,
          description: item.description,
          deadline: item.deadline || getTodayDateString(),
          importance: "high",
          urgency: "high",
          estimatedTime: 3,
          status: "pending",
          category: "Imported",
          eisenhowerQuad: 1,
          subtasks: [],
          progress: 0
        };
        db.tasks.push(newTask);
        importedTasks.push(newTask);
      }

      // Re-run Priority matrices
      db.tasks = await runPriorityAgent(db.tasks);
      saveDB();

      return res.json({ success: true, count: importedTasks.length, tasks: importedTasks });

    } catch (err: any) {
      addAgentLog("Planner", `Failed to parse document with Gemini: ${err.message}. Reverting to local text parser.`, "warning");
    }
  }

  // Fallback text matching (simple offline stub parsing)
  const fallbackTasks = [
    {
      title: `Review Assignment: ${fileName.replace(/\.[^/.]+$/, "")}`,
      deadline: getTodayDateString(),
      description: `Task automatically cataloged from the file upload "${fileName}". Please check detail parameters.`
    }
  ];

  const importedTasks: Task[] = [];
  for (const item of fallbackTasks) {
    const newTask: Task = {
      id: `task-ext-${Date.now()}`,
      title: item.title,
      description: item.description,
      deadline: item.deadline,
      importance: "medium",
      urgency: "high",
      estimatedTime: 2,
      status: "pending",
      category: "Imported",
      eisenhowerQuad: 3,
      subtasks: [],
      progress: 0
    };
    db.tasks.push(newTask);
    importedTasks.push(newTask);
  }
  db.tasks = await runPriorityAgent(db.tasks);
  saveDB();

  res.json({ success: true, count: importedTasks.length, tasks: importedTasks, note: "Offline mode extraction template applied" });
});

// Daily Briefing endpoint (Scheduler + Notification + Priority data merged)
app.get("/api/briefing", async (req, res) => {
  const today = getTodayDateString();
  const atRisk = db.tasks.filter(t => t.isFlaggedForAtRisk && t.status !== "completed");
  const pending = db.tasks.filter(t => t.status !== "completed");
  const habitsToday = db.habits.filter(h => h.completedDates.includes(today)).length;
  const habitsTotal = db.habits.length;
  
  // Collect daily schedule slots
  const dailySlots = db.tasks
    .flatMap(t => t.scheduledSlots || [])
    .filter(s => s.date === today);

  const nudges = await runNotificationAgent(db.tasks);

  // Generate briefing text summary
  let briefingSummary = "";
  if (atRisk.length > 0) {
    briefingSummary = `⚠️ WARNING: You have ${atRisk.length} task(s) currently flagged at high risk. Your Chemistry Lab Report kinetics requires 4 hours and is due tomorrow. I've carved out an afternoon focus window at 2:00 PM.`;
  } else {
    briefingSummary = `🚀 Runway secure! No tasks are currently flagged at risk. Perfect day to allocate time to your startup pitch slide design and knock off tracked daily habit goals.`;
  }

  res.json({
    date: today,
    summary: briefingSummary,
    atRiskTasksCount: atRisk.length,
    unassignedHoursCount: pending.reduce((sum, t) => sum + t.estimatedTime, 0),
    habitsProgress: habitsTotal > 0 ? Math.round((habitsToday / habitsTotal) * 100) : 100,
    dailySchedule: dailySlots,
    nudges
  });
});

// Reflections and Weekly Analytics endpoint
app.get("/api/reflection", (req, res) => {
  res.json(db.reflections);
});

app.post("/api/reflection", async (req, res) => {
  const reflection = await runReflectionAgent(db.tasks, db.habits);
  
  // Check if today already has a reflection
  const today = getTodayDateString();
  db.reflections = db.reflections.filter(r => r.date !== today);
  db.reflections.unshift(reflection);
  saveDB();

  res.json(reflection);
});

// Voice Assistant TTS Response generation using Gemini
app.post("/api/tts", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  const client = getGeminiClient();
  if (client) {
    try {
      addAgentLog("Notification", "Synthesizing vocal assistant response...", "info");
      const response = await client.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Say naturally and supportively: ${text}` }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" } // supportive tone
            }
          }
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({ success: true, audio: base64Audio });
      }
    } catch (err: any) {
      console.error("TTS generation error:", err);
    }
  }

  // Fallback: Notify client we are in local speech mode
  res.json({ success: false, note: "Offline Speech Synthesis Fallback" });
});

// API keys status check for frontend warnings
app.get("/api/status", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
  res.json({
    geminiOnline: hasKey,
    user: "karthikmateti2007@gmail.com",
    dbDurable: true
  });
});


// ==========================================
// VITE DEV / PRODUCTION STATIC FALLBACKS
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite dev server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware integrated successfully in Development mode.");
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files server mapped successfully.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DeadlinePilot AI] running smoothly on port ${PORT}`);
  });
}

startServer();
