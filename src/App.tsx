import React from 'react';

import { AnalogTimer } from './components/AnalogTimer';
import { TaskList } from './components/TaskList';
import { TaskProvider } from './components/TaskContext';

function App() {
  return (
    <TaskProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-center w-full max-w-7xl">
          <div className="flex justify-center min-w-0">
            <AnalogTimer totalSeconds={60 * 0.05} />
          </div>
          <div className="flex justify-center min-w-0">
            <TaskList />
          </div>
        </div>
      </div>
    </TaskProvider>
  );
}

export default App;