import { EnemyStats } from '../objects/Enemy'

export const ENEMY_CONFIGS: EnemyStats[] = [
  // Type 1 - Orange Carrot (Basic - Balanced)
  {
    type: 1,
    name: 'Orange Carrot',
    health: 25,
    speed: 60,
    reward: 10,
    damage: 1,
    color: 0xFF8C00
  },
  // Type 2 - Yellow Carrot (Basic - Fast but weak)
  {
    type: 2,
    name: 'Yellow Carrot',
    health: 20,
    speed: 90,
    reward: 12,
    damage: 1,
    color: 0xFFD700
  },
  // Type 3 - Purple Carrot (Basic - Tanky but slow)
  {
    type: 3,
    name: 'Purple Carrot',
    health: 40,
    speed: 45,
    reward: 15,
    damage: 1,
    color: 0x9370DB
  },
  // Type 4 - Black Carrot (Intermediate - Balanced upgrade)
  {
    type: 4,
    name: 'Black Carrot',
    health: 80,
    speed: 65,
    reward: 30,
    damage: 2,
    color: 0x2C2C2C
  },
  // Type 5 - Steel Carrot (Intermediate - Very tanky)
  {
    type: 5,
    name: 'Steel Carrot',
    health: 150,
    speed: 40,
    reward: 45,
    damage: 2,
    color: 0x708090
  },
  // Type 6 - White Carrot (Intermediate - Fast threat)
  {
    type: 6,
    name: 'White Carrot',
    health: 70,
    speed: 100,
    reward: 35,
    damage: 2,
    color: 0xF5F5F5
  },
  // Type 7 - Blue Carrot (Hard - Well-rounded)
  {
    type: 7,
    name: 'Blue Carrot',
    health: 180,
    speed: 75,
    reward: 70,
    damage: 3,
    color: 0x4169E1
  },
  // Type 8 - Fire Carrot (Hard - High damage threat)
  {
    type: 8,
    name: 'Fire Carrot',
    health: 150,
    speed: 85,
    reward: 80,
    damage: 4,
    color: 0xFF4500
  },
  // Type 9 - Icy Carrot (Very Hard - Super tanky)
  {
    type: 9,
    name: 'Icy Carrot',
    health: 350,
    speed: 50,
    reward: 120,
    damage: 4,
    color: 0x87CEEB
  },
  // Type 10 - Green Carrot (Boss - Ultimate challenge)
  {
    type: 10,
    name: 'Green Carrot',
    health: 500,
    speed: 60,
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

// Wave composition - Balanced progression with 10 carrot types
export function getWaveEnemies(waveNumber: number): { type: number, count: number }[] {
  const waves: { type: number, count: number }[] = []

  // Waves 1-5: Tutorial - Only Orange Carrots
  if (waveNumber <= 5) {
    waves.push({ type: 1, count: 3 + waveNumber * 2 })
    return waves
  }

  // Waves 6-10: Introduce Yellow Carrot (fast)
  if (waveNumber <= 10) {
    waves.push({ type: 1, count: 8 + waveNumber })
    waves.push({ type: 2, count: Math.floor((waveNumber - 5) * 1.5) })
    return waves.filter(w => w.count > 0)
  }

  // Waves 11-15: Introduce Purple Carrot (tanky)
  if (waveNumber <= 15) {
    waves.push({ type: 1, count: 10 + waveNumber })
    waves.push({ type: 2, count: 5 + Math.floor(waveNumber / 2) })
    waves.push({ type: 3, count: Math.floor((waveNumber - 10) * 1.2) })
    return waves.filter(w => w.count > 0)
  }

  // Waves 16-22: Introduce Black Carrot (intermediate)
  if (waveNumber <= 22) {
    waves.push({ type: 1, count: 12 + waveNumber })
    waves.push({ type: 2, count: 8 + Math.floor(waveNumber / 2) })
    waves.push({ type: 3, count: 5 + Math.floor(waveNumber / 3) })
    waves.push({ type: 4, count: Math.floor((waveNumber - 15) / 2) })
    return waves.filter(w => w.count > 0)
  }

  // Waves 23-30: Introduce Steel Carrot (very tanky)
  if (waveNumber <= 30) {
    waves.push({ type: 1, count: 15 + waveNumber })
    waves.push({ type: 2, count: 10 + Math.floor(waveNumber / 2) })
    waves.push({ type: 3, count: 8 + Math.floor(waveNumber / 3) })
    waves.push({ type: 4, count: 4 + Math.floor(waveNumber / 4) })
    waves.push({ type: 5, count: Math.floor((waveNumber - 22) / 2) })
    return waves.filter(w => w.count > 0)
  }

  // Waves 31-40: Introduce White Carrot (fast threat)
  if (waveNumber <= 40) {
    waves.push({ type: 1, count: 18 + waveNumber })
    waves.push({ type: 2, count: 12 + Math.floor(waveNumber / 2) })
    waves.push({ type: 3, count: 10 + Math.floor(waveNumber / 3) })
    waves.push({ type: 4, count: 6 + Math.floor(waveNumber / 4) })
    waves.push({ type: 5, count: 3 + Math.floor(waveNumber / 5) })
    waves.push({ type: 6, count: Math.floor((waveNumber - 30) / 2) })
    return waves.filter(w => w.count > 0)
  }

  // Waves 41-52: Introduce Blue Carrot (hard)
  if (waveNumber <= 52) {
    waves.push({ type: 1, count: 20 + waveNumber })
    waves.push({ type: 2, count: 15 + Math.floor(waveNumber / 2) })
    waves.push({ type: 3, count: 12 + Math.floor(waveNumber / 3) })
    waves.push({ type: 4, count: 8 + Math.floor(waveNumber / 4) })
    waves.push({ type: 5, count: 5 + Math.floor(waveNumber / 5) })
    waves.push({ type: 6, count: 4 + Math.floor(waveNumber / 6) })
    waves.push({ type: 7, count: Math.floor((waveNumber - 40) / 3) })
    return waves.filter(w => w.count > 0)
  }

  // Waves 53-65: Introduce Fire Carrot (high damage)
  if (waveNumber <= 65) {
    waves.push({ type: 1, count: 22 + waveNumber })
    waves.push({ type: 2, count: 18 + Math.floor(waveNumber / 2) })
    waves.push({ type: 3, count: 15 + Math.floor(waveNumber / 3) })
    waves.push({ type: 4, count: 10 + Math.floor(waveNumber / 4) })
    waves.push({ type: 5, count: 7 + Math.floor(waveNumber / 5) })
    waves.push({ type: 6, count: 6 + Math.floor(waveNumber / 6) })
    waves.push({ type: 7, count: 3 + Math.floor(waveNumber / 7) })
    waves.push({ type: 8, count: Math.floor((waveNumber - 52) / 3) })
    return waves.filter(w => w.count > 0)
  }

  // Waves 66-80: Introduce Icy Carrot (super tanky)
  if (waveNumber <= 80) {
    waves.push({ type: 1, count: 25 + waveNumber })
    waves.push({ type: 2, count: 20 + Math.floor(waveNumber / 2) })
    waves.push({ type: 3, count: 18 + Math.floor(waveNumber / 3) })
    waves.push({ type: 4, count: 12 + Math.floor(waveNumber / 4) })
    waves.push({ type: 5, count: 9 + Math.floor(waveNumber / 5) })
    waves.push({ type: 6, count: 8 + Math.floor(waveNumber / 6) })
    waves.push({ type: 7, count: 5 + Math.floor(waveNumber / 7) })
    waves.push({ type: 8, count: 3 + Math.floor(waveNumber / 8) })
    waves.push({ type: 9, count: Math.floor((waveNumber - 65) / 4) })
    return waves.filter(w => w.count > 0)
  }

  // Waves 81-118: Introduce Green Carrot (boss) + final challenge
  if (waveNumber <= 118) {
    waves.push({ type: 1, count: 28 + waveNumber })
    waves.push({ type: 2, count: 22 + Math.floor(waveNumber / 2) })
    waves.push({ type: 3, count: 20 + Math.floor(waveNumber / 3) })
    waves.push({ type: 4, count: 15 + Math.floor(waveNumber / 4) })
    waves.push({ type: 5, count: 11 + Math.floor(waveNumber / 5) })
    waves.push({ type: 6, count: 10 + Math.floor(waveNumber / 6) })
    waves.push({ type: 7, count: 7 + Math.floor(waveNumber / 7) })
    waves.push({ type: 8, count: 5 + Math.floor(waveNumber / 8) })
    waves.push({ type: 9, count: 3 + Math.floor(waveNumber / 9) })
    if (waveNumber >= 81) {
      waves.push({ type: 10, count: Math.floor((waveNumber - 80) / 5) })
    }
    return waves.filter(w => w.count > 0)
  }

  // Endless mode (100+): All 10 carrot types with scaling
  const endlessMultiplier = 1 + (waveNumber - 100) * 0.15
  waves.push({ type: 1, count: Math.floor((30 + waveNumber) * endlessMultiplier) })
  waves.push({ type: 2, count: Math.floor((25 + waveNumber / 2) * endlessMultiplier) })
  waves.push({ type: 3, count: Math.floor((22 + waveNumber / 3) * endlessMultiplier) })
  waves.push({ type: 4, count: Math.floor((18 + waveNumber / 4) * endlessMultiplier) })
  waves.push({ type: 5, count: Math.floor((14 + waveNumber / 5) * endlessMultiplier) })
  waves.push({ type: 6, count: Math.floor((12 + waveNumber / 6) * endlessMultiplier) })
  waves.push({ type: 7, count: Math.floor((10 + waveNumber / 7) * endlessMultiplier) })
  waves.push({ type: 8, count: Math.floor((8 + waveNumber / 8) * endlessMultiplier) })
  waves.push({ type: 9, count: Math.floor((6 + waveNumber / 9) * endlessMultiplier) })
  waves.push({ type: 10, count: Math.floor((4 + waveNumber / 10) * endlessMultiplier) })

  return waves.filter(w => w.count > 0)
}
