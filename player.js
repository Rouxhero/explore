// Player management with movement and collision
class Player {
    constructor(world, x = 8, y = 8) {
        this.world = world;
        this.x = x;
        this.y = y;
        this.speed = 0.1;
        this.size = 16;
        
        // Movement state
        this.velocity = { x: 0, y: 0 };
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        
        this.setupControls();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        document.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
        });
    }

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

    update(deltaTime) {
        // Calculate velocity based on keys
        this.velocity.x = 0;
        this.velocity.y = 0;

        if (this.keys.up) this.velocity.y -= 1;
        if (this.keys.down) this.velocity.y += 1;
        if (this.keys.left) this.velocity.x -= 1;
        if (this.keys.right) this.velocity.x += 1;

        // Normalize diagonal movement
        const length = Math.sqrt(
            this.velocity.x * this.velocity.x + 
            this.velocity.y * this.velocity.y
        );

        if (length > 0) {
            this.velocity.x /= length;
            this.velocity.y /= length;
        }

        // Apply movement with collision detection
        const moveX = this.velocity.x * this.speed * deltaTime;
        const moveY = this.velocity.y * this.speed * deltaTime;

        // Check X collision
        if (this.canMoveTo(this.x + moveX, this.y)) {
            this.x += moveX;
        }

        // Check Y collision
        if (this.canMoveTo(this.x, this.y + moveY)) {
            this.y += moveY;
        }
    }

    canMoveTo(x, y) {
        // Check all four corners of the player
        const corners = [
            { x: Math.floor(x), y: Math.floor(y) },
            { x: Math.floor(x + 0.99), y: Math.floor(y) },
            { x: Math.floor(x), y: Math.floor(y + 0.99) },
            { x: Math.floor(x + 0.99), y: Math.floor(y + 0.99) }
        ];

        for (const corner of corners) {
            const tile = this.world.getTileAt(corner.x, corner.y);
            if (!tile.walkable) {
                return false;
            }
        }

        return true;
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    getTilePosition() {
        return {
            x: Math.floor(this.x),
            y: Math.floor(this.y)
        };
    }

    getChunkPosition() {
        return this.world.worldToChunk(
            Math.floor(this.x),
            Math.floor(this.y)
        );
    }
}
