import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function makeSharpStar4(size: number): THREE.ExtrudeGeometry {
  const s = size;
  const i = size * 0.08;
  const shape = new THREE.Shape();
  shape.moveTo( 0,  s);
  shape.lineTo( i,  i);
  shape.lineTo( s,  0);
  shape.lineTo( i, -i);
  shape.lineTo( 0, -s);
  shape.lineTo(-i, -i);
  shape.lineTo(-s,  0);
  shape.lineTo(-i,  i);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false });
}

function makeBottleLabel(): {
  geo: THREE.PlaneGeometry;
  mat: THREE.MeshBasicMaterial;
  tex: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width  = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark background
  ctx.fillStyle = '#0A0805';
  ctx.fillRect(0, 0, 512, 512);

  // Outer border
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.8)';
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 18, 476, 476);

  const drawDecorLine = (y: number) => {
    ctx.strokeStyle = 'rgba(201, 168, 76, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(44, y); ctx.lineTo(216, y); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(256, y - 13); ctx.lineTo(272, y);
    ctx.lineTo(256, y + 13); ctx.lineTo(240, y);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(296, y); ctx.lineTo(468, y); ctx.stroke();
  };

  drawDecorLine(138);

  // Store name — bright solid gold
  ctx.fillStyle = '#C9A84C';
  ctx.font = '800 80px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('ZACKS', 256, 242);

  // "SIGNATURE" with manual letter spacing (TypeScript 4.9 has no ctx.letterSpacing)
  ctx.fillStyle = 'rgba(201, 168, 76, 0.9)';
  ctx.font = '300 36px serif';
  const word    = 'SIGNATURE';
  const gap     = 9;
  const chars   = word.split('');
  const widths  = chars.map(ch => ctx.measureText(ch).width);
  const totalW  = widths.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
  let cx = 256 - totalW / 2;
  chars.forEach((ch, k) => {
    ctx.fillText(ch, cx + widths[k] / 2, 300);
    cx += widths[k] + gap;
  });

  drawDecorLine(362);

  // Bottom small text
  ctx.fillStyle = 'rgba(201, 168, 76, 0.6)';
  ctx.font = '300 20px sans-serif';
  ctx.fillText('EAU DE PARFUM', 256, 412);

  const tex = new THREE.CanvasTexture(canvas);
  const geo = new THREE.PlaneGeometry(0.85, 0.95);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
  return { geo, mat, tex };
}

