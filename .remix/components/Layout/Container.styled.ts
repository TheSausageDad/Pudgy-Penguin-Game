import styled from 'styled-components'

// Direct 1:1 port of .remix-dev-container from CSS
export const RemixDevContainer = styled.div<{ $buildPanelOpen?: boolean }>`
  position: fixed;
  inset: 0;
  background: #0f0f0f;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif;
  display: flex;
  flex-direction: column;
  z-index: 1000000;

  button {
    outline: none;
  }

  ${props => props.$buildPanelOpen && `
    &.build-panel-open .build-panel-spacer {
      width: 400px;
    }
  `}
`

// Direct 1:1 port of .main-content-wrapper from CSS
export const MainContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  min-height: 0;
`

// Direct 1:1 port of .build-panel-spacer from CSS
export const BuildPanelSpacer = styled.div<{ $isOpen?: boolean }>`
  width: 0;
  flex-shrink: 0;
  pointer-events: none;
  background: transparent;
  transition: width 0.3s ease;

  ${props => props.$isOpen && `
    width: 400px;
  `}
`

// Direct 1:1 port of body.show-background-pattern .game-container::before from CSS
export const BackgroundPatternStyle = styled.style`
  body.show-background-pattern .game-container::before {
    opacity: var(--background-pattern-opacity, 0.08);
  }

  body.background-pattern-transitioning .game-container::before {
    transition: opacity 300ms ease-in-out;
  }
`

// Direct 1:1 port of mobile responsiveness from CSS
export const MobileStyles = styled.style`
  @media (pointer: coarse) and (hover: none) {
    #mobile-qr-btn {
      display: none;
    }
  }

  @media (max-width: 500px) {
    .build-toggle-btn,
    .build-toggle-btn-clean,
    #mobile-qr-btn {
      display: none;
    }
  }
`