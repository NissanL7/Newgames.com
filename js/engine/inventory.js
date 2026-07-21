// Inventory system
class Inventory {
  constructor(size = 36) {
    this.size = size;
    this.slots = new Array(size).fill(null);
    this.hotbarSize = 9;
    this.selectedSlot = 0;
    this.isOpen = false;
    this.showCrafting = false;
  }

  // Each slot: { id, count } or null
  getItem(slotIndex) {
    return this.slots[slotIndex];
  }

  getSelectedItem() {
    return this.slots[this.selectedSlot];
  }

  addItem(id, count = 1) {
    // First try to stack
    if (isBlock(id) || isItem(id)) {
      const maxStack = isItem(id) && ItemData[id] ? ItemData[id].maxStack : 64;
      for (let i = 0; i < this.size; i++) {
        if (this.slots[i] && this.slots[i].id === id && this.slots[i].count < maxStack) {
          const canAdd = Math.min(count, maxStack - this.slots[i].count);
          this.slots[i].count += canAdd;
          count -= canAdd;
          if (count <= 0) return true;
        }
      }
    }
    // Then find empty slots
    for (let i = 0; i < this.size; i++) {
      if (!this.slots[i]) {
        const maxStack = isItem(id) && ItemData[id] ? ItemData[id].maxStack : 64;
        const add = Math.min(count, maxStack);
        this.slots[i] = { id, count: add };
        count -= add;
        if (count <= 0) return true;
      }
    }
    return count <= 0;
  }

  removeItem(id, count = 1) {
    for (let i = this.size - 1; i >= 0; i--) {
      if (this.slots[i] && this.slots[i].id === id) {
        const remove = Math.min(count, this.slots[i].count);
        this.slots[i].count -= remove;
        count -= remove;
        if (this.slots[i].count <= 0) this.slots[i] = null;
        if (count <= 0) return true;
      }
    }
    return false;
  }

  getItemCount(id) {
    let total = 0;
    for (const slot of this.slots) {
      if (slot && slot.id === id) total += slot.count;
    }
    return total;
  }

  removeSelected(count = 1) {
    const item = this.slots[this.selectedSlot];
    if (!item) return;
    item.count -= count;
    if (item.count <= 0) this.slots[this.selectedSlot] = null;
  }

  // Drop the currently held item into the world
  getHotbar() {
    return this.slots.slice(0, this.hotbarSize);
  }

  // Serialize for saving
  serialize() {
    return this.slots.map(s => s ? { id: s.id, count: s.count } : null);
  }

  deserialize(data) {
    if (!data) return;
    for (let i = 0; i < Math.min(data.length, this.size); i++) {
      this.slots[i] = data[i];
    }
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (!this.isOpen) this.showCrafting = false;
  }

  toggleCrafting() {
    this.showCrafting = !this.showCrafting;
  }
}
