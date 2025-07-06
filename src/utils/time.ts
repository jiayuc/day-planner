// 时间转换函数
export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Task session time calculation utilities
import { TaskSession } from '../components/TaskContext';

/**
 * Calculate total time spent across all completed sessions for a task
 * @param sessions Array of task sessions
 * @returns Total time in milliseconds
 */
export function calculateTotalTimeMs(sessions: TaskSession[]): number {
  return sessions.reduce((total, session) => {
    if (session.end) {
      // Only count completed sessions
      const duration = session.end.getTime() - session.start.getTime();
      return total + duration;
    }
    return total;
  }, 0);
}

/**
 * Format total time in a human-readable format (e.g., "1h 20m", "45m", "2h")
 * @param totalMs Total time in milliseconds
 * @returns Formatted time string
 */
export function formatCumulativeTime(totalMs: number): string {
  if (totalMs === 0) return '0m';
  
  const totalMinutes = Math.floor(totalMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
}

/**
 * Get cumulative time for a task in formatted string
 * @param sessions Array of task sessions
 * @returns Formatted cumulative time string (e.g., "1h 20m")
 */
export function getTaskCumulativeTime(sessions: TaskSession[]): string {
  const totalMs = calculateTotalTimeMs(sessions);
  return formatCumulativeTime(totalMs);
}
