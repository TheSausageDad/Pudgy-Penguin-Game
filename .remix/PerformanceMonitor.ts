/**
 * Performance monitoring system for Remix development overlay
 * Supports two-tier approach: Phaser plugin (accurate) or iframe monitoring (fallback)
 */

interface PerformanceData {
  timestamp: number
  fps: number
  frameTime: number
  updateTime?: number
  renderTime?: number
  memory?: {
    used: number
    total: number
    textureMemory?: number
  }
  rendering?: {
    drawCalls: number
    gameObjects: number
    physicsBodies: number
    activeTweens: number
  }
  isJank: boolean
}

interface PerformanceStats {
  current: number
  average: number
  min: number
  max: number
}

export class PerformanceMonitor {
  private tier: 'plugin' | 'iframe' = 'iframe'
  private data: PerformanceData[] = []
  private isRunning: boolean = false
  private iframe: HTMLIFrameElement
  private rafId?: number
  private fpsInterval: number = 1000 // Calculate FPS every second
  private lastFpsCalc: number = 0

  // Constants
  private readonly MAX_DATA_POINTS = 60 // 60 seconds of data
  private readonly JANK_THRESHOLD = 33.33 // >33ms is considered jank (< 30fps)

  constructor(iframe: HTMLIFrameElement) {
    this.iframe = iframe
    this.setupMessageListener()
    this.start()
  }

  private setupMessageListener(): void {
    window.addEventListener('message', (event) => {
      if (event.source === this.iframe.contentWindow && 
          event.data?.type === 'remix_performance_data') {
        this.tier = 'plugin'
        this.handlePluginData(event.data.data)
      }
    })
  }

  private handlePluginData(data: any): void {
    const now = performance.now()
    const isJank = data.frameTime > this.JANK_THRESHOLD

    const performanceData: PerformanceData = {
      timestamp: now,
      fps: data.fps || 0,
      frameTime: data.frameTime || 0,
      updateTime: data.updateTime,
      renderTime: data.renderTime,
      memory: data.memory ? {
        used: data.memory.used || 0,
        total: data.memory.total || 0,
        textureMemory: data.memory.textureMemory
      } : undefined,
      rendering: data.rendering ? {
        drawCalls: data.rendering.drawCalls || 0,
        gameObjects: data.rendering.gameObjects || 0,
        physicsBodies: data.rendering.physicsBodies || 0,
        activeTweens: data.rendering.activeTweens || 0
      } : undefined,
      isJank
    }

    this.addDataPoint(performanceData)
  }

  private startIframeMonitoring(): void {
    let lastTime = performance.now()
    let frameCount = 0

    const monitor = (currentTime: number) => {
      const deltaTime = currentTime - lastTime
      frameCount++

      // Calculate FPS every second
      if (currentTime - this.lastFpsCalc >= this.fpsInterval) {
        const fps = Math.round((frameCount * 1000) / (currentTime - this.lastFpsCalc))
        const isJank = deltaTime > this.JANK_THRESHOLD

        // Get memory info if available (Chrome only)
        let memory: PerformanceData['memory'] | undefined
        if ((performance as any).memory) {
          const mem = (performance as any).memory
          memory = {
            used: Math.round(mem.usedJSHeapSize / 1024 / 1024), // Convert to MB
            total: Math.round(mem.totalJSHeapSize / 1024 / 1024)
          }
        }

        const performanceData: PerformanceData = {
          timestamp: currentTime,
          fps: Math.max(0, Math.min(fps, 120)), // Cap at 120fps
          frameTime: deltaTime,
          memory,
          isJank
        }

        this.addDataPoint(performanceData)

        frameCount = 0
        this.lastFpsCalc = currentTime
      }

      lastTime = currentTime

      if (this.isRunning) {
        this.rafId = requestAnimationFrame(monitor)
      }
    }

    this.rafId = requestAnimationFrame(monitor)
  }

  private addDataPoint(data: PerformanceData): void {
    this.data.push(data)

    // Keep only last 60 seconds of data
    const cutoffTime = data.timestamp - (this.MAX_DATA_POINTS * 1000)
    this.data = this.data.filter(d => d.timestamp > cutoffTime)
  }

  public start(): void {
    if (this.isRunning) return
    
    this.isRunning = true
    this.lastFpsCalc = performance.now()

    // Start iframe monitoring (will be replaced if plugin data arrives)
    setTimeout(() => {
      if (this.tier === 'iframe') {
        this.startIframeMonitoring()
      }
    }, 1000) // Give plugin time to connect
  }

  public stop(): void {
    this.isRunning = false
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = undefined
    }
  }

  public getData(): PerformanceData[] {
    return [...this.data]
  }

  public getLatestData(): PerformanceData | null {
    return this.data.length > 0 ? this.data[this.data.length - 1] : null
  }

  public getFPSStats(): PerformanceStats {
    if (this.data.length === 0) {
      return { current: 0, average: 0, min: 0, max: 0 }
    }

    const fpsList = this.data.map(d => d.fps)
    const current = fpsList[fpsList.length - 1]
    const average = Math.round(fpsList.reduce((a, b) => a + b, 0) / fpsList.length)
    const min = Math.min(...fpsList)
    const max = Math.max(...fpsList)

    return { current, average, min, max }
  }

  public getFrameTimeStats(): PerformanceStats {
    if (this.data.length === 0) {
      return { current: 0, average: 0, min: 0, max: 0 }
    }

    const frameTimeList = this.data.map(d => d.frameTime)
    const current = Math.round(frameTimeList[frameTimeList.length - 1] * 100) / 100
    const average = Math.round((frameTimeList.reduce((a, b) => a + b, 0) / frameTimeList.length) * 100) / 100
    const min = Math.round(Math.min(...frameTimeList) * 100) / 100
    const max = Math.round(Math.max(...frameTimeList) * 100) / 100

    return { current, average, min, max }
  }

  public getMemoryStats(): { used: PerformanceStats, total: PerformanceStats } | null {
    const memoryData = this.data.filter(d => d.memory).map(d => d.memory!)
    
    if (memoryData.length === 0) return null

    const usedList = memoryData.map(m => m.used)
    const totalList = memoryData.map(m => m.total)

    return {
      used: {
        current: usedList[usedList.length - 1],
        average: Math.round(usedList.reduce((a, b) => a + b, 0) / usedList.length),
        min: Math.min(...usedList),
        max: Math.max(...usedList)
      },
      total: {
        current: totalList[totalList.length - 1],
        average: Math.round(totalList.reduce((a, b) => a + b, 0) / totalList.length),
        min: Math.min(...totalList),
        max: Math.max(...totalList)
      }
    }
  }

  public getRenderingStats(): PerformanceData['rendering'] | null {
    const latest = this.getLatestData()
    return latest?.rendering || null
  }

  public hasJankInLastSeconds(seconds: number = 10): boolean {
    const cutoffTime = performance.now() - (seconds * 1000)
    return this.data.some(d => d.timestamp > cutoffTime && d.isJank)
  }

  public getTier(): 'plugin' | 'iframe' {
    return this.tier
  }

  public getJankEvents(): PerformanceData[] {
    return this.data.filter(d => d.isJank)
  }

  public dispose(): void {
    this.stop()
    this.data = []
    window.removeEventListener('message', this.handlePluginData)
  }
}