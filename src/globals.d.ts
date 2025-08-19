/**
 * Global type declarations for externally loaded libraries
 */

// Phaser is loaded globally via CDN
declare const Phaser: typeof import("phaser");

// Remix/Farcade SDK is loaded globally via CDN
interface FarcadeSDK {
  singlePlayer: {
    actions: {
      ready: () => void;
      gameOver: (data?: { score?: number; finalScore?: number; highScore?: number }) => void;
    };
  };
  on: (eventType: string, listener: (event: any) => void) => void;
}

declare const FarcadeSDK: FarcadeSDK;

// Extend window for global SDK access
declare global {
  interface Window {
    FarcadeSDK?: FarcadeSDK;
  }
}

export {};