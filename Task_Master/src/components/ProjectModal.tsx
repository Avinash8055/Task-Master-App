import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../styles/themes';
import type { Project } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Omit<Project, 'id'>) => void;
  initialData?: Project;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [startDate, setStartDate] = useState(
    initialData?.startDate 
      ? new Date(initialData.startDate).toISOString().split('T')[0] 
      : ''
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate 
      ? new Date(initialData.endDate).toISOString().split('T')[0] 
      : ''
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      tasks: initialData?.tasks || []
    });

    // Reset form
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
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
          {initialData ? 'Edit Project' : 'Create New Project'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className={`block mb-1 ${themes[theme].text}`}>
              Project Title*
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className={`block mb-1 ${themes[theme].text}`}>
                Start Date*
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                required
              />
            </div>

            <div>
              <label htmlFor="endDate" className={`block mb-1 ${themes[theme].text}`}>
                End Date*
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full ${themes[theme].primary} text-white py-2 rounded-lg ${themes[theme].hover}`}
          >
            {initialData ? 'Update Project' : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;