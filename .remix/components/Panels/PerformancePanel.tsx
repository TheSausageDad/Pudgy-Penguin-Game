import React, { useRef, useCallback, useMemo } from 'react'
import { useUIState, useOutsideClick } from '../../hooks'
import { useDashboard } from '../../contexts'
import { PerformanceData } from '../../types'
import { formatMemory } from '../../utils'
import { SparklineChart } from '../Common'
import {
  PerformancePanelWrapper,
  PerformancePanelHeader,
  PerformanceTier,
  TierBadge,
  PanelCloseButton,
  PerformanceSection,
  PerformanceSectionHeader,
  PerformanceSparklineContainer,
  PerformanceStatsGrid,
  PerformanceStat,
  PerformanceStatLabel,
  PerformanceStatValue,
  PerformanceTimingGrid,
  PerformanceTimingItem,
  PerformanceTimingLabel,
  PerformanceTimingValue,
  PerformanceMemoryGrid,
  PerformanceMemoryItem,
  PerformanceMemoryLabel,
  PerformanceMemoryValue,
  PerformanceRenderingGrid,
  PerformanceRenderingItem,
  PerformanceRenderingLabel,
  PerformanceRenderingValue,
  PerformanceQuality,
  PerformanceQualityItem,
  PerformanceQualityLabel,
  PerformanceQualityStatus,
  PerformanceQualityValue,
  PerformanceFooter,
  PerformanceDataSource,
  PerformanceDataSourceLabel,
  PerformanceDataSourceValue,
  PerformanceMonitoringStatus,
  MonitoringIndicator
} from './PerformancePanel.styled'

