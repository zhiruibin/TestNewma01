import { useEffect, useRef, useCallback } from 'react';

export interface ParticleBackgroundOptions {
  maxParticles?: number;
  color?: {
    inner: string;
    outer: string;
  };
  speedY?: [number, number];
  speedX?: [number, number];
  size?: [number, number];
  life?: [number, number];
}

interface Particle {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  size: number;
  life: number;
  maxLife: number;
}

const DEFAULT_OPTIONS: Required<ParticleBackgroundOptions> = {
  maxParticles: 80,
  color: {
    inner: 'rgba(0, 255, 255, 0.8)',
    outer: 'rgba(0, 100, 255, 0)',
  },
  speedY: [-2, -0.5],
  speedX: [-0.5, 0.5],
  size: [1, 3],
  life: [300, 700],
};

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function useParticleBackground(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options?: ParticleBackgroundOptions
): void {
  const optionsRef = useRef({ ...DEFAULT_OPTIONS, ...options });
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = {
      maxParticles: options?.maxParticles ?? DEFAULT_OPTIONS.maxParticles,
      color: options?.color ?? DEFAULT_OPTIONS.color,
      speedY: options?.speedY ?? DEFAULT_OPTIONS.speedY,
      speedX: options?.speedX ?? DEFAULT_OPTIONS.speedX,
      size: options?.size ?? DEFAULT_OPTIONS.size,
      life: options?.life ?? DEFAULT_OPTIONS.life,
    };
  }, [options]);

  const createParticle = useCallback((canvasWidth: number, canvasHeight: number): Particle => {
    const opts = optionsRef.current;
    const maxLife = randomInRange(opts.life[0], opts.life[1]);
    return {
      x: Math.random() * canvasWidth,
      y: canvasHeight + 10,
      speedX: randomInRange(opts.speedX[0], opts.speedX[1]),
      speedY: randomInRange(opts.speedY[0], opts.speedY[1]),
      size: randomInRange(opts.size[0], opts.size[1]),
      life: maxLife,
      maxLife,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const opts = optionsRef.current;
    particlesRef.current = [];
    for (let i = 0; i < opts.maxParticles; i++) {
      const particle = createParticle(canvas.width, canvas.height);
      // Spread initial particles across the canvas
      particle.y = Math.random() * canvas.height;
      particle.life = Math.random() * particle.maxLife;
      particlesRef.current.push(particle);
    }

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const currentOpts = optionsRef.current;
      const particles = particlesRef.current;

      // Maintain particle count at maxParticles
      while (particles.length < currentOpts.maxParticles) {
        particles.push(createParticle(canvas.width, canvas.height));
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.speedX;
        p.y += p.speedY;
        p.life--;

        if (p.life <= 0 || p.y < -10) {
          // Replace with a new particle
          particles[i] = createParticle(canvas.width, canvas.height);
          continue;
        }

        const alpha = Math.min(1, p.life / (p.maxLife * 0.3));
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, currentOpts.color.inner.replace(/[\d.]+\)$/, `${alpha})`));
        gradient.addColorStop(1, currentOpts.color.outer.replace(/[\d.]+\)$/, `${alpha * 0.5})`));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [canvasRef, createParticle]);
}