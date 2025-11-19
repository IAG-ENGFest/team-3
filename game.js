// Runway Rush - Arcade Airplane Landing Game
// Main game logic and rendering

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const RUNWAY_HEIGHT = 80;
const RUNWAY_Y = CANVAS_HEIGHT - RUNWAY_HEIGHT;
const PLANE_SIZE = 32;
const COLORS = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00']; // Red, Blue, Green, Yellow
const COLOR_NAMES = ['RED', 'BLUE', 'GREEN', 'YELLOW'];

// Game state
let gameState = 'title'; // 'title', 'playing', 'gameOver'
let score = 0;
let level = 1;
let combo = 0;
let bestCombo = 0;
let planesLanded = 0;
let highScore = parseInt(localStorage.getItem('runwayRushHighScore')) || 0;
let airplanes = [];
let selectedPlane = null; // Currently selected plane
let spawnTimer = 0;
let spawnInterval = 2000; // milliseconds - start faster
let lastTime = 0;
let difficultyTimer = 0;

// Canvas and context
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// UI elements
const titleScreen = document.getElementById('title-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const comboDisplay = document.getElementById('combo');
const highScoreDisplay = document.getElementById('high-score');
const finalScoreDisplay = document.getElementById('final-score');
const bestComboDisplay = document.getElementById('best-combo');
const planesLandedDisplay = document.getElementById('planes-landed');
const runwayControls = document.getElementById('runway-controls');

// Audio elements
const soundLanding = document.getElementById('sound-landing');
const soundCrash = document.getElementById('sound-crash');
const soundLevelUp = document.getElementById('sound-levelup');
const soundBgMusic = document.getElementById('sound-bgmusic');

// Airplane class - represents each plane that needs to land
class Airplane {
    constructor() {
        this.x = Math.random() * (CANVAS_WIDTH - PLANE_SIZE);
        this.y = -PLANE_SIZE;
        this.colorIndex = Math.floor(Math.random() * 4);
        this.color = COLORS[this.colorIndex];
        this.speed = 1.2 + (level * 0.15); // Faster base speed, increases more with level
        this.targetRunway = this.colorIndex;
        this.assigned = false;
        this.assignedRunway = -1;
    }

    // Update airplane position
    update(deltaTime) {
        this.y += this.speed * deltaTime / 16.67; // Normalize to 60fps
    }

    // Draw the airplane on canvas with pixel art style
    draw() {
        // Draw airplane body (simple pixel art representation)
        ctx.fillStyle = this.color;
        
        // Main fuselage
        ctx.fillRect(this.x + 12, this.y + 8, 8, 16);
        
        // Wings
        ctx.fillRect(this.x + 4, this.y + 14, 24, 6);
        
        // Tail
        ctx.fillRect(this.x + 12, this.y + 24, 8, 4);
        ctx.fillRect(this.x + 10, this.y + 28, 12, 2);
        
        // Cockpit (darker shade)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x + 14, this.y + 8, 4, 4);
        
        // Color indicator above plane
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 10, this.y - 8, 12, 4);
        
        // Outline for visibility
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x + 12, this.y + 8, 8, 16);
        
        // Assignment indicator (if assigned to runway)
        if (this.assigned) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '10px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(this.assignedRunway + 1, this.x + 16, this.y - 12);
        }
        
        // Selection indicator (if this plane is selected)
        if (selectedPlane === this) {
            ctx.strokeStyle = '#FFFF00';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x - 4, this.y - 4, PLANE_SIZE + 8, PLANE_SIZE + 8);
            
            // Pulsing arrow pointing at plane
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.moveTo(this.x + 16, this.y - 20);
            ctx.lineTo(this.x + 12, this.y - 14);
            ctx.lineTo(this.x + 20, this.y - 14);
            ctx.fill();
        }
    }

    // Check if plane has reached runway area
    hasReachedRunway() {
        return this.y >= RUNWAY_Y - PLANE_SIZE;
    }

    // Check if plane has crashed (missed the runway)
    hasCrashed() {
        return this.y > CANVAS_HEIGHT;
    }

    // Get which runway position the plane is over
    getRunwayPosition() {
        const runwayWidth = CANVAS_WIDTH / 4;
        const planeCenter = this.x + PLANE_SIZE / 2;
        return Math.floor(planeCenter / runwayWidth);
    }
    
    // Check if a point (x, y) is inside this plane
    isPointInside(px, py) {
        return px >= this.x && px <= this.x + PLANE_SIZE &&
               py >= this.y && py <= this.y + PLANE_SIZE;
    }
}

