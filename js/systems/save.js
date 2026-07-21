// Save/Load system using localStorage
class SaveManager {
  constructor() {
    this.saveKey = 'voxelgame_';
  }

  saveGame(game) {
    try {
      const worldData = {
        name: game.worldManager.currentWorld.name,
        type: game.worldManager.currentWorld.type,
        seed: game.worldManager.currentWorld.seed,
        playerPos: [game.player.position.x, game.player.position.y, game.player.position.z],
        playerRot: [game.player.rotation.x, game.player.rotation.y],
        inventory: game.inventory.serialize(),
        selectedSlot: game.inventory.selectedSlot,
        timeOfDay: game.timeOfDay,
        modifiedBlocks: game.chunkManager.modifications || [],
      };

      const key = this.saveKey + game.worldManager.currentWorld.name;
      localStorage.setItem(key, JSON.stringify(worldData));

      // Save world list
      this.saveWorldList(game.worldManager);

      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }

  loadGame(worldName) {
    try {
      const key = this.saveKey + worldName;
      const data = localStorage.getItem(key);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  }

  saveWorldList(worldManager) {
    const list = worldManager.worlds.map(w => ({
      name: w.name,
      type: w.type,
      seed: w.seed,
    }));
    localStorage.setItem(this.saveKey + 'worlds', JSON.stringify(list));
  }

  loadWorldList() {
    try {
      const data = localStorage.getItem(this.saveKey + 'worlds');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  deleteSave(worldName) {
    localStorage.removeItem(this.saveKey + worldName);
    const list = this.loadWorldList().filter(w => w.name !== worldName);
    localStorage.setItem(this.saveKey + 'worlds', JSON.stringify(list));
  }
}
