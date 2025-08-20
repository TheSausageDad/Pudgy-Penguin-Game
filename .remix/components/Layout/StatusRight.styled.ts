import styled, { css } from 'styled-components'

// Direct 1:1 port of .status-right from CSS
export const StatusRightWrapper = styled.div`
  opacity: 1;
  font-size: 13px;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`

// Direct 1:1 port of .build-toggle-btn-clean from CSS
export const BuildToggleButton = styled.button<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #aaa;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  height: 32px;
  box-sizing: border-box;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
    color: #fff;
  }

  ${props => props.$isActive && css`
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.2);
    color: #22c55e;

    &:hover {
      background: rgba(34, 197, 94, 0.15);
      border-color: rgba(34, 197, 94, 0.3);
    }
  `}

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`

// Direct 1:1 port of .settings-status from CSS
export const SettingsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 0;
  margin: 0;
  border-radius: 8px;
  transition: all 0.2s ease;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  position: relative;
  height: 32px;
  box-sizing: border-box;
`

// Direct 1:1 port of .settings-btn from CSS
export const SettingsButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #aaa;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
  }
`

// Direct 1:1 port of .settings-panel from CSS
export const SettingsPanel = styled.div<{ $isOpen?: boolean }>`
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  background: #1f1f1f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  min-width: 200px;
  opacity: 0;
  transform: translateY(10px);
  pointer-events: none;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  z-index: 500;

  ${props => props.$isOpen && css`
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  `}
`

// QR Panel (same styles as settings panel)
export const QrPanel = styled(SettingsPanel)`
  min-width: 220px;
  z-index: 500;
`

// Direct 1:1 port of .status-item from CSS (used in panels)
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
`

// Direct 1:1 port of .setting-label from CSS
export const SettingLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 4px;
  width: 100%;
`

// Direct 1:1 port of .setting-checkbox from CSS
export const SettingCheckbox = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  -webkit-appearance: none;
  width: 36px;
  height: 20px;
  background: #333;
  border: 2px solid #555;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  margin: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:checked {
    background: #22c55e;
    border-color: #22c55e;
  }

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &:checked::after {
    transform: translateX(16px);
    background: #000;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: #333;

    &::after {
      opacity: 0.5;
    }
  }
`

// Direct 1:1 port of .setting-text from CSS
export const SettingText = styled.span`
  color: #ddd;
  font-size: 13px;
  font-weight: 500;
  flex: 1;
  text-align: left;

  ${SettingCheckbox}:disabled + & {
    opacity: 0.5;
    color: #888;
  }
`