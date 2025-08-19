/**
 * Development UI overlay that simulates the Remix production environment
 * Provides phone frame, game over overlay, and SDK event controls
 */

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
  private publishableIcon: HTMLElement;
  private updatedText: HTMLElement;
  private muteButton: HTMLElement;
  private muteIcon: HTMLElement;
  private fullSizeButton: HTMLElement;
  private miniSizeButton: HTMLElement;
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

  constructor() {
    this.initializeAsync();
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
              <div id="status-light" class="status-light red"></div>
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
            <div class="size-toggle-group">
              <button id="full-size-btn" class="size-toggle-option active">Full</button>
              <button id="mini-size-btn" class="size-toggle-option">Actual</button>
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
    this.publishableIcon = this.container.querySelector('#status-light') as HTMLElement;
    this.updatedText = this.container.querySelector('#updated-text') as HTMLElement;
    this.muteButton = this.container.querySelector('#mute-toggle-btn') as HTMLElement;
    this.muteIcon = this.container.querySelector('#mute-icon') as HTMLElement;
    this.fullSizeButton = this.container.querySelector('#full-size-btn') as HTMLElement;
    this.miniSizeButton = this.container.querySelector('#mini-size-btn') as HTMLElement;
    this.gameFrame = this.container.querySelector('.game-frame') as HTMLElement;
    
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
      this.updatePublishableStatus();
    });

    // Mute button
    this.muteButton.addEventListener('click', () => {
      this.isMuted = !this.isMuted;
      this.updateMuteIcon();
      this.sendToGame('remix_dev_command', { command: 'toggle_mute', data: { isMuted: this.isMuted } });
    });

    // Size toggle buttons
    if (this.fullSizeButton) {
      this.fullSizeButton.addEventListener('click', () => {
        this.setSize(false); // false = full size
      });
    }
    
    if (this.miniSizeButton) {
      this.miniSizeButton.addEventListener('click', () => {
        this.setSize(true); // true = mini/actual size
      });
    }

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
          this.updatePublishableStatus();
          break;

        case 'game_over':
          this.flags.gameOver = true;
          this.updateEventLight('game-over-light', true);
          this.updatePublishableStatus();
          const score = eventData?.score ?? eventData?.finalScore ?? eventData?.highScore ?? 0;
          this.showOverlay(score);
          break;

        case 'play_again':
          this.flags.playAgain = true;
          this.updateEventLight('play-again-light', true);
          this.updatePublishableStatus();
          break;

        case 'toggle_mute':
          this.flags.toggleMute = true;
          this.updateEventLight('toggle-mute-light', true);
          this.updatePublishableStatus();
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

  private updatePublishableStatus(): void {
    const readyCount = [this.flags.ready, this.flags.gameOver, this.flags.playAgain, this.flags.toggleMute].filter(Boolean).length;
    const totalEvents = 4;
    
    let statusClass = 'red';
    if (readyCount === totalEvents) {
      statusClass = 'green';
    } else if (readyCount > 0) {
      statusClass = 'yellow';
    }
    
    this.publishableIcon.className = `status-light ${statusClass}`;
    
    // Save integration status if no files have changed
    this.saveIntegrationStatusIfStable();
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
        
        // Update the main status light without saving again
        const readyCount = [this.flags.ready, this.flags.gameOver, this.flags.playAgain, this.flags.toggleMute].filter(Boolean).length;
        const totalEvents = 4;
        let statusClass = 'red';
        if (readyCount === totalEvents) {
          statusClass = 'green';
        } else if (readyCount > 0) {
          statusClass = 'yellow';
        }
        this.publishableIcon.className = `status-light ${statusClass}`;
        
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
        z-index: 1000;
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
      
      this.updatePublishableStatus();
      this.hideOverlay();
    }
  }

  // Method to update game frame size based on container
  private updateGameFrameSize(): void {
    if (this.isMiniMode) {
      // Mini mode: use actual app size
      this.gameFrame.style.width = '393px';
      this.gameFrame.style.height = '695px';
    } else {
      // Full mode: calculate responsive size
      const containerHeight = window.innerHeight - 90; // Reserve space for status bar
      const containerWidth = Math.min(window.innerWidth - 20, containerHeight * (9 / 16)); // 9:16 aspect ratio
      const calculatedHeight = containerWidth * (16 / 9);
      
      this.gameFrame.style.width = `${Math.min(containerWidth, containerHeight * (9 / 16))}px`;
      this.gameFrame.style.height = `${Math.min(calculatedHeight, containerHeight)}px`;
    }
  }

  // Method to load size preference from localStorage
  private loadSizePreference(): void {
    try {
      const savedPreference = localStorage.getItem('remix-dev-size-mode');
      if (savedPreference === 'mini') {
        this.setSize(true);
      } else {
        this.setSize(false);
      }
    } catch (error) {
      // If localStorage fails, default to full size
      this.setSize(false);
    }
  }

  // Method to save size preference to localStorage
  private saveSizePreference(): void {
    try {
      localStorage.setItem('remix-dev-size-mode', this.isMiniMode ? 'mini' : 'full');
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }

  // Method to set size mode
  private setSize(isMini: boolean): void {
    if (this.isMiniMode === isMini) return; // No change needed
    
    this.isMiniMode = isMini;
    this.updateGameFrameSize();
    this.saveSizePreference();
    
    if (this.isMiniMode) {
      this.fullSizeButton.classList.remove('active');
      this.miniSizeButton.classList.add('active');
    } else {
      this.fullSizeButton.classList.add('active');
      this.miniSizeButton.classList.remove('active');
    }
    
  }

  // Method to completely dispose of the overlay
  dispose(): void {
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
  if (import.meta.env.DEV) {
    // Clean up any existing overlays first
    const existingOverlays = document.querySelectorAll('.remix-dev-container');
    existingOverlays.forEach(overlay => overlay.remove());
    
    return new RemixDevOverlay();
  }
  return null;
}