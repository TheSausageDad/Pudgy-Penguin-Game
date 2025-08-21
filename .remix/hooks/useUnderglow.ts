import { useEffect, useRef, useCallback } from 'react'
import { useDevSettings } from './useDevSettings'

// ===== UNDERGLOW CONFIGURATION ===== (1:1 from .remix/parent-underglow.ts)
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
  verticalDownscale: 2,     // Compress height by this factor (higher = faster)
  compressionQuality: 1,    // JPEG quality 1-100 (lower = faster)
  sampleSize: 10,           // Sample size for black frame detection
  
  // Edge sampling (how much of each edge to sample from source)
  topEdgeSample: 80,        // Pixels from top of source (increased for smoother gradient)
  bottomEdgeSample: 80,     // Pixels from bottom of source  
  leftEdgeSample: 80,       // Pixels from left of source
  rightEdgeSample: 80,      // Pixels from right of source
}

export function useUnderglow(gameFrameRef: React.RefObject<HTMLElement>) {
  const { settings, capabilities } = useDevSettings()
  
  // Refs to match the exact structure of ParentUnderglow class
  const glowContainer = useRef<HTMLElement | null>(null)
  const glowCanvasTop = useRef<HTMLCanvasElement | null>(null)
  const glowCanvasBottom = useRef<HTMLCanvasElement | null>(null)
  const glowCanvasLeft = useRef<HTMLCanvasElement | null>(null)
  const glowCanvasRight = useRef<HTMLCanvasElement | null>(null)
  const glowCtxTop = useRef<CanvasRenderingContext2D | null>(null)
  const glowCtxBottom = useRef<CanvasRenderingContext2D | null>(null)
  const glowCtxLeft = useRef<CanvasRenderingContext2D | null>(null)
  const glowCtxRight = useRef<CanvasRenderingContext2D | null>(null)
  const animationId = useRef<number | null>(null)
  const lastUpdateTime = useRef<number>(0)
  const resizeObserver = useRef<ResizeObserver | null>(null)
  const postMessageSender = useRef<(() => void) | null>(null)
  const enabled = useRef<boolean>(true)
  
  // Performance monitoring for adaptive quality
  const frameTimeHistory = useRef<number[]>([])
  const currentQuality = useRef<number>(1) // 1 = full quality, 0.5 = reduced
  
  // Optimization: Reusable canvases for edge sampling
  const tempCanvasTop = useRef<HTMLCanvasElement | null>(null)
  const tempCanvasBottom = useRef<HTMLCanvasElement | null>(null)
  const tempCanvasLeft = useRef<HTMLCanvasElement | null>(null)
  const tempCanvasRight = useRef<HTMLCanvasElement | null>(null)
  const tempCtxTop = useRef<CanvasRenderingContext2D | null>(null)
  const tempCtxBottom = useRef<CanvasRenderingContext2D | null>(null)
  const tempCtxLeft = useRef<CanvasRenderingContext2D | null>(null)
  const tempCtxRight = useRef<CanvasRenderingContext2D | null>(null)
  
  
  // Configuration from config
  const updateInterval = useRef(1000 / UNDERGLOW_CONFIG.updatesPerSecond)
  const blurRadius = useRef(UNDERGLOW_CONFIG.blurAmount)
  const glowOpacity = useRef(UNDERGLOW_CONFIG.glowBrightness)
  const edgeThickness = useRef(UNDERGLOW_CONFIG.glowDistance)
  
  // Device detection (matching original)
  const isSafari = useRef(/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent))
  const isMobileDevice = useRef('ontouchstart' in window || navigator.maxTouchPoints > 0 || 
                               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))

  // 1:1 port of isImageDataMostlyBlack from original
  const isImageDataMostlyBlack = useCallback((imageData: ImageData): boolean => {
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
    return nonBlackPercentage < 0.001
  }, [])

  // 1:1 port of createGlowContainer from original
  const createGlowContainer = useCallback(() => {
    if (!gameFrameRef.current || glowContainer.current) return

    const parent = gameFrameRef.current.parentElement
    if (!parent) return

    // Check if there's already an underglow container (HMR safety)
    const existingContainer = parent.querySelector('.underglow-container')
    if (existingContainer) {
      existingContainer.remove()
    }

    // Create container
    glowContainer.current = document.createElement('div')
    glowContainer.current.className = 'underglow-container'
    glowContainer.current.style.position = 'relative'
    glowContainer.current.style.display = 'inline-block'
    
    // Move game frame into the container
    parent.insertBefore(glowContainer.current, gameFrameRef.current)
    glowContainer.current.appendChild(gameFrameRef.current)
    
    // Reset game frame positioning since it's now in a controlled container
    gameFrameRef.current.style.position = 'relative'
    gameFrameRef.current.style.zIndex = '2'
  }, [gameFrameRef])

  // 1:1 port of createEdgeCanvas from original
  const createEdgeCanvas = useCallback((edge: 'top' | 'bottom' | 'left' | 'right', rect: DOMRect): HTMLCanvasElement | null => {
    if (!gameFrameRef.current || !glowContainer.current) return null

    // Remove any existing underglow canvas for this edge (HMR safety)
    const existingCanvas = document.getElementById(`underglow-${edge}`)
    if (existingCanvas) {
      existingCanvas.remove()
    }

    const canvas = document.createElement('canvas')
    canvas.id = `underglow-${edge}`
    
    // Set dimensions based on edge
    if (edge === 'top' || edge === 'bottom') {
      // Extend top/bottom to cover the side glow areas
      canvas.width = rect.width + (2 * edgeThickness.current)
      canvas.height = edgeThickness.current
    } else {
      canvas.width = edgeThickness.current
      canvas.height = rect.height
    }
    
    // Position based on edge
    canvas.style.position = 'absolute'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '0'
    canvas.style.filter = `blur(${blurRadius.current}px) brightness(1) saturate(1.25) contrast(0.9)`
    canvas.style.opacity = glowOpacity.current.toString()
    canvas.style.willChange = 'transform, opacity' // GPU optimization
    canvas.style.transform = 'translateZ(0)' // Force GPU layer
    
    switch (edge) {
      case 'top':
        canvas.style.top = `-${edgeThickness.current}px`
        canvas.style.left = `-${edgeThickness.current}px`
        canvas.style.width = `${rect.width + (2 * edgeThickness.current)}px`
        canvas.style.height = `${edgeThickness.current}px`
        break
      case 'bottom':
        canvas.style.top = `${rect.height}px`
        canvas.style.left = `-${edgeThickness.current}px`
        canvas.style.width = `${rect.width + (2 * edgeThickness.current)}px`
        canvas.style.height = `${edgeThickness.current}px`
        break
      case 'left':
        canvas.style.left = `-${edgeThickness.current}px`
        canvas.style.top = `0px`
        canvas.style.width = `${edgeThickness.current}px`
        canvas.style.height = `${rect.height}px`
        break
      case 'right':
        canvas.style.left = `${rect.width}px`
        canvas.style.top = `0px`
        canvas.style.width = `${edgeThickness.current}px`
        canvas.style.height = `${rect.height}px`
        break
    }
    
    // Insert glow canvas into the glow container
    glowContainer.current.appendChild(canvas)
    
    return canvas
  }, [gameFrameRef])

  // 1:1 port of createGlowCanvas from original
  const createGlowCanvas = useCallback(() => {
    if (!gameFrameRef.current || glowCanvasTop.current) return // Prevent duplicate creation

    // Create a container for game frame and glow
    createGlowContainer()

    // Get game frame dimensions
    const rect = gameFrameRef.current.getBoundingClientRect()
    
    // Create edge glow canvases
    glowCanvasTop.current = createEdgeCanvas('top', rect)
    glowCanvasBottom.current = createEdgeCanvas('bottom', rect)
    glowCanvasLeft.current = createEdgeCanvas('left', rect)
    glowCanvasRight.current = createEdgeCanvas('right', rect)
    
    // Get contexts
    glowCtxTop.current = glowCanvasTop.current?.getContext('2d', { alpha: true, willReadFrequently: true }) || null
    glowCtxBottom.current = glowCanvasBottom.current?.getContext('2d', { alpha: true, willReadFrequently: true }) || null
    glowCtxLeft.current = glowCanvasLeft.current?.getContext('2d', { alpha: true, willReadFrequently: true }) || null
    glowCtxRight.current = glowCanvasRight.current?.getContext('2d', { alpha: true, willReadFrequently: true }) || null
  }, [gameFrameRef, createGlowContainer, createEdgeCanvas])

  // 1:1 port of updateGlowCanvasSizes from original
  const updateGlowCanvasSizes = useCallback(() => {
    if (!gameFrameRef.current || !glowContainer.current) return

    const rect = gameFrameRef.current.getBoundingClientRect()
    
    // Update top canvas
    if (glowCanvasTop.current) {
      glowCanvasTop.current.width = rect.width + (2 * edgeThickness.current)
      glowCanvasTop.current.height = edgeThickness.current
      glowCanvasTop.current.style.width = `${rect.width + (2 * edgeThickness.current)}px`
      glowCanvasTop.current.style.height = `${edgeThickness.current}px`
    }

    // Update bottom canvas
    if (glowCanvasBottom.current) {
      glowCanvasBottom.current.width = rect.width + (2 * edgeThickness.current)
      glowCanvasBottom.current.height = edgeThickness.current
      glowCanvasBottom.current.style.width = `${rect.width + (2 * edgeThickness.current)}px`
      glowCanvasBottom.current.style.height = `${edgeThickness.current}px`
      glowCanvasBottom.current.style.top = `${rect.height}px`
    }

    // Update left canvas
    if (glowCanvasLeft.current) {
      glowCanvasLeft.current.width = edgeThickness.current
      glowCanvasLeft.current.height = rect.height
      glowCanvasLeft.current.style.width = `${edgeThickness.current}px`
      glowCanvasLeft.current.style.height = `${rect.height}px`
    }

    // Update right canvas
    if (glowCanvasRight.current) {
      glowCanvasRight.current.width = edgeThickness.current
      glowCanvasRight.current.height = rect.height
      glowCanvasRight.current.style.width = `${edgeThickness.current}px`
      glowCanvasRight.current.style.height = `${rect.height}px`
      glowCanvasRight.current.style.left = `${rect.width}px`
    }
  }, [gameFrameRef])

  // 1:1 port of setupPostMessageApproach from original
  const setupPostMessageApproach = useCallback((iframe: HTMLIFrameElement) => {
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

    // Initialize temp canvases if needed
    const initTempCanvases = () => {
      if (!tempCanvasTop.current) {
        tempCanvasTop.current = document.createElement('canvas')
        tempCtxTop.current = tempCanvasTop.current.getContext('2d', { willReadFrequently: false })
        
        tempCanvasBottom.current = document.createElement('canvas')
        tempCtxBottom.current = tempCanvasBottom.current.getContext('2d', { willReadFrequently: false })
        
        tempCanvasLeft.current = document.createElement('canvas')
        tempCtxLeft.current = tempCanvasLeft.current.getContext('2d', { willReadFrequently: false })
        
        tempCanvasRight.current = document.createElement('canvas')
        tempCtxRight.current = tempCanvasRight.current.getContext('2d', { willReadFrequently: false })
      }
    }

    // Optimized edge-only capture function with adaptive quality
    const captureCanvasData = () => {
      if (!enabled.current) return

      const canvas = getIframeCanvas()
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        return
      }

      const startTime = performance.now()

      try {
          initTempCanvases()
          
          // Adaptive edge sampling based on performance
          const edgeSample = Math.round(UNDERGLOW_CONFIG.topEdgeSample * currentQuality.current)
          const downscale = currentQuality.current === 1 ? UNDERGLOW_CONFIG.horizontalDownscale : UNDERGLOW_CONFIG.horizontalDownscale * 1.5
          
          // Removed frame differencing - it was causing choppiness
          
          // Top edge - capture only what we need
          if (tempCanvasTop.current && tempCtxTop.current && glowCtxTop.current && glowCanvasTop.current) {
            tempCanvasTop.current.width = Math.ceil(canvas.width / downscale)
            tempCanvasTop.current.height = edgeSample
            tempCtxTop.current.imageSmoothingEnabled = true // Enable smoothing for better gradient
            tempCtxTop.current.drawImage(
              canvas,
              0, 0, canvas.width, edgeSample,
              0, 0, tempCanvasTop.current.width, tempCanvasTop.current.height
            )
            
            // Draw directly to glow canvas
            glowCtxTop.current.clearRect(0, 0, glowCanvasTop.current.width, glowCanvasTop.current.height)
            glowCtxTop.current.imageSmoothingEnabled = true
            glowCtxTop.current.drawImage(
              tempCanvasTop.current,
              0, 0, tempCanvasTop.current.width, tempCanvasTop.current.height,
              0, 0, glowCanvasTop.current.width, glowCanvasTop.current.height
            )
          }
          
          // Bottom edge
          if (tempCanvasBottom.current && tempCtxBottom.current && glowCtxBottom.current && glowCanvasBottom.current) {
            const bottomStart = Math.max(0, canvas.height - edgeSample)
            tempCanvasBottom.current.width = Math.ceil(canvas.width / UNDERGLOW_CONFIG.horizontalDownscale)
            tempCanvasBottom.current.height = edgeSample
            tempCtxBottom.current.imageSmoothingEnabled = true // Enable smoothing for better gradient
            tempCtxBottom.current.drawImage(
              canvas,
              0, bottomStart, canvas.width, edgeSample,
              0, 0, tempCanvasBottom.current.width, tempCanvasBottom.current.height
            )
            
            glowCtxBottom.current.clearRect(0, 0, glowCanvasBottom.current.width, glowCanvasBottom.current.height)
            glowCtxBottom.current.imageSmoothingEnabled = true
            glowCtxBottom.current.drawImage(
              tempCanvasBottom.current,
              0, 0, tempCanvasBottom.current.width, tempCanvasBottom.current.height,
              0, 0, glowCanvasBottom.current.width, glowCanvasBottom.current.height
            )
          }
          
          // Left edge
          if (tempCanvasLeft.current && tempCtxLeft.current && glowCtxLeft.current && glowCanvasLeft.current) {
            tempCanvasLeft.current.width = edgeSample
            tempCanvasLeft.current.height = Math.ceil(canvas.height / UNDERGLOW_CONFIG.verticalDownscale)
            tempCtxLeft.current.imageSmoothingEnabled = true // Enable smoothing for better gradient
            tempCtxLeft.current.drawImage(
              canvas,
              0, 0, edgeSample, canvas.height,
              0, 0, tempCanvasLeft.current.width, tempCanvasLeft.current.height
            )
            
            glowCtxLeft.current.clearRect(0, 0, glowCanvasLeft.current.width, glowCanvasLeft.current.height)
            glowCtxLeft.current.imageSmoothingEnabled = true
            glowCtxLeft.current.drawImage(
              tempCanvasLeft.current,
              0, 0, tempCanvasLeft.current.width, tempCanvasLeft.current.height,
              0, 0, glowCanvasLeft.current.width, glowCanvasLeft.current.height
            )
          }
          
          // Right edge
          if (tempCanvasRight.current && tempCtxRight.current && glowCtxRight.current && glowCanvasRight.current) {
            const rightStart = Math.max(0, canvas.width - edgeSample)
            tempCanvasRight.current.width = edgeSample
            tempCanvasRight.current.height = Math.ceil(canvas.height / UNDERGLOW_CONFIG.verticalDownscale)
            tempCtxRight.current.imageSmoothingEnabled = true // Enable smoothing for better gradient
            tempCtxRight.current.drawImage(
              canvas,
              rightStart, 0, edgeSample, canvas.height,
              0, 0, tempCanvasRight.current.width, tempCanvasRight.current.height
            )
            
            glowCtxRight.current.clearRect(0, 0, glowCanvasRight.current.width, glowCanvasRight.current.height)
            glowCtxRight.current.imageSmoothingEnabled = true
            glowCtxRight.current.drawImage(
              tempCanvasRight.current,
              0, 0, tempCanvasRight.current.width, tempCanvasRight.current.height,
              0, 0, glowCanvasRight.current.width, glowCanvasRight.current.height
            )
          }
          
        } catch (error) {
          // Failed to capture canvas
        }
        
        // Track frame time for adaptive quality
        const frameTime = performance.now() - startTime
        frameTimeHistory.current.push(frameTime)
        if (frameTimeHistory.current.length > 30) {
          frameTimeHistory.current.shift()
        }
        
        // Adjust quality if consistently slow or fast
        if (frameTimeHistory.current.length >= 10) {
          const avgFrameTime = frameTimeHistory.current.reduce((a, b) => a + b, 0) / frameTimeHistory.current.length
          
          if (avgFrameTime > 8 && currentQuality.current > 0.5) {
            // Reduce quality if frame time is too high
            currentQuality.current = 0.75
          } else if (avgFrameTime < 3 && currentQuality.current < 1) {
            // Increase quality if we have headroom
            currentQuality.current = 1
          }
        }
    }
    
    // Store the capture function
    postMessageSender.current = captureCanvasData
  }, [isImageDataMostlyBlack])

  // Removed updateGlowFromJpeg and updateAllEdges - now drawing directly in capture function

  // 1:1 port of setupCrossFrameCanvas from original
  const setupCrossFrameCanvas = useCallback((iframe: HTMLIFrameElement) => {
    // Create glow canvas immediately (don't wait for iframe canvas)
    createGlowCanvas()
    
    // Set up postMessage communication
    setupPostMessageApproach(iframe)
    
    // Auto-start if enabled
    if (enabled.current) {
      start()
    }
  }, [createGlowCanvas, setupPostMessageApproach])

  // 1:1 port of setupResizeObserver from original
  const setupResizeObserver = useCallback(() => {
    if (!gameFrameRef.current || resizeObserver.current) return

    resizeObserver.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === gameFrameRef.current) {
          updateGlowCanvasSizes()
        }
      }
    })

    resizeObserver.current.observe(gameFrameRef.current)
  }, [gameFrameRef, updateGlowCanvasSizes])

  // 1:1 port of start from original
  const start = useCallback(() => {
    if (!glowCanvasTop.current) return
    
    // Show all edge canvases
    if (glowCanvasTop.current) glowCanvasTop.current.style.display = 'block'
    if (glowCanvasBottom.current) glowCanvasBottom.current.style.display = 'block'
    if (glowCanvasLeft.current) glowCanvasLeft.current.style.display = 'block'
    if (glowCanvasRight.current) glowCanvasRight.current.style.display = 'block'
    
    if (postMessageSender.current) {
      startPostMessageUpdates()
    }
  }, [])

  // Updated stop to handle requestAnimationFrame
  const stop = useCallback(() => {
    if (animationId.current) {
      cancelAnimationFrame(animationId.current as number)
      animationId.current = null
    }
    
    // Hide all edge canvases
    if (glowCanvasTop.current) glowCanvasTop.current.style.display = 'none'
    if (glowCanvasBottom.current) glowCanvasBottom.current.style.display = 'none'
    if (glowCanvasLeft.current) glowCanvasLeft.current.style.display = 'none'
    if (glowCanvasRight.current) glowCanvasRight.current.style.display = 'none'
  }, [])

  // Optimized update loop using requestAnimationFrame for smoother updates
  const startPostMessageUpdates = useCallback(() => {
    if (!enabled.current || !postMessageSender.current || isSafari.current || isMobileDevice.current) return

    const updateLoop = () => {
      if (!enabled.current) return
      
      const now = performance.now()
      
      // Only update at specified FPS intervals
      if (now - lastUpdateTime.current >= updateInterval.current) {
        // Request new canvas data
        postMessageSender.current()
        lastUpdateTime.current = now
      }
      
      // Use requestAnimationFrame for smoother updates aligned with browser paint
      animationId.current = requestAnimationFrame(updateLoop) as any
    }
    
    updateLoop()
  }, [])

  // 1:1 port of waitForDevOverlay from original
  const waitForDevOverlay = useCallback(() => {
    let attempts = 0
    const maxAttempts = 50
    
    const checkForStructure = () => {
      attempts++
      
      if (gameFrameRef.current) {
        // Look for iframe within game frame
        const iframe = gameFrameRef.current.querySelector('iframe') as HTMLIFrameElement
        if (iframe) {
          setupCrossFrameCanvas(iframe)
        } else {
          createGlowCanvas()
        }
        // Auto-start if enabled
        if (enabled.current) {
          start()
        }
        
        // Setup resize observer to handle canvas size changes
        setupResizeObserver()
      } else if (attempts < maxAttempts) {
        setTimeout(checkForStructure, 100)
      } else {
        // Gave up waiting for structure
      }
    }
    
    checkForStructure()
  }, [gameFrameRef, setupCrossFrameCanvas, createGlowCanvas, start, setupResizeObserver])

  // 1:1 port of toggle from original
  const toggle = useCallback(() => {
    // Don't allow toggling in Safari or on mobile devices
    if (isSafari.current || isMobileDevice.current) {
      return
    }
    
    enabled.current = !enabled.current
    
    if (enabled.current) {
      start()
    } else {
      stop()
    }
  }, [start, stop])

  // Cleanup method (1:1 port of destroy from original)
  const cleanup = useCallback(() => {
    if (resizeObserver.current) {
      resizeObserver.current.disconnect()
      resizeObserver.current = null
    }
    
    if (animationId.current) {
      clearTimeout(animationId.current)
      animationId.current = null
    }

    // Remove DOM elements before resetting refs
    if (glowCanvasTop.current) {
      glowCanvasTop.current.remove()
    }
    if (glowCanvasBottom.current) {
      glowCanvasBottom.current.remove()
    }
    if (glowCanvasLeft.current) {
      glowCanvasLeft.current.remove()
    }
    if (glowCanvasRight.current) {
      glowCanvasRight.current.remove()
    }
    
    // Remove underglow container if it exists and restore original structure
    if (glowContainer.current && gameFrameRef.current) {
      const parent = glowContainer.current.parentElement
      if (parent) {
        // Move game frame back to original parent
        parent.insertBefore(gameFrameRef.current, glowContainer.current)
        // Remove the container
        glowContainer.current.remove()
      }
    }

    // Reset all refs
    glowContainer.current = null
    glowCanvasTop.current = null
    glowCanvasBottom.current = null
    glowCanvasLeft.current = null
    glowCanvasRight.current = null
    glowCtxTop.current = null
    glowCtxBottom.current = null
    glowCtxLeft.current = null
    glowCtxRight.current = null
    postMessageSender.current = null
  }, [gameFrameRef])

  // Initialize underglow (1:1 port of initialize from original)
  useEffect(() => {
    // Detect Safari browser (specifically Safari, not Chrome or other WebKit browsers)
    isSafari.current = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    
    // Detect mobile touch devices
    isMobileDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || 
                         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isSafari.current || isMobileDevice.current) {
      enabled.current = false
      return
    }

    // Wait for dev overlay to create the structure
    waitForDevOverlay()

    return cleanup
  }, [waitForDevOverlay, cleanup])

  // Start/stop based on settings
  useEffect(() => {
    if (settings.canvasGlow && capabilities.supportsUnderglow && enabled.current) {
      start()
    } else {
      stop()
    }
  }, [settings.canvasGlow, capabilities.supportsUnderglow, start, stop])

  return {
    isEnabled: settings.canvasGlow && capabilities.supportsUnderglow && enabled.current,
    isSupported: capabilities.supportsUnderglow && !isSafari.current && !isMobileDevice.current,
    toggle,
    start,
    stop,
    cleanup
  }
}