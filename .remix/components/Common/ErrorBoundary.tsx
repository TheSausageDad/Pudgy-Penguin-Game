import React, { Component, ReactNode } from 'react'
import {
  ErrorBoundaryContainer,
  ErrorBoundaryContent,
  ErrorBoundaryIcon,
  ErrorBoundaryTitle,
  ErrorBoundaryMessage,
  ErrorBoundaryDetails,
  ErrorBoundaryError,
  ErrorName,
  ErrorMessage,
  ErrorStack,
  ErrorBoundaryActions,
  ErrorBoundaryRetry,
  ErrorBoundaryReload,
  PerformanceError,
  PerformanceErrorContent,
  PerformanceErrorRetry,
  BuildPanelError,
  BuildPanelErrorContent,
  BuildPanelErrorRetry,
  SettingsPanelError,
  SettingsPanelErrorContent,
  SettingsPanelErrorRetry
} from './ErrorBoundary.styled'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  componentName?: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })
    
    // Log error details
    console.error(`ErrorBoundary caught an error in ${this.props.componentName || 'component'}:`, error)
    console.error('Error details:', errorInfo)
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <ErrorBoundaryContainer>
          <ErrorBoundaryContent>
            <ErrorBoundaryIcon>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
              </svg>
            </ErrorBoundaryIcon>
            
            <ErrorBoundaryTitle>
              Something went wrong in the {this.props.componentName || 'dashboard'}
            </ErrorBoundaryTitle>
            
            <ErrorBoundaryMessage>
              An unexpected error occurred while rendering this component. 
              This might be a temporary issue.
            </ErrorBoundaryMessage>

            {this.state.error && (
              <ErrorBoundaryDetails>
                <summary>Error Details</summary>
                <ErrorBoundaryError>
                  <ErrorName>{this.state.error.name}</ErrorName>
                  <ErrorMessage>{this.state.error.message}</ErrorMessage>
                  {this.state.error.stack && (
                    <ErrorStack>{this.state.error.stack}</ErrorStack>
                  )}
                </ErrorBoundaryError>
              </ErrorBoundaryDetails>
            )}
            
            <ErrorBoundaryActions>
              <ErrorBoundaryRetry onClick={this.handleRetry}>
                Try Again
              </ErrorBoundaryRetry>
              <ErrorBoundaryReload onClick={this.handleReload}>
                Reload Dashboard
              </ErrorBoundaryReload>
            </ErrorBoundaryActions>
          </ErrorBoundaryContent>
        </ErrorBoundaryContainer>
      )
    }

    return this.props.children
  }
}

// Wrapper component for functional component error handling
interface ErrorBoundaryWrapperProps {
  children: ReactNode
  componentName?: string
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  fallback?: (error: Error, retry: () => void) => ReactNode
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({ 
  children, 
  componentName, 
  onError,
  fallback 
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Add additional dashboard-specific error handling
    if (onError) {
      onError(error, errorInfo)
    }
    
    // Could add error reporting service here
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }

  const customFallback = fallback ? (
    <ErrorBoundary componentName={componentName} onError={handleError}>
      {children}
    </ErrorBoundary>
  ) : undefined

  return (
    <ErrorBoundary 
      componentName={componentName}
      onError={handleError}
      fallback={customFallback}
    >
      {children}
    </ErrorBoundary>
  )
}

// Specialized error boundaries for different dashboard components
export const GameContainerErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundaryWrapper componentName="Game Container">
    {children}
  </ErrorBoundaryWrapper>
)

export const PerformanceErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundaryWrapper 
    componentName="Performance Monitor"
    fallback={(error, retry) => (
      <PerformanceError>
        <PerformanceErrorContent>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
          </svg>
          <div>
            <strong>Performance monitoring unavailable</strong>
            <div>An error occurred while monitoring performance data.</div>
          </div>
          <PerformanceErrorRetry onClick={retry}>
            Retry
          </PerformanceErrorRetry>
        </PerformanceErrorContent>
      </PerformanceError>
    )}
  >
    {children}
  </ErrorBoundaryWrapper>
)

export const BuildPanelErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundaryWrapper 
    componentName="Build Panel"
    fallback={(error, retry) => (
      <BuildPanelError>
        <BuildPanelErrorContent>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
          </svg>
          <div>
            <strong>Build panel unavailable</strong>
            <div>An error occurred while loading the build panel.</div>
          </div>
          <BuildPanelErrorRetry onClick={retry}>
            Retry
          </BuildPanelErrorRetry>
        </BuildPanelErrorContent>
      </BuildPanelError>
    )}
  >
    {children}
  </ErrorBoundaryWrapper>
)

export const SettingsPanelErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundaryWrapper 
    componentName="Settings Panel"
    fallback={(error, retry) => (
      <SettingsPanelError>
        <SettingsPanelErrorContent>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
          </svg>
          <div>
            <strong>Settings unavailable</strong>
            <div>An error occurred while loading settings.</div>
          </div>
          <SettingsPanelErrorRetry onClick={retry}>
            Retry
          </SettingsPanelErrorRetry>
        </SettingsPanelErrorContent>
      </SettingsPanelError>
    )}
  >
    {children}
  </ErrorBoundaryWrapper>
)