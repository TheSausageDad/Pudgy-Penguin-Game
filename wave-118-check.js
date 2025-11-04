/**
 * Check what's happening with Wave 118 - it shows a massive spike
 */

const ENEMY_CONFIGS = [
  { type: 1, name: 'Orange Carrot', health: 25, speed: 60, reward: 10, damage: 1 },
  { type: 2, name: 'Yellow Carrot', health: 20, speed: 90, reward: 12, damage: 1 },
  { type: 3, name: 'Purple Carrot', health: 40, speed: 45, reward: 15, damage: 1 },
  { type: 4, name: 'Black Carrot', health: 80, speed: 65, reward: 30, damage: 2 },
  { type: 5, name: 'Steel Carrot', health: 150, speed: 40, reward: 45, damage: 2 },
  { type: 6, name: 'White Carrot', health: 70, speed: 100, reward: 35, damage: 2 },
  { type: 7, name: 'Blue Carrot', health: 180, speed: 75, reward: 70, damage: 3 },
  { type: 8, name: 'Fire Carrot', health: 150, speed: 85, reward: 80, damage: 4 },
  { type: 9, name: 'Icy Carrot', health: 350, speed: 50, reward: 120, damage: 4 },
  { type: 10, name: 'Green Carrot', health: 500, speed: 60, reward: 200, damage: 5 }
];

function getWaveEnemies(waveNumber) {
  const waves = [];

  if (waveNumber <= 100) {
    waves.push({ type: 1, count: 28 + waveNumber });
    waves.push({ type: 2, count: 22 + Math.floor(waveNumber / 2) });
    waves.push({ type: 3, count: 20 + Math.floor(waveNumber / 3) });
    waves.push({ type: 4, count: 15 + Math.floor(waveNumber / 4) });
    waves.push({ type: 5, count: 11 + Math.floor(waveNumber / 5) });
    waves.push({ type: 6, count: 10 + Math.floor(waveNumber / 6) });
    waves.push({ type: 7, count: 7 + Math.floor(waveNumber / 7) });
    waves.push({ type: 8, count: 5 + Math.floor(waveNumber / 8) });
    waves.push({ type: 9, count: 3 + Math.floor(waveNumber / 9) });
    if (waveNumber >= 81) {
      waves.push({ type: 10, count: Math.floor((waveNumber - 80) / 5) });
    }
    return waves.filter(w => w.count > 0);
  }

  // Endless mode (100+)
  const endlessMultiplier = 1 + (waveNumber - 100) * 0.15;
  waves.push({ type: 1, count: Math.floor((30 + waveNumber) * endlessMultiplier) });
  waves.push({ type: 2, count: Math.floor((25 + waveNumber / 2) * endlessMultiplier) });
  waves.push({ type: 3, count: Math.floor((22 + waveNumber / 3) * endlessMultiplier) });
  waves.push({ type: 4, count: Math.floor((18 + waveNumber / 4) * endlessMultiplier) });
  waves.push({ type: 5, count: Math.floor((14 + waveNumber / 5) * endlessMultiplier) });
  waves.push({ type: 6, count: Math.floor((12 + waveNumber / 6) * endlessMultiplier) });
  waves.push({ type: 7, count: Math.floor((10 + waveNumber / 7) * endlessMultiplier) });
  waves.push({ type: 8, count: Math.floor((8 + waveNumber / 8) * endlessMultiplier) });
  waves.push({ type: 9, count: Math.floor((6 + waveNumber / 9) * endlessMultiplier) });
  waves.push({ type: 10, count: Math.floor((4 + waveNumber / 10) * endlessMultiplier) });

  return waves.filter(w => w.count > 0);
}

console.log('Wave 100 (Last defined wave):');
const wave100 = getWaveEnemies(100);
wave100.forEach(group => {
  const config = ENEMY_CONFIGS.find(e => e.type === group.type);
  console.log(`  Type ${group.type} (${config.name}): ${group.count} enemies`);
});

console.log('\nWave 101 (First endless wave):');
const wave101 = getWaveEnemies(101);
wave101.forEach(group => {
  const config = ENEMY_CONFIGS.find(e => e.type === group.type);
  console.log(`  Type ${group.type} (${config.name}): ${group.count} enemies`);
});

console.log('\nWave 118 (Supposed final wave):');
const wave118 = getWaveEnemies(118);
console.log('Endless multiplier:', 1 + (118 - 100) * 0.15);
wave118.forEach(group => {
  const config = ENEMY_CONFIGS.find(e => e.type === group.type);
  console.log(`  Type ${group.type} (${config.name}): ${group.count} enemies`);
});

console.log('\n⚠️  ISSUE DETECTED:');
console.log('Wave 118 uses the ENDLESS MODE formula (waveNumber > 100)!');
console.log('The endless multiplier is 3.7x, making it extremely difficult.');
console.log('Wave 101-118 should be defined separately, not use endless mode formula.');
