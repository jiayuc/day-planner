/**
 * Timer notification utilities
 * 
 * Provides multiple notification strategies with fallbacks:
 * 1. Audio notification (requires user interaction)
 * 2. Browser notification (requires permission)
 * 3. Title flash (always works)
 */

export interface NotificationOptions {
  title?: string;
  body?: string;
  icon?: string;
  audioUrl?: string;
  flashDuration?: number;
  flashCount?: number;
}

export class TimerNotificationManager {
  private audioElement: HTMLAudioElement | null = null;
  private userHasInteracted = false;
  private originalTitle = '';

  constructor(audioUrl?: string) {
    if (audioUrl) {
      this.setupAudio(audioUrl);
    }
    this.setupUserInteractionDetection();
    this.originalTitle = document.title;
  }

  /**
   * Set up audio element with error handling
   */
  private setupAudio(audioUrl: string) {
    this.audioElement = new Audio(audioUrl);
    this.audioElement.preload = 'auto';
    
    this.audioElement.addEventListener('canplaythrough', () => {
      console.debug('[TimerNotification] Audio can play through');
    });
    
    this.audioElement.addEventListener('error', (e) => {
      console.error('[TimerNotification] Audio error:', e);
    });
  }

  /**
   * Detect user interactions to enable audio playback
   */
  private setupUserInteractionDetection() {
    const handleUserInteraction = () => {
      this.userHasInteracted = true;
      console.debug('[TimerNotification] User interaction detected, audio enabled');
      
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
  }

  /**
   * Mark user interaction manually (useful for button clicks, etc.)
   */
  markUserInteraction() {
    this.userHasInteracted = true;
  }

  /**
   * Get user interaction status
   */
  hasUserInteracted(): boolean {
    return this.userHasInteracted;
  }

  /**
   * Try to play audio notification
   */
  private async tryPlayAudio(): Promise<boolean> {
    if (!this.audioElement || !this.userHasInteracted) {
      return false;
    }

    try {
      this.audioElement.currentTime = 0;
      await this.audioElement.play();
      console.debug('[TimerNotification] Sound played successfully');
      return true;
    } catch (err) {
      console.error('[TimerNotification] Sound play failed:', err);
      return false;
    }
  }

  /**
   * Try to show browser notification
   */
  private async tryBrowserNotification(options: NotificationOptions): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    // If permission already granted, show notification
    if (Notification.permission === 'granted') {
      new Notification(options.title || 'Timer Up!', {
        body: options.body || 'Your timer has finished.',
        icon: options.icon || '/favicon.ico'
      });
      return true;
    }

    // If permission not denied, request it
    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(options.title || 'Timer Up!', {
            body: options.body || 'Your timer has finished.',
            icon: options.icon || '/favicon.ico'
          });
          return true;
        }
      } catch (err) {
        console.warn('[TimerNotification] Browser notification request failed:', err);
      }
    }

    return false;
  }

  /**
   * Flash the page title as fallback
   */
  private flashTitle(options: NotificationOptions) {
    const flashText = options.title || '🔔 TIMER UP! 🔔';
    const maxFlashes = (options.flashCount || 10) * 2; // *2 because we toggle
    const flashDuration = options.flashDuration || 500;
    
    let isFlashing = true;
    let flashCount = 0;
    
    const flashInterval = setInterval(() => {
      document.title = isFlashing ? flashText : this.originalTitle;
      isFlashing = !isFlashing;
      flashCount++;
      
      if (flashCount >= maxFlashes) {
        clearInterval(flashInterval);
        document.title = this.originalTitle;
      }
    }, flashDuration);
  }

  /**
   * Show notification using all available strategies with fallbacks
   */
  async notify(options: NotificationOptions = {}): Promise<void> {
    console.debug('[TimerNotification] Attempting to notify with options:', options);
    console.debug('[TimerNotification] userHasInteracted:', this.userHasInteracted);

    // Strategy 1: Try audio first
    const audioPlayed = await this.tryPlayAudio();
    if (audioPlayed) {
      return;
    }

    if (!this.userHasInteracted) {
      console.warn('[TimerNotification] Cannot play audio - no user interaction detected');
    }

    // Strategy 2: Try browser notification
    const browserNotified = await this.tryBrowserNotification(options);
    if (browserNotified) {
      return;
    }

    // Strategy 3: Fallback to title flash
    console.debug('[TimerNotification] Using title flash fallback');
    this.flashTitle(options);
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.audioElement) {
      this.audioElement.remove();
      this.audioElement = null;
    }
    document.title = this.originalTitle;
  }
}

/**
 * Create a notification manager instance with asset path helper
 */
export function createTimerNotificationManager(audioPath?: string): TimerNotificationManager {
  if (!audioPath) {
    return new TimerNotificationManager();
  }

  // Helper to get correct asset path for both dev and production
  const getAssetPath = (path: string) => {
    const base = import.meta.env.BASE_URL || '/';
    return base + path.replace(/^\//, '');
  };

  const fullAudioPath = getAssetPath(audioPath);
  console.debug('[TimerNotification] Creating manager with audio path:', fullAudioPath);
  
  return new TimerNotificationManager(fullAudioPath);
}
