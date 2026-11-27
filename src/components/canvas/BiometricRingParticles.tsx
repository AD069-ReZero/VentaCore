import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const BiometricRingParticles: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isHeadless =
      typeof navigator !== 'undefined' &&
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isHeadless,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isHeadless ? 1 : 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Create Dual-Ring / Biometric Fingerprint Particle Topology matching recording 00:36
    const count = isHeadless ? 800 : 3500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const acidGreen = new THREE.Color('#70FF5E');
    const midGreen = new THREE.Color('#38D048');
    const whiteHighlight = new THREE.Color('#FFFFFF');

    for (let i = 0; i < count; i++) {
      // Lemniscate / Figure-8 / Biometric Ring loop
      const t = Math.random() * Math.PI * 2;
      const scale = 2.2;
      const denom = 1 + Math.sin(t) * Math.sin(t);
      const x = (scale * Math.cos(t)) / denom + (Math.random() - 0.5) * 0.35;
      const y = (scale * Math.sin(t) * Math.cos(t)) / denom + (Math.random() - 0.5) * 0.35;
      const z = (Math.random() - 0.5) * 0.4;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const rnd = Math.random();
      const col = rnd > 0.9 ? whiteHighlight : rnd > 0.3 ? acidGreen : midGreen;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let reqId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      particles.rotation.z = elapsedTime * 0.12;
      particles.rotation.x = Math.sin(elapsedTime * 0.2) * 0.2;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-[220px] sm:h-[280px] flex items-center justify-center relative pointer-events-none"
    />
  );
};
