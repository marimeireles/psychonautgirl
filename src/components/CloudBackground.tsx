import { useEffect, useRef } from "react";

interface Cloud {
  x: number;
  y: number;
  size: number;
  speed: number;
}

const random = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const CloudBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    updateCanvasSize();

    const clouds: Cloud[] = [];
    for (let i = 0; i < 15; i++) {
      clouds.push({
        x: random(0, canvas.width),
        y: random(0, canvas.height * 0.6),
        size: random(40, 100),
        speed: random(0.1, 0.5), // Different speeds for variety
      });
    }

    const drawCloud = (cloud: Cloud) => {
      ctx.beginPath();
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
      ctx.arc(
        cloud.x + cloud.size * 0.5,
        cloud.y - cloud.size * 0.4,
        cloud.size * 0.7,
        0,
        Math.PI * 2
      );
      ctx.arc(cloud.x + cloud.size * 1.5, cloud.y, cloud.size, 0, Math.PI * 2);
      ctx.fill();
    };

    const updateCloud = (cloud: Cloud) => {
      cloud.x += cloud.speed;
      if (cloud.x - cloud.size > canvas.width) {
        cloud.x = -cloud.size * 2;
        cloud.y = random(0, canvas.height * 0.6);
      }
    };

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      clouds.forEach((cloud) => {
        drawCloud(cloud);
        updateCloud(cloud);
      });
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      updateCanvasSize();
      clouds.forEach((cloud) => {
        if (cloud.x > canvas.width) {
          cloud.x = random(0, canvas.width);
        }
        if (cloud.y > canvas.height) {
          cloud.y = random(0, canvas.height * 0.6);
        }
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ background: "linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%)" }}
    />
  );
};
