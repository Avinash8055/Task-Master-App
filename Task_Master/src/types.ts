export interface Task {
  id: string;
  title: string;
  completed: boolean;
  date?: Date;
  startTime?: string;
  endTime?: string;
  description?: string;
}

export interface PlannedTask extends Task {
  week: number;
  projectTitle: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  tasks: PlannedTask[];
}

export interface Reminder {
  id: string;
  title: string;
  date: Date;
  time: string;
  description: string;
}

export interface TaskHistory {
  date: string;
  completed: number;
  total: number;
}

export type ThemeColor = 'blue' | 'purple' | 'green' | 'orange' | 'pink';

export interface AppState {
  theme: ThemeColor;
  dailyTasks: Task[];
  plannedTasks: PlannedTask[];
  freeTasks: Task[];
  reminders: Reminder[];
  taskHistory: TaskHistory[];
}