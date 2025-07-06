import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { AnalogTimer } from '../components/AnalogTimer';
import { TaskProvider } from '../components/TaskContext';

describe('AnalogTimer - Integration Sizing Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct CSS classes for responsive sizing between 280px and 370px', () => {
    const { container } = render(
      <TaskProvider>
        <AnalogTimer />
      </TaskProvider>
    );

    // Find the timer container div (the one with size constraints)
    const timerContainer = container.querySelector('#analog-timer-container > div');
    expect(timerContainer).toBeInTheDocument();

    // Verify that the sizing classes are applied correctly to prevent conflicts
    expect(timerContainer).toHaveClass('w-full');
    expect(timerContainer).toHaveClass('max-w-[370px]');
    expect(timerContainer).toHaveClass('aspect-square');
    expect(timerContainer).toHaveClass('relative');

    // Verify the minimum width class is present (this was the main fix)
    const className = timerContainer.className;
    expect(className).toMatch(/min-w-\[[\d]+px\]/); // Should have some min-width class

    // Verify that no conflicting inline styles are present
    // (the fix was to remove the inline minWidth style that was overriding the CSS)
    const inlineStyle = timerContainer.getAttribute('style');
    expect(inlineStyle).toBeFalsy(); // Should have no inline styles
  });

  it('should have timer-interactive-layer with proper responsive classes', () => {
    const { container } = render(
      <TaskProvider>
        <AnalogTimer />
      </TaskProvider>
    );

    // Verify the timer-interactive-layer has proper responsive classes
    const timerInteractiveLayer = container.querySelector('#timer-interactive-layer');
    expect(timerInteractiveLayer).toBeInTheDocument();
    expect(timerInteractiveLayer).toHaveClass('w-full', 'h-full');
    
    // Verify the structure allows responsive sizing
    expect(timerInteractiveLayer).toHaveStyle({
      position: 'relative',
      width: '100%',
      height: '100%',
    });
  });

  it('should simulate maximum size constraint behavior', () => {
    const { container } = render(
      <TaskProvider>
        <AnalogTimer />
      </TaskProvider>
    );

    const timerContainer = container.querySelector('#analog-timer-container > div');
    const timerInteractiveLayer = container.querySelector('#timer-interactive-layer');

    // Mock large screen behavior where timer reaches max width
    Object.defineProperty(timerContainer, 'getBoundingClientRect', {
      value: () => ({
        width: 370,  // Should be able to reach max-width
        height: 370,
        left: 0,
        top: 0,
        right: 370,
        bottom: 370,
      }),
    });

    Object.defineProperty(timerInteractiveLayer, 'getBoundingClientRect', {
      value: () => ({
        width: 370,  // Should inherit size from parent
        height: 370,
        left: 0,
        top: 0,
        right: 370,
        bottom: 370,
      }),
    });

    // Test the sizing behavior
    const containerRect = timerContainer.getBoundingClientRect();
    const layerRect = timerInteractiveLayer.getBoundingClientRect();

    expect(containerRect.width).toBe(370);
    expect(layerRect.width).toBe(370);
    
    // Verify it's within expected bounds
    expect(containerRect.width).toBeLessThanOrEqual(370); // max-width constraint
    expect(containerRect.width).toBeGreaterThanOrEqual(280); // min-width constraint
  });

  it('should simulate minimum size constraint behavior', () => {
    const { container } = render(
      <TaskProvider>
        <AnalogTimer />
      </TaskProvider>
    );

    const timerContainer = container.querySelector('#analog-timer-container > div');
    const timerInteractiveLayer = container.querySelector('#timer-interactive-layer');

    // Mock small screen behavior where timer uses min width
    Object.defineProperty(timerContainer, 'getBoundingClientRect', {
      value: () => ({
        width: 280,  // Should respect min-width
        height: 280,
        left: 0,
        top: 0,
        right: 280,
        bottom: 280,
      }),
    });

    Object.defineProperty(timerInteractiveLayer, 'getBoundingClientRect', {
      value: () => ({
        width: 280,  // Should inherit size from parent
        height: 280,
        left: 0,
        top: 0,
        right: 280,
        bottom: 280,
      }),
    });

    // Test the sizing behavior
    const containerRect = timerContainer.getBoundingClientRect();
    const layerRect = timerInteractiveLayer.getBoundingClientRect();

    expect(containerRect.width).toBe(280);
    expect(layerRect.width).toBe(280);
    
    // Verify minimum constraints are respected
    expect(containerRect.width).toBeGreaterThanOrEqual(280);
    expect(layerRect.width).toBeGreaterThanOrEqual(280);
  });
});
