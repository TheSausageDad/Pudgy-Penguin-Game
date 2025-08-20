import styled, { css, keyframes } from 'styled-components'

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

export const BuildPanelWrapper = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: calc(100% - 70px);
  background: #1a1a1a;
  border-left: 1px solid #333;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 100;
  
  ${props => props.$isOpen && css`
    transform: translateX(0);
  `}
  
  @media (max-width: 768px) {
    width: 100%;
  }
`

export const BuildPanelContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 0;
`

export const BuildControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  flex-shrink: 0;
`

export const BuildButton = styled.button<{ $isBuilding?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  min-height: 52px;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #16a34a, #15803d);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  }
  
  &:disabled {
    background: #6b7280 !important;
    color: #9ca3af !important;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`

export const BuildButtonText = styled.span``

export const BuildSpinner = styled.div<{ $visible?: boolean }>`
  display: ${props => props.$visible ? 'block' : 'none'};
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`

export const BuildButtonMessage = styled.div`
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
  padding: 8px 12px;
  background: rgba(107, 114, 128, 0.1);
  border: 1px solid rgba(107, 114, 128, 0.2);
  border-radius: 6px;
  margin-top: -8px;
`

export const SDKWarning = styled.div<{ $isComplete?: boolean }>`
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 8px;
  
  ${props => props.$isComplete ? css`
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.2);
  ` : css`
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.2);
  `}
`

export const WarningIcon = styled.div`
  font-size: 16px;
  flex-shrink: 0;
`

export const WarningContent = styled.div<{ $isComplete?: boolean }>`
  strong {
    color: ${props => props.$isComplete ? '#22c55e' : '#fbbf24'};
    display: block;
    font-size: 15px;
    margin-bottom: 6px;
  }
  
  p {
    color: #d1d5db;
    font-size: 14px;
    margin: 0;
    line-height: 1.4;
  }
`

export const BuildSuccess = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
`

export const SuccessIcon = styled.div`
  font-size: 16px;
  flex-shrink: 0;
`

export const SuccessContent = styled.div`
  strong {
    color: #22c55e;
    display: block;
    font-size: 15px;
    margin-bottom: 6px;
  }
  
  p {
    color: #d1d5db;
    font-size: 14px;
    margin: 0;
    line-height: 1.4;
  }
`

export const BuildInfo = styled.div`
  font-size: 14px;
  color: #999;
  text-align: center;
`

export const BuildOutput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-height: 0;
`

export const BuildOutputHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
`

export const BuildOutputTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  h4 {
    margin: 0;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
  }
`

export const BuildTimeAgo = styled.span`
  font-size: 11px;
  color: #999;
`

export const BuildOutputActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const FileSize = styled.span<{ $copied?: boolean }>`
  font-size: 11px;
  color: ${props => props.$copied ? '#22c55e' : '#999'};
  font-weight: 500;
`

export const BuildOutputCode = styled.div`
  border: 1px solid #333;
  border-radius: 6px;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
  background: #111;
`

export const CopyButton = styled.button<{ $copied?: boolean }>`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: ${props => props.$copied ? '#22c55e' : 'rgba(0, 0, 0, 0.8)'};
  color: #d1d5db;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  z-index: 10;
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`

export const CodeDisplay = styled.pre`
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  padding: 16px !important;
  margin: 0;
  color: #d1d5db;
  background: transparent;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-y: auto;
  overflow-x: auto;
  height: 100%;
  box-sizing: border-box;
  
  /* Override highlight.js styles */
  &.hljs {
    padding: 16px !important;
    background: transparent;
  }
`