// Initialize game
function init() {
    highScoreDisplay.textContent = highScore;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // Event listeners for keyboard controls
    document.addEventListener('keydown', handleKeyPress);
    
    // Event listeners for runway clicks
    const runwayButtons = document.querySelectorAll('.runway-button');
    runwayButtons.forEach((button, index) => {
        button.addEventListener('click', () => selectRunway(index));
    });
    
    // Event listener for clicking on planes
    canvas.addEventListener('click', handleCanvasClick);
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Handle keyboard input
function handleKeyPress(e) {
    if (gameState === 'title' && e.code === 'Space') {
        startGame();
    } else if (gameState === 'gameOver' && e.code === 'KeyR') {
        resetGame();
    } else if (gameState === 'playing') {
        // Switch to next plane with "/"
        if (e.code === 'Slash') {
            selectNextPlane();
        }
        // Runway selection keys (1-4)
        else if (e.code === 'Digit1') selectRunway(0);
        else if (e.code === 'Digit2') selectRunway(1);
        else if (e.code === 'Digit3') selectRunway(2);
        else if (e.code === 'Digit4') selectRunway(3);
    }
}

// Handle canvas clicks for plane selection
function handleCanvasClick(e) {
    if (gameState !== 'playing') return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    
    // Check if click is on a plane
    for (let plane of airplanes) {
        if (plane.isPointInside(clickX, clickY)) {
            selectedPlane = plane;
            return;
        }
    }
    
    // If click is not on a plane, deselect
    selectedPlane = null;
}

// Start the game
function startGame() {
    gameState = 'playing';
    titleScreen.classList.add('hidden');
    runwayControls.classList.remove('hidden');
    lastTime = performance.now();
}

// Reset game to initial state
function resetGame() {
    score = 0;
    level = 1;
    combo = 0;
    bestCombo = 0;
    planesLanded = 0;
    airplanes = [];
    selectedPlane = null;
    spawnTimer = 0;
    spawnInterval = 2000;
    difficultyTimer = 0;
    
    gameOverScreen.classList.add('hidden');
    titleScreen.classList.remove('hidden');
    gameState = 'title';
}

// Cycle to the next plane (for "/" key)
function selectNextPlane() {
    if (airplanes.length === 0) return;
    
    // Get all planes still in the air
    const activePlanes = airplanes.filter(plane => plane.y > 0 && plane.y < RUNWAY_Y);
    if (activePlanes.length === 0) return;
    
    // Find current selected plane index
    const currentIndex = selectedPlane ? activePlanes.indexOf(selectedPlane) : -1;
    
    // Select next plane (cycle back to first if at end)
    const nextIndex = (currentIndex + 1) % activePlanes.length;
    selectedPlane = activePlanes[nextIndex];
}

// Select a runway for the next plane
function selectRunway(runwayIndex) {
    if (gameState !== 'playing' || airplanes.length === 0) return;
    
    // If a plane is selected, assign runway to it
    if (selectedPlane && airplanes.includes(selectedPlane)) {
        selectedPlane.assigned = true;
        selectedPlane.assignedRunway = runwayIndex;
        // Don't deselect - keep highlight until plane lands
        return;
    }
    
    // Otherwise, find the closest plane that hasn't landed yet
    let closestPlane = null;
    let closestDistance = Infinity;
    
    for (let plane of airplanes) {
        if (plane.y > 0 && plane.y < RUNWAY_Y) { // Only planes still in the air
            const distance = RUNWAY_Y - plane.y;
            if (distance < closestDistance) {
                closestDistance = distance;
                closestPlane = plane;
            }
        }
    }
    
    if (closestPlane) {
        closestPlane.assigned = true;
        closestPlane.assignedRunway = runwayIndex;
    }
}

// Spawn a new airplane
function spawnAirplane() {
    // Limit maximum simultaneous planes based on level
    const maxPlanes = Math.min(2 + Math.floor(level / 2), 8); // Start with 2 planes, max 8
    if (airplanes.length < maxPlanes) {
        airplanes.push(new Airplane());
    }
}

// Update game state
function update(deltaTime) {
    if (gameState !== 'playing') return;
    
    // Spawn timer
    spawnTimer += deltaTime;
    if (spawnTimer >= spawnInterval) {
        spawnAirplane();
        spawnTimer = 0;
    }
    
    // Update all airplanes
    for (let i = airplanes.length - 1; i >= 0; i--) {
        const plane = airplanes[i];
        plane.update(deltaTime);
        
        // Move plane horizontally toward assigned runway
        if (plane.assigned) {
            const runwayWidth = CANVAS_WIDTH / 4;
            const targetX = plane.assignedRunway * runwayWidth + runwayWidth / 2 - PLANE_SIZE / 2;
            const dx = targetX - plane.x;
            
            // Smooth horizontal movement toward runway
            if (Math.abs(dx) > 2) {
                plane.x += dx * 0.05; // Gradual movement
            }
        }
        
        // Check if plane has reached runway
        if (plane.hasReachedRunway()) {
            if (!plane.assigned) {
                // No runway assigned - crash!
                handleCrash();
                return;
            }
            
            const runwayPosition = plane.getRunwayPosition();
            
            // Check if on correct runway AND it matches the plane's target color
            if (runwayPosition === plane.assignedRunway && plane.assignedRunway === plane.targetRunway) {
                // Successful landing!
                handleSuccessfulLanding();
                if (selectedPlane === plane) selectedPlane = null;
                airplanes.splice(i, 1);
            } else {
                // Wrong runway - crash!
                handleCrash();
                return;
            }
        }
        // Check if plane flew past runway without landing
        else if (plane.hasCrashed()) {
            handleCrash();
            return;
        }
    }
    
    // Difficulty progression every 3 successful landings
    difficultyTimer = planesLanded;
    if (difficultyTimer > 0 && difficultyTimer % 3 === 0 && difficultyTimer / 3 === level) {
        increaseLevel();
    }
    
    // Update UI
    updateUI();
}

// Handle successful landing
function handleSuccessfulLanding() {
    planesLanded++;
    combo++;
    if (combo > bestCombo) bestCombo = combo;
    
    // Calculate score with combo multiplier
    const basePoints = 100;
    const comboBonus = Math.min(combo - 1, 4) * 50; // Max 5x multiplier
    score += basePoints + comboBonus;
    
    // Play landing sound
    playSound(soundLanding, createBeep(440, 0.1));
}

// Handle crash/wrong landing
function handleCrash() {
    gameState = 'gameOver';
    runwayControls.classList.add('hidden');
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('runwayRushHighScore', highScore);
    }
    
    // Show game over screen
    finalScoreDisplay.textContent = score;
    bestComboDisplay.textContent = bestCombo;
    planesLandedDisplay.textContent = planesLanded;
    gameOverScreen.classList.remove('hidden');
    
    // Play crash sound
    playSound(soundCrash, createNoise(0.2));
}

