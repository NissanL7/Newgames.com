// Perlin noise implementation for terrain generation
class PerlinNoise {
  constructor(seed = 42) {
    this.seed = seed;
    this.perm = new Uint8Array(512);
    this.grad3 = [
      [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
      [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
      [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
    ];
    this.init();
  }

  init() {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    // Shuffle using seed
    let s = this.seed;
    for (let i = 255; i > 0; i--) {
      s = (s * 16807 + 0) % 2147483647;
      const j = s % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }

  dot3(g, x, y, z) { return g[0]*x + g[1]*y + g[2]*z; }
  dot2(g, x, y) { return g[0]*x + g[1]*y; }

  fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  lerp(a, b, t) { return a + t * (b - a); }

  noise2D(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = this.fade(x);
    const v = this.fade(y);
    const a = this.perm[X] + Y;
    const b = this.perm[X + 1] + Y;
    return this.lerp(
      this.lerp(this.dot2(this.grad3[this.perm[a] % 12], x, y),
                this.dot2(this.grad3[this.perm[b] % 12], x-1, y), u),
      this.lerp(this.dot2(this.grad3[this.perm[a+1] % 12], x, y-1),
                this.dot2(this.grad3[this.perm[b+1] % 12], x-1, y-1), u),
      v
    );
  }

  noise3D(x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);
    const a = this.perm[X] + Y;
    const aa = this.perm[a] + Z;
    const ab = this.perm[a + 1] + Z;
    const b = this.perm[X + 1] + Y;
    const ba = this.perm[b] + Z;
    const bb = this.perm[b + 1] + Z;
    return this.lerp(
      this.lerp(
        this.lerp(this.dot3(this.grad3[this.perm[aa] % 12], x, y, z),
                  this.dot3(this.grad3[this.perm[ba] % 12], x-1, y, z), u),
        this.lerp(this.dot3(this.grad3[this.perm[ab] % 12], x, y-1, z),
                  this.dot3(this.grad3[this.perm[bb] % 12], x-1, y-1, z), u), v),
      this.lerp(
        this.lerp(this.dot3(this.grad3[this.perm[aa+1] % 12], x, y, z-1),
                  this.dot3(this.grad3[this.perm[ba+1] % 12], x-1, y, z-1), u),
        this.lerp(this.dot3(this.grad3[this.perm[ab+1] % 12], x, y-1, z-1),
                  this.dot3(this.grad3[this.perm[bb+1] % 12], x-1, y-1, z-1), u), v), w);
  }

  octave2D(x, y, octaves, persistence, scale) {
    let total = 0, amplitude = 1, frequency = scale, maxVal = 0;
    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxVal += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }
    return total / maxVal;
  }

  octave3D(x, y, z, octaves, persistence, scale) {
    let total = 0, amplitude = 1, frequency = scale, maxVal = 0;
    for (let i = 0; i < octaves; i++) {
      total += this.noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
      maxVal += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }
    return total / maxVal;
  }
}
