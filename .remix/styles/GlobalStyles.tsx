import { createGlobalStyle } from 'styled-components'
import { theme } from './theme'

export const GlobalStyles = createGlobalStyle`
  :root {
    /* Colors */
    --color-bg-primary: ${theme.colors.bg.primary};
    --color-bg-secondary: ${theme.colors.bg.secondary};
    --color-bg-tertiary: ${theme.colors.bg.tertiary};
    --color-bg-overlay: ${theme.colors.bg.overlay};
    
    --color-accent-green: ${theme.colors.accent.green};
    --color-accent-green-hover: ${theme.colors.accent.greenHover};
    --color-accent-green-light: ${theme.colors.accent.greenLight};
    
    --color-status-red: ${theme.colors.status.red};
    --color-status-yellow: ${theme.colors.status.yellow};
    --color-status-green: ${theme.colors.status.green};
    --color-status-blue: ${theme.colors.status.blue};
    
    --color-text-primary: ${theme.colors.text.primary};
    --color-text-secondary: ${theme.colors.text.secondary};
    --color-text-inverse: ${theme.colors.text.inverse};
    
    --color-border-default: ${theme.colors.border.default};
    --color-border-light: ${theme.colors.border.light};
    --color-border-dark: ${theme.colors.border.dark};
    
    /* Spacing */
    --spacing-xs: ${theme.spacing.xs};
    --spacing-sm: ${theme.spacing.sm};
    --spacing-md: ${theme.spacing.md};
    --spacing-lg: ${theme.spacing.lg};
    --spacing-xl: ${theme.spacing.xl};
    --spacing-xxl: ${theme.spacing.xxl};
    
    /* Border Radius */
    --radius-sm: ${theme.borderRadius.sm};
    --radius-md: ${theme.borderRadius.md};
    --radius-lg: ${theme.borderRadius.lg};
    --radius-xl: ${theme.borderRadius.xl};
    --radius-full: ${theme.borderRadius.full};
    
    /* Font Sizes */
    --font-xs: ${theme.fontSize.xs};
    --font-sm: ${theme.fontSize.sm};
    --font-base: ${theme.fontSize.base};
    --font-lg: ${theme.fontSize.lg};
    --font-xl: ${theme.fontSize.xl};
    --font-xxl: ${theme.fontSize.xxl};
    
    /* Transitions */
    --transition-fast: ${theme.transitions.fast};
    --transition-normal: ${theme.transitions.normal};
    --transition-slow: ${theme.transitions.slow};
    
    /* Shadows */
    --shadow-sm: ${theme.shadows.sm};
    --shadow-md: ${theme.shadows.md};
    --shadow-lg: ${theme.shadows.lg};
    --shadow-xl: ${theme.shadows.xl};
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    height: 100%;
  }

  body {
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Ubuntu, Cantarell, 'Noto Sans', sans-serif;
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
    font-size: var(--font-base);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  canvas {
    outline: none;
    display: block;
  }

  /* Status Bar Styles */
  button.publishable-status,
  .publishable-status {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    cursor: pointer !important;
    padding: 6px 12px !important;
    border-radius: 8px !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    background: rgba(0, 0, 0, 0) !important;
    background-color: rgba(0, 0, 0, 0) !important;
    background-image: none !important;
    color: #aaa !important;
    transition: all 0.2s ease !important;
    user-select: none !important;
    -webkit-user-select: none !important;
    -webkit-tap-highlight-color: transparent !important;
    height: 32px !important;
    box-sizing: border-box !important;
    font-size: 13px !important;
    font-weight: 500 !important;
  }

  button.publishable-status:hover,
  .publishable-status:hover {
    background: rgba(255,255,255,0.05) !important;
    background-color: rgba(255,255,255,0.05) !important;
    color: #fff !important;
  }

  .status-light-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 2px;
    width: 16px;
    height: 16px;
  }

  .status-panel {
    position: absolute;
    bottom: 100%;
    left: 16px;
    margin-bottom: 8px;
    background: #1f1f1f;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 12px;
    min-width: 180px;
    opacity: 0;
    transform: translateY(25px);
    pointer-events: none;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    user-select: none;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
    z-index: 400;
  }

  .status-panel.show {
    opacity: 1;
    transform: translateY(16px);
    pointer-events: auto;
  }

  /* Status Bar Container */
  .dev-status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #1a1a1a !important;
    border-top: 1px solid rgba(255,255,255,0.1);
    color: #ddd;
    font-size: 14px;
    min-height: 46px;
    position: relative;
    z-index: 300;
  }

  .status-left {
    position: relative;
  }

  button {
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
    border: none;
    background: none;
    color: inherit;
    padding: 0;
    
    &:focus-visible {
      outline: 2px solid var(--color-accent-green);
      outline-offset: 2px;
    }
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  a {
    color: var(--color-accent-green);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
    
    &:focus-visible {
      outline: 2px solid var(--color-accent-green);
      outline-offset: 2px;
    }
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    
    &:focus-visible {
      outline: 2px solid var(--color-accent-green);
      outline-offset: 2px;
    }
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--color-bg-secondary);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--color-border-light);
    border-radius: var(--radius-sm);
    
    &:hover {
      background: var(--color-accent-green);
    }
  }
`