import { TowerStats } from '../objects/Tower'

export const TOWER_CONFIGS: TowerStats[] = [
  // BASIC TOWERS (1-4)
  {
    type: 1,
    name: 'Focused Falcon',
    cost: 100,
    damage: 10,
    range: 150,
    fireRate: 1,
    color: 0x8BC34A,
    upgrades: {
      pathA: [
        { name: 'Sharp Focus', cost: 150, damageBonus: 8, rangeBonus: 20 },
        { name: 'Precision Strike', cost: 300, damageBonus: 18, rangeBonus: 40, special: 'bonus_accuracy' }
      ],
      pathB: [
        { name: 'Quick Reflexes', cost: 120, fireRateBonus: 0.8 },
        { name: 'Lightning Speed', cost: 250, fireRateBonus: 1.8, damageBonus: 5, special: 'double_shot' }
      ]
    }
  },
  {
    type: 2,
    name: 'Ambitious Angel',
    cost: 120,
    damage: 8,
    range: 120,
    fireRate: 1.5,
    color: 0xFF5722,
    upgrades: {
      pathA: [
        { name: 'Team Leader', cost: 140, damageBonus: 5, special: 'chain_attack', rangeBonus: 20 },
        { name: 'Army Commander', cost: 280, damageBonus: 12, special: 'triple_chain', rangeBonus: 40 }
      ],
      pathB: [
        { name: 'Solo Ambition', cost: 130, damageBonus: 15, fireRateBonus: 0.3 },
        { name: 'Ruthless Strike', cost: 260, damageBonus: 35, fireRateBonus: 0.8, special: 'crit_chance' }
      ]
    }
  },
  {
    type: 3,
    name: 'Motivated Monster',
    cost: 90,
    damage: 12,
    range: 100,
    fireRate: 0.8,
    color: 0x4CAF50,
    upgrades: {
      pathA: [
        { name: 'Energy Burst', cost: 100, fireRateBonus: 0.6, damageBonus: 3 },
        { name: 'Unstoppable Force', cost: 200, fireRateBonus: 1.5, damageBonus: 10, special: 'chain_shots' }
      ],
      pathB: [
        { name: 'Mighty Leap', cost: 110, damageBonus: 12, rangeBonus: 35 },
        { name: 'Aerial Assault', cost: 220, damageBonus: 28, rangeBonus: 70, special: 'splash_landing' }
      ]
    }
  },
  {
    type: 4,
    name: 'Dialed In Dog',
    cost: 110,
    damage: 6,
    range: 140,
    fireRate: 2,
    color: 0x9E9E9E,
    upgrades: {
      pathA: [
        { name: 'Team Support', cost: 150, fireRateBonus: 0.5, special: 'heal_nearby' },
        { name: 'Motivational Aura', cost: 300, fireRateBonus: 1, special: 'buff_nearby_towers', rangeBonus: 30 }
      ],
      pathB: [
        { name: 'Laser Focus', cost: 130, damageBonus: 12, fireRateBonus: 0.8 },
        { name: 'Perfect Execution', cost: 260, damageBonus: 28, fireRateBonus: 1.8, rangeBonus: 40 }
      ]
    }
  },

  // MEDIUM TOWERS (5-8)
  {
    type: 5,
    name: 'Empathy Elephant',
    cost: 200,
    damage: 35,
    range: 180,
    fireRate: 0.6,
    color: 0x2196F3,
    upgrades: {
      pathA: [
        { name: 'Understanding', cost: 250, damageBonus: 25, special: 'armor_pierce', rangeBonus: 30 },
        { name: 'Merciful End', cost: 500, damageBonus: 65, special: 'instant_kill_weak', rangeBonus: 60 }
      ],
      pathB: [
        { name: 'Far Sight', cost: 220, rangeBonus: 90, damageBonus: 10 },
        { name: 'Global Awareness', cost: 440, rangeBonus: 200, damageBonus: 30, special: 'see_all' }
      ],
      pathC: [
        { name: 'Quick Response', cost: 240, fireRateBonus: 0.6, damageBonus: 15 },
        { name: 'Caring Barrage', cost: 480, fireRateBonus: 1.5, damageBonus: 30, special: 'multi_shot' }
      ]
    }
  },
  {
    type: 6,
    name: 'Adaptable Alien',
    cost: 250,
    damage: 15,
    range: 130,
    fireRate: 3,
    color: 0xE91E63,
    upgrades: {
      pathA: [
        { name: 'Rapid Adaptation', cost: 280, fireRateBonus: 2.5, damageBonus: 8, special: 'splash_damage' },
        { name: 'Swarm Form', cost: 560, fireRateBonus: 5, damageBonus: 20, special: 'multi_projectile' }
      ],
      pathB: [
        { name: 'Power Surge', cost: 300, damageBonus: 30, fireRateBonus: 0.5 },
        { name: 'Overload Mode', cost: 600, damageBonus: 70, fireRateBonus: 1, special: 'stun_blast' }
      ],
      pathC: [
        { name: 'Alien Tech', cost: 270, special: 'track_multiple', rangeBonus: 30 },
        { name: 'Universal Mind', cost: 540, special: 'buff_all_towers', rangeBonus: 60, damageBonus: 15 }
      ]
    }
  },
  {
    type: 7,
    name: 'Fearless Fairy',
    cost: 300,
    damage: 20,
    range: 200,
    fireRate: 1.2,
    color: 0xFFEB3B,
    upgrades: {
      pathA: [
        { name: 'Brave Control', cost: 350, damageBonus: 10, special: 'slow_enemies' },
        { name: 'Fearless Freeze', cost: 700, damageBonus: 25, special: 'freeze_enemies', rangeBonus: 50 }
      ],
      pathB: [
        { name: 'Daring Strike', cost: 320, damageBonus: 35, special: 'aoe_bomb' },
        { name: 'Bold Bombardment', cost: 640, damageBonus: 80, special: 'massive_aoe', rangeBonus: 40 }
      ],
      pathC: [
        { name: 'Courageous Reach', cost: 340, rangeBonus: 110, damageBonus: 15 },
        { name: 'Heroic Range', cost: 680, rangeBonus: 250, damageBonus: 40, fireRateBonus: 0.5 }
      ]
    }
  },
  {
    type: 8,
    name: 'Patient Panda',
    cost: 280,
    damage: 40,
    range: 110,
    fireRate: 0.7,
    color: 0x009688,
    upgrades: {
      pathA: [
        { name: 'Patient Strike', cost: 320, damageBonus: 45, special: 'execute_low_health' },
        { name: 'Calculated Finish', cost: 640, damageBonus: 100, special: 'execute_lifesteal', rangeBonus: 30 }
      ],
      pathB: [
        { name: 'Gradual Poison', cost: 310, damageBonus: 15, rangeBonus: 40, special: 'poison_dot' },
        { name: 'Patience Pays', cost: 620, damageBonus: 50, rangeBonus: 80, special: 'strong_poison_dot' }
      ]
    }
  },

  // ADVANCED TOWERS (9-12)
  {
    type: 9,
    name: 'Brave Bison',
    cost: 350,
    damage: 25,
    range: 160,
    fireRate: 1.8,
    color: 0xFF9800,
    upgrades: {
      pathA: [
        { name: 'Brave Charge', cost: 400, damageBonus: 30, special: 'multi_target', rangeBonus: 30 },
        { name: 'Fearless Stampede', cost: 800, damageBonus: 70, special: 'massive_multi_target', rangeBonus: 60 }
      ],
      pathB: [
        { name: 'Bold Attack', cost: 380, fireRateBonus: 1.8, damageBonus: 25 },
        { name: 'Daring Assault', cost: 760, fireRateBonus: 3.5, damageBonus: 55, special: 'lifesteal' }
      ],
      pathC: [
        { name: 'Courage Boost', cost: 420, fireRateBonus: 2.5, rangeBonus: 40 },
        { name: 'Unstoppable Spirit', cost: 840, fireRateBonus: 5.5, rangeBonus: 90, damageBonus: 30 }
      ]
    }
  },
  {
    type: 10,
    name: 'Driven Dragon',
    cost: 380,
    damage: 18,
    range: 220,
    fireRate: 1.5,
    color: 0x607D8B,
    upgrades: {
      pathA: [
        { name: 'Driven Leader', cost: 420, damageBonus: 10, special: 'buff_nearby_20%', rangeBonus: 30 },
        { name: 'Relentless Commander', cost: 840, damageBonus: 25, special: 'buff_all_40%', rangeBonus: 60 }
      ],
      pathB: [
        { name: 'Goal Oriented', cost: 400, damageBonus: 15, special: 'bonus_coins' },
        { name: 'Success Driven', cost: 800, damageBonus: 35, special: 'double_coins', fireRateBonus: 0.8 }
      ],
      pathC: [
        { name: 'Determined Strike', cost: 450, damageBonus: 40, fireRateBonus: 0.8 },
        { name: 'Unstoppable Drive', cost: 900, damageBonus: 90, fireRateBonus: 1.8, special: 'persistent_damage' }
      ]
    }
  },
  {
    type: 11,
    name: 'Balanced Beetle',
    cost: 420,
    damage: 30,
    range: 170,
    fireRate: 1.3,
    color: 0x8BC34A,
    upgrades: {
      pathA: [
        { name: 'Power Balance', cost: 500, damageBonus: 35, fireRateBonus: 0.6 },
        { name: 'Perfect Equilibrium', cost: 1000, damageBonus: 80, fireRateBonus: 1.5, rangeBonus: 50 }
      ],
      pathB: [
        { name: 'Adaptive Balance', cost: 480, damageBonus: 25, special: 'adaptive_damage', rangeBonus: 40 },
        { name: 'Universal Harmony', cost: 960, damageBonus: 60, special: 'pierce_all', rangeBonus: 90 }
      ],
      pathC: [
        { name: 'Range Balance', cost: 460, damageBonus: 30, rangeBonus: 70 },
        { name: 'Centered Mastery', cost: 920, damageBonus: 70, rangeBonus: 150, special: 'steady_damage' }
      ]
    }
  },
  {
    type: 12,
    name: 'Adventurous Astronaut',
    cost: 400,
    damage: 28,
    range: 190,
    fireRate: 1.1,
    color: 0x9C27B0,
    upgrades: {
      pathA: [
        { name: 'Space Explorer', cost: 450, rangeBonus: 110, damageBonus: 15, special: 'see_far' },
        { name: 'Galaxy Traveler', cost: 900, rangeBonus: 250, damageBonus: 40, special: 'infinite_range' }
      ],
      pathB: [
        { name: 'Bold Discovery', cost: 480, damageBonus: 55, fireRateBonus: 0.5 },
        { name: 'Cosmic Power', cost: 960, damageBonus: 120, fireRateBonus: 1.2, special: 'star_burst' }
      ],
      pathC: [
        { name: 'Quick Explorer', cost: 460, fireRateBonus: 1.2, damageBonus: 25, rangeBonus: 40 },
        { name: 'Unstoppable Journey', cost: 920, fireRateBonus: 2.5, damageBonus: 65, rangeBonus: 80 }
      ]
    }
  },

  // ELITE TOWERS (13-16)
  {
    type: 13,
    name: 'Creative Crab',
    cost: 500,
    damage: 50,
    range: 140,
    fireRate: 0.8,
    color: 0x795548,
    upgrades: {
      pathA: [
        { name: 'Creative Flow', cost: 600, damageBonus: 35, special: 'slow_aura', rangeBonus: 30 },
        { name: 'Artistic Tsunami', cost: 1200, damageBonus: 110, special: 'massive_knockback', rangeBonus: 60 }
      ],
      pathB: [
        { name: 'Creative Shield', cost: 580, damageBonus: 25, special: 'defense_aura' },
        { name: 'Imagination Fortress', cost: 1160, damageBonus: 60, special: 'protect_all', rangeBonus: 40 }
      ],
      pathC: [
        { name: 'Creative Strike', cost: 620, damageBonus: 90, fireRateBonus: 0.4 },
        { name: 'Masterpiece Blow', cost: 1240, damageBonus: 200, fireRateBonus: 0.9, special: 'art_explosion' }
      ]
    }
  },
  {
    type: 14,
    name: 'Competitive Clown',
    cost: 550,
    damage: 45,
    range: 250,
    fireRate: 1,
    color: 0x3F51B5,
    upgrades: {
      pathA: [
        { name: 'Win Recovery', cost: 650, damageBonus: 30, special: 'heal_on_kill' },
        { name: 'Victory Comeback', cost: 1300, damageBonus: 70, special: 'bonus_after_kill', fireRateBonus: 0.8 }
      ],
      pathB: [
        { name: 'Competitive Edge', cost: 620, damageBonus: 80, special: 'aoe_impact' },
        { name: 'Winning Blow', cost: 1240, damageBonus: 170, special: 'massive_aoe', fireRateBonus: 0.6 }
      ],
      pathC: [
        { name: 'Strategic Position', cost: 680, rangeBonus: 160, damageBonus: 35 },
        { name: 'Dominating Range', cost: 1360, rangeBonus: 350, damageBonus: 80, special: 'map_control' }
      ]
    }
  },
  {
    type: 15,
    name: 'Genuine Giraffe',
    cost: 600,
    damage: 35,
    range: 200,
    fireRate: 1.6,
    color: 0x000000,
    upgrades: {
      pathA: [
        { name: 'Honest Strike', cost: 700, damageBonus: 50, special: 'true_damage', rangeBonus: 40 },
        { name: 'Pure Truth', cost: 1400, damageBonus: 120, special: 'ignore_all_defense', rangeBonus: 90 }
      ],
      pathB: [
        { name: 'Authentic Sight', cost: 680, damageBonus: 40, special: 'see_weakness', fireRateBonus: 0.8 },
        { name: 'Real Power', cost: 1360, damageBonus: 95, special: 'expose_all', fireRateBonus: 1.8 }
      ],
      pathC: [
        { name: 'Genuine Reach', cost: 720, rangeBonus: 100, damageBonus: 45 },
        { name: 'True Connection', cost: 1440, rangeBonus: 220, damageBonus: 105, special: 'sincere_damage' }
      ]
    }
  },
  {
    type: 16,
    name: 'Helpful Hippo',
    cost: 800,
    damage: 80,
    range: 160,
    fireRate: 0.5,
    color: 0xF44336,
    upgrades: {
      pathA: [
        { name: 'Helpful Fire', cost: 1000, damageBonus: 110, special: 'burn_dot', rangeBonus: 30 },
        { name: 'Supportive Inferno', cost: 2000, damageBonus: 280, special: 'team_fire_aura', rangeBonus: 70 }
      ],
      pathB: [
        { name: 'Protective Help', cost: 950, damageBonus: 70, special: 'shield_nearby' },
        { name: 'Guardian Spirit', cost: 1900, damageBonus: 180, special: 'protect_all_towers', rangeBonus: 50 }
      ],
      pathC: [
        { name: 'Helping Hand', cost: 1100, rangeBonus: 110, damageBonus: 130, fireRateBonus: 0.3 },
        { name: 'Ultimate Aid', cost: 2200, rangeBonus: 230, damageBonus: 350, fireRateBonus: 0.8, special: 'help_all' }
      ]
    }
  }
]

export function getTowerConfig(type: number): TowerStats | undefined {
  return TOWER_CONFIGS.find(t => t.type === type)
}

export function getAllTowerConfigs(): TowerStats[] {
  return TOWER_CONFIGS
}
