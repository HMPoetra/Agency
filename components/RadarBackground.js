"use client";

import { useEffect, useRef } from "react";

const GRID = 48;

export default function RadarBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let angle = 0;
    let running = false;
    let w = 0;
    let h = 0;
    let maxRadius = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      maxRadius = Math.min(w, h) * 0.42;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      // setTransform, not scale: scale() compounds on every resize
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(0);
    };

    const draw = (sweepAlpha) => {
      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(185,28,28,0.06)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = 0; x <= w; x += GRID) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y <= h; y += GRID) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      ctx.beginPath();
      for (let i = 1; i <= 3; i++) {
        ctx.arc(cx, cy, (maxRadius / 3) * i, 0, Math.PI * 2);
      }
      ctx.moveTo(cx - maxRadius, cy);
      ctx.lineTo(cx + maxRadius, cy);
      ctx.moveTo(cx, cy - maxRadius);
      ctx.lineTo(cx, cy + maxRadius);
      ctx.strokeStyle = "rgba(185,28,28,0.1)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      if (sweepAlpha > 0) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        const cone = ctx.createConicGradient(0, 0, 0);
        cone.addColorStop(0, `rgba(229,51,51,${0.1 * sweepAlpha})`);
        cone.addColorStop(0.14, "rgba(229,51,51,0)");
        cone.addColorStop(1, "rgba(229,51,51,0)");
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, maxRadius, 0, Math.PI * 0.14);
        ctx.closePath();
        ctx.fillStyle = cone;
        ctx.fill();

        const beam = ctx.createLinearGradient(0, 0, maxRadius, 0);
        beam.addColorStop(0, `rgba(229,51,51,${0.55 * sweepAlpha})`);
        beam.addColorStop(1, "rgba(229,51,51,0)");
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(maxRadius, 0);
        ctx.strokeStyle = beam;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      const t = performance.now() * 0.0004;
      for (let i = 0; i < 4; i++) {
        const a = (i * 1.57 + t) % (Math.PI * 2);
        const r = maxRadius * (0.35 + i * 0.18);
        ctx.beginPath();
        ctx.arc(
          cx + Math.cos(a) * r,
          cy + Math.sin(a) * r,
          1.8,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = `rgba(229,51,51,${0.2 + Math.sin(t * 3 + i) * 0.12})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(185,28,28,0.75)";
      ctx.fill();
    };

    const loop = () => {
      angle += 0.008;
      draw(1);
      frame = requestAnimationFrame(loop);
    };

    const sync = () => {
      const visible = canvas.offsetParent !== null;
      const want = visible && !reduced.matches;
      if (want === running) return;
      running = want;
      cancelAnimationFrame(frame);
      if (want) frame = requestAnimationFrame(loop);
      else resize();
    };

    resize();
    sync();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(sync);
    io.observe(canvas);
    reduced.addEventListener("change", sync);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      reduced.removeEventListener("change", sync);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
