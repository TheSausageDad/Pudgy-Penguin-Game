import { EnemyStats } from '../objects/Enemy'

export const ENEMY_CONFIGS: EnemyStats[] = [
  // BASIC ENEMIES (1-5)
  {
    type: 1,
    name: 'Grumpy Goblin',
    health: 30,
    speed: 70,
    reward: 15,
    damage: 1,
    color: 0x8BC34A
  },
  {
    type: 2,
    name: 'Lazy Lizard',
    health: 25,
    speed: 50,
    reward: 12,
    damage: 1,
    color: 0x4CAF50
  },
  {
    type: 3,
    name: 'Rushed Rabbit',
    health: 20,
    speed: 100,
    reward: 18,
    damage: 1,
    color: 0xFFEB3B
  },
  {
    type: 4,
    name: 'Sneaky Sloth',
    health: 35,
    speed: 40,
    reward: 14,
    damage: 1,
    color: 0xA1887F
  },
  {
    type: 5,
    name: 'Bitter Bat',
    health: 18,
    speed: 120,
    reward: 20,
    damage: 1,
    color: 0x9E9E9E
  },

  // INTERMEDIATE ENEMIES (6-11)
  {
    type: 6,
    name: 'Selfish Serpent',
    health: 100,
    speed: 85,
    reward: 40,
    damage: 2,
    color: 0x9C27B0
  },
  {
    type: 7,
    name: 'Arrogant Ape',
    health: 130,
    speed: 65,
    reward: 50,
    damage: 2,
    color: 0x795548
  },
  {
    type: 8,
    name: 'Jealous Jackal',
    health: 90,
    speed: 105,
    reward: 45,
    damage: 2,
    color: 0xFF9800
  },
  {
    type: 9,
    name: 'Rude Rhino',
    health: 180,
    speed: 55,
    reward: 60,
    damage: 3,
    color: 0x607D8B
  },
  {
    type: 10,
    name: 'Nasty Newt',
    health: 110,
    speed: 90,
    reward: 48,
    damage: 2,
    color: 0x00BCD4
  },
  {
    type: 11,
    name: 'Toxic Toad',
    health: 95,
    speed: 75,
    reward: 52,
    damage: 2,
    color: 0x4DB6AC
  },

  // HARD ENEMIES (12-16)
  {
    type: 12,
    name: 'Vengeful Viper',
    health: 220,
    speed: 95,
    reward: 90,
    damage: 3,
    color: 0xE91E63
  },
  {
    type: 13,
    name: 'Destructive Demon',
    health: 350,
    speed: 55,
    reward: 120,
    damage: 5,
    color: 0xF44336
  },
  {
    type: 14,
    name: 'Wicked Whale',
    health: 400,
    speed: 50,
    reward: 130,
    damage: 4,
    color: 0x3F51B5
  },
  {
    type: 15,
    name: 'Sinister Shark',
    health: 280,
    speed: 88,
    reward: 110,
    damage: 4,
    color: 0x2196F3
  },
  {
    type: 16,
    name: 'Malicious Mammoth',
    health: 500,
    speed: 45,
    reward: 150,
    damage: 6,
    color: 0x5D4037
  },

  // BOSS ENEMIES (17-20)
  {
    type: 17,
    name: 'Chaos Dragon',
    health: 650,
    speed: 45,
    reward: 200,
    damage: 8,
    color: 0x000000
  },
  {
    type: 18,
    name: 'Shadow Beast',
    health: 800,
    speed: 60,
    reward: 250,
    damage: 10,
    color: 0x1A237E
  },
  {
    type: 19,
    name: 'Void Titan',
    health: 1000,
    speed: 40,
    reward: 300,
    damage: 12,
    color: 0x311B92
  },
  {
    type: 20,
    name: 'Nightmare King',
    health: 1500,
    speed: 50,
    reward: 400,
    damage: 15,
    color: 0x4A148C
  }
]

export function getEnemyConfig(type: number): EnemyStats | undefined {
  return ENEMY_CONFIGS.find(e => e.type === type)
}

export function getAllEnemyConfigs(): EnemyStats[] {
  return ENEMY_CONFIGS
}

