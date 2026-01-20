/**
 * Chunk Manager
 * Manages chunk lifecycle: generation, caching, and culling
 * 
 * Infinite World Logic:
 * - World is divided into fixed-size chunks (e.g., 16x16 tiles)
 * - Only chunks near the player are kept in memory
 * - New chunks are generated on-demand as player explores
 * - Old chunks outside viewport are discarded to save memory
 * - Each chunk is identified by (chunkX, chunkY) coordinates
 * - Chunks are generated deterministically from seed + coordinates
 * 
 * This creates the illusion of an infinite world while using finite memory
 */
class ChunkManager {
    constructor(seed, chunkSize, tileSize) {
        this.seed = seed;
        this.chunkSize = chunkSize; // Tiles per chunk (e.g., 16)
        this.tileSize = tileSize;   // Pixels per tile (e.g., 16)
        
        // Chunk storage: Map<string, Chunk>
        // Key format: "x,y" (e.g., "0,0", "-1,2")
        this.chunks = new Map();
        
        // Chunk generator
        this.generator = new ChunkGenerator(seed);
        
        // Culling settings
        this.maxCachedChunks = 100; // Maximum chunks to keep in memory
        this.cullDistance = 5;       // Chunks beyond this distance are culled
    }

    /**
     * Get chunk hash key from coordinates
     * @param {number} chunkX - Chunk X coordinate
     * @param {number} chunkY - Chunk Y coordinate
     * @returns {string} Hash key
     */
    getChunkKey(chunkX, chunkY) {
        return `${chunkX},${chunkY}`;
    }

    /**
     * Get or generate a chunk at given coordinates
     * This is the core of on-demand generation
     * 
     * @param {number} chunkX - Chunk X coordinate
     * @param {number} chunkY - Chunk Y coordinate
     * @returns {Object} Chunk data
     */
    getChunk(chunkX, chunkY) {
        const key = this.getChunkKey(chunkX, chunkY);
        
        // Return cached chunk if exists
        if (this.chunks.has(key)) {
            const chunk = this.chunks.get(key);
            chunk.lastAccessed = Date.now();
            return chunk;
        }
        
        // Generate new chunk
        return this.generateChunk(chunkX, chunkY);
    }

    /**
     * Generate a new chunk
     * @param {number} chunkX - Chunk X coordinate
     * @param {number} chunkY - Chunk Y coordinate
     * @returns {Object} Generated chunk
     */
    generateChunk(chunkX, chunkY) {
        const key = this.getChunkKey(chunkX, chunkY);
        
        // Generate tiles using deterministic generator
        const tiles = this.generator.generate(chunkX, chunkY, this.chunkSize);
        
        const chunk = {
            x: chunkX,
            y: chunkY,
            tiles: tiles,
            lastAccessed: Date.now()
        };
        
        this.chunks.set(key, chunk);
        
        // Cull old chunks if we have too many
        if (this.chunks.size > this.maxCachedChunks) {
            this.cullOldChunks();
        }
        
        return chunk;
    }

