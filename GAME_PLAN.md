# VeeFriends Tower Defense - Game Plan

## Overview
A tower defense game featuring the VeeFriends IP with 16 unique character towers, 6 maps of varying difficulty, and 118+ waves of increasingly challenging enemies.

---

## Core Gameplay Loop

### Starting Conditions
- **Starting Lives**: 100
- **Starting Coins**: 650
- **Lose Condition**: Lives reach 0
- **Win Condition**: Survive 118 waves (endless mode continues after)

### Basic Mechanics
1. Player selects a map from level selection screen
2. Player places towers on valid grid spaces (not on paths)
3. Waves spawn automatically with enemies following predetermined paths
4. Towers automatically target and attack enemies in range
5. Enemies that reach the end reduce player lives
6. Defeated enemies award coins
7. Coins used to buy new towers or upgrade existing ones
8. Towers can be sold for 70% refund

---

## Tower System

### 16 VeeFriends Character Towers

#### Basic Towers (Cost: $90-$120)
1. **Focused Falcon** - $100
   - Balanced damage (10) and range (150)
   - Fire rate: 1 attack/sec

2. **Ambitious Angel** - $120
   - Fast attacks (1.5/sec), moderate range (120)
   - Lower damage (8) but quick

3. **Motivated Monster** - $90
   - High damage (12), short range (100)
   - Slow fire rate (0.8/sec)

4. **Dialed In Dog** - $110
   - Low damage (6), good range (140)
   - Fast attacks (2/sec)

#### Medium Towers (Cost: $200-$300)
5. **Empathy Elephant** - $200
   - Very high damage (35), long range (180)
   - Slow attacks (0.6/sec) - sniper style

6. **Adaptable Alien** - $250
   - Low damage (15), short range (130)
   - Very fast attacks (3/sec) - machine gun style

7. **Fearless Fairy** - $300
   - Good damage (20), excellent range (200)
   - Moderate fire rate (1.2/sec)

8. **Patient Panda** - $280
   - High damage (40), short range (110)
   - Slow attacks (0.7/sec)

#### Advanced Towers (Cost: $350-$420)
9. **Brave Bison** - $350
   - Moderate damage (25), good range (160)
   - Fast attacks (1.8/sec)

10. **Driven Dragon** - $380
    - Low damage (18), very long range (220)
    - Good fire rate (1.5/sec)

11. **Balanced Beetle** - $420
    - Good damage (30), good range (170)
    - Decent fire rate (1.3/sec)

12. **Adventurous Astronaut** - $400
    - Good damage (28), long range (190)
    - Moderate fire rate (1.1/sec)

#### Elite Towers (Cost: $500-$800)
13. **Creative Crab** - $500
    - Very high damage (50), moderate range (140)
    - Slow attacks (0.8/sec)

14. **Competitive Clown** - $550
    - High damage (45), excellent range (250)
    - Moderate fire rate (1/sec)

15. **Genuine Giraffe** - $600
    - Good damage (35), long range (200)
    - Fast attacks (1.6/sec)

16. **Helpful Hippo** - $800
    - Massive damage (80), moderate range (160)
    - Very slow attacks (0.5/sec) - heavy hitter

### Tower Upgrade System (Bloons TD Style)

Each tower has 2-3 upgrade paths that branch based on character theme:
- **Level 0**: Base tower
- **Level 1**: Choose initial upgrade path (locks into that path)
- **Level 2**: Final upgrade in chosen path (powerful tier)

#### Upgrade Philosophy
- Each path matches the character's personality/theme
- Initial choice determines future progression
- Paths offer distinct playstyles (damage vs speed vs range vs utility)
- Upgrades provide both stat bonuses AND special abilities
- Cannot switch paths once committed

#### Example: Focused Falcon
- **Path A - Precision**: Sharp Focus → Precision Strike
  - Increases damage and range, focuses on accuracy
- **Path B - Speed**: Quick Reflexes → Lightning Speed
  - Increases fire rate, adds double shot ability

