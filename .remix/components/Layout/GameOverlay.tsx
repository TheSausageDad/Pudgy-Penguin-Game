import React from 'react'
import { useDashboard } from '../../contexts'
import { sendRemixCommand } from '../../utils'
import {
  GameOverlayWrapper,
  OverlayContent,
  OverlayScore,
  OverlayTitle,
  OverlayButtonContainer,
  PlayAgainButton,
  PlayIcon
} from '../Game/GameOverlay.styled'

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
    <GameOverlayWrapper
      $show={true}
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="overlay-title"
    >
      <OverlayContent>
        <OverlayScore>{state.game.score}</OverlayScore>
        <OverlayTitle id="overlay-title">GAME OVER</OverlayTitle>
      </OverlayContent>
      <OverlayButtonContainer>
        <PlayAgainButton onClick={handlePlayAgain}>
          <PlayIcon
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 61.09 67.69" 
            fill="currentColor"
          >
            <path d="M56.43,41.91l-42.46,24.51c-6.21,3.59-13.97-.9-13.97-8.07V9.33C0,2.16,7.76-2.32,13.97,1.26l42.46,24.51c6.21,3.59,6.21,12.55,0,16.13Z" />
          </PlayIcon>
          <span>Play Again</span>
        </PlayAgainButton>
      </OverlayButtonContainer>
    </GameOverlayWrapper>
  )
}

declare global {
  interface Window {
    __remixSDKMock?: {
      triggerPlayAgain(): void
    }
  }
}