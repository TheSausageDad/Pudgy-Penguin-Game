import React, { useState, useEffect, useRef } from 'react'
import { useBuildSystem, useUIState, useSDKIntegration, useSyntaxHighlighting, useCodeBlockResizing } from '../../hooks'
import {
  BuildPanelWrapper,
  BuildPanelContent,
  BuildControls,
  BuildButton,
  BuildButtonText,
  BuildSpinner,
  BuildButtonMessage,
  SDKWarning,
  WarningIcon,
  WarningContent,
  BuildSuccess,
  SuccessIcon,
  SuccessContent,
  BuildInfo,
  BuildOutput,
  BuildOutputHeader,
  BuildOutputTitle,
  BuildTimeAgo,
  BuildOutputActions,
  FileSize,
  BuildOutputCode,
  CopyButton,
  CodeDisplay
} from './BuildPanel.styled'

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
    <BuildPanelWrapper 
      ref={panelRef} 
      $isOpen={isBuildPanelOpen}
      role="region"
      aria-label="Build panel"
      aria-expanded={isBuildPanelOpen}
    >
      <BuildPanelContent>
        {/* Build Controls */}
        <BuildControls>
          {/* Build Game Button */}
          <BuildButton 
            id="build-game-btn"
            onClick={handleBuild}
            disabled={!canBuild}
            aria-label={isBuilding ? 'Building game' : 'Build game'}
            aria-busy={isBuilding}
            title={!canBuild ? 'Code unchanged since last build' : 'Build the current game code'}
          >
            <BuildButtonText>{isBuilding ? 'Building...' : 'Build Game'}</BuildButtonText>
            <BuildSpinner $visible={isBuilding} />
          </BuildButton>

          {/* Build Button Message */}
          {!canBuild && !isBuilding && (
            <BuildButtonMessage role="status" aria-live="polite">
              Code unchanged since last build
            </BuildButtonMessage>
          )}

          {/* SDK Integration Warning */}
          {!sdkStatus.isComplete && (
            <SDKWarning $isComplete={false} role="alert" aria-live="polite">
              <WarningIcon aria-hidden="true">⚠️</WarningIcon>
              <WarningContent $isComplete={false}>
                <strong>SDK Integration Incomplete</strong>
                <p>Missing SDK handlers: {sdkStatus.missingHandlers.join(', ')}</p>
              </WarningContent>
            </SDKWarning>
          )}

          {/* Build Success */}
          {buildState.status === 'success' && buildState.output && (
            <BuildSuccess role="status" aria-live="polite">
              <SuccessIcon aria-hidden="true">✅</SuccessIcon>
              <SuccessContent>
                <strong>Build Successful</strong>
                <p>Game code has been copied to your clipboard</p>
              </SuccessContent>
            </BuildSuccess>
          )}

          {/* Build Info - Only show when SDK integration is complete and has previous build */}
          {sdkStatus.isComplete && buildState.status !== 'success' && buildState.status !== 'building' && 
           buildState.lastBuildTime > 0 && buildState.fileSize > 0 && (
            <BuildInfo aria-label="Build information">
              Last build: {formatTimeAgo(buildState.lastBuildTime)} • {formatFileSize(buildState.fileSize)}
            </BuildInfo>
          )}
        </BuildControls>

        {/* Build Output - Generated Code */}
        {buildState.output && buildState.status === 'success' && (
          <BuildOutput id="build-output" role="region" aria-label="Generated code output">
            <BuildOutputHeader>
              <BuildOutputTitle>
                <h4>Generated Code</h4>
                <BuildTimeAgo>Built {formatTimeAgo(buildState.lastBuildTime)}</BuildTimeAgo>
              </BuildOutputTitle>
              <BuildOutputActions>
                <FileSize 
                  $copied={copied}
                  role="status"
                  aria-live="polite"
                >
                  {copied ? 'Code Copied!' : formatFileSize(buildState.fileSize)}
                </FileSize>
              </BuildOutputActions>
            </BuildOutputHeader>
            <BuildOutputCode ref={buildOutputCodeRef}>
              <CopyButton 
                $copied={copied}
                onClick={handleCopyOutput}
                aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
                title={copied ? 'Copied!' : 'Copy code'}
              >
                {copied ? (
                  // Checkmark icon when copied
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                ) : (
                  // Copy icon when not copied
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                  </svg>
                )}
              </CopyButton>
              <CodeDisplay 
                ref={codeDisplayRef}
                className="language-html"
                aria-label="Generated HTML code"
              >
                {buildState.output}
              </CodeDisplay>
            </BuildOutputCode>
          </BuildOutput>
        )}
      </BuildPanelContent>
    </BuildPanelWrapper>
  )
}