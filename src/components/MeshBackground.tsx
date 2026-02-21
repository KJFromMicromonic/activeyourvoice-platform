import { useEffect, useRef } from "react";

const MeshBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
    };
    resize();
    window.addEventListener("resize", resize);

    const blobs = [
      { x: 0.3, y: 0.25, r: 0.35, color: [120, 60, 220], speed: 0.0004 },
      { x: 0.7, y: 0.3, r: 0.3, color: [60, 100, 240], speed: 0.0006 },
      { x: 0.5, y: 0.7, r: 0.25, color: [100, 40, 200], speed: 0.0005 },
      { x: 0.2, y: 0.6, r: 0.2, color: [50, 80, 220], speed: 0.0003 },
    ];

    const draw = () => {
      t++;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "hsl(240, 25%, 3%)";
      ctx.fillRect(0, 0, w, h);

      for (const b of blobs) {
        const cx = (b.x + Math.sin(t * b.speed) * 0.08) * w;
        const cy = (b.y + Math.cos(t * b.speed * 1.3) * 0.06) * h;
        const r = b.r * Math.min(w, h);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, `rgba(${b.color.join(",")}, 0.18)`);
        grad.addColorStop(1, `rgba(${b.color.join(",")}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export default MeshBackground;
