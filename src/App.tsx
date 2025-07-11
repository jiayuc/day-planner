import React from 'react';

import { AnalogTimer } from './components/AnalogTimer';
import { TaskList } from './components/TaskList';
import { TaskProvider } from './components/TaskContext';
import { DevTools } from './components/DevTools';
import { devConfig } from './config/dev';

function App() {
  return (
    <TaskProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-center w-full max-w-7xl">
          <div className="flex justify-center min-w-0">
            <AnalogTimer totalSeconds={devConfig.defaultTimerSeconds} />
          </div>
          <div className="flex justify-center min-w-0">
            <TaskList />
          </div>
        </div>
        
        {/* Development tools - only shows in dev mode */}
        <DevTools />
      </div>
    </TaskProvider>
  );
}

export default App;