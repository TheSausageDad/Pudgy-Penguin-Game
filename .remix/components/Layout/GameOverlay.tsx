import React from 'react'
import { useDashboard } from '../../contexts'
import { sendRemixCommand } from '../../utils'

export const GameOverlay: React.FC = () => {
  const { state, dispatch } = useDashboard()

  const handlePlayAgain = () => {
    // First, send command to game to actually restart it
    sendRemixCommand('play_again')

    // Then update our dashboard state
    dispatch({
      type: 'SDK_ADD_EVENT',
      payload: {
        type: 'play_again',
        data: {},
        timestamp: Date.now()
      }
    })

    // Update SDK flags
    dispatch({
      type: 'SDK_UPDATE_FLAGS',
      payload: { playAgain: true }
    })

    // Reset game state (hide overlay)
    dispatch({
      type: 'GAME_UPDATE',
      payload: { isGameOver: false, score: 0 }
    })

    // Communicate with game iframe if SDK mock is available
    if (window.__remixSDKMock) {
      window.__remixSDKMock.triggerPlayAgain()
    }

    console.log('✅ Play Again: Command sent to game, dashboard state updated')
  }

  // Debug logging for game over state
  React.useEffect(() => {
    console.log('🔄 GameOverlay state update:', {
      isGameOver: state.game.isGameOver,
      score: state.game.score
    })
  }, [state.game.isGameOver, state.game.score])

  if (!state.game.isGameOver) {
    console.log('❌ GameOverlay hidden - isGameOver =', state.game.isGameOver)
    return null
  }

  console.log('✅ GameOverlay showing - isGameOver =', state.game.isGameOver, 'score =', state.game.score)

  return (
    <div 
      className="game-overlay show" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="overlay-title"
    >
      <div className="overlay-content">
        <div className="overlay-score">{state.game.score}</div>
        <div id="overlay-title" className="overlay-title">GAME OVER</div>
      </div>
      <div className="overlay-button-container">
        <button 
          className="play-again-btn"
          onClick={handlePlayAgain}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 61.09 67.69" 
            fill="currentColor" 
            className="play-icon"
          >
            <path d="M56.43,41.91l-42.46,24.51c-6.21,3.59-13.97-.9-13.97-8.07V9.33C0,2.16,7.76-2.32,13.97,1.26l42.46,24.51c6.21,3.59,6.21,12.55,0,16.13Z" />
          </svg>
          <span>Play Again</span>
        </button>
      </div>
    </div>
  )
}

declare global {
  interface Window {
    __remixSDKMock?: {
      triggerPlayAgain(): void
    }
  }
}