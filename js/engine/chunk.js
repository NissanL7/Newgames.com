// Chunk management and world generation
const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 64;
const WATER_LEVEL = 20;
const RENDER_DISTANCE = 4;

class Chunk {
  constructor(cx, cz) {
    this.cx = cx;
    this.cz = cz;
    this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
    this.mesh = null;
    this.waterMesh = null;
    this.dirty = true;
    this.generated = false;
  }

  getIndex(x, y, z) {
    return y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x;
  }

  getBlock(x, y, z) {
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) return 0;
    return this.blocks[this.getIndex(x, y, z)];
  }

  setBlock(x, y, z, type) {
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) return;
    this.blocks[this.getIndex(x, y, z)] = type;
    this.dirty = true;
  }
}

class WorldGenerator {
  constructor(seed, worldType = 'normal') {
    this.seed = seed;
    this.worldType = worldType;
    this.noise = new PerlinNoise(seed);
    this.noise2 = new PerlinNoise(seed + 1);
    this.noise3 = new PerlinNoise(seed + 2);
  }

  generateChunk(chunk) {
    const cx = chunk.cx;
    const cz = chunk.cz;

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        const wx = cx * CHUNK_SIZE + x;
        const wz = cz * CHUNK_SIZE + z;

        let height;
        switch(this.worldType) {
          case 'flat':
            height = 20;
            break;
          case 'mountains':
            height = this.getMountainHeight(wx, wz);
            break;
          case 'desert':
            height = this.getDesertHeight(wx, wz);
            break;
          case 'snow':
            height = this.getSnowHeight(wx, wz);
            break;
          default:
            height = this.getNormalHeight(wx, wz);
        }

        for (let y = 0; y < CHUNK_HEIGHT; y++) {
          let blockType = BlockType.AIR;

          if (y === 0) {
            blockType = BlockType.BEDROCK;
          } else if (y < height - 4) {
            blockType = this.getUndergroundBlock(wx, y, wz);
          } else if (y < height) {
            blockType = this.getSurfaceFiller(this.worldType, height);
          } else if (y === height) {
            blockType = this.getSurfaceBlock(this.worldType, height, wx, wz);
          } else if (y <= WATER_LEVEL && y > height) {
            blockType = BlockType.WATER;
          }

          chunk.setBlock(x, y, z, blockType);
        }

        // Trees
        if (this.worldType === 'normal' && height > WATER_LEVEL + 1) {
          const treeNoise = this.noise3.noise2D(wx * 0.1, wz * 0.1);
          if (treeNoise > 0.6 && x > 2 && x < CHUNK_SIZE - 3 && z > 2 && z < CHUNK_SIZE - 3) {
            const treeHeight = 4 + Math.floor(Math.random() * 3);
            this.placeTree(chunk, x, height + 1, z, treeHeight);
          }
        }

        // Cacti in desert
        if (this.worldType === 'desert' && height > WATER_LEVEL) {
          const cactusNoise = this.noise2.noise2D(wx * 0.5, wz * 0.5);
          if (cactusNoise > 0.7 && x > 1 && x < CHUNK_SIZE - 2 && z > 1 && z < CHUNK_SIZE - 2) {
            const cactusHeight = 2 + Math.floor(Math.random() * 2);
            for (let cy = 0; cy < cactusHeight; cy++) {
              chunk.setBlock(x, height + 1 + cy, z, BlockType.CACTUS);
            }
          }
        }
      }
    }
    chunk.generated = true;
    chunk.dirty = true;
  }

  getNormalHeight(wx, wz) {
    const base = this.noise.octave2D(wx, wz, 4, 0.5, 0.01);
    const detail = this.noise2.octave2D(wx, wz, 2, 0.5, 0.05);
    return Math.floor(22 + (base + 1) * 12 + detail * 4);
  }

  getMountainHeight(wx, wz) {
    const base = this.noise.octave2D(wx, wz, 6, 0.55, 0.008);
    const peaks = this.noise2.octave2D(wx, wz, 3, 0.6, 0.02);
    return Math.floor(25 + (base + 1) * 20 + Math.max(0, peaks) * 15);
  }

  getDesertHeight(wx, wz) {
    const dunes = this.noise.octave2D(wx, wz, 3, 0.4, 0.015);
    return Math.floor(20 + (dunes + 1) * 5);
  }

  getSnowHeight(wx, wz) {
    const base = this.noise.octave2D(wx, wz, 4, 0.5, 0.012);
    return Math.floor(24 + (base + 1) * 10);
  }

  getSurfaceBlock(worldType, height, wx, wz) {
    switch(worldType) {
      case 'desert': return BlockType.SAND;
      case 'snow': return BlockType.SNOW;
      case 'mountains': return height > 45 ? BlockType.SNOW : BlockType.GRASS;
      default: return BlockType.GRASS;
    }
  }

  getSurfaceFiller(worldType, height) {
    switch(worldType) {
      case 'desert': return height > 18 ? BlockType.SAND : BlockType.SANDSTONE;
      case 'snow': return BlockType.DIRT;
      default: return BlockType.DIRT;
    }
  }

  getUndergroundBlock(wx, y, wz) {
    // Ore generation
    const caveNoise = this.noise.octave3D(wx * 0.05, y * 0.05, wz * 0.05, 3, 0.5, 1);
    if (caveNoise > 0.55 && y > 2 && y < CHUNK_HEIGHT - 5) {
      return BlockType.AIR; // Caves
    }

    const oreNoise = this.noise2.noise3D(wx * 0.1, y * 0.1, wz * 0.1);
    if (y < 10 && oreNoise > 0.7) return BlockType.DIAMOND_ORE;
    if (y < 20 && oreNoise > 0.6) return BlockType.GOLD_ORE;
    if (y < 30 && oreNoise > 0.55) return BlockType.IRON_ORE;
    if (y < 40 && oreNoise > 0.5) return BlockType.COAL_ORE;
    if (y < 15 && oreNoise < -0.6) return BlockType.GRAVEL;

    return BlockType.STONE;
  }

  placeTree(chunk, x, y, z, height) {
    // Trunk
    for (let i = 0; i < height; i++) {
      if (y + i < CHUNK_HEIGHT) {
        chunk.setBlock(x, y + i, z, BlockType.WOOD);
      }
    }
    // Leaves
    const leafStart = height - 2;
    for (let ly = leafStart; ly <= height + 1; ly++) {
      const radius = ly <= height ? 2 : 1;
      for (let lx = -radius; lx <= radius; lx++) {
        for (let lz = -radius; lz <= radius; lz++) {
          if (lx === 0 && lz === 0 && ly <= height) continue;
          if (Math.abs(lx) === radius && Math.abs(lz) === radius && Math.random() < 0.3) continue;
          const bx = x + lx, bz = z + lz, by = y + ly;
          if (bx >= 0 && bx < CHUNK_SIZE && bz >= 0 && bz < CHUNK_SIZE && by < CHUNK_HEIGHT) {
            if (chunk.getBlock(bx, by, bz) === BlockType.AIR) {
              chunk.setBlock(bx, by, bz, BlockType.LEAVES);
            }
          }
        }
      }
    }
  }
}

