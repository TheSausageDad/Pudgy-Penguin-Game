import React, { Component, ReactNode } from 'react'

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
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
              </svg>
            </div>
            
            <h3 className="error-boundary-title">
              Something went wrong in the {this.props.componentName || 'dashboard'}
            </h3>
            
            <p className="error-boundary-message">
              An unexpected error occurred while rendering this component. 
              This might be a temporary issue.
            </p>

            {this.state.error && (
              <details className="error-boundary-details">
                <summary>Error Details</summary>
                <div className="error-boundary-error">
                  <div className="error-name">{this.state.error.name}</div>
                  <div className="error-message">{this.state.error.message}</div>
                  {this.state.error.stack && (
                    <pre className="error-stack">{this.state.error.stack}</pre>
                  )}
                </div>
              </details>
            )}
            
            <div className="error-boundary-actions">
              <button 
                className="error-boundary-retry" 
                onClick={this.handleRetry}
              >
                Try Again
              </button>
              <button 
                className="error-boundary-reload" 
                onClick={this.handleReload}
              >
                Reload Dashboard
              </button>
            </div>
          </div>
        </div>
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
      <div className="performance-error">
        <div className="performance-error-content">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
          </svg>
          <div>
            <strong>Performance monitoring unavailable</strong>
            <div>An error occurred while monitoring performance data.</div>
          </div>
          <button onClick={retry} className="performance-error-retry">
            Retry
          </button>
        </div>
      </div>
    )}
  >
    {children}
  </ErrorBoundaryWrapper>
)

export const BuildPanelErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundaryWrapper 
    componentName="Build Panel"
    fallback={(error, retry) => (
      <div className="build-panel-error">
        <div className="build-panel-error-content">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
          </svg>
          <div>
            <strong>Build panel unavailable</strong>
            <div>An error occurred while loading the build panel.</div>
          </div>
          <button onClick={retry} className="build-panel-error-retry">
            Retry
          </button>
        </div>
      </div>
    )}
  >
    {children}
  </ErrorBoundaryWrapper>
)

export const SettingsPanelErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundaryWrapper 
    componentName="Settings Panel"
    fallback={(error, retry) => (
      <div className="settings-panel-error">
        <div className="settings-panel-error-content">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
          </svg>
          <div>
            <strong>Settings unavailable</strong>
            <div>An error occurred while loading settings.</div>
          </div>
          <button onClick={retry} className="settings-panel-error-retry">
            Retry
          </button>
        </div>
      </div>
    )}
  >
    {children}
  </ErrorBoundaryWrapper>
)