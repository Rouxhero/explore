/**
 * Main Game Class
 * Coordinates all game systems and manages game state
 */
class Game {
    constructor() {
        // Get canvas
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }

        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;

        // Game configuration
        this.config = {
            seed: 12345,
            tileSize: 16,
            chunkSize: 16
        };

        // Initialize systems (order matters!)
        this.renderer = new Renderer(this.canvas);
        this.tileset = new Tileset('dungeon_tiles.png', this.config.tileSize);
        this.camera = new Camera(
            this.canvas.width,
            this.canvas.height,
            this.config.tileSize
        );
        this.inputManager = new InputManager();
        this.chunkManager = new ChunkManager(
            this.config.seed,
            this.config.chunkSize,
            this.config.tileSize
        );
        this.player = new Player(
            this.chunkManager,
            this.inputManager,
            8, 8  // Starting position
        );

        // Game loop
        this.gameLoop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render()
        );

        // Wait for tileset to load before starting
        this.init();
    }

    /**
     * Initialize game
     * Waits for assets to load before starting game loop
     */
    init() {
        if (!this.tileset.isLoaded()) {
            // Wait for tileset
            setTimeout(() => this.init(), 100);
            return;
        }

        // Update UI with initial values
        this.updateUI();

        // Start game loop
        this.gameLoop.start();

        console.log('Game started!');
    }

    /**
     * Update game state
     * Called at fixed timestep (60 FPS)
     * 
     * @param {number} deltaTime - Fixed timestep in milliseconds
     */
    update(deltaTime) {
        // Update player (handles input and movement)
        this.player.update(deltaTime);

        // Update camera to follow player
        const playerPos = this.player.getPosition();
        this.camera.follow(playerPos.x, playerPos.y);

        // Cull distant chunks to manage memory
        const playerTile = this.player.getTilePosition();
        this.chunkManager.cullDistantChunks(playerTile.x, playerTile.y);

        // Update UI
        this.updateUI();
    }

    /**
     * Render game
     * Called every frame (as fast as possible)
     */
    render() {
        // Clear screen
        this.renderer.clear();

        // Get visible tile range for culling
        const tileRange = this.camera.getVisibleTileRange();

        // Render all visible tiles
        // Using sprite batching - single draw call per tile
        for (let tileY = tileRange.startY; tileY <= tileRange.endY; tileY++) {
            for (let tileX = tileRange.startX; tileX <= tileRange.endX; tileX++) {
                // Get tile from chunk manager
                const tile = this.chunkManager.getTileAt(tileX, tileY);

                // Calculate screen position
                const worldX = tileX * this.config.tileSize;
                const worldY = tileY * this.config.tileSize;
                const screenPos = this.camera.worldToScreen(worldX, worldY);

                // Skip if outside viewport (additional culling)
                if (screenPos.x < -this.config.tileSize ||
                    screenPos.x > this.canvas.width ||
                    screenPos.y < -this.config.tileSize ||
                    screenPos.y > this.canvas.height) {
                    continue;
                }

                // Render tile
                this.renderTile(tile, screenPos.x, screenPos.y);
            }
        }

        // Render player
        this.renderPlayer();

        // Render debug info (optional)
        // this.renderDebug();
    }

    /**
     * Render a single tile
     * @param {Object} tile - Tile data
     * @param {number} screenX - Screen X position
     * @param {number} screenY - Screen Y position
     */
    renderTile(tile, screenX, screenY) {
        const tileCanvas = this.tileset.getTile(tile.type);
        this.renderer.drawTile(tileCanvas, screenX, screenY);
    }

    /**
     * Render player
     */
    renderPlayer() {
        const playerPos = this.player.getPosition();
        const worldX = playerPos.x * this.config.tileSize;
        const worldY = playerPos.y * this.config.tileSize;
        const screenPos = this.camera.worldToScreen(worldX, worldY);

        const playerTile = this.tileset.getTile('player');
        this.renderer.drawTile(playerTile, screenPos.x, screenPos.y);
    }

    /**
     * Render debug overlay
     */
    renderDebug() {
        const chunkStats = this.chunkManager.getStats();
        const fps = this.gameLoop.getFPS();
        const playerChunk = this.player.getChunkPosition();

        let y = 20;
        const lineHeight = 16;

        this.renderer.drawText(`FPS: ${fps}`, 10, y, '#00ff00');
        y += lineHeight;

        this.renderer.drawText(
            `Chunks: ${chunkStats.cachedChunks}/${chunkStats.maxCachedChunks}`,
            10, y, '#00ff00'
        );
        y += lineHeight;

        this.renderer.drawText(
            `Player Chunk: (${playerChunk.chunkX}, ${playerChunk.chunkY})`,
            10, y, '#00ff00'
        );
        y += lineHeight;

        // Draw chunk borders
        this.renderChunkBorders();
    }

    /**
     * Render chunk borders for debugging
     */
    renderChunkBorders() {
        const chunkPixelSize = this.config.chunkSize * this.config.tileSize;
        const chunkRange = this.camera.getVisibleChunkRange(this.config.chunkSize);

        for (let cy = chunkRange.startY; cy <= chunkRange.endY; cy++) {
            for (let cx = chunkRange.startX; cx <= chunkRange.endX; cx++) {
                const worldX = cx * chunkPixelSize;
                const worldY = cy * chunkPixelSize;
                const screenPos = this.camera.worldToScreen(worldX, worldY);

                this.renderer.drawRectOutline(
                    screenPos.x,
                    screenPos.y,
                    chunkPixelSize,
                    chunkPixelSize,
                    'rgba(255, 0, 0, 0.3)',
                    2
                );
            }
        }
    }

    /**
     * Update UI elements
     */
    updateUI() {
        const tilePos = this.player.getTilePosition();
        const chunkPos = this.player.getChunkPosition();

        const posElement = document.getElementById('position');
        if (posElement) {
            posElement.textContent = `${tilePos.x}, ${tilePos.y}`;
        }

        const chunkElement = document.getElementById('chunk');
        if (chunkElement) {
            chunkElement.textContent = `${chunkPos.chunkX}, ${chunkPos.chunkY}`;
        }

        const seedElement = document.getElementById('seed');
        if (seedElement) {
            seedElement.textContent = this.config.seed;
        }
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new Game();
});
