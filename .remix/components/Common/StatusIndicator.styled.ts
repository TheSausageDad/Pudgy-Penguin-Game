import styled, { css } from 'styled-components'

// From .status-item in CSS
export const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 14px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  
  &:not(:last-child) {
    border-bottom: 1px solid rgba(255,255,255,0.1);
    margin-bottom: 4px;
    padding-bottom: 8px;
  }
  
  span {
    color: #ddd;
  }
`

// From .event-light in CSS (normal size)
export const EventLight = styled.div<{ $status: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  flex-shrink: 0;
  
  ${props => props.$status ? css`
    background: #22c55e;
    box-shadow: 0 0 4px rgba(34, 197, 94, 0.6);
  ` : css`
    background: #ef4444;
    box-shadow: 0 0 4px rgba(239, 68, 68, 0.6);
  `}
`

// From .status-light-mini in CSS
export const StatusLightMini = styled.div<{ $status: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transition: all 0.3s ease;
  flex-shrink: 0;
  
  ${props => props.$status ? css`
    background: #22c55e;
    box-shadow: 0 0 2px rgba(34, 197, 94, 0.6);
  ` : css`
    background: #ef4444;
    box-shadow: 0 0 2px rgba(239, 68, 68, 0.6);
  `}
`