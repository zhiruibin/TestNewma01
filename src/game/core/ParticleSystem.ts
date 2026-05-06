import * as PIXI from 'pixi.js';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  alpha: number;
  size: number;
  color: number;
  rotation: number;
  rotationSpeed: number;
  graphics: PIXI.Graphics;
}

export class ParticleSystem {
  private container: PIXI.Container;
  private cellSize: number;
  private particles: Particle[] = [];
  private readonly gravity = 400;

  constructor(container: PIXI.Container, cellSize: number) {
    this.container = container;
    this.cellSize = cellSize;
  }

  emit(row: number, col: number, color: number, intensity: number = 1.0): void {
    const count = Math.round(8 * intensity);
    const cx = col * this.cellSize + this.cellSize / 2;
    const cy = row * this.cellSize + this.cellSize / 2;

    for (let i = 0; i < count; i++) {
      const size = 2 + Math.random() * 3;
      const maxLife = 0.4 + Math.random() * 0.4;

      const graphics = new PIXI.Graphics();
      graphics.beginFill(0xffffff);
      graphics.drawRect(0, 0, size, size);
      graphics.endFill();
      graphics.tint = color;
      this.container.addChild(graphics);

      const particle: Particle = {
        x: cx,
        y: cy,
        vx: -150 + Math.random() * 300,
        vy: -250 + Math.random() * 300,
        life: maxLife,
        maxLife,
        alpha: 1,
        size,
        color,
        rotation: Math.random() * 6.28,
        rotationSpeed: -5 + Math.random() * 10,
        graphics,
      };

      this.particles.push(particle);
    }
  }

  update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.vy += this.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.rotationSpeed * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);

      p.graphics.alpha = p.alpha;
      p.graphics.x = p.x;
      p.graphics.y = p.y;
      p.graphics.rotation = p.rotation;

      if (p.life <= 0) {
        this.container.removeChild(p.graphics);
        p.graphics.destroy();
        this.particles.splice(i, 1);
      }
    }
  }

  destroy(): void {
    for (const p of this.particles) {
      this.container.removeChild(p.graphics);
      p.graphics.destroy();
    }
    this.particles = [];
  }
}