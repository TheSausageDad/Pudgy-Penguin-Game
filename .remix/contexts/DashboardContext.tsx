import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { DashboardState, PerformanceData, BuildState, DevSettings, RemixDevFlags, SDKEvent } from '../types'

interface DashboardAction {
  type: string
  payload?: any
}

interface DashboardContextType {
  state: DashboardState
  dispatch: React.Dispatch<DashboardAction>
}

const initialState: DashboardState = {
  performance: {
    data: [],
    stats: { current: 0, average: 0, min: 0, max: 0 },
    isMonitoring: false,
    tier: 'iframe'
  },
  
  build: {
    status: 'ready',
    lastBuildTime: 0,
    fileSize: 0,
    output: '',
    isBuilding: false
  },
  
  settings: {
    canvasGlow: true,
    backgroundPattern: true,
    fullSize: false,
    showPerformancePanel: false,
    showCabinetFrame: false
  },
  
  ui: {
    isMiniMode: false,
    showBuildPanel: false,
    showStatusPanel: false,
    showSettingsPanel: false,
    showPerformancePanel: false,
    showQrPanel: false
  },
  
  sdk: {
    flags: { ready: false, gameOver: false, playAgain: false, toggleMute: false },
    events: [],
    isMuted: false
  },
  
  game: {
    frameSize: { width: 390, height: 844 },
    isGameOver: false,
    score: 0
  }
}

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'PERFORMANCE_UPDATE':
      return {
        ...state,
        performance: {
          ...state.performance,
          data: action.payload.data,
          stats: action.payload.stats
        }
      }
    
    case 'PERFORMANCE_SET_MONITORING':
      return {
        ...state,
        performance: {
          ...state.performance,
          isMonitoring: action.payload
        }
      }
    
    case 'PERFORMANCE_SET_TIER':
      return {
        ...state,
        performance: {
          ...state.performance,
          tier: action.payload
        }
      }
    
    case 'PERFORMANCE_ADD_DATA_POINT':
      const { newData, maxDataPoints, calculateStats } = action.payload
      const currentData = state.performance.data
      const updatedData = [...currentData, newData]
      
      // Keep only last maxDataPoints
      const cutoffTime = newData.timestamp - (maxDataPoints * 1000)
      const filteredData = updatedData.filter((d: any) => d.timestamp > cutoffTime)
      
      const stats = calculateStats(filteredData)
      
      return {
        ...state,
        performance: {
          ...state.performance,
          data: filteredData,
          stats
        }
      }
    
    case 'BUILD_UPDATE_STATUS':
      return {
        ...state,
        build: {
          ...state.build,
          ...action.payload
        }
      }
    
    case 'SETTINGS_UPDATE':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      }
    
    case 'UI_TOGGLE_PANEL':
      return {
        ...state,
        ui: {
          ...state.ui,
          [action.payload.panel]: action.payload.visible
        }
      }
    
    case 'UI_SET_MINI_MODE':
      return {
        ...state,
        ui: {
          ...state.ui,
          isMiniMode: action.payload
        }
      }
    
    case 'SDK_UPDATE_FLAGS':
      return {
        ...state,
        sdk: {
          ...state.sdk,
          flags: {
            ...state.sdk.flags,
            ...action.payload
          }
        }
      }
    
    case 'SDK_ADD_EVENT':
      return {
        ...state,
        sdk: {
          ...state.sdk,
          events: [...state.sdk.events.slice(-99), action.payload] // Keep last 100 events
        }
      }
    
    case 'SDK_SET_MUTED':
      return {
        ...state,
        sdk: {
          ...state.sdk,
          isMuted: action.payload
        }
      }
    
    case 'GAME_UPDATE':
      return {
        ...state,
        game: {
          ...state.game,
          ...action.payload
        }
      }
    
    default:
      return state
  }
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState)
  
  return (
    <DashboardContext.Provider value={{ state, dispatch }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}