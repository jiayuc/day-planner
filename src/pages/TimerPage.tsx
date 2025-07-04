import React, { useState } from 'react';
import AnalogTimer from '../components/AnalogTimer';

const TimerPage: React.FC = () => {
  const [seconds, setSeconds] = useState(60);
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">计时页面</h1>
      <AnalogTimer seconds={seconds} />
    </div>
  );
};

export default TimerPage;
