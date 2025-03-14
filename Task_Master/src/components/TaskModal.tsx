import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../styles/themes';
import type { Task } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'completed'>) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { theme } = useTheme();
  const location = useLocation();
  const isDailyTask = location.pathname === '/';
  const isFreeTask = location.pathname === '/free-time';
  const isReminder = location.pathname === '/reminders';
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [timeHour, setTimeHour] = useState('');
  const [timeMinute, setTimeMinute] = useState('');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDailyTask) {
      const hour = timeHour || '12';
      const minute = timeMinute || '00';
      const formattedTime = `${hour}:${minute.padStart(2, '0')} ${period}`;
      
      // For daily tasks, use today's date
      const today = new Date();
      
      onSubmit({
        title,
        startTime: formattedTime,
        date: today // Add today's date to daily tasks
      });
    } else if (isFreeTask) {
      onSubmit({ title });
    } else if (isReminder) {
      // For reminders, we need both date and time
      if (!date || !startTime) {
        alert('Please select both date and time for the reminder');
        return;
      }
      
      onSubmit({
        title,
        date: new Date(date),
        time: startTime,
        description
      });
    } else {
      onSubmit({
        title,
        date: date ? new Date(date) : undefined,
        startTime,
        endTime,
        description
      });
    }

    setTitle('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setTimeHour('');
    setTimeMinute('');
    setPeriod('AM');
    onClose();
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    
    if (val === '') {
      setTimeMinute('');
    } else {
      const numVal = parseInt(val, 10);
      if (numVal >= 0 && numVal <= 59) {
        setTimeMinute(val);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${themes[theme].secondary} rounded-lg p-6 w-full max-w-md mx-4 relative`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full ${themes[theme].hover}`}
        >
          <X size={20} />
        </button>
        
        <h2 className={`text-xl font-bold mb-4 ${themes[theme].text}`}>
          {isReminder ? 'Add New Reminder' : isDailyTask ? 'Add New Day Task' : isFreeTask ? 'Add Free Time Endeavor' : 'Add New Task'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className={`block mb-1 ${themes[theme].text}`}>
              {isReminder ? 'Reminder Title*' : 'Task Title*'}
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              required
            />
          </div>

          {isDailyTask && (
            <div>
              <label className={`block mb-1 ${themes[theme].text}`}>
                Time*
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center border rounded-md overflow-hidden">
                  <div className="flex-1 flex">
                    <input
                      type="text"
                      value={timeHour}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 12)) {
                          setTimeHour(val);
                        }
                      }}
                      className="w-12 text-center py-2 outline-none"
                      placeholder="12"
                      maxLength={2}
                    />
                    <span className="py-2">:</span>
                    <input
                      type="text"
                      value={timeMinute}
                      onChange={handleMinuteChange}
                      className="w-12 text-center py-2 outline-none"
                      placeholder="00"
                      maxLength={2}
                    />
                  </div>
                  <div className="flex border-l">
                    <button
                      type="button"
                      className={`px-3 py-2 ${period === 'AM' ? `${themes[theme].primary} text-white` : ''}`}
                      onClick={() => setPeriod('AM')}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-2 ${period === 'PM' ? `${themes[theme].primary} text-white` : ''}`}
                      onClick={() => setPeriod('PM')}
                    >
                      PM
                    </button>
                  </div>
                </div>
                <div className={`p-2 ${themes[theme].text}`}>
                  <Clock size={20} />
                </div>
              </div>
            </div>
          )}

          {!isDailyTask && !isFreeTask && (
            <>
              <div>
                <label htmlFor="date" className={`block mb-1 ${themes[theme].text}`}>
                  {isReminder ? 'Reminder Date*' : 'Date'}
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  required={isReminder}
                />
              </div>

              {isReminder ? (
                <div>
                  <label htmlFor="startTime" className={`block mb-1 ${themes[theme].text}`}>
                    Reminder Time*
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    required
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className={`block mb-1 ${themes[theme].text}`}>
                      Start Time
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    />
                  </div>

                  <div>
                    <label htmlFor="endTime" className={`block mb-1 ${themes[theme].text}`}>
                      End Time
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="description" className={`block mb-1 ${themes[theme].text}`}>
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 h-24 resize-none"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className={`w-full ${themes[theme].primary} text-white py-2 rounded-lg ${themes[theme].hover}`}
          >
            {isReminder ? 'Add Reminder' : 'Add Task'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;