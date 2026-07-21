// Player controller with physics, collision, and both desktop/mobile input
class Player {
  constructor() {
    this.position = new THREE.Vector3(0, 40, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotation = { x: 0, y: 0 }; // pitch, yaw
    this.height = 1.7;
    this.width = 0.3;
    this.onGround = false;
    this.speed = 5;
    this.jumpForce = 8;
    this.gravity = -20;
    this.inWater = false;
    this.flying = false;

    // Input state
    this.moveInput = { x: 0, z: 0 }; // from joystick/WASD
    this.lookInput = { x: 0, y: 0 };
    this.keys = {};
    this.isMobile = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    this.mouseLocked = false;
    this.sensitivity = 0.002;
  }

  init(camera) {
    this.camera = camera;
    this.setupDesktopControls();
  }

  setupDesktopControls() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space' && this.onGround) {
        this.velocity.y = this.jumpForce;
      }
      if (e.code === 'KeyF' && this.flying !== undefined) {
        this.flying = !this.flying;
      }
    });
    document.addEventListener('keyup', (e) => { this.keys[e.code] = false; });

    document.addEventListener('click', () => {
      if (!this.isMobile && !this.mouseLocked) {
        document.body.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.mouseLocked = document.pointerLockElement === document.body;
    });

    document.addEventListener('mousemove', (e) => {
      if (this.mouseLocked) {
        this.rotation.y -= e.movementX * this.sensitivity;
        this.rotation.x -= e.movementY * this.sensitivity;
        this.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.rotation.x));
      }
    });
  }

  update(dt, world) {
    // WASD keyboard input
    let mx = 0, mz = 0;
    if (this.keys['KeyW']) mz -= 1;
    if (this.keys['KeyS']) mz += 1;
    if (this.keys['KeyA']) mx -= 1;
    if (this.keys['KeyD']) mx += 1;

    // Combine with joystick input
    mx += this.moveInput.x;
    mz += this.moveInput.z;

    // Clamp magnitude
    const mag = Math.sqrt(mx*mx + mz*mz);
    if (mag > 1) { mx /= mag; mz /= mag; }

    // Transform movement by yaw
    const sinY = Math.sin(this.rotation.y);
    const cosY = Math.cos(this.rotation.y);
    const moveX = mx * cosY - mz * sinY;
    const moveZ = mx * sinY + mz * cosY;

    const currentSpeed = this.flying ? this.speed * 2 : this.speed;
    this.velocity.x = moveX * currentSpeed;
    this.velocity.z = moveZ * currentSpeed;

    // Gravity
    if (!this.flying) {
      if (this.inWater) {
        this.velocity.y += this.gravity * 0.2 * dt;
        this.velocity.y *= 0.95;
        if (this.keys['Space']) this.velocity.y = 3;
      } else {
        this.velocity.y += this.gravity * dt;
      }
    } else {
      if (this.keys['Space']) this.velocity.y = 5;
      else if (this.keys['ShiftLeft']) this.velocity.y = -5;
      else this.velocity.y = 0;
    }

    // Apply velocity
    const newPos = this.position.clone();
    newPos.x += this.velocity.x * dt;
    newPos.y += this.velocity.y * dt;
    newPos.z += this.velocity.z * dt;

    // Collision detection
    this.onGround = false;
    this.inWater = false;

    // Check water
    const feetBlock = world.getBlock(
      Math.floor(this.position.x),
      Math.floor(this.position.y),
      Math.floor(this.position.z)
    );
    if (feetBlock === BlockType.WATER) this.inWater = true;

    // Y collision
    if (this.velocity.y < 0) {
      if (this.isSolidAt(newPos.x, newPos.y - this.height, newPos.z, world)) {
        newPos.y = Math.floor(newPos.y - this.height + 1) + this.height;
        this.velocity.y = 0;
        this.onGround = true;
      }
    } else if (this.velocity.y > 0) {
      if (this.isSolidAt(newPos.x, newPos.y + 0.1, newPos.z, world)) {
        this.velocity.y = 0;
      }
    }

    // X collision
    if (this.isSolidAt(newPos.x + this.width, newPos.y, newPos.z, world) ||
        this.isSolidAt(newPos.x - this.width, newPos.y, newPos.z, world)) {
      newPos.x = this.position.x;
      this.velocity.x = 0;
    }

    // Z collision
    if (this.isSolidAt(newPos.x, newPos.y, newPos.z + this.width, world) ||
        this.isSolidAt(newPos.x, newPos.y, newPos.z - this.width, world)) {
      newPos.z = this.position.z;
      this.velocity.z = 0;
    }

    // Prevent falling below world
    if (newPos.y < 1) { newPos.y = 40; this.velocity.y = 0; }

    this.position.copy(newPos);

    // Update camera
    this.camera.position.copy(this.position);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.rotation.y;
    this.camera.rotation.x = this.rotation.x;
  }

  isSolidAt(x, y, z, world) {
    const bx = Math.floor(x);
    const by = Math.floor(y);
    const bz = Math.floor(z);
    const block = world.getBlock(bx, by, bz);
    return BlockData[block] && BlockData[block].solid;
  }

  // Get the block the player is looking at (raycasting)
  getTargetBlock(world, maxDist = 6) {
    const dir = new THREE.Vector3(0, 0, -1);
    dir.applyQuaternion(this.camera.quaternion);

    const pos = this.camera.position.clone();
    const step = 0.05;

    let prevX, prevY, prevZ;
    for (let d = 0; d < maxDist; d += step) {
      prevX = Math.floor(pos.x);
      prevY = Math.floor(pos.y);
      prevZ = Math.floor(pos.z);

      pos.add(dir.clone().multiplyScalar(step));

      const bx = Math.floor(pos.x);
      const by = Math.floor(pos.y);
      const bz = Math.floor(pos.z);

      const block = world.getBlock(bx, by, bz);
      if (block !== BlockType.AIR && block !== BlockType.WATER) {
        return { x: bx, y: by, z: bz, prevX, prevY, prevZ, block };
      }
    }
    return null;
  }
}
