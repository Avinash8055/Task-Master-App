import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { themes } from '../styles/themes';
import { CheckCircle2, Circle, Trash2, Coffee } from 'lucide-react';

const FreeTasks: React.FC = () => {
  const { theme } = useTheme();
  const { freeTasks, toggleTaskCompletion, deleteTask } = useTasks();

  return (
    <div className={`${themes[theme].secondary} rounded-lg p-4 md:p-6 shadow-lg`}>
      <div className="flex items-center gap-3 mb-6">
        <Coffee size={24} className={themes[theme].text} />
        <h2 className={`text-xl md:text-2xl font-bold ${themes[theme].text}`}>Free Time Endeavor</h2>
      </div>
      
      <div className="space-y-3">
        {freeTasks.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className={`${themes[theme].text} opacity-70 mb-2`}>
              No free time endeavors yet.
            </p>
            <p className={`${themes[theme].text} opacity-70`}>
              Add some activities for your leisure time!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {freeTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3 md:p-4 rounded-lg ${themes[theme].border} border hover:shadow-md transition-shadow bg-white`}
              >
                <div className="flex items-center gap-2 md:gap-4 w-full overflow-hidden">
                  <button
                    onClick={() => toggleTaskCompletion(task.id, 'free')}
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
                    {task.description && (
                      <p className={`text-sm ${themes[theme].text} opacity-70 truncate`}>
                        {task.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTask(task.id, 'free')}
                    className="text-red-500 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 flex-shrink-0 ml-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FreeTasks;