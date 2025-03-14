import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { themes } from '../styles/themes';
import { CheckCircle2, Circle, Calendar, Clock, Trash2, Plus, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import ProjectModal from '../components/ProjectModal';
import ProjectTaskModal from '../components/ProjectTaskModal';
import type { Project, PlannedTask } from '../types';

const PlannedTasks: React.FC = () => {
  const { theme } = useTheme();
  const { 
    projects, 
    addProject, 
    updateProject, 
    deleteProject, 
    addTaskToProject, 
    updateTaskInProject, 
    deleteTaskFromProject,
    toggleTaskCompletion 
  } = useTasks();
  
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentTask, setCurrentTask] = useState<PlannedTask | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  const handleAddProject = (projectData: Omit<Project, 'id'>) => {
    addProject(projectData);
    setIsProjectModalOpen(false);
  };

  const handleEditProject = (project: Project) => {
    setCurrentProject(project);
    setIsProjectModalOpen(true);
  };

  const handleUpdateProject = (projectData: Omit<Project, 'id'>) => {
    if (currentProject) {
      updateProject({
        ...projectData,
        id: currentProject.id,
        tasks: currentProject.tasks
      });
    }
    setCurrentProject(null);
    setIsProjectModalOpen(false);
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project and all its tasks?')) {
      deleteProject(id);
    }
  };

  const handleAddTask = (projectId: string, projectTitle: string) => {
    setCurrentProject(projects.find(p => p.id === projectId) || null);
    setCurrentTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (projectId: string, task: PlannedTask) => {
    setCurrentProject(projects.find(p => p.id === projectId) || null);
    setCurrentTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = (taskData: Omit<PlannedTask, 'id' | 'completed'>) => {
    if (currentProject) {
      if (currentTask) {
        // Update existing task
        updateTaskInProject(currentProject.id, {
          ...taskData,
          id: currentTask.id,
          completed: currentTask.completed
        });
      } else {
        // Add new task
        addTaskToProject(currentProject.id, taskData);
      }
    }
    setCurrentProject(null);
    setCurrentTask(null);
    setIsTaskModalOpen(false);
  };

  const handleDeleteTask = (projectId: string, taskId: string) => {
    deleteTaskFromProject(projectId, taskId);
  };

  const toggleProjectExpand = (projectId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // Calculate project progress
  const getProjectProgress = (project: Project) => {
    if (project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  // Calculate days remaining
  const getDaysRemaining = (endDate: Date) => {
    const today = new Date();
    const end = new Date(endDate);
    const days = differenceInDays(end, today);
    return days >= 0 ? days : 0;
  };

  return (
    <div className={`${themes[theme].secondary} rounded-lg p-4 md:p-6 shadow-lg`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl md:text-2xl font-bold ${themes[theme].text}`}>Projects</h2>
        <button
          onClick={() => {
            setCurrentProject(null);
            setIsProjectModalOpen(true);
          }}
          className={`${themes[theme].primary} text-white px-3 py-1.5 rounded-lg flex items-center`}
        >
          <Plus size={16} className="mr-1" />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8">
          <p className={`${themes[theme].text} opacity-70 mb-2`}>
            No projects yet.
          </p>
          <p className={`${themes[theme].text} opacity-70`}>
            Create a new project to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => {
            const progress = getProjectProgress(project);
            const daysRemaining = getDaysRemaining(project.endDate);
            const isExpanded = expandedProjects[project.id] !== false; // Default to expanded
            
            return (
              <div key={project.id} className="border rounded-lg overflow-hidden bg-white">
                {/* Project Header */}
                <div className={`${themes[theme].primary} text-white p-4`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg md:text-xl font-semibold">{project.title}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
                        <span className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {format(new Date(project.startDate), 'MMM d')} - {format(new Date(project.endDate), 'MMM d, yyyy')}
                        </span>
                        <span>{daysRemaining} days remaining</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditProject(project)}
                        className="p-1.5 hover:bg-white/20 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-1.5 hover:bg-white/20 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        onClick={() => toggleProjectExpand(project.id)}
                        className="p-1.5 hover:bg-white/20 rounded"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-white/30 rounded-full h-2.5">
                      <div 
                        className="bg-white h-2.5 rounded-full" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="p-4">
                    {/* Project description */}
                    {project.description && (
                      <p className="text-gray-600 mb-4">{project.description}</p>
                    )}
                    
                    {/* Tasks section */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Tasks</h4>
                        <button
                          onClick={() => handleAddTask(project.id, project.title)}
                          className={`${themes[theme].primary} text-white px-2 py-1 rounded text-sm flex items-center`}
                        >
                          <Plus size={14} className="mr-1" />
                          Add Task
                        </button>
                      </div>
                      
                      {project.tasks.length === 0 ? (
                        <p className="text-gray-500 text-sm py-2">No tasks yet. Add some tasks to track your progress.</p>
                      ) : (
                        <div className="space-y-2">
                          {/* Group tasks by week */}
                          {Array.from(new Set(project.tasks.map(task => task.week))).sort((a, b) => a - b).map(week => (
                            <div key={`week-${week}`} className="mb-4">
                              <h5 className={`text-sm font-medium ${themes[theme].text} mb-2`}>Week {week}</h5>
                              <div className="space-y-2 pl-2">
                                {project.tasks
                                  .filter(task => task.week === week)
                                  .map(task => (
                                    <div 
                                      key={task.id}
                                      className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm"
                                    >
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <button
                                          onClick={() => toggleTaskCompletion(task.id, 'planned')}
                                          className="flex-shrink-0"
                                        >
                                          {task.completed ? (
                                            <CheckCircle2 className="text-green-600" size={18} />
                                          ) : (
                                            <Circle size={18} />
                                          )}
                                        </button>
                                        <div className="min-w-0">
                                          <h6 className={`font-medium truncate ${task.completed ? 'line-through text-gray-400' : ''}`}>
                                            {task.title}
                                          </h6>
                                          {(task.date || task.startTime) && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                              {task.date && (
                                                <span className="flex items-center">
                                                  <Calendar size={12} className="mr-1" />
                                                  {format(new Date(task.date), 'MMM d')}
                                                </span>
                                              )}
                                              {task.startTime && (
                                                <span className="flex items-center">
                                                  <Clock size={12} className="mr-1" />
                                                  {task.startTime}{task.endTime && ` - ${task.endTime}`}
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => handleEditTask(project.id, task)}
                                          className="p-1 text-gray-500 hover:text-gray-700 rounded"
                                        >
                                          <Edit size={14} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteTask(project.id, task.id)}
                                          className="p-1 text-red-500 hover:text-red-700 rounded"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setCurrentProject(null);
        }}
        onSubmit={currentProject ? handleUpdateProject : handleAddProject}
        initialData={currentProject || undefined}
      />

      {/* Task Modal */}
      {currentProject && (
        <ProjectTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setCurrentTask(null);
          }}
          onSubmit={handleTaskSubmit}
          projectTitle={currentProject.title}
          initialData={currentTask || undefined}
        />
      )}
    </div>
  );
};

export default PlannedTasks;