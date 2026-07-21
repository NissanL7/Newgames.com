# VoxelCraft - 3D Block Game

A Minecraft-inspired 3D voxel game built with Three.js and WebGL. Features procedural terrain generation, mobile joystick controls, inventory, crafting, multiple worlds, and more.

## Features

- **3D Voxel World** - Full 3D rendering with Three.js
- **Procedural Terrain** - Perlin noise-based generation with multiple world types
- **Chunk System** - Dynamic chunk loading/unloading for performance
- **Mobile Controls** - Virtual joystick and touch buttons
- **Inventory System** - 36-slot inventory with 9-slot hotbar
- **Crafting System** - 20+ recipes for tools, materials, and building blocks
- **24+ Block Types** - Grass, stone, ores, wood, sand, water, glass, brick, and more
- **Sand & Gravel Physics** - Gravity-affected blocks
- **Water Rendering** - Transparent water with proper rendering
- **Multiple World Types** - Normal, Flat, Mountains, Desert, Snowy
- **Save & Load** - Save progress to localStorage
- **Day/Night Cycle** - Dynamic lighting and sky colors
- **Debug Menu** - F3-style performance and position info
- **Cave Generation** - 3D noise-based underground caves
- **Tree Generation** - Procedural trees in forests
- **Ore Distribution** - Realistic ore placement at different depths

## Controls

### Desktop
| Key | Action |
|-----|--------|
| WASD | Move |
| Mouse | Look around |
| Space | Jump |
| F | Toggle fly mode |
| E | Inventory |
| C | Crafting |
| Q | Drop item |
| 1-9 | Select hotbar slot |
| Left Click | Break block |
| Right Click | Place block |
| Scroll | Change hotbar |
| F3 | Debug menu |
| Esc | Save & Quit |

### Mobile
- **Left Joystick** - Movement
- **Right Side Touch** - Look around
- **Jump Button** - Jump/Swim up
- **⛏️ Button** - Break block
- **📦 Button** - Place block
- **🎒 Button** - Inventory

## How to Play

1. Open `index.html` in a modern web browser
2. Click "Play" to start with default world, or "Worlds" to create/manage worlds
3. Break blocks by clicking/hitting them
4. Place blocks from your inventory
5. Craft tools and materials in the crafting menu
6. Explore different world types!

## Tech Stack

- **Three.js r128** - 3D rendering engine
- **Vanilla JavaScript** - No framework dependencies
- **Procedural Textures** - Canvas-based texture generation
- **Perlin Noise** - Custom implementation for terrain

## File Structure

```
├── index.html          # Main entry point
├── css/
│   └── style.css       # All styling
├── js/
│   ├── app.js          # Application entry, menus
│   ├── main.js         # Game class and loop
│   ├── data/
│   │   ├── blocks.js   # Block/item definitions
│   │   └── recipes.js  # Crafting recipes
│   ├── engine/
│   │   ├── noise.js    # Perlin noise generator
│   │   ├── textures.js # Procedural texture atlas
│   │   ├── chunk.js    # Chunk & world generation
│   │   ├── player.js   # Player physics & input
│   │   └── inventory.js # Inventory management
│   ├── ui/
│   │   ├── joystick.js # Mobile touch controls
│   │   ├── hud.js      # HUD rendering
│   │   ├── crafting.js # Crafting UI
│   │   └── debug.js    # Debug menu
│   └── systems/
│       ├── save.js     # Save/load system
│       └── worlds.js   # Multi-world manager
```
