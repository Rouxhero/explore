// World generation with chunk-based deterministic generation
class World {
    constructor(seed = 12345) {
        this.seed = seed;
        this.chunkSize = 16; // 16x16 tiles per chunk
        this.tileSize = 16;
        this.chunks = new Map();
    }

    // Simple deterministic random number generator (seeded)
    seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    // Get hash for chunk coordinates
    getChunkHash(chunkX, chunkY) {
        return `${chunkX},${chunkY}`;
    }

    // Generate a single chunk deterministically based on seed and coordinates
    generateChunk(chunkX, chunkY) {
        const hash = this.getChunkHash(chunkX, chunkY);
        
        if (this.chunks.has(hash)) {
            return this.chunks.get(hash);
        }

        const chunk = {
            x: chunkX,
            y: chunkY,
            tiles: []
        };

        // Create deterministic seed for this chunk
        const chunkSeed = this.seed + chunkX * 73856093 + chunkY * 19349663;

        // Generate tiles
        for (let y = 0; y < this.chunkSize; y++) {
            chunk.tiles[y] = [];
            for (let x = 0; x < this.chunkSize; x++) {
                const tileSeed = chunkSeed + x * 83492791 + y * 49979687;
                const rand = this.seededRandom(tileSeed);
                
                let tileType = 'floor';
                
                // Create walls around the edges
                if (x === 0 || x === this.chunkSize - 1 || 
                    y === 0 || y === this.chunkSize - 1) {
                    tileType = 'wall';
                }
                // Random walls inside
                else if (rand < 0.15) {
                    tileType = 'wall';
                }
                // Occasional doors
                else if (rand > 0.92 && rand < 0.94) {
                    tileType = 'door';
                }
                // Rare chests
                else if (rand > 0.98) {
                    tileType = 'chest';
                }
                // Rare stairs
                else if (rand > 0.96 && rand < 0.97) {
                    tileType = 'stairs';
                }
                
                chunk.tiles[y][x] = {
                    type: tileType,
                    walkable: tileType !== 'wall'
                };
            }
        }

        // Ensure at least one path through the chunk
        this.ensurePathways(chunk);

        this.chunks.set(hash, chunk);
        return chunk;
    }

    // Ensure there are pathways through the chunk
    ensurePathways(chunk) {
        // Clear horizontal middle path (only replace walls)
        const midY = Math.floor(this.chunkSize / 2);
        for (let x = 1; x < this.chunkSize - 1; x++) {
            if (chunk.tiles[midY][x].type === 'wall') {
                chunk.tiles[midY][x].type = 'floor';
                chunk.tiles[midY][x].walkable = true;
            }
        }

        // Clear vertical middle path (only replace walls)
        const midX = Math.floor(this.chunkSize / 2);
        for (let y = 1; y < this.chunkSize - 1; y++) {
            if (chunk.tiles[y][midX].type === 'wall') {
                chunk.tiles[y][midX].type = 'floor';
                chunk.tiles[y][midX].walkable = true;
            }
        }
    }

    // Get tile at world position
    getTileAt(worldX, worldY) {
        const chunkX = Math.floor(worldX / this.chunkSize);
        const chunkY = Math.floor(worldY / this.chunkSize);
        // Handle negative coordinates correctly
        const localX = ((worldX % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const localY = ((worldY % this.chunkSize) + this.chunkSize) % this.chunkSize;

        const chunk = this.getChunk(chunkX, chunkY);
        
        if (localX >= 0 && localX < this.chunkSize && 
            localY >= 0 && localY < this.chunkSize) {
            return chunk.tiles[localY][localX];
        }
        
        return { type: 'wall', walkable: false };
    }

    // Get or generate a chunk
    getChunk(chunkX, chunkY) {
        const hash = this.getChunkHash(chunkX, chunkY);
        if (!this.chunks.has(hash)) {
            return this.generateChunk(chunkX, chunkY);
        }
        return this.chunks.get(hash);
    }

    // Get all chunks needed for current viewport
    getVisibleChunks(cameraX, cameraY, viewWidth, viewHeight) {
        const chunks = [];
        
        const startChunkX = Math.floor(cameraX / this.chunkSize) - 1;
        const startChunkY = Math.floor(cameraY / this.chunkSize) - 1;
        const endChunkX = Math.ceil((cameraX + viewWidth) / this.chunkSize) + 1;
        const endChunkY = Math.ceil((cameraY + viewHeight) / this.chunkSize) + 1;

        for (let cy = startChunkY; cy <= endChunkY; cy++) {
            for (let cx = startChunkX; cx <= endChunkX; cx++) {
                chunks.push(this.getChunk(cx, cy));
            }
        }

        return chunks;
    }

    // World to chunk coordinates
    worldToChunk(worldX, worldY) {
        const chunkX = Math.floor(worldX / this.chunkSize);
        const chunkY = Math.floor(worldY / this.chunkSize);
        return {
            chunkX: chunkX,
            chunkY: chunkY,
            localX: ((worldX % this.chunkSize) + this.chunkSize) % this.chunkSize,
            localY: ((worldY % this.chunkSize) + this.chunkSize) % this.chunkSize
        };
    }
}
