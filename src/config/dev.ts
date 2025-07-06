/**
 * Development configuration and utilities
 * This file contains settings and helpers to make local development easier
 */

export const isDevelopment = import.meta.env.DEV;

export const devConfig = {
  // Timer settings
  defaultTimerSeconds: isDevelopment ? 3 : 15 * 60, // 3 seconds in dev, 15 minutes in production
  
  // Bell animation settings
  bellAnimationDuration: isDevelopment ? 60000 : 60000, // 1 minute in both dev and prod
  
  // Debug settings
  enableDebugLogs: isDevelopment,
  showDevTools: isDevelopment,
};

/**
 * Development utilities for easier testing and debugging
 */
export const devUtils = {
  /**
   * Clear all localStorage data related to the app
   */
  clearAllStorage: () => {
    if (!isDevelopment) {
      console.warn('clearAllStorage is only available in development mode');
      return;
    }
    
    const keys = Object.keys(localStorage);
    const appKeys = keys.filter(key => 
      key.startsWith('timer_') || 
      key.startsWith('tasks_') || 
      key.startsWith('app_')
    );
    
    appKeys.forEach(key => localStorage.removeItem(key));
    console.log('Cleared localStorage keys:', appKeys);
    
    // Reload the page to reset all state
    window.location.reload();
  },

  /**
   * Clear only timer-related localStorage data
   */
  clearTimerStorage: () => {
    if (!isDevelopment) {
      console.warn('clearTimerStorage is only available in development mode');
      return;
    }
    
    const timerKeys = Object.keys(localStorage).filter(key => key.startsWith('timer_'));
    timerKeys.forEach(key => localStorage.removeItem(key));
    console.log('Cleared timer localStorage keys:', timerKeys);
    
    // Reload the page to reset timer state
    window.location.reload();
  },

  /**
   * Clear only task-related localStorage data
   */
  clearTaskStorage: () => {
    if (!isDevelopment) {
      console.warn('clearTaskStorage is only available in development mode');
      return;
    }
    
    const taskKeys = Object.keys(localStorage).filter(key => key.startsWith('tasks_'));
    taskKeys.forEach(key => localStorage.removeItem(key));
    console.log('Cleared task localStorage keys:', taskKeys);
    
    // Reload the page to reset task state
    window.location.reload();
  },

  /**
   * Log all current localStorage data
   */
  logStorage: () => {
    if (!isDevelopment) {
      console.warn('logStorage is only available in development mode');
      return;
    }
    
    const storage: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          storage[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          storage[key] = localStorage.getItem(key);
        }
      }
    }
    console.log('Current localStorage:', storage);
  },

  /**
   * Set timer to a specific number of seconds (for testing)
   */
  setTestTimer: (seconds: number) => {
    if (!isDevelopment) {
      console.warn('setTestTimer is only available in development mode');
      return;
    }
    
    localStorage.setItem('timer_totalSeconds', JSON.stringify(seconds));
    localStorage.setItem('timer_elapsedSeconds', JSON.stringify(0));
    localStorage.setItem('timer_running', JSON.stringify(false));
    localStorage.setItem('timer_dinged', JSON.stringify(false));
    console.log(`Set timer to ${seconds} seconds`);
    
    // Reload to apply changes
    window.location.reload();
  }
};

// Make dev utilities available globally in development
if (isDevelopment && typeof window !== 'undefined') {
  (window as any).devUtils = devUtils;
  console.log('Development utilities available at window.devUtils:', Object.keys(devUtils));
}
