'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './ConstellationField.module.css';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  alpha: number;
  phase: number;
  isAccent: boolean;
}

interface ConstellationFieldProps {
  /**
   * Density multiplier (default: 0.65)
   */
  density?: number;
  /**
   * Animation speed multiplier (default: 0.35)
   */
  speed?: number;
  /**
   * Connection max distance length multiplier (default: 0.8)
   */
  length?: number;
}

export const ConstellationField: React.FC<ConstellationFieldProps> = ({
  density = 0.65,
  speed = 0.35,
  length = 0.8,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false };

    // Dark muted gold & architectural grey palettes
    // Hue: 42 (Warm muted gold), Saturation: 70%, Lightness: 65%
    const GOLD_ACCENT = 'rgba(212, 168, 83, ';
    const MONO_PRIMARY = 'rgba(244, 244, 247, ';
    const MONO_MUTED = 'rgba(157, 157, 166, ';

    const initNodes = (w: number, h: number) => {
      // Calculate node count based on area and density
      const baseArea = 1440 * 900;
      const currentArea = w * h;
      const baseCount = Math.floor((currentArea / baseArea) * 75 * density);
      const count = Math.max(30, Math.min(100, baseCount));

      const newNodes: Node[] = [];
      for (let i = 0; i < count; i++) {
        // Bias node distribution slightly toward the right and middle-bottom for optimal visual hierarchy
        const randX = Math.random();
        const x = randX * w;
        const y = Math.random() * h;

        // Roughly 22% of nodes have the subtle warm gold architectural accent
        const isAccent = Math.random() < 0.22;
        const baseRadius = isAccent ? 1.8 + Math.random() * 1.4 : 1.0 + Math.random() * 1.2;
        const alpha = isAccent ? 0.65 + Math.random() * 0.3 : 0.35 + Math.random() * 0.4;
        const color = isAccent ? GOLD_ACCENT : (Math.random() < 0.5 ? MONO_PRIMARY : MONO_MUTED);

        const angle = Math.random() * Math.PI * 2;
        const velocity = (0.2 + Math.random() * 0.4) * speed;

        newNodes.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          radius: baseRadius,
          baseRadius,
          color,
          alpha,
          phase: Math.random() * Math.PI * 2,
          isAccent,
        });
      }
      return newNodes;
    };

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      nodes = initNodes(width, height);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
      mouse.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;
    const maxDistance = 175 * length;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation with soft damping
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // 1. Draw Network Connections
      const nodeCount = nodes.length;
      for (let i = 0; i < nodeCount; i++) {
        const nodeA = nodes[i];
        for (let j = i + 1; j < nodeCount; j++) {
          const nodeB = nodes[j];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const proximityFactor = 1 - dist / maxDistance;
            // Line opacity based on distance and node types (moderately enhanced visibility)
            const hasGold = nodeA.isAccent || nodeB.isAccent;
            const baseAlpha = hasGold ? 0.42 : 0.26;
            const lineAlpha = proximityFactor * baseAlpha;

            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.strokeStyle = hasGold 
              ? `${GOLD_ACCENT}${lineAlpha})` 
              : `rgba(157, 157, 166, ${lineAlpha})`;
            ctx.lineWidth = hasGold ? 0.85 : 0.65;
            ctx.stroke();
          }
        }
      }

      // 2. Update and Draw Nodes
      for (let i = 0; i < nodeCount; i++) {
        const node = nodes[i];

        if (!isReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;

          // Gentle edge bounce / wrap
          if (node.x < -20) node.x = width + 20;
          if (node.x > width + 20) node.x = -20;
          if (node.y < -20) node.y = height + 20;
          if (node.y > height + 20) node.y = -20;

          // Subtle pointer repulsion
          if (mouse.active) {
            const mdx = node.x - mouse.x;
            const mdy = node.y - mouse.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            const repelRadius = 120;
            if (mdist < repelRadius && mdist > 0) {
              const force = (1 - mdist / repelRadius) * 1.5;
              node.x += (mdx / mdist) * force;
              node.y += (mdy / mdist) * force;
            }
          }
        }

        // Soft pulsing glow on accent nodes
        const pulse = Math.sin(time * 1.2 + node.phase) * 0.3;
        const currentAlpha = Math.max(0.1, Math.min(1, node.alpha + pulse * 0.2));

        // Node Outer Halo
        if (node.isAccent) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 3.2, 0, Math.PI * 2);
          ctx.fillStyle = `${GOLD_ACCENT}${currentAlpha * 0.12})`;
          ctx.fill();
        }

        // Node Solid Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}${currentAlpha})`;
        ctx.fill();
      }

      if (!isReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      mediaQuery.removeEventListener('change', handleMotionChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [density, isReducedMotion, length, speed]);

  return (
    <div className={styles.container} ref={containerRef} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
};
