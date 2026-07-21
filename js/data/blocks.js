// Block definitions with properties
const BlockType = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  SAND: 4,
  WATER: 5,
  WOOD: 6,
  LEAVES: 7,
  COBBLESTONE: 8,
  PLANKS: 9,
  GLASS: 10,
  BRICK: 11,
  COAL_ORE: 12,
  IRON_ORE: 13,
  GOLD_ORE: 14,
  DIAMOND_ORE: 15,
  BEDROCK: 16,
  GRAVEL: 17,
  SNOW: 18,
  ICE: 19,
  CACTUS: 20,
  CLAY: 21,
  SANDSTONE: 22,
  CRAFTING_TABLE: 23,
};

const BlockData = {
  [BlockType.AIR]:       { name: 'Air',          solid: false, transparent: true,  gravity: false, texture: null },
  [BlockType.GRASS]:     { name: 'Grass',        solid: true,  transparent: false, gravity: false, texture: 'grass' },
  [BlockType.DIRT]:      { name: 'Dirt',         solid: true,  transparent: false, gravity: false, texture: 'dirt' },
  [BlockType.STONE]:     { name: 'Stone',        solid: true,  transparent: false, gravity: false, texture: 'stone' },
  [BlockType.SAND]:      { name: 'Sand',         solid: true,  transparent: false, gravity: true,  texture: 'sand' },
  [BlockType.WATER]:     { name: 'Water',        solid: false, transparent: true,  gravity: false, texture: 'water', liquid: true },
  [BlockType.WOOD]:      { name: 'Wood',         solid: true,  transparent: false, gravity: false, texture: 'wood' },
  [BlockType.LEAVES]:    { name: 'Leaves',       solid: true,  transparent: false, gravity: false, texture: 'leaves' },
  [BlockType.COBBLESTONE]:{ name: 'Cobblestone', solid: true,  transparent: false, gravity: false, texture: 'cobblestone' },
  [BlockType.PLANKS]:    { name: 'Planks',       solid: true,  transparent: false, gravity: false, texture: 'planks' },
  [BlockType.GLASS]:     { name: 'Glass',        solid: true,  transparent: true,  gravity: false, texture: 'glass' },
  [BlockType.BRICK]:     { name: 'Brick',        solid: true,  transparent: false, gravity: false, texture: 'brick' },
  [BlockType.COAL_ORE]:  { name: 'Coal Ore',     solid: true,  transparent: false, gravity: false, texture: 'coal_ore' },
  [BlockType.IRON_ORE]:  { name: 'Iron Ore',     solid: true,  transparent: false, gravity: false, texture: 'iron_ore' },
  [BlockType.GOLD_ORE]:  { name: 'Gold Ore',     solid: true,  transparent: false, gravity: false, texture: 'gold_ore' },
  [BlockType.DIAMOND_ORE]:{ name: 'Diamond Ore', solid: true,  transparent: false, gravity: false, texture: 'diamond_ore' },
  [BlockType.BEDROCK]:   { name: 'Bedrock',      solid: true,  transparent: false, gravity: false, texture: 'bedrock' },
  [BlockType.GRAVEL]:    { name: 'Gravel',       solid: true,  transparent: false, gravity: true,  texture: 'gravel' },
  [BlockType.SNOW]:      { name: 'Snow',         solid: true,  transparent: false, gravity: false, texture: 'snow' },
  [BlockType.ICE]:       { name: 'Ice',          solid: true,  transparent: true,  gravity: false, texture: 'ice' },
  [BlockType.CACTUS]:    { name: 'Cactus',       solid: true,  transparent: false, gravity: false, texture: 'cactus' },
  [BlockType.CLAY]:      { name: 'Clay',         solid: true,  transparent: false, gravity: false, texture: 'clay' },
  [BlockType.SANDSTONE]: { name: 'Sandstone',    solid: true,  transparent: false, gravity: false, texture: 'sandstone' },
  [BlockType.CRAFTING_TABLE]: { name: 'Crafting Table', solid: true, transparent: false, gravity: false, texture: 'crafting_table' },
};

// Items that are not blocks
const ItemType = {
  STICK: 100,
  COAL: 101,
  IRON_INGOT: 102,
  GOLD_INGOT: 103,
  DIAMOND: 104,
  WOODEN_PICKAXE: 105,
  STONE_PICKAXE: 106,
  IRON_PICKAXE: 107,
  WOODEN_SWORD: 108,
  STONE_SWORD: 109,
  IRON_SWORD: 110,
  WOODEN_SHOVEL: 111,
  STONE_SHOVEL: 112,
  WOODEN_AXE: 113,
  STONE_AXE: 114,
};

const ItemData = {
  [ItemType.STICK]:          { name: 'Stick',         stackable: true, maxStack: 64, tool: null },
  [ItemType.COAL]:           { name: 'Coal',          stackable: true, maxStack: 64, tool: null },
  [ItemType.IRON_INGOT]:     { name: 'Iron Ingot',    stackable: true, maxStack: 64, tool: null },
  [ItemType.GOLD_INGOT]:     { name: 'Gold Ingot',    stackable: true, maxStack: 64, tool: null },
  [ItemType.DIAMOND]:        { name: 'Diamond',       stackable: true, maxStack: 64, tool: null },
  [ItemType.WOODEN_PICKAXE]: { name: 'Wooden Pickaxe',stackable: false, maxStack: 1, tool: 'pickaxe', tier: 0, durability: 60 },
  [ItemType.STONE_PICKAXE]:  { name: 'Stone Pickaxe', stackable: false, maxStack: 1, tool: 'pickaxe', tier: 1, durability: 132 },
  [ItemType.IRON_PICKAXE]:   { name: 'Iron Pickaxe',  stackable: false, maxStack: 1, tool: 'pickaxe', tier: 2, durability: 251 },
  [ItemType.WOODEN_SWORD]:   { name: 'Wooden Sword',  stackable: false, maxStack: 1, tool: 'sword', tier: 0, durability: 60 },
  [ItemType.STONE_SWORD]:    { name: 'Stone Sword',   stackable: false, maxStack: 1, tool: 'sword', tier: 1, durability: 132 },
  [ItemType.IRON_SWORD]:     { name: 'Iron Sword',    stackable: false, maxStack: 1, tool: 'sword', tier: 2, durability: 251 },
  [ItemType.WOODEN_SHOVEL]:  { name: 'Wooden Shovel', stackable: false, maxStack: 1, tool: 'shovel', tier: 0, durability: 60 },
  [ItemType.STONE_SHOVEL]:   { name: 'Stone Shovel',  stackable: false, maxStack: 1, tool: 'shovel', tier: 1, durability: 132 },
  [ItemType.WOODEN_AXE]:     { name: 'Wooden Axe',    stackable: false, maxStack: 1, tool: 'axe', tier: 0, durability: 60 },
  [ItemType.STONE_AXE]:      { name: 'Stone Axe',     stackable: false, maxStack: 1, tool: 'axe', tier: 1, durability: 132 },
};

function isBlock(id) { return id !== undefined && id !== null && id < 100; }
function isItem(id) { return id >= 100; }
function getItemName(id) {
  if (isBlock(id) && BlockData[id]) return BlockData[id].name;
  if (isItem(id) && ItemData[id]) return ItemData[id].name;
  return 'Unknown';
}
