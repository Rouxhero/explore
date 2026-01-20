// Main game engine
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Game state
        this.seed = 12345;
        this.tileset = new Tileset();
        this.world = new World(this.seed);
        this.player = new Player(this.world);
        
        // Camera
        this.camera = {
            x: 0,
            y: 0
        };
        
        // Timing
        this.lastTime = performance.now();
        this.deltaTime = 0;
        
        // Start game loop
        this.running = false;
        this.init();
    }

    init() {
        // Wait for tileset to load
        if (!this.tileset.isLoaded()) {
            setTimeout(() => this.init(), 100);
            return;
        }

        this.updateUI();
        this.running = true;
        this.gameLoop();
    }

    gameLoop() {
        if (!this.running) return;

        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update();
        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // Update player
        this.player.update(this.deltaTime);

        // Update camera to follow player
        this.updateCamera();

        // Update UI
        this.updateUI();
    }

    updateCamera() {
        const playerPos = this.player.getPosition();
        const tileSize = this.world.tileSize;

        // Center camera on player
        this.camera.x = playerPos.x * tileSize - this.canvas.width / 2;
        this.camera.y = playerPos.y * tileSize - this.canvas.height / 2;
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate visible area in tile coordinates
        const tileSize = this.world.tileSize;
        const startTileX = Math.floor(this.camera.x / tileSize);
        const startTileY = Math.floor(this.camera.y / tileSize);
        const endTileX = Math.ceil((this.camera.x + this.canvas.width) / tileSize);
        const endTileY = Math.ceil((this.camera.y + this.canvas.height) / tileSize);

        // Get visible chunks
        const chunks = this.world.getVisibleChunks(
            startTileX,
            startTileY,
            Math.ceil(this.canvas.width / tileSize),
            Math.ceil(this.canvas.height / tileSize)
        );

        // Render tiles
        for (let tileY = startTileY; tileY <= endTileY; tileY++) {
            for (let tileX = startTileX; tileX <= endTileX; tileX++) {
                const tile = this.world.getTileAt(tileX, tileY);
                this.renderTile(tile, tileX, tileY);
            }
        }

        // Render player
        this.renderPlayer();

        // Render debug grid (optional)
        // this.renderGrid();
    }

    renderTile(tile, worldX, worldY) {
        const tileSize = this.world.tileSize;
        const screenX = worldX * tileSize - this.camera.x;
        const screenY = worldY * tileSize - this.camera.y;

        // Skip if outside viewport
        if (screenX < -tileSize || screenX > this.canvas.width ||
            screenY < -tileSize || screenY > this.canvas.height) {
            return;
        }

        const tileImage = this.tileset.getTile(tile.type);
        this.ctx.drawImage(tileImage, screenX, screenY);
    }

    renderPlayer() {
        const playerPos = this.player.getPosition();
        const tileSize = this.world.tileSize;
        const screenX = playerPos.x * tileSize - this.camera.x;
        const screenY = playerPos.y * tileSize - this.camera.y;

        const playerImage = this.tileset.getTile('player');
        this.ctx.drawImage(playerImage, screenX, screenY);
    }

    renderGrid() {
        // Render chunk boundaries for debugging
        const tileSize = this.world.tileSize;
        const chunkSize = this.world.chunkSize;
        const chunkPixelSize = chunkSize * tileSize;

        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        this.ctx.lineWidth = 2;

        const startChunkX = Math.floor(this.camera.x / chunkPixelSize);
        const startChunkY = Math.floor(this.camera.y / chunkPixelSize);
        const endChunkX = Math.ceil((this.camera.x + this.canvas.width) / chunkPixelSize);
        const endChunkY = Math.ceil((this.camera.y + this.canvas.height) / chunkPixelSize);

        for (let cy = startChunkY; cy <= endChunkY; cy++) {
            for (let cx = startChunkX; cx <= endChunkX; cx++) {
                const screenX = cx * chunkPixelSize - this.camera.x;
                const screenY = cy * chunkPixelSize - this.camera.y;
                this.ctx.strokeRect(screenX, screenY, chunkPixelSize, chunkPixelSize);
            }
        }
    }

    updateUI() {
        const tilePos = this.player.getTilePosition();
        const chunkPos = this.player.getChunkPosition();

        document.getElementById('position').textContent = 
            `${tilePos.x}, ${tilePos.y}`;
        document.getElementById('chunk').textContent = 
            `${chunkPos.chunkX}, ${chunkPos.chunkY}`;
        document.getElementById('seed').textContent = this.seed;
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new Game();
});
