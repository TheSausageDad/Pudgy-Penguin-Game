import styled from 'styled-components'

export const PerformancePanelWrapper = styled.div<{ $show: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(${props => props.$show ? '0' : '10px'});
  margin-bottom: 8px;
  background: #1f1f1f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  min-width: 220px;
  max-width: 260px;
  opacity: ${props => props.$show ? 1 : 0};
  pointer-events: ${props => props.$show ? 'auto' : 'none'};
  transition: all 0.2s ease;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  z-index: 600;
  backdrop-filter: blur(8px);
`

export const PerformancePanelHeader = styled.div`
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

export const PerformanceTier = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`

export const TierBadge = styled.span<{ $tier?: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => props.$tier === 'plugin' ? `
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.2);
  ` : `
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
    border: 1px solid rgba(251, 191, 36, 0.2);
  `}
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

export const PerformanceSection = styled.div`
  margin-bottom: 2px;
  padding-bottom: 12px;
  
  &:not(:last-child) {
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  
  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
  }
`

export const PerformanceSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  
  h4 {
    margin: 0;
    font-size: 11px;
    font-weight: 600;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`

export const PerformanceSparklineContainer = styled.div`
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.3);
`

export const PerformanceStatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`

export const PerformanceStat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`

export const PerformanceStatLabel = styled.div`
  font-size: 10px;
  color: #999;
  font-weight: 500;
  margin-bottom: 2px;
`

export const PerformanceStatValue = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #22c55e;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
`

export const PerformanceTimingGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const PerformanceTimingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  color: #ddd;
  min-height: 16px;
  line-height: 1.2;
`

export const PerformanceTimingLabel = styled.span`
  color: #999;
  flex: 1;
  text-align: left;
  font-weight: 500;
`

export const PerformanceTimingValue = styled.span`
  font-weight: 700;
  color: #22c55e;
  text-align: right;
  min-width: 40px;
  margin-right: 4px;
`

export const PerformanceMemoryGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const PerformanceMemoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  color: #ddd;
  min-height: 16px;
  line-height: 1.2;
`

export const PerformanceMemoryLabel = styled.span`
  color: #999;
  flex: 1;
  text-align: left;
  font-weight: 500;
`

export const PerformanceMemoryValue = styled.span`
  font-weight: 700;
  color: #22c55e;
  text-align: right;
  min-width: 40px;
  margin-right: 4px;
`

export const PerformanceRenderingGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const PerformanceRenderingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  color: #ddd;
  min-height: 16px;
  line-height: 1.2;
`

export const PerformanceRenderingLabel = styled.span`
  color: #999;
  flex: 1;
  text-align: left;
  font-weight: 500;
`

export const PerformanceRenderingValue = styled.span`
  font-weight: 700;
  color: #22c55e;
  text-align: right;
  min-width: 40px;
  margin-right: 4px;
`

export const PerformanceQuality = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const PerformanceQualityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  color: #ddd;
  min-height: 16px;
  line-height: 1.2;
`

export const PerformanceQualityLabel = styled.span`
  color: #999;
  flex: 1;
  text-align: left;
  font-weight: 500;
`

export const PerformanceQualityStatus = styled.span<{ $status?: 'jank' | 'smooth' }>`
  font-weight: 700;
  text-align: right;
  min-width: 40px;
  margin-right: 4px;
  
  ${props => props.$status === 'jank' ? `
    color: #ef4444;
  ` : `
    color: #22c55e;
  `}
`

export const PerformanceQualityValue = styled.span`
  font-weight: 700;
  color: #22c55e;
  text-align: right;
  min-width: 40px;
  margin-right: 4px;
`

export const PerformanceFooter = styled.div`
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const PerformanceDataSource = styled.div`
  display: flex;
  gap: 4px;
  font-size: 10px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  color: #999;
`

export const PerformanceDataSourceLabel = styled.div`
  color: #777;
`

export const PerformanceDataSourceValue = styled.div`
  color: #aaa;
  font-weight: 500;
`

export const PerformanceMonitoringStatus = styled.div`
  display: flex;
  justify-content: center;
`

export const MonitoringIndicator = styled.div<{ $active?: boolean }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => props.$active ? `
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.2);
  ` : `
    background: rgba(107, 114, 128, 0.1);
    color: #9ca3af;
    border: 1px solid rgba(107, 114, 128, 0.2);
  `}
`