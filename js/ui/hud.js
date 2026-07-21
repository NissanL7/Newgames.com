// HUD rendering - hotbar, crosshair, block info
class HUD {
  constructor() {
    this.hotbarEl = document.getElementById('hotbar');
    this.crosshairEl = document.getElementById('crosshair');
    this.blockInfoEl = document.getElementById('block-info');
    this.messageEl = document.getElementById('message');
    this.messageTimeout = null;
  }

  update(inventory, player, world) {
    this.updateHotbar(inventory);
    this.updateBlockInfo(player, world);
  }

  updateHotbar(inventory) {
    const hotbar = inventory.getHotbar();
    let html = '';
    for (let i = 0; i < inventory.hotbarSize; i++) {
      const slot = hotbar[i];
      const selected = i === inventory.selectedSlot ? ' selected' : '';
      let content = '';
      if (slot) {
        const name = getItemName(slot.id);
        const color = this.getItemColor(slot.id);
        content = `<div class="item-icon" style="background:${color}"><span class="item-count">${slot.count > 1 ? slot.count : ''}</span></div>`;
        content += `<div class="item-name-tooltip">${name}</div>`;
      }
      html += `<div class="hotbar-slot${selected}" data-slot="${i}">${content}</div>`;
    }
    this.hotbarEl.innerHTML = html;

    // Click to select slot
    this.hotbarEl.querySelectorAll('.hotbar-slot').forEach(el => {
      el.addEventListener('click', () => {
        inventory.selectedSlot = parseInt(el.dataset.slot);
      });
    });
  }

  getItemColor(id) {
    const colors = {
      [BlockType.GRASS]: '#4a9900', [BlockType.DIRT]: '#866043', [BlockType.STONE]: '#808080',
      [BlockType.SAND]: '#dcc882', [BlockType.WOOD]: '#8B6914', [BlockType.LEAVES]: '#2d8a2d',
      [BlockType.COBBLESTONE]: '#707070', [BlockType.PLANKS]: '#b8884d', [BlockType.GLASS]: '#c8e6ff',
      [BlockType.BRICK]: '#a04632', [BlockType.COAL_ORE]: '#3a3a3a', [BlockType.IRON_ORE]: '#c8b4a0',
      [BlockType.GOLD_ORE]: '#ffd700', [BlockType.DIAMOND_ORE]: '#50dcf0', [BlockType.BEDROCK]: '#323232',
      [BlockType.GRAVEL]: '#8c8278', [BlockType.SNOW]: '#f0faff', [BlockType.ICE]: '#b4d2e6',
      [BlockType.CACTUS]: '#329628', [BlockType.CLAY]: '#a0a0aa', [BlockType.SANDSTONE]: '#d4be78',
      [BlockType.CRAFTING_TABLE]: '#b48246',
      [ItemType.STICK]: '#a08050', [ItemType.COAL]: '#222222', [ItemType.IRON_INGOT]: '#d4d4d4',
      [ItemType.GOLD_INGOT]: '#ffd700', [ItemType.DIAMOND]: '#50dcf0',
      [ItemType.WOODEN_PICKAXE]: '#b8884d', [ItemType.STONE_PICKAXE]: '#808080',
      [ItemType.IRON_PICKAXE]: '#d4d4d4', [ItemType.WOODEN_SWORD]: '#b8884d',
      [ItemType.STONE_SWORD]: '#808080', [ItemType.IRON_SWORD]: '#d4d4d4',
      [ItemType.WOODEN_SHOVEL]: '#b8884d', [ItemType.STONE_SHOVEL]: '#808080',
      [ItemType.WOODEN_AXE]: '#b8884d', [ItemType.STONE_AXE]: '#808080',
    };
    return colors[id] || '#ff00ff';
  }

  updateBlockInfo(player, world) {
    const target = player.getTargetBlock(world);
    if (target) {
      const name = getItemName(target.block);
      this.blockInfoEl.textContent = `Looking at: ${name} (${target.x}, ${target.y}, ${target.z})`;
    } else {
      this.blockInfoEl.textContent = '';
    }
  }

  showMessage(text, duration = 3000) {
    this.messageEl.textContent = text;
    this.messageEl.classList.add('visible');
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => {
      this.messageEl.classList.remove('visible');
    }, duration);
  }
}
