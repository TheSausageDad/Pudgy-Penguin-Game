import { createGlobalStyle } from 'styled-components'

// Direct 1:1 port of remix-game-styles.css
export const GameStyles = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    height: 100%;
  }

  canvas {
    outline: none;
    display: block;
  }
`