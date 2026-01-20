/**
 * Input Manager
 * Handles keyboard input for player controls
 * Supports both WASD and Arrow keys
 */
class InputManager {
    constructor() {
        // Track current key states
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        
        this.setupEventListeners();
    }

    /**
     * Set up keyboard event listeners
     */
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    /**
     * Handle key press events
     * Maps both WASD and Arrow keys to directional input
     */
    handleKeyDown(e) {
        switch(e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.keys.up = true;
                e.preventDefault();
                break;
            case 's':
            case 'arrowdown':
                this.keys.down = true;
                e.preventDefault();
                break;
            case 'a':
            case 'arrowleft':
                this.keys.left = true;
                e.preventDefault();
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = true;
                e.preventDefault();
                break;
        }
    }

    /**
     * Handle key release events
     */
    handleKeyUp(e) {
        switch(e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.keys.up = false;
                break;
            case 's':
            case 'arrowdown':
                this.keys.down = false;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.left = false;
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = false;
                break;
        }
    }

    /**
     * Get the current input direction as normalized vector
     * @returns {{x: number, y: number}} Normalized movement vector
     */
    getDirection() {
        const direction = { x: 0, y: 0 };

        if (this.keys.up) direction.y -= 1;
        if (this.keys.down) direction.y += 1;
        if (this.keys.left) direction.x -= 1;
        if (this.keys.right) direction.x += 1;

        // Normalize diagonal movement to prevent faster diagonal speed
        const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        if (length > 0) {
            direction.x /= length;
            direction.y /= length;
        }

        return direction;
    }
}