// Wave composition helpers - Balanced like Bloons TD with 20 enemy types
export function getWaveEnemies(waveNumber: number): { type: number, count: number }[] {
  const waves: { type: number, count: number }[] = []

  // Waves 1-8: Very easy intro (only type 1)
  if (waveNumber <= 8) {
    waves.push({ type: 1, count: 3 + waveNumber })
    return waves.filter(w => w.count > 0)
  }

  // Waves 9-15: Introduce type 2, 3
  if (waveNumber <= 15) {
    waves.push({ type: 1, count: 8 + Math.floor(waveNumber / 2) })
    waves.push({ type: 2, count: Math.floor((waveNumber - 8) / 2) })
    if (waveNumber >= 12) {
      waves.push({ type: 3, count: Math.floor((waveNumber - 11) / 2) })
    }
    return waves.filter(w => w.count > 0)
  }

  // Waves 16-25: Introduce type 4, 5 (more basic variety)
  if (waveNumber <= 25) {
    waves.push({ type: 1, count: 10 + Math.floor(waveNumber / 3) })
    waves.push({ type: 2, count: 6 + Math.floor(waveNumber / 4) })
    waves.push({ type: 3, count: 5 + Math.floor(waveNumber / 4) })
    if (waveNumber >= 18) {
      waves.push({ type: 4, count: Math.floor((waveNumber - 17) / 3) })
    }
    if (waveNumber >= 22) {
      waves.push({ type: 5, count: Math.floor((waveNumber - 21) / 3) })
    }
    return waves.filter(w => w.count > 0)
  }

  // Waves 26-40: Introduce intermediate enemies (6, 7, 8)
  if (waveNumber <= 40) {
    waves.push({ type: 1, count: 12 + Math.floor(waveNumber / 3) })
    waves.push({ type: 2, count: 8 + Math.floor(waveNumber / 4) })
    waves.push({ type: 3, count: 6 + Math.floor(waveNumber / 4) })
    waves.push({ type: 4, count: 4 + Math.floor(waveNumber / 5) })
    waves.push({ type: 5, count: 4 + Math.floor(waveNumber / 5) })
    if (waveNumber >= 28) {
      waves.push({ type: 6, count: Math.floor((waveNumber - 27) / 4) })
    }
    if (waveNumber >= 32) {
      waves.push({ type: 7, count: Math.floor((waveNumber - 31) / 4) })
    }
    if (waveNumber >= 36) {
      waves.push({ type: 8, count: Math.floor((waveNumber - 35) / 4) })
    }
    return waves.filter(w => w.count > 0)
  }

  // Waves 41-55: More intermediate variety (9, 10, 11)
  if (waveNumber <= 55) {
    waves.push({ type: 1, count: 14 + Math.floor(waveNumber / 3) })
    waves.push({ type: 2, count: 10 + Math.floor(waveNumber / 4) })
    waves.push({ type: 3, count: 8 + Math.floor(waveNumber / 4) })
    waves.push({ type: 4, count: 6 + Math.floor(waveNumber / 5) })
    waves.push({ type: 5, count: 6 + Math.floor(waveNumber / 5) })
    waves.push({ type: 6, count: 4 + Math.floor(waveNumber / 6) })
    waves.push({ type: 7, count: 4 + Math.floor(waveNumber / 6) })
    waves.push({ type: 8, count: 3 + Math.floor(waveNumber / 6) })
    if (waveNumber >= 44) {
      waves.push({ type: 9, count: Math.floor((waveNumber - 43) / 5) })
    }
    if (waveNumber >= 48) {
      waves.push({ type: 10, count: Math.floor((waveNumber - 47) / 5) })
    }
    if (waveNumber >= 52) {
      waves.push({ type: 11, count: Math.floor((waveNumber - 51) / 5) })
    }
    return waves.filter(w => w.count > 0)
  }

  // Waves 56-70: Introduce hard enemies (12, 13, 14)
  if (waveNumber <= 70) {
    waves.push({ type: 1, count: 16 + Math.floor(waveNumber / 3) })
    waves.push({ type: 2, count: 12 + Math.floor(waveNumber / 4) })
    waves.push({ type: 3, count: 10 + Math.floor(waveNumber / 4) })
    waves.push({ type: 4, count: 8 + Math.floor(waveNumber / 5) })
    waves.push({ type: 5, count: 8 + Math.floor(waveNumber / 5) })
    waves.push({ type: 6, count: 6 + Math.floor(waveNumber / 6) })
    waves.push({ type: 7, count: 5 + Math.floor(waveNumber / 6) })
    waves.push({ type: 8, count: 5 + Math.floor(waveNumber / 6) })
    waves.push({ type: 9, count: 3 + Math.floor(waveNumber / 7) })
    waves.push({ type: 10, count: 3 + Math.floor(waveNumber / 7) })
    waves.push({ type: 11, count: 3 + Math.floor(waveNumber / 7) })
    if (waveNumber >= 58) {
      waves.push({ type: 12, count: Math.floor((waveNumber - 57) / 6) })
    }
    if (waveNumber >= 62) {
      waves.push({ type: 13, count: Math.floor((waveNumber - 61) / 6) })
    }
    if (waveNumber >= 66) {
      waves.push({ type: 14, count: Math.floor((waveNumber - 65) / 6) })
    }
    return waves.filter(w => w.count > 0)
  }

  // Waves 71-85: More hard enemies (15, 16)
  if (waveNumber <= 85) {
    waves.push({ type: 1, count: 18 + Math.floor(waveNumber / 3) })
    waves.push({ type: 2, count: 14 + Math.floor(waveNumber / 4) })
    waves.push({ type: 3, count: 12 + Math.floor(waveNumber / 4) })
    waves.push({ type: 4, count: 10 + Math.floor(waveNumber / 5) })
    waves.push({ type: 5, count: 10 + Math.floor(waveNumber / 5) })
    waves.push({ type: 6, count: 8 + Math.floor(waveNumber / 6) })
    waves.push({ type: 7, count: 7 + Math.floor(waveNumber / 6) })
    waves.push({ type: 8, count: 7 + Math.floor(waveNumber / 6) })
    waves.push({ type: 9, count: 5 + Math.floor(waveNumber / 7) })
    waves.push({ type: 10, count: 5 + Math.floor(waveNumber / 7) })
    waves.push({ type: 11, count: 5 + Math.floor(waveNumber / 7) })
    waves.push({ type: 12, count: 3 + Math.floor(waveNumber / 8) })
    waves.push({ type: 13, count: 2 + Math.floor(waveNumber / 8) })
    waves.push({ type: 14, count: 2 + Math.floor(waveNumber / 8) })
    if (waveNumber >= 74) {
      waves.push({ type: 15, count: Math.floor((waveNumber - 73) / 7) })
    }
    if (waveNumber >= 78) {
      waves.push({ type: 16, count: Math.floor((waveNumber - 77) / 7) })
    }
    return waves.filter(w => w.count > 0)
  }

  // Waves 86-100: Introduce boss enemies (17, 18)
  if (waveNumber <= 100) {
    waves.push({ type: 1, count: 20 + Math.floor(waveNumber / 2) })
    waves.push({ type: 2, count: 16 + Math.floor(waveNumber / 3) })
    waves.push({ type: 3, count: 14 + Math.floor(waveNumber / 3) })
    waves.push({ type: 4, count: 12 + Math.floor(waveNumber / 4) })
    waves.push({ type: 5, count: 12 + Math.floor(waveNumber / 4) })
    waves.push({ type: 6, count: 10 + Math.floor(waveNumber / 5) })
    waves.push({ type: 7, count: 9 + Math.floor(waveNumber / 5) })
    waves.push({ type: 8, count: 9 + Math.floor(waveNumber / 5) })
    waves.push({ type: 9, count: 7 + Math.floor(waveNumber / 6) })
    waves.push({ type: 10, count: 7 + Math.floor(waveNumber / 6) })
    waves.push({ type: 11, count: 7 + Math.floor(waveNumber / 6) })
    waves.push({ type: 12, count: 5 + Math.floor(waveNumber / 7) })
    waves.push({ type: 13, count: 4 + Math.floor(waveNumber / 7) })
    waves.push({ type: 14, count: 4 + Math.floor(waveNumber / 7) })
    waves.push({ type: 15, count: 3 + Math.floor(waveNumber / 8) })
    waves.push({ type: 16, count: 3 + Math.floor(waveNumber / 8) })
    if (waveNumber >= 88) {
      waves.push({ type: 17, count: Math.floor((waveNumber - 87) / 8) })
    }
    if (waveNumber >= 94) {
      waves.push({ type: 18, count: Math.floor((waveNumber - 93) / 9) })
    }
    return waves.filter(w => w.count > 0)
  }

  // Waves 101-118: Final bosses (19, 20) + everything
  if (waveNumber <= 118) {
    waves.push({ type: 1, count: 22 + Math.floor(waveNumber / 2) })
    waves.push({ type: 2, count: 18 + Math.floor(waveNumber / 3) })
    waves.push({ type: 3, count: 16 + Math.floor(waveNumber / 3) })
    waves.push({ type: 4, count: 14 + Math.floor(waveNumber / 4) })
    waves.push({ type: 5, count: 14 + Math.floor(waveNumber / 4) })
    waves.push({ type: 6, count: 12 + Math.floor(waveNumber / 4) })
    waves.push({ type: 7, count: 11 + Math.floor(waveNumber / 5) })
    waves.push({ type: 8, count: 11 + Math.floor(waveNumber / 5) })
    waves.push({ type: 9, count: 9 + Math.floor(waveNumber / 5) })
    waves.push({ type: 10, count: 9 + Math.floor(waveNumber / 5) })
    waves.push({ type: 11, count: 9 + Math.floor(waveNumber / 5) })
    waves.push({ type: 12, count: 7 + Math.floor(waveNumber / 6) })
    waves.push({ type: 13, count: 6 + Math.floor(waveNumber / 6) })
    waves.push({ type: 14, count: 6 + Math.floor(waveNumber / 6) })
    waves.push({ type: 15, count: 5 + Math.floor(waveNumber / 7) })
    waves.push({ type: 16, count: 5 + Math.floor(waveNumber / 7) })
    waves.push({ type: 17, count: 3 + Math.floor(waveNumber / 8) })
    waves.push({ type: 18, count: 2 + Math.floor(waveNumber / 9) })
    if (waveNumber >= 104) {
      waves.push({ type: 19, count: Math.floor((waveNumber - 103) / 10) })
    }
    if (waveNumber >= 110) {
      waves.push({ type: 20, count: Math.floor((waveNumber - 109) / 12) })
    }
    return waves.filter(w => w.count > 0)
  }

  // Endless mode (118+): All 20 enemy types with scaling
  const endlessMultiplier = 1 + (waveNumber - 118) * 0.25
  waves.push({ type: 1, count: Math.floor((25 + waveNumber / 2) * endlessMultiplier) })
  waves.push({ type: 2, count: Math.floor((20 + waveNumber / 3) * endlessMultiplier) })
  waves.push({ type: 3, count: Math.floor((18 + waveNumber / 3) * endlessMultiplier) })
  waves.push({ type: 4, count: Math.floor((16 + waveNumber / 4) * endlessMultiplier) })
  waves.push({ type: 5, count: Math.floor((16 + waveNumber / 4) * endlessMultiplier) })
  waves.push({ type: 6, count: Math.floor((14 + waveNumber / 4) * endlessMultiplier) })
  waves.push({ type: 7, count: Math.floor((13 + waveNumber / 5) * endlessMultiplier) })
  waves.push({ type: 8, count: Math.floor((13 + waveNumber / 5) * endlessMultiplier) })
  waves.push({ type: 9, count: Math.floor((11 + waveNumber / 5) * endlessMultiplier) })
  waves.push({ type: 10, count: Math.floor((11 + waveNumber / 5) * endlessMultiplier) })
  waves.push({ type: 11, count: Math.floor((11 + waveNumber / 5) * endlessMultiplier) })
  waves.push({ type: 12, count: Math.floor((9 + waveNumber / 6) * endlessMultiplier) })
  waves.push({ type: 13, count: Math.floor((8 + waveNumber / 6) * endlessMultiplier) })
  waves.push({ type: 14, count: Math.floor((8 + waveNumber / 6) * endlessMultiplier) })
  waves.push({ type: 15, count: Math.floor((7 + waveNumber / 7) * endlessMultiplier) })
  waves.push({ type: 16, count: Math.floor((7 + waveNumber / 7) * endlessMultiplier) })
  waves.push({ type: 17, count: Math.floor((5 + waveNumber / 8) * endlessMultiplier) })
  waves.push({ type: 18, count: Math.floor((4 + waveNumber / 9) * endlessMultiplier) })
  waves.push({ type: 19, count: Math.floor((3 + waveNumber / 10) * endlessMultiplier) })
  waves.push({ type: 20, count: Math.floor((2 + waveNumber / 12) * endlessMultiplier) })

  return waves.filter(w => w.count > 0)
}
