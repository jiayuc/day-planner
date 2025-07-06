import React, { useEffect, useRef, useState } from 'react';
import { useTaskContext } from './TaskContext';
import { createTimerNotificationManager, TimerNotificationManager } from '../utils/timerNotifications';

/**
 * AnalogTimer is a modern, visually accurate analog timer component (like a Time Timer).
 *
 * Features:
 * - Green sector for remaining time, red sector for overtime (drawn with Canvas)
 * - SVG clock face with numbers/marks, modern look, correct layering
 * - Center knob and needle, color logic, always on top
 * - Custom timer-up sound
 * - Timer can be set by dragging the green sector edge
 * - Start/Pause, Reset/End Session buttons
 * - Timer, time display, and buttons are perfectly centered
 * - Disables drag/selection while running
 * - Integrates with TaskContext for session tracking
 */

const RADIUS = 120;
const CENTER = 150;
const CLOCK_DURATION = 60 * 60; // 60 minutes (in seconds)

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const GREEN_COLOR = 'rgba(65, 169, 105, 0.85)';
const DARK_GREEN_COLOR = 'rgb(43, 114, 70)';
const RED_COLOR = 'rgb(235, 118, 118)';
const DARK_RED_COLOR = 'rgb(221, 85, 85)';

const CLOCK_FONT = 'Figtree, sans-serif';

