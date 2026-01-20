/**
 * Camera System
 * Manages viewport positioning and smooth following of the player
 * 
 * Camera Mathematics:
 * - The camera position (x, y) represents the top-left corner of the viewport in world coordinates
 * - To center the camera on the player: camera.x = player.x * tileSize - canvasWidth / 2
 * - Screen coordinates are calculated by: screenX = worldX - camera.x
 * - This creates a smooth scrolling effect as the camera follows the player
 */
class Camera {
    constructor(canvasWidth, canvasHeight, tileSize) {
        // Camera position in world coordinates (pixels)
        this.x = 0;
        this.y = 0;
        
        // Viewport dimensions
        this.width = canvasWidth;
        this.height = canvasHeight;
        
        // Size of each tile in pixels
        this.tileSize = tileSize;
    }

    /**
     * Update camera to follow a target position (usually the player)
     * The camera centers on the target for smooth following
     * 
     * @param {number} targetX - Target X position in tile coordinates
     * @param {number} targetY - Target Y position in tile coordinates
     */
    follow(targetX, targetY) {
        // Convert tile coordinates to pixel coordinates
        const targetPixelX = targetX * this.tileSize;
        const targetPixelY = targetY * this.tileSize;

        // Center camera on target
        // We subtract half the viewport size to center the target on screen
        this.x = targetPixelX - this.width / 2;
        this.y = targetPixelY - this.height / 2;
    }

    /**
     * Convert world coordinates to screen coordinates
     * This is used for rendering - we subtract the camera position
     * to get the position relative to the viewport
     * 
     * @param {number} worldX - X position in world coordinates
     * @param {number} worldY - Y position in world coordinates
     * @returns {{x: number, y: number}} Screen coordinates
     */
    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    }

    /**
     * Get the visible tile range for the current camera position
     * Used for culling - only tiles within this range need to be rendered
     * We add 1 tile padding to handle partial tiles at edges
     * 
     * @returns {{startX: number, startY: number, endX: number, endY: number}}
     */
    getVisibleTileRange() {
        return {
            startX: Math.floor(this.x / this.tileSize) - 1,
            startY: Math.floor(this.y / this.tileSize) - 1,
            endX: Math.ceil((this.x + this.width) / this.tileSize) + 1,
            endY: Math.ceil((this.y + this.height) / this.tileSize) + 1
        };
    }

    /**
     * Get the visible chunk range for the current camera position
     * Used to determine which chunks need to be loaded/generated
     * 
     * @param {number} chunkSize - Number of tiles per chunk
     * @returns {{startX: number, startY: number, endX: number, endY: number}}
     */
    getVisibleChunkRange(chunkSize) {
        return {
            startX: Math.floor(this.x / (this.tileSize * chunkSize)) - 1,
            startY: Math.floor(this.y / (this.tileSize * chunkSize)) - 1,
            endX: Math.ceil((this.x + this.width) / (this.tileSize * chunkSize)) + 1,
            endY: Math.ceil((this.y + this.height) / (this.tileSize * chunkSize)) + 1
        };
    }

    /**
     * Check if a tile is visible in the current viewport
     * @param {number} tileX - Tile X coordinate
     * @param {number} tileY - Tile Y coordinate
     * @returns {boolean} True if tile is visible
     */
    isTileVisible(tileX, tileY) {
        const pixelX = tileX * this.tileSize;
        const pixelY = tileY * this.tileSize;
        
        return pixelX + this.tileSize >= this.x &&
               pixelX <= this.x + this.width &&
               pixelY + this.tileSize >= this.y &&
               pixelY <= this.y + this.height;
    }

    /**
     * Update viewport size (e.g., on window resize)
     */
    setViewportSize(width, height) {
        this.width = width;
        this.height = height;
    }
}
