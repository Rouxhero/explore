/**
 * Player Entity
 * Handles player state, movement, and collision detection
 */
class Player {
    constructor(chunkManager, inputManager, startX = 8, startY = 8) {
        this.chunkManager = chunkManager;
        this.inputManager = inputManager;
        
        // Position in tile coordinates (can be fractional for smooth movement)
        this.x = startX;
        this.y = startY;
        
        // Movement speed in tiles per second
        this.speed = 4.0;
        
        // Player sprite index (for future animation support)
        this.spriteIndex = 0;
    }

    /**
     * Update player state
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Get input direction (normalized vector)
        const direction = this.inputManager.getDirection();
        
        if (direction.x === 0 && direction.y === 0) {
            return; // No movement
        }
        
        // Convert deltaTime from milliseconds to seconds
        const dt = deltaTime / 1000;
        
        // Calculate movement delta
        const moveX = direction.x * this.speed * dt;
        const moveY = direction.y * this.speed * dt;
        
        // Apply movement with collision detection
        // Check X and Y separately to allow sliding along walls
        this.moveWithCollision(moveX, moveY);
    }

    /**
     * Move with collision detection
     * Separates X and Y movement to allow sliding along walls
     * 
     * @param {number} deltaX - Movement on X axis
     * @param {number} deltaY - Movement on Y axis
     */
    moveWithCollision(deltaX, deltaY) {
        // Try to move on X axis
        if (deltaX !== 0) {
            const newX = this.x + deltaX;
            if (this.canMoveTo(newX, this.y)) {
                this.x = newX;
            }
        }
        
        // Try to move on Y axis
        if (deltaY !== 0) {
            const newY = this.y + deltaY;
            if (this.canMoveTo(this.x, newY)) {
                this.y = newY;
            }
        }
    }

    /**
     * Check if player can move to a position
     * Tests all four corners of the player hitbox
     * 
     * Player Collision Detection:
     * - Player occupies slightly less than 1 tile
     * - We check 4 corners with small inset (0.99)
     * - This prevents getting stuck in corners
     * - All corners must be in walkable tiles to move
     * 
     * @param {number} x - Target X position
     * @param {number} y - Target Y position
     * @returns {boolean} True if can move
     */
    canMoveTo(x, y) {
        // Define the four corners of the player's bounding box
        // Use 0.99 instead of 1.0 to provide slight inset
        const corners = [
            { x: Math.floor(x), y: Math.floor(y) },                     // Top-left
            { x: Math.floor(x + 0.99), y: Math.floor(y) },             // Top-right
            { x: Math.floor(x), y: Math.floor(y + 0.99) },             // Bottom-left
            { x: Math.floor(x + 0.99), y: Math.floor(y + 0.99) }       // Bottom-right
        ];
        
        // Check if all corners are walkable
        for (const corner of corners) {
            const tile = this.chunkManager.getTileAt(corner.x, corner.y);
            if (!tile.walkable) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Get player position
     * @returns {{x: number, y: number}} Position in tile coordinates
     */
    getPosition() {
        return { x: this.x, y: this.y };
    }

    /**
     * Get player position as integer tile coordinates
     * @returns {{x: number, y: number}} Integer tile position
     */
    getTilePosition() {
        return {
            x: Math.floor(this.x),
            y: Math.floor(this.y)
        };
    }

    /**
     * Get chunk coordinates the player is currently in
     * @returns {Object} Chunk coordinates
     */
    getChunkPosition() {
        const tilePos = this.getTilePosition();
        return this.chunkManager.worldToChunk(tilePos.x, tilePos.y);
    }

    /**
     * Set player position
     * @param {number} x - New X position
     * @param {number} y - New Y position
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Teleport player to a chunk's center
     * Useful for debugging or special game events
     * 
     * @param {number} chunkX - Target chunk X
     * @param {number} chunkY - Target chunk Y
     */
    teleportToChunk(chunkX, chunkY) {
        const chunkSize = this.chunkManager.chunkSize;
        this.x = chunkX * chunkSize + chunkSize / 2;
        this.y = chunkY * chunkSize + chunkSize / 2;
    }
}
