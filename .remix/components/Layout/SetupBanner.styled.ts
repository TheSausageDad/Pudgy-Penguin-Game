import styled, { keyframes } from 'styled-components'

// Direct 1:1 port of slideUpBanner animation from CSS
const slideUpBanner = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
`

// Direct 1:1 port of .setup-banner from CSS
export const SetupBannerWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #000;
  font-family: system-ui, -apple-system, sans-serif;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);
  animation: ${slideUpBanner} 0.3s ease-out;
`

// Direct 1:1 port of .setup-banner-content from CSS
export const SetupBannerContent = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
`

// Direct 1:1 port of .setup-banner-icon from CSS
export const SetupBannerIcon = styled.div`
  font-size: 24px;
  flex-shrink: 0;
`

// Direct 1:1 port of .setup-banner-text from CSS
export const SetupBannerText = styled.div`
  flex: 1;
  font-size: 14px;
  line-height: 1.4;

  strong {
    font-weight: 600;
  }

  code {
    background: rgba(0, 0, 0, 0.2);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
    font-size: 13px;
    font-weight: 500;
  }
`

// Direct 1:1 port of .setup-banner-close from CSS
export const SetupBannerClose = styled.button`
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 4px;
  color: #000;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  height: 28px;
  width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }
`