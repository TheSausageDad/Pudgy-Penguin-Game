import React, { useState, useEffect } from 'react'
import { useDashboard } from '../../contexts'
import { cn, tw } from '../../utils/tw'

interface GameStatePanelProps {
  isOpen: boolean
}

export const GameStatePanel: React.FC<GameStatePanelProps> = ({ isOpen }) => {
  const { state } = useDashboard()
  const [gameState, setGameState] = useState<any>(null)

  // Listen for game state updates from multiplayer games
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'multiplayer_game_state_broadcast') {
        // The gameState has {id, data} structure
        setGameState(event.data.gameState?.data || event.data.gameState)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Also check SDK events for game state updates
  useEffect(() => {
    const gameStateEvents = state.sdk.events.filter(event => 
      event.type === 'game_state_updated'
    )
    const latestGameState = gameStateEvents[gameStateEvents.length - 1]
    if (latestGameState) {
      setGameState(latestGameState.data)
    }
  }, [state.sdk.events])

  return (
    <div 
      className={tw`
        fixed top-0 right-0 w-96 h-[calc(100%-70px)]
        bg-bg-secondary border-l border-border-default
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        transition-transform duration-300 ease-in-out
        flex flex-col overflow-hidden z-[100]
        md:w-96 max-md:w-full
      `}
      role="region"
      aria-label="Game state panel"
      aria-expanded={isOpen}
    >
      <div className={tw`
        flex-1 p-6 overflow-hidden
        flex flex-col gap-6 min-h-0
      `}>
        {/* Panel Header */}
        <div className="flex items-center justify-between w-full flex-shrink-0">
          <h3 className="text-white text-lg font-semibold m-0">Game State</h3>
          <div className={tw`flex items-center gap-2`}>
            {gameState && (
              <span className={tw`
                text-xs bg-green-500 text-white px-2 py-1 rounded-full
                font-medium
              `}>
                LIVE
              </span>
            )}
          </div>
        </div>
        
        {/* Content Area */}
        <div className={tw`
          flex-1 overflow-hidden flex flex-col min-h-0
        `}>
          <div className={tw`
            flex-1 overflow-auto
            font-mono text-xs leading-relaxed
          `}>
            {gameState ? (
              <div className={tw`
                border border-border-default rounded-md overflow-hidden
                flex-1 flex flex-col relative min-h-0 bg-bg-primary
              `}>
                <pre className={tw`
                  font-mono text-xs leading-[1.5] p-4 m-0
                  text-gray-300 bg-transparent whitespace-pre-wrap
                  break-all overflow-y-auto overflow-x-auto
                  h-full box-border
                `}>
                  {JSON.stringify(gameState, null, 2)}
                </pre>
              </div>
            ) : (
              <div className={tw`
                flex flex-col items-center justify-center h-full
                text-text-muted text-center
              `}>
                <div className={tw`
                  w-12 h-12 rounded-full bg-bg-tertiary border border-border-default
                  flex items-center justify-center mb-3
                `}>
                  <svg 
                    className="w-6 h-6" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                </div>
                <p className={tw`text-sm mb-1`}>No Game State</p>
                <p className={tw`text-xs text-text-muted max-w-[200px]`}>
                  Game state will appear here when multiplayer games update their state
                </p>
              </div>
            )}
          </div>
          
          {gameState && (
            <div className={tw`
              text-xs text-gray-400 text-center flex-shrink-0
            `}>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}