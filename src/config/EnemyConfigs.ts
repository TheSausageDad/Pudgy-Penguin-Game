import { EnemyStats } from '../objects/Enemy'

export const ENEMY_CONFIGS: EnemyStats[] = [
  // Type 1 - Orange Carrot (Basic - Balanced)
  {
    type: 1,
    name: 'Orange Carrot',
    health: 35,
    speed: 70,
    reward: 10,
    damage: 1,
    color: 0xFF8C00
  },
  // Type 2 - Yellow Carrot (Basic - Fast but weak)
  {
    type: 2,
    name: 'Yellow Carrot',
    health: 28,
    speed: 105,
    reward: 12,
    damage: 1,
    color: 0xFFD700
  },
  // Type 3 - Purple Carrot (Basic - Tanky but slow)
  {
    type: 3,
    name: 'Purple Carrot',
    health: 60,
    speed: 55,
    reward: 15,
    damage: 1,
    color: 0x9370DB
  },
  // Type 4 - Black Carrot (Intermediate - Balanced upgrade)
  {
    type: 4,
    name: 'Black Carrot',
    health: 120,
    speed: 80,
    reward: 30,
    damage: 2,
    color: 0x2C2C2C
  },
  // Type 5 - Steel Carrot (Intermediate - Very tanky)
  {
    type: 5,
    name: 'Steel Carrot',
    health: 220,
    speed: 50,
    reward: 45,
    damage: 2,
    color: 0x708090
  },
  // Type 6 - White Carrot (Intermediate - Fast threat)
  {
    type: 6,
    name: 'White Carrot',
    health: 100,
    speed: 120,
    reward: 35,
    damage: 2,
    color: 0xF5F5F5
  },
  // Type 7 - Blue Carrot (Hard - Well-rounded)
  {
    type: 7,
    name: 'Blue Carrot',
    health: 270,
    speed: 90,
    reward: 70,
    damage: 3,
    color: 0x4169E1
  },
  // Type 8 - Fire Carrot (Hard - High damage threat)
  {
    type: 8,
    name: 'Fire Carrot',
    health: 220,
    speed: 105,
    reward: 80,
    damage: 4,
    color: 0xFF4500
  },
  // Type 9 - Icy Carrot (Very Hard - Super tanky)
  {
    type: 9,
    name: 'Icy Carrot',
    health: 520,
    speed: 65,
    reward: 120,
    damage: 4,
    color: 0x87CEEB
  },
  // Type 10 - Green Carrot (Boss - Ultimate challenge)
  {
    type: 10,
    name: 'Green Carrot',
    health: 750,
    speed: 75,
    reward: 200,
    damage: 5,
    color: 0x32CD32
  }
]

export function getEnemyConfig(type: number): EnemyStats | undefined {
  return ENEMY_CONFIGS.find(e => e.type === type)
}

export function getAllEnemyConfigs(): EnemyStats[] {
  return ENEMY_CONFIGS
}