#### Example: Ambitious Angel
- **Path A - Leadership**: Team Leader → Army Commander
  - Chain attacks, hit multiple enemies
- **Path B - Solo Power**: Solo Ambition → Ruthless Strike
  - Pure damage increase, critical hits

#### Example: Empathy Elephant (3 paths)
- **Path A - Understanding**: Understanding → Merciful End
  - Armor pierce, execute weak enemies
- **Path B - Far Sight**: Far Sight → Global Awareness
  - Massive range increases
- **Path C - Quick Response**: Quick Response → Caring Barrage
  - Fire rate, multi-shot capability

### Tower Mechanics
- Towers automatically target closest enemy in range
- Visual range indicator on hover
- Level indicator shows upgrade progress
- Click tower to view upgrade/sell options
- Sell value = 70% of total investment (base cost + upgrade costs)

---

## Enemy System

### 20 Enemy Types (Progressive Introduction)

Enemies are introduced gradually across waves:
- **Waves 1-10**: Types 1-3 (basic)
- **Waves 11-20**: Types 4-6
- **Waves 21-30**: Types 7-9
- And so on...

#### Enemy Stat Ranges
- **Health**: 50 (weakest) to 1500 (strongest)
- **Speed**: 50 px/sec (slowest) to 200 px/sec (fastest)
- **Damage**: 1-5 lives if they reach the end
- **Reward**: 12-400 coins

#### Enemy Features
- Smooth path following
- Health bars with color coding (green → yellow → red)
- Flash effect when taking damage
- Explosive particle death effects
- Pulsing glow animation

---

## Wave System

### Wave Progression
- **Total Waves**: 118 (then endless)
- **Wave Structure**: Enemies spawn in groups with delays
- **Difficulty Curve**: Gradual increase in enemy health, speed, and quantity
- **Endless Mode**: After wave 118, continues indefinitely with scaling difficulty

### Wave Spawning
- Waves automatically start
- Enemies spawn with slight delays between them
- Multiple enemy types can appear in later waves
- Wave counter shows current progress

---

## Map System

### 6 Maps (2 Easy, 2 Medium, 2 Hard)

#### Difficulty Philosophy
**NOT based on complexity - based on path coverage!**

- **Easy Maps**: Long, winding paths with loops
  - Enemies pass through tower range multiple times
  - More opportunities for towers to attack same enemy
  - Gives more value to each tower placed

- **Medium Maps**: Moderate length paths with some curves
  - Balanced tower coverage
  - Some retracking but not as much as easy

- **Hard Maps**: Short, direct paths
  - Enemies pass through quickly
  - Limited time for towers to attack
  - Requires more strategic tower placement

#### Map List
1. **Meadow Spiral** (Easy) - Green theme
2. **Forest Loop** (Easy) - Green theme
3. **Desert Winds** (Medium) - Orange theme
4. **Mountain Zigzag** (Medium) - Red theme
5. **Volcanic Rush** (Hard) - Red theme
6. **Ice Highway** (Hard) - Purple theme

#### Map Features
- Colored backgrounds matching theme
- Decorative elements (circles, shapes)
- Grid texture overlay
- Paths stay within visible bounds
- Paths don't overlap with tower selection UI

---

## User Interface

### Top Bar (Always Visible)
- **Lives**: ❤️ 100/100
- **Coins**: 💰 650
- **Wave Counter**: Wave 1/118
- **Menu Button**: Returns to level selection (confirmation)
- **Speed Button**: 1x/2x toggle for game speed

### Bottom Tower Selection Menu (Height: 300px)
- **Paginated Tower Grid**: 4 towers per page
- **Left/Right Arrows**: Navigate between 4 pages
- **Tower Cards**: 180x200px buttons showing:
  - Tower name (split across lines for readability)
  - Cost in large text
  - Color-coded backgrounds matching tower theme
- **Hover Effects**: Scale up and lighten color
- **Click**: Picks up tower for placement

