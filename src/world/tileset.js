/**
 * Tileset Manager
 * Loads and manages the dungeon spritesheet
 * Extracts individual tiles for rendering
 */
class Tileset {
    constructor(imagePath, tileSize = 16) {
        this.imagePath = imagePath;
        this.tileSize = tileSize;
        this.image = null;
        this.loaded = false;
        
        // Tile mapping: tile type -> {x, y} position in spritesheet
        // These coordinates are in tile units (will be multiplied by tileSize)
        this.tileMap = {
            // Floor tiles - various stone floors
            'floor': { x: 1, y: 0 },
            'floor2': { x: 2, y: 0 },
            'floor3': { x: 3, y: 0 },
            
            // Wall tiles
            'wall': { x: 0, y: 1 },
            'wall_top': { x: 1, y: 1 },
            'wall_side': { x: 2, y: 1 },
            
            // Door tiles
            'door': { x: 5, y: 2 },
            'door_open': { x: 6, y: 2 },
            
            // Special tiles
            'chest': { x: 7, y: 3 },
            'stairs': { x: 8, y: 3 },
            'stairs_down': { x: 9, y: 3 },
            
            // Player - using a character sprite
            'player': { x: 0, y: 5 }
        };
        
        // Canvas cache for pre-extracted tiles
        this.tileCache = {};
        
        this.loadImage();
    }

    /**
     * Load the spritesheet image
     */
    loadImage() {
        this.image = new Image();
        
        this.image.onload = () => {
            this.loaded = true;
            this.extractTiles();
        };
        
        this.image.onerror = () => {
            console.error('Failed to load tileset:', this.imagePath);
            // Fallback to programmatic generation
            this.generateFallbackTiles();
        };
        
        this.image.src = this.imagePath;
    }

    /**
     * Extract all tiles from spritesheet into cache
     * This pre-renders tiles to individual canvases for fast blitting
     */
    extractTiles() {
        for (const [tileName, position] of Object.entries(this.tileMap)) {
            const canvas = document.createElement('canvas');
            canvas.width = this.tileSize;
            canvas.height = this.tileSize;
            const ctx = canvas.getContext('2d');
            
            // Disable image smoothing for crisp pixels
            ctx.imageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;
            
            // Extract tile from spritesheet
            ctx.drawImage(
                this.image,
                position.x * this.tileSize,  // Source X
                position.y * this.tileSize,  // Source Y
                this.tileSize,               // Source width
                this.tileSize,               // Source height
                0,                           // Dest X
                0,                           // Dest Y
                this.tileSize,               // Dest width
                this.tileSize                // Dest height
            );
            
            this.tileCache[tileName] = canvas;
        }
    }

    /**
     * Generate fallback tiles programmatically if spritesheet fails to load
     * This ensures the game still works even if the image is missing
     */
    generateFallbackTiles() {
        // Floor tile
        this.tileCache.floor = this.createFallbackTile('#3a3a3a', [
            { x: 2, y: 2, w: 4, h: 4, color: '#454545' },
            { x: 10, y: 8, w: 3, h: 3, color: '#454545' }
        ]);
        
        // Wall tile
        this.tileCache.wall = this.createFallbackTile('#5a4a3a', [
            { x: 1, y: 1, w: 6, h: 6, color: '#6a5a4a' },
            { x: 9, y: 9, w: 5, h: 5, color: '#6a5a4a' },
            { x: 8, y: 2, w: 4, h: 4, color: '#4a3a2a' }
        ]);
        
        // Door tile
        this.tileCache.door = this.createFallbackTile('#3a3a3a', [
            { x: 4, y: 2, w: 8, h: 12, color: '#8b4513' },
            { x: 10, y: 7, w: 2, h: 2, color: '#ffd700' }
        ]);
        
        // Player tile
        this.tileCache.player = this.createFallbackTile('transparent', [
            { x: 5, y: 6, w: 6, h: 7, color: '#4488ff' },
            { x: 6, y: 3, w: 4, h: 4, color: '#ffcc99' },
            { x: 6, y: 12, w: 2, h: 3, color: '#4488ff' },
            { x: 8, y: 12, w: 2, h: 3, color: '#4488ff' }
        ]);
        
        // Chest tile
        this.tileCache.chest = this.createFallbackTile('#3a3a3a', [
            { x: 4, y: 6, w: 8, h: 6, color: '#8b6914' },
            { x: 4, y: 5, w: 8, h: 2, color: '#a0791a' },
            { x: 7, y: 8, w: 2, h: 2, color: '#ffd700' }
        ]);
        
        // Stairs tile
        this.tileCache.stairs = this.createFallbackTile('#3a3a3a', [
            { x: 2, y: 3, w: 12, h: 2, color: '#5a5a5a' },
            { x: 2, y: 6, w: 12, h: 2, color: '#5a5a5a' },
            { x: 2, y: 9, w: 12, h: 2, color: '#5a5a5a' },
            { x: 2, y: 12, w: 12, h: 2, color: '#5a5a5a' }
        ]);
        
        this.loaded = true;
    }

    /**
     * Create a fallback tile programmatically
     */
    createFallbackTile(baseColor, rects) {
        const canvas = document.createElement('canvas');
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;
        const ctx = canvas.getContext('2d');
        
        // Base color
        if (baseColor !== 'transparent') {
            ctx.fillStyle = baseColor;
            ctx.fillRect(0, 0, this.tileSize, this.tileSize);
        }
        
        // Draw rectangles
        for (const rect of rects) {
            ctx.fillStyle = rect.color;
            ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        }
        
        return canvas;
    }

    /**
     * Get a tile canvas by type
     * @param {string} type - Tile type
     * @returns {HTMLCanvasElement} Tile canvas
     */
    getTile(type) {
        // Return cached tile or fallback to floor
        return this.tileCache[type] || this.tileCache.floor || this.createEmptyTile();
    }

    /**
     * Create empty tile as last resort fallback
     */
    createEmptyTile() {
        const canvas = document.createElement('canvas');
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ff00ff'; // Magenta to indicate missing tile
        ctx.fillRect(0, 0, this.tileSize, this.tileSize);
        return canvas;
    }

    /**
     * Get source coordinates for a tile type from spritesheet
     * Used for direct sprite rendering
     * 
     * @param {string} type - Tile type
     * @returns {{x: number, y: number}} Sprite coordinates
     */
    getSpriteCoords(type) {
        const coords = this.tileMap[type] || this.tileMap.floor;
        return {
            x: coords.x * this.tileSize,
            y: coords.y * this.tileSize
        };
    }

    /**
     * Check if tileset is loaded
     * @returns {boolean}
     */
    isLoaded() {
        return this.loaded;
    }

    /**
     * Get the loaded spritesheet image
     * @returns {HTMLImageElement}
     */
    getImage() {
        return this.image;
    }

    /**
     * Get tile size
     * @returns {number}
     */
    getTileSize() {
        return this.tileSize;
    }
}
