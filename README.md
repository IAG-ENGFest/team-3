# Runway Rush

An arcade-style browser game where you guide incoming aircraft to land on the correct color-coded runway. Built with vanilla JavaScript, HTML5 Canvas, and pixel art aesthetics.

## 🎮 How to Play

1. **Objective**: Direct incoming planes to their matching color-coded runways
2. **Controls**: 
   - Use keyboard keys **1-4** to assign planes to runways
   - Or **click** directly on the runways
3. **Color Matching**: Each plane has a color (Red, Blue, Green, Yellow) that must match its landing runway
4. **Game Over**: One crash or wrong runway landing ends the game!

## 🚀 Getting Started

### Play Locally
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Press **SPACE** to start playing!

### Play Online
Visit the GitHub Pages deployment: [Add your GitHub Pages URL here]

## 🎯 Game Features

- **Progressive Difficulty**: Every 10 successful landings increases:
  - Plane spawn rate (faster)
  - Number of simultaneous planes (up to 6)
  - Descent speed (20% faster per level)
  
- **Scoring System**:
  - Base: 100 points per successful landing
  - Combo Bonus: Up to +200 points for 5+ consecutive landings
  - High score saved in browser localStorage

- **Retro Pixel Art Style**:
  - 8-bit inspired graphics
  - Chunky pixel fonts
  - CRT scanline effect
  - Vibrant color palette

- **Sound Effects**:
  - 8-bit beeps using Web Audio API
  - Landing success chimes
  - Crash explosion sounds
  - Level up melody

## 🛠️ Technical Details

- **Pure Frontend**: No backend required - 100% browser-based
- **Technologies**: HTML5 Canvas, CSS3, Vanilla JavaScript
- **Audio**: Web Audio API for procedurally generated retro sounds
- **Storage**: LocalStorage for high score persistence
- **Responsive**: Adapts to different screen sizes

## 📁 File Structure

```
/
├── index.html          # Main HTML structure
├── style.css           # Pixel art styling and layout
├── game.js             # Core game logic and rendering
├── plan.md             # Detailed game design document
├── instructions.md     # Original game jam instructions
└── README.md           # This file
```

## 🎨 Game Design

See [plan.md](plan.md) for complete game design specifications including:
- Detailed mechanics breakdown
- Progression systems
- Visual style guide
- Future enhancement ideas

## 🏆 Tips for High Scores

1. **Stay Calm**: Don't panic when multiple planes appear
2. **Plan Ahead**: Assign runways to planes early
3. **Watch Colors**: Keep track of which colors are coming
4. **Build Combos**: Consecutive successful landings multiply your score
5. **Level Up**: Surviving to higher levels means bigger scores

## 🔧 Future Enhancements

- Different plane types with varying speeds
- Weather effects (wind, fog) affecting difficulty
- Power-ups (slow-mo, auto-pilot)
- Achievement system
- Global leaderboard
- Mobile touch controls

## 📝 Credits

Created for the Microsoft Aviation Game Challenge
- Built with GitHub Copilot assistance
- Pixel art style inspired by classic arcade games
- Web Audio API for authentic 8-bit sounds

## 📜 License

Free to play, modify, and share!

---

**Ready for takeoff?** Open `index.html` and guide those planes safely home! ✈️
