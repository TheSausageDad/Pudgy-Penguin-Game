import styled from 'styled-components'

// Direct 1:1 port of .dev-status-bar from CSS
export const StatusBarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #1a1a1a;
  border-top: 1px solid rgba(255,255,255,0.1);
  color: #ddd;
  font-size: 14px;
  min-height: 46px;
  position: relative;
  z-index: 300;
`

// Direct 1:1 port of .status-center from CSS
export const StatusCenter = styled.div`
  margin: 0 auto;
`

// Direct 1:1 port of .size-toggle-group from CSS
export const SizeToggleGroup = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  overflow: hidden;
`

// Direct 1:1 port of .size-toggle-option from CSS
export const SizeToggleOption = styled.button<{ $isActive?: boolean }>`
  background: transparent;
  color: #aaa;
  border: none;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  position: relative;
  min-width: 44px;

  &:not(:last-child) {
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #ccc;
  }

  ${props => props.$isActive && `
    background: rgba(255, 255, 255, 0.15);
    color: #fff;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `}
`

// Direct 1:1 port of .publishable-status from CSS
export const PublishableStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  height: 32px;
  box-sizing: border-box;

  &:hover {
    background: rgba(255,255,255,0.05);
  }

  @media (max-width: 767px) {
    span {
      display: none;
    }
  }

  @media (min-width: 768px) {
    span {
      display: inline;
    }
  }
`

// Direct 1:1 port of .status-panel from CSS
export const StatusPanel = styled.div<{ $show?: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 16px;
  margin-bottom: 8px;
  background: #1f1f1f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  min-width: 180px;
  opacity: 0;
  transform: translateY(25px);
  pointer-events: none;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  z-index: 400;

  ${props => props.$show && `
    opacity: 1;
    transform: translateY(16px);
    pointer-events: auto;
  `}
`

// Direct 1:1 port of .status-item from CSS (panel version)
export const StatusPanelItem = styled.div`
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
`

// Direct 1:1 port of .event-light from CSS
export const EventLight = styled.div<{ $color: 'red' | 'green' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  flex-shrink: 0;

  ${props => props.$color === 'red' && `
    background: #ef4444;
    box-shadow: 0 0 4px rgba(239, 68, 68, 0.6);
  `}

  ${props => props.$color === 'green' && `
    background: #22c55e;
    box-shadow: 0 0 4px rgba(34, 197, 94, 0.6);
  `}
`

// Direct 1:1 port of #updated-text from CSS
export const UpdatedText = styled.span`
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`

// Direct 1:1 port of .status-light-grid from CSS
export const StatusLightGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 2px;
  width: 16px;
  height: 16px;
`

// Direct 1:1 port of .status-left from CSS
export const StatusLeftWrapper = styled.div`
  position: relative;
  /* Natural size */
`