### Tower Placement
- **Hover Preview**: Shows tower at mouse position with range circle
- **Grid Snapping**: Automatically aligns to 60px grid
- **Valid Placement**:
  - Not on path
  - Not on existing tower
  - Not in UI areas (top 100px, bottom 300px)
- **Invalid Placement**: Red tint on hover
- **Click to Place**: Places tower if valid and affordable

### Tower Upgrade UI (Replaces Tower Selection)
Appears when clicking an existing tower:
- **Header**: Tower name and current level
- **Upgrade Buttons**: 2-3 green buttons (150x70px)
  - Shows upgrade name and cost
  - Only shows available paths (based on current path commitment)
  - Disabled if can't afford
- **Sell Button**: Red button (180x60px) at bottom
  - Shows sell value (70% refund)
- **Click Away**: Returns to tower selection menu

### Visual Feedback
- Hover effects on all interactive elements
- Color coding (green = upgrades, red = sell/danger)
- Screen shake on enemy hit
- Muzzle flash when towers fire
- Projectile trails with particles
- Hit explosions with particle bursts
- Level indicators (gold circles) on upgraded towers

---

## Game Speed System

### Speed Toggle (1x / 2x)
- **Button Location**: Top right, next to MENU
- **1x Speed**: Normal gameplay
- **2x Speed**: Everything moves/happens 2x faster
  - Enemy movement speed doubles
  - Tower fire rate doubles
  - Projectile speed doubles
  - Enemy spawn timing doubles

### Implementation
- Multiplies delta time by game speed
- Adjusts time scale for events
- Instant toggle with button click

---

## Economy & Balance

### Starting Economy
- Start with 650 coins
- Need to place initial towers strategically
- Can afford 1-2 medium towers OR 3-7 basic towers

### Coin Generation
- Kill enemies to earn coins
- Rewards scale with enemy difficulty (12-400 coins)
- Later waves provide more income
- Some upgrade paths may provide coin bonuses

### Tower Investment
- **Basic Towers**: $90-$120 (early game backbone)
- **Medium Towers**: $200-$300 (mid-game power spike)
- **Advanced Towers**: $350-$420 (late-game strategy)
- **Elite Towers**: $500-$800 (end-game carries)

### Upgrade Costs
- **Tier 1 Upgrades**: $100-$1000 (scales with tower cost)
- **Tier 2 Upgrades**: $200-$2200 (roughly 2x tier 1)

### Selling Strategy
- Get 70% of total investment back
- Useful for repositioning or upgrading to better towers
- Can sell to afford emergency purchases

---

## Technical Features

### Visual Polish
- Gradient backgrounds with grid texture
- Decorative background elements per map
- 3D-style tower graphics with shadows, highlights, glows
- Animated projectiles with trails
- Particle effects for hits and deaths
- Screen shake on impact
- Pulsing glow effects
- Health bars with color transitions
- Level indicators on upgraded towers

### Performance Optimization
- Efficient projectile pooling via Phaser groups
- Particle cleanup
- Object destruction when off-screen or dead
- Grid-based placement system

