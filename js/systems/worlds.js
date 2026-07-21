// Multiple world system
const WorldTypes = [
  { id: 'normal', name: 'Normal', description: 'Standard terrain with trees, water, and caves', icon: '🌲' },
  { id: 'flat', name: 'Flat', description: 'Superflat world for building', icon: '🟩' },
  { id: 'mountains', name: 'Mountains', description: 'Tall peaks with snow caps', icon: '⛰️' },
  { id: 'desert', name: 'Desert', description: 'Sandy dunes with cacti', icon: '🏜️' },
  { id: 'snow', name: 'Snowy', description: 'Frozen winter landscape', icon: '❄️' },
];

class WorldManager {
  constructor() {
    this.worlds = [];
    this.currentWorld = null;
    this.saveManager = new SaveManager();
    this.loadWorldListFromStorage();
  }

  loadWorldListFromStorage() {
    const list = this.saveManager.loadWorldList();
    this.worlds = list;
    // Always have at least the default world
    if (this.worlds.length === 0) {
      this.worlds.push({ name: 'Default World', type: 'normal', seed: 42 });
      this.saveManager.saveWorldList(this);
    }
  }

  createWorld(name, type, seed) {
    const world = { name, type, seed };
    this.worlds.push(world);
    this.saveManager.saveWorldList(this);
    return world;
  }

  switchToWorld(world, scene, chunkManager) {
    // Clear old chunks
    for (const [key, chunk] of chunkManager.chunks) {
      if (chunk.mesh) { scene.remove(chunk.mesh); chunk.mesh.geometry.dispose(); }
      if (chunk.waterMesh) { scene.remove(chunk.waterMesh); chunk.waterMesh.geometry.dispose(); }
    }
    chunkManager.chunks.clear();
    chunkManager.modifications = [];

    // Create new generator
    this.currentWorld = world;
    chunkManager.generator = new WorldGenerator(world.seed, world.type);

    return world;
  }

  deleteWorld(name) {
    this.worlds = this.worlds.filter(w => w.name !== name);
    this.saveManager.deleteSave(name);
    if (this.currentWorld && this.currentWorld.name === name) {
      this.currentWorld = this.worlds[0] || null;
    }
  }
}
