import React, { useRef } from 'react'
import { useDevSettings, useUIState, useOutsideClick } from '../../hooks'
import {
  SettingsPanelWrapper,
  SettingsPanelHeader,
  PanelCloseButton,
  StatusItem,
  StatusLabel,
  DeviceInfo,
  DeviceInfoItem,
  DeviceInfoLabel,
  DeviceInfoValue,
  SettingRow,
  SettingInfo,
  SettingName,
  SettingDescription,
  SettingRestriction,
  SettingControl,
  ToggleSwitch,
  ToggleSlider,
  CompatibilityNotes,
  CompatibilityNote,
  SettingsActions,
  SettingsResetButton
} from './SettingsPanel.styled'

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

  // Close panel when clicking outside or pressing escape
  useOutsideClick(panelRef, toggleSettingsPanel, showSettingsPanel)

  const handleToggleSetting = (key: keyof typeof settings) => {
    updateSetting(key, !settings[key])
  }

  if (!showSettingsPanel) {
    return null
  }

  return (
    <SettingsPanelWrapper ref={panelRef} $show={showSettingsPanel}>
      {/* Header */}
      <SettingsPanelHeader>
        <h3>Dashboard Settings</h3>
        <PanelCloseButton 
          onClick={toggleSettingsPanel}
          title="Close settings panel"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
          </svg>
        </PanelCloseButton>
      </SettingsPanelHeader>

      {/* Device Information */}
      <StatusItem>
        <StatusLabel>Device Information</StatusLabel>
        <DeviceInfo>
          <DeviceInfoItem>
            <DeviceInfoLabel>Browser:</DeviceInfoLabel>
            <DeviceInfoValue>
              {capabilities.isSafari ? 'Safari' : 'Chrome/Firefox/Edge'}
            </DeviceInfoValue>
          </DeviceInfoItem>
          <DeviceInfoItem>
            <DeviceInfoLabel>Device Type:</DeviceInfoLabel>
            <DeviceInfoValue>
              {capabilities.isMobileDevice ? 'Mobile/Touch' : 'Desktop'}
            </DeviceInfoValue>
          </DeviceInfoItem>
          <DeviceInfoItem>
            <DeviceInfoLabel>Underglow Support:</DeviceInfoLabel>
            <DeviceInfoValue className={capabilities.supportsUnderglow ? 'supported' : 'unsupported'}>
              {capabilities.supportsUnderglow ? 'Yes' : 'No'}
            </DeviceInfoValue>
          </DeviceInfoItem>
        </DeviceInfo>
      </StatusItem>

      {/* Visual Effects Settings */}
      <StatusItem>
        <StatusLabel>Visual Effects</StatusLabel>
        
        {/* Canvas Glow Setting */}
        <SettingRow>
          <SettingInfo>
            <SettingName>Canvas Glow</SettingName>
            <SettingDescription>
              Dynamic glow effect around game frame
              {!capabilities.supportsUnderglow && (
                <SettingRestriction>
                  {capabilities.isSafari ? ' (Disabled on Safari)' : ' (Disabled on mobile)'}
                </SettingRestriction>
              )}
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={settings.canvasGlow}
                onChange={() => handleToggleSetting('canvasGlow')}
                disabled={!isSupported.canvasGlow}
              />
              <ToggleSlider className="toggle-slider" />
            </ToggleSwitch>
          </SettingControl>
        </SettingRow>

        {/* Background Pattern Setting */}
        <SettingRow>
          <SettingInfo>
            <SettingName>Background Pattern</SettingName>
            <SettingDescription>
              Show subtle grid pattern behind game frame
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={settings.backgroundPattern}
                onChange={() => handleToggleSetting('backgroundPattern')}
              />
              <ToggleSlider className="toggle-slider" />
            </ToggleSwitch>
          </SettingControl>
        </SettingRow>

        {/* Full Size Setting */}
        <SettingRow>
          <SettingInfo>
            <SettingName>Full Size Mode</SettingName>
            <SettingDescription>
              Scale game frame to fill available space
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={settings.fullSize}
                onChange={() => handleToggleSetting('fullSize')}
              />
              <ToggleSlider className="toggle-slider" />
            </ToggleSwitch>
          </SettingControl>
        </SettingRow>
      </StatusItem>

      {/* Performance Settings */}
      <StatusItem>
        <StatusLabel>Performance Monitoring</StatusLabel>
        
        <SettingRow>
          <SettingInfo>
            <SettingName>Show Performance Panel</SettingName>
            <SettingDescription>
              Display detailed performance metrics panel
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={settings.showPerformancePanel}
                onChange={() => handleToggleSetting('showPerformancePanel')}
              />
              <ToggleSlider className="toggle-slider" />
            </ToggleSwitch>
          </SettingControl>
        </SettingRow>
      </StatusItem>

      {/* Browser Compatibility Notes */}
      {(capabilities.isSafari || capabilities.isMobileDevice) && (
        <StatusItem>
          <StatusLabel>Compatibility Notes</StatusLabel>
          <CompatibilityNotes>
            {capabilities.isSafari && (
              <CompatibilityNote className="safari">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                </svg>
                <div>
                  <strong>Safari Browser Detected</strong>
                  <div>Canvas glow effects are disabled for optimal performance</div>
                </div>
              </CompatibilityNote>
            )}
            
            {capabilities.isMobileDevice && (
              <CompatibilityNote className="mobile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21C5,22.11 5.89,23 7,23H17C18.11,23 19,22.11 19,21V3C19,1.89 18.11,1 17,1Z"/>
                </svg>
                <div>
                  <strong>Touch Device Detected</strong>
                  <div>Canvas glow effects are disabled to preserve battery life</div>
                </div>
              </CompatibilityNote>
            )}
          </CompatibilityNotes>
        </StatusItem>
      )}

      {/* Actions */}
      <SettingsActions>
        <SettingsResetButton 
          onClick={resetToDefaults}
          title="Reset all settings to defaults"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,4C14.1,4 16.1,4.8 17.6,6.3C20.7,9.4 20.7,14.5 17.6,17.6C15.8,19.5 13.3,20.2 10.9,19.9L11.4,17.9C13.1,18.1 14.9,17.5 16.2,16.2C18.5,13.9 18.5,10.1 16.2,7.7C15.1,6.6 13.5,6 12,6V10.5L7,5.5L12,0.5V4M6.3,17.6C3.7,15 3.3,11 5.1,7.9L6.6,9.4C5.5,11.6 5.9,14.4 7.8,16.2C8.3,16.7 8.9,17.1 9.6,17.4L9,19.4C8,19 7.1,18.4 6.3,17.6Z"/>
          </svg>
          Reset to Defaults
        </SettingsResetButton>
      </SettingsActions>
    </SettingsPanelWrapper>
  )
}