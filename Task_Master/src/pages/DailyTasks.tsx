import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { themes } from '../styles/themes';
import { CheckCircle2, Circle, Trash2, Calendar } from 'lucide-react';
import { format, parse, isToday } from 'date-fns';

const DailyTasks: React.FC = () => {
  const { theme } = useTheme();
  const { dailyTasks, toggleTaskCompletion, deleteTask, resetCompletedTasks } = useTasks();

  // Function to parse time string to Date object for comparison
  const parseTimeString = (timeStr: string | undefined): Date => {
    if (!timeStr) return new Date(0); // Default to epoch time if no time provided
    
    try {
      // Handle different time formats
      if (timeStr.includes('AM') || timeStr.includes('PM')) {
        // For 12-hour format with AM/PM
        return parse(timeStr, 'h:mm a', new Date());
      } else if (timeStr.includes(':')) {
        // For 24-hour format
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
      }
    } catch (error) {
      console.error('Error parsing time:', error);
    }
    
    return new Date(0); // Return epoch time if parsing fails
  };

  // Check if tasks need to be reset at the beginning of a new day
  useEffect(() => {
    const checkAndResetTasks = () => {
      // Check if there are any tasks from previous days that need to be reset
      const tasksNeedReset = dailyTasks.some(task => 
        task.date && !isToday(new Date(task.date)) && task.completed
      );
      
      if (tasksNeedReset) {
        resetCompletedTasks();
      }
    };
    
    checkAndResetTasks();
    
    // Set up a check at midnight to reset tasks
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const midnightTimer = setTimeout(() => {
      resetCompletedTasks();
    }, timeUntilMidnight);
    
    return () => clearTimeout(midnightTimer);
  }, [dailyTasks, resetCompletedTasks]);

  // Sort tasks: uncompleted first (sorted by time), then completed
  const sortedTasks = [...dailyTasks].sort((a, b) => {
    // First sort by completion status
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then sort by time for tasks with the same completion status
    const timeA = parseTimeString(a.startTime);
    const timeB = parseTimeString(b.startTime);
    return timeA.getTime() - timeB.getTime();
  });

  // Function to format time to AM/PM format
  const formatTime = (time: string | undefined) => {
    if (!time) return '';
    
    try {
      // If time is already in AM/PM format, return it
      if (time.includes('AM') || time.includes('PM')) {
        return time;
      }
      
      // If time is in 24-hour format, convert it
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      
      return format(date, 'h:mm a');
    } catch (error) {
      return time;
    }
  };

  // Get current date
  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMMM d');

  return (
    <div className={`${themes[theme].secondary} rounded-lg p-4 md:p-6 shadow-lg`}>
      <div className="mb-6">
        <h2 className={`text-xl md:text-2xl font-bold ${themes[theme].text}`}>My Day</h2>
        <div className="flex items-center mt-2 text-gray-600">
          <Calendar size={16} className="mr-2" />
          <span>{formattedDate}</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className={`${themes[theme].text} opacity-70 mb-2`}>
              No tasks for today.
            </p>
            <p className={`${themes[theme].text} opacity-70`}>
              Add some tasks to get your day started!
            </p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-3 md:p-4 rounded-lg ${themes[theme].border} border hover:shadow-md transition-shadow bg-white`}
            >
              <div className="flex items-center gap-2 md:gap-4 w-full overflow-hidden">
                <button
                  onClick={() => toggleTaskCompletion(task.id, 'daily')}
                  className={`text-${theme}-600 hover:opacity-80 flex-shrink-0`}
                >
                  {task.completed ? (
                    <CheckCircle2 className="text-green-600" size={20} />
                  ) : (
                    <Circle size={20} />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <h3 className={`font-medium truncate ${task.completed ? 'line-through opacity-50' : ''}`}>
                    {task.title}
                  </h3>
                  {task.startTime && (
                    <p className={`text-sm ${themes[theme].text} opacity-70 truncate`}>
                      {formatTime(task.startTime)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteTask(task.id, 'daily')}
                  className="text-red-500 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 flex-shrink-0 ml-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DailyTasks;