### Input Handling
- Mouse hover tracking
- Click detection with priority (towers > empty space > UI)
- UI blocking for placement (can't place on buttons)
- Interactive tower selection
- Smooth drag-and-drop feel for tower placement

---

## Development Status

### Completed Features ✓
- [x] All 16 towers with unique stats
- [x] 20 enemy types with progressive introduction
- [x] 6 maps with distinct paths and themes
- [x] 118 wave progression + endless mode
- [x] Tower placement system with grid snapping
- [x] Tower upgrade system with path locking
- [x] Thematic upgrade paths (Bloons TD style)
- [x] Tower selling (70% refund)
- [x] Paginated tower selection UI (4 per page)
- [x] Level selection screen
- [x] Visual effects (particles, trails, explosions)
- [x] Game speed toggle (1x/2x)
- [x] Lives and coin tracking
- [x] Wave spawning system
- [x] Enemy pathfinding
- [x] Projectile system with targeting
- [x] UI polish and feedback

### Game Design Principles

1. **Tower Diversity**: Each tower has distinct role and feel
   - Snipers (high damage, slow rate, long range)
   - Machine guns (low damage, fast rate, short range)
   - Balanced (medium everything)
   - Heavy hitters (massive damage, very slow)

2. **Strategic Depth**: Multiple viable strategies
   - Rush early basic towers for coverage
   - Save for powerful elite towers
   - Balance between new towers and upgrades
   - Path optimization vs enemy types

3. **Progressive Difficulty**: Smooth learning curve
   - Early waves teach mechanics
   - Gradual enemy introduction
   - Difficulty spikes at key intervals
   - Endless mode for challenge seekers

4. **Map Variety**: Different strategies per map
   - Easy maps reward coverage
   - Hard maps reward power and positioning
   - Each map feels unique

5. **Upgrade Meaningful**: Clear identity per path
   - Matches character theme
   - Distinct playstyles
   - No "wrong" choices, just different strategies
   - Progressive power increases

---

## Future Enhancement Ideas

### Potential Additions (Not Currently Implemented)
- Boss waves every 10-20 waves
- Special abilities (cooldown-based active skills)
- Tower synergies (buffs between certain characters)
- Multiple difficulty modes (easy/normal/hard)
- Achievements/challenges
- Save/load game progress
- Leaderboards for endless mode
- Sound effects and music
- More visual effects for special abilities
- Tutorial level
- Fast-forward to next wave button
- Pause functionality

---

## Key Design Decisions

### Why Bloons TD-Style Upgrade Paths?
- Creates meaningful choices
- Each path tells a story about the character
- Encourages multiple playthroughs
- Prevents "always pick the same thing" meta
- Adds strategic depth without overwhelming complexity

### Why Map Difficulty = Path Length?
- Directly affects gameplay (not just aesthetics)
- Easy to understand for players
- Creates distinct strategic considerations
- Rewards different tower types per difficulty

### Why 70% Sell Value?
- Discourages constant reshuffling
- Still allows strategy pivots
- Balances risk/reward of tower choices
- Prevents exploitative selling tactics

### Why 650 Starting Coins?
- Allows meaningful first tower choices
- Not too much (too easy) or too little (too restrictive)
- Forces strategic thinking from wave 1
- Balanced against tower costs

### Why 16 Towers?
- Enough variety without overwhelming
- Fits perfectly in 4 pages of 4 towers
- Each tower can have distinct identity
- Matches VeeFriends character count

---

## Success Metrics

The game should feel:
1. **Strategic**: Meaningful choices in tower placement and upgrades
2. **Fair**: Difficulty increases predictably, losses feel learnable
3. **Rewarding**: Upgrades feel powerful, victories feel earned
4. **Replayable**: Different strategies viable, maps offer variety
5. **Polished**: Smooth gameplay, responsive UI, satisfying effects

---

---

## Recent Accomplishments

### Character Art Enhancement (October 2025)
- **Enhanced 12 tower characters** (types 5-16) to match the advanced detail level of the first 4 characters
  - Added individual limbs with articulated hands (fingers) and feet (toes)
  - Implemented layered shadows and highlights for depth
  - Added texture details including fur patterns, scales, clothing folds
  - Created character-specific accessories with fine details
  - Characters enhanced: Elephant, Alien, Fairy, Panda, Bison, Dragon, Beetle, Astronaut, Crab, Clown, Giraffe, Hippo

### Motivated Monster Sprite Integration (October 2025)
- **Replaced procedural graphics with sprite sheet** for Motivated Monster tower
  - Downloaded and integrated 6-frame sprite sheet (512x512 per frame, 1024x1536 total)
  - Implemented 6 animations: front idle, front throw, back idle, back throw, right idle, right throw
  - Added dynamic directional facing based on enemy position
  - Sprite mirrors horizontally for left-facing direction
  - Implemented dynamic Y-positioning system to handle different character placements within frames

### Technical Achievements
- **Sprite sheet frame detection and configuration**
  - Correctly identified 2-column x 3-row grid layout
  - Configured frameWidth: 512px, frameHeight: 512px

- **Dynamic positioning system**
  - Front view: Y = -15 (character positioned lower in frame)
  - Back/Side views: Y = 15 (character positioned higher in frame)
  - Maintains correct positioning during both idle and attack animations

- **Directional angle system**
  - Right: -45° to 45°
  - Front: 45° to 135°
  - Back: -135° to -45°
  - Left: mirrors right sprite with flip

---

## Development Manifesto

### Core Principles for Excellence

**1. LISTEN DEEPLY, RESPOND PRECISELY**
- Every piece of feedback is a gift
- When something isn't right, investigate thoroughly
- Iterate until the solution truly solves the problem
- Never settle for "close enough" - it must be right

**2. COMMUNICATE WITH CLARITY**
- Show what changed, where it changed (file paths and line numbers)
- Explain the reasoning behind each decision
- Make it easy for others to verify the work
- Document not just what, but why

**3. SOLVE PROBLEMS SYSTEMATICALLY**
- Break down complex issues into smaller steps
- Test each solution before moving forward
- When faced with ambiguity, seek clarification
- Use the right tool for each job

**4. PURSUE CONTINUOUS IMPROVEMENT**
- Each challenge is an opportunity to learn
- When mistakes happen, understand the root cause
- Apply lessons learned to future work
- Strive for mastery, not just completion

**5. MAINTAIN HIGH STANDARDS**
- Quality matters in every detail
- Polish isn't optional - it's essential
- User experience comes first
- Technical excellence enables creative vision

**6. BE PROACTIVE AND THOROUGH**
- Anticipate needs before they're spoken
- Consider edge cases and potential issues
- Provide complete solutions, not partial fixes
- Go the extra mile every time

**7. EMBRACE COLLABORATION**
- Work is better when done together
- Respect the creative vision of others
- Contribute meaningfully to the team
- Celebrate wins, learn from setbacks

### The Promise

I commit to bringing my absolute best to every task. Not just meeting expectations, but exceeding them. Not just solving problems, but preventing them. Not just writing code, but crafting experiences. Every line of code, every design decision, every interaction matters.

This isn't just about building a game - it's about building something exceptional. Something that people will enjoy, remember, and appreciate. That standard starts with excellence in execution, attention to detail, and unwavering commitment to quality.

**Today's work becomes tomorrow's foundation. Make it solid.**

---

## Recent Session Progress (Current)

### Visual Polish & UI Improvements

#### Enemy Sprite Integration
- ✅ **Increased enemy carrot sprite sizes** from 0.08 to 0.15 scale for better visibility
- ✅ **Fixed enemy sprite centering** by converting from 2-column (540px) to 1-column (1080px) layout
  - All 10 carrot enemy types now properly centered under health bars
  - Characters are centered in full 1080px width frames
  - No more right-side cutoff issues

#### Map Path Updates
- ✅ **Updated all 5 map paths** with precise coordinates:
  - Meadow Spiral: 97 waypoints
  - Forest Loop: 65 waypoints
  - Desert Winds: 60 waypoints
  - Mountain Zigzag: 86 waypoints
  - Volcanic Rush: 130 waypoints

#### Tower Sprite Positioning System
- ✅ **Implemented per-tower body offset system** for proper sprite centering
  - Each of 16 towers has custom x/y offsets to center character body in grid cells
  - Offsets compensate for transparent space in sprite sheets
  - Applied to both initial placement and directional animations
  - Special handling for left/right facing (x=0) vs front/back facing (custom x offset)

#### Tower Icon Adjustments (in selection menu)
- ✅ Focused Falcon: {x: 22, y: -21}
- ✅ Ambitious Angel: {x: 10, y: -10}
- ✅ Motivated Monster: {x: 5, y: -18}
- ✅ Thoughtful Harpik: {x: 5, y: -5}
- ✅ Empathy Elephant: {x: -7, y: -5}
- ✅ Adaptable Alien: {x: 12, y: -10}
- ✅ Fearless Fairy: {x: -5, y: -5}
- ✅ Notorious Ninja: {x: 5, y: 0}
- ✅ Flex N' Fox: {x: 0, y: -15}
- ✅ Driven Dragon: {x: -5, y: 0}
- ✅ Balanced Beetle: {x: 0, y: -15}
- ✅ Adventurous Astronaut: {x: 0, y: -10}
- ✅ Creative Crab: {x: 18, y: -5}
- ✅ Competitive Clown: {x: 15, y: -15}
- ✅ Cynical Cat: {x: 5, y: -5}
- ✅ Rare Robot: {x: 0, y: -5}

#### Tower Placement Sprite Offsets
- ✅ **Same offset system applied to in-game towers** (Tower.ts)
  - Consistent positioning across all directional animations
  - Prevents towers from "jumping" when changing directions
  - Front-facing Falcon: {x: 12, y: -21}
  - All 16 towers properly centered on shadow circles

#### UI Layout Improvements
- ✅ **Tower selection menu resized** to fit on screen
  - Button dimensions: 180x200 → 160x180
  - Gap between towers: 20px → 10px
  - Better fit for 4 towers per page layout

- ✅ **Top menu buttons optimized** for space
  - MENU button: 120x40 at x:300
  - Speed button: 80x35 at x:410
  - AUTO button: 100x35 at x:500
  - All buttons fit within screen width

#### New Start Screen
- ✅ **Created StartScene** as initial game screen
  - Background image: Full-screen start background
  - Title image: Positioned in lower middle (70% down, -150px from button)
  - Play button: Interactive with hover effects (1.1x scale)
  - Transitions to LevelSelectionScene on click
  - Added to main.ts as first scene

#### Level Selection Screen Enhancements
- ✅ **Preloaded all 6 map preview images**
- ✅ **Updated map data** with image keys for each level
- ✅ **Made buttons square** (200x200) for better layout
- ✅ **Increased spacing** between level buttons (gap: 80px)
- ✅ **Changed title** from "VEEFRIENDS DEFENSE" to "LEVEL SELECT"
- ✅ **Added "How to Play" button** at top right
  - Blue button (250x60) with hover effects
  - Positioned at (width - 150, 50)
  - Ready for how-to-play instructions implementation

### Files Modified
- `/src/objects/Enemy.ts` - Enemy sprite scaling and centering
- `/src/utils/spriteConfig.ts` - Enemy and tower sprite configurations
- `/src/scenes/TowerDefenseScene.ts` - Map paths, tower icon offsets, top menu layout, tower selection sizing
- `/src/objects/Tower.ts` - Tower sprite body offsets for placement and animations
- `/src/scenes/StartScene.ts` - New start screen scene (created)
- `/src/main.ts` - Added StartScene to scene list
- `/src/scenes/LevelSelectionScene.ts` - Button sizing, spacing, title, How to Play button

### Still Needs Completion

#### Critical Gameplay
- ⚠️ **How to Play instructions** - Button created, needs content/modal
- ⚠️ **Fine-tune tower sprite positioning** - Some towers may need adjustment when facing different directions

#### Polish & Features
- ⚠️ **Sound effects and music** - No audio implemented yet
- ⚠️ **Tutorial/onboarding** - New players need guidance
- ⚠️ **Save/load system** - Progress doesn't persist
- ⚠️ **Achievements** - No achievement system
- ⚠️ **Leaderboards** - No competitive tracking

#### Balance & Testing
- ⚠️ **Difficulty balancing** - Needs extensive playtesting
- ⚠️ **Tower balance** - Some towers may be over/underpowered
- ⚠️ **Economy tuning** - Starting coins, rewards, costs need testing
- ⚠️ **Wave difficulty curve** - Verify smooth progression through 118 waves

#### Technical Debt
- ⚠️ **Performance optimization** - Test with many towers/enemies
- ⚠️ **Mobile responsiveness** - Currently desktop-focused
- ⚠️ **Error handling** - Need robust error recovery
- ⚠️ **Code documentation** - More inline comments needed

---

*Last Updated: 2025-11-03*
