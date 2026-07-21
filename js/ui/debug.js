// Debug menu (F3 style)
class DebugMenu {
  constructor() {
    this.panel = document.getElementById('debug-panel');
    this.visible = false;
    this.fps = 0;
    this.frameCount = 0;
    this.lastFpsTime = performance.now();
  }

  toggle() {
    this.visible = !this.visible;
    this.panel.style.display = this.visible ? 'block' : 'none';
  }

  update(player, chunkManager, worldManager, game) {
    if (!this.visible) return;

    // FPS calculation
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsTime = now;
    }

    const pos = player.position;
    const chunkX = Math.floor(pos.x / CHUNK_SIZE);
    const chunkZ = Math.floor(pos.z / CHUNK_SIZE);
    const localX = ((Math.floor(pos.x) % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const localZ = ((Math.floor(pos.z) % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

    const block = chunkManager.getBlock(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z));
    const facing = ['South', 'West', 'North', 'East'][Math.floor(((player.rotation.y * 180 / Math.PI) % 360 + 45) / 90) % 4];

    let html = `
      <div class="debug-section">
        <h3>📊 Performance</h3>
        <p>FPS: <span class="val ${this.fps < 30 ? 'bad' : this.fps < 60 ? 'warn' : 'good'}">${this.fps}</span></p>
        <p>Chunks loaded: <span class="val">${chunkManager.chunks.size}</span></p>
        <p>Draw calls: <span class="val">${chunkManager.chunks.size * 2}</span></p>
      </div>
      <div class="debug-section">
        <h3>📍 Position</h3>
        <p>X: <span class="val">${pos.x.toFixed(2)}</span></p>
        <p>Y: <span class="val">${pos.y.toFixed(2)}</span></p>
        <p>Z: <span class="val">${pos.z.toFixed(2)}</span></p>
        <p>Chunk: <span class="val">${chunkX}, ${chunkZ}</span></p>
        <p>Local: <span class="val">${localX}, ${Math.floor(pos.y)}, ${localZ}</span></p>
      </div>
      <div class="debug-section">
        <h3>🧭 Direction</h3>
        <p>Facing: <span class="val">${facing}</span></p>
        <p>Yaw: <span class="val">${(player.rotation.y * 180 / Math.PI).toFixed(1)}°</span></p>
        <p>Pitch: <span class="val">${(player.rotation.x * 180 / Math.PI).toFixed(1)}°</span></p>
        <p>On ground: <span class="val">${player.onGround}</span></p>
        <p>In water: <span class="val">${player.inWater}</span></p>
        <p>Flying: <span class="val">${player.flying}</span></p>
      </div>
      <div class="debug-section">
        <h3>🌍 World</h3>
        <p>World: <span class="val">${worldManager.currentWorld.name}</span></p>
        <p>Type: <span class="val">${worldManager.currentWorld.type}</span></p>
        <p>Seed: <span class="val">${worldManager.currentWorld.seed}</span></p>
        <p>Time: <span class="val">${game ? game.timeOfDay.toFixed(1) : 'N/A'}</span></p>
      </div>
      <div class="debug-section">
        <h3>🎮 Controls</h3>
        <p>WASD - Move</p>
        <p>Mouse - Look</p>
        <p>Space - Jump</p>
        <p>F - Toggle fly</p>
        <p>E - Inventory</p>
        <p>C - Crafting</p>
        <p>Q - Drop item</p>
        <p>1-9 - Hotbar</p>
        <p>F3 - Debug menu</p>
        <p>Left click - Break</p>
        <p>Right click - Place</p>
        <p>Esc - Save & Quit</p>
      </div>
    `;

    this.panel.innerHTML = html;
  }
}
