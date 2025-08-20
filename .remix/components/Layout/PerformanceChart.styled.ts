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

export const PerformanceChartContainer = styled.div`
  position: relative;
  display: inline-block;
`

export const PerformanceChartCanvas = styled.canvas`
  cursor: pointer;
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    opacity: 0.8;
  }
  
  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.accent.green};
    outline-offset: 2px;
  }
`

export const PerformancePanel = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.bg.secondary};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  min-width: 320px;
  box-shadow: ${props => props.theme.shadows.xl};
  z-index: ${props => props.theme.zIndex.dropdown};
  
  display: ${props => props.$isOpen ? 'block' : 'none'};
  
  ${props => props.$isOpen && css`
    animation: ${fadeIn} ${props.theme.transitions.fast};
  `}
`

export const PerformanceStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  width: 100%;
`

export const PerfSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`

export const PerfHeader = styled.div`
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${props => props.theme.spacing.xs};
`

export const PerfContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`

export const PerfChart = styled.canvas`
  flex-shrink: 0;
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.theme.colors.bg.tertiary};
`

export const PerfData = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`

export const PerfRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${props => props.theme.spacing.xs};
  line-height: 1.2;
`

export const PerfValue = styled.span`
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  font-variant-numeric: tabular-nums;
`

export const PerfUnit = styled.span`
  font-size: ${props => props.theme.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.fontWeight.normal};
`

export const PerfRange = styled.span`
  font-size: ${props => props.theme.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.fontWeight.normal};
  font-variant-numeric: tabular-nums;
`

export const PerfLabel = styled.span`
  font-size: ${props => props.theme.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: lowercase;
  margin-right: auto;
`