export interface MapConfig {
  id: number
  name: string
  backgroundColor: number
  path: Phaser.Math.Vector2[]
  // Grid configuration per map
  grid: {
    cellSize: number      // Size of each grid cell in pixels
    offsetX: number       // Horizontal offset from left edge
    offsetY: number       // Vertical offset from top edge (default 0)
  }
}