const HeroCanvas: React.FC<{ className?: string }> = ({ className }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT  = isMobile ? 40 : 80;
    const bottleBaseY     = isMobile ? -0.9 : -0.1;
    const bottleBaseX     = isMobile ?  0.0 : -0.3;

    // ── Scene / camera / renderer ─────────────────────────────────────────────
    const scene  = new THREE.Scene();
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

    const frontLight = new THREE.PointLight(0xffffff, 1.0, 14);
    frontLight.position.set(1.5, 1.5, 4);
    scene.add(frontLight);

    const rimLight = new THREE.PointLight(0xC9A84C, 1.0, 10);
    rimLight.position.set(-3, 1, 2);
    scene.add(rimLight);

    const rightFill = new THREE.PointLight(0xE8D5A3, 0.6, 12);
    rightFill.position.set(3, 0, 2);
    scene.add(rightFill);

    // ── Perfume bottle ────────────────────────────────────────────────────────
    const bottleGroup = new THREE.Group();
    // Static offset: shifted left and down
    bottleGroup.position.set(bottleBaseX, bottleBaseY, 0);

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x2A2018,
      emissive: new THREE.Color(0xC9A84C),
      emissiveIntensity: 0.3,
      metalness: 0.7,
      roughness: 0.2,
      transparent: true,
      opacity: 0.92,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xC9A84C,
      emissive: new THREE.Color(0xC9A84C),
      emissiveIntensity: 0.6,
      metalness: 1.0,
      roughness: 0.05,
    });

    const bodyGeo = new THREE.BoxGeometry(1.4, 1.5, 0.55);
    const body    = new THREE.Mesh(bodyGeo, glassMat);
    body.position.y = 0;
    bottleGroup.add(body);

    const neckGeo = new THREE.CylinderGeometry(0.14, 0.18, 0.18, 32);
    const neck    = new THREE.Mesh(neckGeo, glassMat);
    neck.position.y = 0.87;
    bottleGroup.add(neck);

    const capRingGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.04, 32);
    const capRing    = new THREE.Mesh(capRingGeo, goldMat);
    capRing.position.y = 1.06;
    bottleGroup.add(capRing);

    const capGeo  = new THREE.BoxGeometry(0.45, 0.22, 0.45);
    const capMesh = new THREE.Mesh(capGeo, goldMat);
    capMesh.position.y = 1.18;
    bottleGroup.add(capMesh);

    // Label — front and back, same texture
    const { geo: labelGeo, mat: labelMat, tex: labelTex } = makeBottleLabel();

    const frontLabel = new THREE.Mesh(labelGeo, labelMat);
    frontLabel.position.set(0, 0, 0.29);
    bottleGroup.add(frontLabel);

    const backLabel = new THREE.Mesh(labelGeo, labelMat);
    backLabel.position.set(0, 0, -0.29);
    backLabel.rotation.y = Math.PI;
    bottleGroup.add(backLabel);

    const bottleGlow = new THREE.PointLight(0xC9A84C, 2.0, 8);
    bottleGlow.position.set(0, 0, 0);
    bottleGroup.add(bottleGlow);

    scene.add(bottleGroup);

    // ── Star orbits ───────────────────────────────────────────────────────────
    const starBaseMat = new THREE.MeshStandardMaterial({
      color: 0xC9A84C,
      emissive: new THREE.Color(0xC9A84C),
      emissiveIntensity: 1.2,
      metalness: 1.0,
      roughness: 0.0,
    });

    // Outer orbit — 3 stars, size 0.12, radius 2.4, tilted 15°
    const outerGeo    = makeSharpStar4(0.12);
    const outerGroup  = new THREE.Group();
    outerGroup.rotation.x = (15 * Math.PI) / 180;
    const outerStars: THREE.Mesh[]  = [];
    const outerYOff   = [-0.10, 0.16, -0.06];
    const outerTilts  = [0.3, -0.5, 0.8]; // individual X tilts, also driven by sin wave
    for (let idx = 0; idx < 3; idx++) {
      const a    = (idx / 3) * Math.PI * 2;
      const mesh = new THREE.Mesh(outerGeo, starBaseMat);
      mesh.position.set(Math.cos(a) * 2.4, outerYOff[idx], Math.sin(a) * 2.4);
      mesh.rotation.x = outerTilts[idx];
      mesh.rotation.y = a;
      outerGroup.add(mesh);
      outerStars.push(mesh);
    }
    scene.add(outerGroup);

    // Middle orbit — 2 stars, size 0.08, radius 1.7, tilted 25°, counter-rotates
    const middleGeo   = makeSharpStar4(0.08);
    const middleMat   = new THREE.MeshStandardMaterial({
      color: 0xC9A84C,
      emissive: new THREE.Color(0xC9A84C),
      emissiveIntensity: 1.2,
      metalness: 1.0,
      roughness: 0.0,
    });
    const middleGroup = new THREE.Group();
    middleGroup.rotation.x = (25 * Math.PI) / 180;
    const middleStars: THREE.Mesh[] = [];
    // Different rotations on all axes per star
    const middleInitRot = [
      { x:  0.4, y: 0.0, z:  0.3 },
      { x: -0.6, y: 1.0, z: -0.2 },
    ];
    for (let idx = 0; idx < 2; idx++) {
      const a    = (idx / 2) * Math.PI * 2;
      const mesh = new THREE.Mesh(middleGeo, middleMat);
      mesh.position.set(Math.cos(a) * 1.7, 0, Math.sin(a) * 1.7);
      mesh.rotation.set(
        middleInitRot[idx].x,
        middleInitRot[idx].y + a,
        middleInitRot[idx].z,
      );
      middleGroup.add(mesh);
      middleStars.push(mesh);
    }
    scene.add(middleGroup);

    // Fixed accent stars — tiny, very bright, just spin in place
    const accentGeo = makeSharpStar4(0.05);
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xC9A84C,
      emissive: new THREE.Color(0xC9A84C),
      emissiveIntensity: 1.5,
      metalness: 1.0,
      roughness: 0.0,
    });

    const accentStar1 = new THREE.Mesh(accentGeo, accentMat);
    accentStar1.position.set(0.9, 1.1, 0.6);  // top-right of bottle area
    scene.add(accentStar1);

    const accentStar2 = new THREE.Mesh(accentGeo, accentMat);
    accentStar2.position.set(-1.5, -0.9, 0.4); // bottom-left of bottle area
    scene.add(accentStar2);

    // ── Particles ─────────────────────────────────────────────────────────────
    const posArr = new Float32Array(PARTICLE_COUNT * 3);
    const pData: {
      angle: number; radius: number;
      speed: number; orbitSpeed: number; drift: boolean;
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
    const posAttr     = new THREE.BufferAttribute(posArr, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    particleGeo.setAttribute('position', posAttr);
    const particleMat = new THREE.PointsMaterial({
      color: 0xE8D5A3,
      size: 0.015,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Arabic geometric background — very faint ──────────────────────────────
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
    const bgStarMat  = new THREE.LineBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.06 });
    const bgStarLine = new THREE.Line(bgStarGeo, bgStarMat);
    bgStarLine.position.z = -0.5;
    scene.add(bgStarLine);

    const circPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      circPts.push(new THREE.Vector3(Math.cos(a) * 3.2, Math.sin(a) * 3.2, 0));
    }
    const circGeo  = new THREE.BufferGeometry().setFromPoints(circPts);
    const circMat  = new THREE.LineBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.04 });
    const circLine = new THREE.Line(circGeo, circMat);
    circLine.position.z = -0.5;
    scene.add(circLine);

    const hexGeo  = new THREE.BufferGeometry().setFromPoints(buildLineStar(2.4, 1.2, 6));
    const hexMat  = new THREE.LineBasicMaterial({ color: 0xE8D5A3, transparent: true, opacity: 0.03 });
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

      // Bottle: x stays at -0.3, y floats around base offset
      bottleGroup.rotation.y  += 0.004;
      bottleGroup.position.y   = bottleBaseY + Math.sin(t * 0.6) * 0.08;
      bottleGroup.rotation.x  += ( lm.y * MAX_TILT - bottleGroup.rotation.x) * 0.04;
      bottleGroup.rotation.z  += (-lm.x * MAX_TILT - bottleGroup.rotation.z) * 0.04;
      bottleGlow.intensity = 1.5 + Math.sin(t * 1.2) * 0.5;

      // Outer orbit + individual sin-wave X tilt
      outerGroup.rotation.y += 0.002;
      outerGroup.rotation.x  = (15 * Math.PI / 180) + lm.y * 0.08;
      outerStars.forEach((s, k) => {
        s.rotation.z += 0.015;
        s.rotation.x  = outerTilts[k] + Math.sin(t * 0.7 + k * 2.1) * 0.2;
      });

      // Middle orbit — counter-rotates, faster individual spin
      middleGroup.rotation.y -= 0.0035;
      middleGroup.rotation.x  = (25 * Math.PI / 180) + lm.y * 0.06;
      middleStars.forEach((s) => { s.rotation.z += 0.02; });

      // Fixed accent stars — just spin in place
      accentStar1.rotation.z += 0.010;
      accentStar2.rotation.z -= 0.008;

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
      capGeo.dispose();     labelGeo.dispose();   labelTex.dispose();
      glassMat.dispose();   goldMat.dispose();    labelMat.dispose();

      outerGeo.dispose();   starBaseMat.dispose();
      middleGeo.dispose();  middleMat.dispose();
      accentGeo.dispose();  accentMat.dispose();

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
