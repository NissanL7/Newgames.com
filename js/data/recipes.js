// Crafting recipes
const CraftingRecipes = [
  // Basic recipes
  { name: 'Planks', output: { id: BlockType.PLANKS, count: 4 }, ingredients: [{ id: BlockType.WOOD, count: 1 }], grid: null },
  { name: 'Sticks', output: { id: ItemType.STICK, count: 4 }, ingredients: [{ id: BlockType.PLANKS, count: 2 }], grid: null },
  { name: 'Crafting Table', output: { id: BlockType.CRAFTING_TABLE, count: 1 }, ingredients: [{ id: BlockType.PLANKS, count: 4 }], grid: null },
  { name: 'Cobblestone Wall', output: { id: BlockType.COBBLESTONE, count: 1 }, ingredients: [{ id: BlockType.STONE, count: 1 }], grid: null },
  
  // Sandstone
  { name: 'Sandstone', output: { id: BlockType.SANDSTONE, count: 1 }, ingredients: [{ id: BlockType.SAND, count: 4 }], grid: null },
  
  // Glass
  { name: 'Glass', output: { id: BlockType.GLASS, count: 1 }, ingredients: [{ id: BlockType.SAND, count: 1 }], grid: null },
  
  // Brick
  { name: 'Brick', output: { id: BlockType.BRICK, count: 1 }, ingredients: [{ id: BlockType.CLAY, count: 4 }], grid: null },
  
  // Smelting (simplified - just coal)
  { name: 'Coal', output: { id: ItemType.COAL, count: 1 }, ingredients: [{ id: BlockType.COAL_ORE, count: 1 }], grid: null },
  { name: 'Iron Ingot', output: { id: ItemType.IRON_INGOT, count: 1 }, ingredients: [{ id: BlockType.IRON_ORE, count: 1 }, { id: ItemType.COAL, count: 1 }], grid: null },
  { name: 'Gold Ingot', output: { id: ItemType.GOLD_INGOT, count: 1 }, ingredients: [{ id: BlockType.GOLD_ORE, count: 1 }, { id: ItemType.COAL, count: 1 }], grid: null },
  
  // Tools - Wooden
  { name: 'Wooden Pickaxe', output: { id: ItemType.WOODEN_PICKAXE, count: 1 }, ingredients: [{ id: BlockType.PLANKS, count: 3 }, { id: ItemType.STICK, count: 2 }], grid: null },
  { name: 'Wooden Sword', output: { id: ItemType.WOODEN_SWORD, count: 1 }, ingredients: [{ id: BlockType.PLANKS, count: 2 }, { id: ItemType.STICK, count: 1 }], grid: null },
  { name: 'Wooden Shovel', output: { id: ItemType.WOODEN_SHOVEL, count: 1 }, ingredients: [{ id: BlockType.PLANKS, count: 1 }, { id: ItemType.STICK, count: 2 }], grid: null },
  { name: 'Wooden Axe', output: { id: ItemType.WOODEN_AXE, count: 1 }, ingredients: [{ id: BlockType.PLANKS, count: 3 }, { id: ItemType.STICK, count: 2 }], grid: null },
  
  // Tools - Stone
  { name: 'Stone Pickaxe', output: { id: ItemType.STONE_PICKAXE, count: 1 }, ingredients: [{ id: BlockType.COBBLESTONE, count: 3 }, { id: ItemType.STICK, count: 2 }], grid: null },
  { name: 'Stone Sword', output: { id: ItemType.STONE_SWORD, count: 1 }, ingredients: [{ id: BlockType.COBBLESTONE, count: 2 }, { id: ItemType.STICK, count: 1 }], grid: null },
  { name: 'Stone Shovel', output: { id: ItemType.STONE_SHOVEL, count: 1 }, ingredients: [{ id: BlockType.COBBLESTONE, count: 1 }, { id: ItemType.STICK, count: 2 }], grid: null },
  { name: 'Stone Axe', output: { id: ItemType.STONE_AXE, count: 1 }, ingredients: [{ id: BlockType.COBBLESTONE, count: 3 }, { id: ItemType.STICK, count: 2 }], grid: null },
  
  // Tools - Iron
  { name: 'Iron Pickaxe', output: { id: ItemType.IRON_PICKAXE, count: 1 }, ingredients: [{ id: ItemType.IRON_INGOT, count: 3 }, { id: ItemType.STICK, count: 2 }], grid: null },
  { name: 'Iron Sword', output: { id: ItemType.IRON_SWORD, count: 1 }, ingredients: [{ id: ItemType.IRON_INGOT, count: 2 }, { id: ItemType.STICK, count: 1 }], grid: null },
];

function canCraft(recipe, inventory) {
  for (const ing of recipe.ingredients) {
    const count = inventory.getItemCount(ing.id);
    if (count < ing.count) return false;
  }
  return true;
}

function craft(recipe, inventory) {
  if (!canCraft(recipe, inventory)) return false;
  for (const ing of recipe.ingredients) {
    inventory.removeItem(ing.id, ing.count);
  }
  inventory.addItem(recipe.output.id, recipe.output.count);
  return true;
}
