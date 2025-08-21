import React, { useRef, useCallback, useMemo } from 'react'
import { useUIState, useOutsideClick } from '../../hooks'
import { useDashboard } from '../../contexts'
import { PerformanceData } from '../../types'
import { formatMemory } from '../../utils'
import { SparklineChart } from '../Common'
import { cn, tw } from '../../utils/tw'

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
    <div ref={panelRef} className={tw`
      absolute bottom-full left-1/2
      ${showPerformancePanel ? 'translate-x-[-50%] translate-y-0 opacity-100 pointer-events-auto' : 'translate-x-[-50%] translate-y-2.5 opacity-0 pointer-events-none'}
      mb-2 bg-zinc-800 border border-white/10 rounded-lg
      p-4 min-w-[220px] max-w-[260px]
      transition-all duration-200 shadow-[0_8px_24px_rgba(0,0,0,0.4)]
      select-none z-[600] backdrop-blur-lg
    `}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="m-0 text-white text-base font-semibold">Performance Monitor</h3>
        <div className="flex-1 flex justify-center">
          <span className={cn(
            'px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide',
            performance.tier === 'plugin'
              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
              : 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
          )}>
            {performance.tier === 'plugin' ? 'Plugin Data' : 'Iframe Monitoring'}
          </span>
        </div>
        <button 
          onClick={togglePerformancePanel}
          title="Close performance panel"
          className={tw`
            bg-transparent border-none text-gray-400
            cursor-pointer p-1 rounded transition-all duration-200
            flex items-center justify-center
            hover:bg-white/10 hover:text-white
          `}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
          </svg>
        </button>
      </div>

      {/* FPS Statistics */}
      <div className={tw`
        mb-0.5 pb-3
        [&:not(:last-child)]:border-b [&:not(:last-child)]:border-white/5
        last:mb-0 last:pb-0
      `}>
        <div className="flex justify-between items-center mb-2.5">
          <h4 className={tw`
            m-0 text-xs font-semibold text-gray-400
            uppercase tracking-wide
          `}>Frame Rate (FPS)</h4>
          <div className="flex-shrink-0 border border-white/10 rounded bg-black/30">
            <SparklineChart 
              data={fpsData} 
              width={60} 
              height={20}
              color="#4CAF50"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col items-center text-center">
            <div className="text-xs text-gray-400 font-medium mb-0.5">Current</div>
            <div className="text-sm font-bold text-green-500 font-mono">{performance.stats.current}</div>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="text-xs text-gray-400 font-medium mb-0.5">Average</div>
            <div className="text-sm font-bold text-green-500 font-mono">{performance.stats.average}</div>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="text-xs text-gray-400 font-medium mb-0.5">Min</div>
            <div className="text-sm font-bold text-green-500 font-mono">{performance.stats.min}</div>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="text-xs text-gray-400 font-medium mb-0.5">Max</div>
            <div className="text-sm font-bold text-green-500 font-mono">{performance.stats.max}</div>
          </div>
        </div>
      </div>

      {/* Frame Time Analysis */}
      <div className={tw`
        mb-0.5 pb-3
        [&:not(:last-child)]:border-b [&:not(:last-child)]:border-white/5
        last:mb-0 last:pb-0
      `}>
        <div className="flex justify-between items-center mb-2.5">
          <h4 className={tw`
            m-0 text-xs font-semibold text-gray-400
            uppercase tracking-wide
          `}>Frame Timing (ms)</h4>
          <div className="flex-shrink-0 border border-white/10 rounded bg-black/30">
            <SparklineChart 
              data={frameTimeData} 
              width={60} 
              height={20}
              color="#2196F3"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className={tw`
            flex justify-between items-center text-xs
            font-mono text-gray-300 min-h-4 leading-[1.2]
          `}>
            <span className="text-gray-400 flex-1 text-left font-medium">Frame Time</span>
            <span className="font-bold text-green-500 text-right min-w-10 mr-1">
              {latestData?.frameTime?.toFixed(2) || '0.00'} ms
            </span>
          </div>
          {latestData?.updateTime && (
            <div className={tw`
              flex justify-between items-center text-xs
              font-mono text-gray-300 min-h-4 leading-[1.2]
            `}>
              <span className="text-gray-400 flex-1 text-left font-medium">Update</span>
              <span className="font-bold text-green-500 text-right min-w-10 mr-1">
                {latestData.updateTime.toFixed(2)} ms
              </span>
            </div>
          )}
          {latestData?.renderTime && (
            <div className={tw`
              flex justify-between items-center text-xs
              font-mono text-gray-300 min-h-4 leading-[1.2]
            `}>
              <span className="text-gray-400 flex-1 text-left font-medium">Render</span>
              <span className="font-bold text-green-500 text-right min-w-10 mr-1">
                {latestData.renderTime.toFixed(2)} ms
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Memory Usage */}
      {latestData?.memory && (
        <div className={tw`
          mb-0.5 pb-3
          [&:not(:last-child)]:border-b [&:not(:last-child)]:border-white/5
          last:mb-0 last:pb-0
        `}>
          <div className="flex justify-between items-center mb-2.5">
            <h4 className={tw`
              m-0 text-xs font-semibold text-gray-400
              uppercase tracking-wide
            `}>Memory Usage</h4>
            <div className="flex-shrink-0 border border-white/10 rounded bg-black/30">
              <SparklineChart 
                data={memoryData} 
                width={60} 
                height={20}
                color="#FF9800"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className={tw`
              flex justify-between items-center text-xs
              font-mono text-gray-300 min-h-4 leading-[1.2]
            `}>
              <span className="text-gray-400 flex-1 text-left font-medium">Used</span>
              <span className="font-bold text-green-500 text-right min-w-10 mr-1">
                {formatMemory(latestData.memory.used)}
              </span>
            </div>
            <div className={tw`
              flex justify-between items-center text-xs
              font-mono text-gray-300 min-h-4 leading-[1.2]
            `}>
              <span className="text-gray-400 flex-1 text-left font-medium">Total</span>
              <span className="font-bold text-green-500 text-right min-w-10 mr-1">
                {formatMemory(latestData.memory.total)}
              </span>
            </div>
            <div className={tw`
              flex justify-between items-center text-xs
              font-mono text-gray-300 min-h-4 leading-[1.2]
            `}>
              <span className="text-gray-400 flex-1 text-left font-medium">Usage</span>
              <span className="font-bold text-green-500 text-right min-w-10 mr-1">
                {((latestData.memory.used / latestData.memory.total) * 100).toFixed(1)}%
              </span>
            </div>
            {latestData.memory.textureMemory && (
              <div className={tw`
                flex justify-between items-center text-xs
                font-mono text-gray-300 min-h-4 leading-[1.2]
              `}>
                <span className="text-gray-400 flex-1 text-left font-medium">Textures</span>
                <span className="font-bold text-green-500 text-right min-w-10 mr-1">
                  {formatMemory(latestData.memory.textureMemory)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rendering Statistics */}
      {latestData?.rendering && (
        <div className={tw`
          mb-0.5 pb-3
          [&:not(:last-child)]:border-b [&:not(:last-child)]:border-white/5
          last:mb-0 last:pb-0
        `}>
          <div className="flex justify-between items-center mb-2.5">
            <h4 className={tw`
              m-0 text-xs font-semibold text-gray-400
              uppercase tracking-wide
            `}>Rendering</h4>
          </div>
          <div className="flex flex-col gap-1">
            <div className={tw`
              flex justify-between items-center text-xs
              font-mono text-gray-300 min-h-4 leading-[1.2]
            `}>
              <span className="text-gray-400 flex-1 text-left font-medium">Draw Calls</span>
              <span className="font-bold text-green-500 text-right min-w-10 mr-1">
                {latestData.rendering.drawCalls}
              </span>
            </div>
            <div className={tw`
              flex justify-between items-center text-xs
              font-mono text-gray-300 min-h-4 leading-[1.2]
            `}>
              <span className="text-gray-400 flex-1 text-left font-medium">Game Objects</span>
              <span className="font-bold text-green-500 text-right min-w-10 mr-1">
                {latestData.rendering.gameObjects}
              </span>
            </div>
            <div className={tw`
              flex justify-between items-center text-xs
              font-mono text-gray-300 min-h-4 leading-[1.2]
            `}>
              <span className="text-gray-400 flex-1 text-left font-medium">Physics Bodies</span>
              <span className="font-bold text-green-500 text-right min-w-10 mr-1">
                {latestData.rendering.physicsBodies}
              </span>
            </div>
            <div className={tw`
              flex justify-between items-center text-xs
              font-mono text-gray-300 min-h-4 leading-[1.2]
            `}>
              <span className="text-gray-400 flex-1 text-left font-medium">Active Tweens</span>
              <span className="font-bold text-green-500 text-right min-w-10 mr-1">
                {latestData.rendering.activeTweens}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Jank Detection */}
      <div className={tw`
        mb-0.5 pb-3
        [&:not(:last-child)]:border-b [&:not(:last-child)]:border-white/5
        last:mb-0 last:pb-0
      `}>
        <div className="flex justify-between items-center mb-2.5">
          <h4 className={tw`
            m-0 text-xs font-semibold text-gray-400
            uppercase tracking-wide
          `}>Performance Quality</h4>
        </div>
        <div className="flex flex-col gap-1">
          <div className={tw`
            flex justify-between items-center text-xs
            font-mono text-gray-300 min-h-4 leading-[1.2]
          `}>
            <span className="text-gray-400 flex-1 text-left font-medium">Current Frame</span>
            <span className={cn(
              'font-bold text-right min-w-10 mr-1',
              latestData?.isJank ? 'text-red-500' : 'text-green-500'
            )}>
              {latestData?.isJank ? 'Jank Detected' : 'Smooth'}
            </span>
          </div>
          <div className={tw`
            flex justify-between items-center text-xs
            font-mono text-gray-300 min-h-4 leading-[1.2]
          `}>
            <span className="text-gray-400 flex-1 text-left font-medium">Jank Frames (last 60s)</span>
            <span className="font-bold text-green-500 text-right min-w-10 mr-1">
              {jankFrameCount}
            </span>
          </div>
          <div className={tw`
            flex justify-between items-center text-xs
            font-mono text-gray-300 min-h-4 leading-[1.2]
          `}>
            <span className="text-gray-400 flex-1 text-left font-medium">Data Points</span>
            <span className="font-bold text-green-500 text-right min-w-10 mr-1">
              {performance.data.length}
            </span>
          </div>
        </div>
      </div>

      {/* Data Source Info */}
      <div className={tw`
        mt-4 pt-3 border-t border-white/5
        flex flex-col gap-2
      `}>
        <div className="flex gap-1 text-xs font-mono text-gray-400">
          <div className="text-gray-600">
            Data Source: 
          </div>
          <div className="text-gray-400 font-medium">
            {performance.tier === 'plugin' 
              ? 'Phaser Performance Plugin' 
              : 'RAF-based Iframe Monitoring'
            }
          </div>
        </div>
        <div className="flex justify-center">
          <div className={cn(
            'px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide',
            performance.isMonitoring
              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
              : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
          )}>
            {performance.isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
          </div>
        </div>
      </div>
    </div>
  )
}


