import React, { useState } from 'react';
import { useTaskContext, Task } from './TaskContext';
import { DraggableList } from './DraggableList';

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
      className="w-[410px] bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-6 font-casual"
      style={{ minHeight: 520 }}
    >
      <h2 className="text-2xl font-bold mb-1 text-gray-900 flex items-center gap-2 font-sans">
        To-Do List <span role="img" aria-label="emoji">📝</span>
      </h2>
      <div className="flex items-center gap-3 mb-2">
        <input
          className="flex-1 bg-gray-100 rounded-full px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-400"
          placeholder="Add your task"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
          disabled={isTaskOngoing}
        />
        <button
          className="ml-2 bg-[#ff5c4d] hover:bg-[#ff3b2e] text-white font px-8 py-3 rounded-full text-lg transition-all duration-150 shadow-md focus:outline-none focus:ring-2 focus:ring-[#ff5c4d] focus:ring-offset-2"
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
            <div className="flex items-center group pr-2" {...dragHandleProps}>
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
              <button
                className={`flex-1 text-left text-lg font-medium px-2 py-3 rounded-lg transition-all duration-150 border focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${isOngoing
                    ? 'bg-green-100 border-green-400 ring-2 ring-green-400 text-green-700 shadow'
                    : isSelected
                    ? 'bg-blue-100 border-blue-400 ring-2 ring-blue-400 text-blue-700 shadow'
                    : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-900'}
                  ${isDone ? 'line-through text-gray-400' : ''}
                `}
                onClick={() => !isTaskOngoing && setSelectedId(task.id)}
                disabled={isTaskOngoing}
              >
                {task.name}
                {task.sessions.length > 0 && (
                  <div className="mt-1 text-xs text-gray-500 space-y-1">
                    {task.sessions.map((s, i) => (
                      <div key={i}>
                        {formatSessionTime(new Date(s.start))} - {s.end ? formatSessionTime(new Date(s.end)) : <span className="text-green-600 font-semibold">...</span>}
                      </div>
                    ))}
                  </div>
                )}
              </button>
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