// Increase difficulty level
function increaseLevel() {
    level++;
    spawnInterval = Math.max(800, 2000 - (level * 150)); // Faster spawning, lower minimum
    
    // Trigger level flash animation
    const levelElement = document.getElementById('level');
    levelElement.classList.add('level-flash');
    setTimeout(() => {
        levelElement.classList.remove('level-flash');
    }, 800);
    
    // Play level up sound
    playSound(soundLevelUp, createMelody());
}

// Update UI displays
function updateUI() {
    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;
    comboDisplay.textContent = combo;
}

// Draw everything
function draw() {
    // Clear canvas with sky gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#E0F6FF');
    gradient.addColorStop(1, '#90EE90');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw clouds (simple pixel art)
    drawClouds();
    
    // Draw runways
    drawRunways();
    
    // Draw all airplanes
    for (let plane of airplanes) {
        plane.draw();
    }
    
    // Draw level indicator particles on level up
    if (gameState === 'playing') {
        drawParticles();
    }
}

// Draw pixel art clouds
function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    
    // Static clouds for retro feel
    const clouds = [
        { x: 100, y: 80 },
        { x: 400, y: 50 },
        { x: 650, y: 100 },
        { x: 250, y: 150 }
    ];
    
    clouds.forEach(cloud => {
        // Simple pixel cloud shape
        ctx.fillRect(cloud.x, cloud.y, 60, 20);
        ctx.fillRect(cloud.x + 10, cloud.y - 10, 40, 20);
        ctx.fillRect(cloud.x + 20, cloud.y - 15, 20, 20);
    });
}

// Draw the four color-coded runways
function drawRunways() {
    const runwayWidth = CANVAS_WIDTH / 4;
    
    for (let i = 0; i < 4; i++) {
        const x = i * runwayWidth;
        
        // Runway background
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, RUNWAY_Y, runwayWidth, RUNWAY_HEIGHT);
        
        // Colored stripe
        ctx.fillStyle = COLORS[i];
        ctx.fillRect(x + 10, RUNWAY_Y + 10, runwayWidth - 20, 15);
        
        // Runway markings (white dashes)
        ctx.fillStyle = '#FFFFFF';
        for (let j = 0; j < 3; j++) {
            ctx.fillRect(x + runwayWidth/2 - 5, RUNWAY_Y + 35 + j * 15, 10, 8);
        }
        
        // Runway number
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(i + 1, x + runwayWidth/2, RUNWAY_Y + RUNWAY_HEIGHT - 10);
        
        // Border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, RUNWAY_Y, runwayWidth, RUNWAY_HEIGHT);
    }
}

// Draw particle effects (placeholder for future enhancement)
function drawParticles() {
    // Can add particle effects for landings/level ups later
}

// Main game loop
function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    update(deltaTime);
    draw();
    
    requestAnimationFrame(gameLoop);
}

// Sound generation functions using Web Audio API
function createBeep(frequency, duration) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
    
    return audioContext;
}

function createNoise(duration) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.3;
    
    noise.connect(gainNode);
    gainNode.connect(audioContext.destination);
    noise.start();
    
    return audioContext;
}

function createMelody() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const frequencies = [523.25, 659.25, 783.99]; // C, E, G
    
    frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'square';
        
        const startTime = audioContext.currentTime + index * 0.1;
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.15);
    });
    
    return audioContext;
}

function playSound(audioElement, audioContext) {
    // Using Web Audio API generated sounds instead of preloaded files
    // This avoids need for external sound files
}

// Initialize the game when page loads
window.addEventListener('load', init);
