'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './FoundryField.module.css';

interface NodePoint {
  id: string;
  stageNumber: string;
  labelEn: string;
  labelId: string;
  sublabelEn: string;
  sublabelId: string;
  baseX: number;
  baseY: number;
  phase: number;
  speed: number;
  radius: number;
  type: 'idea' | 'lab' | 'project' | 'product' | 'commercial';
}

const STAGE_NODES: NodePoint[] = [
  { id: 'idea', stageNumber: '01', labelEn: 'Idea', labelId: 'Gagasan', sublabelEn: 'Concept', sublabelId: 'Konsep', baseX: 0.16, baseY: 0.70, phase: 0.0, speed: 0.5, radius: 3.5, type: 'idea' },
  { id: 'lab', stageNumber: '02', labelEn: 'Lab', labelId: 'Lab', sublabelEn: 'Prototype', sublabelId: 'Prototipe', baseX: 0.35, baseY: 0.34, phase: 1.2, speed: 0.65, radius: 4.0, type: 'lab' },
  { id: 'project', stageNumber: '03', labelEn: 'Project', labelId: 'Proyek', sublabelEn: 'Active System', sublabelId: 'Sistem Aktif', baseX: 0.54, baseY: 0.64, phase: 2.5, speed: 0.45, radius: 4.5, type: 'project' },
  { id: 'product', stageNumber: '04', labelEn: 'Product', labelId: 'Produk', sublabelEn: 'Public Utility', sublabelId: 'Siap Pakai', baseX: 0.72, baseY: 0.30, phase: 3.8, speed: 0.6, radius: 5.0, type: 'product' },
  { id: 'commercial', stageNumber: '05', labelEn: 'Commercial', labelId: 'Komersial', sublabelEn: 'Offering', sublabelId: 'Layanan', baseX: 0.88, baseY: 0.56, phase: 5.0, speed: 0.35, radius: 5.5, type: 'commercial' }
];

export const FoundryField: React.FC = () => {
  const { language, t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
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
    let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false };
    let time = 0;

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

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    const render = () => {
      time += 0.005; // Calmed, gentle ambient motion
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation with soft damping
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      // 1. Draw Architectural Metric Grid
      const gridStep = 44;
      ctx.strokeStyle = 'rgba(46, 46, 56, 0.35)';
      ctx.lineWidth = 0.5;

      for (let x = 0; x < width; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        // Subtle structural corner crosshairs
        for (let y = 0; y < height; y += gridStep) {
          if (x % (gridStep * 2) === 0 && y % (gridStep * 2) === 0) {
            ctx.strokeStyle = 'rgba(110, 110, 120, 0.3)';
            ctx.beginPath();
            ctx.moveTo(x - 2, y);
            ctx.lineTo(x + 2, y);
            ctx.moveTo(x, y - 2);
            ctx.lineTo(x, y + 2);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(46, 46, 56, 0.35)';
          }
        }
      }

      for (let y = 0; y < height; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Compute Node Positions with Gentle Physical Oscillation & Pointer Deflection
      const currentNodes = STAGE_NODES.map((node) => {
        const floatX = Math.sin(time * node.speed + node.phase) * 6;
        const floatY = Math.cos(time * node.speed * 0.75 + node.phase) * 5;
        let x = node.baseX * width + floatX;
        let y = node.baseY * height + floatY;

        // Gentle pointer deflection (subtle tactile feedback)
        if (mouse.active) {
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 100;
          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * 12;
            x += (dx / dist) * force;
            y += (dy / dist) * force;
          }
        }

        return { ...node, x, y };
      });

      // 3. Draw Connecting Structural Vectors (Ecosystem Progression Spine)
      ctx.beginPath();
      ctx.moveTo(currentNodes[0].x, currentNodes[0].y);
      for (let i = 1; i < currentNodes.length; i++) {
        const prev = currentNodes[i - 1];
        const curr = currentNodes[i];
        const cpX = (prev.x + curr.x) / 2;
        const cpY = (prev.y + curr.y) / 2 + Math.sin(time + i) * 3;
        ctx.quadraticCurveTo(cpX, cpY, curr.x, curr.y);
      }
      ctx.strokeStyle = 'rgba(157, 157, 166, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. Draw Individual Geometric Nodes & Clear Editorial Notations
      currentNodes.forEach((node) => {
        // Subtle boundary ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 2.2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(69, 69, 83, 0.4)';
        ctx.lineWidth = 0.75;
        ctx.stroke();

        // Node center mark
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        if (node.type === 'commercial') {
          ctx.fillStyle = '#c084fc';
        } else if (node.type === 'product') {
          ctx.fillStyle = '#34d399';
        } else if (node.type === 'project') {
          ctx.fillStyle = '#38bdf8';
        } else if (node.type === 'lab') {
          ctx.fillStyle = '#fbbf24';
        } else {
          ctx.fillStyle = '#f4f4f7';
        }
        ctx.fill();

        // Minimal center reticle
        const reticleSize = 3.5;
        ctx.strokeStyle = 'rgba(157, 157, 166, 0.6)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(node.x - reticleSize, node.y);
        ctx.lineTo(node.x + reticleSize, node.y);
        ctx.moveTo(node.x, node.y - reticleSize);
        ctx.lineTo(node.x, node.y + reticleSize);
        ctx.stroke();

        const nodeLabel = language === 'id' ? node.labelId : node.labelEn;
        const nodeSublabel = language === 'id' ? node.sublabelId : node.sublabelEn;

        // Stage Title Notation (e.g. 01 Idea / 01 Gagasan)
        ctx.font = '600 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = 'rgba(244, 244, 247, 0.92)';
        ctx.fillText(`${node.stageNumber} ${nodeLabel}`, node.x + 10, node.y - 4);

        // Stage Purpose Sublabel (e.g. Concept / Konsep)
        ctx.font = '400 8px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.fillStyle = 'rgba(157, 157, 166, 0.75)';
        ctx.fillText(nodeSublabel, node.x + 10, node.y + 7);
      });

      if (!isReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      mediaQuery.removeEventListener('change', handleMotionChange);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [isReducedMotion, language]);

  return (
    <div className={styles.wrapper} ref={containerRef} aria-label={t.foundryField.ariaLabel}>
      <div className={styles.headerBar}>
        <div className={styles.headerLeft}>
          <span className={styles.headerLabel}>{t.foundryField.fieldTag}</span>
        </div>
        <div className={styles.headerRight}>
          <span>{t.foundryField.stagesTag}</span>
        </div>
      </div>

      <div className={styles.canvasContainer}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>

      <div className={styles.footerBar}>
        <span>EVOLUTIONARY FRAMEWORK</span>
        <span>NALAKARA · 2026</span>
      </div>
    </div>
  );
};
