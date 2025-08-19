/**
 * Development-only entry point that initializes the dev overlay
 * Simple approach: just create one overlay instance
 */

import { initializeDevOverlay } from './RemixDevOverlay';
import './parent-underglow';
import './dev-settings';

initializeDevOverlay();