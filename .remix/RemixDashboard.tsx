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
import { ThemeProvider } from './styles/ThemeProvider'
import { RemixDevContainer, MainContentWrapper, BuildPanelSpacer } from './components/Layout/Container.styled'

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
  
  // CSS is now handled via styled-components, no external CSS loading needed

  return (
    <ErrorBoundaryWrapper componentName="Remix Dashboard">
      <RemixDevContainer $buildPanelOpen={isBuildPanelOpen}>
        <MainContentWrapper>
          <GameContainerErrorBoundary>
            <GameContainer />
          </GameContainerErrorBoundary>
          <BuildPanelSpacer $isOpen={isBuildPanelOpen} />
        </MainContentWrapper>
        
        <ErrorBoundaryWrapper componentName="Status Bar">
          <StatusBar />
        </ErrorBoundaryWrapper>
        
        <BuildPanelErrorBoundary>
          <BuildPanel />
        </BuildPanelErrorBoundary>
        
        <PerformanceErrorBoundary>
          <PerformancePanel />
        </PerformanceErrorBoundary>
      </RemixDevContainer>
    </ErrorBoundaryWrapper>
  )
}

export const RemixDashboard: React.FC<RemixDashboardProps> = () => {
  return (
    <ThemeProvider>
      <DashboardProvider>
        <DashboardContent />
      </DashboardProvider>
    </ThemeProvider>
  )
}