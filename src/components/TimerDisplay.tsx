import React, { useEffect, useRef } from 'react';

const TIMER_SIZE = 370; // Timer container size (width and height)
const RADIUS = 120;
const CENTER = TIMER_SIZE / 2; // Dynamic center calculation

const GREEN_COLOR = 'rgba(65, 169, 105, 0.85)';
const DARK_GREEN_COLOR = 'rgb(43, 114, 70)';
const RED_COLOR = 'rgb(235, 118, 118)';
const DARK_RED_COLOR = 'rgb(221, 85, 85)';

const CLOCK_FONT = 'Figtree, sans-serif';

interface TimerDisplayProps {
  totalSeconds: number;
  elapsedSeconds: number;
  running: boolean;
  dragging: boolean;
  isTaskOngoing: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerMove?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  totalSeconds,
  elapsedSeconds,
  running,
  dragging,
  isTaskOngoing,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}) => {
  const remaining = Math.max(totalSeconds - elapsedSeconds, 0);
  const overtime = Math.max(elapsedSeconds - totalSeconds, 0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
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

  const renderNeedleAndKnob = () => {
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
  };

  return (
    <div
      id="timer-interactive-layer"
      className="mb-8 flex items-center justify-center"
      style={{
        position: 'relative',
        width: TIMER_SIZE,
        height: TIMER_SIZE,
        overflow: 'visible',
        touchAction: 'none',
        ...(isTaskOngoing ? { pointerEvents: 'none', opacity: 0.7 } : {})
      }}
      onPointerDown={isTaskOngoing ? undefined : onPointerDown}
      onPointerMove={isTaskOngoing ? undefined : onPointerMove}
      onPointerUp={isTaskOngoing ? undefined : onPointerUp}
      aria-disabled={isTaskOngoing}
    >
      {/* 1. SVG for clock face and marks (lowest layer) */}
      <svg width={TIMER_SIZE} height={TIMER_SIZE} style={{ position: 'absolute', left: 0, top: 0, zIndex: 1, pointerEvents: 'none', overflow: 'visible' }}>
        {/* Clock outline */}
        <circle cx={CENTER} cy={CENTER} r={RADIUS} stroke="#e5e7eb" strokeWidth="4" fill="#fff" />
        {renderClockMarks()}
        {renderClockNumbers()}
      </svg>

      {/* 2. Canvas for green/red sector (middle layer) */}
      <canvas
        ref={canvasRef}
        width={TIMER_SIZE}
        height={TIMER_SIZE}
        style={{ position: 'absolute', left: 0, top: 0, zIndex: 2, pointerEvents: 'none' }}
      />

      {/* 3. SVG for center knob and needle (topmost layer) */}
      <svg width={TIMER_SIZE} height={TIMER_SIZE} style={{ position: 'absolute', left: 0, top: 0, zIndex: 3, pointerEvents: 'none', overflow: 'visible' }}>
        {renderNeedleAndKnob()}
      </svg>
    </div>
  );
};

// Export constants for use in parent component
export { TIMER_SIZE };
