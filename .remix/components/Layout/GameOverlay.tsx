import React from 'react'
import { useDashboard } from '../../contexts'
import { sendRemixCommand } from '../../utils'
import { tw } from '../../utils/tw'

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
  }


  if (!state.game.isGameOver) {
    return null
  }

  return (
    <div
      className={tw`
        absolute inset-0 flex flex-col items-center justify-center
        bg-black/50 backdrop-blur-sm opacity-100 pointer-events-auto
        transition-opacity duration-200 z-[3]
      `}
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="overlay-title"
    >
      <div className={tw`
        text-center relative flex-grow flex flex-col
        justify-center w-full
      `}>
        <div className={tw`
          text-white font-extrabold uppercase mb-3 leading-none
          tracking-tight text-[clamp(48px,18cqw,144px)]
        `}>
          {state.game.score}
        </div>
        <div 
          id="overlay-title"
          className={tw`
            text-white font-semibold uppercase leading-none
            tracking-tight text-[clamp(24px,9cqw,56px)]
          `}
        >
          GAME OVER
        </div>
      </div>
      <div className={tw`
        flex flex-col justify-end mt-4 p-6 w-full
      `}>
        <button 
          onClick={handlePlayAgain}
          className={tw`
            flex items-center justify-center gap-2 bg-[#b7ff00] text-black
            border-0 rounded-md px-4 py-3 mx-4 h-[42px] text-sm font-semibold
            cursor-pointer transition-all duration-200 outline-none
            select-none hover:bg-[#a7f200] active:bg-[#95df00]
            focus-visible:ring-[3px] focus-visible:ring-[#b7ff00]/50
          `}
        >
          <svg
            className="w-4 h-4 flex-shrink-0 fill-current"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 61.09 67.69" 
            fill="currentColor"
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