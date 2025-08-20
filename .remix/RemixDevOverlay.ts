/**
 * Development UI overlay that simulates the Remix production environment
 * Provides phone frame, game over overlay, and SDK event controls
 */

import { PerformanceMonitor } from './PerformanceMonitor'

// Type declarations for Vite's import.meta
declare global {
  interface ImportMeta {
    hot?: {
      on(event: string, callback: (payload?: any) => void): void;
    };
    env?: {
      DEV?: boolean;
    };
  }
}

interface RemixDevFlags {
  ready: boolean;
  gameOver: boolean;
  playAgain: boolean;
  toggleMute: boolean;
}

interface FileChangeEvent {
  timestamp: number;
  files: string[];
}

interface DevEnvironmentInfo {
  packageManager: string;
  gameId: string;
  lastUpdated: number;
}

export class RemixDevOverlay {
  private container: HTMLElement;
  private iframe: HTMLIFrameElement;
  private overlay: HTMLElement;
  private scoreElement: HTMLElement;
  private playAgainButton: HTMLElement;
  private readyStatusLight: HTMLElement;
  private gameOverStatusLight: HTMLElement;
  private playAgainStatusLight: HTMLElement;
  private toggleMuteStatusLight: HTMLElement;
  private updatedText: HTMLElement;
  private muteButton: HTMLElement;
  private muteIcon: HTMLElement;
  private gameFrame: HTMLElement;
  private isMuted: boolean = false;
  private isMiniMode: boolean = false;
  private flags: RemixDevFlags = { ready: false, gameOver: false, playAgain: false, toggleMute: false };
  private lastUpdateTime: number;
  private gameId: string;
  private gameIdLoaded: boolean = false;
  private packageManager: string = 'npm';
  private needsSetup: boolean = false;
  private setupOverlay: HTMLElement;

  // Performance monitoring
  private performanceMonitor: PerformanceMonitor;
  private performanceChart: HTMLCanvasElement;
  private performancePanel: HTMLElement;
  private isPerformancePanelOpen: boolean = false;

  constructor() {
    this.initializeAsync();
    
    // Expose instance to window for dev settings integration
    window.__remixDevOverlay = this;
  }

  private async initializeAsync(): Promise<void> {
    // Set a temporary ID for immediate use
    this.gameId = this.getFallbackGameId();
    this.lastUpdateTime = Date.now(); // Use current time as placeholder
    
    // Create UI immediately with fallback ID
    this.createUI();
    this.setupEventListeners();
    this.setupFileWatcher();
    this.startUpdateTimer();
    this.loadSizePreference();
    this.updateGameFrameSize();

    // Then update with the real ID from package.json
    await this.initializeGameId();
    this.packageManager = await this.detectPackageManager();
    this.needsSetup = await this.checkIfNeedsSetup();
    this.gameIdLoaded = true;
    
    // Load saved integration status if files haven't changed
    this.loadSavedIntegrationStatus();
    
    // Show setup overlay if needed
    if (this.needsSetup) {
      this.showSetupOverlay();
    }
    
    // Expose dev environment info to the game
    this.exposeDevEnvironmentInfo();
    
    // Initialize performance monitoring
    this.initializePerformanceMonitoring();
  }

