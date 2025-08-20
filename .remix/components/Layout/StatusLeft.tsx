import React from 'react'
import { useDashboard } from '../../contexts'
import { useUIState } from '../../hooks'
import { StatusIndicator } from '../Common'
import { 
  StatusLeftWrapper,
  PublishableStatus,
  StatusLightGrid
} from './StatusBar.styled'
import { StatusPanel } from './StatusLeft.styled'

const StatusLeftComponent: React.FC = () => {
  const { state } = useDashboard()
  const { toggleStatusPanel, isStatusPanelOpen } = useUIState()

  return (
    <StatusLeftWrapper>
      <PublishableStatus
        as="button"
        className="publishable-status"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
          toggleStatusPanel()
        }}
        aria-label="Toggle SDK status panel"
        aria-expanded={isStatusPanelOpen}
        aria-controls="sdk-status-panel"
      >
        <StatusLightGrid aria-hidden="true">
          <StatusIndicator status={state.sdk.flags.ready} size="mini" />
          <StatusIndicator status={state.sdk.flags.gameOver} size="mini" />
          <StatusIndicator status={state.sdk.flags.playAgain} size="mini" />
          <StatusIndicator status={state.sdk.flags.toggleMute} size="mini" />
        </StatusLightGrid>
        <span>Remix SDK integration</span>
      </PublishableStatus>
      
      <StatusPanel
        id="sdk-status-panel"
        className="status-panel"
        $isOpen={isStatusPanelOpen}
        data-open={isStatusPanelOpen.toString()}
        role="region"
        aria-label="SDK integration status details"
      >
        <StatusIndicator status={state.sdk.flags.ready} label="ready" />
        <StatusIndicator status={state.sdk.flags.gameOver} label="game_over" />
        <StatusIndicator status={state.sdk.flags.playAgain} label="play_again" />
        <StatusIndicator status={state.sdk.flags.toggleMute} label="toggle_mute" />
      </StatusPanel>
    </StatusLeftWrapper>
  )
}

export const StatusLeft = React.memo(StatusLeftComponent)