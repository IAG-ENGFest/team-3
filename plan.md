# Runway Rush - Arcade Airplane Landing Game

## Game Concept
An arcade-style browser game where players guide incoming aircraft to land on the correct runway from four color-coded choices. Difficulty escalates through faster spawn rates, multiple simultaneous aircraft, and increased descent speed. One crash ends the game, creating high-stakes tension.

## Core Mechanics
- **Objective**: Direct incoming planes to their matching color-coded runways
- **Controls**: Keyboard keys 1-4 to select runways (or click on runways)
- **Color System**: Red, Blue, Green, Yellow runways and matching planes
- **Game Over**: Single crash or wrong runway landing ends the game
- **Progression**: Every 10 successful landings increases difficulty

## Technical Implementation

### Step 1: Core Game Structure
- `index.html` - Canvas setup, game container, UI elements
- `style.css` - Pixel art retro styling, CRT effects, bitmap fonts
- `game.js` - Main game loop using requestAnimationFrame

### Step 2: Airplane System
- `Airplane` class with properties:
  - Position (x, y)
  - Color assignment (red/blue/green/yellow)
  - Descent speed
  - Target runway
- Random spawning at top of screen
- Smooth descent animation

### Step 3: Runway System
- Four color-coded runways at bottom
- Collision detection for landing zones
- Visual feedback on selection
- Match validation (plane color === runway color)

### Step 4: Pixel Art Assets
- 32x32 airplane sprites in 4 colors
- Pixelated runway graphics with colored markers
- Retro airport background (clouds, control tower)
- Bitmap-style UI fonts for score/level display

### Step 5: Scoring & Progression
- **Base points**: 100 per successful landing
- **Combo multiplier**: +50 bonus for consecutive landings (max 5x)
- **Level progression**: Every 10 landings
- **Difficulty scaling**:
  - Spawn rate: 3s → 1s
  - Max simultaneous planes: 1 → 6
  - Descent speed: +20% per level

### Step 6: Sound Effects
- 8-bit landing success beep
- Crash explosion sound
- Level up chime
- Looping retro background music
- HTML5 Audio implementation

## Game Flow
1. **Start Screen**: Title, "Press SPACE to Start", high score
2. **Gameplay**: Planes spawn, player directs to runways
3. **Game Over**: Show final score, combo stats, "Press R to Restart"

## Visual Style
- Pixel art retro aesthetic
- Limited color palette (8-bit inspired)
- CRT scanline effect (optional)
- Chunky bitmap fonts
- Simple particle effects for landings

## Accessibility Features
- Optional symbols/numbers on planes for colorblind players
- Clear visual indicators
- Keyboard and mouse support

## File Structure
```
/
├── index.html
├── style.css
├── game.js
├── sounds/
│   ├── landing.mp3
│   ├── crash.mp3
│   ├── levelup.mp3
│   └── bgmusic.mp3
└── README.md
```

## Future Enhancements
- Leaderboard (localStorage)
- Different plane types (speed variations)
- Weather effects (wind, fog)
- Power-ups (slow-mo, auto-pilot)
- Achievement system
