import styled from 'styled-components'

// Direct 1:1 port of .performance-chart-container from CSS
export const PerformanceChartContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 4px;
`

// Direct 1:1 port of .performance-chart from CSS
export const PerformanceChart = styled.canvas`
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(26, 26, 26, 0.8);

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }
`

// Direct 1:1 port of .performance-panel from CSS
export const PerformancePanel = styled.div<{ $show?: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  margin-bottom: 8px;
  background: #1f1f1f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  min-width: 220px;
  max-width: 260px;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s ease;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  z-index: 600;
  backdrop-filter: blur(8px);

  ${props => props.$show && `
    opacity: 1;
    transform: translateX(-50%) translateY(0);
    pointer-events: auto;
  `}
`

// Direct 1:1 port of .performance-stats from CSS
export const PerformanceStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
`

// Direct 1:1 port of .perf-section from CSS
export const PerfSection = styled.div`
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

// Direct 1:1 port of .perf-header from CSS
export const PerfHeader = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
`

// Direct 1:1 port of .perf-content from CSS
export const PerfContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`

// Direct 1:1 port of .perf-chart from CSS
export const PerfChart = styled.canvas`
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.3);
`

// Direct 1:1 port of .perf-data from CSS
export const PerfData = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`

// Direct 1:1 port of .perf-row from CSS
export const PerfRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  color: #ddd;
  min-height: 16px;
  line-height: 1.2;

  span:first-child {
    color: #999;
    flex: 1;
    text-align: left;
    font-weight: 500;
  }

  @media (max-width: 767px) {
    font-size: 11px;
    min-height: 16px;
  }
`

// Direct 1:1 port of .perf-value from CSS
export const PerfValue = styled.span`
  font-weight: 700;
  color: #22c55e;
  text-align: right;
  min-width: 40px;
  margin-right: 4px;

  @media (max-width: 767px) {
    min-width: 32px;
  }
`

// Direct 1:1 port of .perf-unit from CSS
export const PerfUnit = styled.span`
  font-size: 10px;
  color: #777;
  font-weight: 400;
  min-width: 24px;
  text-align: left;
  flex-shrink: 0;

  @media (max-width: 767px) {
    min-width: 20px;
  }
`

// Direct 1:1 port of .perf-range from CSS
export const PerfRange = styled.span`
  font-weight: 700;
  color: #22c55e;
  font-size: 11px;
  text-align: right;
  min-width: 40px;
  margin-right: 4px;
`