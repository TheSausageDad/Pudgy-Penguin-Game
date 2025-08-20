import React, { useEffect, useRef } from 'react'
import { useDevSettings, useUIState } from '../../hooks'

export const SettingsPanel: React.FC = () => {
  const { 
    settings, 
    updateSetting, 
    resetToDefaults,
    capabilities,
    isSupported
  } = useDevSettings()
  
  const { showSettingsPanel, toggleSettingsPanel } = useUIState()
  const panelRef = useRef<HTMLDivElement>(null)

  // Close panel when clicking outside
  useEffect(() => {
    if (!showSettingsPanel) return

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        toggleSettingsPanel()
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        toggleSettingsPanel()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [showSettingsPanel, toggleSettingsPanel])

  const handleToggleSetting = (key: keyof typeof settings) => {
    updateSetting(key, !settings[key])
  }

  if (!showSettingsPanel) {
    return null
  }

  return (
    <div ref={panelRef} className="settings-panel show">
      {/* Header */}
      <div className="settings-panel-header">
        <h3>Dashboard Settings</h3>
        <button 
          className="panel-close-btn" 
          onClick={toggleSettingsPanel}
          title="Close settings panel"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
          </svg>
        </button>
      </div>

      {/* Device Information */}
      <div className="status-item">
        <div className="status-label">Device Information</div>
        <div className="device-info">
          <div className="device-info-item">
            <span className="device-info-label">Browser:</span>
            <span className="device-info-value">
              {capabilities.isSafari ? 'Safari' : 'Chrome/Firefox/Edge'}
            </span>
          </div>
          <div className="device-info-item">
            <span className="device-info-label">Device Type:</span>
            <span className="device-info-value">
              {capabilities.isMobileDevice ? 'Mobile/Touch' : 'Desktop'}
            </span>
          </div>
          <div className="device-info-item">
            <span className="device-info-label">Underglow Support:</span>
            <span className={`device-info-value ${capabilities.supportsUnderglow ? 'supported' : 'unsupported'}`}>
              {capabilities.supportsUnderglow ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Effects Settings */}
      <div className="status-item">
        <div className="status-label">Visual Effects</div>
        
        {/* Canvas Glow Setting */}
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-name">Canvas Glow</div>
            <div className="setting-description">
              Dynamic glow effect around game frame
              {!capabilities.supportsUnderglow && (
                <span className="setting-restriction">
                  {capabilities.isSafari ? ' (Disabled on Safari)' : ' (Disabled on mobile)'}
                </span>
              )}
            </div>
          </div>
          <div className="setting-control">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.canvasGlow}
                onChange={() => handleToggleSetting('canvasGlow')}
                disabled={!isSupported.canvasGlow}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Background Pattern Setting */}
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-name">Background Pattern</div>
            <div className="setting-description">
              Show subtle grid pattern behind game frame
            </div>
          </div>
          <div className="setting-control">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.backgroundPattern}
                onChange={() => handleToggleSetting('backgroundPattern')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Full Size Setting */}
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-name">Full Size Mode</div>
            <div className="setting-description">
              Scale game frame to fill available space
            </div>
          </div>
          <div className="setting-control">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.fullSize}
                onChange={() => handleToggleSetting('fullSize')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Performance Settings */}
      <div className="status-item">
        <div className="status-label">Performance Monitoring</div>
        
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-name">Show Performance Panel</div>
            <div className="setting-description">
              Display detailed performance metrics panel
            </div>
          </div>
          <div className="setting-control">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.showPerformancePanel}
                onChange={() => handleToggleSetting('showPerformancePanel')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Browser Compatibility Notes */}
      {(capabilities.isSafari || capabilities.isMobileDevice) && (
        <div className="status-item">
          <div className="status-label">Compatibility Notes</div>
          <div className="compatibility-notes">
            {capabilities.isSafari && (
              <div className="compatibility-note safari">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                </svg>
                <div>
                  <strong>Safari Browser Detected</strong>
                  <div>Canvas glow effects are disabled for optimal performance</div>
                </div>
              </div>
            )}
            
            {capabilities.isMobileDevice && (
              <div className="compatibility-note mobile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21C5,22.11 5.89,23 7,23H17C18.11,23 19,22.11 19,21V3C19,1.89 18.11,1 17,1Z"/>
                </svg>
                <div>
                  <strong>Touch Device Detected</strong>
                  <div>Canvas glow effects are disabled to preserve battery life</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="settings-actions">
        <button 
          className="settings-reset-btn"
          onClick={resetToDefaults}
          title="Reset all settings to defaults"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,4C14.1,4 16.1,4.8 17.6,6.3C20.7,9.4 20.7,14.5 17.6,17.6C15.8,19.5 13.3,20.2 10.9,19.9L11.4,17.9C13.1,18.1 14.9,17.5 16.2,16.2C18.5,13.9 18.5,10.1 16.2,7.7C15.1,6.6 13.5,6 12,6V10.5L7,5.5L12,0.5V4M6.3,17.6C3.7,15 3.3,11 5.1,7.9L6.6,9.4C5.5,11.6 5.9,14.4 7.8,16.2C8.3,16.7 8.9,17.1 9.6,17.4L9,19.4C8,19 7.1,18.4 6.3,17.6Z"/>
          </svg>
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}