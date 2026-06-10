import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Builds an 8-pointed (or n-pointed) extruded star from THREE.Shape
function makeStarGeometry(
  outerRadius: number,
  innerRadius: number,
  points = 8,
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const total = points * 2;
  const step  = (Math.PI * 2) / total;

  for (let i = 0; i < total; i++) {
    const angle = i * step - Math.PI / 2;
    const r     = i % 2 === 0 ? outerRadius : innerRadius;
    const x     = Math.cos(angle) * r;
    const y     = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else         shape.lineTo(x, y);
  }
  shape.closePath();

  return new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: false });
}

const HeroCanvas: React.FC<{ className?: string }> = ({ className }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const isMobile = window.innerWidth <= 768;
    const PARTICLE_COUNT = isMobile ? 80 : 200;

    // ── Scene ────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    el.appendChild(renderer.domElement);

    // ── Lights ───────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    const pl1 = new THREE.PointLight(0xC9A84C, 3, 20);
    pl1.position.set(3, 3, 3);
    scene.add(pl1);

    const pl2 = new THREE.PointLight(0xE8D5A3, 1.5, 20);
    pl2.position.set(-3, -2, 2);
    scene.add(pl2);

    const pl3 = new THREE.PointLight(0xC9A84C, 2, 15);
    pl3.position.set(0, -3, 2);
    scene.add(pl3);

    // ── Central orb ──────────────────────────────────────────────────────────
    const orbGeo = new THREE.SphereGeometry(1.2, 64, 64);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x1A1410,
      emissive: new THREE.Color(0xC9A84C),
      emissiveIntensity: 0.15,
      roughness: 0.3,
      metalness: 0.9,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    scene.add(orb);

    // ── Orbiting stars — outer ring (8 stars at radius 2.2) ──────────────────
    const outerStarGeo = makeStarGeometry(0.18, 0.07, 8);
    const outerStarMat = new THREE.MeshStandardMaterial({
      color: 0xC9A84C,
      emissive: new THREE.Color(0x8B6914),
      emissiveIntensity: 0.4,
      metalness: 1.0,
      roughness: 0.1,
    });

    const outerGroup  = new THREE.Group();
    const outerStars: THREE.Mesh[] = [];
    const OUTER_COUNT = 8;
    const OUTER_RADIUS = 2.2;

    for (let i = 0; i < OUTER_COUNT; i++) {
      const angle = (i / OUTER_COUNT) * Math.PI * 2;
      const mesh  = new THREE.Mesh(outerStarGeo, outerStarMat);
      mesh.position.set(Math.cos(angle) * OUTER_RADIUS, 0, Math.sin(angle) * OUTER_RADIUS);
      // Slight unique tilt so they dont look flat / identical
      mesh.rotation.x = (i % 3 - 1) * 0.25;
      mesh.rotation.y = (i * 0.37) % (Math.PI * 2);
      outerGroup.add(mesh);
      outerStars.push(mesh);
    }
    scene.add(outerGroup);

    // ── Orbiting stars — inner ring (3 stars at radius 1.5) ──────────────────
    const innerStarGeo = makeStarGeometry(0.09, 0.035, 8);
    const innerStarMat = new THREE.MeshStandardMaterial({
      color: 0xC9A84C,
      emissive: new THREE.Color(0x8B6914),
      emissiveIntensity: 0.6,
      metalness: 1.0,
      roughness: 0.1,
    });

    const innerGroup  = new THREE.Group();
    const innerStars: THREE.Mesh[] = [];
    const INNER_COUNT  = 3;
    const INNER_RADIUS = 1.5;

    for (let i = 0; i < INNER_COUNT; i++) {
      const angle = (i / INNER_COUNT) * Math.PI * 2;
      const mesh  = new THREE.Mesh(innerStarGeo, innerStarMat);
      mesh.position.set(Math.cos(angle) * INNER_RADIUS, 0, Math.sin(angle) * INNER_RADIUS);
      mesh.rotation.x = (i - 1) * 0.3;
      mesh.rotation.y = (i * 1.1) % (Math.PI * 2);
      innerGroup.add(mesh);
      innerStars.push(mesh);
    }
    scene.add(innerGroup);

    // ── Particles ────────────────────────────────────────────────────────────
    const posArr = new Float32Array(PARTICLE_COUNT * 3);
    const pData: {
      angle: number;
      radius: number;
      speed: number;
      orbitSpeed: number;
      drift: boolean;
    }[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 1.5 + Math.random() * 2.5;
      posArr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      posArr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      posArr[i * 3 + 2] = r * Math.cos(phi);
      pData.push({
        angle:      theta,
        radius:     r,
        speed:      0.002 + Math.random() * 0.004,
        orbitSpeed: (0.001 + Math.random() * 0.003) * (Math.random() > 0.5 ? 1 : -1),
        drift:      Math.random() > 0.55,
      });
    }

    const particleGeo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(posArr, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    particleGeo.setAttribute('position', posAttr);
    const particleMat = new THREE.PointsMaterial({
      color: 0xE8D5A3,
      size: 0.04,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Arabic geometric background patterns ──────────────────────────────────
    const buildLineStar = (outerR: number, innerR: number, n: number): THREE.Vector3[] => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= n * 2; i++) {
        const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
      }
      return pts;
    };

    const bgStarGeo = new THREE.BufferGeometry().setFromPoints(buildLineStar(3.5, 1.5, 8));
    const bgStarMat = new THREE.LineBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.12 });
    const bgStarLine = new THREE.Line(bgStarGeo, bgStarMat);
    bgStarLine.position.z = -0.5;
    scene.add(bgStarLine);

    const circPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      circPts.push(new THREE.Vector3(Math.cos(a) * 3.2, Math.sin(a) * 3.2, 0));
    }
    const circGeo = new THREE.BufferGeometry().setFromPoints(circPts);
    const circMat = new THREE.LineBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.07 });
    const circLine = new THREE.Line(circGeo, circMat);
    circLine.position.z = -0.5;
    scene.add(circLine);

    const hexGeo = new THREE.BufferGeometry().setFromPoints(buildLineStar(2.4, 1.2, 6));
    const hexMat = new THREE.LineBasicMaterial({ color: 0xE8D5A3, transparent: true, opacity: 0.06 });
    const hexLine = new THREE.Line(hexGeo, hexMat);
    hexLine.position.z = -0.3;
    scene.add(hexLine);

    // ── Mouse / device orientation ────────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const lm    = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mouse.x =  ((e.clientX - r.left) / r.width  - 0.5) * 2;
      mouse.y = -((e.clientY - r.top)  / r.height - 0.5) * 2;
    };
    el.addEventListener('mousemove', onMouseMove);

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        mouse.x = Math.max(-1, Math.min(1, e.gamma / 45));
        mouse.y = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
      }
    };
    if (isMobile) window.addEventListener('deviceorientation', onOrientation);

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    // ── Animation loop ────────────────────────────────────────────────────────
    let rafId = 0;
    let t = 0;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (document.visibilityState === 'hidden') return;

      t += 0.01;

      // Smooth mouse lerp
      lm.x += (mouse.x - lm.x) * 0.03;
      lm.y += (mouse.y - lm.y) * 0.03;

      // Orb: float + rotate + tilt toward mouse
      orb.rotation.y += 0.004;
      orb.position.y  = Math.sin(t * 0.5) * 0.08;
      orb.rotation.x += (lm.y * 0.3  - orb.rotation.x) * 0.05;
      orb.rotation.z += (-lm.x * 0.2 - orb.rotation.z) * 0.05;
      orbMat.emissiveIntensity = 0.15 + Math.sin(t * 0.8) * 0.04;

      // Outer star group: orbit + mouse tilt
      outerGroup.rotation.y += 0.003;
      outerGroup.rotation.x  = lm.y * 0.15;
      // Individual outer stars: self-spin + staggered vertical bob
      outerStars.forEach((s, i) => {
        s.rotation.z += 0.01;
        s.position.y  = Math.sin(t * 0.7 + i * (Math.PI * 2 / OUTER_COUNT)) * 0.15;
      });

      // Inner star group: faster orbit, opposite tilt response
      innerGroup.rotation.y += 0.006;
      innerGroup.rotation.x  = lm.y * 0.10;
      // Individual inner stars: self-spin + staggered bob
      innerStars.forEach((s, i) => {
        s.rotation.z += 0.01;
        s.position.y  = Math.sin(t * 1.1 + i * (Math.PI * 2 / INNER_COUNT)) * 0.10;
      });

      // Arabic background pattern rotation
      bgStarLine.rotation.z += 0.0008;
      circLine.rotation.z   -= 0.0004;
      hexLine.rotation.z    += 0.0005;

      // Camera: breathing + subtle mouse track
      camera.position.y  = Math.sin(t * 0.3) * 0.05;
      camera.position.x += (lm.x * 0.1 - camera.position.x) * 0.02;

      // Particles
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const d = pData[i];
        if (d.drift) {
          const ny = posAttr.getY(i) + d.speed;
          if (ny > 4) {
            posAttr.setXYZ(i,
              (Math.random() - 0.5) * 4,
              -3 + Math.random() * 0.5,
              (Math.random() - 0.5) * 4,
            );
          } else {
            posAttr.setY(i, ny);
          }
        } else {
          d.angle += d.orbitSpeed;
          posAttr.setX(i, Math.cos(d.angle) * d.radius + lm.x * 0.15);
          posAttr.setZ(i, Math.sin(d.angle) * d.radius * 0.5);
        }
      }
      posAttr.needsUpdate = true;

      particles.rotation.y = lm.x * 0.05;
      particles.rotation.x = lm.y * 0.05;

      renderer.render(scene, camera);
    };

    tick();

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      el.removeEventListener('mousemove', onMouseMove);
      if (isMobile) window.removeEventListener('deviceorientation', onOrientation);

      orbGeo.dispose();       orbMat.dispose();
      outerStarGeo.dispose(); outerStarMat.dispose();
      innerStarGeo.dispose(); innerStarMat.dispose();
      particleGeo.dispose();  particleMat.dispose();
      bgStarGeo.dispose();    bgStarMat.dispose();
      circGeo.dispose();      circMat.dispose();
      hexGeo.dispose();       hexMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
};

export default HeroCanvas;
