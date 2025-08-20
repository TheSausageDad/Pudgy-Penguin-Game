import React from 'react'
import { StatusItem, EventLight, StatusLightMini } from './StatusIndicator.styled'

interface StatusIndicatorProps {
  status: boolean
  size?: 'mini' | 'normal'
  label?: string
  className?: string
}

const StatusIndicatorComponent: React.FC<StatusIndicatorProps> = ({ 
  status, 
  size = 'normal', 
  label,
  className = '' 
}) => {
  const LightComponent = size === 'mini' ? StatusLightMini : EventLight

  if (label) {
    return (
      <StatusItem className={className}>
        <LightComponent
          $status={status}
          role="status"
          aria-label={`Status: ${status ? 'active' : 'inactive'} for ${label}`}
        />
        <span>{label}</span>
      </StatusItem>
    )
  }

  return (
    <LightComponent
      $status={status}
      className={className}
      role="status"
      aria-label={`Status: ${status ? 'active' : 'inactive'}`}
    />
  )
}

export const StatusIndicator = React.memo(StatusIndicatorComponent)