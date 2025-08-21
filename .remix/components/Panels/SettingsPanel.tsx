import React, { useRef } from 'react'
import { useDevSettings, useUIState, useOutsideClick } from '../../hooks'
import { cn, tw } from '../../utils/tw'

export const SettingsPanel: React.FC = () => {
  const { 
    settings, 
    updateSetting, 
    resetToDefaults,
    capabilities,
    isSupported
  } = useDevSettings()
  
  const { showSettingsPanel, toggleSettingsPanel } = useUIState()
  const panelRef = useRef<HTMLDivElement>(null)

  // Close panel when clicking outside or pressing escape
  useOutsideClick(panelRef, toggleSettingsPanel, showSettingsPanel)

  const handleToggleSetting = (key: keyof typeof settings) => {
    updateSetting(key, !settings[key])
  }

  if (!showSettingsPanel) {
    return null
  }

  return (
    <div ref={panelRef} className={tw`
      absolute bottom-full right-0 mb-2
      bg-zinc-800 border border-white/10 rounded-lg
      p-3 min-w-[200px]
      ${showSettingsPanel ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2.5 pointer-events-none'}
      transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.3)]
      select-none z-[500]
    `}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="m-0 text-white text-base font-semibold">Dashboard Settings</h3>
        <button 
          onClick={toggleSettingsPanel}
          title="Close settings panel"
          className={tw`
            bg-transparent border-none text-gray-400
            cursor-pointer p-1 rounded transition-all duration-200
            flex items-center justify-center
            hover:bg-white/10 hover:text-white
          `}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
          </svg>
        </button>
      </div>

      {/* Device Information */}
      <div className={tw`
        flex flex-col gap-2 py-2 text-sm font-mono
        [&:not(:last-child)]:border-b [&:not(:last-child)]:border-white/10
        [&:not(:last-child)]:mb-2 [&:not(:last-child)]:pb-4
      `}>
        <div className={tw`
          text-gray-400 text-xs font-semibold
          uppercase tracking-wide mb-2
        `}>Device Information</div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Browser:</span>
            <span className="text-gray-300 font-semibold">
              {capabilities.isSafari ? 'Safari' : 'Chrome/Firefox/Edge'}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Device Type:</span>
            <span className="text-gray-300 font-semibold">
              {capabilities.isMobileDevice ? 'Mobile/Touch' : 'Desktop'}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Underglow Support:</span>
            <span className={cn(
              'font-semibold',
              capabilities.supportsUnderglow ? 'text-green-500' : 'text-red-500'
            )}>
              {capabilities.supportsUnderglow ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Effects Settings */}
      <div className={tw`
        flex flex-col gap-2 py-2 text-sm font-mono
        [&:not(:last-child)]:border-b [&:not(:last-child)]:border-white/10
        [&:not(:last-child)]:mb-2 [&:not(:last-child)]:pb-4
      `}>
        <div className={tw`
          text-gray-400 text-xs font-semibold
          uppercase tracking-wide mb-2
        `}>Visual Effects</div>
        
        {/* Canvas Glow Setting */}
        <div className="flex justify-between items-center gap-3 mb-3 last:mb-0">
          <div className="flex-1">
            <div className="text-gray-300 text-xs font-medium mb-0.5">Canvas Glow</div>
            <div className="text-gray-400 text-xs leading-[1.3]">
              Dynamic glow effect around game frame
              {!capabilities.supportsUnderglow && (
                <span className="text-red-500 font-medium">
                  {capabilities.isSafari ? ' (Disabled on Safari)' : ' (Disabled on mobile)'}
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <label className={tw`
              relative inline-block w-9 h-5 cursor-pointer
              ${!isSupported.canvasGlow ? 'cursor-not-allowed' : ''}
            `}>
              <input
                type="checkbox"
                checked={settings.canvasGlow}
                onChange={() => handleToggleSetting('canvasGlow')}
                disabled={!isSupported.canvasGlow}
                className="opacity-0 w-0 h-0"
              />
              <span className={cn(
                'absolute cursor-pointer top-0 left-0 right-0 bottom-0',
                'bg-zinc-700 border-2 border-zinc-600 rounded-xl',
                'transition-all duration-200',
                'before:content-[""] before:absolute before:top-0.5 before:left-0.5',
                'before:w-3 before:h-3 before:bg-white before:rounded-full',
                'before:transition-all before:duration-200',
                'before:shadow-[0_2px_4px_rgba(0,0,0,0.2)]',
                settings.canvasGlow ? [
                  'bg-green-500 border-green-500',
                  'before:translate-x-4 before:bg-black'
                ] : '',
                !isSupported.canvasGlow ? [
                  'opacity-50 cursor-not-allowed border-zinc-700',
                  'before:opacity-50'
                ] : ''
              )} />
            </label>
          </div>
        </div>

        {/* Background Pattern Setting */}
        <div className="flex justify-between items-center gap-3 mb-3 last:mb-0">
          <div className="flex-1">
            <div className="text-gray-300 text-xs font-medium mb-0.5">Background Pattern</div>
            <div className="text-gray-400 text-xs leading-[1.3]">
              Show subtle grid pattern behind game frame
            </div>
          </div>
          <div className="flex-shrink-0">
            <label className="relative inline-block w-9 h-5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.backgroundPattern}
                onChange={() => handleToggleSetting('backgroundPattern')}
                className="opacity-0 w-0 h-0"
              />
              <span className={cn(
                'absolute cursor-pointer top-0 left-0 right-0 bottom-0',
                'bg-zinc-700 border-2 border-zinc-600 rounded-xl',
                'transition-all duration-200',
                'before:content-[""] before:absolute before:top-0.5 before:left-0.5',
                'before:w-3 before:h-3 before:bg-white before:rounded-full',
                'before:transition-all before:duration-200',
                'before:shadow-[0_2px_4px_rgba(0,0,0,0.2)]',
                settings.backgroundPattern ? [
                  'bg-green-500 border-green-500',
                  'before:translate-x-4 before:bg-black'
                ] : ''
              )} />
            </label>
          </div>
        </div>

        {/* Full Size Setting */}
        <div className="flex justify-between items-center gap-3 mb-3 last:mb-0">
          <div className="flex-1">
            <div className="text-gray-300 text-xs font-medium mb-0.5">Full Size Mode</div>
            <div className="text-gray-400 text-xs leading-[1.3]">
              Scale game frame to fill available space
            </div>
          </div>
          <div className="flex-shrink-0">
            <label className="relative inline-block w-9 h-5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.fullSize}
                onChange={() => handleToggleSetting('fullSize')}
                className="opacity-0 w-0 h-0"
              />
              <span className={cn(
                'absolute cursor-pointer top-0 left-0 right-0 bottom-0',
                'bg-zinc-700 border-2 border-zinc-600 rounded-xl',
                'transition-all duration-200',
                'before:content-[""] before:absolute before:top-0.5 before:left-0.5',
                'before:w-3 before:h-3 before:bg-white before:rounded-full',
                'before:transition-all before:duration-200',
                'before:shadow-[0_2px_4px_rgba(0,0,0,0.2)]',
                settings.fullSize ? [
                  'bg-green-500 border-green-500',
                  'before:translate-x-4 before:bg-black'
                ] : ''
              )} />
            </label>
          </div>
        </div>
      </div>

      {/* Performance Settings */}
      <div className={tw`
        flex flex-col gap-2 py-2 text-sm font-mono
        [&:not(:last-child)]:border-b [&:not(:last-child)]:border-white/10
        [&:not(:last-child)]:mb-2 [&:not(:last-child)]:pb-4
      `}>
        <div className={tw`
          text-gray-400 text-xs font-semibold
          uppercase tracking-wide mb-2
        `}>Performance Monitoring</div>
        
        <div className="flex justify-between items-center gap-3 mb-3 last:mb-0">
          <div className="flex-1">
            <div className="text-gray-300 text-xs font-medium mb-0.5">Show Performance Panel</div>
            <div className="text-gray-400 text-xs leading-[1.3]">
              Display detailed performance metrics panel
            </div>
          </div>
          <div className="flex-shrink-0">
            <label className="relative inline-block w-9 h-5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showPerformancePanel}
                onChange={() => handleToggleSetting('showPerformancePanel')}
                className="opacity-0 w-0 h-0"
              />
              <span className={cn(
                'absolute cursor-pointer top-0 left-0 right-0 bottom-0',
                'bg-zinc-700 border-2 border-zinc-600 rounded-xl',
                'transition-all duration-200',
                'before:content-[""] before:absolute before:top-0.5 before:left-0.5',
                'before:w-3 before:h-3 before:bg-white before:rounded-full',
                'before:transition-all before:duration-200',
                'before:shadow-[0_2px_4px_rgba(0,0,0,0.2)]',
                settings.showPerformancePanel ? [
                  'bg-green-500 border-green-500',
                  'before:translate-x-4 before:bg-black'
                ] : ''
              )} />
            </label>
          </div>
        </div>
      </div>

      {/* Browser Compatibility Notes */}
      {(capabilities.isSafari || capabilities.isMobileDevice) && (
        <div className={tw`
          flex flex-col gap-2 py-2 text-sm font-mono
          [&:not(:last-child)]:border-b [&:not(:last-child)]:border-white/10
          [&:not(:last-child)]:mb-2 [&:not(:last-child)]:pb-4
        `}>
          <div className={tw`
            text-gray-400 text-xs font-semibold
            uppercase tracking-wide mb-2
          `}>Compatibility Notes</div>
          <div className="flex flex-col gap-2">
            {capabilities.isSafari && (
              <div className={tw`
                flex gap-2 p-2 rounded-md text-xs
                bg-blue-500/10 border border-blue-500/20 text-blue-400
              `}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0 mt-0.5">
                  <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                </svg>
                <div className="flex-1">
                  <strong className="block mb-0.5 font-semibold">Safari Browser Detected</strong>
                  <div className="text-gray-300 leading-[1.3]">Canvas glow effects are disabled for optimal performance</div>
                </div>
              </div>
            )}
            
            {capabilities.isMobileDevice && (
              <div className={tw`
                flex gap-2 p-2 rounded-md text-xs
                bg-green-500/10 border border-green-500/20 text-green-400
              `}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0 mt-0.5">
                  <path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21C5,22.11 5.89,23 7,23H17C18.11,23 19,22.11 19,21V3C19,1.89 18.11,1 17,1Z"/>
                </svg>
                <div className="flex-1">
                  <strong className="block mb-0.5 font-semibold">Touch Device Detected</strong>
                  <div className="text-gray-300 leading-[1.3]">Canvas glow effects are disabled to preserve battery life</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <button 
          onClick={resetToDefaults}
          title="Reset all settings to defaults"
          className={tw`
            flex items-center gap-2 px-3 py-2
            bg-red-500/10 border border-red-500/20 rounded-md
            text-red-400 text-xs font-medium cursor-pointer
            transition-all duration-200 w-full justify-center
            hover:bg-red-500/15 hover:border-red-500/30
          `}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M12,4C14.1,4 16.1,4.8 17.6,6.3C20.7,9.4 20.7,14.5 17.6,17.6C15.8,19.5 13.3,20.2 10.9,19.9L11.4,17.9C13.1,18.1 14.9,17.5 16.2,16.2C18.5,13.9 18.5,10.1 16.2,7.7C15.1,6.6 13.5,6 12,6V10.5L7,5.5L12,0.5V4M6.3,17.6C3.7,15 3.3,11 5.1,7.9L6.6,9.4C5.5,11.6 5.9,14.4 7.8,16.2C8.3,16.7 8.9,17.1 9.6,17.4L9,19.4C8,19 7.1,18.4 6.3,17.6Z"/>
          </svg>
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}