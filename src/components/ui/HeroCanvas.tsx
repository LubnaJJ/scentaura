import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// 4-pointed luxury sparkle star (diamond cross — 4 sharp outer, 4 tiny inner)
function makeSharpStar4(size: number): THREE.ExtrudeGeometry {
  const s = size;
  const i = size * 0.08; // very tight inner radius → razor-sharp points
  const shape = new THREE.Shape();
  shape.moveTo(0,  s);    // top
  shape.lineTo( i,  i);
  shape.lineTo( s,  0);   // right
  shape.lineTo( i, -i);
  shape.lineTo( 0, -s);   // bottom
  shape.lineTo(-i, -i);
  shape.lineTo(-s,  0);   // left
  shape.lineTo(-i,  i);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false });
}

const HeroCanvas: React.FC<{ className?: string }> = ({ className }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const isMobile = window.innerWidth <= 768;
    const PARTICLE_COUNT = isMobile ? 80 : 150;

    // ── Scene / camera / renderer ─────────────────────────────────────────────
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

    // ── Perfume bottle ────────────────────────────────────────────────────────
    //
    //  Parts stack from bottom to top (group centered at y=0):
    //    body    : y -1.145 → +0.455  (center -0.345)
    //    neck    : y +0.455 → +0.805  (center  0.630)
    //    capRing : y +0.805 → +0.865  (center  0.835)
    //    cap     : y +0.865 → +1.145  (center  1.005)
    //
    const bottleGroup = new THREE.Group();

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x1A1410,
      emissive: new THREE.Color(0xC9A84C),
      emissiveIntensity: 0.08,
      metalness: 0.95,
      roughness: 0.05,
      transparent: true,
      opacity: 0.92,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xC9A84C,
      metalness: 1.0,
      roughness: 0.05,
    });

    const bodyGeo = new THREE.BoxGeometry(1.2, 1.6, 0.6);
    const body    = new THREE.Mesh(bodyGeo, glassMat);
    body.position.y = -0.345;
    bottleGroup.add(body);

    const neckGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.35, 32);
    const neck    = new THREE.Mesh(neckGeo, glassMat);
    neck.position.y = 0.63;
    bottleGroup.add(neck);

    const capRingGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.06, 32);
    const capRing    = new THREE.Mesh(capRingGeo, goldMat);
    capRing.position.y = 0.835;
    bottleGroup.add(capRing);

    const capGeo  = new THREE.BoxGeometry(0.38, 0.28, 0.38);
    const capMesh = new THREE.Mesh(capGeo, goldMat);
    capMesh.position.y = 1.005;
    bottleGroup.add(capMesh);

    // Subtle gold label on front face
    const labelGeo = new THREE.PlaneGeometry(0.7, 0.8);
    const labelMat = new THREE.MeshStandardMaterial({
      color: 0xC9A84C,
      transparent: true,
      opacity: 0.06,
    });
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.set(0, -0.345, 0.31);
    bottleGroup.add(label);

    // Golden glow light — lives inside the group so it floats with the bottle
    const bottleGlow = new THREE.PointLight(0xC9A84C, 2.0, 8);
    bottleGlow.position.set(0, 0, 0);
    bottleGroup.add(bottleGlow);

    scene.add(bottleGroup);

    // ── Shared star material (outer) ──────────────────────────────────────────
    const outerStarMat = new THREE.MeshStandardMaterial({
      color: 0xC9A84C,
      emissive: new THREE.Color(0xC9A84C),
      emissiveIntensity: 0.8,
      metalness: 1.0,
      roughness: 0.0,
    });

    // Outer orbit — 6 stars, radius 2.4, tilted 15°
    const outerGeo   = makeSharpStar4(0.22);
    const outerGroup = new THREE.Group();
    outerGroup.rotation.x = (15 * Math.PI) / 180;
    const outerStars: THREE.Mesh[] = [];
    // Stagger Y heights so they're not coplanar
    const outerYOff = [-0.12, 0.18, -0.08, 0.22, -0.15, 0.09];
    for (let idx = 0; idx < 6; idx++) {
      const a    = (idx / 6) * Math.PI * 2;
      const mesh = new THREE.Mesh(outerGeo, outerStarMat);
      mesh.position.set(Math.cos(a) * 2.4, outerYOff[idx], Math.sin(a) * 2.4);
      mesh.rotation.y = a;
      outerGroup.add(mesh);
      outerStars.push(mesh);
    }
    scene.add(outerGroup);

    // Middle orbit — 4 stars, radius 1.7, tilted 25°, counter-rotates
    const middleGeo = makeSharpStar4(0.14);
    const middleMat = new THREE.MeshStandardMaterial({
      color: 0xC9A84C,
      emissive: new THREE.Color(0xC9A84C),
      emissiveIntensity: 1.0,
      metalness: 1.0,
      roughness: 0.0,
    });
    const middleGroup = new THREE.Group();
    middleGroup.rotation.x = (25 * Math.PI) / 180;
    const middleStars: THREE.Mesh[] = [];
    for (let idx = 0; idx < 4; idx++) {
      const a    = (idx / 4) * Math.PI * 2;
      const mesh = new THREE.Mesh(middleGeo, middleMat);
      mesh.position.set(Math.cos(a) * 1.7, 0, Math.sin(a) * 1.7);
      mesh.rotation.y = a;
      middleGroup.add(mesh);
      middleStars.push(mesh);
    }
    scene.add(middleGroup);

    // Close orbit — 3 tiny stars, radius 1.1, random axis tilt
    const closeGeo = makeSharpStar4(0.08);
    const closeMat = new THREE.MeshStandardMaterial({
      color: 0xC9A84C,
      emissive: new THREE.Color(0xC9A84C),
      emissiveIntensity: 1.4,
      metalness: 1.0,
      roughness: 0.0,
    });
    const closeGroup = new THREE.Group();
    closeGroup.rotation.x = 0.55;
    closeGroup.rotation.z = 0.28;
    const closeStars: THREE.Mesh[] = [];
    for (let idx = 0; idx < 3; idx++) {
      const a    = (idx / 3) * Math.PI * 2;
      const mesh = new THREE.Mesh(closeGeo, closeMat);
      mesh.position.set(Math.cos(a) * 1.1, 0, Math.sin(a) * 1.1);
      mesh.rotation.x = (idx - 1) * 0.4;
      closeGroup.add(mesh);
      closeStars.push(mesh);
    }
    scene.add(closeGroup);

    // ── Particles ─────────────────────────────────────────────────────────────
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

    const bgStarGeo  = new THREE.BufferGeometry().setFromPoints(buildLineStar(3.5, 1.5, 8));
    const bgStarMat  = new THREE.LineBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.12 });
    const bgStarLine = new THREE.Line(bgStarGeo, bgStarMat);
    bgStarLine.position.z = -0.5;
    scene.add(bgStarLine);

    const circPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      circPts.push(new THREE.Vector3(Math.cos(a) * 3.2, Math.sin(a) * 3.2, 0));
    }
    const circGeo  = new THREE.BufferGeometry().setFromPoints(circPts);
    const circMat  = new THREE.LineBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.07 });
    const circLine = new THREE.Line(circGeo, circMat);
    circLine.position.z = -0.5;
    scene.add(circLine);

    const hexGeo  = new THREE.BufferGeometry().setFromPoints(buildLineStar(2.4, 1.2, 6));
    const hexMat  = new THREE.LineBasicMaterial({ color: 0xE8D5A3, transparent: true, opacity: 0.06 });
    const hexLine = new THREE.Line(hexGeo, hexMat);
    hexLine.position.z = -0.3;
    scene.add(hexLine);

    // ── Mouse / device orientation ────────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const lm    = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      mouse.y = -((e.clientY - rect.top)  / rect.height - 0.5) * 2;
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
    const MAX_TILT = (10 * Math.PI) / 180;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (document.visibilityState === 'hidden') return;

      t += 0.01;

      lm.x += (mouse.x - lm.x) * 0.03;
      lm.y += (mouse.y - lm.y) * 0.03;

      // Bottle: continuous Y rotation + float + lerp tilt toward mouse
      bottleGroup.rotation.y += 0.004;
      bottleGroup.position.y  = Math.sin(t * 0.6) * 0.08;
      bottleGroup.rotation.x += (lm.y *  MAX_TILT - bottleGroup.rotation.x) * 0.04;
      bottleGroup.rotation.z += (-lm.x * MAX_TILT - bottleGroup.rotation.z) * 0.04;

      // Glow breathing
      bottleGlow.intensity = 1.5 + Math.sin(t * 1.2) * 0.5;

      // Outer orbit
      outerGroup.rotation.y += 0.004;
      outerGroup.rotation.x  = (15 * Math.PI / 180) + lm.y * 0.08;
      outerStars.forEach((s) => { s.rotation.z += 0.015; });

      // Middle orbit — counter-rotates
      middleGroup.rotation.y -= 0.007;
      middleGroup.rotation.x  = (25 * Math.PI / 180) + lm.y * 0.06;
      middleStars.forEach((s) => { s.rotation.z += 0.015; });

      // Close orbit
      closeGroup.rotation.y += 0.012;
      closeStars.forEach((s) => { s.rotation.z += 0.015; });

      // Arabic background
      bgStarLine.rotation.z += 0.0008;
      circLine.rotation.z   -= 0.0004;
      hexLine.rotation.z    += 0.0005;

      // Camera breathing + mouse track
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

      bodyGeo.dispose();    neckGeo.dispose();    capRingGeo.dispose();
      capGeo.dispose();     labelGeo.dispose();
      glassMat.dispose();   goldMat.dispose();    labelMat.dispose();

      outerGeo.dispose();   outerStarMat.dispose();
      middleGeo.dispose();  middleMat.dispose();
      closeGeo.dispose();   closeMat.dispose();

      particleGeo.dispose(); particleMat.dispose();
      bgStarGeo.dispose();   bgStarMat.dispose();
      circGeo.dispose();     circMat.dispose();
      hexGeo.dispose();      hexMat.dispose();

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
