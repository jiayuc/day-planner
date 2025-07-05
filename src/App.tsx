import React from 'react';

import { AnalogTimer } from './components/AnalogTimer';
import { TaskList } from './components/TaskList';
import { TaskProvider } from './components/TaskContext';

function App() {
  return (
    <TaskProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex gap-16 items-start">
          <AnalogTimer totalSeconds={60 * 0.1} />
          <TaskList />
        </div>
      </div>
    </TaskProvider>
  );
}

export default App;