import { describe, it, expect } from 'vitest';
import { calculateTotalTimeMs, formatCumulativeTime, getTaskCumulativeTime } from '../utils/time';
import { TaskSession } from '../components/TaskContext';

describe('Time utilities', () => {
  describe('calculateTotalTimeMs', () => {
    it('should return 0 for empty sessions', () => {
      const sessions: TaskSession[] = [];
      expect(calculateTotalTimeMs(sessions)).toBe(0);
    });

    it('should ignore ongoing sessions (no end time)', () => {
      const sessions: TaskSession[] = [
        {
          start: new Date('2024-01-01T10:00:00Z'),
          end: null
        }
      ];
      expect(calculateTotalTimeMs(sessions)).toBe(0);
    });

    it('should calculate total time for completed sessions', () => {
      const sessions: TaskSession[] = [
        {
          start: new Date('2024-01-01T10:00:00Z'),
          end: new Date('2024-01-01T10:30:00Z') // 30 minutes
        },
        {
          start: new Date('2024-01-01T11:00:00Z'),
          end: new Date('2024-01-01T11:45:00Z') // 45 minutes
        }
      ];
      
      const expected = (30 + 45) * 60 * 1000; // 75 minutes in ms
      expect(calculateTotalTimeMs(sessions)).toBe(expected);
    });

    it('should handle mix of completed and ongoing sessions', () => {
      const sessions: TaskSession[] = [
        {
          start: new Date('2024-01-01T10:00:00Z'),
          end: new Date('2024-01-01T10:20:00Z') // 20 minutes
        },
        {
          start: new Date('2024-01-01T11:00:00Z'),
          end: null // ongoing, should be ignored
        },
        {
          start: new Date('2024-01-01T12:00:00Z'),
          end: new Date('2024-01-01T12:15:00Z') // 15 minutes
        }
      ];
      
      const expected = (20 + 15) * 60 * 1000; // 35 minutes in ms
      expect(calculateTotalTimeMs(sessions)).toBe(expected);
    });
  });

  describe('formatCumulativeTime', () => {
    it('should format 0 time correctly', () => {
      expect(formatCumulativeTime(0)).toBe('0m');
    });

    it('should format minutes only', () => {
      const thirtyMinutes = 30 * 60 * 1000;
      expect(formatCumulativeTime(thirtyMinutes)).toBe('30m');
    });

    it('should format hours only', () => {
      const twoHours = 2 * 60 * 60 * 1000;
      expect(formatCumulativeTime(twoHours)).toBe('2h');
    });

    it('should format hours and minutes', () => {
      const oneHourTwentyMinutes = (1 * 60 + 20) * 60 * 1000;
      expect(formatCumulativeTime(oneHourTwentyMinutes)).toBe('1h 20m');
    });

    it('should handle partial minutes (rounds down)', () => {
      const almostTwoMinutes = 1 * 60 * 1000 + 59 * 1000; // 1m 59s
      expect(formatCumulativeTime(almostTwoMinutes)).toBe('1m');
    });
  });

  describe('getTaskCumulativeTime', () => {
    it('should return "0m" for empty sessions', () => {
      expect(getTaskCumulativeTime([])).toBe('0m');
    });

    it('should return formatted cumulative time', () => {
      const sessions: TaskSession[] = [
        {
          start: new Date('2024-01-01T10:00:00Z'),
          end: new Date('2024-01-01T11:00:00Z') // 1 hour
        },
        {
          start: new Date('2024-01-01T12:00:00Z'),
          end: new Date('2024-01-01T12:30:00Z') // 30 minutes
        }
      ];
      
      expect(getTaskCumulativeTime(sessions)).toBe('1h 30m');
    });
  });
});
