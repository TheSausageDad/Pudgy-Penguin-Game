import React from 'react'
import { PerformanceChart } from './PerformanceChart'
import { StatusLeft } from './StatusLeft'
import { StatusRight } from './StatusRight'

export const StatusBar: React.FC = () => {
  return (
    <div className="dev-status-bar">
      <StatusLeft />
      
      <div className="status-center">
        <PerformanceChart />
      </div>
      
      <div className="status-right">
        <StatusRight />
      </div>
    </div>
  )
}