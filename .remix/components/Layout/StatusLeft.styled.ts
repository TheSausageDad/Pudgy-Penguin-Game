import styled, { css, keyframes } from 'styled-components'

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

export const StatusLeftWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

export const StatusButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme?.spacing?.sm || '8px'};
  padding: ${props => `${props.theme?.spacing?.xs || '4px'} ${props.theme?.spacing?.sm || '8px'}`};
  background: transparent;
  color: ${props => props.theme?.colors?.text?.secondary || '#9b9b9b'};
  font-size: ${props => props.theme?.fontSize?.sm || '12px'};
  border-radius: ${props => props.theme?.borderRadius?.sm || '4px'};
  transition: all ${props => props.theme?.transitions?.fast || '150ms ease'};
  
  &:hover {
    background: ${props => props.theme?.colors?.bg?.tertiary || '#242424'};
    color: ${props => props.theme?.colors?.text?.primary || '#e0e0e0'};
  }
  
  &:focus-visible {
    outline: 2px solid ${props => props.theme?.colors?.accent?.green || '#b7ff00'};
    outline-offset: 2px;
  }
  
  &:active {
    transform: scale(0.98);
  }
`

export const StatusLightGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
  padding: 2px;
  background: ${props => props.theme?.colors?.bg?.tertiary || '#242424'};
  border-radius: ${props => props.theme?.borderRadius?.sm || '4px'};
`

export const StatusPanel = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0px !important;
  transform: translateY(10px);
  background: #1f1f1f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  min-width: 180px;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  z-index: ${props => props.theme?.zIndex?.tooltip || 400};
  
  &[data-open="true"] {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
`

export const StatusLabel = styled.span`
  font-size: ${props => props.theme?.fontSize?.sm || '12px'};
  color: ${props => props.theme?.colors?.text?.secondary || '#9b9b9b'};
  white-space: nowrap;
`