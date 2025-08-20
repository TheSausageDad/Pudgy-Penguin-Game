import React, { useRef, useEffect } from 'react'
import { useUIState, useDevSettings } from '../../hooks'
import { detectDeviceCapabilities } from '../../utils'

export const StatusRight: React.FC = () => {
  const { toggleBuildPanel, isBuildPanelOpen } = useUIState()
  const { capabilities } = useDevSettings()

  return (
    <>
      {/* Mobile QR Button - only show on non-touch devices */}
      {!capabilities.isMobileDevice && (
        <MobileQrButton />
      )}

      {/* Settings Button */}
      <SettingsDropdown />

      {/* Build Toggle Button */}
      <button 
        className={`build-toggle-btn-clean ${isBuildPanelOpen ? 'active' : ''}`}
        onClick={() => {
          console.log('Build button clicked! Current state:', isBuildPanelOpen)
          toggleBuildPanel()
          console.log('Toggle function called')
        }}
        title={isBuildPanelOpen ? "Close build panel" : "Open build panel"}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M14.6 16.6l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4zm-5.2 0L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4z"/>
        </svg>
        <span>Build</span>
      </button>
    </>
  )
}

const MobileQrButton: React.FC = () => {
  const { toggleQrPanel, isQrPanelOpen } = useUIState()
  const [qrUrl, setQrUrl] = React.useState<string>('')
  const [qrImageSrc, setQrImageSrc] = React.useState<string>('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate QR code on startup
  React.useEffect(() => {
    const generateQrCode = async () => {
      try {
        const currentUrl = window.location.href;
        const url = new URL(currentUrl);
        
        let finalUrl = currentUrl;
        
        // If using localhost, try to get the actual IP
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
          try {
            const response = await fetch('/.remix/api/local-ip');
            if (response.ok) {
              let ipUrl = await response.text();
              ipUrl = ipUrl.trim();
              
              // Validate we got an actual IP, not localhost
              if (ipUrl && !ipUrl.includes('localhost') && !ipUrl.includes('127.0.0.1')) {
                // Replace the port with current port if needed
                const ipUrlObj = new URL(ipUrl);
                ipUrlObj.port = url.port || '3000';
                finalUrl = ipUrlObj.toString();
                console.log('QR code using network IP:', finalUrl);
              } else {
                console.warn('Could not resolve network IP, QR code will use localhost');
                finalUrl = ''; // Don't show QR for localhost
              }
            } else {
              console.warn('Local IP API not available');
              finalUrl = ''; // Don't show QR for localhost
            }
          } catch (error) {
            console.warn('Could not resolve network IP:', error);
            finalUrl = ''; // Don't show QR for localhost
          }
        }
        
        setQrUrl(finalUrl)
        
        // Pre-generate QR code image if we have a valid URL
        if (finalUrl) {
          const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(finalUrl)}&bgcolor=ffffff&color=000000&margin=0`
          
          // Convert to data URL to eliminate flash
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas')
              canvas.width = 160
              canvas.height = 160
              const ctx = canvas.getContext('2d')
              if (ctx) {
                ctx.drawImage(img, 0, 0, 160, 160)
                const dataUrl = canvas.toDataURL('image/png')
                setQrImageSrc(dataUrl)
              }
            } catch (error) {
              console.warn('Could not convert QR to data URL, using original:', error)
              setQrImageSrc(qrImageUrl)
            }
          }
          img.onerror = () => {
            console.warn('QR image failed to load')
            setQrImageSrc('')
          }
          img.src = qrImageUrl
        }
      } catch (error) {
        console.error('Failed to generate QR code:', error)
        setQrUrl('')
        setQrImageSrc('')
      }
    }
    
    generateQrCode()
  }, [])

  // Note: Click outside and escape handling is now managed by useUIState hook globally

  return (
    <div ref={containerRef} className="mobile-qr-status" style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        className="settings-btn" 
        onClick={(e) => {
          e.stopPropagation()
          toggleQrPanel()
        }}
        title="Show QR code for mobile testing"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21C5,22.11 5.89,23 7,23H17C18.11,23 19,22.11 19,21V3C19,1.89 18.11,1 17,1Z"/>
        </svg>
      </button>
      
      {isQrPanelOpen && (
        <div className="settings-panel show" style={{ maxWidth: '200px' }}>
          <div className="status-item">
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                Scan to test on mobile
              </div>
              {qrImageSrc ? (
                <>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', display: 'inline-block' }}>
                    <img 
                      src={qrImageSrc}
                      alt={`QR Code for ${qrUrl}`}
                      style={{ display: 'block', width: '160px', height: '160px' }}
                      onError={(e) => {
                        e.currentTarget.parentElement!.innerHTML = '<div style="padding: 20px; color: #666; text-align: center;">QR code unavailable</div>'
                      }}
                    />
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
                    Make sure your phone and computer are on the same Wi-Fi network
                  </div>
                </>
              ) : (
                <div style={{ padding: '20px', color: '#666', textAlign: 'center', fontSize: '12px' }}>
                  <div style={{ marginBottom: '8px' }}>⚠️ No external IP found</div>
                  <div>Connect to Wi-Fi to test on mobile</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const SettingsDropdown: React.FC = () => {
  const { toggleSettingsPanel, isSettingsPanelOpen } = useUIState()
  const { settings, updateSetting, capabilities } = useDevSettings()
  const containerRef = useRef<HTMLDivElement>(null)
  
  console.log('SettingsDropdown render - isSettingsPanelOpen:', isSettingsPanelOpen)

  // Note: Click outside and escape handling is now managed by useUIState hook globally

  const handleSettingChange = (key: keyof typeof settings) => {
    const newValue = !settings[key]
    updateSetting(key, newValue)
  }

  return (
    <div ref={containerRef} className="settings-status">
      <button 
        className="settings-btn" 
        onClick={(e) => {
          e.stopPropagation()
          console.log('Settings button clicked! Current state:', isSettingsPanelOpen)
          toggleSettingsPanel()
          console.log('toggleSettingsPanel called')
        }}
        title="Dev Settings"
      >
        <svg width="20" height="20" viewBox="0 0 640 640" fill="currentColor">
          <path d="M259.1 73.5C262.1 58.7 275.2 48 290.4 48L350.2 48C365.4 48 378.5 58.7 381.5 73.5L396 143.5C410.1 149.5 423.3 157.2 435.3 166.3L503.1 143.8C517.5 139 533.3 145 540.9 158.2L570.8 210C578.4 223.2 575.7 239.8 564.3 249.9L511 297.3C511.9 304.7 512.3 312.3 512.3 320C512.3 327.7 511.8 335.3 511 342.7L564.4 390.2C575.8 400.3 578.4 417 570.9 430.1L541 481.9C533.4 495 517.6 501.1 503.2 496.3L435.4 473.8C423.3 482.9 410.1 490.5 396.1 496.6L381.7 566.5C378.6 581.4 365.5 592 350.4 592L290.6 592C275.4 592 262.3 581.3 259.3 566.5L244.9 496.6C230.8 490.6 217.7 482.9 205.6 473.8L137.5 496.3C123.1 501.1 107.3 495.1 99.7 481.9L69.8 430.1C62.2 416.9 64.9 400.3 76.3 390.2L129.7 342.7C128.8 335.3 128.4 327.7 128.4 320C128.4 312.3 128.9 304.7 129.7 297.3L76.3 249.8C64.9 239.7 62.3 223 69.8 209.9L99.7 158.1C107.3 144.9 123.1 138.9 137.5 143.7L205.3 166.2C217.4 157.1 230.6 149.5 244.6 143.4L259.1 73.5zM320.3 400C364.5 399.8 400.2 363.9 400 319.7C399.8 275.5 363.9 239.8 319.7 240C275.5 240.2 239.8 276.1 240 320.3C240.2 364.5 276.1 400.2 320.3 400z"/>
        </svg>
      </button>
      
      {isSettingsPanelOpen && (
        <div className="settings-panel show">
          {/* Canvas Glow - only show on supported devices */}
          {capabilities.supportsUnderglow && (
            <div className="status-item">
              <label className="setting-label">
                <input 
                  type="checkbox" 
                  className="setting-checkbox" 
                  checked={settings.canvasGlow}
                  onChange={() => handleSettingChange('canvasGlow')}
                />
                <span className="setting-text">Canvas Glow</span>
              </label>
            </div>
          )}
          
          {/* Background Pattern */}
          <div className="status-item">
            <label className="setting-label">
              <input 
                type="checkbox" 
                className="setting-checkbox" 
                checked={settings.backgroundPattern}
                onChange={() => handleSettingChange('backgroundPattern')}
              />
              <span className="setting-text">Background Pattern</span>
            </label>
          </div>
          
          {/* Canvas Scaling */}
          <div className="status-item">
            <label className="setting-label">
              <input 
                type="checkbox" 
                className="setting-checkbox" 
                checked={settings.fullSize}
                onChange={() => handleSettingChange('fullSize')}
              />
              <span className="setting-text">Canvas Scaling</span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}