// Wave composition - Aggressive progression with 10 carrot types
export function getWaveEnemies(waveNumber: number): { type: number, count: number }[] {
  const waves: { type: number, count: number }[] = []

  // Waves 1-3: Quick tutorial - Only Orange Carrots
  if (waveNumber <= 3) {
    waves.push({ type: 1, count: 5 + waveNumber * 3 })
    return waves
  }

  // Waves 4-8: Introduce Yellow Carrot (fast) early
  if (waveNumber <= 8) {
    waves.push({ type: 1, count: 12 + waveNumber * 2 })
    waves.push({ type: 2, count: Math.floor((waveNumber - 3) * 2) })
    return waves.filter(w => w.count > 0)
  }

  // Waves 9-12: Introduce Purple Carrot (tanky)
  if (waveNumber <= 12) {
    waves.push({ type: 1, count: 15 + waveNumber * 2 })
    waves.push({ type: 2, count: 8 + waveNumber })
    waves.push({ type: 3, count: Math.floor((waveNumber - 8) * 2) })
    return waves.filter(w => w.count > 0)
  }

  // Waves 13-18: Introduce Black Carrot (intermediate)
  if (waveNumber <= 18) {
    waves.push({ type: 1, count: 18 + waveNumber * 2 })
    waves.push({ type: 2, count: 12 + waveNumber })
    waves.push({ type: 3, count: 8 + Math.floor(waveNumber / 2) })
    waves.push({ type: 4, count: Math.floor((waveNumber - 12) * 1.5) })
    return waves.filter(w => w.count > 0)
  }

  // Waves 19-25: Introduce Steel Carrot (very tanky)
  if (waveNumber <= 25) {
    waves.push({ type: 1, count: 22 + waveNumber * 2 })
    waves.push({ type: 2, count: 15 + waveNumber })
    waves.push({ type: 3, count: 12 + Math.floor(waveNumber / 2) })
    waves.push({ type: 4, count: 6 + Math.floor(waveNumber / 2) })
    waves.push({ type: 5, count: Math.floor((waveNumber - 18) * 1.5) })
    return waves.filter(w => w.count > 0)
  }

  // Waves 26-32: Introduce White Carrot (fast threat)
  if (waveNumber <= 32) {
    waves.push({ type: 1, count: 26 + waveNumber * 2 })
    waves.push({ type: 2, count: 18 + waveNumber })
    waves.push({ type: 3, count: 15 + Math.floor(waveNumber / 2) })
    waves.push({ type: 4, count: 10 + Math.floor(waveNumber / 2) })
    waves.push({ type: 5, count: 5 + Math.floor(waveNumber / 3) })
    waves.push({ type: 6, count: Math.floor((waveNumber - 25) * 1.5) })
    return waves.filter(w => w.count > 0)
  }

  // Waves 33-42: Introduce Blue Carrot (hard)
  if (waveNumber <= 42) {
    waves.push({ type: 1, count: 30 + waveNumber * 2 })
    waves.push({ type: 2, count: 22 + waveNumber })
    waves.push({ type: 3, count: 18 + Math.floor(waveNumber / 2) })
    waves.push({ type: 4, count: 14 + Math.floor(waveNumber / 2) })
    waves.push({ type: 5, count: 8 + Math.floor(waveNumber / 3) })
    waves.push({ type: 6, count: 6 + Math.floor(waveNumber / 4) })
    waves.push({ type: 7, count: Math.floor((waveNumber - 32) * 1.2) })
    return waves.filter(w => w.count > 0)
  }

  // Waves 43-52: Introduce Fire Carrot (high damage)
  if (waveNumber <= 52) {
    waves.push({ type: 1, count: 35 + waveNumber * 2 })
    waves.push({ type: 2, count: 28 + waveNumber })
    waves.push({ type: 3, count: 22 + Math.floor(waveNumber / 2) })
    waves.push({ type: 4, count: 18 + Math.floor(waveNumber / 2) })
    waves.push({ type: 5, count: 12 + Math.floor(waveNumber / 3) })
    waves.push({ type: 6, count: 10 + Math.floor(waveNumber / 4) })
    waves.push({ type: 7, count: 5 + Math.floor(waveNumber / 5) })
    waves.push({ type: 8, count: Math.floor((waveNumber - 42) * 1.2) })
    return waves.filter(w => w.count > 0)
  }

  // Waves 53-65: Introduce Icy Carrot (super tanky)
  if (waveNumber <= 65) {
    waves.push({ type: 1, count: 40 + waveNumber * 2 })
    waves.push({ type: 2, count: 32 + waveNumber })
    waves.push({ type: 3, count: 26 + Math.floor(waveNumber / 2) })
    waves.push({ type: 4, count: 22 + Math.floor(waveNumber / 2) })
    waves.push({ type: 5, count: 16 + Math.floor(waveNumber / 3) })
    waves.push({ type: 6, count: 14 + Math.floor(waveNumber / 4) })
    waves.push({ type: 7, count: 8 + Math.floor(waveNumber / 5) })
    waves.push({ type: 8, count: 5 + Math.floor(waveNumber / 6) })
    waves.push({ type: 9, count: Math.floor((waveNumber - 52) * 1.2) })
    return waves.filter(w => w.count > 0)
  }

  // Waves 66-118: Introduce Green Carrot (boss) + final challenge
  if (waveNumber <= 118) {
    waves.push({ type: 1, count: 45 + waveNumber * 2 })
    waves.push({ type: 2, count: 36 + waveNumber })
    waves.push({ type: 3, count: 30 + Math.floor(waveNumber / 2) })
    waves.push({ type: 4, count: 26 + Math.floor(waveNumber / 2) })
    waves.push({ type: 5, count: 20 + Math.floor(waveNumber / 3) })
    waves.push({ type: 6, count: 18 + Math.floor(waveNumber / 4) })
    waves.push({ type: 7, count: 12 + Math.floor(waveNumber / 5) })
    waves.push({ type: 8, count: 8 + Math.floor(waveNumber / 6) })
    waves.push({ type: 9, count: 5 + Math.floor(waveNumber / 7) })
    if (waveNumber >= 66) {
      waves.push({ type: 10, count: Math.floor((waveNumber - 65) / 4) })
    }
    return waves.filter(w => w.count > 0)
  }

  // Endless mode (119+): All 10 carrot types with scaling
  const endlessMultiplier = 1 + (waveNumber - 118) * 0.08
  waves.push({ type: 1, count: Math.floor(50 * endlessMultiplier) })
  waves.push({ type: 2, count: Math.floor(42 * endlessMultiplier) })
  waves.push({ type: 3, count: Math.floor(36 * endlessMultiplier) })
  waves.push({ type: 4, count: Math.floor(30 * endlessMultiplier) })
  waves.push({ type: 5, count: Math.floor(26 * endlessMultiplier) })
  waves.push({ type: 6, count: Math.floor(22 * endlessMultiplier) })
  waves.push({ type: 7, count: Math.floor(18 * endlessMultiplier) })
  waves.push({ type: 8, count: Math.floor(14 * endlessMultiplier) })
  waves.push({ type: 9, count: Math.floor(12 * endlessMultiplier) })
  waves.push({ type: 10, count: Math.floor(10 * endlessMultiplier) })

  return waves.filter(w => w.count > 0)
}
