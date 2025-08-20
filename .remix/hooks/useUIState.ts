import { useCallback, useEffect } from 'react'
import { useDashboard } from '../contexts'

type PanelType = 'buildPanel' | 'statusPanel' | 'settingsPanel' | 'performancePanel' | 'qrPanel'

export function useUIState() {
  const { state, dispatch } = useDashboard()

  const togglePanel = useCallback((panel: PanelType, visible?: boolean) => {
    // Map panel type to UI state property name
    const panelMap: Record<PanelType, keyof typeof state.ui> = {
      'buildPanel': 'showBuildPanel',
      'statusPanel': 'showStatusPanel', 
      'settingsPanel': 'showSettingsPanel',
      'performancePanel': 'showPerformancePanel',
      'qrPanel': 'showQrPanel'
    }
    
    const panelProperty = panelMap[panel]
    const newVisible = visible !== undefined ? visible : !state.ui[panelProperty]
    
    // Close other panels when opening a new one (mutual exclusivity)
    // Build panel and performance panel are independent
    if (newVisible) {
      if (panel === 'statusPanel' || panel === 'settingsPanel' || panel === 'qrPanel') {
        // Status, Settings, and QR panels are mutually exclusive
        const mutuallyExclusivePanels: PanelType[] = ['statusPanel', 'settingsPanel', 'qrPanel']
        mutuallyExclusivePanels.forEach(p => {
          if (p !== panel) {
            dispatch({
              type: 'UI_TOGGLE_PANEL',
              payload: { panel: panelMap[p], visible: false }
            })
          }
        })
      }
      // Build panel and performance panel don't close others
    }
    
    console.log('togglePanel dispatching:', { panel, panelProperty, newVisible })
    dispatch({
      type: 'UI_TOGGLE_PANEL',
      payload: { 
        panel: panelProperty, 
        visible: newVisible 
      }
    })
  }, [state.ui, dispatch])

  const closeAllPanels = useCallback(() => {
    const panelMap: Record<PanelType, keyof typeof state.ui> = {
      'buildPanel': 'showBuildPanel',
      'statusPanel': 'showStatusPanel', 
      'settingsPanel': 'showSettingsPanel',
      'performancePanel': 'showPerformancePanel',
      'qrPanel': 'showQrPanel'
    }
    
    const panels: PanelType[] = ['buildPanel', 'statusPanel', 'settingsPanel', 'performancePanel', 'qrPanel']
    panels.forEach(panel => {
      dispatch({
        type: 'UI_TOGGLE_PANEL',
        payload: { 
          panel: panelMap[panel], 
          visible: false 
        }
      })
    })
  }, [dispatch])

  const setMiniMode = useCallback((isMini: boolean) => {
    dispatch({
      type: 'UI_SET_MINI_MODE',
      payload: isMini
    })
  }, [dispatch])

  // Handle outside clicks to close panels (except build panel which is controlled only by its button)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      
      // Check if click is outside panel containers (excluding build panel and its button)
      const panelSelectors = [
        '.status-panel', 
        '.settings-panel',
        '.performance-panel',
        '.mobile-qr-status',
        '.settings-btn',
        '.settings-status',
        '.publishable-status',
        '.performance-chart'
      ]
      
      const isInsidePanel = panelSelectors.some(selector => {
        const element = document.querySelector(selector)
        return element && element.contains(target)
      })
      
      if (!isInsidePanel) {
        // Close mutually exclusive panels (not build panel which is controlled only by its button)
        const panelsToClose: (keyof typeof state.ui)[] = ['showStatusPanel', 'showSettingsPanel', 'showPerformancePanel', 'showQrPanel']
        panelsToClose.forEach(panel => {
          dispatch({
            type: 'UI_TOGGLE_PANEL',
            payload: { panel, visible: false }
          })
        })
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [dispatch])

  // Handle escape key to close panels (except build panel)
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Close mutually exclusive panels (not build panel)
        const panelsToClose: (keyof typeof state.ui)[] = ['showStatusPanel', 'showSettingsPanel', 'showPerformancePanel', 'showQrPanel']
        panelsToClose.forEach(panel => {
          dispatch({
            type: 'UI_TOGGLE_PANEL',
            payload: { panel, visible: false }
          })
        })
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [dispatch])

  return {
    ui: state.ui,
    togglePanel,
    closeAllPanels,
    setMiniMode,
    
    // Convenience methods for specific panels
    toggleBuildPanel: (visible?: boolean) => togglePanel('buildPanel', visible),
    toggleStatusPanel: (visible?: boolean) => togglePanel('statusPanel', visible),
    toggleSettingsPanel: (visible?: boolean) => togglePanel('settingsPanel', visible),
    togglePerformancePanel: (visible?: boolean) => togglePanel('performancePanel', visible),
    toggleQrPanel: (visible?: boolean) => togglePanel('qrPanel', visible),
    
    // State shortcuts
    isBuildPanelOpen: state.ui.showBuildPanel,
    isStatusPanelOpen: state.ui.showStatusPanel,
    isSettingsPanelOpen: state.ui.showSettingsPanel,
    isPerformancePanelOpen: state.ui.showPerformancePanel,
    isQrPanelOpen: state.ui.showQrPanel,
    isMiniMode: state.ui.isMiniMode
  }
}