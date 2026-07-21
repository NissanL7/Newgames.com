// Mobile joystick and touch controls
class Joystick {
  constructor() {
    this.active = false;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.outputX = 0;
    this.outputY = 0;
    this.radius = 50;
    this.touchId = null;
    this.lookTouchId = null;
    this.lookLastX = 0;
    this.lookLastY = 0;
  }

  init(player) {
    this.player = player;
    this.createElement();
    this.setupEvents();
  }

  createElement() {
    // Move joystick (left side)
    this.moveZone = document.getElementById('move-zone');
    this.moveKnob = document.getElementById('move-knob');
    this.moveBase = document.getElementById('move-base');

    // Look area (right side of screen)
    this.lookZone = document.getElementById('look-zone');

    // Action buttons
    this.jumpBtn = document.getElementById('jump-btn');
    this.breakBtn = document.getElementById('break-btn');
    this.placeBtn = document.getElementById('place-btn');
    this.inventoryBtn = document.getElementById('inventory-btn');

    this.onJump = null;
    this.onBreak = null;
    this.onPlace = null;
    this.onInventory = null;
  }

  setupEvents() {
    // Move joystick
    this.moveZone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      this.touchId = touch.identifier;
      this.active = true;
      const rect = this.moveZone.getBoundingClientRect();
      this.startX = rect.left + rect.width / 2;
      this.startY = rect.top + rect.height / 2;
      this.updateKnob(touch.clientX, touch.clientY);
    });

    this.moveZone.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const touch of e.changedTouches) {
        if (touch.identifier === this.touchId) {
          this.updateKnob(touch.clientX, touch.clientY);
        }
      }
    });

    const endMove = (e) => {
      for (const touch of e.changedTouches) {
        if (touch.identifier === this.touchId) {
          this.touchId = null;
          this.active = false;
          this.outputX = 0;
          this.outputY = 0;
          this.moveKnob.style.transform = 'translate(0px, 0px)';
        }
      }
    };
    this.moveZone.addEventListener('touchend', endMove);
    this.moveZone.addEventListener('touchcancel', endMove);

    // Look area
    this.lookZone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      this.lookTouchId = touch.identifier;
      this.lookLastX = touch.clientX;
      this.lookLastY = touch.clientY;
    });

    this.lookZone.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const touch of e.changedTouches) {
        if (touch.identifier === this.lookTouchId) {
          const dx = touch.clientX - this.lookLastX;
          const dy = touch.clientY - this.lookLastY;
          this.player.rotation.y -= dx * 0.004;
          this.player.rotation.x -= dy * 0.004;
          this.player.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.player.rotation.x));
          this.lookLastX = touch.clientX;
          this.lookLastY = touch.clientY;
        }
      }
    });

    const endLook = (e) => {
      for (const touch of e.changedTouches) {
        if (touch.identifier === this.lookTouchId) {
          this.lookTouchId = null;
        }
      }
    };
    this.lookZone.addEventListener('touchend', endLook);
    this.lookZone.addEventListener('touchcancel', endLook);

    // Action buttons
    this.jumpBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.onJump) this.onJump();
    });

    this.breakBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.onBreak) this.onBreak();
    });

    this.placeBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.onPlace) this.onPlace();
    });

    this.inventoryBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.onInventory) this.onInventory();
    });
  }

  updateKnob(clientX, clientY) {
    let dx = clientX - this.startX;
    let dy = clientY - this.startY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > this.radius) {
      dx = dx / dist * this.radius;
      dy = dy / dist * this.radius;
    }
    this.moveKnob.style.transform = `translate(${dx}px, ${dy}px)`;
    this.outputX = dx / this.radius;
    this.outputY = dy / this.radius;

    // Update player move input
    this.player.moveInput.x = this.outputX;
    this.player.moveInput.z = this.outputY;
  }
}
