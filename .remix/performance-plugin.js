/**
 * Phaser Performance Plugin for Remix Development
 * This plugin collects detailed performance metrics from within the game loop
 * and sends them to the parent frame (RemixDevOverlay) for display
 */

// Plugin definition as a string that can be dynamically injected
window.RemixPerformancePluginCode = `
class RemixPerformancePlugin extends Phaser.Plugins.BasePlugin {
  constructor(pluginManager) {
    super(pluginManager);
    
    this.isActive = false;
    this.lastUpdateTime = 0;
    this.lastRenderTime = 0;
    this.frameCount = 0;
    this.lastReportTime = 0;
    this.reportInterval = 1000; // Report every second
    
    // Performance tracking
    this.fpsHistory = [];
    this.frameTimeHistory = [];
  }
  
  init() {
    // Only activate in development mode
    if (typeof window !== 'undefined' && window.parent !== window) {
      this.isActive = true;
      this.setupPerformanceTracking();
    }
  }
  
  start() {
    if (!this.isActive) return;
    
    // Hook into game events
    this.game.events.on('prestep', this.onPreStep, this);
    this.game.events.on('step', this.onStep, this);
    this.game.events.on('postrender', this.onPostRender, this);
    
    // Start reporting loop
    this.startReporting();
  }
  
  setupPerformanceTracking() {
    // Override scene update to track update time
    const originalUpdate = this.game.scene.scenes[0]?.sys?.sceneUpdate;
    if (originalUpdate) {
      const self = this;
      this.game.scene.scenes.forEach(scene => {
        if (scene.sys.sceneUpdate) {
          const original = scene.sys.sceneUpdate.bind(scene.sys);
          scene.sys.sceneUpdate = function(time, delta) {
            const start = performance.now();
            const result = original(time, delta);
            self.lastUpdateTime = performance.now() - start;
            return result;
          };
        }
      });
    }
  }
  
  onPreStep() {
    this.frameStartTime = performance.now();
  }
  
  onStep() {
    // Track frame timing
    if (this.frameStartTime) {
      const frameTime = performance.now() - this.frameStartTime;
      this.frameTimeHistory.push(frameTime);
      
      // Keep only recent frame times
      if (this.frameTimeHistory.length > 60) {
        this.frameTimeHistory.shift();
      }
    }
    
    this.frameCount++;
  }
  
  onPostRender() {
    // Track render time (approximate)
    if (this.frameStartTime) {
      this.lastRenderTime = performance.now() - this.frameStartTime - this.lastUpdateTime;
    }
  }
  
  startReporting() {
    const report = () => {
      if (!this.isActive) return;
      
      const now = performance.now();
      
      // Only report every interval
      if (now - this.lastReportTime < this.reportInterval) {
        requestAnimationFrame(report);
        return;
      }
      
      const performanceData = this.collectPerformanceData();
      
      // Send data to parent frame
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'remix_performance_data',
          data: performanceData
        }, '*');
      }
      
      this.lastReportTime = now;
      this.frameCount = 0; // Reset frame counter
      
      requestAnimationFrame(report);
    };
    
    requestAnimationFrame(report);
  }
  
  collectPerformanceData() {
    const now = performance.now();
    const timeSinceLastReport = now - this.lastReportTime;
    
    // Calculate FPS from frame count
    const fps = timeSinceLastReport > 0 
      ? Math.round((this.frameCount * 1000) / timeSinceLastReport)
      : 0;
    
    // Calculate average frame time
    const avgFrameTime = this.frameTimeHistory.length > 0
      ? this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length
      : 0;
    
    // Collect memory information
    const memory = this.collectMemoryData();
    
    // Collect rendering information
    const rendering = this.collectRenderingData();
    
    return {
      timestamp: now,
      fps: Math.max(0, Math.min(fps, 120)), // Cap between 0-120
      frameTime: avgFrameTime,
      updateTime: this.lastUpdateTime,
      renderTime: Math.max(0, this.lastRenderTime),
      memory,
      rendering
    };
  }
  
  collectMemoryData() {
    const memory = { used: 0, total: 0 };
    
    // Get JS heap memory (Chrome only)
    if (performance.memory) {
      memory.used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024); // MB
      memory.total = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024); // MB
    }
    
    // Try to get texture memory (approximate)
    try {
      const textureManager = this.game.textures;
      if (textureManager && textureManager.list) {
        let textureMemory = 0;
        Object.values(textureManager.list).forEach(texture => {
          if (texture && texture.source) {
            texture.source.forEach(source => {
              if (source.image) {
                // Rough estimate: width * height * 4 bytes per pixel
                textureMemory += (source.width || 0) * (source.height || 0) * 4;
              }
            });
          }
        });
        memory.textureMemory = Math.round(textureMemory / 1024 / 1024); // Convert to MB
      }
    } catch (e) {
      // Ignore texture memory calculation errors
    }
    
    return memory;
  }
  
  collectRenderingData() {
    const rendering = {
      drawCalls: 0,
      gameObjects: 0,
      physicsBodies: 0,
      activeTweens: 0
    };
    
    try {
      // Get draw calls from WebGL renderer
      if (this.game.renderer && this.game.renderer.type === Phaser.WEBGL) {
        rendering.drawCalls = this.game.renderer.drawCalls || 0;
      }
      
      // Count game objects across all active scenes
      this.game.scene.scenes.forEach(scene => {
        if (scene.sys.isActive()) {
          // Count display list objects
          if (scene.children && scene.children.list) {
            rendering.gameObjects += scene.children.list.length;
          }
          
          // Count physics bodies
          if (scene.physics && scene.physics.world) {
            if (scene.physics.world.bodies) {
              rendering.physicsBodies += scene.physics.world.bodies.entries.length || 0;
            } else if (scene.physics.world.staticBodies) {
              // Matter.js physics
              rendering.physicsBodies += (scene.physics.world.localWorld?.bodies?.length || 0);
            }
          }
          
          // Count active tweens
          if (scene.tweens) {
            const tweens = scene.tweens.getAllTweens ? scene.tweens.getAllTweens() : [];
            rendering.activeTweens += tweens.filter(tween => tween.isPlaying()).length;
          }
        }
      });
      
      // Global tween manager
      if (this.game.tweens) {
        const globalTweens = this.game.tweens.getAllTweens ? this.game.tweens.getAllTweens() : [];
        rendering.activeTweens += globalTweens.filter(tween => tween.isPlaying()).length;
      }
      
    } catch (e) {
      // Ignore rendering data collection errors
      console.warn('RemixPerformancePlugin: Error collecting rendering data:', e);
    }
    
    return rendering;
  }
  
  stop() {
    this.isActive = false;
    
    if (this.game && this.game.events) {
      this.game.events.off('prestep', this.onPreStep, this);
      this.game.events.off('step', this.onStep, this);
      this.game.events.off('postrender', this.onPostRender, this);
    }
  }
  
  destroy() {
    this.stop();
    super.destroy();
  }
}

// Auto-register the plugin if Phaser is available
if (typeof Phaser !== 'undefined' && Phaser.Plugins) {
  // Create and install the plugin
  const game = window.game || (typeof phaserGame !== 'undefined' ? phaserGame : null);
  
  if (game && game.plugins) {
    const plugin = new RemixPerformancePlugin(game.plugins);
    game.plugins.install('RemixPerformance', RemixPerformancePlugin, true);
    plugin.init();
    plugin.start();
    
    // Store reference for cleanup
    window.__remixPerformancePlugin = plugin;
  }
}
`;

// Export the plugin code for dynamic loading
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.RemixPerformancePluginCode;
}