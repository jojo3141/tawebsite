"use client";

import { useEffect, useRef } from "react";

export default function SnowflakeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    // Initial resize
    handleResize();
    window.addEventListener("resize", handleResize);

    const snowflakes: Snowflake[] = [];
    const numFlakes = 150;

    class Snowflake {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = Math.random() * 0.5 - 0.25; // Slight horizontal drift
        this.vy = Math.random() * 1.5 + 0.5; // Fall speed
        this.radius = Math.random() * 5 + 1;
        this.alpha = Math.random() * 0.5 + 0.2; // Random opacity
      }

      update(mouseX: number, mouseY: number) {
        this.y += this.vy;
        this.x += this.vx;

        // Mouse interaction: Repel
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200; // Interaction radius

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          const angle = Math.atan2(dy, dx);
          
          // Push away
          this.vx += Math.cos(angle) * force * 0.5;
          this.vy += Math.sin(angle) * force * 0.5;
        }

        // Apply friction to return to normal speed
        // Horizontal friction
        if (Math.abs(this.vx) > 0.5) {
             this.vx *= 0.95; 
        }

        // Vertical speed normalization (gravity-ish)
        const targetVy = 1 + (this.radius / 3); // Larger flakes fall faster
        this.vy += (targetVy - this.vy) * 0.05;

        // Reset if out of bounds
        if (this.y > height + 10) {
          this.y = -10;
          this.x = Math.random() * width;
          this.vx = Math.random() * 0.5 - 0.25;
        }
        if (this.x > width + 10) {
            this.x = -10;
        } else if (this.x < -10) {
            this.x = width + 10;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.font = `${this.radius * 12}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(200, 210, 250, ${this.alpha})`;
        ctx.fillText("❄", this.x, this.y);
      }
    }

    // Initialize flakes
    for (let i = 0; i < numFlakes; i++) {
      snowflakes.push(new Snowflake());
    }

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      snowflakes.forEach((f) => {
        f.update(mouseX, mouseY);
        f.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
}
