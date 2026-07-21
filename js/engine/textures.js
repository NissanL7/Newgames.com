// Procedural texture generation for all block types
class TextureGenerator {
  constructor() {
    this.textures = {};
    this.atlas = null;
    this.atlasSize = 16; // 16x16 grid
    this.tileSize = 16;  // 16x16 pixels per texture
  }

  generateAll() {
    const size = this.tileSize;
    this.atlas = document.createElement('canvas');
    this.atlas.width = this.atlasSize * size;
    this.atlas.height = this.atlasSize * size;
    const ctx = this.atlas.getContext('2d');

    // Generate each texture
    const textureNames = [
      'grass_top', 'grass_side', 'dirt', 'stone', 'sand', 'water',
      'wood_side', 'wood_top', 'leaves', 'cobblestone', 'planks',
      'glass', 'brick', 'coal_ore', 'iron_ore', 'gold_ore',
      'diamond_ore', 'bedrock', 'gravel', 'snow', 'ice',
      'cactus_side', 'cactus_top', 'clay', 'sandstone_top', 'sandstone_side',
      'crafting_table_top', 'crafting_table_side'
    ];

    textureNames.forEach((name, i) => {
      const col = i % this.atlasSize;
      const row = Math.floor(i / this.atlasSize);
      this.generateTexture(ctx, name, col * size, row * size, size);
      this.textures[name] = { col, row, x: col * size, y: row * size };
    });

    return this.atlas;
  }

  generateTexture(ctx, name, x, y, size) {
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    switch(name) {
      case 'grass_top':
        this.fillNoise(data, size, [76, 153, 0], [60, 140, 0], 30);
        break;
      case 'grass_side':
        this.fillGrassSide(data, size);
        break;
      case 'dirt':
        this.fillNoise(data, size, [134, 96, 67], [120, 80, 55], 25);
        break;
      case 'stone':
        this.fillNoise(data, size, [128, 128, 128], [100, 100, 100], 30);
        break;
      case 'sand':
        this.fillNoise(data, size, [220, 200, 130], [200, 180, 110], 20);
        break;
      case 'water':
        this.fillNoise(data, size, [30, 80, 180], [20, 60, 160], 15);
        break;
      case 'wood_side':
        this.fillWood(data, size);
        break;
      case 'wood_top':
        this.fillWoodTop(data, size);
        break;
      case 'leaves':
        this.fillLeaves(data, size);
        break;
      case 'cobblestone':
        this.fillCobblestone(data, size);
        break;
      case 'planks':
        this.fillPlanks(data, size);
        break;
      case 'glass':
        this.fillGlass(data, size);
        break;
      case 'brick':
        this.fillBrick(data, size);
        break;
      case 'coal_ore':
        this.fillOre(data, size, [128, 128, 128], [30, 30, 30]);
        break;
      case 'iron_ore':
        this.fillOre(data, size, [128, 128, 128], [200, 180, 160]);
        break;
      case 'gold_ore':
        this.fillOre(data, size, [128, 128, 128], [255, 215, 0]);
        break;
      case 'diamond_ore':
        this.fillOre(data, size, [128, 128, 128], [80, 220, 240]);
        break;
      case 'bedrock':
        this.fillNoise(data, size, [50, 50, 50], [30, 30, 30], 40);
        break;
      case 'gravel':
        this.fillNoise(data, size, [140, 130, 125], [110, 100, 95], 35);
        break;
      case 'snow':
        this.fillNoise(data, size, [240, 250, 255], [230, 240, 250], 10);
        break;
      case 'ice':
        this.fillIce(data, size);
        break;
      case 'cactus_side':
        this.fillCactusSide(data, size);
        break;
      case 'cactus_top':
        this.fillCactusTop(data, size);
        break;
      case 'clay':
        this.fillNoise(data, size, [160, 160, 170], [145, 145, 155], 15);
        break;
      case 'sandstone_top':
        this.fillNoise(data, size, [220, 200, 130], [210, 190, 120], 15);
        break;
      case 'sandstone_side':
        this.fillSandstone(data, size);
        break;
      case 'crafting_table_top':
        this.fillCraftingTop(data, size);
        break;
      case 'crafting_table_side':
        this.fillCraftingSide(data, size);
        break;
      default:
        this.fillNoise(data, size, [255, 0, 255], [200, 0, 200], 20);
    }

    ctx.putImageData(imgData, x, y);
  }

  fillNoise(data, size, baseColor, varColor, variance) {
    for (let i = 0; i < size * size; i++) {
      const t = Math.random();
      const idx = i * 4;
      data[idx]     = baseColor[0] + (Math.random() - 0.5) * variance;
      data[idx + 1] = baseColor[1] + (Math.random() - 0.5) * variance;
      data[idx + 2] = baseColor[2] + (Math.random() - 0.5) * variance;
      data[idx + 3] = 255;
    }
  }

