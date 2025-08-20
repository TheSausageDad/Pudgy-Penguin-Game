import React, { useEffect } from 'react'
import { DashboardProvider, useDashboard } from './contexts'
import { GameContainer, StatusBar } from './components/Layout'
import { BuildPanel, PerformancePanel } from './components/Panels'
import { 
  ErrorBoundaryWrapper,
  GameContainerErrorBoundary,
  BuildPanelErrorBoundary,
  PerformanceErrorBoundary
} from './components/Common'
import { useUIState } from './hooks'

interface RemixDashboardProps {
  // Future props will go here
}

function DashboardContent() {
  const { isBuildPanelOpen } = useUIState()
  const { dispatch } = useDashboard()
  
  // Set up SDK event listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'remix_dev_flags') {
        dispatch({ type: 'SDK_UPDATE_FLAGS', payload: event.data.flags })
      }
      if (event.data?.type === 'remix_sdk_event') {
        dispatch({ type: 'SDK_ADD_EVENT', payload: event.data })
      }
    }
    
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [dispatch])
  
  // Load CSS on component mount
  useEffect(() => {
    const loadStyles = () => {
      // Check if styles are already loaded
      if (document.querySelector('link[href="/.remix/remix-dev-overlay.css"]')) {
        return
      }

      try {
        // Load CSS file dynamically
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.type = 'text/css'
        link.href = '/.remix/remix-dev-overlay.css'
        document.head.appendChild(link)
        
        // Add style overrides for tighter vertical spacing in performance panel
        const styleOverrides = document.createElement('style')
        styleOverrides.textContent = `
          .perf-section {
            margin-bottom: 8px !important;
            padding-bottom: 6px !important;
          }
        `
        document.head.appendChild(styleOverrides)
      } catch (error) {
        console.warn('Failed to load dashboard CSS:', error)
      }
    }

    loadStyles()
  }, [])

  return (
    <ErrorBoundaryWrapper componentName="Remix Dashboard">
      <div className={`remix-dev-container ${isBuildPanelOpen ? 'build-panel-open' : ''}`}>
        <div className="main-content-wrapper">
          <GameContainerErrorBoundary>
            <GameContainer />
          </GameContainerErrorBoundary>
          <div className="build-panel-spacer"></div>
        </div>
        
        <ErrorBoundaryWrapper componentName="Status Bar">
          <StatusBar />
        </ErrorBoundaryWrapper>
        
        <BuildPanelErrorBoundary>
          <BuildPanel />
        </BuildPanelErrorBoundary>
        
        <PerformanceErrorBoundary>
          <PerformancePanel />
        </PerformanceErrorBoundary>
      </div>
    </ErrorBoundaryWrapper>
  )
}

export const RemixDashboard: React.FC<RemixDashboardProps> = () => {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  )
}