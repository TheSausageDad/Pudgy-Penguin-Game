/**
 * Parent Window Underglow Effect - Dev Environment Only
 * Creates underglow effect around the .game-frame in the parent window
 */

// ===== UNDERGLOW CONFIGURATION =====
const UNDERGLOW_CONFIG = {
  // === VISUAL APPEARANCE ===
  blurAmount: 22,            // Higher = softer glow (0-50)
  glowBrightness: .6,       // Higher = brighter glow (0-1)
  glowDistance: 12,          // How far glow extends beyond edges (pixels)
  
  // === PERFORMANCE ===
  updatesPerSecond: 30,     // How often to update the glow (1-60)
  
  // === TECHNICAL SETTINGS (Advanced) ===
  // Image capture
  horizontalDownscale: 2,   // Compress width by this factor (higher = faster)
  verticalDownscale: 2,// Compress height by this factor (higher = faster)
  compressionQuality: 1,   // JPEG quality 1-100 (lower = faster)
  sampleSize: 10,           // Sample size for black frame detecti5n
  
  // Edge sampl5ng (how much of each edge to sample from source)
  topEdgeSample: 22,        // Pixels from top of source
  bottomEdgeSample: 22,     // Pixels from bottom of source  
  leftEdgeSample: 22,       // Pixels from left of source
  rightEdgeSample: 22,      // Pixels from right of source
}

class ParentUnderglow {
  private gameFrame: HTMLElement | null = null
  private glowContainer: HTMLElement | null = null
  
  // Edge glow canvases
  private glowCanvasTop: HTMLCanvasElement | null = null
  private glowCanvasBottom: HTMLCanvasElement | null = null
  private glowCanvasLeft: HTMLCanvasElement | null = null
  private glowCanvasRight: HTMLCanvasElement | null = null
  
  // Edge glow contexts
  private glowCtxTop: CanvasRenderingContext2D | null = null
  private glowCtxBottom: CanvasRenderingContext2D | null = null
  private glowCtxLeft: CanvasRenderingContext2D | null = null
  private glowCtxRight: CanvasRenderingContext2D | null = null
  
  private animationId: number | null = null
  private enabled = true
  private resizeObserver: ResizeObserver | null = null
  
  // Configuration from top of file
  private updateInterval = 1000 / UNDERGLOW_CONFIG.updatesPerSecond
  private blurRadius = UNDERGLOW_CONFIG.blurAmount
  private glowOpacity = UNDERGLOW_CONFIG.glowBrightness
  private edgeThickness = UNDERGLOW_CONFIG.glowDistance
  
  // Optimization flags
  private lastUpdateTime = 0
  private isSafari = false
  private isMobileDevice = false

  initialize() {
    // Detect Safari browser (specifically Safari, not Chrome or other WebKit browsers)
    this.isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)
    
