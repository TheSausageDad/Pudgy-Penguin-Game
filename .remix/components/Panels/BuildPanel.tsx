import React, { useState, useEffect, useRef } from 'react'
import { useBuildSystem, useUIState, useSDKIntegration, useSyntaxHighlighting, useCodeBlockResizing } from '../../hooks'

export const BuildPanel: React.FC = () => {
  const { 
    buildState, 
    startBuild, 
    copyToClipboard, 
    formatFileSize, 
    formatTimeAgo,
    isBuilding,
    canBuild
  } = useBuildSystem()
  
  const { isBuildPanelOpen } = useUIState()
  const { sdkStatus } = useSDKIntegration()
  const { highlightHTML } = useSyntaxHighlighting()
  const [copied, setCopied] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const codeDisplayRef = useRef<HTMLPreElement>(null)
  const buildOutputCodeRef = useRef<HTMLDivElement>(null)
  
  // Setup sophisticated code block resizing like the reference version
  const isOutputVisible = buildState.output && buildState.status === 'success'
  useCodeBlockResizing(panelRef, buildOutputCodeRef, !!isOutputVisible)

  // Build panel is controlled only by the build button - no outside click or escape key handling

  // Apply syntax highlighting when build output changes OR when panel becomes visible
  useEffect(() => {
    if (buildState.output && codeDisplayRef.current && buildState.status === 'success' && isBuildPanelOpen) {
      // Small delay to ensure DOM is ready after panel animation
      const timeoutId = setTimeout(() => {
        if (codeDisplayRef.current) {
          highlightHTML(codeDisplayRef.current, buildState.output)
        }
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
  }, [buildState.output, buildState.status, highlightHTML, isBuildPanelOpen])

  const handleBuild = async () => {
    if (!canBuild) return
    await startBuild()
  }

  const handleCopyOutput = async () => {
    if (!buildState.output) return
    
    try {
      await copyToClipboard(buildState.output)
      setCopied(true)
      
      // Restore after 1.5 seconds (like reference version)
      setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  return (
    <div ref={panelRef} className={`build-panel ${isBuildPanelOpen ? 'show' : ''}`}>
      <div className="build-panel-content">
        {/* Build Controls */}
        <div className="build-controls">
          {/* Build Game Button */}
          <button 
            id="build-game-btn"
            className="build-btn"
            onClick={handleBuild}
            disabled={!canBuild}
            title={!canBuild ? 'Code unchanged since last build' : 'Build the current game code'}
          >
            <span className="build-btn-text">{isBuilding ? 'Building...' : 'Build Game'}</span>
            {isBuilding && <div className="build-spinner" style={{ display: 'block' }} />}
          </button>

          {/* Build Button Message */}
          {!canBuild && !isBuilding && (
            <div className="build-btn-message">
              Code unchanged since last build
            </div>
          )}

          {/* SDK Integration Warning */}
          {!sdkStatus.isComplete && (
            <div className="sdk-warning incomplete" style={{ display: 'flex' }}>
              <div className="warning-icon">⚠️</div>
              <div className="warning-content">
                <strong>SDK Integration Incomplete</strong>
                <p>Missing SDK handlers: {sdkStatus.missingHandlers.join(', ')}</p>
              </div>
            </div>
          )}

          {/* Build Success */}
          {buildState.status === 'success' && buildState.output && (
            <div className="build-success" style={{ display: 'flex' }}>
              <div className="success-icon">✅</div>
              <div className="success-content">
                <strong>Build Successful</strong>
                <p>Game code has been copied to your clipboard</p>
              </div>
            </div>
          )}

          {/* Build Info - Only show when SDK integration is complete and has previous build */}
          {sdkStatus.isComplete && buildState.status !== 'success' && buildState.status !== 'building' && 
           buildState.lastBuildTime > 0 && buildState.fileSize > 0 && (
            <div className="build-info">
              Last build: {formatTimeAgo(buildState.lastBuildTime)} • {formatFileSize(buildState.fileSize)}
            </div>
          )}
        </div>

        {/* Build Output - Generated Code */}
        {buildState.output && buildState.status === 'success' && (
          <div id="build-output" className="build-output" style={{ display: 'block' }}>
            <div className="build-output-header">
              <div className="build-output-title">
                <h4>Generated Code</h4>
                <span className="build-time-ago">Built {formatTimeAgo(buildState.lastBuildTime)}</span>
              </div>
              <div className="build-output-actions">
                <span 
                  className="file-size"
                  style={{ 
                    color: copied ? '#22c55e' : undefined 
                  }}
                >
                  {copied ? 'Code Copied!' : formatFileSize(buildState.fileSize)}
                </span>
              </div>
            </div>
            <div className="build-output-code" ref={buildOutputCodeRef}>
              <button 
                className="copy-btn-float"
                onClick={handleCopyOutput}
                title={copied ? 'Copied!' : 'Copy code'}
                style={{
                  background: copied ? '#22c55e' : undefined
                }}
              >
                {copied ? (
                  // Checkmark icon when copied
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                ) : (
                  // Copy icon when not copied
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                  </svg>
                )}
              </button>
              <pre 
                ref={codeDisplayRef}
                className="code-display language-html"
              >
                {buildState.output}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}