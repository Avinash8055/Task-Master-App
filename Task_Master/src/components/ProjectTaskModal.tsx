import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../styles/themes';
import type { PlannedTask } from '../types';

interface ProjectTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<PlannedTask, 'id' | 'completed'>) => void;
  projectTitle: string;
  initialData?: PlannedTask;
}

const ProjectTaskModal: React.FC<ProjectTaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  projectTitle,
  initialData 
}) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [week, setWeek] = useState(initialData?.week?.toString() || '1');
  const [date, setDate] = useState(
    initialData?.date 
      ? new Date(initialData.date).toISOString().split('T')[0] 
      : ''
  );
  const [startTime, setStartTime] = useState(initialData?.startTime || '');
  const [endTime, setEndTime] = useState(initialData?.endTime || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      title,
      description,
      week: parseInt(week, 10),
      projectTitle,
      date: date ? new Date(date) : undefined,
      startTime,
      endTime
    });

    // Reset form
    setTitle('');
    setDescription('');
    setWeek('1');
    setDate('');
    setStartTime('');
    setEndTime('');
    onClose();
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
          {initialData ? 'Edit Task' : 'Add Task to Project'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className={`block mb-1 ${themes[theme].text}`}>
              Task Title*
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

          <div>
            <label htmlFor="week" className={`block mb-1 ${themes[theme].text}`}>
              Week Number*
            </label>
            <input
              type="number"
              id="week"
              min="1"
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className={`block mb-1 ${themes[theme].text}`}>
              Due Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
            />
          </div>

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

          <button
            type="submit"
            className={`w-full ${themes[theme].primary} text-white py-2 rounded-lg ${themes[theme].hover}`}
          >
            {initialData ? 'Update Task' : 'Add Task'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectTaskModal;