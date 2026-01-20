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

        // Joystick state
        this.joystick = {
            active: false,
            vector: { x: 0, y: 0 },
            radius: 70,
            deadzone: 0.15,
            element: document.getElementById('joystick'),
            base: document.getElementById('joystick-base'),
            stick: document.getElementById('joystick-stick')
        };
        this.joystickCenter = { x: 0, y: 0 };

        this.setupEventListeners();
        this.setupJoystick();
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
        // If joystick is active or has non-zero vector, prioritize it
        if (Math.abs(this.joystick.vector.x) > 0 || Math.abs(this.joystick.vector.y) > 0) {
            return this.joystick.vector;
        }

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

    /**
     * Initialize on-screen joystick for touch devices
     */
    setupJoystick() {
        const js = this.joystick;
        if (!js.element || !js.base || !js.stick) {
            return; // No joystick in DOM
        }

        // Show joystick only on touch-capable devices
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (!isTouch) {
            // Keep hidden on desktop (media query also hides it)
        }

        const setStickPosition = (dx, dy) => {
            // Clamp within radius
            const len = Math.sqrt(dx*dx + dy*dy);
            const max = js.radius - (js.stick.offsetWidth / 2);
            let clampedX = dx;
            let clampedY = dy;
            if (len > max) {
                const scale = max / len;
                clampedX *= scale;
                clampedY *= scale;
            }
            js.stick.style.left = (js.baseCenter.x + clampedX - js.stick.offsetWidth/2) + 'px';
            js.stick.style.top = (js.baseCenter.y + clampedY - js.stick.offsetHeight/2) + 'px';

            // Compute normalized vector (-1..1)
            const normX = clampedX / max;
            const normY = clampedY / max;
            const magnitude = Math.sqrt(normX*normX + normY*normY);
            if (magnitude < js.deadzone) {
                this.joystick.vector = { x: 0, y: 0 };
            } else {
                // Normalize to unit length to match keyboard behavior
                const invLen = 1 / (magnitude || 1);
                this.joystick.vector = { x: normX * invLen, y: normY * invLen };
            }
        };

        const resetStick = () => {
            js.stick.style.left = (js.baseCenter.x - js.stick.offsetWidth/2) + 'px';
            js.stick.style.top = (js.baseCenter.y - js.stick.offsetHeight/2) + 'px';
            this.joystick.vector = { x: 0, y: 0 };
        };

        const updateBaseCenter = () => {
            const rect = js.element.getBoundingClientRect();
            js.baseCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
            // Initial center position
            resetStick();
        };

        updateBaseCenter();
        window.addEventListener('resize', updateBaseCenter);

        const onPointerDown = (e) => {
            e.preventDefault();
            js.active = true;
            js.element.setPointerCapture && js.element.setPointerCapture(e.pointerId);
        };
        const onPointerMove = (e) => {
            if (!js.active) return;
            e.preventDefault();
            const dx = e.clientX - js.baseCenter.x;
            const dy = e.clientY - js.baseCenter.y;
            setStickPosition(dx, dy);
        };
        const onPointerUp = (e) => {
            e.preventDefault();
            js.active = false;
            resetStick();
        };

        js.element.addEventListener('pointerdown', onPointerDown, { passive: false });
        window.addEventListener('pointermove', onPointerMove, { passive: false });
        window.addEventListener('pointerup', onPointerUp, { passive: false });
        window.addEventListener('pointercancel', onPointerUp, { passive: false });
    }
}
