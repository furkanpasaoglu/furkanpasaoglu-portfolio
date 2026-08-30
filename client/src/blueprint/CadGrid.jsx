import { useEffect, useRef } from 'react';

/**
 * The drawing sheet the whole page sits on: a fine engineering grid that
 * bends locally around the pointer, like a lens laid on a drafting sheet.
 *
 * Kept deliberately quiet — hairline weight, no pulse, no colour. The grid
 * is the ground, not the subject; the dependency graph is the subject.
 *
 * Cost control: the unwarped grid is rendered once to an offscreen canvas
 * and blitted each frame. Only the disc around the pointer is recomputed,
 * and the loop stops entirely once the warp has settled back to zero.
 */

const SPACING = 34;      // fine grid, px
const MAJOR_EVERY = 4;   // every 4th line is a major rule
const RADIUS = 230;      // warp influence, px
const PUSH = 34;         // max displacement at the pointer, px

export default function CadGrid() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return undefined;

    const styles = getComputedStyle(canvas);
    const read = (name, fallback) =>
      styles.getPropertyValue(name).trim() || fallback;

    const VOID = read('--bp-void', '#0a0b0d');
    const FINE = read('--bp-line', '#1c2026');
    const MAJOR = read('--bp-line-hi', '#262c35');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const interactive = !reduced && !coarse;

    const still = document.createElement('canvas');
    const stillCtx = still.getContext('2d');

    let dpr = 1;
    let w = 0;
    let h = 0;
    let raf = 0;
    let strength = 0;          // 0 → 1, eases in on enter and out on leave
    let target = 0;
    const pointer = { x: -9999, y: -9999 };

    /** Draw the undistorted grid once; every frame starts from this. */
    function paintStill() {
      still.width = Math.max(1, Math.round(w * dpr));
      still.height = Math.max(1, Math.round(h * dpr));
      stillCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stillCtx.fillStyle = VOID;
      stillCtx.fillRect(0, 0, w, h);

      const fine = new Path2D();
      const major = new Path2D();

      for (let x = 0, i = 0; x <= w + SPACING; x += SPACING, i += 1) {
        const px = Math.round(x) + 0.5;
        const path = i % MAJOR_EVERY === 0 ? major : fine;
        path.moveTo(px, 0);
        path.lineTo(px, h);
      }
      for (let y = 0, j = 0; y <= h + SPACING; y += SPACING, j += 1) {
        const py = Math.round(y) + 0.5;
        const path = j % MAJOR_EVERY === 0 ? major : fine;
        path.moveTo(0, py);
        path.lineTo(w, py);
      }

      stillCtx.lineWidth = 1;
      stillCtx.strokeStyle = FINE;
      stillCtx.stroke(fine);
      stillCtx.strokeStyle = MAJOR;
      stillCtx.stroke(major);
    }

    /** Displace a grid point away from the pointer with a quadratic falloff. */
    function warp(x, y) {
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const d = Math.hypot(dx, dy);
      if (d >= RADIUS || d < 0.001) return [x, y];
      const f = (1 - d / RADIUS) ** 2 * strength;
      const push = PUSH * f;
      return [x + (dx / d) * push, y + (dy / d) * push];
    }

    function frame() {
      raf = 0;
      strength += (target - strength) * 0.12;
      if (strength < 0.004 && target === 0) strength = 0;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.drawImage(still, 0, 0, w, h);

      if (strength > 0.004) {
        // Clear only the affected disc, then redraw it distorted.
        ctx.save();
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, RADIUS, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = VOID;
        ctx.fillRect(pointer.x - RADIUS, pointer.y - RADIUS, RADIUS * 2, RADIUS * 2);

        const i0 = Math.floor((pointer.x - RADIUS) / SPACING) - 1;
        const i1 = Math.ceil((pointer.x + RADIUS) / SPACING) + 1;
        const j0 = Math.floor((pointer.y - RADIUS) / SPACING) - 1;
        const j1 = Math.ceil((pointer.y + RADIUS) / SPACING) + 1;

        const fine = new Path2D();
        const major = new Path2D();

        for (let i = i0; i <= i1; i += 1) {
          for (let j = j0; j <= j1; j += 1) {
            const [ax, ay] = warp(i * SPACING, j * SPACING);
            const [bx, by] = warp((i + 1) * SPACING, j * SPACING);
            const [cx, cy] = warp(i * SPACING, (j + 1) * SPACING);

            const hPath = j % MAJOR_EVERY === 0 ? major : fine;
            hPath.moveTo(ax, ay);
            hPath.lineTo(bx, by);

            const vPath = i % MAJOR_EVERY === 0 ? major : fine;
            vPath.moveTo(ax, ay);
            vPath.lineTo(cx, cy);
          }
        }

        ctx.lineWidth = 1;
        ctx.strokeStyle = FINE;
        ctx.stroke(fine);
        ctx.strokeStyle = MAJOR;
        ctx.stroke(major);
        ctx.restore();
      }

      if (strength > 0.004 || target > 0) schedule();
    }

    function schedule() {
      if (!raf) raf = window.requestAnimationFrame(frame);
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      paintStill();
      schedule();
    }

    function onMove(e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      target = 1;
      schedule();
    }

    function onLeave() {
      target = 0;
      schedule();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    if (interactive) {
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerleave', onLeave, { passive: true });
      window.addEventListener('blur', onLeave);
    }

    return () => {
      ro.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="bp-grid" aria-hidden="true" />;
}
