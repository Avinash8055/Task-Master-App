import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Plus, Calendar, Clock, Coffee, Bell, BarChart2, Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../styles/themes';
import type { ThemeColor, Task } from '../types';
import TaskModal from './TaskModal';
import { useTasks } from '../context/TaskContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const { addDailyTask, addPlannedTask, addFreeTask, addReminder } = useTasks();

  const routes = [
    { path: '/', label: 'My Day', icon: <Calendar size={18} /> },
    { path: '/planned', label: 'Project Tasks', icon: <Clock size={18} /> },
    { path: '/free-time', label: 'Free Time Endeavor', icon: <Coffee size={18} /> },
    { path: '/reminders', label: 'Reminders', icon: <Bell size={18} /> },
    { path: '/analytics', label: 'Analytics', icon: <BarChart2 size={18} /> },
  ];

  const handleTaskSubmit = (taskData: Omit<Task, 'id' | 'completed'>) => {
    switch (location.pathname) {
      case '/':
        addDailyTask(taskData);
        break;
      case '/planned':
        addPlannedTask({ ...taskData, week: 1, projectTitle: 'Default Project' });
        break;
      case '/free-time':
        addFreeTask(taskData);
        break;
      case '/reminders':
        if ('date' in taskData && 'time' in taskData) {
          addReminder({
            title: taskData.title,
            date: taskData.date as Date,
            time: taskData.time as string,
            description: taskData.description || ''
          });
        }
        break;
    }
    setIsTaskModalOpen(false);
  };

  const themeColors = Object.keys(themes) as ThemeColor[];

  return (
    <div className={`min-h-screen ${themes[theme].background}`}>
      {/* Header */}
      <header className={`${themes[theme].primary} text-white p-3 md:p-4 fixed w-full top-0 z-50`}>
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">Task Master</h1>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Stylish Navigation Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setIsMenuOpen(false)}>
            <div 
              className={`absolute right-0 top-[60px] md:top-[68px] w-64 ${themes[theme].secondary} rounded-l-lg shadow-xl transition-transform duration-300 ease-in-out transform translate-x-0 h-[calc(100vh-60px)] md:h-[calc(100vh-68px)] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-4">
                {routes.map((route) => (
                  <Link
                    key={route.path}
                    to={route.path}
                    className={`flex items-center px-6 py-3 ${
                      location.pathname === route.path 
                        ? `${themes[theme].primary} text-white` 
                        : `${themes[theme].text} hover:bg-gray-100`
                    } transition-colors duration-200`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mr-3">{route.icon}</span>
                    <span className={`font-medium ${location.pathname === route.path ? 'text-white' : ''}`}>
                      {route.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-16 md:pt-20 pb-20 md:pb-24 px-3 md:px-4 max-w-4xl mx-auto">
        {children}
      </main>

      {/* Theme Selector Button */}
      <div className="fixed bottom-4 left-4 z-50">
        <div className="relative">
          <button
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className={`${themes[theme].primary} text-white p-3 rounded-full shadow-lg hover:opacity-90 transition-opacity`}
            aria-label="Change theme"
          >
            <Palette size={22} />
          </button>

          {/* Theme Menu */}
          {isThemeMenuOpen && (
            <div 
              className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl p-2 flex flex-col gap-2"
            >
              {themeColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setTheme(color);
                    setIsThemeMenuOpen(false);
                  }}
                  className={`w-6 h-6 rounded-full ${themes[color].primary} hover:opacity-90 transition-opacity`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Task Button */}
      <button
        onClick={() => setIsTaskModalOpen(true)}
        className={`fixed bottom-4 right-4 ${themes[theme].primary} text-white p-3 md:p-4 rounded-full shadow-lg ${themes[theme].hover} flex items-center justify-center`}
        aria-label="Add new task"
      >
        <Plus size={22} />
      </button>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
      />
    </div>
  );
};

export default Layout;