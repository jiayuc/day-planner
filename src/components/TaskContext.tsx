import React, { createContext, useContext, useState } from 'react';

export interface TaskSession {
  start: Date;
  end: Date | null;
}

export interface Task {
  id: number;
  name: string;
  sessions: TaskSession[];
}

interface TaskContextType {
  tasks: Task[];
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
  startSession: (taskId: number) => void;
  endSession: (taskId: number) => void;
  isTaskOngoing: boolean;
  addTask: (name: string) => void;
  deleteTask: (id: number) => void;
  reorderTasks: (newTasks: Task[]) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const initialTasks: Task[] = [
  { id: 1, name: 'Research for app idea', sessions: [] },
  { id: 2, name: 'Build a prototype', sessions: [] },
  { id: 3, name: 'Get feedback 🎉', sessions: [] },
];

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isTaskOngoing, setIsTaskOngoing] = useState(false);

  // Start a session for a task (timer start)
  const startSession = (taskId: number) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              sessions: [
                ...task.sessions,
                { start: new Date(), end: null },
              ],
            }
          : task
      )
    );
    setIsTaskOngoing(true);
  };

  // End the current session for a task (timer stop)
  const endSession = (taskId: number) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              sessions: task.sessions.map((s, i, arr) =>
                i === arr.length - 1 && s.end === null
                  ? { ...s, end: new Date() }
                  : s
              ),
            }
          : task
      )
    );
    setIsTaskOngoing(false);
  };

  // Add a new task
  const addTask = (name: string) => {
    setTasks(prev => [
      ...prev,
      { id: Date.now(), name, sessions: [] },
    ]);
  };

  // Delete a task by id
  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    // If the deleted task was selected, clear selection
    setSelectedId(prev => (prev === id ? null : prev));
  };

  // Reorder tasks (drag-and-drop)
  const reorderTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        selectedId,
        setSelectedId,
        startSession,
        endSession,
        isTaskOngoing,
        addTask,
        deleteTask,
        reorderTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used within TaskProvider');
  return ctx;
};
