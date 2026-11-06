import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GridCell } from '../types/game.ts';
import { BuildingType, SkyscraperFloors, BUILDING_COLORS } from '../game/rules.ts';
import { sound } from '../utils/audio.ts';

interface CityCanvas3DProps {
  cells: Map<string, GridCell>;
  gridSize: number;
  timeOfDay: 'day' | 'sunset' | 'night';
  selectedTool: BuildingType | 'demolish' | 'inspect';
  selectedFloors: SkyscraperFloors;
  selectedColorId: string;
  isHokimGodMode: boolean;
  currentDistrictName?: string;
  currentRegionName?: string;
  onCellClick: (x: number, y: number) => void;
  onInspectCell?: (cell: GridCell | null) => void;
}

export const CityCanvas3D: React.FC<CityCanvas3DProps> = ({
  cells,
  gridSize,
  timeOfDay,
  selectedTool,
  selectedFloors,
  selectedColorId,
  isHokimGodMode,
  currentDistrictName,
  currentRegionName,
  onCellClick,
  onInspectCell,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [hoveredPos, setHoveredPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredCell, setHoveredCell] = useState<GridCell | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const isAutoRotatingRef = useRef<boolean>(false);
  isAutoRotatingRef.current = isAutoRotating;

  // References for Three.js instances to avoid re-instantiation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const buildingsGroupRef = useRef<THREE.Group | null>(null);
  const hoverMeshRef = useRef<THREE.Mesh | null>(null);
  const gridHelperGroupRef = useRef<THREE.Group | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const animFrameIdRef = useRef<number>(0);

  // Camera Orbit state (360 degree horizontal orbit, strict vertical clamp to never show ground underside)
  const cameraStateRef = useRef({
    target: new THREE.Vector3(0, 0, 0),
    radius: 22,
    theta: Math.PI / 4, // Horizontal angle (0 to 2*PI, 360 deg unrestricted)
    phi: Math.PI / 3, // Vertical angle (strictly clamped above ground horizon)
    isDragging: false,
    dragButton: 0,
    hasMoved: false,
    downPos: { x: 0, y: 0 },
    prevPointer: { x: 0, y: 0 },
    lerpTarget: new THREE.Vector3(0, 0, 0),
    lerpRadius: 22,
    lerpTheta: Math.PI / 4,
    lerpPhi: Math.PI / 3,
  });

  // Cell color helper
  const getColorHex = (colorId?: string) => {
    const found = BUILDING_COLORS.find(c => c.id === colorId);
    return found ? found.hex : '#00f0ff';
  };

  // 1. Initialize Scene, Camera, Renderer, Lighting once
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x00f0ff, 0x080c1e, 0.9);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(20, 35, 15);
    dirLight.castShadow = !isSoftwareGl;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -25;
    dirLight.shadow.camera.right = 25;
    dirLight.shadow.camera.top = 25;
    dirLight.shadow.camera.bottom = -25;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0x181e3a, 0.6);
    scene.add(ambientLight);

    // Groups
    const buildingsGroup = new THREE.Group();
    scene.add(buildingsGroup);
    buildingsGroupRef.current = buildingsGroup;

    const gridHelperGroup = new THREE.Group();
    scene.add(gridHelperGroup);
    gridHelperGroupRef.current = gridHelperGroup;

    // Hover cursor indicator
    const hoverGeo = new THREE.BoxGeometry(0.96, 0.08, 0.96);
    const hoverMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.55,
      wireframe: false,
    });
    const hoverMesh = new THREE.Mesh(hoverGeo, hoverMat);
    hoverMesh.visible = false;
    scene.add(hoverMesh);
    hoverMeshRef.current = hoverMesh;

    // 1. Fertile Natural Earth / Soil base (Tuproq qatlami)
    const soilGeo = new THREE.CylinderGeometry(18.2, 19.2, 1.4, 64);
    const soilMat = new THREE.MeshStandardMaterial({
      color: 0x3d2415, // Rich organic dark brown soil / tuproq
      roughness: 0.95,
      metalness: 0.05,
    });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = -0.7;
    soil.receiveShadow = !isSoftwareGl;
    scene.add(soil);

    // 2. Lush Green Grass Lawn layer (Yashil maysali zamin)
    const grassTopGeo = new THREE.CylinderGeometry(18.25, 18.25, 0.16, 64);
    const grassTopMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a, // Vibrant lawn grass green
      roughness: 0.85,
      metalness: 0.05,
    });
    const grassTop = new THREE.Mesh(grassTopGeo, grassTopMat);
    grassTop.position.y = -0.07;
    grassTop.receiveShadow = !isSoftwareGl;
    scene.add(grassTop);

    // 3. Natural Meadow Lawn Perimeter Ring
    const meadowRingGeo = new THREE.RingGeometry(18.0, 18.3, 64);
    const meadowRingMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const meadowRing = new THREE.Mesh(meadowRingGeo, meadowRingMat);
    meadowRing.rotation.x = -Math.PI / 2;
    meadowRing.position.y = 0.015;
    scene.add(meadowRing);

    // Animation & Render Loop (Smooth 360-degree orbit, strictly clamped above ground horizon)
    let lastTime = performance.now();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      const s = cameraStateRef.current;

      // Auto 360-degree orbital rotation when enabled and user is not actively dragging
      if (isAutoRotatingRef.current && !s.isDragging) {
        s.lerpTheta += delta * 0.25;
      }

      // Smooth camera interpolation
      s.theta += (s.lerpTheta - s.theta) * 0.12;
      s.phi += (s.lerpPhi - s.phi) * 0.12;
      s.radius += (s.lerpRadius - s.radius) * 0.12;
      s.target.lerp(s.lerpTarget, 0.12);

      // CRITICAL: Clamp vertical polar angle phi strictly above ground horizon:
      // phi = 0 is straight top-down. phi = 1.44 rad (~82.5 deg) keeps view firmly above terrain level.
      // This guarantees the camera NEVER shows the underside or bottom of the ground!
      s.phi = Math.max(0.12, Math.min(1.44, s.phi));
      s.lerpPhi = Math.max(0.12, Math.min(1.44, s.lerpPhi));

      // Calculate spherical camera position
      camera.position.x = s.target.x + s.radius * Math.sin(s.phi) * Math.sin(s.theta);
      camera.position.y = s.target.y + s.radius * Math.cos(s.phi);
      camera.position.z = s.target.z + s.radius * Math.sin(s.phi) * Math.cos(s.theta);
      camera.lookAt(s.target);

      // Rotate subtle cyber beacon lights or particle effects
      if (buildingsGroupRef.current) {
        buildingsGroupRef.current.children.forEach(child => {
          const beacon = child.getObjectByName('beacon');
          if (beacon) {
            beacon.rotation.y += delta * 3;
          }
          const ledStrip = child.getObjectByName('led_strip');
          if (ledStrip && ledStrip instanceof THREE.Mesh && ledStrip.material instanceof THREE.MeshBasicMaterial) {
            ledStrip.material.opacity = 0.6 + Math.sin(now * 0.005) * 0.35;
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 2. Adjust Lighting and Atmosphere according to timeOfDay
  useEffect(() => {
    if (!hemiLightRef.current || !dirLightRef.current || !sceneRef.current) return;

    if (timeOfDay === 'day') {
      hemiLightRef.current.color.setHex(0x93c5fd);
      hemiLightRef.current.groundColor.setHex(0x1e293b);
      hemiLightRef.current.intensity = 1.1;

      dirLightRef.current.color.setHex(0xfffbeb);
      dirLightRef.current.intensity = 1.9;
      dirLightRef.current.position.set(18, 30, 20);
      sceneRef.current.fog = new THREE.FogExp2(0x090e1f, 0.015);
    } else if (timeOfDay === 'sunset') {
      hemiLightRef.current.color.setHex(0xf97316);
      hemiLightRef.current.groundColor.setHex(0x3b0764);
      hemiLightRef.current.intensity = 0.9;

      dirLightRef.current.color.setHex(0xfb923c);
      dirLightRef.current.intensity = 1.5;
      dirLightRef.current.position.set(25, 12, 10);
      sceneRef.current.fog = new THREE.FogExp2(0x1a0b2e, 0.02);
    } else {
      // Night (Cyber Neon)
      hemiLightRef.current.color.setHex(0x00f0ff);
      hemiLightRef.current.groundColor.setHex(0x4c1d95);
      hemiLightRef.current.intensity = 0.7;

      dirLightRef.current.color.setHex(0x38bdf8);
      dirLightRef.current.intensity = 1.2;
      dirLightRef.current.position.set(15, 25, 15);
      sceneRef.current.fog = new THREE.FogExp2(0x070913, 0.025);
    }
  }, [timeOfDay]);

  // 3. Render Ground Grid Tiles (Lush Green Grass Patches with Natural Soil Seams)
  useEffect(() => {
    if (!gridHelperGroupRef.current) return;
    const group = gridHelperGroupRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    const half = gridSize / 2;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const posX = x - half + 0.5;
        const posZ = y - half + 0.5;

        // Lush grass lawn tile plane (checkerboard natural green tones)
        const isChecker = (x + y) % 2 === 0;
        const tileGeo = new THREE.PlaneGeometry(0.96, 0.96);
        const tileMat = new THREE.MeshStandardMaterial({
          color: isChecker ? 0x16a34a : 0x15803d, // Vibrant healthy lawn green
          roughness: 0.85,
          metalness: 0.05,
        });
        const tile = new THREE.Mesh(tileGeo, tileMat);
        tile.rotation.x = -Math.PI / 2;
        tile.position.set(posX, 0.005, posZ);
        tile.receiveShadow = true;
        group.add(tile);

        // Natural dark earth soil seam between garden plots (Tuproq chizig'i)
        const wireGeo = new THREE.EdgesGeometry(tileGeo);
        const wireMat = new THREE.LineBasicMaterial({
          color: 0x3d2415, // Natural dark brown organic soil seam
          transparent: true,
          opacity: 0.35,
        });
        const wire = new THREE.LineSegments(wireGeo, wireMat);
        wire.rotation.x = -Math.PI / 2;
        wire.position.set(posX, 0.006, posZ);
        group.add(wire);
      }
    }
  }, [gridSize]);

  // 4. Procedural 3D Composite Buildings Generation (3-12 parts per THREE.Group)
  useEffect(() => {
    if (!buildingsGroupRef.current) return;
    const group = buildingsGroupRef.current;

    // Dispose and clear existing building meshes
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      child.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
    }

    const half = gridSize / 2;

    cells.forEach((cell, key) => {
      const posX = cell.x - half + 0.5;
      const posZ = cell.y - half + 0.5;
      const buildingGroup = new THREE.Group();
      buildingGroup.position.set(posX, 0, posZ);
      buildingGroup.name = `building_${key}`;
      buildingGroup.userData = { cell };

      const colorHex = getColorHex(cell.colorId);
      const isGold = cell.colorId === 'gold_24k';

      // Material finishes
      const primaryMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        roughness: isGold ? 0.2 : 0.4,
        metalness: isGold ? 0.9 : 0.5,
        emissive: isGold ? new THREE.Color(0x775500) : new THREE.Color(0x001122),
        emissiveIntensity: isGold ? 0.4 : 0.1,
      });

      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.85,
        emissive: 0x003366,
        emissiveIntensity: 0.3,
      });

      const darkMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.7,
        metalness: 0.3,
      });

      const neonMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorHex),
      });

      // BUILD SPECIFIC 3D ARCHITECTURAL MODELS
      switch (cell.type) {
        // ==========================================
        // 1. BURJ KHALIFA ($1) - SHAHARDAGI ENG BALAND MINORA! 🏆
        // ==========================================
        case 'burj_khalifa': {
          // Tier 0: Grand Podium Base
          const podium = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.58, 0.5, 6), darkMat);
          podium.position.y = 0.25;
          podium.castShadow = true;
          buildingGroup.add(podium);

          // 8 Grand Tapering Architectural Tiers reaching into the stratosphere
          const heights = [2.0, 2.2, 2.4, 2.2, 2.0, 1.8, 1.6, 1.4];
          const radii = [0.46, 0.40, 0.34, 0.28, 0.22, 0.17, 0.12, 0.08];
          let currentY = 0.5;

          heights.forEach((h, idx) => {
            const tierMesh = new THREE.Mesh(
              new THREE.CylinderGeometry(radii[idx] * 0.86, radii[idx], h, 6),
              idx % 2 === 0 ? primaryMat : glassMat
            );
            tierMesh.position.y = currentY + h / 2;
            tierMesh.castShadow = true;
            buildingGroup.add(tierMesh);

            // Tier observation balcony rings
            const ring = new THREE.Mesh(new THREE.TorusGeometry(radii[idx] * 0.96, 0.02, 6, 24), neonMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = currentY + h;
            buildingGroup.add(ring);

            currentY += h;
          });

          // Ultra Needle Spire (5.2m spire reaching higher than anything else)
          const spireGeo = new THREE.ConeGeometry(0.08, 5.2, 8);
          const spireMat = new THREE.MeshStandardMaterial({
            color: isGold ? 0xffea00 : 0xe2e8f0,
            metalness: 0.95,
            roughness: 0.1,
          });
          const spire = new THREE.Mesh(spireGeo, spireMat);
          spire.position.y = currentY + 2.6;
          spire.castShadow = true;
          buildingGroup.add(spire);

          // Top Aviation Flashing Red Beacon
          const beaconGeo = new THREE.SphereGeometry(0.08, 8, 8);
          const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
          const beacon = new THREE.Mesh(beaconGeo, beaconMat);
          beacon.position.y = currentY + 5.2;
          beacon.name = 'beacon';
          buildingGroup.add(beacon);

          // Vertical LED cyber runner
          const ledGeo = new THREE.CylinderGeometry(0.025, 0.025, currentY, 4);
          const ledMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.85 });
          const led = new THREE.Mesh(ledGeo, ledMat);
          led.position.set(0.36, currentY / 2, 0);
          led.name = 'led_strip';
          buildingGroup.add(led);
          break;
        }

        // ==========================================
        // 2. ODDIY UY ($30) - Cyber Cottage
        // ==========================================
        case 'residential_simple': {
          // Foundation
          const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.1, 0.78), darkMat);
          plinth.position.y = 0.05;
          buildingGroup.add(plinth);

          // Main House Walls
          const walls = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.48, 0.68), primaryMat);
          walls.position.y = 0.34;
          walls.castShadow = true;
          buildingGroup.add(walls);

          // Pitched Roof (Sloped Prism / Cone)
          const roofGeo = new THREE.ConeGeometry(0.55, 0.38, 4);
          const roofMat = new THREE.MeshStandardMaterial({
            color: isGold ? 0xd4af37 : 0x7c3aed,
            roughness: 0.3,
            metalness: 0.6,
          });
          const roof = new THREE.Mesh(roofGeo, roofMat);
          roof.rotation.y = Math.PI / 4;
          roof.position.y = 0.76;
          roof.castShadow = true;
          buildingGroup.add(roof);

          // Chimney
          const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.35, 0.1), darkMat);
          chimney.position.set(0.2, 0.8, 0.1);
          buildingGroup.add(chimney);

          // Glowing Windows
          const winMat = new THREE.MeshBasicMaterial({ color: 0xffe066 });
          const frontWin = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.14), winMat);
          frontWin.position.set(0.16, 0.38, 0.345);
          buildingGroup.add(frontWin);

          const frontDoor = new THREE.Mesh(
            new THREE.PlaneGeometry(0.16, 0.28),
            new THREE.MeshStandardMaterial({ color: 0x334155 })
          );
          frontDoor.position.set(-0.12, 0.24, 0.345);
          buildingGroup.add(frontDoor);
          break;
        }

        // ==========================================
        // 3. BIZNES BINOSI ($60) - Corporate Hub
        // ==========================================
        case 'business': {
          // Podium
          const bPodium = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.25, 0.82), darkMat);
          bPodium.position.y = 0.125;
          buildingGroup.add(bPodium);

          // Main Glass Corporate Tower
          const bTower = new THREE.Mesh(new THREE.BoxGeometry(0.66, 1.1, 0.66), glassMat);
          bTower.position.y = 0.8;
          bTower.castShadow = true;
          buildingGroup.add(bTower);

          // Corner Metallic Pylons
          const pylonGeo = new THREE.BoxGeometry(0.08, 1.25, 0.08);
          [-0.33, 0.33].forEach(px => {
            [-0.33, 0.33].forEach(pz => {
              const pylon = new THREE.Mesh(pylonGeo, primaryMat);
              pylon.position.set(px, 0.75, pz);
              buildingGroup.add(pylon);
            });
          });

          // Rooftop AC chiller & Helipad
          const heliPad = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 16), darkMat);
          heliPad.position.y = 1.37;
          buildingGroup.add(heliPad);

          // Helipad glowing 'H' ring
          const hRing = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.22, 16), neonMat);
          hRing.rotation.x = -Math.PI / 2;
          hRing.position.y = 1.4;
          buildingGroup.add(hRing);
          break;
        }

        // ==========================================
        // 4. OSMONO'PAR BINO (1Q, 20Q, 100Q)
        // ==========================================
        case 'skyscraper': {
          const floors = cell.floors || 1;
          const totalHeight = floors === 100 ? 5.2 : floors === 20 ? 2.6 : 0.85;

          // Tiered Base
          const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.8), darkMat);
          baseMesh.position.y = 0.15;
          buildingGroup.add(baseMesh);

          // Main Tower
          const tower = new THREE.Mesh(new THREE.BoxGeometry(0.62, totalHeight, 0.62), primaryMat);
          tower.position.y = 0.3 + totalHeight / 2;
          tower.castShadow = true;
          buildingGroup.add(tower);

          // Window bands
          const winBandsCount = floors === 100 ? 12 : floors === 20 ? 6 : 2;
          const bandHeight = (totalHeight * 0.85) / winBandsCount;
          for (let i = 0; i < winBandsCount; i++) {
            const band = new THREE.Mesh(new THREE.BoxGeometry(0.63, 0.06, 0.63), glassMat);
            band.position.y = 0.4 + i * (bandHeight + 0.05);
            buildingGroup.add(band);
          }

          // Rooftop Antenna Mast
          const mastGeo = new THREE.CylinderGeometry(0.03, 0.06, 0.9, 8);
          const mast = new THREE.Mesh(mastGeo, darkMat);
          mast.position.y = 0.3 + totalHeight + 0.45;
          buildingGroup.add(mast);

          // Spire beacon
          const sBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), neonMat);
          sBeacon.position.y = 0.3 + totalHeight + 0.9;
          buildingGroup.add(sBeacon);
          break;
        }

        // ==========================================
        // 5. CYBER VILLA ($500)
        // ==========================================
        case 'cyber_villa': {
          // Ground plinth
          const vPlinth = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.08, 0.88), darkMat);
          vPlinth.position.y = 0.04;
          buildingGroup.add(vPlinth);

          // Lower glass living area
          const lower = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.55), glassMat);
          lower.position.set(-0.1, 0.22, -0.1);
          buildingGroup.add(lower);

          // Cantilevered upper suite
          const upper = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.32, 0.5), primaryMat);
          upper.position.set(0.05, 0.52, 0.1);
          upper.castShadow = true;
          buildingGroup.add(upper);

          // Turquoise Infinity pool
          const poolWater = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.06, 0.25),
            new THREE.MeshBasicMaterial({ color: 0x00ffff })
          );
          poolWater.position.set(0.24, 0.08, -0.22);
          buildingGroup.add(poolWater);
          break;
        }

        // ==========================================
        // 6. MEGAPOLIS MALL ($1,500)
        // ==========================================
        case 'megamall': {
          // Oval / circular retail podium
          const mallBase = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.46, 0.35, 24), darkMat);
          mallBase.position.y = 0.175;
          buildingGroup.add(mallBase);

          // Futuristic Geodesic Glass Dome
          const domeGeo = new THREE.SphereGeometry(0.38, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
          const dome = new THREE.Mesh(domeGeo, glassMat);
          dome.position.y = 0.35;
          buildingGroup.add(dome);

          // Holographic shopping portal ring
          const portal = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.03, 8, 24), neonMat);
          portal.position.y = 0.45;
          portal.rotation.x = Math.PI / 2;
          buildingGroup.add(portal);
          break;
        }

        // ==========================================
        // 7. KOSMODROM ($5,000)
        // ==========================================
        case 'spaceport': {
          // Launch pad base
          const pad = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.2, 0.85), darkMat);
          pad.position.y = 0.1;
          buildingGroup.add(pad);

          // Launch Gantry Towers
          const gantryGeo = new THREE.BoxGeometry(0.08, 1.4, 0.08);
          const gantry1 = new THREE.Mesh(gantryGeo, primaryMat);
          gantry1.position.set(-0.25, 0.8, -0.25);
          buildingGroup.add(gantry1);

          const gantry2 = new THREE.Mesh(gantryGeo, primaryMat);
          gantry2.position.set(-0.25, 0.8, 0.25);
          buildingGroup.add(gantry2);

          // Space Rocket
          const rocketBody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 1.2, 16),
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.8 })
          );
          rocketBody.position.set(0.08, 0.7, 0);
          rocketBody.castShadow = true;
          buildingGroup.add(rocketBody);

          // Rocket Nose Cone
          const cone = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 16), neonMat);
          cone.position.set(0.08, 1.45, 0);
          buildingGroup.add(cone);
          break;
        }

        // ==========================================
        // 8. YO'L ($5)
        // ==========================================
        case 'road': {
          // Asphalt road slab
          const roadSlab = new THREE.Mesh(
            new THREE.BoxGeometry(0.96, 0.04, 0.96),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 })
          );
          roadSlab.position.y = 0.02;
          buildingGroup.add(roadSlab);

          // Center dash line
          const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.6), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
          dash.rotation.x = -Math.PI / 2;
          dash.position.y = 0.042;
          buildingGroup.add(dash);

          // Cyber Street Lamp
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), darkMat);
          pole.position.set(0.4, 0.25, 0.4);
          buildingGroup.add(pole);

          const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), neonMat);
          lamp.position.set(0.4, 0.5, 0.4);
          buildingGroup.add(lamp);
          break;
        }

        // ==========================================
        // 9. KIBER DARAXT ($10)
        // ==========================================
        case 'tree': {
          // Trunk
          const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.09, 0.45, 6),
            new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 })
          );
          trunk.position.y = 0.225;
          trunk.castShadow = true;
          buildingGroup.add(trunk);

          // Geodesic Cyber Canopy
          const foliageMat = new THREE.MeshStandardMaterial({
            color: 0x10b981,
            roughness: 0.3,
            metalness: 0.4,
            emissive: 0x059669,
            emissiveIntensity: 0.2,
          });

          const f1 = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.38, 6), foliageMat);
          f1.position.y = 0.45;
          f1.castShadow = true;
          buildingGroup.add(f1);

          const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.32, 6), foliageMat);
          f2.position.y = 0.65;
          f2.castShadow = true;
          buildingGroup.add(f2);

          const f3 = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.26, 6), foliageMat);
          f3.position.y = 0.82;
          f3.castShadow = true;
          buildingGroup.add(f3);
          break;
        }

        // ==========================================
        // 10. FAVVORALI PARK ($25)
        // ==========================================
        case 'park': {
          // Park Grass / Plaza Tile
          const plaza = new THREE.Mesh(
            new THREE.BoxGeometry(0.92, 0.06, 0.92),
            new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.8 })
          );
          plaza.position.y = 0.03;
          buildingGroup.add(plaza);

          // Fountain Basin
          const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.14, 16), darkMat);
          basin.position.y = 0.12;
          buildingGroup.add(basin);

          // Water Pool
          const water = new THREE.Mesh(
            new THREE.CylinderGeometry(0.26, 0.26, 0.08, 16),
            new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.85 })
          );
          water.position.y = 0.16;
          buildingGroup.add(water);

          // Water jet spray
          const jet = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
          jet.position.y = 0.32;
          buildingGroup.add(jet);
          break;
        }
      }

      group.add(buildingGroup);
    });
  }, [cells, gridSize]);

  // 5. Mouse & Raycast Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    const s = cameraStateRef.current;
    s.isDragging = true;
    s.hasMoved = false;
    s.dragButton = e.button;
    s.downPos = { x: e.clientX, y: e.clientY };
    s.prevPointer = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const s = cameraStateRef.current;

    // Camera Orbit / Pan Dragging
    if (s.isDragging) {
      const distFromDown = Math.hypot(e.clientX - s.downPos.x, e.clientY - s.downPos.y);
      if (distFromDown > 5) {
        s.hasMoved = true;
      }

      const dx = e.clientX - s.prevPointer.x;
      const dy = e.clientY - s.prevPointer.y;
      s.prevPointer = { x: e.clientX, y: e.clientY };

      if (s.dragButton === 0) {
        // Left drag: Orbit rotation
        s.lerpTheta -= dx * 0.007;
        s.lerpPhi -= dy * 0.007;
      } else if (s.dragButton === 2) {
        // Right drag: Pan target
        const forward = new THREE.Vector3(-Math.sin(s.theta), 0, -Math.cos(s.theta));
        const right = new THREE.Vector3(Math.cos(s.theta), 0, -Math.sin(s.theta));
        s.lerpTarget.addScaledVector(right, -dx * 0.02);
        s.lerpTarget.addScaledVector(forward, dy * 0.02);
      }
      return;
    }

    // Raycasting for ground grid hover
    if (!mountRef.current || !cameraRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    // Intersect plane y=0
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const target = new THREE.Vector3();
    const hit = raycaster.ray.intersectPlane(groundPlane, target);

    if (hit) {
      const half = gridSize / 2;
      const gridX = Math.floor(target.x + half);
      const gridY = Math.floor(target.z + half);

      if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
        setHoveredPos({ x: gridX, y: gridY });
        const cell = cells.get(`${gridX},${gridY}`) || null;
        setHoveredCell(cell);

        if (hoverMeshRef.current) {
          hoverMeshRef.current.position.set(gridX - half + 0.5, 0.06, gridY - half + 0.5);
          hoverMeshRef.current.visible = true;

          // Color cursor by action mode
          if (selectedTool === 'demolish') {
            (hoverMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
          } else if (selectedTool === 'inspect') {
            (hoverMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(0xa855f7);
          } else {
            (hoverMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(0x00f0ff);
          }
        }
      } else {
        setHoveredPos(null);
        setHoveredCell(null);
        if (hoverMeshRef.current) hoverMeshRef.current.visible = false;
      }
    }
  };

  const handlePointerUp = () => {
    cameraStateRef.current.isDragging = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const s = cameraStateRef.current;
    s.lerpRadius = Math.max(8, Math.min(50, s.lerpRadius + e.deltaY * 0.02));
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const s = cameraStateRef.current;
    if (s.dragButton === 2) return;
    if (s.hasMoved) return; // User performed orbit drag, not tap/click

    if (!mountRef.current || !cameraRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    let clickedX: number | null = null;
    let clickedY: number | null = null;

    // 1. Check if clicking on an existing building directly
    if (buildingsGroupRef.current && buildingsGroupRef.current.children.length > 0) {
      const hits = raycaster.intersectObjects(buildingsGroupRef.current.children, true);
      if (hits.length > 0) {
        let cur: THREE.Object3D | null = hits[0].object;
        while (cur && !cur.userData?.cell && cur.parent !== buildingsGroupRef.current) {
          cur = cur.parent;
        }
        if (cur?.userData?.cell) {
          clickedX = cur.userData.cell.x;
          clickedY = cur.userData.cell.y;
        }
      }
    }

    // 2. If no building hit, intersect the green grass ground plane y = 0
    if (clickedX === null || clickedY === null) {
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const target = new THREE.Vector3();
      const hit = raycaster.ray.intersectPlane(groundPlane, target);
      if (hit) {
        const half = gridSize / 2;
        const gridX = Math.floor(target.x + half);
        const gridY = Math.floor(target.z + half);
        if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
          clickedX = gridX;
          clickedY = gridY;
        }
      }
    }

    // 3. Fallback to hoveredPos if raycast succeeded earlier
    if (clickedX === null && hoveredPos) {
      clickedX = hoveredPos.x;
      clickedY = hoveredPos.y;
    }

    if (clickedX !== null && clickedY !== null) {
      onCellClick(clickedX, clickedY);
      if (onInspectCell) {
        onInspectCell(cells.get(`${clickedX},${clickedY}`) || null);
      }
    }
  };

  // Preset camera angle views
  const setCameraPreset = (preset: 'isometric' | 'top' | 'close' | 'burj') => {
    sound.playClick();
    const s = cameraStateRef.current;
    s.lerpTarget.set(0, 0, 0);

    if (preset === 'isometric') {
      s.lerpRadius = 24;
      s.lerpTheta = Math.PI / 4;
      s.lerpPhi = Math.PI / 3;
    } else if (preset === 'top') {
      s.lerpRadius = 28;
      s.lerpTheta = 0;
      s.lerpPhi = 0.2; // nearly top-down
    } else if (preset === 'close') {
      s.lerpRadius = 13;
      s.lerpTheta = Math.PI / 3;
      s.lerpPhi = Math.PI / 2.6;
    } else if (preset === 'burj') {
      s.lerpRadius = 32;
      s.lerpTheta = Math.PI / 6;
      s.lerpPhi = Math.PI / 2.3;
      s.lerpTarget.set(0, 2.5, 0); // look up towards the towers
    }
  };

  const handleStepRotate = (deltaAngle: number) => {
    sound.playClick();
    cameraStateRef.current.lerpTheta += deltaAngle;
  };

  const toggleAutoRotate = () => {
    sound.playClick();
    setIsAutoRotating(prev => !prev);
  };

  return (
    <div className="relative w-full h-[540px] sm:h-[620px] rounded-2xl overflow-hidden bg-[#070913] border border-emerald-500/30 select-none shadow-[0_0_50px_rgba(34,197,94,0.08)]">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
        onContextMenu={e => e.preventDefault()}
      />

      {/* Floating 3D Navigation & 360° Camera Controls (Top-Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
        {/* Preset Angles */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-950/85 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 backdrop-blur-md shadow-lg">
          <button
            onClick={() => setCameraPreset('isometric')}
            className="px-2.5 py-1 rounded-lg hover:bg-cyan-500/20 transition font-bold"
            title="3D Izometrik ko'rinish"
          >
            3D Izometrik
          </button>
          <button
            onClick={() => setCameraPreset('top')}
            className="px-2.5 py-1 rounded-lg hover:bg-cyan-500/20 transition"
            title="Tepadan xarita ko'rinishi"
          >
            Tepadan (2D)
          </button>
          <button
            onClick={() => setCameraPreset('close')}
            className="px-2.5 py-1 rounded-lg hover:bg-cyan-500/20 transition"
            title="Yaqindan ko'rish"
          >
            Yaqin
          </button>
          <button
            onClick={() => setCameraPreset('burj')}
            className="px-2.5 py-1 rounded-lg hover:bg-amber-500/20 text-amber-300 transition font-bold"
            title="Burj Khalifa va osmono'parlar panoramasi"
          >
            Burj Vista
          </button>
        </div>

        {/* 360-Degree Continuous Orbit & Step Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-950/85 border border-emerald-500/40 text-[11px] font-mono text-emerald-300 backdrop-blur-md shadow-lg">
          <button
            onClick={() => handleStepRotate(-Math.PI / 4)}
            className="px-2 py-1 rounded-lg hover:bg-emerald-500/20 transition font-bold"
            title="Binolarni 45° chapga burish"
          >
            ⟲ 45° Chap
          </button>
          <button
            onClick={toggleAutoRotate}
            className={`px-2.5 py-1 rounded-lg transition font-bold flex items-center gap-1 ${
              isAutoRotating
                ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.7)] animate-pulse'
                : 'hover:bg-emerald-500/20 text-emerald-300'
            }`}
            title="Binolarni 360° uzluksiz avto-aylantirish"
          >
            <span>🔄 360° Aylanish</span>
            {isAutoRotating && <span className="text-[9px] px-1 bg-black text-emerald-400 rounded">Faol</span>}
          </button>
          <button
            onClick={() => handleStepRotate(Math.PI / 4)}
            className="px-2 py-1 rounded-lg hover:bg-emerald-500/20 transition font-bold"
            title="Binolarni 45° o'ngga burish"
          >
            ⟳ 45° O'ng
          </button>
        </div>
      </div>

      {/* Top Left Cell Info HUD & District Badge */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-1.5">
        {/* District Banner */}
        <div className="px-3 py-1.5 rounded-xl bg-gray-950/85 border border-emerald-500/40 text-xs font-mono text-emerald-300 backdrop-blur-md flex items-center gap-2 shadow-lg w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span className="text-white font-bold">
            📍 {currentRegionName ? `${currentRegionName} • ` : ''}{currentDistrictName || 'Chilonzor tumani'}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-[10px] text-emerald-300 font-bold">
            360° 3D
          </span>
        </div>

        {/* Hover Cell Info */}
        <div className="px-3 py-1.5 rounded-xl bg-gray-950/80 border border-cyan-500/30 text-xs font-mono text-gray-300 backdrop-blur-md flex items-center gap-3 w-fit">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
            <span className="text-white font-bold">
              {hoveredPos ? `Katak: (${hoveredPos.x}, ${hoveredPos.y})` : 'Maydonni bosing'}
            </span>
          </div>
          {hoveredCell && hoveredCell.type !== 'empty' && (
            <div className="text-cyan-300 border-l border-gray-700 pl-2">
              <span>{hoveredCell.customName || hoveredCell.name}</span>
              {hoveredCell.instagram && (
                <span className="ml-1 text-pink-400 font-bold">{hoveredCell.instagram}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-4 z-10 pointer-events-none hidden sm:block">
        <p className="text-[10px] font-mono text-gray-300 bg-gray-950/80 px-3 py-1 rounded-lg border border-emerald-500/20 shadow-md">
          🌿 Yashil maysali tuproq • 🔄 Binolarni 360° ko'rish: Chap tugma bilan aylantiring • Panoramalash: O'ng tugma • Masshtab: G'ildirak
        </p>
      </div>
    </div>
  );
};
