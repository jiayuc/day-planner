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

  const startSession = (taskId: number) => {
    setTasks((prev) =>
      prev.map((task) =>
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

  const endSession = (taskId: number) => {
    setTasks((prev) =>
      prev.map((task) =>
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

  return (
    <TaskContext.Provider value={{ tasks, selectedId, setSelectedId, startSession, endSession, isTaskOngoing }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used within TaskProvider');
  return ctx;
};
