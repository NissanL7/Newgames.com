// Main game class
class Game {
  constructor(selectedWorld) {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.player = null;
    this.chunkManager = null;
    this.inventory = null;
    this.hud = null;
    this.joystick = null;
    this.craftingUI = null;
    this.debugMenu = null;
    this.saveManager = null;
    this.worldManager = null;
    this.clock = null;
    this.timeOfDay = 0;
    this.isPaused = false;
    this.showQuitMenu = false;
    this.lastBreak = 0;
    this.highlightMesh = null;
    this.sandTimer = 0;
    this.selectedWorld = selectedWorld; // world chosen from menu
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 120);

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('game-canvas').appendChild(this.renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0x606060);
    this.scene.add(ambient);
    this.sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.sunLight.position.set(50, 100, 50);
    this.scene.add(this.sunLight);
    this.hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x556633, 0.3);
    this.scene.add(this.hemiLight);

    // Block highlight
    const hlGeo = new THREE.BoxGeometry(1.01, 1.01, 1.01);
    const hlMat = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, transparent: true, opacity: 0.4 });
    this.highlightMesh = new THREE.Mesh(hlGeo, hlMat);
    this.highlightMesh.visible = false;
    this.scene.add(this.highlightMesh);

    // Clock
    this.clock = new THREE.Clock();

    // Systems
    this.player = new Player();
    this.player.init(this.camera);

    this.inventory = new Inventory();
    this.inventory.addItem(BlockType.DIRT, 64);
    this.inventory.addItem(BlockType.STONE, 64);
    this.inventory.addItem(BlockType.WOOD, 32);
    this.inventory.addItem(BlockType.SAND, 32);
    this.inventory.addItem(BlockType.PLANKS, 32);
    this.inventory.addItem(BlockType.COBBLESTONE, 32);
    this.inventory.addItem(BlockType.GLASS, 16);
    this.inventory.addItem(BlockType.BRICK, 16);
    this.inventory.addItem(ItemType.STICK, 32);

    this.worldManager = new WorldManager();
    this.saveManager = new SaveManager();

    // Use selected world from menu, or current world
    if (this.selectedWorld) {
      const existing = this.worldManager.worlds.find(w => w.name === this.selectedWorld.name);
      if (existing) {
        this.worldManager.currentWorld = existing;
      } else {
        this.worldManager.worlds.push(this.selectedWorld);
        this.worldManager.currentWorld = this.selectedWorld;
        this.saveManager.saveWorldList(this.worldManager);
      }
    }

    // Start with current world
    const world = this.worldManager.currentWorld;
    const gen = new WorldGenerator(world.seed, world.type);
    this.chunkManager = new ChunkManager(gen);
    this.chunkManager.init(this.scene);
    this.chunkManager.modifications = [];

    // Find spawn position
    const spawnChunk = new Chunk(0, 0);
    gen.generateChunk(spawnChunk);
    let spawnY = CHUNK_HEIGHT;
    for (let y = CHUNK_HEIGHT - 1; y >= 0; y--) {
      if (spawnChunk.getBlock(8, y, 8) !== BlockType.AIR && spawnChunk.getBlock(8, y, 8) !== BlockType.WATER) {
        spawnY = y + 3;
        break;
      }
    }
    this.player.position.set(8, spawnY, 8);

    // Try to load saved data
    const saved = this.saveManager.loadGame(world.name);
    if (saved) {
      this.player.position.set(saved.playerPos[0], saved.playerPos[1], saved.playerPos[2]);
      this.player.rotation.x = saved.playerRot[0];
      this.player.rotation.y = saved.playerRot[1];
      this.inventory.deserialize(saved.inventory);
      this.inventory.selectedSlot = saved.selectedSlot || 0;
      this.timeOfDay = saved.timeOfDay || 0;
      if (saved.modifiedBlocks) {
        this.chunkManager.modifications = saved.modifiedBlocks;
      }
    }

    // UI
    this.hud = new HUD();
    this.craftingUI = new CraftingUI();
    this.debugMenu = new DebugMenu();
    this.joystick = new Joystick();

    if (this.player.isMobile) {
      document.getElementById('mobile-controls').style.display = 'block';
      this.joystick.init(this.player);
      this.joystick.onJump = () => { if (this.player.onGround) this.player.velocity.y = this.player.jumpForce; };
      this.joystick.onBreak = () => this.breakBlock();
      this.joystick.onPlace = () => this.placeBlock();
      this.joystick.onInventory = () => this.toggleInventory();
    }

    // Mouse controls for desktop
    this.setupMouseControls();
    this.setupKeyboardControls();

    // Resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Hide loading
    document.getElementById('loading').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';

    // Start
    this.animate();
  }

  setupMouseControls() {
    document.addEventListener('mousedown', (e) => {
      if (this.isPaused || this.inventory.isOpen || this.craftingUI.isOpen || this.showQuitMenu || this.debugMenu.visible) return;
      if (e.button === 0) this.breakBlock();
      if (e.button === 2) this.placeBlock();
    });

    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Scroll to change hotbar
    document.addEventListener('wheel', (e) => {
      if (this.inventory.isOpen) return;
      if (e.deltaY > 0) {
        this.inventory.selectedSlot = (this.inventory.selectedSlot + 1) % 9;
      } else {
        this.inventory.selectedSlot = (this.inventory.selectedSlot + 8) % 9;
      }
    });
  }

  setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
      // Number keys for hotbar
      if (e.code >= 'Digit1' && e.code <= 'Digit9') {
        this.inventory.selectedSlot = parseInt(e.code.replace('Digit', '')) - 1;
        return;
      }

      if (e.code === 'KeyE') { this.toggleInventory(); return; }
      if (e.code === 'KeyC') { this.toggleCrafting(); return; }
      if (e.code === 'F3') { e.preventDefault(); this.debugMenu.toggle(); return; }
      if (e.code === 'Escape') { this.toggleQuitMenu(); return; }
      if (e.code === 'KeyQ') { this.dropItem(); return; }
    });
  }

  breakBlock() {
    const target = this.player.getTargetBlock(this.chunkManager);
    if (!target) return;
    if (target.block === BlockType.BEDROCK) return;

    // Add to inventory
    let dropId = target.block;
    if (target.block === BlockType.STONE) dropId = BlockType.COBBLESTONE;
    if (target.block === BlockType.COAL_ORE) dropId = ItemType.COAL;
    if (target.block === BlockType.DIAMOND_ORE) dropId = ItemType.DIAMOND;
    this.inventory.addItem(dropId, 1);

    this.chunkManager.setBlock(target.x, target.y, target.z, BlockType.AIR);

    // Record modification
    if (this.chunkManager.modifications) {
      this.chunkManager.modifications.push({ x: target.x, y: target.y, z: target.z, type: BlockType.AIR });
    }
  }

  placeBlock() {
    const target = this.player.getTargetBlock(this.chunkManager);
    if (!target) return;

    const item = this.inventory.getSelectedItem();
    if (!item || !isBlock(item.id)) return;

    const px = target.prevX, py = target.prevY, pz = target.prevZ;

    // Don't place inside player
    const playerBlockX = Math.floor(this.player.position.x);
    const playerBlockY = Math.floor(this.player.position.y);
    const playerBlockZ = Math.floor(this.player.position.z);
    if ((px === playerBlockX && (py === playerBlockY || py === playerBlockY - 1) && pz === playerBlockZ)) return;

    this.chunkManager.setBlock(px, py, pz, item.id);
    this.inventory.removeSelected(1);

    // Record modification
    if (this.chunkManager.modifications) {
      this.chunkManager.modifications.push({ x: px, y: py, z: pz, type: item.id });
    }
  }

  dropItem() {
    const item = this.inventory.getSelectedItem();
    if (!item) return;
    this.inventory.removeSelected(1);
  }

  toggleInventory() {
    this.inventory.toggle();
    const el = document.getElementById('inventory-panel');
    if (this.inventory.isOpen) {
      el.style.display = 'flex';
      this.renderInventoryPanel();
    } else {
      el.style.display = 'none';
    }
  }

  renderInventoryPanel() {
    const el = document.getElementById('inventory-panel');
    let html = '<div class="inv-header"><h2>Inventory</h2><button id="inv-close" class="btn-close">&times;</button></div>';
    html += '<div class="inv-grid">';
    for (let i = 0; i < this.inventory.size; i++) {
      const slot = this.inventory.slots[i];
      let content = '';
      if (slot) {
        const name = getItemName(slot.id);
        const color = this.hud.getItemColor(slot.id);
        content = `<div class="inv-item" style="background:${color}"><span class="item-count">${slot.count > 1 ? slot.count : ''}</span></div>`;
        content += `<div class="inv-item-name">${name}</div>`;
      }
      const isHotbar = i < 9 ? ' hotbar-slot' : '';
      html += `<div class="inv-slot${isHotbar}" data-slot="${i}">${content}</div>`;
    }
    html += '</div>';
    el.innerHTML = html;

    document.getElementById('inv-close').addEventListener('click', () => this.toggleInventory());
  }

  toggleCrafting() {
    if (this.craftingUI.isOpen) {
      this.craftingUI.close();
    } else {
      this.craftingUI.open(this.inventory);
    }
  }

  toggleQuitMenu() {
    this.showQuitMenu = !this.showQuitMenu;
    const el = document.getElementById('quit-menu');
    if (this.showQuitMenu) {
      el.style.display = 'flex';
      if (document.pointerLockElement) document.exitPointerLock();
    } else {
      el.style.display = 'none';
    }
  }

  saveAndQuit() {
    const success = this.saveManager.saveGame(this);
    if (success) {
      this.hud.showMessage('Game saved!');
    }
    // Show main menu
    this.showQuitMenu = false;
    document.getElementById('quit-menu').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';
  }

  // Sand gravity tick
  updateSandGravity() {
    // Check a limited area around player
    const px = Math.floor(this.player.position.x);
    const py = Math.floor(this.player.position.y);
    const pz = Math.floor(this.player.position.z);
    const range = 16;

    for (let x = px - range; x <= px + range; x++) {
      for (let z = pz - range; z <= pz + range; z++) {
        for (let y = py - range; y <= py + range; y++) {
          if (y < 1) continue;
          const block = this.chunkManager.getBlock(x, y, z);
          const bd = BlockData[block];
          if (bd && bd.gravity) {
            const below = this.chunkManager.getBlock(x, y - 1, z);
            if (below === BlockType.AIR || below === BlockType.WATER) {
              this.chunkManager.setBlock(x, y - 1, z, block);
              this.chunkManager.setBlock(x, y, z, BlockType.AIR);
            }
          }
        }
      }
    }
  }

  updateDayNight(dt) {
    this.timeOfDay += dt * 0.01; // Full cycle ~10 min
    if (this.timeOfDay > 24) this.timeOfDay = 0;

    let skyColor, sunIntensity, ambientIntensity;
    if (this.timeOfDay < 6) { // Night
      skyColor = new THREE.Color(0x0a0a2a);
      sunIntensity = 0.1; ambientIntensity = 0.2;
    } else if (this.timeOfDay < 8) { // Dawn
      const t = (this.timeOfDay - 6) / 2;
      skyColor = new THREE.Color(0x0a0a2a).lerp(new THREE.Color(0xFF8844), t);
      sunIntensity = 0.1 + t * 0.7; ambientIntensity = 0.2 + t * 0.3;
    } else if (this.timeOfDay < 18) { // Day
      skyColor = new THREE.Color(0x87CEEB);
      sunIntensity = 0.8; ambientIntensity = 0.5;
    } else if (this.timeOfDay < 20) { // Dusk
      const t = (this.timeOfDay - 18) / 2;
      skyColor = new THREE.Color(0x87CEEB).lerp(new THREE.Color(0x0a0a2a), t);
      sunIntensity = 0.8 - t * 0.7; ambientIntensity = 0.5 - t * 0.3;
    } else { // Night
      skyColor = new THREE.Color(0x0a0a2a);
      sunIntensity = 0.1; ambientIntensity = 0.2;
    }

    this.scene.background = skyColor;
    this.scene.fog.color = skyColor;
    this.sunLight.intensity = sunIntensity;
    this.hemiLight.intensity = ambientIntensity;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const dt = Math.min(this.clock.getDelta(), 0.1);

    if (!this.showQuitMenu) {
      // Update player
      this.player.update(dt, this.chunkManager);

      // Update chunks
      this.chunkManager.updateChunks(this.player.position.x, this.player.position.z, this.scene);

      // Sand gravity (throttled)
      this.sandTimer += dt;
      if (this.sandTimer > 0.3) {
        this.updateSandGravity();
        this.sandTimer = 0;
      }

      // Block highlight
      const target = this.player.getTargetBlock(this.chunkManager);
      if (target) {
        this.highlightMesh.position.set(target.x + 0.5, target.y + 0.5, target.z + 0.5);
        this.highlightMesh.visible = true;
      } else {
        this.highlightMesh.visible = false;
      }

      // Day/night cycle
      this.updateDayNight(dt);

      // Update HUD
      this.hud.update(this.inventory, this.player, this.chunkManager);

      // Update debug
      this.debugMenu.update(this.player, this.chunkManager, this.worldManager, this);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