    // Detect mobile touch devices
    this.isMobileDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || 
                         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (this.isSafari || this.isMobileDevice) {
      this.enabled = false
      return
    }
    // Wait for dev overlay to create the structure
    this.waitForDevOverlay()
    this.setupKeyboardToggle()
    
  }

  private waitForDevOverlay() {
    let attempts = 0
    const maxAttempts = 50
    
    const checkForStructure = () => {
      attempts++
      
      // Look for .game-frame
      this.gameFrame = document.querySelector('.game-frame') as HTMLElement
      
      if (this.gameFrame) {
        // Look for iframe within game frame
        const iframe = this.gameFrame.querySelector('iframe') as HTMLIFrameElement
        if (iframe) {
          this.setupCrossFrameCanvas(iframe)
        } else {
          this.createGlowCanvas()
        }
        // Auto-start if enabled
        if (this.enabled) {
          this.start()
        }
        
        // Setup resize observer to handle canvas size changes
        this.setupResizeObserver()
      } else if (attempts < maxAttempts) {
        setTimeout(checkForStructure, 100)
      } else {
        // Gave up waiting for structure
      }
    }
    
    checkForStructure()
  }


  private setupCrossFrameCanvas(iframe: HTMLIFrameElement) {
    
    // Create glow canvas immediately (don't wait for iframe canvas)
    this.createGlowCanvas()
    
    // Set up postMessage communication
    this.setupPostMessageApproach(iframe)
    
    // Auto-start if enabled
    if (this.enabled) {
      this.start()
    }
  }


  private setupPostMessageApproach(iframe: HTMLIFrameElement) {
    // Try to access iframe canvas directly
    const getIframeCanvas = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
        if (iframeDoc) {
          return iframeDoc.querySelector('canvas') as HTMLCanvasElement
        }
      } catch (e) {
        // Cross-origin - can't access directly
      }
      return null
    }

    // Direct canvas capture function with improved reliability
    const captureCanvasData = () => {
      if (!this.enabled) return

      const canvas = getIframeCanvas()
      if (!canvas) {
        return
      }

      // Capture immediately for speed
      try {
          // Validate canvas has content
          if (canvas.width === 0 || canvas.height === 0) {
            console.log('Canvas has zero dimensions:', { width: canvas.width, height: canvas.height })
            return
          }
          
          console.log('Canvas found:', { 
            width: canvas.width, 
            height: canvas.height,
            tagName: canvas.tagName,
            style: canvas.style.cssText
          })

          // Ultra-tiny images with asymmetric scaling
          const smallWidth = Math.max(9, Math.floor(canvas.width / UNDERGLOW_CONFIG.horizontalDownscale))
          const smallHeight = Math.max(16, Math.floor(canvas.height / UNDERGLOW_CONFIG.verticalDownscale))
          
          const tempCanvas = document.createElement('canvas')
          const tempCtx = tempCanvas.getContext('2d')
          if (!tempCtx) return

          tempCanvas.width = smallWidth
          tempCanvas.height = smallHeight
          
          // Fastest possible settings
          tempCtx.imageSmoothingEnabled = false // No smoothing for speed
          
          // Draw the canvas (now with preserved drawing buffer)
          console.log('Drawing canvas with preserved buffer')
          tempCtx.drawImage(
            canvas,
            0, 0, canvas.width, canvas.height,
            0, 0, smallWidth, smallHeight
          )
          
          // Debug: Check what we actually drew
          const debugImageData = tempCtx.getImageData(0, 0, Math.min(10, smallWidth), Math.min(10, smallHeight))
          const debugPixels = []
          for (let i = 0; i < Math.min(40, debugImageData.data.length); i += 4) {
            debugPixels.push([debugImageData.data[i], debugImageData.data[i+1], debugImageData.data[i+2], debugImageData.data[i+3]])
          }
          console.log('Temp canvas first 10 pixels after drawImage:', debugPixels)

          // Quick black frame check with larger sample (only reject completely black frames)
          const sampleSize = Math.min(smallWidth, smallHeight)
          const imageData = tempCtx.getImageData(0, 0, sampleSize, sampleSize)
          const isBlack = this.isImageDataMostlyBlack(imageData)
          console.log('Frame sample check:', { sampleSize, isBlack, width: smallWidth, height: smallHeight })
          if (isBlack) {
            console.log('Frame rejected as black - skipping glow update')
            return
          }
          console.log('Frame accepted - proceeding with glow update')
          
          // Convert to JPEG for better performance
          const jpegDataUrl = tempCanvas.toDataURL('image/jpeg', UNDERGLOW_CONFIG.compressionQuality / 100)
          this.updateGlowFromJpeg(jpegDataUrl, smallWidth, smallHeight)
          
        } catch (error) {
          // Failed to capture canvas
        }
    }

    
    // Store the capture function
    this.postMessageSender = captureCanvasData
  }

  private isImageDataMostlyBlack(imageData: ImageData): boolean {
    const data = imageData.data
    let nonBlackPixels = 0
    const totalPixels = data.length / 4
    
    // Check every pixel for any non-black content
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1] 
      const b = data[i + 2]
      
      // If any channel has some brightness, it's not black
      if (r > 0 || g > 0 || b > 0) {
        nonBlackPixels++
      }
    }
    
    // Accept frame if more than 0.1% of pixels are non-black (very lenient)
    const nonBlackPercentage = nonBlackPixels / totalPixels
    console.log('Black frame check:', { nonBlackPixels, totalPixels, percentage: nonBlackPercentage.toFixed(4) })
    return nonBlackPercentage < 0.001
  }

  private postMessageSender: (() => void) | null = null

  private setupResizeObserver() {
    if (!this.gameFrame || this.resizeObserver) return

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === this.gameFrame) {
          this.updateGlowCanvasSizes()
        }
      }
    })

    this.resizeObserver.observe(this.gameFrame)
  }

  private updateGlowCanvasSizes() {
    if (!this.gameFrame || !this.glowContainer) return

    const rect = this.gameFrame.getBoundingClientRect()
    
    // Update top canvas
    if (this.glowCanvasTop) {
      this.glowCanvasTop.width = rect.width + (2 * this.edgeThickness)
      this.glowCanvasTop.height = this.edgeThickness
      this.glowCanvasTop.style.width = `${rect.width + (2 * this.edgeThickness)}px`
      this.glowCanvasTop.style.height = `${this.edgeThickness}px`
    }

    // Update bottom canvas
    if (this.glowCanvasBottom) {
      this.glowCanvasBottom.width = rect.width + (2 * this.edgeThickness)
      this.glowCanvasBottom.height = this.edgeThickness
      this.glowCanvasBottom.style.width = `${rect.width + (2 * this.edgeThickness)}px`
      this.glowCanvasBottom.style.height = `${this.edgeThickness}px`
      this.glowCanvasBottom.style.top = `${rect.height}px`
    }

    // Update left canvas
    if (this.glowCanvasLeft) {
      this.glowCanvasLeft.width = this.edgeThickness
      this.glowCanvasLeft.height = rect.height
      this.glowCanvasLeft.style.width = `${this.edgeThickness}px`
      this.glowCanvasLeft.style.height = `${rect.height}px`
    }

    // Update right canvas
    if (this.glowCanvasRight) {
      this.glowCanvasRight.width = this.edgeThickness
      this.glowCanvasRight.height = rect.height
      this.glowCanvasRight.style.width = `${this.edgeThickness}px`
      this.glowCanvasRight.style.height = `${rect.height}px`
      this.glowCanvasRight.style.left = `${rect.width}px`
    }
  }

  private createGlowContainer() {
    if (!this.gameFrame || this.glowContainer) return

    const parent = this.gameFrame.parentElement
    if (!parent) return

    // Create container
    this.glowContainer = document.createElement('div')
    this.glowContainer.className = 'underglow-container'
    this.glowContainer.style.position = 'relative'
    this.glowContainer.style.display = 'inline-block'
    
    // Move game frame into the container
    parent.insertBefore(this.glowContainer, this.gameFrame)
    this.glowContainer.appendChild(this.gameFrame)
    
    // Reset game frame positioning since it's now in a controlled container
    this.gameFrame.style.position = 'relative'
    this.gameFrame.style.zIndex = '2'
  }

  private createGlowCanvas() {
    if (!this.gameFrame || this.glowCanvasTop) return // Prevent duplicate creation

    // Create a container for game frame and glow
    this.createGlowContainer()

    // Get game frame dimensions
    const rect = this.gameFrame.getBoundingClientRect()
    
    // Create edge glow canvases
    this.glowCanvasTop = this.createEdgeCanvas('top', rect)
    this.glowCanvasBottom = this.createEdgeCanvas('bottom', rect)
    this.glowCanvasLeft = this.createEdgeCanvas('left', rect)
    this.glowCanvasRight = this.createEdgeCanvas('right', rect)
    
    // Get contexts
    this.glowCtxTop = this.glowCanvasTop?.getContext('2d', { alpha: true, willReadFrequently: true }) || null
    this.glowCtxBottom = this.glowCanvasBottom?.getContext('2d', { alpha: true, willReadFrequently: true }) || null
    this.glowCtxLeft = this.glowCanvasLeft?.getContext('2d', { alpha: true, willReadFrequently: true }) || null
    this.glowCtxRight = this.glowCanvasRight?.getContext('2d', { alpha: true, willReadFrequently: true }) || null
    
  }

  private createEdgeCanvas(edge: 'top' | 'bottom' | 'left' | 'right', rect: DOMRect): HTMLCanvasElement | null {
    if (!this.gameFrame || !this.glowContainer) return null

    const canvas = document.createElement('canvas')
    canvas.id = `underglow-${edge}`
    
    // Set dimensions based on edge
    if (edge === 'top' || edge === 'bottom') {
      // Extend top/bottom to cover the side glow areas
      canvas.width = rect.width + (2 * this.edgeThickness)
      canvas.height = this.edgeThickness
    } else {
      canvas.width = this.edgeThickness
      canvas.height = rect.height
    }
    
    // Position based on edge
    canvas.style.position = 'absolute'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '0'
    canvas.style.filter = `blur(${this.blurRadius}px) brightness(1) saturate(1.25) contrast(0.9)`
    canvas.style.opacity = this.glowOpacity.toString()
    
    // Debug: Add a visible border to see edge placement (comment out for production)
    // canvas.style.border = '2px solid lime'
    
    switch (edge) {
      case 'top':
        canvas.style.top = `-${this.edgeThickness}px`
        canvas.style.left = `-${this.edgeThickness}px`
        canvas.style.width = `${rect.width + (2 * this.edgeThickness)}px`
        canvas.style.height = `${this.edgeThickness}px`
        break
      case 'bottom':
        canvas.style.top = `${rect.height}px`
        canvas.style.left = `-${this.edgeThickness}px`
        canvas.style.width = `${rect.width + (2 * this.edgeThickness)}px`
        canvas.style.height = `${this.edgeThickness}px`
        break
      case 'left':
        canvas.style.left = `-${this.edgeThickness}px`
        canvas.style.top = `0px`
        canvas.style.width = `${this.edgeThickness}px`
        canvas.style.height = `${rect.height}px`
        break
      case 'right':
        canvas.style.left = `${rect.width}px`
        canvas.style.top = `0px`
        canvas.style.width = `${this.edgeThickness}px`
        canvas.style.height = `${rect.height}px`
        break
    }
    
    // Insert glow canvas into the glow container
    this.glowContainer.appendChild(canvas)
    
    return canvas
  }


  private setupKeyboardToggle() {
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'u') {
        this.toggle()
      }
    })
  }

  toggle() {
    // Don't allow toggling in Safari or on mobile devices
    if (this.isSafari || this.isMobileDevice) {
      return
    }
    
    this.enabled = !this.enabled
    
    if (this.enabled) {
      this.start()
    } else {
      this.stop()
    }
    
    // Update dev settings if available
    if ((window as any).devSettings) {
      (window as any).devSettings.setSetting('canvasGlow', this.enabled)
    }
  }

  private start() {
    if (!this.glowCanvasTop) return
    
    // Show all edge canvases
    if (this.glowCanvasTop) this.glowCanvasTop.style.display = 'block'
    if (this.glowCanvasBottom) this.glowCanvasBottom.style.display = 'block'
    if (this.glowCanvasLeft) this.glowCanvasLeft.style.display = 'block'
    if (this.glowCanvasRight) this.glowCanvasRight.style.display = 'block'
    
    if (this.postMessageSender) {
      this.startPostMessageUpdates()
    }
  }

  private stop() {
    if (this.animationId) {
      clearTimeout(this.animationId)
      this.animationId = null
    }
    
    // Hide all edge canvases
    if (this.glowCanvasTop) this.glowCanvasTop.style.display = 'none'
    if (this.glowCanvasBottom) this.glowCanvasBottom.style.display = 'none'
    if (this.glowCanvasLeft) this.glowCanvasLeft.style.display = 'none'
    if (this.glowCanvasRight) this.glowCanvasRight.style.display = 'none'
  }

  private startPostMessageUpdates() {
    if (!this.enabled || !this.postMessageSender || this.isSafari || this.isMobileDevice) return

    const now = performance.now()
    
    // Only update at 2 FPS (500ms intervals)
    if (now - this.lastUpdateTime < this.updateInterval) {
      this.animationId = window.setTimeout(() => this.startPostMessageUpdates(), 50)
      return
    }

    // Request new canvas data for the inactive canvas
    this.postMessageSender()
    this.lastUpdateTime = now
    
    // Schedule next update
    this.animationId = window.setTimeout(() => this.startPostMessageUpdates(), this.updateInterval)
  }


  private updateGlowFromJpeg(jpegDataUrl: string, width: number, height: number) {
    if (!this.glowCtxTop || !this.glowCanvasTop) return

    console.log('Updating glow from JPEG:', { width, height, dataLength: jpegDataUrl.length })

    try {
      // Create image from JPEG data
      const img = new Image()
      img.onload = () => {
        console.log('JPEG loaded successfully, updating edges')
        this.updateAllEdges(img, width, height)
      }
      
      img.onerror = () => {
        // Failed to load JPEG image
      }
      
      img.src = jpegDataUrl
      
    } catch (error) {
      // JPEG update failed
    }
  }

  private updateAllEdges(img: HTMLImageElement, sourceWidth: number, sourceHeight: number) {
    // Update top edge - sample from top strip of source
    if (this.glowCtxTop && this.glowCanvasTop) {
      this.glowCtxTop.clearRect(0, 0, this.glowCanvasTop.width, this.glowCanvasTop.height)
      this.glowCtxTop.imageSmoothingEnabled = true
      this.glowCtxTop.drawImage(
        img,
        0, 0, sourceWidth, Math.min(UNDERGLOW_CONFIG.topEdgeSample, sourceHeight), // Top sample of source
        0, 0, this.glowCanvasTop.width, this.glowCanvasTop.height
      )
    }

    // Update bottom edge - sample from bottom strip of source
    if (this.glowCtxBottom && this.glowCanvasBottom) {
      this.glowCtxBottom.clearRect(0, 0, this.glowCanvasBottom.width, this.glowCanvasBottom.height)
      this.glowCtxBottom.imageSmoothingEnabled = true
      const bottomStart = Math.max(0, sourceHeight - UNDERGLOW_CONFIG.bottomEdgeSample)
      this.glowCtxBottom.drawImage(
        img,
        0, bottomStart, sourceWidth, sourceHeight - bottomStart, // Bottom sample of source
        0, 0, this.glowCanvasBottom.width, this.glowCanvasBottom.height
      )
    }

    // Update left edge - sample from left strip of source
    if (this.glowCtxLeft && this.glowCanvasLeft) {
      this.glowCtxLeft.clearRect(0, 0, this.glowCanvasLeft.width, this.glowCanvasLeft.height)
      this.glowCtxLeft.imageSmoothingEnabled = true
      this.glowCtxLeft.drawImage(
        img,
        0, 0, Math.min(UNDERGLOW_CONFIG.leftEdgeSample, sourceWidth), sourceHeight, // Left sample of source
        0, 0, this.glowCanvasLeft.width, this.glowCanvasLeft.height
      )
    }

    // Update right edge - sample from right strip of source
    if (this.glowCtxRight && this.glowCanvasRight) {
      this.glowCtxRight.clearRect(0, 0, this.glowCanvasRight.width, this.glowCanvasRight.height)
      this.glowCtxRight.imageSmoothingEnabled = true
      const rightStart = Math.max(0, sourceWidth - UNDERGLOW_CONFIG.rightEdgeSample)
      this.glowCtxRight.drawImage(
        img,
        rightStart, 0, sourceWidth - rightStart, sourceHeight, // Right sample of source
        0, 0, this.glowCanvasRight.width, this.glowCanvasRight.height
      )
    }
  }


  // Configuration methods
  setBlurRadius(radius: number) {
    this.blurRadius = Math.max(0, Math.min(50, radius))
    const filter = `blur(${this.blurRadius}px) brightness(1.0) saturate(1.25) contrast(1)`
    if (this.glowCanvasTop) this.glowCanvasTop.style.filter = filter
    if (this.glowCanvasBottom) this.glowCanvasBottom.style.filter = filter
    if (this.glowCanvasLeft) this.glowCanvasLeft.style.filter = filter
    if (this.glowCanvasRight) this.glowCanvasRight.style.filter = filter
  }

  setOpacity(opacity: number) {
    this.glowOpacity = Math.max(0, Math.min(1, opacity))
    const opacityStr = this.glowOpacity.toString()
    if (this.glowCanvasTop) this.glowCanvasTop.style.opacity = opacityStr
    if (this.glowCanvasBottom) this.glowCanvasBottom.style.opacity = opacityStr
    if (this.glowCanvasLeft) this.glowCanvasLeft.style.opacity = opacityStr
    if (this.glowCanvasRight) this.glowCanvasRight.style.opacity = opacityStr
  }

  setEdgeThickness(thickness: number) {
    this.edgeThickness = Math.max(20, Math.min(200, thickness))
    // Would need to recreate canvases to apply this change
  }

  setUpdateRate(fps: number) {
    this.updateInterval = Math.max(100, Math.min(5000, 1000 / fps))
  }

  // Cleanup method
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
    
    if (this.animationId) {
      clearTimeout(this.animationId)
      this.animationId = null
    }
  }
}

// Export for dev environment
export const parentUnderglow = new ParentUnderglow()

// Global access
;(window as any).underglow = parentUnderglow

// Auto-initialize
parentUnderglow.initialize()

