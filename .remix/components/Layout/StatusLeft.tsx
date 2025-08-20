import React from 'react'
import { useDashboard } from '../../contexts'
import { useUIState } from '../../hooks'

export const StatusLeft: React.FC = () => {
  const { state } = useDashboard()
  const { toggleStatusPanel, isStatusPanelOpen } = useUIState()

  // Get light status for each SDK event
  const getLightClass = (flag: boolean) => {
    return `status-light-mini ${flag ? 'green' : 'red'}`
  }

  return (
    <div className="status-left">
      <div className="publishable-status" onClick={() => {
        console.log('SDK status clicked! Current state:', isStatusPanelOpen)
        toggleStatusPanel()
        console.log('toggleStatusPanel called')
      }}>
        <div className="status-light-grid">
          <div className={getLightClass(state.sdk.flags.ready)}></div>
          <div className={getLightClass(state.sdk.flags.gameOver)}></div>
          <div className={getLightClass(state.sdk.flags.playAgain)}></div>
          <div className={getLightClass(state.sdk.flags.toggleMute)}></div>
        </div>
        <span>Remix SDK integration</span>
      </div>
      
      {isStatusPanelOpen && (
        <div className="status-panel show">
          <div className="status-item">
            <div className={`event-light ${state.sdk.flags.ready ? 'green' : 'red'}`}></div>
            <span>ready</span>
          </div>
          <div className="status-item">
            <div className={`event-light ${state.sdk.flags.gameOver ? 'green' : 'red'}`}></div>
            <span>game_over</span>
          </div>
          <div className="status-item">
            <div className={`event-light ${state.sdk.flags.playAgain ? 'green' : 'red'}`}></div>
            <span>play_again</span>
          </div>
          <div className="status-item">
            <div className={`event-light ${state.sdk.flags.toggleMute ? 'green' : 'red'}`}></div>
            <span>toggle_mute</span>
          </div>
        </div>
      )}
    </div>
  )
}