import React, { useState, useLayoutEffect } from 'react'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'
import { GlobalStyles } from './GlobalStyles'
import { theme } from './theme'

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isThemeReady, setIsThemeReady] = useState(false)

  // Use useLayoutEffect to ensure theme is ready before first paint
  useLayoutEffect(() => {
    setIsThemeReady(true)
  }, [])

  // Render with theme even if not ready to prevent hydration mismatches
  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyles />
      {children}
    </StyledThemeProvider>
  )
}