import React, { useEffect, useRef, useState } from 'react';

const RADIUS = 90;
const CENTER = 110;
const CLOCK_DURATION = 60 * 60; // 60 minutes (in seconds)

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const AnalogTimer: React.FC<{ totalSeconds: number }> = ({ totalSeconds }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [dinged, setDinged] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const remaining = Math.max(totalSeconds - elapsedSeconds, 0);
  const overtime = Math.max(elapsedSeconds - totalSeconds, 0);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (!dinged && elapsedSeconds === totalSeconds) {
      setDinged(true);
      audioRef.current?.play();
    }
  }, [elapsedSeconds, totalSeconds, dinged]);

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeSector = (startAngle: number, endAngle: number, color: string) => {
    const start = polarToCartesian(CENTER, CENTER, RADIUS, 360 - startAngle);
    const end = polarToCartesian(CENTER, CENTER, RADIUS, 360 - endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return (
      <path
        d={`M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`}
        fill={color}
      />
    );
  };

  const renderClockMarks = () => {
    const marks = [];
    for (let i = 0; i < 60; i++) {
      const angle = i * 6;
      const isHour = i % 5 === 0;
      const inner = polarToCartesian(CENTER, CENTER, RADIUS - (isHour ? 12 : 6), 360 - angle);
      const outer = polarToCartesian(CENTER, CENTER, RADIUS + 6, 360 - angle);
      marks.push(
        <line
          key={i}
          x1={inner.x}
          y1={inner.y}
          x2={outer.x}
          y2={outer.y}
          stroke={isHour ? '#333' : '#999'}
          strokeWidth={isHour ? 2 : 1}
        />
      );
    }
    return marks;
  };

  const renderClockNumbers = () => {
    const numbers = [];
    for (let i = 0; i < 12; i++) {
      const angle = i * 30;
      const pos = polarToCartesian(CENTER, CENTER, RADIUS - 24, 360 - angle);
      numbers.push(
        <text
          key={i}
          x={pos.x}
          y={pos.y + 4}
          textAnchor="middle"
          fontSize="12"
          fill="#333"
        >
          {i * 5 === 0 ? '0' : i * 5}
        </text>
      );
    }
    return numbers;
  };

  const targetAngle = (totalSeconds / CLOCK_DURATION) * 360;
  const angleElapsed = (elapsedSeconds / CLOCK_DURATION) * 360;
  const remainingAngle = Math.max(targetAngle - angleElapsed, 0);
  const overtimeAngle = Math.max(angleElapsed - targetAngle, 0);

  return (
    <div className="flex flex-col items-center justify-center">
      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" preload="auto" />
      <svg width="220" height="220" className="mb-4">
        {/* Green sector for remaining time */}
        {remaining > 0 && describeSector(0, remainingAngle, 'green')}
        {/* Red sector for overtime */}
        {overtime > 0 && describeSector(0, overtimeAngle, 'red')}

        {/* Clock outline */}
        <circle cx={CENTER} cy={CENTER} r={RADIUS} stroke="#ccc" strokeWidth="2" fill="white" />

        {/* Clock face */}
        {renderClockMarks()}
        {renderClockNumbers()}

        {/* Center knob mimic */}
        <circle cx={CENTER} cy={CENTER} r={8} fill="#bbb" />
      </svg>

      <div className="text-2xl font-mono mb-4">
        {remaining > 0 ? formatTime(remaining) : `+${formatTime(overtime)}`}
      </div>

      <div className="space-x-4">
        <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => setRunning(true)}>
          Start
        </button>
        <button className="bg-yellow-500 text-white px-4 py-2 rounded" onClick={() => setRunning(false)}>
          Pause
        </button>
        <button
          className="bg-gray-300 px-4 py-2 rounded"
          onClick={() => {
            setRunning(false);
            setElapsedSeconds(0);
            setDinged(false);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};
