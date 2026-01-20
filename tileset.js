// Tileset management - creates dungeon tiles programmatically
class Tileset {
    constructor() {
        this.tileSize = 16;
        this.tiles = {};
        this.loaded = false;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.generateTiles();
    }

    generateTiles() {
        // Generate all tile types
        this.tiles.floor = this.createFloorTile();
        this.tiles.wall = this.createWallTile();
        this.tiles.wallTop = this.createWallTopTile();
        this.tiles.door = this.createDoorTile();
        this.tiles.player = this.createPlayerTile();
        this.tiles.chest = this.createChestTile();
        this.tiles.stairs = this.createStairsTile();
        this.loaded = true;
    }

    createFloorTile() {
        const canvas = document.createElement('canvas');
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;
        const ctx = canvas.getContext('2d');
        
        // Dark stone floor with pattern
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(0, 0, this.tileSize, this.tileSize);
        
        // Add some variation
        ctx.fillStyle = '#454545';
        ctx.fillRect(2, 2, 4, 4);
        ctx.fillRect(10, 8, 3, 3);
        
        // Border
        ctx.strokeStyle = '#2a2a2a';
        ctx.strokeRect(0, 0, this.tileSize, this.tileSize);
        
        return canvas;
    }

    createWallTile() {
        const canvas = document.createElement('canvas');
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;
        const ctx = canvas.getContext('2d');
        
        // Stone wall
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(0, 0, this.tileSize, this.tileSize);
        
        // Add stone texture
        ctx.fillStyle = '#6a5a4a';
        ctx.fillRect(1, 1, 6, 6);
        ctx.fillRect(9, 9, 5, 5);
        
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(8, 2, 4, 4);
        ctx.fillRect(3, 10, 4, 4);
        
        // Border
        ctx.strokeStyle = '#3a2a1a';
        ctx.strokeRect(0, 0, this.tileSize, this.tileSize);
        
        return canvas;
    }

    createWallTopTile() {
        const canvas = document.createElement('canvas');
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;
        const ctx = canvas.getContext('2d');
        
        // Stone wall top (lighter)
        ctx.fillStyle = '#7a6a5a';
        ctx.fillRect(0, 0, this.tileSize, this.tileSize);
        
        // Add stone texture
        ctx.fillStyle = '#8a7a6a';
        ctx.fillRect(2, 2, 5, 5);
        ctx.fillRect(10, 8, 4, 4);
        
        ctx.fillStyle = '#6a5a4a';
        ctx.fillRect(9, 2, 3, 3);
        
        return canvas;
    }

    createDoorTile() {
        const canvas = document.createElement('canvas');
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;
        const ctx = canvas.getContext('2d');
        
        // Floor base
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(0, 0, this.tileSize, this.tileSize);
        
        // Door
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(4, 2, 8, 12);
        
        // Door details
        ctx.fillStyle = '#654321';
        ctx.fillRect(5, 3, 2, 10);
        ctx.fillRect(9, 3, 2, 10);
        
        // Door handle
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(10, 7, 2, 2);
        
        return canvas;
    }

    createPlayerTile() {
        const canvas = document.createElement('canvas');
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;
        const ctx = canvas.getContext('2d');
        
        // Body
        ctx.fillStyle = '#4488ff';
        ctx.fillRect(5, 6, 6, 7);
        
        // Head
        ctx.fillStyle = '#ffcc99';
        ctx.fillRect(6, 3, 4, 4);
        
        // Arms
        ctx.fillStyle = '#4488ff';
        ctx.fillRect(4, 7, 2, 4);
        ctx.fillRect(10, 7, 2, 4);
        
        // Legs
        ctx.fillRect(6, 12, 2, 3);
        ctx.fillRect(8, 12, 2, 3);
        
        return canvas;
    }

    createChestTile() {
        const canvas = document.createElement('canvas');
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;
        const ctx = canvas.getContext('2d');
        
        // Floor
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(0, 0, this.tileSize, this.tileSize);
        
        // Chest
        ctx.fillStyle = '#8b6914';
        ctx.fillRect(4, 6, 8, 6);
        
        // Chest top
        ctx.fillStyle = '#a0791a';
        ctx.fillRect(4, 5, 8, 2);
        
        // Lock
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(7, 8, 2, 2);
        
        return canvas;
    }

    createStairsTile() {
        const canvas = document.createElement('canvas');
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;
        const ctx = canvas.getContext('2d');
        
        // Floor base
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(0, 0, this.tileSize, this.tileSize);
        
        // Stairs
        ctx.fillStyle = '#5a5a5a';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(2, 3 + i * 3, 12, 2);
        }
        
        return canvas;
    }

    getTile(type) {
        return this.tiles[type] || this.tiles.floor;
    }

    isLoaded() {
        return this.loaded;
    }
}
