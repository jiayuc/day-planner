import React from 'react';
import { useTaskContext } from './TaskContext';

function formatSessionTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const TaskList: React.FC = () => {
  const { tasks, selectedId, setSelectedId, isTaskOngoing } = useTaskContext();

  return (
    <div className="w-80 bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-2 text-gray-800">Tasks</h2>
      <ul className="flex flex-col gap-2">
        {tasks.map((task) => {
          const isSelected = selectedId === task.id;
          const isOngoing = isSelected && isTaskOngoing;
          return (
            <li key={task.id}>
              <button
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-150 font-medium border focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${isOngoing
                    ? 'bg-green-100 border-green-400 ring-2 ring-green-400 text-green-700 shadow'
                    : isSelected
                    ? 'bg-blue-100 border-blue-400 ring-2 ring-blue-400 text-blue-700 shadow'
                    : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-800'}
                `}
                onClick={() => !isTaskOngoing && setSelectedId(task.id)}
                disabled={isTaskOngoing}
              >
                <div className="flex flex-col">
                  <span>{task.name}</span>
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
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
