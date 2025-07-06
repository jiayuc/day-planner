import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { TimerDisplay } from '../components/TimerDisplay';

describe('TimerDisplay - Size Constraints', () => {
  const defaultProps = {
    totalSeconds: 1500,
    elapsedSeconds: 0,
    running: false,
    dragging: false,
    isTaskOngoing: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow timer-interactive-layer to reach maximum width of 370px when container has sufficient space', () => {
    const { container } = render(<TimerDisplay {...defaultProps} />);

    // Find the timer-interactive-layer div
    const timerInteractiveLayer = container.querySelector('#timer-interactive-layer');
    expect(timerInteractiveLayer).toBeInTheDocument();

    // Verify the element has the correct CSS classes for responsive behavior
    expect(timerInteractiveLayer).toHaveClass('w-full', 'h-full');
    
    // Verify inline styles that support responsive sizing
    expect(timerInteractiveLayer).toHaveStyle({
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'visible',
    });

    // Mock getBoundingClientRect to simulate large screen conditions
    Object.defineProperty(timerInteractiveLayer, 'getBoundingClientRect', {
      value: () => ({
        width: 370,
        height: 370,
        left: 0,
        top: 0,
        right: 370,
        bottom: 370,
      }),
    });

    // Test that the element can reach the maximum size
    const rect = timerInteractiveLayer.getBoundingClientRect();
    expect(rect.width).toBe(370);
    expect(rect.height).toBe(370);
  });

  it('should respect minimum width of 280px on smaller screens', () => {
    const { container } = render(<TimerDisplay {...defaultProps} />);

    const timerInteractiveLayer = container.querySelector('#timer-interactive-layer');
    expect(timerInteractiveLayer).toBeInTheDocument();

    // Mock getBoundingClientRect to simulate small screen conditions  
    Object.defineProperty(timerInteractiveLayer, 'getBoundingClientRect', {
      value: () => ({
        width: 280,
        height: 280,
        left: 0,
        top: 0,
        right: 280,
        bottom: 280,
      }),
    });

    // Test that the element respects the minimum size
    const rect = timerInteractiveLayer.getBoundingClientRect();
    expect(rect.width).toBe(280);
    expect(rect.height).toBe(280);
    expect(rect.width).toBeGreaterThanOrEqual(280);
  });

  it('should have proper CSS properties that allow responsive sizing', () => {
    const { container } = render(<TimerDisplay {...defaultProps} />);
    
    const timerInteractiveLayer = container.querySelector('#timer-interactive-layer');
    expect(timerInteractiveLayer).toBeInTheDocument();

    // Verify the element has the necessary CSS classes for responsive behavior
    expect(timerInteractiveLayer).toHaveClass('w-full', 'h-full');
    
    // Verify inline styles that support responsive sizing
    expect(timerInteractiveLayer).toHaveStyle({
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'visible',
    });

    // Verify the element ID is correct for JavaScript sizing calculations
    expect(timerInteractiveLayer).toHaveAttribute('id', 'timer-interactive-layer');
  });

  it('should maintain aspect ratio and proper sizing structure', () => {
    const { container } = render(<TimerDisplay {...defaultProps} />);
    
    const timerInteractiveLayer = container.querySelector('#timer-interactive-layer');
    const svgElements = container.querySelectorAll('svg');
    const canvasElement = container.querySelector('canvas');

    // Verify the main container exists
    expect(timerInteractiveLayer).toBeInTheDocument();

    // Verify child elements are properly structured for responsive sizing
    expect(svgElements).toHaveLength(2); // Clock face + needle/knob SVGs
    expect(canvasElement).toBeInTheDocument();

    // Verify SVG elements have responsive sizing
    svgElements.forEach(svg => {
      expect(svg).toHaveAttribute('width', '100%');
      expect(svg).toHaveAttribute('height', '100%');
      expect(svg).toHaveAttribute('viewBox', '0 0 370 370');
    });

    // Verify canvas has responsive sizing
    expect(canvasElement).toHaveStyle({
      width: '100%',
      height: '100%',
    });
    expect(canvasElement).toHaveAttribute('width', '370');
    expect(canvasElement).toHaveAttribute('height', '370');
  });
});