class ChunkManager {
  constructor(worldGenerator) {
    this.chunks = new Map();
    this.generator = worldGenerator;
    this.meshes = new Map();
    this.textureGen = new TextureGenerator();
    this.atlasTexture = null;
    this.material = null;
    this.waterMaterial = null;
    this.modifications = []; // block modification log: {x,y,z,type}
  }

  init(scene) {
    this.textureGen.generateAll();

    const texture = new THREE.CanvasTexture(this.textureGen.atlas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    this.atlasTexture = texture;

    this.material = new THREE.MeshLambertMaterial({
      map: texture,
      side: THREE.FrontSide,
      alphaTest: 0.5,
    });

    this.waterMaterial = new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
  }

  getChunkKey(cx, cz) { return `${cx},${cz}`; }

  getChunk(cx, cz) {
    return this.chunks.get(this.getChunkKey(cx, cz));
  }

  getBlock(wx, wy, wz) {
    const cx = Math.floor(wx / CHUNK_SIZE);
    const cz = Math.floor(wz / CHUNK_SIZE);
    const chunk = this.getChunk(cx, cz);
    if (!chunk) return BlockType.AIR;
    const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    return chunk.getBlock(lx, wy, lz);
  }

  setBlock(wx, wy, wz, type) {
    const cx = Math.floor(wx / CHUNK_SIZE);
    const cz = Math.floor(wz / CHUNK_SIZE);
    const chunk = this.getChunk(cx, cz);
    if (!chunk) return;
    const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    chunk.setBlock(lx, wy, lz, type);

    // Mark neighboring chunks dirty if on edge
    if (lx === 0) { const n = this.getChunk(cx-1, cz); if (n) n.dirty = true; }
    if (lx === CHUNK_SIZE-1) { const n = this.getChunk(cx+1, cz); if (n) n.dirty = true; }
    if (lz === 0) { const n = this.getChunk(cx, cz-1); if (n) n.dirty = true; }
    if (lz === CHUNK_SIZE-1) { const n = this.getChunk(cx, cz+1); if (n) n.dirty = true; }
  }

  updateChunks(playerX, playerZ, scene) {
    const pcx = Math.floor(playerX / CHUNK_SIZE);
    const pcz = Math.floor(playerZ / CHUNK_SIZE);

    // Generate and add new chunks
    for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
      for (let dz = -RENDER_DISTANCE; dz <= RENDER_DISTANCE; dz++) {
        const cx = pcx + dx;
        const cz = pcz + dz;
        const key = this.getChunkKey(cx, cz);
        if (!this.chunks.has(key)) {
          const chunk = new Chunk(cx, cz);
          this.generator.generateChunk(chunk);

          // Apply any saved modifications to this chunk
          if (this.modifications && this.modifications.length > 0) {
            for (const mod of this.modifications) {
              const mcx = Math.floor(mod.x / CHUNK_SIZE);
              const mcz = Math.floor(mod.z / CHUNK_SIZE);
              if (mcx === cx && mcz === cz) {
                const lx = ((mod.x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
                const lz = ((mod.z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
                chunk.setBlock(lx, mod.y, lz, mod.type);
              }
            }
          }

          this.chunks.set(key, chunk);
        }
      }
    }

    // Remove far chunks
    const removeKeys = [];
    for (const [key, chunk] of this.chunks) {
      const dx = chunk.cx - pcx;
      const dz = chunk.cz - pcz;
      if (Math.abs(dx) > RENDER_DISTANCE + 2 || Math.abs(dz) > RENDER_DISTANCE + 2) {
        removeKeys.push(key);
      }
    }
    for (const key of removeKeys) {
      const chunk = this.chunks.get(key);
      if (chunk.mesh) { scene.remove(chunk.mesh); chunk.mesh.geometry.dispose(); }
      if (chunk.waterMesh) { scene.remove(chunk.waterMesh); chunk.waterMesh.geometry.dispose(); }
      this.chunks.delete(key);
    }

    // Build meshes for dirty chunks (limit per frame)
    let built = 0;
    for (const [key, chunk] of this.chunks) {
      if (chunk.dirty && built < 2) {
        this.buildChunkMesh(chunk, scene);
        chunk.dirty = false;
        built++;
      }
    }
  }

  getNeighborBlock(chunk, x, y, z) {
    if (y < 0 || y >= CHUNK_HEIGHT) return BlockType.AIR;
    if (x >= 0 && x < CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE) {
      return chunk.getBlock(x, y, z);
    }
    // Check neighboring chunk
    const wx = chunk.cx * CHUNK_SIZE + x;
    const wz = chunk.cz * CHUNK_SIZE + z;
    return this.getBlock(wx, y, wz);
  }

  buildChunkMesh(chunk, scene) {
    if (chunk.mesh) { scene.remove(chunk.mesh); chunk.mesh.geometry.dispose(); }
    if (chunk.waterMesh) { scene.remove(chunk.waterMesh); chunk.waterMesh.geometry.dispose(); }

    const positions = [], normals = [], uvs = [], indices = [];
    const waterPositions = [], waterNormals = [], waterUvs = [], waterIndices = [];
    let vertCount = 0, waterVertCount = 0;

    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        for (let x = 0; x < CHUNK_SIZE; x++) {
          const block = chunk.getBlock(x, y, z);
          if (block === BlockType.AIR) continue;

          const isWater = block === BlockType.WATER;
          const bd = BlockData[block];
          if (!bd) continue;

          const wx = chunk.cx * CHUNK_SIZE + x;
          const wz = chunk.cz * CHUNK_SIZE + z;

          // Check 6 faces
          const faces = [
            { dir: [0, 1, 0], face: 'top', verts: [[0,1,1],[1,1,1],[1,1,0],[0,1,0]] },
            { dir: [0,-1, 0], face: 'bottom', verts: [[0,0,0],[1,0,0],[1,0,1],[0,0,1]] },
            { dir: [-1,0, 0], face: 'left', verts: [[0,0,1],[0,1,1],[0,1,0],[0,0,0]] },
            { dir: [1, 0, 0], face: 'right', verts: [[1,0,0],[1,1,0],[1,1,1],[1,0,1]] },
            { dir: [0, 0, 1], face: 'front', verts: [[1,0,1],[1,1,1],[0,1,1],[0,0,1]] },
            { dir: [0, 0,-1], face: 'back', verts: [[0,0,0],[0,1,0],[1,1,0],[1,0,0]] },
          ];

          for (const f of faces) {
            const nx = x + f.dir[0], ny = y + f.dir[1], nz = z + f.dir[2];
            const neighbor = this.getNeighborBlock(chunk, nx, ny, nz);
            const neighborBd = BlockData[neighbor];

            let showFace = false;
            if (isWater) {
              showFace = neighbor !== BlockType.WATER && (neighbor === BlockType.AIR || (neighborBd && neighborBd.transparent));
            } else {
              showFace = neighbor === BlockType.AIR || (neighborBd && neighborBd.transparent && neighbor !== block);
            }

            if (!showFace) continue;

            const uv = this.textureGen.getUV(block, f.face);
            if (!uv) continue;

            const targetPos = isWater ? waterPositions : positions;
            const targetNorm = isWater ? waterNormals : normals;
            const targetUv = isWater ? waterUvs : uvs;
            const targetIdx = isWater ? waterIndices : indices;
            const vc = isWater ? waterVertCount : vertCount;

            for (const v of f.verts) {
              targetPos.push(wx + v[0], y + v[1], wz + v[2]);
              targetNorm.push(f.dir[0], f.dir[1], f.dir[2]);
            }
            targetUv.push(uv.u, uv.v + uv.h);
            targetUv.push(uv.u + uv.w, uv.v + uv.h);
            targetUv.push(uv.u + uv.w, uv.v);
            targetUv.push(uv.u, uv.v);

            targetIdx.push(vc, vc+1, vc+2, vc, vc+2, vc+3);

            if (isWater) waterVertCount += 4; else vertCount += 4;
          }
        }
      }
    }

    // Solid mesh
    if (positions.length > 0) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geo.setIndex(indices);
      chunk.mesh = new THREE.Mesh(geo, this.material);
      scene.add(chunk.mesh);
    }

    // Water mesh
    if (waterPositions.length > 0) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(waterPositions, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(waterNormals, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(waterUvs, 2));
      geo.setIndex(waterIndices);
      chunk.waterMesh = new THREE.Mesh(geo, this.waterMaterial);
      scene.add(chunk.waterMesh);
    }
  }
}
