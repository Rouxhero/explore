# Pixel Dungeon

A canvas-based pixel dungeon game with procedurally generated infinite worlds.

## Features

- **Canvas-based rendering** with programmatically generated dungeon tiles
- **Procedural infinite world** using chunk-based deterministic generation
- **Seeded generation** - same seed always produces the same world
- **Smooth player movement** with WASD or Arrow keys
- **Camera system** that follows the player
- **Collision detection** - player cannot walk through walls
- **On-the-fly chunk generation** - chunks are generated as you explore
- **Vanilla JavaScript** - no frameworks or dependencies

## Controls

- **WASD** or **Arrow Keys** - Move the player
- The camera automatically follows your character
- Current position, chunk coordinates, and seed are displayed on screen

## Game Elements

- **Stone walls** (brown) - Block movement
- **Floor tiles** (dark gray) - Walkable areas
- **Doors** (wooden) - Walkable passages
- **Chests** (golden) - Decorative elements
- **Stairs** (gray) - Decorative elements
- **Player** (blue character) - You!

## How It Works

The game uses a chunk-based world generation system:

1. The world is divided into 16x16 tile chunks
2. Each chunk is generated deterministically based on the world seed and chunk coordinates
3. Chunks are generated on-demand as the player explores
4. The same seed always produces the same world layout

## Auto-Deployment

This game automatically deploys to GitHub Pages on every push to the main branch or copilot/build-pixel-dungeon-game branch using GitHub Actions.

## Local Development

Simply open `index.html` in a web browser or serve it with any static web server:

```bash
python3 -m http.server 8080
# Then visit http://localhost:8080
```

## Files

- `index.html` - Main HTML structure
- `style.css` - Styling and layout
- `game.js` - Main game loop and rendering
- `world.js` - Chunk-based world generation
- `player.js` - Player movement and collision
- `tileset.js` - Programmatic tile generation