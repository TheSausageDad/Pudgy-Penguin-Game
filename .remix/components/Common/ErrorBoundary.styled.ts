import styled from 'styled-components'

export const ErrorBoundaryContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 24px;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  margin: 16px;
`

export const ErrorBoundaryContent = styled.div`
  text-align: center;
  max-width: 500px;
`

export const ErrorBoundaryIcon = styled.div`
  color: #ef4444;
  margin-bottom: 16px;
  
  svg {
    width: 48px;
    height: 48px;
  }
`

export const ErrorBoundaryTitle = styled.h3`
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
`

export const ErrorBoundaryMessage = styled.p`
  color: #9ca3af;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 20px 0;
`

export const ErrorBoundaryDetails = styled.details`
  margin: 20px 0;
  text-align: left;
  
  summary {
    cursor: pointer;
    color: #6b7280;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 12px;
    user-select: none;
    
    &:hover {
      color: #9ca3af;
    }
  }
`

export const ErrorBoundaryError = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 12px;
  margin-top: 8px;
`

export const ErrorName = styled.div`
  color: #ef4444;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
`

export const ErrorMessage = styled.div`
  color: #d1d5db;
  font-size: 13px;
  margin-bottom: 8px;
`

export const ErrorStack = styled.pre`
  color: #9ca3af;
  font-size: 11px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
  overflow-x: auto;
  margin: 8px 0 0 0;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
`

export const ErrorBoundaryActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
`

export const ErrorBoundaryButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
`

export const ErrorBoundaryRetry = styled(ErrorBoundaryButton)`
  background: #22c55e;
  color: #000;
  
  &:hover {
    background: #16a34a;
  }
  
  &:active {
    background: #15803d;
  }
`

export const ErrorBoundaryReload = styled(ErrorBoundaryButton)`
  background: rgba(255, 255, 255, 0.1);
  color: #d1d5db;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.05);
  }
`

// Specialized error styles
export const PerformanceError = styled.div`
  padding: 12px;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 6px;
`

export const PerformanceErrorContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    width: 24px;
    height: 24px;
    color: #ef4444;
    flex-shrink: 0;
  }
  
  > div {
    flex: 1;
    text-align: left;
    
    strong {
      display: block;
      color: #fff;
      font-size: 14px;
      margin-bottom: 4px;
    }
    
    div {
      color: #9ca3af;
      font-size: 13px;
    }
  }
`

export const PerformanceErrorRetry = styled.button`
  padding: 6px 12px;
  background: #22c55e;
  color: #000;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #16a34a;
  }
`

export const BuildPanelError = styled.div`
  padding: 12px;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 6px;
`

export const BuildPanelErrorContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    width: 24px;
    height: 24px;
    color: #ef4444;
    flex-shrink: 0;
  }
  
  > div {
    flex: 1;
    text-align: left;
    
    strong {
      display: block;
      color: #fff;
      font-size: 14px;
      margin-bottom: 4px;
    }
    
    div {
      color: #9ca3af;
      font-size: 13px;
    }
  }
`

export const BuildPanelErrorRetry = styled.button`
  padding: 6px 12px;
  background: #22c55e;
  color: #000;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #16a34a;
  }
`

export const SettingsPanelError = styled.div`
  padding: 12px;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 6px;
`

export const SettingsPanelErrorContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    width: 24px;
    height: 24px;
    color: #ef4444;
    flex-shrink: 0;
  }
  
  > div {
    flex: 1;
    text-align: left;
    
    strong {
      display: block;
      color: #fff;
      font-size: 14px;
      margin-bottom: 4px;
    }
    
    div {
      color: #9ca3af;
      font-size: 13px;
    }
  }
`

export const SettingsPanelErrorRetry = styled.button`
  padding: 6px 12px;
  background: #22c55e;
  color: #000;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #16a34a;
  }
`