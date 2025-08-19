/**
 * Dev Environment Settings Panel
 * Provides toggles for various dev environment features
 */

interface DevSettings {
  canvasGlow: boolean;
  backgroundPattern: boolean;
}

class DevSettingsManager {
  private settings: DevSettings
  private settingsPanel: HTMLElement | null = null
  private settingsButton: HTMLElement | null = null
  private isOpen = false
  private isSafari = false
  private isMobileDevice = false

  constructor() {
    // Detect Safari browser (specifically Safari, not Chrome or other WebKit browsers)  
    this.isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)
    
    // Detect mobile touch devices
    this.isMobileDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || 
                         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    this.settings = this.loadSettings()
    this.initialize()
  }

  private loadSettings(): DevSettings {
    const saved = localStorage.getItem('climb-or-die-dev-settings')
    if (saved) {
      try {
        return { ...this.getDefaultSettings(), ...JSON.parse(saved) }
      } catch (e) {
        // Failed to parse saved settings
      }
    }
    return this.getDefaultSettings()
  }

  private getDefaultSettings(): DevSettings {
    return {
      canvasGlow: true,
      backgroundPattern: true
    }
  }

  private saveSettings() {
    localStorage.setItem('climb-or-die-dev-settings', JSON.stringify(this.settings))
  }

  private initialize() {
    this.createSettingsButton()
    this.applySettings()
  }

  private createSettingsButton() {
    // Wait for status bar to exist
    const checkForStatusBar = () => {
      const statusRight = document.querySelector('.status-right')
      if (statusRight) {
        // Create settings container following the same pattern as publishable-status
        const settingsContainer = document.createElement('div')
        settingsContainer.className = 'settings-status'
        settingsContainer.innerHTML = `
          <button class="settings-btn" title="Dev Settings">
            <svg width="20" height="20" viewBox="0 0 640 640" fill="currentColor">
              <path d="M259.1 73.5C262.1 58.7 275.2 48 290.4 48L350.2 48C365.4 48 378.5 58.7 381.5 73.5L396 143.5C410.1 149.5 423.3 157.2 435.3 166.3L503.1 143.8C517.5 139 533.3 145 540.9 158.2L570.8 210C578.4 223.2 575.7 239.8 564.3 249.9L511 297.3C511.9 304.7 512.3 312.3 512.3 320C512.3 327.7 511.8 335.3 511 342.7L564.4 390.2C575.8 400.3 578.4 417 570.9 430.1L541 481.9C533.4 495 517.6 501.1 503.2 496.3L435.4 473.8C423.3 482.9 410.1 490.5 396.1 496.6L381.7 566.5C378.6 581.4 365.5 592 350.4 592L290.6 592C275.4 592 262.3 581.3 259.3 566.5L244.9 496.6C230.8 490.6 217.7 482.9 205.6 473.8L137.5 496.3C123.1 501.1 107.3 495.1 99.7 481.9L69.8 430.1C62.2 416.9 64.9 400.3 76.3 390.2L129.7 342.7C128.8 335.3 128.4 327.7 128.4 320C128.4 312.3 128.9 304.7 129.7 297.3L76.3 249.8C64.9 239.7 62.3 223 69.8 209.9L99.7 158.1C107.3 144.9 123.1 138.9 137.5 143.7L205.3 166.2C217.4 157.1 230.6 149.5 244.6 143.4L259.1 73.5zM320.3 400C364.5 399.8 400.2 363.9 400 319.7C399.8 275.5 363.9 239.8 319.7 240C275.5 240.2 239.8 276.1 240 320.3C240.2 364.5 276.1 400.2 320.3 400z"/>
            </svg>
          </button>
        `
        
        this.settingsButton = settingsContainer.querySelector('.settings-btn') as HTMLElement
        
        // Add to the status-right container
        statusRight.appendChild(settingsContainer)
        
        // Create the panel after the button is ready
        this.createSettingsPanel()
        
        // Setup interactions after both button and panel exist
        this.setupPanelInteractions(settingsContainer)
        
      } else {
        setTimeout(checkForStatusBar, 100)
      }
    }
    
    checkForStatusBar()
  }

  private createSettingsPanel() {
    this.settingsPanel = document.createElement('div')
    this.settingsPanel.className = 'settings-panel'
    this.settingsPanel.innerHTML = `
      <div class="status-item">
        <label class="setting-label">
          <input type="checkbox" class="setting-checkbox" data-setting="canvasGlow" ${this.settings.canvasGlow ? 'checked' : ''} ${(this.isSafari || this.isMobileDevice) ? 'disabled' : ''}>
          <span class="setting-text">Canvas Glow${(this.isSafari || this.isMobileDevice) ? ' (disabled)' : ''}</span>
        </label>
      </div>
      <div class="status-item">
        <label class="setting-label">
          <input type="checkbox" class="setting-checkbox" data-setting="backgroundPattern" ${this.settings.backgroundPattern ? 'checked' : ''}>
          <span class="setting-text">Background Pattern</span>
        </label>
      </div>
    `

    // Prevent panel from closing when clicking inside it
    this.settingsPanel.addEventListener('click', (e) => {
      e.stopPropagation()
    })

    // Add event listeners
    const checkboxes = this.settingsPanel.querySelectorAll('.setting-checkbox')
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        e.stopPropagation() // Prevent closing panel
        const target = e.target as HTMLInputElement
        const setting = target.dataset.setting as keyof DevSettings
        if (setting) {
          this.settings[setting] = target.checked
          this.saveSettings()
          this.applySettings()
        }
      })
    })

    // Append to the settings container (it will be positioned by CSS)
    const settingsContainer = document.querySelector('.settings-status')
    if (settingsContainer) {
      settingsContainer.appendChild(this.settingsPanel)
    }
  }

  private setupPanelInteractions(settingsContainer: HTMLElement) {
    if (!this.settingsPanel) return

    // Toggle panel on click
    const togglePanel = () => {
      if (this.settingsPanel?.classList.contains('show')) {
        this.settingsPanel.classList.remove('show')
        this.isOpen = false
      } else {
        // Close the status panel if it's open
        const statusPanel = document.querySelector('#status-panel')
        if (statusPanel?.classList.contains('show')) {
          statusPanel.classList.remove('show')
        }
        
        this.settingsPanel?.classList.add('show')
        this.isOpen = true
      }
    }

    // Click to toggle
    settingsContainer.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      togglePanel()
    })

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen && 
          !this.settingsPanel?.contains(e.target as Node) && 
          !settingsContainer.contains(e.target as Node)) {
        this.settingsPanel?.classList.remove('show')
        this.isOpen = false
      }
    })
  }

  private applySettings() {
    // Apply canvas glow setting (but not on mobile/Safari)
    if (window.underglow && !this.isSafari && !this.isMobileDevice) {
      if (this.settings.canvasGlow) {
        window.underglow.enabled = true
        window.underglow.start()
      } else {
        window.underglow.enabled = false
        window.underglow.stop()
      }
    }

    // Apply background pattern setting - only control the ::before texture image
    // Keep the gradient and noise on .game-container always visible
    if (this.settings.backgroundPattern) {
      document.body.classList.add('show-background-pattern')
    } else {
      document.body.classList.remove('show-background-pattern')
    }
  }

  // Public API
  getSetting(key: keyof DevSettings): boolean {
    return this.settings[key]
  }

  setSetting(key: keyof DevSettings, value: boolean) {
    this.settings[key] = value
    this.saveSettings()
    this.applySettings()
    
    // Update checkbox if panel exists
    const checkbox = this.settingsPanel?.querySelector(`[data-setting="${key}"]`) as HTMLInputElement
    if (checkbox) {
      checkbox.checked = value
    }
  }
}

// Global access for underglow integration
declare global {
  interface Window {
    underglow?: any;
    devSettings?: DevSettingsManager;
  }
}

// Export and initialize
export const devSettings = new DevSettingsManager()
window.devSettings = devSettings