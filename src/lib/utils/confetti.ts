// Dependency-free celebration confetti: one fixed-position canvas, a burst of coloured
// rectangles under gravity, torn down as soon as the last particle leaves the screen.
//
// Deliberately does nothing under prefers-reduced-motion — celebrations must never become
// the app's first accessibility regression. Callers can fire unconditionally.

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  width: number;
  height: number;
  color: string;
}

const COLORS = ['#3480f1', '#af52de', '#34c759', '#ff9500', '#ff2d55', '#ffcc00'];
const GRAVITY = 0.18;
const DRAG = 0.992;

let canvas: HTMLCanvasElement | null = null;
let context: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let frame: number | null = null;

function ensureCanvas(): CanvasRenderingContext2D | null {
  if (context) return context;

  canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.cssText =
    'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  context = canvas.getContext('2d');
  return context;
}

function teardown() {
  if (frame !== null) cancelAnimationFrame(frame);
  frame = null;
  particles = [];
  canvas?.remove();
  canvas = null;
  context = null;
}

function tick() {
  if (!canvas || !context) return;

  context.clearRect(0, 0, canvas.width, canvas.height);

  particles = particles.filter((p) => p.y < canvas!.height + 40);
  if (particles.length === 0) {
    teardown();
    return;
  }

  for (const p of particles) {
    p.vy += GRAVITY;
    p.vx *= DRAG;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.spin;

    context.save();
    context.translate(p.x, p.y);
    context.rotate(p.rotation);
    context.fillStyle = p.color;
    context.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
    context.restore();
  }

  frame = requestAnimationFrame(tick);
}

/** Fire a confetti burst from the lower third of the screen. Safe to call repeatedly. */
export function fireConfetti(particleCount = 90): void {
  if (typeof document === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = ensureCanvas();
  if (!ctx || !canvas) return;

  const originX = canvas.width / 2;
  const originY = canvas.height * 0.7;

  for (let i = 0; i < particleCount; i++) {
    // Launch upward in a fan; gravity brings everything back down past the viewport.
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
    const speed = 8 + Math.random() * 9;
    particles.push({
      x: originX + (Math.random() - 0.5) * 120,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.3,
      width: 6 + Math.random() * 6,
      height: 4 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    });
  }

  if (frame === null) frame = requestAnimationFrame(tick);
}
