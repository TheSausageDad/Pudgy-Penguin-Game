import React from 'react'
import { PerformanceChart } from './PerformanceChart'
import { StatusLeft } from './StatusLeft'
import { StatusRight } from './StatusRight'
import { StatusBarWrapper, StatusCenter } from './StatusBar.styled'
import { StatusRightWrapper } from './StatusRight.styled'

export const StatusBar: React.FC = () => {
  return (
    <StatusBarWrapper>
      <StatusLeft />
      
      <StatusCenter>
        <PerformanceChart />
      </StatusCenter>
      
      <StatusRightWrapper>
        <StatusRight />
      </StatusRightWrapper>
    </StatusBarWrapper>
  )
}