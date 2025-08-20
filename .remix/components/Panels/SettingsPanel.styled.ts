import styled from 'styled-components'

export const SettingsPanelWrapper = styled.div<{ $show: boolean }>`
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  background: #1f1f1f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  min-width: 200px;
  opacity: ${props => props.$show ? 1 : 0};
  transform: translateY(${props => props.$show ? '0' : '10px'});
  pointer-events: ${props => props.$show ? 'auto' : 'none'};
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  z-index: 500;
`

export const SettingsPanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h3 {
    margin: 0;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
  }
`

export const PanelCloseButton = styled.button`
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`

export const StatusItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;
  font-size: 14px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  
  &:not(:last-child) {
    border-bottom: 1px solid rgba(255,255,255,0.1);
    margin-bottom: 8px;
    padding-bottom: 16px;
  }
`

export const StatusLabel = styled.div`
  color: #aaa;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`

export const DeviceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const DeviceInfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
`

export const DeviceInfoLabel = styled.span`
  color: #999;
  font-weight: 500;
`

export const DeviceInfoValue = styled.span`
  color: #ddd;
  font-weight: 600;
  
  &.supported {
    color: #22c55e;
  }
  
  &.unsupported {
    color: #ef4444;
  }
`

export const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`

export const SettingInfo = styled.div`
  flex: 1;
`

export const SettingName = styled.div`
  color: #ddd;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 2px;
`

export const SettingDescription = styled.div`
  color: #999;
  font-size: 11px;
  line-height: 1.3;
`

export const SettingRestriction = styled.span`
  color: #ef4444;
  font-weight: 500;
`

export const SettingControl = styled.div`
  flex-shrink: 0;
`

export const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  cursor: pointer;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
    
    &:checked + .toggle-slider {
      background: #22c55e;
      border-color: #22c55e;
      
      &::before {
        transform: translateX(16px);
        background: #000;
      }
    }
    
    &:disabled + .toggle-slider {
      opacity: 0.5;
      cursor: not-allowed;
      border-color: #333;
      
      &::before {
        opacity: 0.5;
      }
    }
  }
`

export const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #333;
  border: 2px solid #555;
  border-radius: 12px;
  transition: all 0.2s ease;
  
  &::before {
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
`

export const CompatibilityNotes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const CompatibilityNote = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  
  &.safari {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    color: #60a5fa;
  }
  
  &.mobile {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.2);
    color: #4ade80;
  }
  
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-top: 1px;
  }
  
  > div {
    flex: 1;
    
    strong {
      display: block;
      margin-bottom: 2px;
      font-weight: 600;
    }
    
    div {
      color: #ddd;
      line-height: 1.3;
    }
  }
`

export const SettingsActions = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.1);
`

export const SettingsResetButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 6px;
  color: #f87171;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  justify-content: center;
  
  &:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`