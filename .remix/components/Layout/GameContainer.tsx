import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useDashboard } from '../../contexts'
import { usePerformanceMonitor, useUnderglow } from '../../hooks'
import { TopNavBar } from './TopNavBar'
import { GameOverlay } from './GameOverlay'
import { GameContainerWrapper, GameFrame } from './GameContainer.styled'

interface GameContainerProps {
  // Props can be added as needed
}

export const GameContainer: React.FC<GameContainerProps> = () => {
  const { state, dispatch } = useDashboard()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const gameFrameRef = useRef<HTMLDivElement>(null)
  const [frameSize, setFrameSize] = useState({ width: 390, height: 844 })

  // Initialize performance monitoring
  const { startMonitoring } = usePerformanceMonitor({ 
    iframe: iframeRef.current,
    updateInterval: 1000,
    maxDataPoints: 60
  })

  // Initialize underglow effect
  const { isEnabled: underglowEnabled, isSupported: underglowSupported, toggle: toggleUnderglow } = useUnderglow(gameFrameRef)

  // Calculate game frame size based on UI mode
  const updateGameFrameSize = useCallback(() => {
    if (!gameFrameRef.current) return

    const isMini = state.ui.isMiniMode
    let newFrameSize: { width: number; height: number }

    if (isMini) {
      // Mini mode: use actual app size but respect screen boundaries
      const actualWidth = 393 // Real iPhone dimensions
      const actualHeight = 695
      const containerHeight = window.innerHeight - 90 // Reserve space for status bar
      const containerWidth = window.innerWidth - 20 // Account for padding
      
      // Check if actual size fits within screen
      if (actualWidth <= containerWidth && actualHeight <= containerHeight) {
        // Use actual size if it fits
        newFrameSize = { width: actualWidth, height: actualHeight }
      } else {
        // Scale down proportionally to fit while maintaining aspect ratio
        const scaleByWidth = containerWidth / actualWidth
        const scaleByHeight = containerHeight / actualHeight
        const scale = Math.min(scaleByWidth, scaleByHeight)
        
        newFrameSize = {
          width: Math.floor(actualWidth * scale),
          height: Math.floor(actualHeight * scale)
        }
      }
    } else {
      // Full mode: calculate responsive size
      const containerHeight = window.innerHeight - 90 // Reserve space for status bar
      const containerWidth = Math.min(window.innerWidth - 20, containerHeight * (9 / 16)) // 9:16 aspect ratio
      const calculatedHeight = containerWidth * (16 / 9)
      
      newFrameSize = {
        width: Math.min(containerWidth, containerHeight * (9 / 16)),
        height: Math.min(calculatedHeight, containerHeight)
      }
    }

    setFrameSize(newFrameSize)

    // Update global state
    dispatch({
      type: 'GAME_UPDATE',
      payload: { frameSize: newFrameSize }
    })
  }, [state.ui.isMiniMode, dispatch])

  // Handle iframe load event
  const handleIframeLoad = useCallback(() => {
    if (iframeRef.current) {
      startMonitoring()
    }
  }, [startMonitoring])

  // Set up global message listener for SDK events (outside of iframe load)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      
      // Check if message is from our game iframe
      if (event.source === iframeRef.current?.contentWindow) {
        // Handle SDK events
        if (event.data?.type === 'remix_sdk_event') {
          const { event: sdkEvent } = event.data
          
          // Add event to dashboard state
          dispatch({
            type: 'SDK_ADD_EVENT',
            payload: {
              type: sdkEvent.type,
              data: sdkEvent.data,
              timestamp: Date.now()
            }
          })

          // Update SDK flags based on event type (flags should persist to show working SDK integration)
          const flagUpdates: Record<string, boolean> = {}
          switch (sdkEvent.type) {
            case 'ready':
              flagUpdates.ready = true
              break
            case 'game_over':
              flagUpdates.gameOver = true
              const gameOverScore = sdkEvent.data?.score || sdkEvent.data?.finalScore || 0
              dispatch({
                type: 'GAME_UPDATE',
                payload: { 
                  isGameOver: true,
                  score: gameOverScore
                }
              })
              break
            case 'play_again':
              flagUpdates.playAgain = true
              dispatch({
                type: 'GAME_UPDATE',
                payload: { isGameOver: false, score: 0 }
              })
              break
            case 'toggle_mute':
              flagUpdates.toggleMute = true
              break
          }

          if (Object.keys(flagUpdates).length > 0) {
            dispatch({
              type: 'SDK_UPDATE_FLAGS',
              payload: flagUpdates
            })
          }
        }
        
        // Handle performance data
        else if (event.data?.type === 'remix_performance_data') {
          // This will be handled by the performance monitor
        }
      }
    }

    window.addEventListener('message', handleMessage)
    
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [dispatch])

  // Update size on mount and window resize
  useEffect(() => {
    updateGameFrameSize()
    
    const handleResize = () => updateGameFrameSize()
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [updateGameFrameSize])

  // Update size when mini mode changes
  useEffect(() => {
    updateGameFrameSize()
  }, [state.ui.isMiniMode, updateGameFrameSize])

  // Keyboard toggle support (1:1 from original)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'u') {
        toggleUnderglow()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggleUnderglow])

  // Development helper: Add manual testing functions (only in development)
  useEffect(() => {
    if (import.meta.env.DEV) {
      // Add global helper functions for manual testing
      window.testSDKEvent = (eventType: string, data?: any) => {
        
        // Simulate a message from the game iframe
        if (iframeRef.current?.contentWindow) {
          window.postMessage({
            type: 'remix_sdk_event',
            event: {
              type: eventType,
              data: data || {}
            }
          }, window.location.origin)
        }
      }
      
      window.resetSDKFlags = () => {
        dispatch({
          type: 'SDK_UPDATE_FLAGS',
          payload: { ready: false, gameOver: false, playAgain: false, toggleMute: false }
        })
      }
      
      return () => {
        delete window.testSDKEvent
        delete window.resetSDKFlags
      }
    }
  }, [dispatch])

  return (
    <GameContainerWrapper>
      <GameFrame 
        ref={gameFrameRef}
        $width={frameSize.width}
        $height={frameSize.height}
        role="application"
        aria-label="Game container"
      >
        <TopNavBar />
        
        <iframe
          ref={iframeRef}
          id="game-iframe"
          src="/"
          title="Interactive game content"
          aria-label="Game preview frame"
          onLoad={handleIframeLoad}
          sandbox="allow-scripts allow-forms allow-pointer-lock allow-same-origin allow-top-navigation-by-user-activation"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            zIndex: 2,
            border: 'none'
          }}
        />
        
        <GameOverlay />
      </GameFrame>
    </GameContainerWrapper>
  )
}

// TypeScript declaration for development helpers
declare global {
  interface Window {
    testSDKEvent?: (eventType: string, data?: any) => void
    resetSDKFlags?: () => void
  }
}