import React, { useState } from 'react';
import { useTaskContext, Task } from './TaskContext';
import { DraggableList } from './DraggableList';
import { getTaskCumulativeTime } from '../utils/time';

/**
 * TaskList displays the list of tasks, allows adding, marking as done, deleting, and reordering tasks.
 *
 * Features:
 * - Add new tasks with an input box
 * - Mark tasks as done (with checkmark and strikethrough)
 * - Delete tasks
 * - Drag-and-drop reordering (via DraggableList)
 * - Shows all session start/end times for each task
 * - Highlights selected and ongoing tasks
 * - Disables selection and editing while timer is running
 */
function formatSessionTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const TaskList: React.FC = () => {
  const {
    tasks,
    selectedId,
    setSelectedId,
    isTaskOngoing,
    addTask,
    deleteTask,
    reorderTasks,
  } = useTaskContext();
  const [input, setInput] = useState('');
  const [doneIds, setDoneIds] = useState<Set<number>>(new Set());

  const handleReorder = (newItems: Task[]) => {
    reorderTasks(newItems);
  };

  const handleAdd = () => {
    if (!input.trim()) return;
    addTask(input.trim());
    setInput('');
  };

  const handleDone = (id: number) => {
    setDoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div
      className="w-full max-w-[820px] bg-white rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-6 font-casual"
      style={{ minHeight: 520 }}
    >
      <h2 className="text-xl sm:text-2xl font-bold mb-1 text-gray-900 flex items-center gap-2 font-sans">
        To-Do List 
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 14 14" 
          height="24" 
          width="24" 
          className="text-gray-700"
        >
          <path 
            fill="currentColor" 
            fillRule="evenodd" 
            d="M3.08891 3.09965C2.24836 3.9402 1.75 5.22508 1.75 7.00528c0 1.7802 0.49836 3.06512 1.33891 3.90562 0.84055 0.8406 2.12543 1.3389 3.90563 1.3389 1.7802 0 3.06506 -0.4983 3.90566 -1.3389 0.8405 -0.8405 1.3389 -2.12542 1.3389 -3.90562 0 -0.41421 0.3358 -0.75 0.75 -0.75s0.75 0.33579 0.75 0.75c0 2.05631 -0.5807 3.76872 -1.7783 4.96632 -1.1976 1.1976 -2.90995 1.7782 -4.96626 1.7782 -2.0563 0 -3.7687 -0.5806 -4.96629 -1.7782C0.830657 10.774 0.25 9.06159 0.25 7.00528c0 -2.0563 0.580657 -3.76869 1.77825 -4.96629C3.22584 0.841399 4.93824 0.260742 6.99454 0.260742c0.41421 0 0.75 0.335787 0.75 0.749998 0 0.41422 -0.33579 0.75 -0.75 0.75 -1.7802 0 -3.06508 0.49836 -3.90563 1.33891Zm3.67797 0.72227c0.09167 0.40394 -0.16147 0.80572 -0.56541 0.8974 -0.54142 0.12287 -0.91281 0.37395 -1.15787 0.71498 -0.25118 0.34954 -0.41616 0.85933 -0.41616 1.57054 0 0.85944 0.2394 1.42498 0.59079 1.77637 0.3514 0.3514 0.91693 0.59079 1.77637 0.59079 0.74605 0 1.27031 -0.1813 1.6217 -0.45438 0.34376 -0.26715 0.59479 -0.67814 0.6967 -1.28697 0.06839 -0.40853 0.455 -0.68427 0.8635 -0.61588 0.4086 0.06838 0.6843 0.455 0.6159 0.86352 -0.1532 0.91537 -0.5665 1.68816 -1.25566 2.22371 -0.68151 0.5296 -1.55873 0.77 -2.54214 0.77 -1.13554 0 -2.12859 -0.3217 -2.83703 -1.03013 -0.70844 -0.70844 -1.03013 -1.70148 -1.03013 -2.83703 0 -0.9373 0.21815 -1.77804 0.69804 -2.44587 0.48601 -0.67633 1.19363 -1.10946 2.044 -1.30246 0.40394 -0.09167 0.80572 0.16147 0.8974 0.56541Zm2.71876 1.75259L7.52496 7.53518c-0.2929 0.29289 -0.76777 0.29289 -1.06066 0 -0.2929 -0.2929 -0.29289 -0.76777 0 -1.06066l1.96113 -1.96113c-0.19953 -0.84004 0.04863 -1.72895 0.66466 -2.34501L10.6118 0.64665c0.1239 -0.12396 0.3038 -0.173949 0.4739 -0.131748 0.1701 0.042202 0.3058 0.170429 0.3574 0.337948l0.4017 1.30249 1.3025 0.40168c0.1675 0.05166 0.2957 0.18727 0.3379 0.35742 0.0422 0.17014 -0.0077 0.34996 -0.1317 0.47392l-1.5216 1.5217c-0.6164 0.61636 -1.5059 0.86448 -2.34626 0.66445Z" 
            clipRule="evenodd" 
          />
        </svg>
      </h2>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-2">
        <input
          className="flex-1 bg-gray-100 rounded-full px-4 sm:px-5 py-3 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-400"
          placeholder="Add your task"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
          disabled={isTaskOngoing}
        />
        <button
          className="sm:ml-2 bg-[#ff5c4d] hover:bg-[#ff3b2e] text-white font px-6 sm:px-8 py-3 rounded-full text-base sm:text-lg transition-all duration-150 shadow-md focus:outline-none focus:ring-2 focus:ring-[#ff5c4d] focus:ring-offset-2 whitespace-nowrap"
          onClick={handleAdd}
          disabled={isTaskOngoing || !input.trim()}
        >
          ADD
        </button>
      </div>
      <DraggableList
        items={tasks}
        onReorder={handleReorder}
        getKey={item => item.id}
        renderItem={(task, idx, dragHandleProps) => {
          const isSelected = selectedId === task.id;
          const isOngoing = isSelected && isTaskOngoing;
          const isDone = doneIds.has(task.id);
          return (
            <div className="flex items-center group w-full py-3 px-2 hover:bg-gray-50 rounded-lg transition-all duration-150" {...dragHandleProps}>
              <button
                className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center mr-4 transition-all duration-150
                  ${isDone ? 'bg-[#ff5c4d] border-[#ff5c4d]' : 'bg-white border-gray-400 hover:border-[#ff5c4d]'}
                `}
                onClick={() => handleDone(task.id)}
                aria-label={isDone ? 'Mark as not done' : 'Mark as done'}
                disabled={isTaskOngoing}
              >
                {isDone && (
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" fill="#ff5c4d" />
                    <path d="M6 10.5l3 3 5-5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <div
                className={`flex-1 text-left text-lg font-medium py-2 cursor-pointer transition-all duration-150
                  ${isOngoing
                    ? 'text-green-700 bg-green-100 px-3 py-2 rounded-lg border-l-4 border-green-400'
                    : isSelected
                    ? 'text-blue-700 bg-blue-100 px-3 py-2 rounded-lg border-l-4 border-blue-400'
                    : 'text-gray-900 hover:text-gray-700'}
                  ${isDone ? 'line-through text-gray-400' : ''}
                `}
                onClick={() => !isTaskOngoing && setSelectedId(task.id)}
              >
                {task.name}
                
                {/* Show cumulative time if any sessions exist */}
                {task.sessions.length > 0 && (
                  <div className="mt-1 text-xs text-gray-600 font-medium">
                    Total: {getTaskCumulativeTime(task.sessions)}
                  </div>
                )}
                
                {/* Show individual session times */}
                {task.sessions.length > 0 && (
                  <div className="mt-1 text-xs text-gray-500 space-y-1">
                    {task.sessions.map((s, i) => (
                      <div key={i}>
                        {formatSessionTime(new Date(s.start))} - {s.end ? formatSessionTime(new Date(s.end)) : <span className="text-green-600 font-semibold">...</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="ml-3 text-gray-300 hover:text-gray-500 text-2xl font-bold px-2 opacity-80 group-hover:opacity-100 transition-all duration-100"
                style={{ lineHeight: 1 }}
                aria-label="Delete task"
                onClick={() => deleteTask(task.id)}
                disabled={isTaskOngoing}
              >
                ×
              </button>
            </div>
          );
        }}
      />
    </div>
  );
};
