import React from 'react';
import { AnalogTimer } from './components/AnalogTimer';

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <AnalogTimer totalSeconds={60 * 2} /> {/* 预计40分钟 */}
    </div>
  );
}

export default App;