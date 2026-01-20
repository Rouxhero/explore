/**
 * Renderer
 * Handles all canvas drawing operations with sprite batching
 * Uses a single canvas context for optimal performance
 */
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Enable crisp pixel rendering
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
    }

    /**
     * Clear the entire canvas
     */
    clear() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Draw a tile from the tileset
     * Sprite batching is achieved by drawing directly from the tileset
     * without intermediate canvas operations
     * 
     * @param {HTMLImageElement|HTMLCanvasElement} image - Source image
     * @param {number} sx - Source X in spritesheet
     * @param {number} sy - Source Y in spritesheet
     * @param {number} sw - Source width
     * @param {number} sh - Source height
     * @param {number} dx - Destination X on canvas
     * @param {number} dy - Destination Y on canvas
     * @param {number} dw - Destination width
     * @param {number} dh - Destination height
     */
    drawSprite(image, sx, sy, sw, sh, dx, dy, dw, dh) {
        this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    /**
     * Draw a simple tile (entire image)
     * @param {HTMLImageElement|HTMLCanvasElement} image - Tile image
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    drawTile(image, x, y) {
        this.ctx.drawImage(image, x, y);
    }

    /**
     * Draw text on canvas
     * @param {string} text - Text to draw
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Text color
     * @param {string} font - Font style
     */
    drawText(text, x, y, color = '#ffffff', font = '12px monospace') {
        this.ctx.font = font;
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
    }

    /**
     * Draw a rectangle
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {string} color - Fill color
     */
    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }

    /**
     * Draw a rectangle outline
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {string} color - Stroke color
     * @param {number} lineWidth - Line width
     */
    drawRectOutline(x, y, width, height, color, lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeRect(x, y, width, height);
    }

    /**
     * Set canvas size
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    setSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    /**
     * Get canvas dimensions
     * @returns {{width: number, height: number}}
     */
    getSize() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }
}
