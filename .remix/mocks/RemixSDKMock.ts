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

interface Player {
  id: string;
  name: string;
  imageUrl?: string;
}

interface GameState {
  id: string;
  data: unknown;
}

interface MultiplayerGameOverData {
  scores: Array<{ playerId: string; score: number }>;
}

// Global state for multiplayer coordination
let multiplayerState: {
  gameState: GameState | null;
  players: Player[];
  currentPlayerId: string | null;
} = {
  gameState: null,
  players: [
    { id: '1', name: 'Player 1', imageUrl: undefined },
    { id: '2', name: 'Player 2', imageUrl: undefined }
  ],
  currentPlayerId: null
};

class RemixSDKMock {
  private eventListeners: Map<string, FarcadeSDKEventListener[]> = new Map();
  private isReady = false;
  private isMuted = false;
  private isMultiplayer: boolean;
  private instanceId: string;

  constructor(isMultiplayer = false) {
    this.isMultiplayer = isMultiplayer;
    this.instanceId = Math.random().toString(36).substring(2, 9);
    
    if (isMultiplayer) {
      // Set up multiplayer player assignment
      if (!multiplayerState.currentPlayerId) {
        multiplayerState.currentPlayerId = '1';
      }
    }
  }

  // Single player API
  singlePlayer = {
    actions: {
      ready: () => {
        this.isReady = true;
        this.emit('ready', {});
        
        if (this.isMultiplayer) {
          // In multiplayer, send game_info after ready
          setTimeout(() => {
            // Get player ID from URL params or assign based on instance
            const urlParams = new URLSearchParams(window.location.search);
            const meId = urlParams.get('player') || urlParams.get('instance') || '1';
            
            // Default players if not set
            const players = [
              { id: '1', name: 'Player 1', imageUrl: undefined },
              { id: '2', name: 'Player 2', imageUrl: undefined }
            ];
            
            this.emit('game_info', { players, meId });
          }, 100);
        }
        
        // Notify parent window for dev UI
        this.postToParent('ready');
      },
      
      gameOver: (data: { score?: number; finalScore?: number; highScore?: number } = {}) => {
        this.emit('game_over', data);
        
        // Notify parent window for dev UI
        this.postToParent('game_over', data);
      },

      hapticFeedback: () => {
        // Mock haptic feedback
        this.postToParent('haptic_feedback');
      },

      reportError: (errorData: any) => {
        this.postToParent('error', errorData);
      }
    }
  };

  // Multiplayer API
  multiplayer = {
    actions: {
      ...this.singlePlayer.actions,
      
      ready: () => {
        this.isReady = true;
        this.emit('ready', {});
        
        // Always send game_info for multiplayer.ready() calls
        setTimeout(() => {
          const urlParams = new URLSearchParams(window.location.search);
          const meId = urlParams.get('player') || urlParams.get('instance') || '1';
          
          // Default players if not set
          const players = [
            { id: '1', name: 'Player 1', imageUrl: undefined },
            { id: '2', name: 'Player 2', imageUrl: undefined }
          ];
          
          this.emit('game_info', { players, meId });
          
          // Don't send initial null state - let the game decide when to start
          // this.emit('game_state_updated', null);
        }, 100);
        
        this.postToParent('ready');
      },
      
      updateGameState: ({ data, alertUserIds }: { data: unknown; alertUserIds?: string[] }) => {
        // Don't check isMultiplayer here - if game calls multiplayer.actions, honor it
        
        // Generate a new game state ID
        const gameStateId = Date.now().toString() + '_' + Math.random().toString(36).substring(2, 9);
        
        // Update global state
        multiplayerState.gameState = { id: gameStateId, data };
        
        // Broadcast to all other instances
        this.broadcastGameStateUpdate({ id: gameStateId, data });
        
        // Notify parent window for dev UI
        this.postToParent('game_state_updated', { id: gameStateId, data });
      },

      refuteGameState: (gameStateId: string) => {
        
        this.postToParent('game_state_refuted', { gameStateId });
      },

      gameOver: ({ scores }: MultiplayerGameOverData) => {
        this.emit('multiplayer_game_over', { scores });
        this.postToParent('multiplayer_game_over', { scores });
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
      listeners.forEach(listener => {
        try {
          // Pass data directly to listener, not wrapped in event
          listener(data);
        } catch (error) {
          // Silently catch listener errors in development
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
          event: { type: eventType, data },
          instanceId: this.instanceId
        };
        window.parent.postMessage(message, '*');
      } catch (error) {
        // Silently handle postMessage errors
      }
    }
  }

  private broadcastGameStateUpdate(gameState: GameState): void {
    // Don't check isMultiplayer - if called, broadcast it
    
    // Use the postMessage API to communicate between iframe instances
    // In a real implementation, this would go through the Farcade servers
    const message = {
      type: 'multiplayer_game_state_broadcast',
      gameState,
      fromInstanceId: this.instanceId
    };
    
    // Broadcast to parent window which will distribute to other instances
    if (window.parent !== window) {
      try {
        window.parent.postMessage(message, '*');
      } catch (error) {
        // Silently handle broadcast errors
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
export async function initializeSDKMock(): Promise<void> {
  if (import.meta.env.DEV) {
    // Read multiplayer flag from package.json
    let isMultiplayer = false;
    try {
      const response = await fetch('/package.json');
      const packageJson = await response.json();
      isMultiplayer = packageJson.multiplayer === true;
    } catch (error) {
      // Default to single-player if package.json can't be read
    }

    const mockSDK = new RemixSDKMock(isMultiplayer);
    (window as any).FarcadeSDK = mockSDK;
    (window as any).__remixSDKMock = mockSDK; // Internal reference for dev UI
    
    // Test toggle_mute events on startup to demonstrate functionality
    setTimeout(() => {
      mockSDK.triggerMute(true);
      
      setTimeout(() => {
        mockSDK.triggerMute(false);
      }, 500);
    }, 1000);
    
    // Listen for messages from parent window (dev UI and multiplayer coordination)
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'remix_dev_command') {
        const { command } = event.data.data;
        const commandData = event.data.data;
        
        switch (command) {
          case 'play_again':
            mockSDK.triggerPlayAgain();
            break;
          case 'toggle_mute':
            mockSDK.triggerMute(commandData.isMuted);
            break;
        }
      } else if (event.data && event.data.type === 'multiplayer_game_state_broadcast') {
        // Receive game state updates from other instances
        const { gameState, fromInstanceId } = event.data;
        
        // Don't process updates from ourselves
        if (fromInstanceId !== mockSDK.instanceId) {
          // Emit the game_state_updated event to the game
          mockSDK.emit('game_state_updated', gameState);
        }
      }
    });
  }
}