export const AnalogTimer: React.FC<{ totalSeconds?: number }> = ({ totalSeconds: initialTotalSeconds = 1500 }) => {
  const { selectedId, startSession, endSession, isTaskOngoing } = useTaskContext();
  // DEBUG: Log when component renders
  console.debug('[AnalogTimer] Rendered');
  
  // Initialize notification manager
  const notificationManagerRef = useRef<TimerNotificationManager | null>(null);
  
  useEffect(() => {
    notificationManagerRef.current = createTimerNotificationManager('sounds/timer_up_sound.mp3');
    return () => {
      notificationManagerRef.current?.destroy();
    };
  }, []);

  const getLocal = (key: string, fallback: any) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const [totalSeconds, setTotalSeconds] = useState(() => getLocal('timer_totalSeconds', initialTotalSeconds));
  const [elapsedSeconds, setElapsedSeconds] = useState(() => getLocal('timer_elapsedSeconds', 0));
  const [running, setRunning] = useState(() => getLocal('timer_running', false));
  const [dinged, setDinged] = useState(() => getLocal('timer_dinged', false));
  const [dragging, setDragging] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const remaining = Math.max(totalSeconds - elapsedSeconds, 0);
  const overtime = Math.max(elapsedSeconds - totalSeconds, 0);
  // Helper: get angle (deg) from mouse position
  const getAngleFromMouse = (clientX: number, clientY: number) => {
    const rect = document.getElementById('timer-interactive-layer')?.getBoundingClientRect();
    if (!rect) return null;
    const x = clientX - rect.left - CENTER;
    const y = clientY - rect.top - CENTER;
    let angle = Math.atan2(y, x) * 180 / Math.PI;
    angle = angle < -90 ? 450 + angle : angle + 90; // 0 at top, clockwise
    return angle;
  };

  // Mouse/touch drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (running) return;
    notificationManagerRef.current?.markUserInteraction();
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || running) return;
    const angle = getAngleFromMouse(e.clientX, e.clientY);
    if (angle === null) return;
    // Clamp to [0, 360]
    const clamped = Math.max(0, Math.min(360, angle));
    // Convert angle to minutes (counter-clockwise from top)
    const minutes = Math.round((60 - clamped / 6) % 60);
    setTotalSeconds(minutes * 60 || 60); // never allow 0
    setElapsedSeconds(0);
    setDinged(false);
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

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
      console.debug('[AnalogTimer] Timer up! Triggering notification.');
      setDinged(true);
      
      // Use the notification manager to handle all notification strategies
      notificationManagerRef.current?.notify({
        title: 'Timer Up!',
        body: 'Your timer has finished.',
        icon: '/favicon.ico'
      });
    }
  }, [elapsedSeconds, totalSeconds, dinged]);

  // Track session for selected task
  useEffect(() => {
    if (running && selectedId != null && !isTaskOngoing) {
      startSession(selectedId);
    }
    if (!running && selectedId != null && isTaskOngoing) {
      endSession(selectedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('timer_totalSeconds', JSON.stringify(totalSeconds));
    localStorage.setItem('timer_elapsedSeconds', JSON.stringify(elapsedSeconds));
    localStorage.setItem('timer_running', JSON.stringify(running));
    localStorage.setItem('timer_dinged', JSON.stringify(dinged));
  }, [totalSeconds, elapsedSeconds, running, dinged]);

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

  const renderClockMarks = (): React.ReactNode[] => {
    const marks: React.ReactNode[] = [];
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

  const renderClockNumbers = (): React.ReactNode[] => {
    const numbers: React.ReactNode[] = [];
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
          style={{ fontFamily: CLOCK_FONT, letterSpacing: 1, fontWeight: 'normal' }}
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
      ctx.fillStyle = RED_COLOR; // Tailwind red-500
      ctx.fill();
      ctx.restore();
    }
    // The effect should also depend on overtime, so the red sector updates as time passes after timer is up
  }, [remaining, totalSeconds, overtime]);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div
        id="timer-interactive-layer"
        className="mb-8"
        style={{
          position: 'relative',
          width: 370,
          height: 370,
          overflow: 'visible',
          touchAction: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          ...(isTaskOngoing ? { pointerEvents: 'none', opacity: 0.7 } : {})
        }}
        onPointerDown={isTaskOngoing ? undefined : handlePointerDown}
        onPointerMove={isTaskOngoing ? undefined : handlePointerMove}
        onPointerUp={isTaskOngoing ? undefined : handlePointerUp}
        aria-disabled={isTaskOngoing}
      >
        {/* 1. SVG for clock face and marks (lowest layer) */}
        <svg width="370" height="370" style={{ position: 'absolute', left: 0, top: 0, zIndex: 1, pointerEvents: 'none', overflow: 'visible' }}>
          {/* Clock outline */}
          <circle cx={CENTER} cy={CENTER} r={RADIUS} stroke="#e5e7eb" strokeWidth="4" fill="#fff" />
          {renderClockMarks()}
          {renderClockNumbers()}
        </svg>

        {/* 2. Canvas for green/red sector (middle layer) */}
        <canvas
          ref={canvasRef}
          width={370}
          height={370}
          style={{ position: 'absolute', left: 0, top: 0, zIndex: 2, pointerEvents: 'none' }}
        />

        {/* 3. SVG for center knob and needle (topmost layer) */}
        <svg width="370" height="370" style={{ position: 'absolute', left: 0, top: 0, zIndex: 3, pointerEvents: 'none', overflow: 'visible' }}>
          {/* Needle and knob, plus drag handle for setting timer */}
          {(() => {
            const getNeedleAndKnobColor = () => (remaining > 0 ? DARK_GREEN_COLOR : DARK_RED_COLOR);
            let angle;
            if (remaining > 0) {
              angle = -90 - (remaining / 60) * 6;
            } else if (overtime > 0) {
              angle = -90 + (overtime / 60) * 6;
            } else {
              angle = -90;
            }
            const color = getNeedleAndKnobColor();
            const rad = (angle * Math.PI) / 180;
            const needleLength = 17;
            const x = CENTER + needleLength * Math.cos(rad);
            const y = CENTER + needleLength * Math.sin(rad);
            // Drag handle: only show when not running
            return (
              <>
                <line
                  x1={CENTER}
                  y1={CENTER}
                  x2={x}
                  y2={y}
                  stroke={color}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                {/* Center knob mimic, color changes after timer is up */}
                <circle cx={CENTER} cy={CENTER} r={10} fill={color} stroke="#fff" strokeWidth="0.5" />
                {!running && (
                  <circle
                    cx={x}
                    cy={y}
                    r={12}
                    fill="#fff"
                    stroke={color}
                    strokeWidth={2}
                    style={{ cursor: 'pointer', opacity: 0.85 }}
                  />
                )}
              </>
            );
          })()}
        </svg>
      </div>

      <div className="text-2xl font-mono mb-4">
        {remaining > 0 ? formatTime(remaining) : `+${formatTime(overtime)}`}
      </div>

      <div className="flex gap-4 justify-center items-center mt-2" style={{ width: 370 }}>
        <button
          className={
            running
              ? "relative bg-yellow-500 text-white px-6 py-2 rounded-full shadow-md transition-all duration-150 hover:bg-yellow-600 active:scale-95 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2"
              : "relative bg-green-500 text-white px-6 py-2 rounded-full shadow-md transition-all duration-150 hover:bg-green-600 active:scale-95 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          }
          onClick={() => {
            notificationManagerRef.current?.markUserInteraction();
            setRunning((r) => !r);
          }}
        >
          <span className="font-semibold tracking-wide">{running ? 'Pause' : 'Start'}</span>
        </button>
        {running ? (
          <button
            className="relative bg-green-500 text-white px-6 py-2 rounded-full shadow-md transition-all duration-150 hover:bg-green-600 active:scale-95 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
            onClick={() => {
              notificationManagerRef.current?.markUserInteraction();
              setRunning(false);
              setElapsedSeconds(0);
              setDinged(false);
            }}
          >
            <span className="font-semibold tracking-wide">End Session</span>
          </button>
        ) : (
          <button
            className="relative bg-gray-200 text-gray-700 px-6 py-2 rounded shadow-md transition-all duration-150 hover:bg-gray-300 active:scale-95 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            onClick={() => {
              notificationManagerRef.current?.markUserInteraction();
              setRunning(false);
              setElapsedSeconds(0);
              setDinged(false);
            }}
          >
            <span className="font-semibold tracking-wide">Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