export const PerformancePanel: React.FC = () => {
  const { state } = useDashboard()
  const { showPerformancePanel, togglePerformancePanel } = useUIState()
  const panelRef = useRef<HTMLDivElement>(null)

  // Close panel when clicking outside or pressing escape
  useOutsideClick(panelRef, togglePerformancePanel, showPerformancePanel)

  if (!showPerformancePanel) {
    return null
  }

  const { performance } = state
  const latestData = performance.data[performance.data.length - 1]
  
  // Memoize expensive data transformations for sparklines
  const fpsData = useMemo(() => performance.data.map(d => d.fps), [performance.data])
  const frameTimeData = useMemo(() => performance.data.map(d => d.frameTime), [performance.data])
  const memoryData = useMemo(() => performance.data.map(d => d.memory?.used || 0), [performance.data])
  
  // Memoize jank frame count calculation
  const jankFrameCount = useMemo(() => performance.data.filter(d => d.isJank).length, [performance.data])

  return (
    <PerformancePanelWrapper ref={panelRef} $show={showPerformancePanel}>
      {/* Header */}
      <PerformancePanelHeader>
        <h3>Performance Monitor</h3>
        <PerformanceTier>
          <TierBadge $tier={performance.tier}>
            {performance.tier === 'plugin' ? 'Plugin Data' : 'Iframe Monitoring'}
          </TierBadge>
        </PerformanceTier>
        <PanelCloseButton 
          onClick={togglePerformancePanel}
          title="Close performance panel"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
          </svg>
        </PanelCloseButton>
      </PerformancePanelHeader>

      {/* FPS Statistics */}
      <PerformanceSection>
        <PerformanceSectionHeader>
          <h4>Frame Rate (FPS)</h4>
          <PerformanceSparklineContainer>
            <SparklineChart 
              data={fpsData} 
              width={60} 
              height={20}
              color="#4CAF50"
            />
          </PerformanceSparklineContainer>
        </PerformanceSectionHeader>
        <PerformanceStatsGrid>
          <PerformanceStat>
            <PerformanceStatLabel>Current</PerformanceStatLabel>
            <PerformanceStatValue>{performance.stats.current}</PerformanceStatValue>
          </PerformanceStat>
          <PerformanceStat>
            <PerformanceStatLabel>Average</PerformanceStatLabel>
            <PerformanceStatValue>{performance.stats.average}</PerformanceStatValue>
          </PerformanceStat>
          <PerformanceStat>
            <PerformanceStatLabel>Min</PerformanceStatLabel>
            <PerformanceStatValue>{performance.stats.min}</PerformanceStatValue>
          </PerformanceStat>
          <PerformanceStat>
            <PerformanceStatLabel>Max</PerformanceStatLabel>
            <PerformanceStatValue>{performance.stats.max}</PerformanceStatValue>
          </PerformanceStat>
        </PerformanceStatsGrid>
      </PerformanceSection>

      {/* Frame Time Analysis */}
      <PerformanceSection>
        <PerformanceSectionHeader>
          <h4>Frame Timing (ms)</h4>
          <PerformanceSparklineContainer>
            <SparklineChart 
              data={frameTimeData} 
              width={60} 
              height={20}
              color="#2196F3"
            />
          </PerformanceSparklineContainer>
        </PerformanceSectionHeader>
        <PerformanceTimingGrid>
          <PerformanceTimingItem>
            <PerformanceTimingLabel>Frame Time</PerformanceTimingLabel>
            <PerformanceTimingValue>
              {latestData?.frameTime?.toFixed(2) || '0.00'} ms
            </PerformanceTimingValue>
          </PerformanceTimingItem>
          {latestData?.updateTime && (
            <PerformanceTimingItem>
              <PerformanceTimingLabel>Update</PerformanceTimingLabel>
              <PerformanceTimingValue>
                {latestData.updateTime.toFixed(2)} ms
              </PerformanceTimingValue>
            </PerformanceTimingItem>
          )}
          {latestData?.renderTime && (
            <PerformanceTimingItem>
              <PerformanceTimingLabel>Render</PerformanceTimingLabel>
              <PerformanceTimingValue>
                {latestData.renderTime.toFixed(2)} ms
              </PerformanceTimingValue>
            </PerformanceTimingItem>
          )}
        </PerformanceTimingGrid>
      </PerformanceSection>

      {/* Memory Usage */}
      {latestData?.memory && (
        <PerformanceSection>
          <PerformanceSectionHeader>
            <h4>Memory Usage</h4>
            <PerformanceSparklineContainer>
              <SparklineChart 
                data={memoryData} 
                width={60} 
                height={20}
                color="#FF9800"
              />
            </PerformanceSparklineContainer>
          </PerformanceSectionHeader>
          <PerformanceMemoryGrid>
            <PerformanceMemoryItem>
              <PerformanceMemoryLabel>Used</PerformanceMemoryLabel>
              <PerformanceMemoryValue>
                {formatMemory(latestData.memory.used)}
              </PerformanceMemoryValue>
            </PerformanceMemoryItem>
            <PerformanceMemoryItem>
              <PerformanceMemoryLabel>Total</PerformanceMemoryLabel>
              <PerformanceMemoryValue>
                {formatMemory(latestData.memory.total)}
              </PerformanceMemoryValue>
            </PerformanceMemoryItem>
            <PerformanceMemoryItem>
              <PerformanceMemoryLabel>Usage</PerformanceMemoryLabel>
              <PerformanceMemoryValue>
                {((latestData.memory.used / latestData.memory.total) * 100).toFixed(1)}%
              </PerformanceMemoryValue>
            </PerformanceMemoryItem>
            {latestData.memory.textureMemory && (
              <PerformanceMemoryItem>
                <PerformanceMemoryLabel>Textures</PerformanceMemoryLabel>
                <PerformanceMemoryValue>
                  {formatMemory(latestData.memory.textureMemory)}
                </PerformanceMemoryValue>
              </PerformanceMemoryItem>
            )}
          </PerformanceMemoryGrid>
        </PerformanceSection>
      )}

      {/* Rendering Statistics */}
      {latestData?.rendering && (
        <PerformanceSection>
          <PerformanceSectionHeader>
            <h4>Rendering</h4>
          </PerformanceSectionHeader>
          <PerformanceRenderingGrid>
            <PerformanceRenderingItem>
              <PerformanceRenderingLabel>Draw Calls</PerformanceRenderingLabel>
              <PerformanceRenderingValue>
                {latestData.rendering.drawCalls}
              </PerformanceRenderingValue>
            </PerformanceRenderingItem>
            <PerformanceRenderingItem>
              <PerformanceRenderingLabel>Game Objects</PerformanceRenderingLabel>
              <PerformanceRenderingValue>
                {latestData.rendering.gameObjects}
              </PerformanceRenderingValue>
            </PerformanceRenderingItem>
            <PerformanceRenderingItem>
              <PerformanceRenderingLabel>Physics Bodies</PerformanceRenderingLabel>
              <PerformanceRenderingValue>
                {latestData.rendering.physicsBodies}
              </PerformanceRenderingValue>
            </PerformanceRenderingItem>
            <PerformanceRenderingItem>
              <PerformanceRenderingLabel>Active Tweens</PerformanceRenderingLabel>
              <PerformanceRenderingValue>
                {latestData.rendering.activeTweens}
              </PerformanceRenderingValue>
            </PerformanceRenderingItem>
          </PerformanceRenderingGrid>
        </PerformanceSection>
      )}

      {/* Jank Detection */}
      <PerformanceSection>
        <PerformanceSectionHeader>
          <h4>Performance Quality</h4>
        </PerformanceSectionHeader>
        <PerformanceQuality>
          <PerformanceQualityItem>
            <PerformanceQualityLabel>Current Frame</PerformanceQualityLabel>
            <PerformanceQualityStatus $status={latestData?.isJank ? 'jank' : 'smooth'}>
              {latestData?.isJank ? 'Jank Detected' : 'Smooth'}
            </PerformanceQualityStatus>
          </PerformanceQualityItem>
          <PerformanceQualityItem>
            <PerformanceQualityLabel>Jank Frames (last 60s)</PerformanceQualityLabel>
            <PerformanceQualityValue>
              {jankFrameCount}
            </PerformanceQualityValue>
          </PerformanceQualityItem>
          <PerformanceQualityItem>
            <PerformanceQualityLabel>Data Points</PerformanceQualityLabel>
            <PerformanceQualityValue>
              {performance.data.length}
            </PerformanceQualityValue>
          </PerformanceQualityItem>
        </PerformanceQuality>
      </PerformanceSection>

      {/* Data Source Info */}
      <PerformanceFooter>
        <PerformanceDataSource>
          <PerformanceDataSourceLabel>
            Data Source: 
          </PerformanceDataSourceLabel>
          <PerformanceDataSourceValue>
            {performance.tier === 'plugin' 
              ? 'Phaser Performance Plugin' 
              : 'RAF-based Iframe Monitoring'
            }
          </PerformanceDataSourceValue>
        </PerformanceDataSource>
        <PerformanceMonitoringStatus>
          <MonitoringIndicator $active={performance.isMonitoring}>
            {performance.isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
          </MonitoringIndicator>
        </PerformanceMonitoringStatus>
      </PerformanceFooter>
    </PerformancePanelWrapper>
  )
}


