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
  isLarge?: boolean;
  isText?: boolean;
  text?: string;
  textStyle?: PIXI.TextStyle;
  textObj?: PIXI.Text;
}

export class ParticleSystem {
  private container: PIXI.Container;
  private cellSize: number;
  private particles: Particle[] = [];
  private readonly gravity = 400;
  private boardWidth: number;
  private boardHeight: number;

  constructor(container: PIXI.Container, cellSize: number, boardCols: number = 10, boardRows: number = 20) {
    this.container = container;
    this.cellSize = cellSize;
    this.boardWidth = boardCols * cellSize;
    this.boardHeight = boardRows * cellSize;
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

  emitFlash(row: number, color: number = 0xffffff, intensity: number = 1.0): void {
    const count = Math.round(12 * intensity);
    const cy = row * this.cellSize + this.cellSize / 2;

    for (let i = 0; i < count; i++) {
      const size = 6 + Math.random() * 10;
      const maxLife = 0.2 + Math.random() * 0.25;
      const cx = Math.random() * this.boardWidth;

      const graphics = new PIXI.Graphics();
      graphics.beginFill(0xffffff);
      graphics.drawRect(0, 0, size, size * 0.4);
      graphics.endFill();
      graphics.tint = color;
      this.container.addChild(graphics);

      const direction = Math.random() > 0.5 ? 1 : -1;
      const particle: Particle = {
        x: cx,
        y: cy + (Math.random() - 0.5) * this.cellSize * 0.5,
        vx: direction * (200 + Math.random() * 400),
        vy: (Math.random() - 0.5) * 60,
        life: maxLife,
        maxLife,
        alpha: 1,
        size,
        color,
        rotation: 0,
        rotationSpeed: 0,
        graphics,
        isLarge: true,
      };

      this.particles.push(particle);
    }
  }

  emitScreenFlash(color: number = 0xffffff, intensity: number = 1.0): void {
    const maxLife = 0.15 + 0.1 * intensity;

    const graphics = new PIXI.Graphics();
    graphics.beginFill(color, 0.6);
    graphics.drawRect(0, 0, this.boardWidth, this.boardHeight);
    graphics.endFill();
    this.container.addChild(graphics);

    const particle: Particle = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: maxLife,
      maxLife,
      alpha: 1,
      size: 0,
      color,
      rotation: 0,
      rotationSpeed: 0,
      graphics,
      isLarge: true,
    };

    this.particles.push(particle);
  }

  emitLightning(startRow: number, endRow: number, color: number = 0x88ccff, intensity: number = 1.0): void {
    const segments = Math.abs(endRow - startRow) + 1;
    const segmentHeight = this.cellSize;
    const startX = this.boardWidth / 2;

    let currentX = startX;
    let currentY = startRow * this.cellSize + this.cellSize / 2;
    const direction = endRow > startRow ? 1 : -1;

    for (let i = 0; i < segments; i++) {
      const nextX = currentX + (Math.random() - 0.5) * this.cellSize * 3;
      const nextY = currentY + direction * segmentHeight;

      const dx = nextX - currentX;
      const dy = nextY - currentY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      const thickness = 3 + Math.random() * 3;
      const maxLife = 0.2 + Math.random() * 0.2;

      const graphics = new PIXI.Graphics();
      graphics.lineStyle(thickness, color, 1);
      graphics.moveTo(0, 0);
      graphics.lineTo(dist, 0);
      this.container.addChild(graphics);
      graphics.x = currentX;
      graphics.y = currentY;
      graphics.rotation = angle;

      const particle: Particle = {
        x: currentX,
        y: currentY,
        vx: 0,
        vy: 0,
        life: maxLife,
        maxLife,
        alpha: 1,
        size: thickness,
        color,
        rotation: angle,
        rotationSpeed: 0,
        graphics,
        isLarge: true,
      };

      this.particles.push(particle);

      const glowSize = thickness * 4;
      const glowGraphics = new PIXI.Graphics();
      glowGraphics.beginFill(color, 0.3);
      glowGraphics.drawEllipse(0, 0, glowSize, glowSize * 0.5);
      glowGraphics.endFill();
      this.container.addChild(glowGraphics);
      glowGraphics.x = (currentX + nextX) / 2;
      glowGraphics.y = (currentY + nextY) / 2;

      const glowParticle: Particle = {
        x: (currentX + nextX) / 2,
        y: (currentY + nextY) / 2,
        vx: 0,
        vy: 0,
        life: maxLife * 0.8,
        maxLife: maxLife * 0.8,
        alpha: 0.6,
        size: glowSize,
        color,
        rotation: 0,
        rotationSpeed: 0,
        graphics: glowGraphics,
        isLarge: true,
      };

      this.particles.push(glowParticle);

      currentX = nextX;
      currentY = nextY;
    }
  }

  emitComboText(combo: number, x: number, y: number, color: number = 0xffdd00): void {
    const text = `${combo} COMBO`;
    const maxLife = 1.2;

    const style = new PIXI.TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 28,
      fontWeight: 'bold',
      fill: color,
      stroke: 0x000000,
      strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: 0x000000,
      dropShadowBlur: 4,
      dropShadowDistance: 2,
    });

    const textObj = new PIXI.Text(text, style);
    textObj.anchor.set(0.5);
    textObj.x = x;
    textObj.y = y;
    this.container.addChild(textObj);

    const graphics = new PIXI.Graphics();
    graphics.beginFill(0x000000, 0);
    graphics.drawRect(0, 0, 1, 1);
    graphics.endFill();
    graphics.visible = false;
    this.container.addChild(graphics);

    const particle: Particle = {
      x,
      y,
      vx: 0,
      vy: -80,
      life: maxLife,
      maxLife,
      alpha: 1,
      size: 28,
      color,
      rotation: 0,
      rotationSpeed: 0,
      graphics,
      isLarge: true,
      isText: true,
      text,
      textStyle: style,
      textObj,
    };

    this.particles.push(particle);
  }

  update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      if (p.isLarge) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        p.alpha = Math.max(0, p.life / p.maxLife);

        if (p.isText && p.textObj) {
          p.textObj.x = p.x;
          p.textObj.y = p.y;
          p.textObj.alpha = p.alpha;
          const scale = 1 + (1 - p.alpha) * 0.3;
          p.textObj.scale.set(scale);
        } else {
          p.graphics.alpha = p.alpha;
          p.graphics.x = p.x;
          p.graphics.y = p.y;
        }

        if (p.life <= 0) {
          this.container.removeChild(p.graphics);
          p.graphics.destroy();
          if (p.textObj) {
            this.container.removeChild(p.textObj);
            p.textObj.destroy();
          }
          this.particles.splice(i, 1);
        }
      } else {
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
  }

  destroy(): void {
    for (const p of this.particles) {
      this.container.removeChild(p.graphics);
      p.graphics.destroy();
      if (p.textObj) {
        this.container.removeChild(p.textObj);
        p.textObj.destroy();
      }
    }
    this.particles = [];
  }
}