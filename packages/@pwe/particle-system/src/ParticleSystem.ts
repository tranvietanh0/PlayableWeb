/**
 * CPU-based 2D particle system.
 *
 * Particles are simple objects with position, velocity, life, color, and size.
 * The system updates them each frame and provides a list of alive particles
 * for rendering (e.g. via a canvas 2D context or a WebGL point sprite batch).
 */

export interface ParticleConfig {
  maxCount: number;
  gravity?: { x: number; y: number };
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;      // remaining life in ms
  maxLife: number;   // initial life in ms
  size: number;
  r: number;
  g: number;
  b: number;
  a: number;
  active: boolean;
}

export interface SpawnOptions {
  x: number;
  y: number;
  count: number;
  speedMin?: number;
  speedMax?: number;
  angleMin?: number; // radians
  angleMax?: number; // radians
  lifeMin?: number;  // ms
  lifeMax?: number;  // ms
  sizeMin?: number;
  sizeMax?: number;
  r?: number;
  g?: number;
  b?: number;
  a?: number;
}

export class ParticleSystem {
  readonly particles: Particle[];
  readonly gravity: { x: number; y: number };

  constructor(config: ParticleConfig) {
    this.particles = new Array(config.maxCount);
    for (let i = 0; i < config.maxCount; i++) {
      this.particles[i] = {
        x: 0, y: 0, vx: 0, vy: 0,
        life: 0, maxLife: 0,
        size: 0, r: 1, g: 1, b: 1, a: 1,
        active: false,
      };
    }
    this.gravity = config.gravity ?? { x: 0, y: 0 };
  }

  /** Spawn particles according to options. */
  spawn(options: SpawnOptions): void {
    let spawned = 0;
    for (const p of this.particles) {
      if (p.active) continue;

      const angle =
        options.angleMin !== undefined && options.angleMax !== undefined
          ? options.angleMin + Math.random() * (options.angleMax - options.angleMin)
          : Math.random() * Math.PI * 2;
      const speed =
        options.speedMin !== undefined && options.speedMax !== undefined
          ? options.speedMin + Math.random() * (options.speedMax - options.speedMin)
          : 100;
      const life =
        options.lifeMin !== undefined && options.lifeMax !== undefined
          ? options.lifeMin + Math.random() * (options.lifeMax - options.lifeMin)
          : 1000;
      const size =
        options.sizeMin !== undefined && options.sizeMax !== undefined
          ? options.sizeMin + Math.random() * (options.sizeMax - options.sizeMin)
          : 4;

      p.x = options.x;
      p.y = options.y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = life;
      p.maxLife = life;
      p.size = size;
      p.r = options.r ?? 1;
      p.g = options.g ?? 1;
      p.b = options.b ?? 1;
      p.a = options.a ?? 1;
      p.active = true;

      spawned++;
      if (spawned >= options.count) break;
    }
  }

  /** Update all particles by delta time (ms). */
  update(dt: number): void {
    const dtSec = dt / 1000;
    for (const p of this.particles) {
      if (!p.active) continue;

      p.vx += this.gravity.x * dtSec;
      p.vy += this.gravity.y * dtSec;
      p.x += p.vx * dtSec;
      p.y += p.vy * dtSec;
      p.life -= dt;

      const lifeRatio = Math.max(0, p.life / p.maxLife);
      p.a = lifeRatio;

      if (p.life <= 0) {
        p.active = false;
      }
    }
  }

  /** Get only the active particles (for rendering). */
  getActive(): readonly Particle[] {
    return this.particles.filter((p) => p.active);
  }

  get activeCount(): number {
    return this.particles.filter((p) => p.active).length;
  }

  /** Clear all particles. */
  clear(): void {
    for (const p of this.particles) {
      p.active = false;
    }
  }
}
