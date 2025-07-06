import React, { createContext, useContext, useState } from 'react';

/**
 * TaskContext provides global state and actions for managing tasks and their sessions.
 *
 * Features:
 * - Store and update the list of tasks
 * - Track which task is selected
 * - Track if a session (timer) is ongoing
 * - Add, delete, and reorder tasks
 * - Start and end work sessions for tasks
 *
 * Usage:
 *   Wrap your app in <TaskProvider> and use the useTaskContext() hook in components.
 */

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

// Load tasks (including sessions) from localStorage, or use default
const loadInitialTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem('tasks');
    if (raw) {
      // Revive Date objects for session start/end
      const parsed = JSON.parse(raw);
      return parsed.map((task: any) => ({
        ...task,
        sessions: task.sessions.map((s: any) => ({
          start: new Date(s.start),
          end: s.end ? new Date(s.end) : null,
        })),
      }));
    }
  } catch {}
  return [
    { id: 1, name: 'Write down your tasks', sessions: [] },
    { id: 2, name: 'Select a task, start a working session', sessions: [] },
    { id: 3, name: 'Finish the session, repeat the above until your task is done', sessions: [] },
    { id: 4, name: 'Check off your task as done!', sessions: [] },
  ];
};

const initialTasks: Task[] = loadInitialTasks();

/**
 * TaskProvider wraps your app and provides task state and actions via context.
 */
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

  React.useEffect(() => {
    // Convert Date objects to ISO strings for storage
    const tasksToStore = tasks.map(task => ({
      ...task,
      sessions: task.sessions.map(s => ({
        start: s.start instanceof Date ? s.start.toISOString() : s.start,
        end: s.end instanceof Date ? s.end.toISOString() : s.end,
      })),
    }));
    localStorage.setItem('tasks', JSON.stringify(tasksToStore));
  }, [tasks]);

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

/**
 * useTaskContext is a custom hook to access the task context.
 * Throws if used outside of TaskProvider.
 */
export const useTaskContext = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used within TaskProvider');
  return ctx;
};
