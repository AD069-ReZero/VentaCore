import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HeroParticlesProps {
  className?: string;
}

export const HeroParticles: React.FC<HeroParticlesProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isHeadless =
      typeof navigator !== 'undefined' &&
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050605, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(2, 0.5, 14);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isHeadless,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isHeadless ? 1 : 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Volumetric Brain / Neural Swarm Particle Cloud
    const particleCount = isHeadless ? 2000 : 12000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const acidGreen = new THREE.Color('#70FF5E');
    const cyberEmerald = new THREE.Color('#38D048');
    const deepMoss = new THREE.Color('#14421A');
    const causticHighlight = new THREE.Color('#E3FFE0');

    for (let i = 0; i < particleCount; i++) {
      // Dual-lobed organic brain / neural cloud manifold
      const lobe = Math.random() > 0.5 ? 1 : -1;
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);

      // Asymmetric brain hemisphere distribution
      const rBase = 3.6 + Math.sin(theta * 2) * 0.7 + Math.cos(phi * 3) * 0.5;
      const noise = (Math.random() - 0.5) * 1.4;
      const r = rBase + noise;

      let x = (r * Math.sin(phi) * Math.cos(theta)) * 1.1 + (lobe * 0.8);
      let y = (r * Math.sin(phi) * Math.sin(theta)) * 0.85 + Math.sin(x * 1.5) * 0.3;
      let z = (r * Math.cos(phi)) * 0.95;

      // Center offset slightly right to match recording composition
      x += 1.8;
      y += 0.4;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      // Color mapping: caustic highlights at top/center, deep moss at periphery, acid green in active lobes
      const distFromTop = (y + 4) / 8;
      const rnd = Math.random();

      let pColor = acidGreen;
      if (rnd < 0.35) {
        pColor = deepMoss;
      } else if (rnd < 0.8) {
        pColor = cyberEmerald;
      } else if (distFromTop > 0.6 && rnd > 0.92) {
        pColor = causticHighlight;
      }

      colors[i * 3] = pColor.r;
      colors[i * 3 + 1] = pColor.g;
      colors[i * 3 + 2] = pColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom Circular Point Texture with Soft Radial Glow
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.25, 'rgba(112,255,94,0.95)');
      grad.addColorStop(0.65, 'rgba(56,208,72,0.3)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      map: texture,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse Parallax Interaction
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (event: MouseEvent) => {
      targetMouseX = (event.clientX / window.innerWidth - 0.5) * 1.8;
      targetMouseY = (event.clientY / window.innerHeight - 0.5) * 1.2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Handle Window Resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      // Slow, majestic continuous rotation
      particles.rotation.y = elapsedTime * 0.08 + mouseX * 0.6;
      particles.rotation.x = Math.sin(elapsedTime * 0.05) * 0.1 + mouseY * 0.4;

      // Organic fluid ripple displacement across points
      const pos = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

        // Multi-frequency wave turbulence
        const wave =
          Math.sin(elapsedTime * 1.2 + ox * 0.7 + oz * 0.8) * 0.12 +
          Math.cos(elapsedTime * 0.9 + oy * 0.8) * 0.08;

        pos[i * 3] = ox * (1 + wave * 0.15);
        pos[i * 3 + 1] = oy * (1 + wave * 0.15);
        pos[i * 3 + 2] = oz * (1 + wave * 0.15);
      }
      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
};
