// Crafting UI
class CraftingUI {
  constructor() {
    this.panel = document.getElementById('crafting-panel');
    this.isOpen = false;
  }

  open(inventory) {
    this.isOpen = true;
    this.panel.style.display = 'flex';
    this.render(inventory);
  }

  close() {
    this.isOpen = false;
    this.panel.style.display = 'none';
  }

  render(inventory) {
    let html = '<div class="crafting-header"><h2>Crafting</h2><button id="craft-close" class="btn-close">&times;</button></div>';
    html += '<div class="crafting-recipes">';

    for (const recipe of CraftingRecipes) {
      const canDo = canCraft(recipe, inventory);
      const cls = canDo ? 'craftable' : 'no-craft';
      const outName = getItemName(recipe.output.id);
      const outColor = this.getColor(recipe.output.id);

      let ingHtml = '';
      for (const ing of recipe.ingredients) {
        const have = inventory.getItemCount(ing.id);
        const enough = have >= ing.count;
        const color = this.getColor(ing.id);
        ingHtml += `<div class="ingredient ${enough ? 'enough' : 'not-enough'}">
          <div class="ing-icon" style="background:${color}"></div>
          <span>${getItemName(ing.id)} x${ing.count} (${have})</span>
        </div>`;
      }

      html += `<div class="recipe-card ${cls}" data-recipe="${recipe.name}">
        <div class="recipe-output">
          <div class="output-icon" style="background:${outColor}"></div>
          <span>${outName} x${recipe.output.count}</span>
        </div>
        <div class="recipe-ingredients">${ingHtml}</div>
        <button class="craft-btn" ${canDo ? '' : 'disabled'}>Craft</button>
      </div>`;
    }

    html += '</div>';
    this.panel.innerHTML = html;

    // Event handlers
    document.getElementById('craft-close').addEventListener('click', () => this.close());

    this.panel.querySelectorAll('.craft-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.recipe-card');
        const name = card.dataset.recipe;
        const recipe = CraftingRecipes.find(r => r.name === name);
        if (recipe && canCraft(recipe, inventory)) {
          craft(recipe, inventory);
          this.render(inventory);
          if (typeof game !== 'undefined' && game.hud) {
            game.hud.showMessage(`Crafted ${recipe.name}!`);
          }
        }
      });
    });
  }

  getColor(id) {
    const colors = {
      [BlockType.WOOD]: '#8B6914', [BlockType.PLANKS]: '#b8884d', [BlockType.COBBLESTONE]: '#707070',
      [BlockType.STONE]: '#808080', [BlockType.SAND]: '#dcc882', [BlockType.CLAY]: '#a0a0aa',
      [BlockType.SAND]: '#dcc882', [BlockType.COAL_ORE]: '#3a3a3a',
      [BlockType.IRON_ORE]: '#c8b4a0', [BlockType.GOLD_ORE]: '#ffd700',
      [BlockType.CRAFTING_TABLE]: '#b48246', [BlockType.GLASS]: '#c8e6ff',
      [BlockType.BRICK]: '#a04632', [BlockType.DIRT]: '#866043',
      [ItemType.STICK]: '#a08050', [ItemType.COAL]: '#222222',
      [ItemType.IRON_INGOT]: '#d4d4d4', [ItemType.GOLD_INGOT]: '#ffd700',
      [ItemType.DIAMOND]: '#50dcf0',
      [ItemType.WOODEN_PICKAXE]: '#b8884d', [ItemType.STONE_PICKAXE]: '#808080',
      [ItemType.IRON_PICKAXE]: '#d4d4d4',
      [ItemType.WOODEN_SWORD]: '#b8884d', [ItemType.STONE_SWORD]: '#808080',
      [ItemType.IRON_SWORD]: '#d4d4d4',
      [ItemType.WOODEN_SHOVEL]: '#b8884d', [ItemType.STONE_SHOVEL]: '#808080',
      [ItemType.WOODEN_AXE]: '#b8884d', [ItemType.STONE_AXE]: '#808080',
    };
    return colors[id] || '#ff00ff';
  }
}
