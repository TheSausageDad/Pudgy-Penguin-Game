export const theme = {
  colors: {
    bg: {
      primary: '#0f0f0f',
      secondary: '#1a1a1a',
      tertiary: '#242424',
      overlay: 'rgba(15, 15, 15, 0.95)',
    },
    accent: {
      green: '#b7ff00',
      greenHover: '#9fe600',
      greenLight: 'rgba(183, 255, 0, 0.1)',
    },
    status: {
      red: '#ef4444',
      yellow: '#eab308',
      green: '#22c55e',
      blue: '#3b82f6',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#9b9b9b',
      inverse: '#0f0f0f',
    },
    border: {
      default: '#2a2a2a',
      light: '#3a3a3a',
      dark: '#1a1a1a',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  fontSize: {
    xs: '10px',
    sm: '12px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    xxl: '24px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  transitions: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.25)',
    md: '0 4px 6px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.5)',
  },
  zIndex: {
    base: 0,
    dropdown: 100,
    overlay: 200,
    modal: 300,
    tooltip: 400,
    notification: 500,
  },
}

export type Theme = typeof theme