  fillGrassSide(data, size) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        if (y < 3) {
          data[idx]     = 76 + (Math.random() - 0.5) * 30;
          data[idx + 1] = 153 + (Math.random() - 0.5) * 30;
          data[idx + 2] = 0 + Math.random() * 20;
        } else {
          data[idx]     = 134 + (Math.random() - 0.5) * 25;
          data[idx + 1] = 96 + (Math.random() - 0.5) * 25;
          data[idx + 2] = 67 + (Math.random() - 0.5) * 20;
        }
        data[idx + 3] = 255;
      }
    }
  }

  fillWood(data, size) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const stripe = Math.sin(y * 0.8) * 10;
        data[idx]     = 100 + stripe + (Math.random() - 0.5) * 15;
        data[idx + 1] = 70 + stripe + (Math.random() - 0.5) * 10;
        data[idx + 2] = 40 + (Math.random() - 0.5) * 10;
        data[idx + 3] = 255;
      }
    }
  }

  fillWoodTop(data, size) {
    const cx = size / 2, cy = size / 2;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        const ring = Math.sin(dist * 1.5) * 15;
        data[idx]     = 120 + ring + (Math.random() - 0.5) * 10;
        data[idx + 1] = 90 + ring + (Math.random() - 0.5) * 10;
        data[idx + 2] = 55 + (Math.random() - 0.5) * 10;
        data[idx + 3] = 255;
      }
    }
  }

  fillLeaves(data, size) {
    for (let i = 0; i < size * size; i++) {
      const idx = i * 4;
      const r = Math.random();
      if (r < 0.3) {
        data[idx]     = 30 + Math.random() * 20;
        data[idx + 1] = 100 + Math.random() * 40;
        data[idx + 2] = 0 + Math.random() * 20;
      } else if (r < 0.7) {
        data[idx]     = 50 + Math.random() * 30;
        data[idx + 1] = 130 + Math.random() * 40;
        data[idx + 2] = 10 + Math.random() * 20;
      } else {
        data[idx]     = 40 + Math.random() * 20;
        data[idx + 1] = 110 + Math.random() * 30;
        data[idx + 2] = 5 + Math.random() * 15;
      }
      data[idx + 3] = 255;
    }
  }

  fillCobblestone(data, size) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const noise = (Math.random() - 0.5) * 40;
        const grid = ((x % 5 < 1) || (y % 4 < 1)) ? -30 : 0;
        const val = 120 + noise + grid;
        data[idx]     = val;
        data[idx + 1] = val;
        data[idx + 2] = val;
        data[idx + 3] = 255;
      }
    }
  }

  fillPlanks(data, size) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const plank = Math.floor(y / 4);
        const offset = plank % 2 === 0 ? 0 : 8;
        const lineX = ((x + offset) % 8 === 0) ? -20 : 0;
        const lineY = (y % 4 === 0) ? -25 : 0;
        data[idx]     = 180 + (Math.random() - 0.5) * 15 + lineX + lineY;
        data[idx + 1] = 140 + (Math.random() - 0.5) * 15 + lineX + lineY;
        data[idx + 2] = 80 + (Math.random() - 0.5) * 10 + lineX + lineY;
        data[idx + 3] = 255;
      }
    }
  }

  fillGlass(data, size) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const edge = (x === 0 || x === size-1 || y === 0 || y === size-1);
        if (edge) {
          data[idx]     = 180;
          data[idx + 1] = 210;
          data[idx + 2] = 230;
          data[idx + 3] = 255;
        } else {
          data[idx]     = 200;
          data[idx + 1] = 230;
          data[idx + 2] = 255;
          data[idx + 3] = 80;
        }
      }
    }
  }

  fillBrick(data, size) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const row = Math.floor(y / 4);
        const offset = row % 2 === 0 ? 0 : 4;
        const brickX = (x + offset) % 8;
        const isMortar = (y % 4 === 0) || (brickX === 0);
        if (isMortar) {
          data[idx]     = 200 + Math.random() * 20;
          data[idx + 1] = 200 + Math.random() * 20;
          data[idx + 2] = 190 + Math.random() * 20;
        } else {
          data[idx]     = 160 + Math.random() * 30;
          data[idx + 1] = 70 + Math.random() * 20;
          data[idx + 2] = 50 + Math.random() * 20;
        }
        data[idx + 3] = 255;
      }
    }
  }

  fillOre(data, size, baseColor, oreColor) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const isOre = Math.random() < 0.15 && x > 2 && x < size-3 && y > 2 && y < size-3;
        if (isOre) {
          data[idx]     = oreColor[0] + (Math.random() - 0.5) * 20;
          data[idx + 1] = oreColor[1] + (Math.random() - 0.5) * 20;
          data[idx + 2] = oreColor[2] + (Math.random() - 0.5) * 20;
        } else {
          data[idx]     = baseColor[0] + (Math.random() - 0.5) * 30;
          data[idx + 1] = baseColor[1] + (Math.random() - 0.5) * 30;
          data[idx + 2] = baseColor[2] + (Math.random() - 0.5) * 30;
        }
        data[idx + 3] = 255;
      }
    }
  }

  fillIce(data, size) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        data[idx]     = 180 + Math.random() * 30;
        data[idx + 1] = 210 + Math.random() * 30;
        data[idx + 2] = 240 + Math.random() * 15;
        data[idx + 3] = 200;
      }
    }
  }

  fillCactusSide(data, size) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const edge = (x < 2 || x >= size-2);
        if (edge) {
          data[idx]     = 40 + Math.random() * 15;
          data[idx + 1] = 100 + Math.random() * 20;
          data[idx + 2] = 30 + Math.random() * 15;
        } else {
          data[idx]     = 50 + Math.random() * 20;
          data[idx + 1] = 140 + Math.random() * 30;
          data[idx + 2] = 40 + Math.random() * 15;
        }
        data[idx + 3] = 255;
      }
    }
  }

  fillCactusTop(data, size) {
    const cx = size/2, cy = size/2;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
        if (dist < 6) {
          data[idx]     = 60 + Math.random() * 20;
          data[idx + 1] = 150 + Math.random() * 20;
          data[idx + 2] = 50 + Math.random() * 15;
        } else {
          data[idx]     = 40 + Math.random() * 15;
          data[idx + 1] = 100 + Math.random() * 20;
          data[idx + 2] = 30 + Math.random() * 10;
        }
        data[idx + 3] = 255;
      }
    }
  }

  fillSandstone(data, size) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const stripe = (y % 4 < 1) ? -10 : 0;
        data[idx]     = 210 + (Math.random() - 0.5) * 20 + stripe;
        data[idx + 1] = 190 + (Math.random() - 0.5) * 15 + stripe;
        data[idx + 2] = 120 + (Math.random() - 0.5) * 15 + stripe;
        data[idx + 3] = 255;
      }
    }
  }

  fillCraftingTop(data, size) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const grid = (x % 5 === 0 || y % 5 === 0);
        if (grid) {
          data[idx]     = 100; data[idx + 1] = 70; data[idx + 2] = 40;
        } else {
          data[idx]     = 180 + Math.random() * 15;
          data[idx + 1] = 130 + Math.random() * 15;
          data[idx + 2] = 70 + Math.random() * 10;
        }
        data[idx + 3] = 255;
      }
    }
  }

  fillCraftingSide(data, size) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        if (y < 4) {
          data[idx]     = 180 + Math.random() * 15;
          data[idx + 1] = 130 + Math.random() * 15;
          data[idx + 2] = 70 + Math.random() * 10;
        } else {
          data[idx]     = 140 + Math.random() * 15;
          data[idx + 1] = 100 + Math.random() * 15;
          data[idx + 2] = 55 + Math.random() * 10;
        }
        data[idx + 3] = 255;
      }
    }
  }

  // Get UV coordinates for a block type and face
  getUV(blockType, face) {
    let texName;
    switch(blockType) {
      case BlockType.GRASS:
        texName = face === 'top' ? 'grass_top' : face === 'bottom' ? 'dirt' : 'grass_side';
        break;
      case BlockType.WOOD:
        texName = (face === 'top' || face === 'bottom') ? 'wood_top' : 'wood_side';
        break;
      case BlockType.CACTUS:
        texName = (face === 'top' || face === 'bottom') ? 'cactus_top' : 'cactus_side';
        break;
      case BlockType.SANDSTONE:
        texName = (face === 'top' || face === 'bottom') ? 'sandstone_top' : 'sandstone_side';
        break;
      case BlockType.CRAFTING_TABLE:
        texName = (face === 'top') ? 'crafting_table_top' : 'crafting_table_side';
        break;
      default:
        const bd = BlockData[blockType];
        texName = bd && bd.texture ? bd.texture : null;
    }
    if (!texName || !this.textures[texName]) return null;
    const t = this.textures[texName];
    return {
      u: t.x / this.atlas.width,
      v: t.y / this.atlas.height,
      w: this.tileSize / this.atlas.width,
      h: this.tileSize / this.atlas.height
    };
  }
}
