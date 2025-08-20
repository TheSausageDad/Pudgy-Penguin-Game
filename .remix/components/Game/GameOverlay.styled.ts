import styled from 'styled-components'

// Direct 1:1 port of .game-overlay from CSS
export const GameOverlayWrapper = styled.div<{ $show?: boolean }>`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 3;

  ${props => props.$show && `
    opacity: 1;
    pointer-events: auto;
  `}
`

// Direct 1:1 port of .overlay-content from CSS
export const OverlayContent = styled.div`
  text-align: center;
  position: relative;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
`

// Direct 1:1 port of .overlay-score from CSS
export const OverlayScore = styled.div`
  font-size: clamp(48px, 18cqw, 144px);
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 12px;
  color: #fff;
  line-height: 1;
  letter-spacing: -0.02em;
`

// Direct 1:1 port of .overlay-title from CSS
export const OverlayTitle = styled.div`
  font-size: clamp(24px, 9cqw, 56px);
  font-weight: 600;
  text-transform: uppercase;
  color: #fff;
  line-height: 1;
  letter-spacing: -0.02em;
`

// Direct 1:1 port of .overlay-button-container from CSS
export const OverlayButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-top: 16px;
  padding: 24px;
  width: 100%;
`

// Direct 1:1 port of .play-again-btn from CSS
export const PlayAgainButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #b7ff00;
  color: #000;
  border: 0;
  border-radius: 6px;
  padding: 12px 16px;
  margin: 0 16px;
  height: 42px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: #a7f200;
  }

  &:active {
    background: #95df00;
  }

  &:focus-visible {
    ring: 3px;
    ring-color: rgba(183, 255, 0, 0.5);
    border-color: #b7ff00;
  }
`

// Direct 1:1 port of .play-icon from CSS
export const PlayIcon = styled.svg`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  fill: currentColor;
`

// Direct 1:1 port of .game-frame from CSS
export const GameFrame = styled.div`
  position: relative;
  transition: width 0.3s ease, height 0.3s ease;
  overflow: hidden;
  border-radius: 12px;
  border: 2px solid #99999905;
`

// Direct 1:1 port of #game-iframe from CSS
export const GameIframe = styled.iframe`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 2;
  border: none;
`