/**
 * COMMODITY DERIVATIVES INTELLIGENCE — 3D FLOATING GOLD MARKET ENVIRONMENT
 * High-performance, lightweight 3D canvas engine creating an institutional
 * commodity market space with floating metallic gold orbs, constellation data mesh,
 * depth-of-field bokeh, and smooth interactive mouse parallax.
 */

(function() {
  'use strict';

  let canvas, ctx;
  let width = 0, height = 0;
  let dpr = 1;
  let animationFrameId = null;
  let isTabVisible = true;

  // Mouse & Parallax Coordinates with Inertia Smoothing
  const mouse = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    ease: 0.045
  };

  // Particle Collections
  let goldOrbs = [];       // Large 3D metallic spheres with realistic specular shading
  let goldDust = [];       // Hundreds of drifting gold particles
  let dataNodes = [];      // Distant quantitative coordinate points
  let foregroundBokeh = [];// Cinematic out-of-focus foreground orbs
  let ambientBlooms = [];  // Soft warm ambient background light centers

  // Configuration Constants
  const CONFIG = {
    fov: 380,
    numOrbs: 20,
    numDust: 190,
    numDataNodes: 35,
    numBokeh: 7,
    numBlooms: 3,
    connectDistance: 110,
    maxDepth: 900,
    minDepth: 20
  };

  // Initialize Canvas & Engine
  function init() {
    canvas = document.getElementById('goldMarketCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'goldMarketCanvas';
      canvas.className = 'gold-market-canvas';
      document.body.prepend(canvas);
    }
    ctx = canvas.getContext('2d', { alpha: true });

    resize();
    createScene();

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Initial mouse center
    mouse.x = 0;
    mouse.y = 0;
    mouse.targetX = 0;
    mouse.targetY = 0;

    startLoop();
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for performance

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);
  }

  let resizeTimeout;
  function onResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resize();
      createScene();
    }, 150);
  }

  function onMouseMove(e) {
    const halfW = width / 2;
    const halfH = height / 2;
    mouse.targetX = (e.clientX - halfW);
    mouse.targetY = (e.clientY - halfH);
  }

  function onTouchMove(e) {
    if (e.touches.length > 0) {
      const halfW = width / 2;
      const halfH = height / 2;
      mouse.targetX = (e.touches[0].clientX - halfW) * 0.6;
      mouse.targetY = (e.touches[0].clientY - halfH) * 0.6;
    }
  }

  function onVisibilityChange() {
    isTabVisible = !document.hidden;
    if (isTabVisible) {
      startLoop();
    } else {
      cancelAnimationFrame(animationFrameId);
    }
  }

  // Populate 3D Space Elements
  function createScene() {
    const spreadX = width * 1.3;
    const spreadY = height * 1.3;

    // 1. 3D Metallic Gold Spheres / Orbs
    goldOrbs = [];
    for (let i = 0; i < CONFIG.numOrbs; i++) {
      goldOrbs.push({
        x: (Math.random() - 0.5) * spreadX,
        y: (Math.random() - 0.5) * spreadY,
        z: Math.random() * (CONFIG.maxDepth - 100) + 80,
        radius: Math.random() * 11 + 6, // 6px to 17px
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22 - 0.08, // Slow upward drift
        vz: (Math.random() - 0.5) * 0.15,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: (Math.random() * 0.004 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
        orbitRadius: Math.random() * 35 + 15,
        shimmerOffset: Math.random() * Math.PI * 2,
        glowIntensity: Math.random() * 0.35 + 0.25,
        parallax: Math.random() * 0.04 + 0.03
      });
    }

    // 2. Floating Gold Dust & Market Particles
    goldDust = [];
    for (let i = 0; i < CONFIG.numDust; i++) {
      goldDust.push({
        x: (Math.random() - 0.5) * spreadX,
        y: (Math.random() - 0.5) * spreadY,
        z: Math.random() * (CONFIG.maxDepth - 50) + 50,
        baseRadius: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35 - 0.06,
        vz: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.55 + 0.25,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
        colorType: Math.random() > 0.3 ? 'gold' : (Math.random() > 0.5 ? 'amber' : 'champagne'),
        parallax: Math.random() * 0.025 + 0.015
      });
    }

    // 3. Distant Quantitative Data Nodes
    dataNodes = [];
    for (let i = 0; i < CONFIG.numDataNodes; i++) {
      dataNodes.push({
        x: (Math.random() - 0.5) * spreadX * 1.2,
        y: (Math.random() - 0.5) * spreadY * 1.2,
        z: Math.random() * 300 + 550, // Far back
        label: `MCX.${(Math.random() * 90 + 10).toFixed(1)}`,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        alpha: Math.random() * 0.28 + 0.12,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    // 4. Foreground Cinematic Bokeh Orbs (Out-of-focus blur)
    foregroundBokeh = [];
    for (let i = 0; i < CONFIG.numBokeh; i++) {
      foregroundBokeh.push({
        x: (Math.random() - 0.5) * width * 1.1,
        y: (Math.random() - 0.5) * height * 1.1,
        z: Math.random() * 60 + 20, // Near camera
        radius: Math.random() * 38 + 28,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15 - 0.05,
        alpha: Math.random() * 0.045 + 0.02,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    // 5. Volumetric Background Glow Blooms
    ambientBlooms = [
      { x: width * 0.2, y: height * 0.3, r: Math.min(width, height) * 0.45, alpha: 0.035 },
      { x: width * 0.8, y: height * 0.65, r: Math.min(width, height) * 0.5, alpha: 0.04 },
      { x: width * 0.5, y: height * 0.15, r: Math.min(width, height) * 0.35, alpha: 0.025 }
    ];
  }

  // Main Render Loop
  let lastTime = 0;
  function render(time) {
    if (!lastTime) lastTime = time;
    const delta = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    // Smooth Mouse Coordinates with Inertia
    mouse.x += (mouse.targetX - mouse.x) * mouse.ease;
    mouse.y += (mouse.targetY - mouse.y) * mouse.ease;

    // Clear Canvas with Dark Atmospheric Deep Space Gradient
    ctx.clearRect(0, 0, width, height);

    // Deep Charcoal Backdrop with Vignette
    const bgGrad = ctx.createRadialGradient(
      width / 2 + mouse.x * 0.02, 
      height / 2 + mouse.y * 0.02, 
      width * 0.1,
      width / 2, 
      height / 2, 
      Math.max(width, height) * 0.85
    );
    bgGrad.addColorStop(0, '#0a0d13');
    bgGrad.addColorStop(0.55, '#06080c');
    bgGrad.addColorStop(1, '#020305');

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Draw Ambient Volumetric Golden Blooms
    renderAmbientBlooms(time);

    // Project and Render Distant Data Nodes
    renderDataNodes(time);

    // Update and Render 3D Constellation Mesh Connections
    renderConstellationMesh();

    // Update and Render Drifting Gold Dust Particles
    renderGoldDust(time);

    // Update and Render 3D Metallic Gold Spheres with Specular Phong Highlights
    renderGoldOrbs(time);

    // Render Cinematic Foreground Out-of-Focus Bokeh
    renderForegroundBokeh(time);

    animationFrameId = requestAnimationFrame(render);
  }

  function startLoop() {
    cancelAnimationFrame(animationFrameId);
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(render);
  }

  // 1. Ambient Golden Blooms
  function renderAmbientBlooms(time) {
    ctx.save();
    for (let i = 0; i < ambientBlooms.length; i++) {
      const b = ambientBlooms[i];
      const pulse = Math.sin(time * 0.001 + i) * 0.008;
      const curAlpha = Math.max(0, b.alpha + pulse);

      const grad = ctx.createRadialGradient(
        b.x + mouse.x * 0.015, 
        b.y + mouse.y * 0.015, 
        0, 
        b.x, 
        b.y, 
        b.r
      );
      grad.addColorStop(0, `rgba(217, 119, 6, ${curAlpha})`);
      grad.addColorStop(0.4, `rgba(180, 83, 9, ${curAlpha * 0.5})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 2. Distant Quantitative Coordinate Nodes
  function renderDataNodes(time) {
    ctx.save();
    const halfW = width / 2;
    const halfH = height / 2;
    const fov = CONFIG.fov;

    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    for (let i = 0; i < dataNodes.length; i++) {
      const d = dataNodes[i];
      d.x += d.vx;
      d.y += d.vy;

      // Wrap bounds
      const spanX = width * 0.7;
      const spanY = height * 0.7;
      if (d.x > spanX) d.x = -spanX;
      if (d.x < -spanX) d.x = spanX;
      if (d.y > spanY) d.y = -spanY;
      if (d.y < -spanY) d.y = spanY;

      const scale = fov / (fov + d.z);
      const px = halfW + (d.x + mouse.x * 0.01) * scale;
      const py = halfH + (d.y + mouse.y * 0.01) * scale;

      const pulse = Math.sin(time * 0.0015 + d.pulseOffset) * 0.08 + 0.92;
      const alpha = d.alpha * pulse;

      // Micro crosshair '+'
      ctx.strokeStyle = `rgba(217, 119, 6, ${alpha * 0.6})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px - 3, py);
      ctx.lineTo(px + 3, py);
      ctx.moveTo(px, py - 3);
      ctx.lineTo(px, py + 3);
      ctx.stroke();

      // Coordinate text
      ctx.fillStyle = `rgba(148, 163, 184, ${alpha * 0.4})`;
      ctx.fillText(d.label, px, py + 12);
    }
    ctx.restore();
  }

  // 3. 3D Constellation Mesh Connections
  function renderConstellationMesh() {
    ctx.save();
    const halfW = width / 2;
    const halfH = height / 2;
    const fov = CONFIG.fov;
    const maxDist = CONFIG.connectDistance;

    // Connect close midground dust and orbs
    const nodes = [];
    for (let i = 0; i < goldDust.length; i += 3) {
      if (goldDust[i].z < 500) nodes.push(goldDust[i]);
    }
    for (let i = 0; i < goldOrbs.length; i++) {
      nodes.push(goldOrbs[i]);
    }

    ctx.lineWidth = 0.8;
    for (let i = 0; i < nodes.length; i++) {
      const p1 = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const p2 = nodes[j];

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = p1.z - p2.z;
        const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist3D < maxDist) {
          const s1 = fov / (fov + p1.z);
          const px1 = halfW + (p1.x + mouse.x * (p1.parallax || 0.02)) * s1;
          const py1 = halfH + (p1.y + mouse.y * (p1.parallax || 0.02)) * s1;

          const s2 = fov / (fov + p2.z);
          const px2 = halfW + (p2.x + mouse.x * (p2.parallax || 0.02)) * s2;
          const py2 = halfH + (p2.y + mouse.y * (p2.parallax || 0.02)) * s2;

          const alpha = (1 - dist3D / maxDist) * 0.16;
          ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(px1, py1);
          ctx.lineTo(px2, py2);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  // 4. Drifting Gold Dust Particles
  function renderGoldDust(time) {
    ctx.save();
    const halfW = width / 2;
    const halfH = height / 2;
    const fov = CONFIG.fov;
    const spanX = width * 0.75;
    const spanY = height * 0.75;

    for (let i = 0; i < goldDust.length; i++) {
      const p = goldDust[i];

      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;

      // Wrap boundaries
      if (p.x > spanX) p.x = -spanX;
      if (p.x < -spanX) p.x = spanX;
      if (p.y > spanY) p.y = -spanY;
      if (p.y < -spanY) p.y = spanY;
      if (p.z > CONFIG.maxDepth) p.z = CONFIG.minDepth + 10;
      if (p.z < CONFIG.minDepth) p.z = CONFIG.maxDepth - 10;

      const scale = fov / (fov + p.z);
      const px = halfW + (p.x + mouse.x * p.parallax) * scale;
      const py = halfH + (p.y + mouse.y * p.parallax) * scale;
      const radius = Math.max(0.6, p.baseRadius * scale);

      const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.25 + 0.75;
      const alpha = p.alpha * pulse * Math.min(1, scale * 1.4);

      let colorCenter = `rgba(255, 243, 176, ${alpha})`;
      let colorEdge = `rgba(245, 158, 11, ${alpha * 0.3})`;
      if (p.colorType === 'amber') {
        colorCenter = `rgba(245, 158, 11, ${alpha})`;
        colorEdge = `rgba(180, 83, 9, ${alpha * 0.3})`;
      } else if (p.colorType === 'champagne') {
        colorCenter = `rgba(254, 240, 138, ${alpha})`;
        colorEdge = `rgba(217, 119, 6, ${alpha * 0.25})`;
      }

      const grad = ctx.createRadialGradient(px, py, 0, px, py, radius * 2);
      grad.addColorStop(0, colorCenter);
      grad.addColorStop(0.6, colorEdge);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, radius * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 5. 3D Metallic Gold Spheres / Orbs with Realistic Reflections
  function renderGoldOrbs(time) {
    ctx.save();
    const halfW = width / 2;
    const halfH = height / 2;
    const fov = CONFIG.fov;
    const spanX = width * 0.75;
    const spanY = height * 0.75;

    // Sort orbs by depth (Z-buffer back to front)
    goldOrbs.sort((a, b) => b.z - a.z);

    for (let i = 0; i < goldOrbs.length; i++) {
      const orb = goldOrbs[i];

      // Orbital oscillation + linear drift
      orb.orbitAngle += orb.orbitSpeed;
      orb.x += orb.vx + Math.cos(orb.orbitAngle) * 0.25;
      orb.y += orb.vy + Math.sin(orb.orbitAngle) * 0.2;
      orb.z += orb.vz;

      // Wrap boundaries
      if (orb.x > spanX) orb.x = -spanX;
      if (orb.x < -spanX) orb.x = spanX;
      if (orb.y > spanY) orb.y = -spanY;
      if (orb.y < -spanY) orb.y = spanY;
      if (orb.z > CONFIG.maxDepth) orb.z = 100;
      if (orb.z < 60) orb.z = CONFIG.maxDepth - 50;

      const scale = fov / (fov + orb.z);
      const px = halfW + (orb.x + mouse.x * orb.parallax) * scale;
      const py = halfH + (orb.y + mouse.y * orb.parallax) * scale;
      const r = Math.max(2, orb.radius * scale);

      // Depth-based alpha
      const depthAlpha = Math.min(1, Math.max(0.4, scale * 1.5));
      const shimmer = Math.sin(time * 0.002 + orb.shimmerOffset) * 0.15 + 0.85;

      // Outer Atmospheric Glow
      const glowGrad = ctx.createRadialGradient(px, py, r * 0.8, px, py, r * 2.6);
      glowGrad.addColorStop(0, `rgba(245, 158, 11, ${0.18 * depthAlpha * shimmer})`);
      glowGrad.addColorStop(0.6, `rgba(217, 119, 6, ${0.06 * depthAlpha})`);
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(px, py, r * 2.6, 0, Math.PI * 2);
      ctx.fill();

      // 3D Spherical Metallic Gold Shader (Off-Center Specular Flare)
      const lightOffsetX = -r * 0.35;
      const lightOffsetY = -r * 0.35;
      const orbGrad = ctx.createRadialGradient(
        px + lightOffsetX, 
        py + lightOffsetY, 
        r * 0.05, 
        px, 
        py, 
        r
      );
      
      // Multi-layer metallic gold reflection gradient
      orbGrad.addColorStop(0, `rgba(255, 250, 214, ${0.98 * depthAlpha})`); // High-intensity glint
      orbGrad.addColorStop(0.18, `rgba(253, 224, 71, ${0.92 * depthAlpha})`); // Lustrous 24K Yellow Gold
      orbGrad.addColorStop(0.45, `rgba(245, 158, 11, ${0.88 * depthAlpha})`); // Warm Amber Gold
      orbGrad.addColorStop(0.78, `rgba(180, 83, 9, ${0.82 * depthAlpha})`);  // Rich Bronze Shadow
      orbGrad.addColorStop(0.96, `rgba(120, 53, 15, ${0.75 * depthAlpha})`); // Deep Contour Rim
      orbGrad.addColorStop(1.0, `rgba(69, 26, 3, ${0.65 * depthAlpha})`);   // Dark Ambient Occlusion

      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();

      // Subtle metallic highlight crescent
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.28 * depthAlpha * shimmer})`;
      ctx.lineWidth = Math.max(0.6, r * 0.08);
      ctx.beginPath();
      ctx.arc(px, py, r * 0.88, Math.PI * 1.1, Math.PI * 1.65);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 6. Foreground Cinematic Out-of-Focus Bokeh Orbs
  function renderForegroundBokeh(time) {
    ctx.save();
    const halfW = width / 2;
    const halfH = height / 2;
    const fov = CONFIG.fov;

    for (let i = 0; i < foregroundBokeh.length; i++) {
      const b = foregroundBokeh[i];
      b.x += b.vx;
      b.y += b.vy;

      const spanX = width * 0.7;
      const spanY = height * 0.7;
      if (b.x > spanX) b.x = -spanX;
      if (b.x < -spanX) b.x = spanX;
      if (b.y > spanY) b.y = -spanY;
      if (b.y < -spanY) b.y = spanY;

      const scale = fov / (fov + b.z);
      const px = halfW + (b.x + mouse.x * 0.065) * scale;
      const py = halfH + (b.y + mouse.y * 0.065) * scale;
      const r = b.radius * scale;

      const pulse = Math.sin(time * 0.001 + b.pulseOffset) * 0.008 + b.alpha;

      const grad = ctx.createRadialGradient(px, py, 0, px, py, r);
      grad.addColorStop(0, `rgba(254, 240, 138, ${pulse * 1.5})`);
      grad.addColorStop(0.35, `rgba(245, 158, 11, ${pulse})`);
      grad.addColorStop(0.75, `rgba(180, 83, 9, ${pulse * 0.4})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Boot on DOM Ready or Immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
