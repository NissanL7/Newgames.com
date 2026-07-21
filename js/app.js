// App entry point - handles menus and game initialization
let game = null;

class App {
  constructor() {
    this.worldManager = null;
  }

  init() {
    this.worldManager = new WorldManager();
    this.setupMainMenu();
    this.setupWorldMenu();
  }

  setupMainMenu() {
    const menu = document.getElementById('main-menu');
    const playBtn = document.getElementById('btn-play');
    const worldsBtn = document.getElementById('btn-worlds');
    const controlsBtn = document.getElementById('btn-controls');

    playBtn.addEventListener('click', () => this.startGame(this.worldManager.currentWorld));
    worldsBtn.addEventListener('click', () => this.showWorldMenu());

    controlsBtn.addEventListener('click', () => {
      document.getElementById('controls-panel').style.display = 'flex';
    });

    document.getElementById('controls-back').addEventListener('click', () => {
      document.getElementById('controls-panel').style.display = 'none';
    });
  }

  setupWorldMenu() {
    document.getElementById('worlds-back').addEventListener('click', () => {
      document.getElementById('world-menu').style.display = 'none';
      document.getElementById('main-menu').style.display = 'flex';
    });

    document.getElementById('btn-new-world').addEventListener('click', () => {
      document.getElementById('new-world-panel').style.display = 'flex';
    });

    document.getElementById('create-world-btn').addEventListener('click', () => this.createNewWorld());
    document.getElementById('cancel-world-btn').addEventListener('click', () => {
      document.getElementById('new-world-panel').style.display = 'none';
    });
  }

  showWorldMenu() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('world-menu').style.display = 'flex';
    this.renderWorldList();
  }

  renderWorldList() {
    const list = document.getElementById('world-list');
    let html = '';
    for (const world of this.worldManager.worlds) {
      const typeInfo = WorldTypes.find(t => t.id === world.type) || WorldTypes[0];
      html += `<div class="world-card">
        <div class="world-icon">${typeInfo.icon}</div>
        <div class="world-info">
          <h3>${world.name}</h3>
          <p>Type: ${typeInfo.name} | Seed: ${world.seed}</p>
        </div>
        <div class="world-actions">
          <button class="btn-play-world" data-name="${world.name}">▶ Play</button>
          <button class="btn-delete-world" data-name="${world.name}">🗑️</button>
        </div>
      </div>`;
    }
    if (html === '') html = '<p class="empty-msg">No worlds yet. Create one!</p>';
    list.innerHTML = html;

    // Play buttons
    list.querySelectorAll('.btn-play-world').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        const world = this.worldManager.worlds.find(w => w.name === name);
        if (world) {
          this.worldManager.currentWorld = world;
          this.startGame(world);
        }
      });
    });

    // Delete buttons
    list.querySelectorAll('.btn-delete-world').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        if (confirm(`Delete world "${name}"? This cannot be undone.`)) {
          this.worldManager.deleteWorld(name);
          this.renderWorldList();
        }
      });
    });
  }

  createNewWorld() {
    const name = document.getElementById('world-name-input').value.trim() || 'New World';
    const type = document.getElementById('world-type-select').value;
    const seed = parseInt(document.getElementById('world-seed-input').value) || Math.floor(Math.random() * 100000);

    const world = this.worldManager.createWorld(name, type, seed);
    this.worldManager.currentWorld = world;
    document.getElementById('new-world-panel').style.display = 'none';
    this.startGame(world);
  }

  startGame(world) {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('world-menu').style.display = 'none';
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';

    const selectedWorld = world || this.worldManager.currentWorld;

    setTimeout(() => {
      game = new Game(selectedWorld);
      game.init();
    }, 100);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
