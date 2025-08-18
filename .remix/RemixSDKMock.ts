/**
 * Development-only mock of the Remix/Farcade SDK
 * This provides the same API as the production SDK for testing purposes
 */

interface FarcadeSDKEvent {
  type: string;
  data?: any;
}

interface FarcadeSDKEventListener {
  (event: FarcadeSDKEvent): void;
}

class RemixSDKMock {
  private eventListeners: Map<string, FarcadeSDKEventListener[]> = new Map();
  private isReady = false;
  private isMuted = false;

  // Single player API
  singlePlayer = {
    actions: {
      ready: () => {
        this.isReady = true;
        this.emit('ready', {});
        
        // Notify parent window for dev UI
        this.postToParent('ready');
      },
      
      gameOver: (data: { score?: number; finalScore?: number; highScore?: number } = {}) => {
        this.emit('game_over', data);
        
        // Notify parent window for dev UI
        this.postToParent('game_over', data);
      }
    }
  };

  // Event system
  on(eventType: string, listener: FarcadeSDKEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  off(eventType: string, listener: FarcadeSDKEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(eventType: string, data?: any): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const event: FarcadeSDKEvent = { type: eventType, data };
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`[SDK] Error in '${eventType}' listener:`, error);
        }
      });
    }
  }

  // Utility methods for dev environment
  private postToParent(eventType: string, data?: any): void {
    if (window.parent !== window) {
      try {
        const message = {
          type: 'remix_sdk_event',
          event: { type: eventType, data }
        };
        window.parent.postMessage(message, '*');
      } catch (error) {
        console.warn('[SDK] Could not post to parent:', error);
      }
    }
  }

  // Dev-only methods for triggering events from parent window
  triggerPlayAgain(): void {
    this.emit('play_again', {});
    this.postToParent('play_again', {});
  }

  triggerMute(isMuted: boolean): void {
    this.isMuted = isMuted;
    this.emit('toggle_mute', { isMuted });
    this.postToParent('toggle_mute', { isMuted });
  }

  // Status getters for dev UI
  getStatus() {
    return {
      ready: this.isReady,
      muted: this.isMuted
    };
  }
}

// Initialize the mock SDK if we're in development and no real SDK exists
export function initializeSDKMock(): void {
  if (import.meta.env.DEV) {
    const mockSDK = new RemixSDKMock();
    (window as any).FarcadeSDK = mockSDK;
    (window as any).__remixSDKMock = mockSDK; // Internal reference for dev UI
    
    // Test toggle_mute events on startup to demonstrate functionality
    setTimeout(() => {
      mockSDK.triggerMute(true);
      
      setTimeout(() => {
        mockSDK.triggerMute(false);
      }, 500);
    }, 1000);
    
    // Listen for messages from parent window (dev UI)
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'remix_dev_command') {
        const { command, data } = event.data;
        
        switch (command) {
          case 'play_again':
            mockSDK.triggerPlayAgain();
            break;
          case 'toggle_mute':
            mockSDK.triggerMute(data.isMuted);
            break;
        }
      }
    });
  }
}