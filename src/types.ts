export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  estimatedTime?: number; // in hours
}

export type PriorityLevel = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO String or YYYY-MM-DD
  importance: PriorityLevel;
  urgency: PriorityLevel;
  estimatedTime: number; // in hours
  status: 'pending' | 'in_progress' | 'completed';
  category: string;
  eisenhowerQuad: 1 | 2 | 3 | 4; // 1: Urgent+Important, 2: Important+Not Urgent, 3: Urgent+Not Important, 4: Neither
  subtasks: SubTask[];
  progress: number; // 0 to 100
  scheduledSlots?: ScheduledSlot[];
  lastRescheduledAt?: string;
  isFlaggedForAtRisk?: boolean;
}

export interface ScheduledSlot {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  label: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  isExternal?: boolean; // Google Calendar
  description?: string;
}

export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  completedDates: string[]; // array of YYYY-MM-DD
}

export interface Goal {
  id: string;
  title: string;
  targetDate: string; // YYYY-MM-DD
  category: string;
  progress: number; // 0-100
  tasksAssociated: string[]; // Task IDs
}

export interface AgentLog {
  timestamp: string;
  agentName: 'Planner' | 'Priority' | 'Scheduler' | 'Calendar' | 'Execution' | 'Reflection' | 'Notification';
  message: string;
  type: 'info' | 'warning' | 'success' | 'action';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  agentContext?: string; // which agent responded
  suggestedActions?: { label: string; action: string; payload?: any }[];
}

export interface ProductivityBriefing {
  date: string;
  summary: string;
  atRiskTasksCount: number;
  unassignedHoursCount: number;
  habitsProgress: number; // percentage
  dailySchedule: ScheduledSlot[];
}

export interface DailyReflection {
  date: string;
  rating: number; // 1-10
  analysis: string;
  completedCount: number;
  focusHours: number;
  suggestions: string[];
}
