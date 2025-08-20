import React from 'react'
import { useDashboard } from '../../contexts'
import { sendRemixCommand } from '../../utils'
import { TopNavBarWrapper, NavLeft, NavButton, NavIcon, NavMuteButton } from './TopNavBar.styled'

interface TopNavBarProps {
  // Props can be added as needed
}

export const TopNavBar: React.FC<TopNavBarProps> = () => {
  const { state, dispatch } = useDashboard()

  const handleMuteToggle = () => {
    const newMutedState = !state.sdk.isMuted
    
    // First, send command to game to actually toggle mute
    sendRemixCommand('toggle_mute', { isMuted: newMutedState })

    // Update dashboard state
    dispatch({
      type: 'SDK_SET_MUTED',
      payload: newMutedState
    })

    // Trigger SDK event for dashboard
    dispatch({
      type: 'SDK_ADD_EVENT',
      payload: {
        type: 'toggle_mute',
        data: { isMuted: newMutedState },
        timestamp: Date.now()
      }
    })

    // Update SDK flags (should persist to show working integration)
    dispatch({
      type: 'SDK_UPDATE_FLAGS',
      payload: { toggleMute: true }
    })

    // Communicate with game iframe if SDK mock is available
    if (window.__remixSDKMock) {
      window.__remixSDKMock.triggerMute(newMutedState)
    }
  }

  return (
    <TopNavBarWrapper>
      <NavLeft>
        <NavButton 
          $disabled
          title="No previous screen in development mode"
          aria-label="Navigate back (disabled in development)"
          aria-disabled="true"
          disabled
        >
          <NavIcon 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20.79 33.27" 
            aria-hidden="true"
          >
            <path d="M16.87,0l3.92,3.92-12.94,12.72,12.94,12.71-3.92,3.92L0,16.64,16.87,0Z" />
          </NavIcon>
        </NavButton>
      </NavLeft>
      
      <NavMuteButton 
        type="button" 
        $isMuted={state.sdk.isMuted}
        onClick={handleMuteToggle}
        title={state.sdk.isMuted ? "Unmute audio" : "Mute audio"}
        aria-label={state.sdk.isMuted ? "Unmute audio" : "Mute audio"}
        aria-pressed={state.sdk.isMuted}
      >
        <NavIcon 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          aria-hidden="true"
        >
          {state.sdk.isMuted ? (
            // Muted icon - matches original .remix/ system
            <path d="M19 7.358v15.642l-8-5v-.785l8-9.857zm3-6.094l-1.548-1.264-3.446 4.247-6.006 3.753v3.646l-2 2.464v-6.11h-4v10h.843l-3.843 4.736 1.548 1.264 18.452-22.736z" />
          ) : (
            // Unmuted icon - matches original .remix/ system
            <path d="M6 7l8-5v20l-8-5v-10zm-6 10h4v-10h-4v10zm20.264-13.264l-1.497 1.497c1.847 1.783 2.983 4.157 2.983 6.767 0 2.61-1.135 4.984-2.983 6.766l1.498 1.498c2.305-2.153 3.735-5.055 3.735-8.264s-1.43-6.11-3.736-8.264zm-.489 8.264c0-2.084-.915-3.967-2.384-5.391l-1.503 1.503c1.011 1.049 1.637 2.401 1.637 3.888 0 1.488-.623 2.841-1.634 3.891l1.503 1.503c1.468-1.424 2.381-3.309 2.381-5.394z" />
          )}
        </NavIcon>
      </NavMuteButton>
    </TopNavBarWrapper>
  )
}

// Extend window type for SDK mock access
declare global {
  interface Window {
    __remixSDKMock?: {
      triggerMute(isMuted: boolean): void
    }
  }
}