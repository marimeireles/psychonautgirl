import { useEffect, useRef } from 'react';

interface Bubble {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  opacity: number;
  phase: number;
  speed: number;
}

export const BubbleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Iridescent gradient color combinations
    const gradientPalettes = [
      [['#FFB6D9', '#D4A5FF'], ['#D4A5FF', '#A5D8FF'], ['#A5D8FF', '#FFE5A5'], ['#FFE5A5', '#FFB6D9'], ['#FFA5C7', '#D4A5FF']],
      [['#FF9CEE', '#C9A0FF'], ['#C9A0FF', '#A0E7FF'], ['#A0E7FF', '#FFD4A3'], ['#FFD4A3', '#FF94B3'], ['#FF94B3', '#FF9CEE']],
      [['#E5B8F4', '#C9E4FF'], ['#C9E4FF', '#FFE4B5'], ['#FFE4B5', '#FFB8E6'], ['#FFB8E6', '#D4B5FF'], ['#D4B5FF', '#E5B8F4']],
      [['#FFC4E1', '#E8B5FF'], ['#E8B5FF', '#B5E8FF'], ['#B5E8FF', '#FFEAA7'], ['#FFEAA7', '#FFB8D1'], ['#FFB8D1', '#FFC4E1']],
      [['#FFD1F0', '#E0C3FF'], ['#E0C3FF', '#C3E8FF'], ['#C3E8FF', '#FFF4C4'], ['#FFF4C4', '#FFD1E3'], ['#FFD1E3', '#FFD1F0']],
    ];

    const randomGradients = gradientPalettes[Math.floor(Math.random() * gradientPalettes.length)];

    const bubbles: Bubble[] = [];
    const bubbleCount = 40 + Math.floor(Math.random() * 30); // 40-70 bubbles for more coverage

    // Create bubbles with gradient colors
    for (let i = 0; i < bubbleCount; i++) {
      const gradientPair = randomGradients[Math.floor(Math.random() * randomGradients.length)];
      const speed = 0.3 + Math.random() * 1.2; // Variable speed for gas-like movement
      bubbles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 50 + Math.random() * 200, // 50-250px radius for bigger bubbles
        color: gradientPair[Math.floor(Math.random() * 2)], // pick one of the gradient colors
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        opacity: 0.4 + Math.random() * 0.5, // 0.4-0.9 opacity for more visibility
        phase: Math.random() * Math.PI * 2, // Random starting phase for sine wave
        speed: speed,
      });
    }

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      bubbles.forEach(bubble => {
        // Gas-like movement with sine waves for organic feel
        bubble.phase += 0.02;
        const waveX = Math.sin(bubble.phase) * 2;
        const waveY = Math.cos(bubble.phase * 0.7) * 2;

        // Update position with wave motion
        bubble.x += bubble.vx + waveX;
        bubble.y += bubble.vy + waveY;

        // Wrap around edges
        if (bubble.x < -bubble.radius) bubble.x = canvas.width + bubble.radius;
        if (bubble.x > canvas.width + bubble.radius) bubble.x = -bubble.radius;
        if (bubble.y < -bubble.radius) bubble.y = canvas.height + bubble.radius;
        if (bubble.y > canvas.height + bubble.radius) bubble.y = -bubble.radius;

        // Pulsing opacity for gas-like effect
        const pulseOpacity = bubble.opacity + Math.sin(time + bubble.phase) * 0.1;

        // Draw bubble with stronger blur effect (Safari-compatible)
        ctx.save();

        // Use a radial gradient for blur-like effect (Safari fallback)
        const gradient = ctx.createRadialGradient(
          bubble.x, bubble.y, 0,
          bubble.x, bubble.y, bubble.radius
        );

        // Parse the hex color and create gradient stops
        const opacity = Math.max(0.2, Math.min(0.9, pulseOpacity));
        gradient.addColorStop(0, bubble.color + Math.round(opacity * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(0.5, bubble.color + Math.round(opacity * 0.6 * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, bubble.color + '00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{
        opacity: 0.8,
        zIndex: 0
      }}
    />
  );
};
