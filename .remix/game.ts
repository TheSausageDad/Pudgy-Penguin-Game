// Development version of main.ts with SDK mock initialization
import { initializeSDKMock } from './RemixSDKMock';

// Initialize SDK mock first
initializeSDKMock();

// Then load the main game
import('../src/main');