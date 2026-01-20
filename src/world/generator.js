/**
 * Chunk Generator
 * Handles deterministic procedural generation of dungeon chunks
 * 
 * Chunk Generation Process:
 * 1. Use world seed + chunk coordinates to generate unique chunk seed
 * 2. Use seeded random to generate tile layout
 * 3. Apply dungeon generation algorithm (cellular automata or rooms/corridors)
 * 4. Ensure connectivity between chunks
 * 
 * The same seed + coordinates always produces the same chunk
 * This enables infinite world generation without storing all data
 */
class ChunkGenerator {
    constructor(seed) {
        this.seed = seed;
        
        // Large prime numbers for coordinate hashing
        // These ensure different chunks get different seeds
        this.primeX = 73856093;
        this.primeY = 19349663;
        this.primeTileX = 83492791;
        this.primeTileY = 49979687;
    }

    /**
     * Seeded random number generator
     * Uses sine-based deterministic random for consistency
     * 
     * @param {number} seed - Seed value
     * @returns {number} Random value between 0 and 1
     */
    seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    /**
     * Generate a chunk at given coordinates
     * This is the core of the infinite world system
     * 
     * @param {number} chunkX - Chunk X coordinate
     * @param {number} chunkY - Chunk Y coordinate
     * @param {number} chunkSize - Size of chunk in tiles
     * @returns {Array<Array<Object>>} 2D array of tiles
     */
    generate(chunkX, chunkY, chunkSize) {
        // Create unique deterministic seed for this chunk
        // By combining world seed with chunk coordinates, we ensure:
        // - Same coordinates always produce same chunk
        // - Different coordinates produce different chunks
        // - Different world seeds produce different worlds
        const chunkSeed = this.seed + chunkX * this.primeX + chunkY * this.primeY;

        const tiles = [];

        // Generate each tile in the chunk
        for (let y = 0; y < chunkSize; y++) {
            tiles[y] = [];
            for (let x = 0; x < chunkSize; x++) {
                // Create unique seed for this tile
                const tileSeed = chunkSeed + x * this.primeTileX + y * this.primeTileY;
                const rand = this.seededRandom(tileSeed);
                
                // Generate tile based on random value
                tiles[y][x] = this.generateTile(rand, x, y, chunkSize);
            }
        }

        // Apply cellular automata smoothing for more natural caves
        this.smoothChunk(tiles, chunkSeed);

        // Ensure pathways through the chunk for connectivity
        this.ensureConnectivity(tiles, chunkSize, chunkSeed);

        return tiles;
    }

    /**
     * Generate a single tile based on random value
     * 
     * @param {number} rand - Random value 0-1
     * @param {number} x - Local X coordinate
     * @param {number} y - Local Y coordinate
     * @param {number} chunkSize - Chunk size
     * @returns {Object} Tile data
     */
    generateTile(rand, x, y, chunkSize) {
        let tileType = 'floor';
        
        // Edges have higher chance of walls for room-like structure
        const isEdge = x === 0 || x === chunkSize - 1 || 
                       y === 0 || y === chunkSize - 1;
        
        if (isEdge && rand < 0.7) {
            tileType = 'wall';
        }
        // Interior walls for dungeon feel
        else if (!isEdge && rand < 0.4) {
            tileType = 'wall';
        }
        // Doors in walls
        else if (rand > 0.88 && rand < 0.90) {
            tileType = 'door';
        }
        // Decorative elements
        else if (rand > 0.98) {
            tileType = 'chest';
        }
        else if (rand > 0.96 && rand < 0.97) {
            tileType = 'stairs';
        }
        
        return {
            type: tileType,
            walkable: tileType !== 'wall'
        };
    }

    /**
     * Apply cellular automata rules to smooth the chunk
     * This creates more natural-looking cave structures
     * 
     * @param {Array<Array<Object>>} tiles - Tile array
     * @param {number} chunkSeed - Seed for any randomization in this method
     */
    smoothChunk(tiles, chunkSeed) {
        const size = tiles.length;
        const newTiles = JSON.parse(JSON.stringify(tiles));

        // Run cellular automata iterations
        const iterations = 2;
        for (let iter = 0; iter < iterations; iter++) {
            for (let y = 1; y < size - 1; y++) {
                for (let x = 1; x < size - 1; x++) {
                    // Count wall neighbors
                    let wallCount = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            if (tiles[y + dy][x + dx].type === 'wall') {
                                wallCount++;
                            }
                        }
                    }

                    // Apply rules: if 5 or more neighbors are walls, become wall
                    // If 3 or fewer neighbors are walls, become floor
                    // This smooths out random noise into organic shapes
                    if (wallCount >= 5) {
                        newTiles[y][x] = { type: 'wall', walkable: false };
                    } else if (wallCount <= 3) {
                        // Keep special tiles
                        if (tiles[y][x].type === 'door' || 
                            tiles[y][x].type === 'chest' ||
                            tiles[y][x].type === 'stairs') {
                            newTiles[y][x] = tiles[y][x];
                        } else {
                            newTiles[y][x] = { type: 'floor', walkable: true };
                        }
                    }
                }
            }
            // Update tiles for next iteration
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    tiles[y][x] = newTiles[y][x];
                }
            }
        }
    }

    /**
     * Ensure there are clear pathways through the chunk
     * This guarantees chunks are connected for infinite exploration
     * 
     * Creates cross-shaped paths through middle of chunk
     * Player can always move between chunks
     * 
     * @param {Array<Array<Object>>} tiles - Tile array
     * @param {number} chunkSize - Chunk size
     * @param {number} chunkSeed - Seed for deterministic path generation
     */
    ensureConnectivity(tiles, chunkSize, chunkSeed) {
        // Horizontal path through middle
        const midY = Math.floor(chunkSize / 2);
        for (let x = 0; x < chunkSize; x++) {
            // Only clear walls, preserve decorative tiles
            if (tiles[midY][x].type === 'wall') {
                tiles[midY][x] = { type: 'floor', walkable: true };
            }
        }

        // Vertical path through middle
        const midX = Math.floor(chunkSize / 2);
        for (let y = 0; y < chunkSize; y++) {
            if (tiles[y][midX].type === 'wall') {
                tiles[y][midX] = { type: 'floor', walkable: true };
            }
        }

        // Add some extra paths for variety
        const offset = Math.floor(chunkSize / 4);
        
        // Secondary horizontal paths - use deterministic random
        for (let x = 0; x < chunkSize; x++) {
            const seed1 = chunkSeed + x * 12345 + offset * 67890;
            if (tiles[offset][x].type === 'wall' && this.seededRandom(seed1) < 0.3) {
                tiles[offset][x] = { type: 'floor', walkable: true };
            }
            const seed2 = chunkSeed + x * 12345 + (chunkSize - offset - 1) * 67890;
            if (tiles[chunkSize - offset - 1][x].type === 'wall' && this.seededRandom(seed2) < 0.3) {
                tiles[chunkSize - offset - 1][x] = { type: 'floor', walkable: true };
            }
        }
    }
}
