import React, { useEffect, useRef, useState } from 'react';

const RADIUS = 120;
const CENTER = 150;
const CLOCK_DURATION = 60 * 60; // 60 minutes (in seconds)

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const GREEN_COLOR = 'rgba(65, 169, 105, 0.85)';
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
      // Move marks outside the clockface
      const inner = polarToCartesian(CENTER, CENTER, RADIUS + 3, 360 - angle);
      const outer = polarToCartesian(CENTER, CENTER, RADIUS + (isHour ? 15 : 11), 360 - angle);
      marks.push(
        <line
          key={i}
          x1={inner.x}
          y1={inner.y}
          x2={outer.x}
          y2={outer.y}
          stroke={isHour ? '#222' : '#bbb'}
          strokeWidth={isHour ? 2 : 1}
        />
      );
    }
    return marks;
  };

  const renderClockNumbers = () => {
    const numbers = [];
    for (let i = 0; i < 12; i++) {
      // Counter-clockwise numbering: 0, 5, 10, ..., 55
      const value = (i * 5) % 60;
      const angle = i * 30;
      // Move numbers further outside the clockface
      const pos = polarToCartesian(CENTER, CENTER, RADIUS + 44, 360 - angle);
      numbers.push(
        <text
          key={i}
          x={pos.x}
          y={pos.y + 8}
          textAnchor="middle"
          fontSize="15"
          fill="#222"
          style={{ fontFamily: 'Figtree, sans-serif', letterSpacing: 1, fontWeight: 'normal' }}
        >
          {value === 0 ? '0' : value}
        </text>
      );
    }
    return numbers;
  };


  // Canvas drawing for green sector (remaining time)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw green sector if time remains
    if (totalSeconds > 0 && remaining > 0) {
      const startAngle = -Math.PI / 2; // 0 min (top)
      const endMinute = remaining / 60;
      const endAngle = startAngle - (endMinute * 6 * Math.PI / 180); // counter-clockwise
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(CENTER, CENTER);
      ctx.arc(CENTER, CENTER, RADIUS, startAngle, endAngle, true);
      ctx.closePath();
      ctx.fillStyle = GREEN_COLOR;
      ctx.fill();
      ctx.restore();
    }
    // Draw red sector if overtime
    if (overtime > 0) {
      const startAngle = -Math.PI / 2; // 0 min (top)
      const overtimeMinute = Math.min(overtime / 60, 60); // cap at 60 min
      const endAngle = startAngle + (overtimeMinute * 6 * Math.PI / 180); // clockwise
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(CENTER, CENTER);
      ctx.arc(CENTER, CENTER, RADIUS, startAngle, endAngle, false); // clockwise
      ctx.closePath();
      ctx.fillStyle = 'rgba(235, 118, 118, 0.85)'; // Tailwind red-500
      ctx.fill();
      ctx.restore();
    }
    // The effect should also depend on overtime, so the red sector updates as time passes after timer is up
  }, [remaining, totalSeconds, overtime]);

  return (
    <div className="flex flex-col items-center justify-center">
      <audio ref={audioRef} src="/sounds/timer_up_sound.mp3" preload="auto" />
      <div style={{ position: 'relative', width: 370, height: 370, overflow: 'visible' }} className="mb-8">
        {/* SVG for clock face and marks (z-index: 2) */}
        <svg width="370" height="370" style={{ position: 'absolute', left: 0, top: 0, zIndex: 2, pointerEvents: 'none', overflow: 'visible' }}>
          {/* Clock outline */}
          <circle cx={CENTER} cy={CENTER} r={RADIUS} stroke="#e5e7eb" strokeWidth="4" fill="#fff" />
          {/* Clock face */}
          {renderClockMarks()}
          {renderClockNumbers()}
          {/* Center knob mimic */}
          <circle cx={CENTER} cy={CENTER} r={10} fill={GREEN_COLOR} stroke="#fff" strokeWidth="1" />
        </svg>
        {/* Canvas for green/red sector (z-index: 3, on top) */}
        <canvas
          ref={canvasRef}
          width={370}
          height={370}
          style={{ position: 'absolute', left: 0, top: 0, zIndex: 3, pointerEvents: 'none' }}
        />
      </div>

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