    /**
     * Get tile at world coordinates
     * Automatically loads the correct chunk
     * 
     * World Coordinate System:
     * - World uses continuous integer tile coordinates
     * - Can be negative (e.g., -5, 10)
     * - Each chunk covers chunkSize tiles
     * - Chunk (0,0) contains world tiles (0,0) to (chunkSize-1, chunkSize-1)
     * - Chunk (-1,0) contains world tiles (-chunkSize,-1) to (-1, chunkSize-1)
     * 
     * @param {number} worldX - World tile X coordinate
     * @param {number} worldY - World tile Y coordinate
     * @returns {Object} Tile data
     */
    getTileAt(worldX, worldY) {
        // Convert world coordinates to chunk coordinates
        // Math.floor handles negative coordinates correctly
        const chunkX = Math.floor(worldX / this.chunkSize);
        const chunkY = Math.floor(worldY / this.chunkSize);
        
        // Calculate local coordinates within chunk
        // Modulo with correction for negative numbers
        const localX = ((worldX % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const localY = ((worldY % this.chunkSize) + this.chunkSize) % this.chunkSize;
        
        // Get chunk (generates if needed)
        const chunk = this.getChunk(chunkX, chunkY);
        
        // Return tile
        if (localY >= 0 && localY < this.chunkSize && 
            localX >= 0 && localX < this.chunkSize) {
            return chunk.tiles[localY][localX];
        }
        
        // Fallback for out-of-bounds
        return { type: 'wall', walkable: false };
    }
    
    // Convenience accessors for layered tiles
    getGroundTypeAt(worldX, worldY) {
        const t = this.getTileAt(worldX, worldY);
        return t ? (t.ground || t.type) : null;
    }
    
    getDecorTypeAt(worldX, worldY) {
        const t = this.getTileAt(worldX, worldY);
        return t ? t.decor : null;
    }

    /**
     * Get all chunks visible in the camera viewport
     * Used for rendering optimization - only process visible chunks
     * 
     * @param {Object} camera - Camera with getVisibleChunkRange method
     * @returns {Array<Object>} Array of visible chunks
     */
    getVisibleChunks(camera) {
        const range = camera.getVisibleChunkRange(this.chunkSize);
        const visibleChunks = [];
        
        for (let cy = range.startY; cy <= range.endY; cy++) {
            for (let cx = range.startX; cx <= range.endX; cx++) {
                visibleChunks.push(this.getChunk(cx, cy));
            }
        }
        
        return visibleChunks;
    }

    /**
     * Cull chunks that haven't been accessed recently
     * Keeps memory usage bounded in infinite world
     * 
     * Culling Strategy:
     * - Sort chunks by last access time
     * - Remove oldest 20% of chunks
     * - This prevents memory growth while keeping recent chunks
     */
    cullOldChunks() {
        // Convert map to array for sorting
        const chunkArray = Array.from(this.chunks.entries());
        
        // Sort by last accessed time (oldest first)
        chunkArray.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
        
        // Remove oldest 20%
        const removeCount = Math.floor(this.chunks.size * 0.2);
        for (let i = 0; i < removeCount; i++) {
            this.chunks.delete(chunkArray[i][0]);
        }
    }

    /**
     * Cull chunks far from a given position
     * Alternative culling strategy based on distance
     * 
     * @param {number} centerX - Center X in tile coordinates
     * @param {number} centerY - Center Y in tile coordinates
     */
    cullDistantChunks(centerX, centerY) {
        const centerChunkX = Math.floor(centerX / this.chunkSize);
        const centerChunkY = Math.floor(centerY / this.chunkSize);
        
        const toDelete = [];
        
        for (const [key, chunk] of this.chunks.entries()) {
            const dx = chunk.x - centerChunkX;
            const dy = chunk.y - centerChunkY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > this.cullDistance) {
                toDelete.push(key);
            }
        }
        
        for (const key of toDelete) {
            this.chunks.delete(key);
        }
    }

    /**
     * Convert world tile coordinates to chunk coordinates
     * @param {number} worldX - World X coordinate
     * @param {number} worldY - World Y coordinate
     * @returns {Object} Chunk and local coordinates
     */
    worldToChunk(worldX, worldY) {
        const chunkX = Math.floor(worldX / this.chunkSize);
        const chunkY = Math.floor(worldY / this.chunkSize);
        const localX = ((worldX % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const localY = ((worldY % this.chunkSize) + this.chunkSize) % this.chunkSize;
        
        return { chunkX, chunkY, localX, localY };
    }

    /**
     * Get statistics about chunk cache
     * @returns {Object} Cache statistics
     */
    getStats() {
        return {
            cachedChunks: this.chunks.size,
            maxCachedChunks: this.maxCachedChunks
        };
    }
}
