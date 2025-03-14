import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { themes } from '../styles/themes';
import { Bell, Calendar, Clock, Trash2, AlertCircle } from 'lucide-react';
import { format, isAfter, isBefore, startOfToday } from 'date-fns';

const Reminders: React.FC = () => {
  const { theme } = useTheme();
  const { reminders, deleteReminder } = useTasks();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const today = startOfToday();

  // Sort and filter reminders
  const sortedReminders = [...reminders].sort((a, b) => {
    const dateA = new Date(`${format(a.date, 'yyyy-MM-dd')}T${a.time}`);
    const dateB = new Date(`${format(b.date, 'yyyy-MM-dd')}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  const filteredReminders = sortedReminders.filter(reminder => {
    const reminderDate = new Date(`${format(reminder.date, 'yyyy-MM-dd')}T${reminder.time}`);
    switch (filter) {
      case 'upcoming':
        return isAfter(reminderDate, today);
      case 'past':
        return isBefore(reminderDate, today);
      default:
        return true;
    }
  });

  // Group reminders by date
  const groupedReminders = filteredReminders.reduce((groups, reminder) => {
    const dateKey = format(reminder.date, 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(reminder);
    return groups;
  }, {} as Record<string, typeof reminders>);

  return (
    <div className={`${themes[theme].secondary} rounded-lg p-6 shadow-lg`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`${themes[theme].primary} p-2 rounded-full`}>
            <Bell className="text-white" size={24} />
          </div>
          <h2 className={`text-2xl font-bold ${themes[theme].text}`}>Reminders</h2>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
              ${filter === 'all' 
                ? `${themes[theme].primary} text-white` 
                : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
              ${filter === 'upcoming' 
                ? `${themes[theme].primary} text-white` 
                : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
              ${filter === 'past' 
                ? `${themes[theme].primary} text-white` 
                : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Past
          </button>
        </div>
      </div>

      {/* Reminders list */}
      <div className="space-y-6">
        {Object.keys(groupedReminders).length === 0 ? (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <AlertCircle size={48} className="text-gray-400" />
            </div>
            <p className={`${themes[theme].text} text-lg font-medium mb-2`}>
              No reminders found
            </p>
            <p className={`${themes[theme].text} opacity-70`}>
              {filter === 'upcoming' 
                ? "You don't have any upcoming reminders." 
                : filter === 'past' 
                  ? "You don't have any past reminders." 
                  : "Add some reminders to stay organized!"}
            </p>
          </div>
        ) : (
          Object.entries(groupedReminders).map(([date, dayReminders]) => (
            <div key={date} className="space-y-3">
              <h3 className={`text-sm font-medium ${themes[theme].text} uppercase tracking-wider`}>
                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="space-y-2">
                {dayReminders.map(reminder => {
                  const reminderDateTime = new Date(`${format(reminder.date, 'yyyy-MM-dd')}T${reminder.time}`);
                  const isPast = isBefore(reminderDateTime, new Date());
                  
                  return (
                    <div
                      key={reminder.id}
                      className={`bg-white rounded-lg border ${themes[theme].border} p-4 ${
                        isPast ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg mb-1">{reminder.title}</h4>
                          {reminder.description && (
                            <p className={`${themes[theme].text} opacity-70 text-sm mb-2`}>
                              {reminder.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{format(reminder.date, 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{format(new Date(`2000-01-01T${reminder.time}`), 'h:mm a')}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this reminder?')) {
                              deleteReminder(reminder.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reminders;