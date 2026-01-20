/**
 * Game Loop
 * Fixed timestep game loop for consistent physics and rendering
 * 
 * Uses the "fix your timestep" pattern:
 * - Physics updates at a fixed rate (60 FPS)
 * - Rendering happens as fast as possible
 * - Accumulator handles frame time variations
 * 
 * This ensures consistent game behavior regardless of frame rate
 */
class GameLoop {
    constructor(updateCallback, renderCallback) {
        this.updateCallback = updateCallback;
        this.renderCallback = renderCallback;
        
        // Fixed timestep for physics (60 FPS = 16.67ms per frame)
        this.fixedDeltaTime = 1000 / 60;
        
        // Timing state
        this.lastTime = performance.now();
        this.accumulator = 0;
        
        // Running state
        this.running = false;
        this.animationFrameId = null;
        
        // Performance tracking
        this.fps = 60;
        this.frameCount = 0;
        this.lastFpsUpdate = performance.now();
    }

    /**
     * Start the game loop
     */
    start() {
        if (this.running) return;
        
        this.running = true;
        this.lastTime = performance.now();
        this.accumulator = 0;
        this.loop();
    }

    /**
     * Stop the game loop
     */
    stop() {
        this.running = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Main game loop using fixed timestep
     * 
     * The accumulator pattern ensures physics updates happen at a constant rate:
     * 1. Measure time since last frame
     * 2. Add to accumulator
     * 3. While accumulator > fixed timestep, run update
     * 4. Render once per frame
     */
    loop() {
        if (!this.running) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Add frame time to accumulator
        this.accumulator += deltaTime;

        // Cap accumulator to prevent spiral of death
        // If we fall too far behind, skip some updates
        if (this.accumulator > this.fixedDeltaTime * 5) {
            this.accumulator = this.fixedDeltaTime * 5;
        }

        // Run fixed updates as many times as needed
        while (this.accumulator >= this.fixedDeltaTime) {
            this.updateCallback(this.fixedDeltaTime);
            this.accumulator -= this.fixedDeltaTime;
        }

        // Always render once per frame
        this.renderCallback();

        // Update FPS counter
        this.updateFPS(currentTime);

        // Schedule next frame
        this.animationFrameId = requestAnimationFrame(() => this.loop());
    }

    /**
     * Update FPS calculation
     * Updates once per second for smooth display
     */
    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
    }

    /**
     * Get current FPS
     * @returns {number} Frames per second
     */
    getFPS() {
        return this.fps;
    }

    /**
     * Check if loop is running
     * @returns {boolean}
     */
    isRunning() {
        return this.running;
    }
}
