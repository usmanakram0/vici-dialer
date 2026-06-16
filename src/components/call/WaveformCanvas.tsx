"use client";

import { useEffect, useRef } from "react";

interface WaveformCanvasProps {
  isActive: boolean;
  className?: string;
}

export function WaveformCanvas({ isActive, className }: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };

    resize();

    let frame = 0;

    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      ctx.clearRect(0, 0, width, height);

      if (!isActive) {
        ctx.strokeStyle = "rgba(156, 163, 184, 0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        return;
      }

      const bars = 32;
      const barWidth = width / bars - 2;

      for (let i = 0; i < bars; i++) {
        const amplitude = Math.sin(frame * 0.05 + i * 0.4) * 0.5 + 0.5;
        const barHeight = amplitude * (height * 0.7) * (Math.random() * 0.3 + 0.7);
        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, "rgba(103, 80, 164, 0.8)");
        gradient.addColorStop(1, "rgba(76, 175, 80, 0.8)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      frame++;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "48px" }}
    />
  );
}