  private createUI(): void {
    // Create the main container
    this.container = document.createElement('div');
    this.container.innerHTML = `
      <div class="remix-dev-container">
        <div class="game-container">
          <div class="game-frame">
            <div class="top-nav-bar">
              <div class="nav-left">
                <button class="nav-back-btn" disabled>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20.79 33.27" fill="currentColor" class="nav-icon">
                    <title>chevron</title>
                    <path d="M16.87,0l3.92,3.92-12.94,12.72,12.94,12.71-3.92,3.92L0,16.64,16.87,0Z"></path>
                  </svg>
                </button>
              </div>
              <button type="button" id="mute-toggle-btn" class="nav-mute-btn">
                <svg id="mute-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="nav-icon">
                  <title>sound on</title>
                  <path d="M6 7l8-5v20l-8-5v-10zm-6 10h4v-10h-4v10zm20.264-13.264l-1.497 1.497c1.847 1.783 2.983 4.157 2.983 6.767 0 2.61-1.135 4.984-2.983 6.766l1.498 1.498c2.305-2.153 3.735-5.055 3.735-8.264s-1.43-6.11-3.736-8.264zm-.489 8.264c0-2.084-.915-3.967-2.384-5.391l-1.503 1.503c1.011 1.049 1.637 2.401 1.637 3.888 0 1.488-.623 2.841-1.634 3.891l1.503 1.503c1.468-1.424 2.381-3.309 2.381-5.394z"></path>
                </svg>
              </button>
            </div>
            <iframe id="game-iframe" src="/" sandbox="allow-scripts allow-forms allow-pointer-lock allow-same-origin allow-top-navigation-by-user-activation"></iframe>
            <div id="game-overlay" class="game-overlay" role="dialog" aria-modal="true" aria-labelledby="overlay-title">
              <div class="overlay-content">
                <div id="overlay-score" class="overlay-score">0</div>
                <div id="overlay-title" class="overlay-title">GAME OVER</div>
              </div>
              <div class="overlay-button-container">
                <button id="play-again-btn" class="play-again-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 61.09 67.69" fill="currentColor" class="play-icon">
                    <path d="M56.43,41.91l-42.46,24.51c-6.21,3.59-13.97-.9-13.97-8.07V9.33C0,2.16,7.76-2.32,13.97,1.26l42.46,24.51c6.21,3.59,6.21,12.55,0,16.13Z"></path>
                  </svg>
                  <span>Play Again</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="dev-status-bar">
          <div class="status-left">
            <div id="publishable-status" class="publishable-status">
              <div class="status-light-grid">
                <div id="ready-status-light" class="status-light-mini red"></div>
                <div id="game-over-status-light" class="status-light-mini red"></div>
                <div id="play-again-status-light" class="status-light-mini red"></div>
                <div id="toggle-mute-status-light" class="status-light-mini red"></div>
              </div>
              <span>Remix SDK integration</span>
            </div>
            <div id="status-panel" class="status-panel">
              <div class="status-item">
                <div id="ready-light" class="event-light red"></div>
                <span>ready</span>
              </div>
              <div class="status-item">
                <div id="game-over-light" class="event-light red"></div>
                <span>game_over</span>
              </div>
              <div class="status-item">
                <div id="play-again-light" class="event-light red"></div>
                <span>play_again</span>
              </div>
              <div class="status-item">
                <div id="toggle-mute-light" class="event-light red"></div>
                <span>toggle_mute</span>
              </div>
            </div>
          </div>
          <div class="status-center">
            <div class="performance-chart-container">
              <canvas id="performance-chart" class="performance-chart" width="200" height="50"></canvas>
              <div id="performance-panel" class="performance-panel">
                <div class="performance-stats">
                  
                  <div class="perf-section">
                    <div class="perf-header">Frame Rate</div>
                    <div class="perf-content">
                      <canvas id="fps-sparkline" class="perf-chart" width="60" height="20"></canvas>
                      <div class="perf-data">
                        <div class="perf-row">
                          <span>Current:</span>
                          <span id="fps-current" class="perf-value">--</span>
                          <span class="perf-unit">fps</span>
                        </div>
                        <div class="perf-row">
                          <span>Average:</span>
                          <span id="fps-avg" class="perf-value">--</span>
                          <span class="perf-unit">fps</span>
                        </div>
                        <div class="perf-row">
                          <span>Range:</span>
                          <span class="perf-range">
                            <span id="fps-min">--</span>-<span id="fps-max">--</span>
                          </span>
                          <span class="perf-unit">fps</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="perf-section">
                    <div class="perf-header">Timing</div>
                    <div class="perf-content">
                      <canvas id="timing-sparkline" class="perf-chart" width="60" height="20"></canvas>
                      <div class="perf-data">
                        <div class="perf-row">
                          <span>Frame Time:</span>
                          <span id="frame-time" class="perf-value">--</span>
                          <span class="perf-unit">ms</span>
                        </div>
                        <div class="perf-row" id="update-time-row" style="display: none;">
                          <span>Update:</span>
                          <span id="update-time" class="perf-value">--</span>
                          <span class="perf-unit">ms</span>
                        </div>
                        <div class="perf-row" id="render-time-row" style="display: none;">
                          <span>Render:</span>
                          <span id="render-time" class="perf-value">--</span>
                          <span class="perf-unit">ms</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="perf-section" id="memory-section" style="display: none;">
                    <div class="perf-header">Memory</div>
                    <div class="perf-content">
                      <canvas id="memory-sparkline" class="perf-chart" width="60" height="20"></canvas>
                      <div class="perf-data">
                        <div class="perf-row">
                          <span>JS Heap:</span>
                          <span id="memory-used" class="perf-value">--</span>
                          <span class="perf-unit">MB</span>
                        </div>
                        <div class="perf-row" id="texture-memory-row" style="display: none;">
                          <span>Textures:</span>
                          <span id="texture-memory" class="perf-value">--</span>
                          <span class="perf-unit">MB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="perf-section" id="rendering-section" style="display: none;">
                    <div class="perf-header">Rendering</div>
                    <div class="perf-content">
                      <div class="perf-data">
                        <div class="perf-row">
                          <span>Draw Calls:</span>
                          <span id="draw-calls" class="perf-value">--</span>
                        </div>
                        <div class="perf-row">
                          <span>Game Objects:</span>
                          <span id="game-objects" class="perf-value">--</span>
                        </div>
                        <div class="perf-row" id="physics-row" style="display: none;">
                          <span>Physics Bodies:</span>
                          <span id="physics-bodies" class="perf-value">--</span>
                        </div>
                        <div class="perf-row" id="tweens-row" style="display: none;">
                          <span>Tweens:</span>
                          <span id="active-tweens" class="perf-value">--</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="perf-section" id="jank-section">
                    <div class="perf-header">Health</div>
                    <div class="perf-content">
                      <div class="perf-data">
                        <div class="perf-row">
                          <span>Jank Events:</span>
                          <span id="jank-count" class="perf-value">--</span>
                          <span class="perf-unit">last 60s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
          <div class="status-right">
            <span id="updated-text">Updated just now</span>
          </div>
        </div>
      </div>
    `;

    // Load external CSS
    this.loadStyles();

    // Append to body
    document.body.appendChild(this.container);

    // Get references
    this.iframe = this.container.querySelector('#game-iframe') as HTMLIFrameElement;
    this.overlay = this.container.querySelector('#game-overlay') as HTMLElement;
    this.scoreElement = this.container.querySelector('#overlay-score') as HTMLElement;
    this.playAgainButton = this.container.querySelector('#play-again-btn') as HTMLElement;
    // Get references to mini status lights
    this.readyStatusLight = this.container.querySelector('#ready-status-light') as HTMLElement;
    this.gameOverStatusLight = this.container.querySelector('#game-over-status-light') as HTMLElement;
    this.playAgainStatusLight = this.container.querySelector('#play-again-status-light') as HTMLElement;
    this.toggleMuteStatusLight = this.container.querySelector('#toggle-mute-status-light') as HTMLElement;
    this.updatedText = this.container.querySelector('#updated-text') as HTMLElement;
    this.muteButton = this.container.querySelector('#mute-toggle-btn') as HTMLElement;
    this.muteIcon = this.container.querySelector('#mute-icon') as HTMLElement;
    this.gameFrame = this.container.querySelector('.game-frame') as HTMLElement;
    
    // Get performance chart references
    this.performanceChart = this.container.querySelector('#performance-chart') as HTMLCanvasElement;
    this.performancePanel = this.container.querySelector('#performance-panel') as HTMLElement;
    
    // Setup click-to-toggle panel
    const publishableStatus = this.container.querySelector('#publishable-status') as HTMLElement;
    const statusPanel = this.container.querySelector('#status-panel') as HTMLElement;
    
    let isStatusPanelOpen = false;
    
    // Toggle panel on click
    const toggleStatusPanel = () => {
      if (statusPanel.classList.contains('show')) {
        statusPanel.classList.remove('show');
        isStatusPanelOpen = false;
      } else {
        // Close the settings panel if it's open
        const settingsPanel = document.querySelector('.settings-panel');
        if (settingsPanel?.classList.contains('show')) {
          settingsPanel.classList.remove('show');
        }
        
        statusPanel.classList.add('show');
        isStatusPanelOpen = true;
      }
    };
    
    // Click to toggle
    publishableStatus.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleStatusPanel();
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (isStatusPanelOpen && 
          !statusPanel.contains(e.target as Node) && 
          !publishableStatus.contains(e.target as Node)) {
        statusPanel.classList.remove('show');
        isStatusPanelOpen = false;
      }
    });
  }

  private async loadStyles(): Promise<void> {
    try {
      // Load CSS file dynamically
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = '/.remix/remix-dev-overlay.css';
      document.head.appendChild(link);
    } catch (error) {
      // Fallback to inline styles if external CSS fails
      this.loadFallbackStyles();
    }
  }

  private loadFallbackStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      /* Fallback styles - basic layout only */
      .remix-dev-container {
        position: fixed;
        inset: 0;
        background: #0f0f0f;
        font-family: system-ui, sans-serif;
        display: flex;
        flex-direction: column;
        z-index: 1000000;
      }
      .game-container {
        position: relative;
        width: 100%;
        max-width: calc(100vh * 9 / 16);
        aspect-ratio: 9 / 16;
        margin: auto;
        background: #000;
      }
      #game-iframe {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
      }
    `;
    document.head.appendChild(style);
  }

  private setupEventListeners(): void {
    // Listen for messages from game iframe
    window.addEventListener('message', (event) => {
      if (event.source === this.iframe.contentWindow) {
        this.handleGameMessage(event.data);
      }
    });

    // Play again button
    this.playAgainButton.addEventListener('click', () => {
      this.hideOverlay();
      this.sendToGame('remix_dev_command', { command: 'play_again' });
      this.flags.playAgain = true;
      this.updateEventLight('play-again-light', true);
      this.updateMiniLight(this.playAgainStatusLight, true);
    });

    // Mute button
    this.muteButton.addEventListener('click', () => {
      this.isMuted = !this.isMuted;
      this.updateMuteIcon();
      this.sendToGame('remix_dev_command', { command: 'toggle_mute', data: { isMuted: this.isMuted } });
    });


    // Window resize listener
    window.addEventListener('resize', () => {
      this.updateGameFrameSize();
    });
  }

  private handleGameMessage(data: any): void {
    if (data && data.type === 'remix_sdk_event' && data.event) {
      const { type: eventType, data: eventData } = data.event;
      
      console.log('[SDK Event]', eventType, eventData ? JSON.stringify(eventData) : '');

      switch (eventType) {
        case 'ready':
          this.flags.ready = true;
          this.updateEventLight('ready-light', true);
          this.updateMiniLight(this.readyStatusLight, true);
          break;

        case 'game_over':
          this.flags.gameOver = true;
          this.updateEventLight('game-over-light', true);
          this.updateMiniLight(this.gameOverStatusLight, true);
          const score = eventData?.score ?? eventData?.finalScore ?? eventData?.highScore ?? 0;
          this.showOverlay(score);
          break;

        case 'play_again':
          this.flags.playAgain = true;
          this.updateEventLight('play-again-light', true);
          this.updateMiniLight(this.playAgainStatusLight, true);
          break;

        case 'toggle_mute':
          this.flags.toggleMute = true;
          this.updateEventLight('toggle-mute-light', true);
          this.updateMiniLight(this.toggleMuteStatusLight, true);
          break;
      }
    }
  }

  private showOverlay(score: number | string): void {
    this.scoreElement.textContent = String(score);
    this.overlay.classList.add('show');
  }

  private hideOverlay(): void {
    this.overlay.classList.remove('show');
  }

  private sendToGame(type: string, data: any): void {
    if (this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage({ type, data }, '*');
    }
  }

  private updateEventLight(lightId: string, isActive: boolean): void {
    const light = this.container.querySelector(`#${lightId}`) as HTMLElement;
    if (light) {
      light.className = `event-light ${isActive ? 'green' : 'red'}`;
    }
  }

  private updateMiniLight(light: HTMLElement, isActive: boolean): void {
    if (light) {
      light.className = `status-light-mini ${isActive ? 'green' : 'red'}`;
    }
  }

  private updateMuteIcon(): void {
    if (this.isMuted) {
      // Muted icon
      this.muteIcon.innerHTML = `
        <title>sound off</title>
        <path d="M19 7.358v15.642l-8-5v-.785l8-9.857zm3-6.094l-1.548-1.264-3.446 4.247-6.006 3.753v3.646l-2 2.464v-6.11h-4v10h.843l-3.843 4.736 1.548 1.264 18.452-22.736z"></path>
      `;
    } else {
      // Unmuted icon
      this.muteIcon.innerHTML = `
        <title>sound on</title>
        <path d="M6 7l8-5v20l-8-5v-10zm-6 10h4v-10h-4v10zm20.264-13.264l-1.497 1.497c1.847 1.783 2.983 4.157 2.983 6.767 0 2.61-1.135 4.984-2.983 6.766l1.498 1.498c2.305-2.153 3.735-5.055 3.735-8.264s-1.43-6.11-3.736-8.264zm-.489 8.264c0-2.084-.915-3.967-2.384-5.391l-1.503 1.503c1.011 1.049 1.637 2.401 1.637 3.888 0 1.488-.623 2.841-1.634 3.891l1.503 1.503c1.468-1.424 2.381-3.309 2.381-5.394z"></path>
      `;
    }
  }


  // Initialize game ID by fetching from package.json
  private async initializeGameId(): Promise<void> {
    const oldGameId = this.gameId;
    const newGameId = await this.fetchGameId();
    
    if (newGameId !== oldGameId) {
      // Migrate timestamp from old ID to new ID if it exists
      try {
        const oldTimestamp = localStorage.getItem(`remix-dev-last-update-${oldGameId}`);
        if (oldTimestamp) {
          localStorage.setItem(`remix-dev-last-update-${newGameId}`, oldTimestamp);
          localStorage.removeItem(`remix-dev-last-update-${oldGameId}`);
        }
      } catch (error) {
        // Could not migrate timestamp
      }
      
      this.gameId = newGameId;
      this.lastUpdateTime = this.getLastUpdateTime();
      
      // Force an immediate update to create the localStorage entry
      this.saveLastUpdateTime();
    }
  }

  // Fetch game name from package.json
  private async fetchGameId(): Promise<string> {
    try {
      const response = await fetch('/package.json');
      if (response.ok) {
        const packageJson = await response.json();
        const gameName = packageJson.name || 'unknown-game';
        // Clean the name to be localStorage-safe
        const cleanName = gameName.replace(/[^a-zA-Z0-9-_]/g, '_');
        return cleanName;
      }
    } catch (error) {
      // Could not fetch package.json, using fallback
    }
    
    // Fallback to URL-based identifier
    return this.getFallbackGameId();
  }

  // Fallback game identifier based on URL
  private getFallbackGameId(): string {
    try {
      const path = window.location.pathname;
      let hash = 0;
      const str = path + window.location.origin;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      const fallbackId = `game_${Math.abs(hash).toString(36)}`;
      return fallbackId;
    } catch (error) {
      return 'game_default';
    }
  }

  // Get the last update time for this specific game
  private getLastUpdateTime(): number {
    try {
      const stored = localStorage.getItem(`remix-dev-last-update-${this.gameId}`);
      return stored ? parseInt(stored, 10) : Date.now();
    } catch (error) {
      return Date.now();
    }
  }

  // Save the last update time for this specific game
  private saveLastUpdateTime(): void {
    try {
      // Don't save timestamps for uninitialized game templates
      if (this.gameId === 'Climb or Die') {
        return;
      }
      localStorage.setItem(`remix-dev-last-update-${this.gameId}`, this.lastUpdateTime.toString());
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }

  private saveIntegrationStatusIfStable(): void {
    try {
      // Don't save for uninitialized game templates
      if (this.gameId === 'Climb or Die') {
        return;
      }
      
      // Check if files have changed recently (within last 5 seconds)
      const now = Date.now();
      const timeSinceUpdate = now - this.lastUpdateTime;
      const isStable = timeSinceUpdate > 5000; // 5 seconds
      
      if (isStable) {
        const statusData = {
          flags: this.flags,
          savedAt: now
        };
        localStorage.setItem(`remix-dev-integration-${this.gameId}`, JSON.stringify(statusData));
      }
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }

  private loadSavedIntegrationStatus(): boolean {
    try {
      // Don't load for uninitialized game templates
      if (this.gameId === 'Climb or Die') {
        return false;
      }
      
      const stored = localStorage.getItem(`remix-dev-integration-${this.gameId}`);
      if (!stored) {
        return false;
      }
      
      const statusData = JSON.parse(stored);
      
      // Check if files have changed since we saved the status
      const hasFilesChanged = this.lastUpdateTime > statusData.savedAt;
      
      if (!hasFilesChanged) {
        // Restore the saved flags
        this.flags = { ...statusData.flags };
        
        // Update all the UI elements
        this.updateEventLight('ready-light', this.flags.ready);
        this.updateEventLight('game-over-light', this.flags.gameOver);
        this.updateEventLight('play-again-light', this.flags.playAgain);
        this.updateEventLight('toggle-mute-light', this.flags.toggleMute);
        
        // Update the mini status lights
        this.updateMiniLight(this.readyStatusLight, this.flags.ready);
        this.updateMiniLight(this.gameOverStatusLight, this.flags.gameOver);
        this.updateMiniLight(this.playAgainStatusLight, this.flags.playAgain);
        this.updateMiniLight(this.toggleMuteStatusLight, this.flags.toggleMute);
        
        return true;
      }
    } catch (error) {
      // Silently fail if localStorage is not available or data is corrupted
    }
    
    return false;
  }

  // Setup file watcher using Vite's HMR API
  private setupFileWatcher(): void {
    if (import.meta.hot) {
      // Listen for HMR updates
      import.meta.hot.on('vite:beforeUpdate', (payload) => {
        this.onFileChange(payload.updates?.map((update: any) => update.path) || []);
      });

      // Also listen for full page reloads
      import.meta.hot.on('vite:beforeFullReload', () => {
        this.onFileChange(['full-reload']);
      });
    } else {
      // Fallback: listen for focus events (when user returns to tab after editing)
      let lastFocusTime = Date.now();
      window.addEventListener('focus', () => {
        const now = Date.now();
        // If more than 5 seconds passed, assume files might have changed
        if (now - lastFocusTime > 5000) {
          this.onFileChange(['focus-return']);
        }
        lastFocusTime = now;
      });
    }
  }

  // Handle file change events - only for src directory
  private onFileChange(files: string[]): void {
    // Filter to only include src directory changes
    const srcFiles = files.filter(file => 
      file === 'full-reload' || 
      file === 'focus-return' || 
      file.includes('/src/') || 
      file.startsWith('src/')
    );
    
    if (srcFiles.length > 0) {
      this.lastUpdateTime = Date.now();
      this.saveLastUpdateTime();
      
      // Update exposed dev info
      this.exposeDevEnvironmentInfo();
    }
  }

  // Check if the project needs setup (has .remix/.setup_required file)
  private async checkIfNeedsSetup(): Promise<boolean> {
    try {
      const response = await fetch('/.remix/.setup_required', { method: 'HEAD' });
      const setupRequired = response.headers.get('X-Setup-Required');
      const needsSetup = setupRequired === 'true';
      return needsSetup;
    } catch (error) {
      return false;
    }
  }

  // Detect which package manager was used to launch the dev server
  private async detectPackageManager(): Promise<string> {
    try {
      // Get package manager info from Vite plugin
      const response = await fetch('/.remix/package-manager');
      if (response.ok) {
        const data = await response.json();
        return data.packageManager || 'npm';
      }
    } catch (error) {
      // Could not get package manager from server
    }
    
    // Default to npm
    return 'npm';
  }

  // Show setup banner above the developer toolbar
  private showSetupOverlay(): void {
    // Create the setup banner
    this.setupOverlay = document.createElement('div');
    this.setupOverlay.className = 'setup-banner';
    this.setupOverlay.innerHTML = `
      <div class="setup-banner-content">
        <span class="setup-banner-icon">⚠️</span>
        <span class="setup-banner-text">Game Setup Required - Run: <code>${this.packageManager} run remix-setup</code></span>
        <span class="setup-banner-icon">⚠️</span>
      </div>
    `;

    // Add banner styles
    const style = document.createElement('style');
    style.textContent = `
      .setup-banner {
        position: absolute;
        bottom: 70px;
        left: 0;
        right: 0;
        background: rgba(255, 140, 0, 0.9);
        border-top: 2px solid #ff8c00;
        z-index: 100;
        backdrop-filter: blur(4px);
        color: #000;
        font-family: system-ui, sans-serif;
      }
      .setup-banner-content {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 14px 16px;
        gap: 10px;
      }
      .setup-banner-icon {
        font-size: 20px;
        flex-shrink: 0;
      }
      .setup-banner-text {
        font-size: 15px;
        font-weight: 500;
        text-align: center;
      }
      .setup-banner-text code {
        background: #1a1a1a;
        padding: 4px 8px;
        border-radius: 6px;
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace;
        font-weight: 700;
        color: #33ff00;
        border: 1px solid rgba(0, 0, 0, 0.3);
        letter-spacing: 0.5px;
        font-size: 14px;
      }
    `;
    document.head.appendChild(style);

    // Add to the main container, positioned above the status bar
    const container = this.container.querySelector('.remix-dev-container') as HTMLElement;
    if (container) {
      container.appendChild(this.setupOverlay);
    }


  }

  // Hide setup banner
  private hideSetupOverlay(): void {
    if (this.setupOverlay && this.setupOverlay.parentNode) {
      this.setupOverlay.parentNode.removeChild(this.setupOverlay);
    }
  }

  // Expose development environment information to the game
  private exposeDevEnvironmentInfo(): void {
    const devInfo: DevEnvironmentInfo = {
      packageManager: this.packageManager,
      gameId: this.gameId,
      lastUpdated: this.lastUpdateTime
    };

    // Expose to window object for game access
    (window as any).__remixDevInfo = devInfo;

    // Also send to game iframe
    this.sendToGame('remix_dev_info', devInfo);
  }

  private startUpdateTimer(): void {
    const updateText = () => {
      // Don't show anything until we have the real game ID and timestamp
      if (!this.gameIdLoaded) {
        this.updatedText.textContent = '';
        return;
      }

      const seconds = Math.floor((Date.now() - this.lastUpdateTime) / 1000);
      
      if (seconds < 5) {
        this.updatedText.textContent = 'Updated just now';
      } else if (seconds < 60) {
        this.updatedText.textContent = `Updated ${seconds}s ago`;
      } else {
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
          this.updatedText.textContent = `Updated ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
        } else {
          const hours = Math.floor(minutes / 60);
          this.updatedText.textContent = `Updated ${hours} hour${hours === 1 ? '' : 's'} ago`;
        }
      }
    };

    updateText();
    setInterval(updateText, 1000);
  }

  // Method to refresh the game iframe (for hot reload)
  refreshGame(): void {
    if (this.iframe) {
      this.iframe.src = this.iframe.src;
      this.flags = { ready: false, gameOver: false, playAgain: false, toggleMute: false };
      
      // Reset all event lights to red
      this.updateEventLight('ready-light', false);
      this.updateEventLight('game-over-light', false);
      this.updateEventLight('play-again-light', false);
      this.updateEventLight('toggle-mute-light', false);
      
      // Reset all mini lights to red
      this.updateMiniLight(this.readyStatusLight, false);
      this.updateMiniLight(this.gameOverStatusLight, false);
      this.updateMiniLight(this.playAgainStatusLight, false);
      this.updateMiniLight(this.toggleMuteStatusLight, false);
      
      this.hideOverlay();
    }
  }

  // Method to update game frame size based on container
  private updateGameFrameSize(): void {
    if (this.isMiniMode) {
      // Mini mode: use actual app size but respect screen boundaries
      const actualWidth = 393;
      const actualHeight = 695;
      const containerHeight = window.innerHeight - 90; // Reserve space for status bar
      const containerWidth = window.innerWidth - 20; // Account for padding
      
      // Check if actual size fits within screen
      if (actualWidth <= containerWidth && actualHeight <= containerHeight) {
        // Use actual size if it fits
        this.gameFrame.style.width = `${actualWidth}px`;
        this.gameFrame.style.height = `${actualHeight}px`;
      } else {
        // Scale down proportionally to fit while maintaining aspect ratio
        const scaleByWidth = containerWidth / actualWidth;
        const scaleByHeight = containerHeight / actualHeight;
        const scale = Math.min(scaleByWidth, scaleByHeight);
        
        this.gameFrame.style.width = `${Math.floor(actualWidth * scale)}px`;
        this.gameFrame.style.height = `${Math.floor(actualHeight * scale)}px`;
      }
    } else {
      // Full mode: calculate responsive size
      const containerHeight = window.innerHeight - 90; // Reserve space for status bar
      const containerWidth = Math.min(window.innerWidth - 20, containerHeight * (9 / 16)); // 9:16 aspect ratio
      const calculatedHeight = containerWidth * (16 / 9);
      
      this.gameFrame.style.width = `${Math.min(containerWidth, containerHeight * (9 / 16))}px`;
      this.gameFrame.style.height = `${Math.min(calculatedHeight, containerHeight)}px`;
    }
  }

  // Method to load size preference from dev settings
  private loadSizePreference(): void {
    try {
      // Check if devSettings exists, otherwise use legacy localStorage
      if (window.devSettings) {
        const fullSize = window.devSettings.getSetting('fullSize');
        this.setSize(!fullSize); // fullSize=true means isMini=false
      } else {
        const savedPreference = localStorage.getItem('remix-dev-size-mode');
        if (savedPreference === 'mini') {
          this.setSize(true);
        } else {
          this.setSize(false);
        }
      }
    } catch (error) {
      // If anything fails, default to full size
      this.setSize(false);
    }
  }

  // Method to save size preference to dev settings and localStorage
  private saveSizePreference(): void {
    try {
      // Save to dev settings if available
      if (window.devSettings) {
        window.devSettings.setSetting('fullSize', !this.isMiniMode); // fullSize=true means isMini=false
      }
      // Also save to legacy localStorage for backwards compatibility
      localStorage.setItem('remix-dev-size-mode', this.isMiniMode ? 'mini' : 'full');
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }

  // Method to set size mode
  public setSize(isMini: boolean): void {
    if (this.isMiniMode === isMini) return; // No change needed
    
    this.isMiniMode = isMini;
    this.updateGameFrameSize();
    this.saveSizePreference();
  }

  // Initialize performance monitoring system
  private initializePerformanceMonitoring(): void {
    if (!this.iframe || !this.performanceChart) return;
    
    // Create performance monitor
    this.performanceMonitor = new PerformanceMonitor(this.iframe);
    
    // Setup chart hover events
    this.setupPerformanceChartEvents();
    
    // Start rendering the chart
    this.startPerformanceChart();
  }
  
  private setupPerformanceChartEvents(): void {
    // Hover to show performance panel
    this.performanceChart.addEventListener('mouseenter', () => {
      this.showPerformancePanel();
    });
    
    this.performanceChart.addEventListener('mouseleave', () => {
      this.hidePerformancePanel();
    });
    
    // Also handle panel hover to keep it open
    this.performancePanel.addEventListener('mouseenter', () => {
      this.showPerformancePanel();
    });
    
    this.performancePanel.addEventListener('mouseleave', () => {
      this.hidePerformancePanel();
    });
  }
  
  private showPerformancePanel(): void {
    this.isPerformancePanelOpen = true;
    this.performancePanel.classList.add('show');
    this.updatePerformancePanelData();
    this.renderSparklines();
  }
  
  private hidePerformancePanel(): void {
    this.isPerformancePanelOpen = false;
    this.performancePanel.classList.remove('show');
  }
  
  private updatePerformancePanelData(): void {
    if (!this.performanceMonitor) return;
    
    const fpsStats = this.performanceMonitor.getFPSStats();
    const frameTimeStats = this.performanceMonitor.getFrameTimeStats();
    const memoryStats = this.performanceMonitor.getMemoryStats();
    const renderingStats = this.performanceMonitor.getRenderingStats();
    const latestData = this.performanceMonitor.getLatestData();
    const tier = this.performanceMonitor.getTier();
    
    
    // Update FPS data
    const elements = {
      fpsCurrentEl: this.container.querySelector('#fps-current'),
      fpsAvgEl: this.container.querySelector('#fps-avg'),
      fpsMinEl: this.container.querySelector('#fps-min'),
      fpsMaxEl: this.container.querySelector('#fps-max'),
      frameTimeEl: this.container.querySelector('#frame-time'),
      updateTimeEl: this.container.querySelector('#update-time'),
      renderTimeEl: this.container.querySelector('#render-time'),
      jankCountEl: this.container.querySelector('#jank-count')
    };
    
    // Update basic performance data
    if (elements.fpsCurrentEl) elements.fpsCurrentEl.textContent = fpsStats.current.toString();
    if (elements.fpsAvgEl) elements.fpsAvgEl.textContent = fpsStats.average.toString();
    if (elements.fpsMinEl) elements.fpsMinEl.textContent = fpsStats.min.toString();
    if (elements.fpsMaxEl) elements.fpsMaxEl.textContent = fpsStats.max.toString();
    if (elements.frameTimeEl) elements.frameTimeEl.textContent = frameTimeStats.current.toFixed(1);
    
    // Update jank count
    const jankEvents = this.performanceMonitor.getJankEvents().filter(
      event => performance.now() - event.timestamp < 60000
    );
    if (elements.jankCountEl) elements.jankCountEl.textContent = jankEvents.length.toString();
    
    // Update tier 1 specific data
    if (latestData && tier === 'plugin') {
      const updateTimeRow = this.container.querySelector('#update-time-row') as HTMLElement;
      const renderTimeRow = this.container.querySelector('#render-time-row') as HTMLElement;
      
      if (latestData.updateTime !== undefined && updateTimeRow && elements.updateTimeEl) {
        updateTimeRow.style.display = 'flex';
        elements.updateTimeEl.textContent = latestData.updateTime.toFixed(1);
      }
      
      if (latestData.renderTime !== undefined && renderTimeRow && elements.renderTimeEl) {
        renderTimeRow.style.display = 'flex';
        elements.renderTimeEl.textContent = latestData.renderTime.toFixed(1);
      }
    }
    
    // Update memory data if available
    const memorySection = this.container.querySelector('#memory-section') as HTMLElement;
    const memoryUsedEl = this.container.querySelector('#memory-used');
    const textureMemoryEl = this.container.querySelector('#texture-memory');
    const textureMemoryRow = this.container.querySelector('#texture-memory-row') as HTMLElement;
    
    if (memoryStats && memorySection && memoryUsedEl) {
      memorySection.style.display = 'block';
      memoryUsedEl.textContent = memoryStats.used.current.toString();
      
      // Show texture memory if available (tier 1 only)
      if (latestData?.memory?.textureMemory !== undefined && textureMemoryEl && textureMemoryRow) {
        textureMemoryRow.style.display = 'flex';
        textureMemoryEl.textContent = latestData.memory.textureMemory.toString();
      }
    }
    
    // Update rendering data if available (tier 1 only)
    const renderingSection = this.container.querySelector('#rendering-section') as HTMLElement;
    const drawCallsEl = this.container.querySelector('#draw-calls');
    const gameObjectsEl = this.container.querySelector('#game-objects');
    const physicsBodiesEl = this.container.querySelector('#physics-bodies');
    const activeTweensEl = this.container.querySelector('#active-tweens');
    const physicsRow = this.container.querySelector('#physics-row') as HTMLElement;
    const tweensRow = this.container.querySelector('#tweens-row') as HTMLElement;
    
    if (renderingStats && renderingSection && drawCallsEl && gameObjectsEl) {
      renderingSection.style.display = 'block';
      drawCallsEl.textContent = renderingStats.drawCalls.toString();
      gameObjectsEl.textContent = renderingStats.gameObjects.toString();
      
      // Show additional rendering stats if available
      if (renderingStats.physicsBodies > 0 && physicsBodiesEl && physicsRow) {
        physicsRow.style.display = 'flex';
        physicsBodiesEl.textContent = renderingStats.physicsBodies.toString();
      }
      
      if (renderingStats.activeTweens > 0 && activeTweensEl && tweensRow) {
        tweensRow.style.display = 'flex';
        activeTweensEl.textContent = renderingStats.activeTweens.toString();
      }
    }
  }
  
  private startPerformanceChart(): void {
    const renderChart = () => {
      if (!this.performanceMonitor || !this.performanceChart) {
        requestAnimationFrame(renderChart);
        return;
      }
      
      this.renderPerformanceChart();
      
      // Update panel data in real-time if panel is open
      if (this.isPerformancePanelOpen) {
        this.updatePerformancePanelData();
        this.renderSparklines();
      }
      
      requestAnimationFrame(renderChart);
    };
    
    requestAnimationFrame(renderChart);
  }
  
  private renderPerformanceChart(): void {
    const canvas = this.performanceChart;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rawData = this.performanceMonitor.getData();
    if (rawData.length === 0) return;
    
    // Create optimistic data with future projections
    const data = this.createOptimisticData(rawData);
    
    const width = canvas.width;
    const height = canvas.height;
    const leftMargin = 15; // Reserve space for scale text
    const chartWidth = width - leftMargin;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = 'rgba(26, 26, 26, 0.8)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw performance zones - cap at 60fps for consistent scaling
    const latestData = this.performanceMonitor.getLatestData();
    const currentFPS = latestData ? latestData.fps : 60;
    const maxFPS = 60; // Always cap at 60fps for consistent scale
    
    // Draw subtle grid lines (only in chart area)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines at 15, 30, 45, 60fps
    const gridLines = [15, 30, 45];
    gridLines.forEach(fps => {
      const y = height - ((fps / maxFPS) * height);
      ctx.beginPath();
      ctx.moveTo(leftMargin, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    });
    
    // Draw FPS area chart with dynamic fill
    if (data.length > 1) {
      const now = performance.now();
      // Use a fixed time window that scrolls smoothly
      const timeWindow = 60 * 1000; // 60 seconds
      const maxTimestamp = now;
      const minTimestamp = now - timeWindow;
      const timeSpan = timeWindow;
      
      // Filter data to only show points within the time window
      const visibleData = data.filter(d => d.timestamp >= minTimestamp && d.timestamp <= maxTimestamp);
      
      if (visibleData.length > 1) {
        // Ensure we have data points at the exact boundaries to prevent gaps
        const boundaryData = [...visibleData];
        
        // Add a point at the left boundary if needed
        if (boundaryData[0].timestamp > minTimestamp) {
          boundaryData.unshift({
            timestamp: minTimestamp,
            fps: boundaryData[0].fps,
            frameTime: boundaryData[0].frameTime,
            isReal: false
          });
        }
        
        // Add a point at the right boundary if needed
        if (boundaryData[boundaryData.length - 1].timestamp < maxTimestamp) {
          const lastPoint = boundaryData[boundaryData.length - 1];
          boundaryData.push({
            timestamp: maxTimestamp,
            fps: lastPoint.fps,
            frameTime: lastPoint.frameTime,
            isReal: false
          });
        }
        
        // Create path for filled area
        ctx.beginPath();
        
        // Start from bottom left of chart area
        ctx.moveTo(leftMargin, height);
        
        // Draw to first point
        const firstPoint = boundaryData[0];
        const firstDisplayFPS = Math.min(firstPoint.fps, maxFPS);
        const firstY = height - ((firstDisplayFPS / maxFPS) * height);
        ctx.lineTo(leftMargin, firstY);
      
        // Draw the performance line path
        boundaryData.forEach((point, index) => {
          const x = leftMargin + ((point.timestamp - minTimestamp) / timeSpan) * chartWidth;
          const displayFPS = Math.min(point.fps, maxFPS);
          const y = height - ((displayFPS / maxFPS) * height);
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
      
        // Close the path at bottom right - always extend to full width
        ctx.lineTo(leftMargin + chartWidth, height);
        ctx.lineTo(leftMargin, height);
        ctx.closePath();
          
          // Create gradient based on overall performance
          const recentData = boundaryData.slice(-10);
          const avgFPS = recentData.length > 0 
            ? recentData.reduce((sum, p) => sum + p.fps, 0) / recentData.length
            : currentFPS;
        let gradient = ctx.createLinearGradient(0, 0, 0, height);
        
        if (avgFPS >= 55) {
          // Good performance - green gradient
          gradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
          gradient.addColorStop(1, 'rgba(34, 197, 94, 0.1)');
        } else if (avgFPS >= 30) {
          // OK performance - yellow/orange gradient
          gradient.addColorStop(0, 'rgba(234, 179, 8, 0.4)');
          gradient.addColorStop(1, 'rgba(234, 179, 8, 0.1)');
        } else {
          // Poor performance - red gradient
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0.1)');
        }
        
        // Fill the area
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw performance line
        ctx.beginPath();
        boundaryData.forEach((point, index) => {
          const x = leftMargin + ((point.timestamp - minTimestamp) / timeSpan) * chartWidth;
          const displayFPS = Math.min(point.fps, maxFPS);
          const y = height - ((displayFPS / maxFPS) * height);
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        
        // Line color based on current FPS
        if (currentFPS >= 55) {
          ctx.strokeStyle = '#33ff00';
        } else if (currentFPS >= 30) {
          ctx.strokeStyle = '#eab308';
        } else {
          ctx.strokeStyle = '#ef4444';
        }
        
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Draw jank markers (frame spikes) - only for visible timeframe
      const jankEvents = this.performanceMonitor.getJankEvents().filter(
        jankPoint => jankPoint.timestamp >= minTimestamp && jankPoint.timestamp <= maxTimestamp
      );
      jankEvents.forEach(jankPoint => {
        const x = leftMargin + ((jankPoint.timestamp - minTimestamp) / timeSpan) * chartWidth;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x, 8, 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add small exclamation mark
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('!', x, 6);
      });
    }
    
    // Draw current FPS indicator and scale
    if (latestData) {
      const color = currentFPS >= 60 ? '#33ff00' : 
                   currentFPS >= 30 ? '#eab308' : '#ef4444';
      
      // Draw scale indicators first (left side) - now they have proper space
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '8px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('60', 2, 10);
      ctx.fillText('30', 2, Math.round(height / 2) + 3);
      ctx.fillText('0', 2, height - 3);
      
      // Draw FPS badge in bottom right corner
      const fpsText = `${currentFPS}fps`;
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      
      // Measure text to calculate badge size
      const textMetrics = ctx.measureText(fpsText);
      const textWidth = textMetrics.width;
      const textHeight = 10; // font size
      const padding = 4;
      const badgeWidth = textWidth + (padding * 2);
      const badgeHeight = textHeight + (padding * 2);
      const badgeX = width - badgeWidth - 4;
      const badgeY = height - badgeHeight - 4;
      
      // Draw rounded background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.beginPath();
      // Manual rounded rectangle since roundRect may not be available in all browsers
      const radius = 3;
      ctx.moveTo(badgeX + radius, badgeY);
      ctx.lineTo(badgeX + badgeWidth - radius, badgeY);
      ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY, badgeX + badgeWidth, badgeY + radius);
      ctx.lineTo(badgeX + badgeWidth, badgeY + badgeHeight - radius);
      ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY + badgeHeight, badgeX + badgeWidth - radius, badgeY + badgeHeight);
      ctx.lineTo(badgeX + radius, badgeY + badgeHeight);
      ctx.quadraticCurveTo(badgeX, badgeY + badgeHeight, badgeX, badgeY + badgeHeight - radius);
      ctx.lineTo(badgeX, badgeY + radius);
      ctx.quadraticCurveTo(badgeX, badgeY, badgeX + radius, badgeY);
      ctx.closePath();
      ctx.fill();
      
      // Draw border
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw text
      ctx.fillStyle = color;
      ctx.fillText(fpsText, badgeX + padding, badgeY + padding + textHeight - 2);
    }
  }

  private renderSparklines(): void {
    if (!this.performanceMonitor) return;

    const data = this.performanceMonitor.getData();
    if (data.length === 0) return;

    // Get the last 30 data points for sparklines (30 seconds)
    const sparklineData = data.slice(-30);
    
    // Render FPS sparkline
    this.renderSparkline('fps-sparkline', sparklineData.map(d => d.fps), 0, 60, '#33ff00');
    
    // Render frame time sparkline
    this.renderSparkline('timing-sparkline', sparklineData.map(d => d.frameTime), 0, 33.33, '#33ff00');
    
    // Render memory sparkline if available
    const memoryData = sparklineData.filter(d => d.memory).map(d => d.memory!.used);
    if (memoryData.length > 0) {
      const maxMemory = Math.max(...memoryData) * 1.2;
      this.renderSparkline('memory-sparkline', memoryData, 0, maxMemory, '#33ff00');
    }
  }

  private renderSparkline(canvasId: string, values: number[], minValue: number, maxValue: number, color: string): void {
    const canvas = this.container.querySelector(`#${canvasId}`) as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (values.length < 2) return;

    // Draw sparkline
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    values.forEach((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const normalizedValue = Math.max(0, Math.min(1, (value - minValue) / (maxValue - minValue)));
      const y = height - (normalizedValue * height);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw current value dot
    const lastValue = values[values.length - 1];
    const lastX = width;
    const lastNormalized = Math.max(0, Math.min(1, (lastValue - minValue) / (maxValue - minValue)));
    const lastY = height - (lastNormalized * height);
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(lastX - 1, lastY, 2, 0, 2 * Math.PI);
    ctx.fill();
  }

  private createOptimisticData(rawData: any[]): any[] {
    if (rawData.length === 0) return [];
    
    const now = performance.now();
    const interval = 1000; // 1 second intervals
    
    // Start with all real data
    const optimisticData: any[] = [...rawData];
    
    // Find the most recent real data point
    const latestRealData = rawData[rawData.length - 1];
    if (!latestRealData) return [];
    
    // Add optimistic data to fill the gap from latest real data to current time
    // and project well into the future to prevent gaps
    const futureStartTime = latestRealData.timestamp + interval;
    const futureEndTime = now + (10 * 1000); // Project 10 seconds into the future
    
    // Calculate trend from recent data for projection
    const recentData = rawData.slice(-3); // Last 3 points for trend
    const trend = this.calculateTrend(recentData);
    
    // Always add a point at "now" to fill the gap to the right edge
    const timeSinceLatest = (now - latestRealData.timestamp) / 1000; // seconds
    if (timeSinceLatest > 0.5) { // Only if there's a meaningful gap
      const dampening = Math.max(0.3, 1 - (timeSinceLatest * 0.1));
      optimisticData.push({
        timestamp: now,
        fps: Math.max(15, Math.min(120, latestRealData.fps + (trend.fpsTrend * timeSinceLatest * dampening))),
        frameTime: Math.max(8, Math.min(67, latestRealData.frameTime + (trend.frameTimeTrend * timeSinceLatest * dampening))),
        isReal: false,
        isProjected: true,
        confidence: dampening
      });
    }
    
    // Add future optimistic data points
    for (let timestamp = futureStartTime; timestamp <= futureEndTime; timestamp += interval) {
      const timeDelta = (timestamp - latestRealData.timestamp) / 1000; // seconds
      
      // Project future performance with trend dampening over time
      const dampening = Math.max(0.1, 1 - (timeDelta * 0.2)); // Reduce confidence over time
      
      optimisticData.push({
        timestamp: timestamp,
        fps: Math.max(15, Math.min(120, latestRealData.fps + (trend.fpsTrend * timeDelta * dampening))),
        frameTime: Math.max(8, Math.min(67, latestRealData.frameTime + (trend.frameTimeTrend * timeDelta * dampening))),
        isReal: false,
        isProjected: true,
        confidence: dampening // Add confidence level for visual styling
      });
    }
    
    return optimisticData;
  }


  private calculateTrend(recentData: any[]): { fpsTrend: number, frameTimeTrend: number } {
    if (recentData.length < 2) {
      return { fpsTrend: 0, frameTimeTrend: 0 };
    }
    
    // Simple linear regression for trend
    const timeSpan = recentData[recentData.length - 1].timestamp - recentData[0].timestamp;
    if (timeSpan === 0) {
      return { fpsTrend: 0, frameTimeTrend: 0 };
    }
    
    const fpsChange = recentData[recentData.length - 1].fps - recentData[0].fps;
    const frameTimeChange = recentData[recentData.length - 1].frameTime - recentData[0].frameTime;
    
    // Extrapolate trend per second, but dampen it to prevent wild swings
    const fpsTrend = (fpsChange / timeSpan) * 1000 * 0.3; // Dampen by 70%
    const frameTimeTrend = (frameTimeChange / timeSpan) * 1000 * 0.3;
    
    return { fpsTrend, frameTimeTrend };
  }

  // Method to completely dispose of the overlay
  dispose(): void {
    if (this.performanceMonitor) {
      this.performanceMonitor.dispose();
    }
    
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    // Clean up global reference
    if (window.__remixDevOverlay === this) {
      delete window.__remixDevOverlay;
    }
  }
}

// Use window object to persist across module reloads
declare global {
  interface Window {
    __remixDevOverlay?: RemixDevOverlay;
  }
}

// Initialize the dev overlay if in development mode
export function initializeDevOverlay(): RemixDevOverlay | null {
  if (import.meta.env?.DEV) {
    // Clean up any existing overlays first
    const existingOverlays = document.querySelectorAll('.remix-dev-container');
    existingOverlays.forEach(overlay => overlay.remove());
    
    const overlay = new RemixDevOverlay();
    window.__remixDevOverlay = overlay;
    return overlay;
  }
  return null;
}