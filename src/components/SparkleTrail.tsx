import { useEffect, useRef } from "react";

interface Sparkle {
  x: number;
  y: number;
  size: number;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
  color: string;
}

const colors = ["#FFD700", "#FFF8DC", "#FF69B4", "#87CEEB", "#FFFFFF", "#FFB6C1"];

export const SparkleTrail = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparklesRef = useRef<Sparkle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      for (let i = 0; i < 2; i++) {
        sparklesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 10,
          y: e.clientY + (Math.random() - 0.5) * 10,
          size: Math.random() * 3 + 1,
          life: 0,
          maxLife: Math.random() * 30 + 20,
          vx: (Math.random() - 0.5) * 1.5,
          vy: Math.random() * 1 + 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparklesRef.current = sparklesRef.current.filter((s) => s.life < s.maxLife);

      for (const s of sparklesRef.current) {
        s.life++;
        s.x += s.vx;
        s.y += s.vy;

        const alpha = 1 - s.life / s.maxLife;
        const size = s.size * alpha;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;

        // Draw a 4-point star
        ctx.beginPath();
        const spikes = 4;
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? size * 2 : size * 0.5;
          const angle = (i * Math.PI) / spikes - Math.PI / 2;
          const px = s.x + Math.cos(angle) * radius;
          const py = s.y + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", resize);
    animate();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
};
