import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Task, PlannedTask, Reminder, TaskHistory, Project } from '../types';
import { isToday, differenceInHours, differenceInDays, format } from 'date-fns';

interface TaskContextType {
  dailyTasks: Task[];
  plannedTasks: PlannedTask[];
  freeTasks: Task[];
  reminders: Reminder[];
  taskHistory: TaskHistory[];
  projects: Project[];
  addDailyTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  addPlannedTask: (task: Omit<PlannedTask, 'id' | 'completed'>) => void;
  addFreeTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  deleteReminder: (id: string) => void;
  toggleTaskCompletion: (id: string, type: 'daily' | 'planned' | 'free') => void;
  deleteTask: (id: string, type: 'daily' | 'planned' | 'free') => void;
  getCompletionStats: () => { name: string, completed: number, total: number }[];
  resetCompletedTasks: () => void;
  addProject: (project: Omit<Project, 'id'>) => string;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
  getAllProjects: () => Project[];
  addTaskToProject: (projectId: string, task: Omit<PlannedTask, 'id' | 'completed'>) => void;
  updateTaskInProject: (projectId: string, task: PlannedTask) => void;
  deleteTaskFromProject: (projectId: string, taskId: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Load data from localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Function to show mobile notification
const showMobileNotification = async (title: string, body: string) => {
  try {
    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;

      // Check if we have notification permission
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          return;
        }
      }

      // Show notification
      await registration.showNotification(title, {
        body,
        icon: '/icon-192x192.png', // Make sure to add your app icon
        tag: 'reminder-notification', // Tag to group notifications
        requireInteraction: true // Keep notification until user interacts
      });
    } else if ('Notification' in window) {
      // Fallback to regular notifications if service worker is not available
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      }
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dailyTasks, setDailyTasks] = useState<Task[]>(() => 
    loadFromStorage('dailyTasks', [])
  );
  const [plannedTasks, setPlannedTasks] = useState<PlannedTask[]>(() => 
    loadFromStorage('plannedTasks', [])
  );
  const [freeTasks, setFreeTasks] = useState<Task[]>(() => 
    loadFromStorage('freeTasks', [])
  );
  const [reminders, setReminders] = useState<Reminder[]>(() => 
    loadFromStorage('reminders', [])
  );
  const [taskHistory, setTaskHistory] = useState<TaskHistory[]>(() => 
    loadFromStorage('taskHistory', [])
  );
  const [projects, setProjects] = useState<Project[]>(() => 
    loadFromStorage('projects', [])
  );
  const [lastResetDate, setLastResetDate] = useState<string>(() => 
    localStorage.getItem('lastResetDate') || new Date().toISOString().split('T')[0]
  );

  // Save current day's tasks to history
  const saveTasksToHistory = useCallback((date: string) => {
    if (dailyTasks.length > 0) {
      const completedCount = dailyTasks.filter(task => task.completed).length;
      const totalCount = dailyTasks.length;
      
      setTaskHistory(prev => {
        const existingEntryIndex = prev.findIndex(entry => entry.date === date);
        
        if (existingEntryIndex >= 0) {
          const updatedHistory = [...prev];
          updatedHistory[existingEntryIndex] = {
            date,
            completed: completedCount,
            total: totalCount
          };
          return updatedHistory;
        }
        
        return [...prev, {
          date,
          completed: completedCount,
          total: totalCount
        }];
      });
    }
  }, [dailyTasks]);

  // Check reminders periodically
  useEffect(() => {
    const checkReminders = async () => {
      const now = new Date();
      
      for (const reminder of reminders) {
        const reminderDate = new Date(`${format(reminder.date, 'yyyy-MM-dd')}T${reminder.time}`);
        const hoursUntilReminder = differenceInHours(reminderDate, now);
        const daysUntilReminder = differenceInDays(reminderDate, now);
        
        // 1 week notification
        if (daysUntilReminder === 7) {
          await showMobileNotification(
            "Upcoming Reminder",
            `"${reminder.title}" is due in 1 week`
          );
        }
        
        // 3 days notification
        if (daysUntilReminder === 3) {
          await showMobileNotification(
            "Upcoming Reminder",
            `"${reminder.title}" is due in 3 days`
          );
        }
        
        // 18 hours notification
        if (hoursUntilReminder === 18) {
          await showMobileNotification(
            "Upcoming Reminder",
            `"${reminder.title}" is due in 18 hours`
          );
        }

        // Due now notification
        if (hoursUntilReminder === 0) {
          await showMobileNotification(
            "Reminder Due",
            `"${reminder.title}" is due now!`
          );
        }
      }
    };

    // Register service worker when component mounts
    const registerServiceWorker = async () => {
      try {
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/service-worker.js');
        }
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    };

    registerServiceWorker();

    // Check reminders every 15 minutes
    const interval = setInterval(checkReminders, 900000);
    checkReminders(); // Initial check

    return () => clearInterval(interval);
  }, [reminders]);

  // Check if we need to reset tasks for a new day
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    if (lastResetDate !== today) {
      // Save current day's tasks to history before resetting
      saveTasksToHistory(lastResetDate);
      
      // Reset completed status for all daily tasks
      setDailyTasks(prev => 
        prev.map(task => ({
          ...task,
          completed: false,
          date: new Date()
        }))
      );
      
      setLastResetDate(today);
      localStorage.setItem('lastResetDate', today);
    }
  }, [lastResetDate, saveTasksToHistory]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  useEffect(() => {
    localStorage.setItem('plannedTasks', JSON.stringify(plannedTasks));
  }, [plannedTasks]);

  useEffect(() => {
    localStorage.setItem('freeTasks', JSON.stringify(freeTasks));
  }, [freeTasks]);

  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('taskHistory', JSON.stringify(taskHistory));
  }, [taskHistory]);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  // Clean up old task history (keep only last 7 days)
  useEffect(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoffDate = sevenDaysAgo.toISOString().split('T')[0];
    
    setTaskHistory(prev => 
      prev.filter(entry => entry.date >= cutoffDate)
    );
  }, []);

  const resetCompletedTasks = useCallback(() => {
    setDailyTasks(prev => 
      prev.map(task => ({
        ...task,
        completed: false,
        date: new Date()
      }))
    );
  }, []);

  const addDailyTask = useCallback((task: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      completed: false,
    };
    setDailyTasks(prev => [...prev, newTask]);
  }, []);

  const addPlannedTask = useCallback((task: Omit<PlannedTask, 'id' | 'completed'>) => {
    const newTask: PlannedTask = {
      ...task,
      id: crypto.randomUUID(),
      completed: false,
    };
    setPlannedTasks(prev => [...prev, newTask]);
  }, []);

  const addFreeTask = useCallback((task: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      completed: false,
    };
    setFreeTasks(prev => [...prev, newTask]);
  }, []);

  const addReminder = useCallback((reminder: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: crypto.randomUUID(),
    };
    setReminders(prev => [...prev, newReminder]);
    
    // Show immediate notification that reminder was set
    showMobileNotification(
      "Reminder Set",
      `Reminder set for "${reminder.title}" on ${format(reminder.date, 'MMM d, yyyy')} at ${reminder.time}`
    );
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  }, []);

  const toggleTaskCompletion = useCallback((id: string, type: 'daily' | 'planned' | 'free') => {
    switch (type) {
      case 'daily':
        setDailyTasks(prev =>
          prev.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
          )
        );
        break;
      case 'planned':
        setPlannedTasks(prev =>
          prev.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
          )
        );
        break;
      case 'free':
        setFreeTasks(prev =>
          prev.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
          )
        );
        break;
    }
  }, []);

  const deleteTask = useCallback((id: string, type: 'daily' | 'planned' | 'free') => {
    switch (type) {
      case 'daily':
        setDailyTasks(prev => prev.filter(task => task.id !== id));
        break;
      case 'planned':
        setPlannedTasks(prev => prev.filter(task => task.id !== id));
        break;
      case 'free':
        setFreeTasks(prev => prev.filter(task => task.id !== id));
        break;
    }
  }, []);

  // Function to get completion stats for analytics
  const getCompletionStats = useCallback(() => {
    // Get current date
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Create an array for the last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    
    // For each day of the week
    for (let i = 0; i < 7; i++) {
      // Calculate the date for this day
      const date = new Date(today);
      date.setDate(today.getDate() - dayOfWeek + i);
      
      // Format date as YYYY-MM-DD
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Check if we have historical data for this date
      const historyEntry = taskHistory.find(entry => entry.date === dateStr);
      
      if (historyEntry) {
        // Use historical data
        result.push({
          name: days[i],
          completed: historyEntry.completed,
          total: historyEntry.total
        });
      } else if (isToday(date)) {
        // For today, use current tasks
        const completed = dailyTasks.filter(task => task.completed).length;
        const total = dailyTasks.length;
        
        result.push({
          name: days[i],
          completed: completed,
          total: Math.max(total, completed) // Ensure total is at least equal to completed
        });
      } else {
        // No data for this day
        result.push({
          name: days[i],
          completed: 0,
          total: 0
        });
      }
    }
    
    return result;
  }, [taskHistory, dailyTasks]);

  // Project management functions
  const addProject = useCallback((project: Omit<Project, 'id'>): string => {
    const id = crypto.randomUUID();
    const newProject: Project = {
      ...project,
      id
    };
    setProjects(prev => [...prev, newProject]);
    return id;
  }, []);

  const updateProject = useCallback((project: Project) => {
    setProjects(prev => 
      prev.map(p => p.id === project.id ? project : p)
    );
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
    
    // Also remove all tasks associated with this project
    setPlannedTasks(prev => 
      prev.filter(task => !projects.find(p => p.id === id)?.tasks.some(t => t.id === task.id))
    );
  }, [projects]);

  const getProject = useCallback((id: string): Project | undefined => {
    return projects.find(project => project.id === id);
  }, [projects]);

  const getAllProjects = useCallback((): Project[] => {
    return projects;
  }, [projects]);

  const addTaskToProject = useCallback((projectId: string, task: Omit<PlannedTask, 'id' | 'completed'>) => {
    const newTask: PlannedTask = {
      ...task,
      id: crypto.randomUUID(),
      completed: false
    };
    
    // Add to project
    setProjects(prev => 
      prev.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            tasks: [...project.tasks, newTask]
          };
        }
        return project;
      })
    );
    
    // Also add to planned tasks
    setPlannedTasks(prev => [...prev, newTask]);
  }, []);

  const updateTaskInProject = useCallback((projectId: string, task: PlannedTask) => {
    // Update in project
    setProjects(prev => 
      prev.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            tasks: project.tasks.map(t => t.id === task.id ? task : t)
          };
        }
        return project;
      })
    );
    
    // Also update in planned tasks
    setPlannedTasks(prev => 
      prev.map(t => t.id === task.id ? task : t)
    );
  }, []);

  const deleteTaskFromProject = useCallback((projectId: string, taskId: string) => {
    // Remove from project
    setProjects(prev => 
      prev.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            tasks: project.tasks.filter(task => task.id !== taskId)
          };
        }
        return project;
      })
    );
    
    // Also remove from planned tasks
    setPlannedTasks(prev => 
      prev.filter(task => task.id !== taskId)
    );
  }, []);

  return (
    <TaskContext.Provider value={{
      dailyTasks,
      plannedTasks,
      freeTasks,
      reminders,
      taskHistory,
      projects,
      addDailyTask,
      addPlannedTask,
      addFreeTask,
      addReminder,
      deleteReminder,
      toggleTaskCompletion,
      deleteTask,
      getCompletionStats,
      resetCompletedTasks,
      addProject,
      updateProject,
      deleteProject,
      getProject,
      getAllProjects,
      addTaskToProject,
      updateTaskInProject,
      deleteTaskFromProject
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};