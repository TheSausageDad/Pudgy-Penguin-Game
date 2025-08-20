import styled from 'styled-components'

// Direct 1:1 port of .top-nav-bar from CSS
export const TopNavBarWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  padding: 4px 16px 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;

  button {
    pointer-events: auto;
  }
`

// Direct 1:1 port of .nav-left from CSS
export const NavLeft = styled.div`
  flex-shrink: 0;
`

// Direct 1:1 port of .nav-back-btn from CSS
export const NavButton = styled.button<{ $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: white;
  cursor: not-allowed;
  opacity: 1;
  margin-left: -10px;
  transition: all 0.2s ease;
`

// Direct 1:1 port of .nav-mute-btn from CSS
export const NavMuteButton = styled.button<{ $isMuted?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;
  margin-right: -10px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`

// Direct 1:1 port of .nav-icon from CSS
export const NavIcon = styled.svg`
  width: 20px;
  height: 20px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
  fill: white;

  /* Special case for nav-back-btn .nav-icon */
  ${NavButton} & {
    width: 16px;
    height: 16px;
  }
`