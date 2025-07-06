import React, { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import { useTaskContext } from './TaskContext';
import { createTimerNotificationManager, TimerNotificationManager } from '../utils/timerNotifications';
import { TimerDisplay, TIMER_SIZE } from './TimerDisplay';

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

const CENTER = TIMER_SIZE / 2; // Dynamic center calculation
const CLOCK_DURATION = 60 * 60; // 60 minutes (in seconds)

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const AnalogTimer: React.FC<{ totalSeconds?: number }> = ({ totalSeconds: initialTotalSeconds = 1500 }) => {
  const { selectedId, startSession, endSession, isTaskOngoing } = useTaskContext();
  // DEBUG: Log when component renders
  console.debug('[AnalogTimer] Rendered');
  
  // Initialize notification manager
  const notificationManagerRef = useRef<TimerNotificationManager | null>(null);
  
  useEffect(() => {
    notificationManagerRef.current = createTimerNotificationManager('sounds/timer_up_sound.mp3');
    
    // Load bell animation data
    fetch('/day-planner/animations/smiling-bell-ring.json')
      .then(response => response.json())
      .then(data => setBellAnimationData(data))
      .catch(error => console.warn('Failed to load bell animation:', error));
    
    return () => {
      notificationManagerRef.current?.destroy();
      // Clean up bell animation timeout
      if (bellAnimationTimeoutRef.current) {
        clearTimeout(bellAnimationTimeoutRef.current);
      }
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
  const [showBellAnimation, setShowBellAnimation] = useState(false);
  const [bellAnimationData, setBellAnimationData] = useState(null);
  const [dragging, setDragging] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const bellAnimationTimeoutRef = useRef<number | null>(null);

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

      // Start bell animation
      setShowBellAnimation(true);
      
      // Stop bell animation after 1 minute (60000ms)
      bellAnimationTimeoutRef.current = window.setTimeout(() => {
        setShowBellAnimation(false);
      }, 60000);
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

  // Helper function to reset timer and stop bell animation
  const resetTimer = () => {
    notificationManagerRef.current?.markUserInteraction();
    setRunning(false);
    setElapsedSeconds(0);
    setDinged(false);
    setShowBellAnimation(false);
    
    // Clear any pending bell animation timeout
    if (bellAnimationTimeoutRef.current) {
      clearTimeout(bellAnimationTimeoutRef.current);
      bellAnimationTimeoutRef.current = null;
    }
  };

  return (
    <div id="analog-timer-container" className="flex flex-col items-center justify-center">
        {/* Bell Animation - positioned in top-left corner */}
        {showBellAnimation && bellAnimationData && (
          <div className="absolute top-5 left-5 z-10 w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40">
            <Lottie
              animationData={bellAnimationData}
              loop={true}
              autoplay={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        )}
      <div className="w-full max-w-[370px] min-w-[280px] aspect-square relative">
        <TimerDisplay
          totalSeconds={totalSeconds}
          elapsedSeconds={elapsedSeconds}
          running={running}
          dragging={dragging}
          isTaskOngoing={isTaskOngoing}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      </div>
      
      <div className="text-lg sm:text-xl lg:text-2xl font-mono mb-4 text-center w-full">
        {remaining > 0 ? formatTime(remaining) : `+${formatTime(overtime)}`}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-2 w-full">
        <button
          className={
            running
              ? "relative bg-yellow-500 text-white px-4 sm:px-6 py-2 rounded-full shadow-md transition-all duration-150 hover:bg-yellow-600 active:scale-95 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 w-full sm:w-auto"
              : "relative bg-green-500 text-white px-4 sm:px-6 py-2 rounded-full shadow-md transition-all duration-150 hover:bg-green-600 active:scale-95 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 w-full sm:w-auto"
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
            className="relative bg-green-500 text-white px-4 sm:px-6 py-2 rounded-full shadow-md transition-all duration-150 hover:bg-green-600 active:scale-95 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 w-full sm:w-auto"
            onClick={resetTimer}
          >
            <span className="font-semibold tracking-wide">End Session</span>
          </button>
        ) : (
          <button
            className="relative bg-gray-200 text-gray-700 px-4 sm:px-6 py-2 rounded shadow-md transition-all duration-150 hover:bg-gray-300 active:scale-95 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 w-full sm:w-auto"
            onClick={resetTimer}
          >
            <span className="font-semibold tracking-wide">Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
