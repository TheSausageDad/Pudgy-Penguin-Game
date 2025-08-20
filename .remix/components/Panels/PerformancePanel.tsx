import React, { useEffect, useRef, useCallback } from 'react'
import { useUIState } from '../../hooks'
import { useDashboard } from '../../contexts'
import { PerformanceData } from '../../types'

export const PerformancePanel: React.FC = () => {
  const { state } = useDashboard()
  const { showPerformancePanel, togglePerformancePanel } = useUIState()
  const panelRef = useRef<HTMLDivElement>(null)

  // Close panel when clicking outside
  useEffect(() => {
    if (!showPerformancePanel) return

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        togglePerformancePanel()
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        togglePerformancePanel()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [showPerformancePanel, togglePerformancePanel])

  if (!showPerformancePanel) {
    return null
  }

  const { performance } = state
  const latestData = performance.data[performance.data.length - 1]

  return (
    <div ref={panelRef} className="performance-panel show">
      {/* Header */}
      <div className="performance-panel-header">
        <h3>Performance Monitor</h3>
        <div className="performance-tier">
          <span className={`tier-badge ${performance.tier}`}>
            {performance.tier === 'plugin' ? 'Plugin Data' : 'Iframe Monitoring'}
          </span>
        </div>
        <button 
          className="panel-close-btn" 
          onClick={togglePerformancePanel}
          title="Close performance panel"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
          </svg>
        </button>
      </div>

      {/* FPS Statistics */}
      <div className="performance-section">
        <div className="performance-section-header">
          <h4>Frame Rate (FPS)</h4>
          <div className="performance-sparkline-container">
            <SparklineChart 
              data={performance.data.map(d => d.fps)} 
              width={60} 
              height={20}
              color="#4CAF50"
            />
          </div>
        </div>
        <div className="performance-stats-grid">
          <div className="performance-stat">
            <div className="performance-stat-label">Current</div>
            <div className="performance-stat-value">{performance.stats.current}</div>
          </div>
          <div className="performance-stat">
            <div className="performance-stat-label">Average</div>
            <div className="performance-stat-value">{performance.stats.average}</div>
          </div>
          <div className="performance-stat">
            <div className="performance-stat-label">Min</div>
            <div className="performance-stat-value">{performance.stats.min}</div>
          </div>
          <div className="performance-stat">
            <div className="performance-stat-label">Max</div>
            <div className="performance-stat-value">{performance.stats.max}</div>
          </div>
        </div>
      </div>

      {/* Frame Time Analysis */}
      <div className="performance-section">
        <div className="performance-section-header">
          <h4>Frame Timing (ms)</h4>
          <div className="performance-sparkline-container">
            <SparklineChart 
              data={performance.data.map(d => d.frameTime)} 
              width={60} 
              height={20}
              color="#2196F3"
            />
          </div>
        </div>
        <div className="performance-timing-grid">
          <div className="performance-timing-item">
            <div className="performance-timing-label">Frame Time</div>
            <div className="performance-timing-value">
              {latestData?.frameTime?.toFixed(2) || '0.00'} ms
            </div>
          </div>
          {latestData?.updateTime && (
            <div className="performance-timing-item">
              <div className="performance-timing-label">Update</div>
              <div className="performance-timing-value">
                {latestData.updateTime.toFixed(2)} ms
              </div>
            </div>
          )}
          {latestData?.renderTime && (
            <div className="performance-timing-item">
              <div className="performance-timing-label">Render</div>
              <div className="performance-timing-value">
                {latestData.renderTime.toFixed(2)} ms
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Memory Usage */}
      {latestData?.memory && (
        <div className="performance-section">
          <div className="performance-section-header">
            <h4>Memory Usage</h4>
            <div className="performance-sparkline-container">
              <SparklineChart 
                data={performance.data.map(d => d.memory?.used || 0)} 
                width={60} 
                height={20}
                color="#FF9800"
              />
            </div>
          </div>
          <div className="performance-memory-grid">
            <div className="performance-memory-item">
              <div className="performance-memory-label">Used</div>
              <div className="performance-memory-value">
                {formatMemory(latestData.memory.used)}
              </div>
            </div>
            <div className="performance-memory-item">
              <div className="performance-memory-label">Total</div>
              <div className="performance-memory-value">
                {formatMemory(latestData.memory.total)}
              </div>
            </div>
            <div className="performance-memory-item">
              <div className="performance-memory-label">Usage</div>
              <div className="performance-memory-value">
                {((latestData.memory.used / latestData.memory.total) * 100).toFixed(1)}%
              </div>
            </div>
            {latestData.memory.textureMemory && (
              <div className="performance-memory-item">
                <div className="performance-memory-label">Textures</div>
                <div className="performance-memory-value">
                  {formatMemory(latestData.memory.textureMemory)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rendering Statistics */}
      {latestData?.rendering && (
        <div className="performance-section">
          <div className="performance-section-header">
            <h4>Rendering</h4>
          </div>
          <div className="performance-rendering-grid">
            <div className="performance-rendering-item">
              <div className="performance-rendering-label">Draw Calls</div>
              <div className="performance-rendering-value">
                {latestData.rendering.drawCalls}
              </div>
            </div>
            <div className="performance-rendering-item">
              <div className="performance-rendering-label">Game Objects</div>
              <div className="performance-rendering-value">
                {latestData.rendering.gameObjects}
              </div>
            </div>
            <div className="performance-rendering-item">
              <div className="performance-rendering-label">Physics Bodies</div>
              <div className="performance-rendering-value">
                {latestData.rendering.physicsBodies}
              </div>
            </div>
            <div className="performance-rendering-item">
              <div className="performance-rendering-label">Active Tweens</div>
              <div className="performance-rendering-value">
                {latestData.rendering.activeTweens}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jank Detection */}
      <div className="performance-section">
        <div className="performance-section-header">
          <h4>Performance Quality</h4>
        </div>
        <div className="performance-quality">
          <div className="performance-quality-item">
            <div className="performance-quality-label">Current Frame</div>
            <div className={`performance-quality-status ${latestData?.isJank ? 'jank' : 'smooth'}`}>
              {latestData?.isJank ? 'Jank Detected' : 'Smooth'}
            </div>
          </div>
          <div className="performance-quality-item">
            <div className="performance-quality-label">Jank Frames (last 60s)</div>
            <div className="performance-quality-value">
              {performance.data.filter(d => d.isJank).length}
            </div>
          </div>
          <div className="performance-quality-item">
            <div className="performance-quality-label">Data Points</div>
            <div className="performance-quality-value">
              {performance.data.length}
            </div>
          </div>
        </div>
      </div>

      {/* Data Source Info */}
      <div className="performance-footer">
        <div className="performance-data-source">
          <div className="performance-data-source-label">
            Data Source: 
          </div>
          <div className="performance-data-source-value">
            {performance.tier === 'plugin' 
              ? 'Phaser Performance Plugin' 
              : 'RAF-based Iframe Monitoring'
            }
          </div>
        </div>
        <div className="performance-monitoring-status">
          <div className={`monitoring-indicator ${performance.isMonitoring ? 'active' : 'inactive'}`}>
            {performance.isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
          </div>
        </div>
      </div>
    </div>
  )
}

// Sparkline chart component for 60x20px mini charts
interface SparklineChartProps {
  data: number[]
  width: number
  height: number
  color: string
}

const SparklineChart: React.FC<SparklineChartProps> = ({ data, width, height, color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const drawSparkline = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    if (data.length < 2) return

    // Calculate min/max for scaling
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    // Draw line
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.beginPath()

    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((value - min) / range) * height
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw fill area
    ctx.globalAlpha = 0.2
    ctx.fillStyle = color
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 1

  }, [data, width, height, color])

  useEffect(() => {
    drawSparkline()
  }, [drawSparkline])

  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height}
      className="performance-sparkline"
    />
  )
}

// Utility function to format memory values
function formatMemory(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}