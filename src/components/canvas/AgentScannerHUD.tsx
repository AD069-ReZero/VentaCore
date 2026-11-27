import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const AgentScannerHUD: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isHeadless =
      typeof navigator !== 'undefined' &&
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isHeadless,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isHeadless ? 1 : 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Create 3D Wireframe / Point Face & Neural Cranium Mesh
    const headGroup = new THREE.Group();
    scene.add(headGroup);

    // Outer wireframe head geometry
    const headGeo = new THREE.IcosahedronGeometry(2.4, isHeadless ? 2 : 4);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x70ff5e,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const headMesh = new THREE.Mesh(headGeo, wireMat);
    headGroup.add(headMesh);

    // Inner glowing particle nodes (biometric agent feature points)
    const count = isHeadless ? 400 : 1200;
    const pGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const acidGreen = new THREE.Color('#70FF5E');
    const sparkColor = new THREE.Color('#FFFFFF');

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.3 + (Math.random() - 0.5) * 0.4;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const isSpark = Math.random() > 0.9;
      const col = isSpark ? sparkColor : acidGreen;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const pPoints = new THREE.Points(pGeo, pMat);
    headGroup.add(pPoints);

    // Animation Loop
    let reqId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      headGroup.rotation.y = Math.sin(t * 0.4) * 0.25;
      headGroup.rotation.x = Math.cos(t * 0.3) * 0.12;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      headGeo.dispose();
      wireMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-[320px] sm:h-[400px] flex items-center justify-center relative overflow-hidden"
    />
  );
};
