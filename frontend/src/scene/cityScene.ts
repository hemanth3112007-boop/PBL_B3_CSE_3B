import * as THREE from 'three';

export interface CampusBuildingData {
  id: string;
  name: string;
  companyName: string;
  pavilionName: string;
  campusZone: string;
  roleId: string;
  matchPercentage: number;
  openRoles: number;
  archetype: 'ring' | 'twin' | 'ziggurat' | 'hex' | 'atrium' | 'quad' | 'pavilion';
  position: THREE.Vector3;
  cameraTarget: THREE.Vector3;
  cameraPosition: THREE.Vector3;
  primaryTech: string[];
  hiringBar: string;
  avgComp: string;
}

export interface BeaconScreenPos {
  id: string;
  name: string;
  companyName: string;
  campusZone: string;
  roleId: string;
  matchPercentage: number;
  x: number;
  y: number;
  visible: boolean;
}

export interface CitySceneCallbacks {
  onHoverBuilding: (building: CampusBuildingData | null, screenPos: { x: number; y: number } | null) => void;
  onSelectBuilding: (building: CampusBuildingData) => void;
  onCameraUpdate: (stats: { altitude: number; fov: number; district: string; progress: number }) => void;
  onBeaconsUpdate?: (beacons: BeaconScreenPos[]) => void;
}

export class CityScene {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;

  private isSoftwareGl: boolean = false;
  private isPaused: boolean = false;
  private animationFrameId: number = 0;
  private resizeObserver: ResizeObserver | null = null;

  // Waypoints & Camera Flythrough
  private cameraSpline: THREE.CatmullRomCurve3;
  private targetSpline: THREE.CatmullRomCurve3;
  private scrollProgress: number = 0;
  private targetScrollProgress: number = 0;

  // Mouse Parallax & Raycasting
  private mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  private raycaster: THREE.Raycaster;
  private pointer: THREE.Vector2;

  // Smooth Double-Damped Camera State
  private smoothedCamPos: THREE.Vector3 = new THREE.Vector3(0, 140, 230);
  private smoothedTargetPos: THREE.Vector3 = new THREE.Vector3(0, 20, 15);

  // Buildings data & interactive mesh groups
  public buildings: CampusBuildingData[] = [];
  private interactiveMeshes: THREE.Mesh[] = [];
  private buildingGroupMap: Map<THREE.Mesh, CampusBuildingData> = new Map();
  private callbacks: CitySceneCallbacks;

  // Animated elements (elevators, beacons, water)
  private animatedElevators: { mesh: THREE.Mesh; minY: number; maxY: number; speed: number; offset: number }[] = [];
  private warningBeacons: THREE.Mesh[] = [];

  // Textures
  private facadeTexture!: THREE.CanvasTexture;
  private turfTexture!: THREE.CanvasTexture;
  private leafStippleTexture!: THREE.CanvasTexture;
  private paverJointTexture!: THREE.CanvasTexture;
  private barkTexture!: THREE.CanvasTexture;
  private timberTexture!: THREE.CanvasTexture;

  // Materials
  private alabasterConcreteMat!: THREE.MeshStandardMaterial;
  private travertineStoneMat!: THREE.MeshStandardMaterial;
  private starlightGlassMat!: THREE.MeshPhysicalMaterial;
  private reflectiveGlassMat!: THREE.MeshStandardMaterial;
  private celestialSlateMat!: THREE.MeshStandardMaterial;
  private titaniumFrameMat!: THREE.MeshStandardMaterial;
  private facadeLitMat!: THREE.MeshStandardMaterial;
  private glowingCyanMat!: THREE.MeshBasicMaterial;
  private glowingAmberMat!: THREE.MeshBasicMaterial;
  private waterMat!: THREE.MeshStandardMaterial;
  private turfMat!: THREE.MeshStandardMaterial;
  private roadMat!: THREE.MeshStandardMaterial;
  private curbMat!: THREE.MeshStandardMaterial;
  private foliageMat!: THREE.MeshStandardMaterial;
  private foliageSageMat!: THREE.MeshStandardMaterial;
  private foliageWarmMat!: THREE.MeshStandardMaterial;
  private foliageSubsurfaceMat!: THREE.MeshStandardMaterial;
  private trunkBarkMat!: THREE.MeshStandardMaterial;
  private paverMat!: THREE.MeshStandardMaterial;
  private pathCurbMat!: THREE.MeshStandardMaterial;
  private pathLedStripMat!: THREE.MeshBasicMaterial;
  private timberDeckMat!: THREE.MeshStandardMaterial;
  private darkSteelMat!: THREE.MeshStandardMaterial;
  private warmHandrailMat!: THREE.MeshBasicMaterial;

  // Instanced Meshes
  private broadCanopyMesh!: THREE.InstancedMesh;
  private tieredCanopyMesh!: THREE.InstancedMesh;
  private columnarCanopyMesh!: THREE.InstancedMesh;
  private trunkMesh!: THREE.InstancedMesh;
  private pineTreeMesh!: THREE.InstancedMesh;
  private bollardLightMesh!: THREE.InstancedMesh;

  // Scene Objects
  private starfield!: THREE.Points;
  private pulseClock: number = 0;

  constructor(container: HTMLElement, callbacks: CitySceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(-999, -999);

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'w-full h-full block';
    this.container.appendChild(this.canvas);

    this.scene = new THREE.Scene();
    // Default panoramic camera position: pulled back and higher with FOV 42
    this.camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 1, 2000);

    // Ultra-Smooth, Continuous Closed Racetrack Loop Around the Campus (Zero Turnarounds or Zigzags)
    this.cameraSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 140, 230),    // 0.00: High Panoramic Campus Vista (South)
      new THREE.Vector3(-120, 75, -80),  // 0.11: Stripe Payments Terraces (Northwest)
      new THREE.Vector3(-135, 70, 10),   // 0.22: Linear Systems Ring (Mid-West)
      new THREE.Vector3(-115, 70, 115),  // 0.33: Anthropic AI Ziggurat (Southwest)
      new THREE.Vector3(-45, 65, 175),   // 0.44: OpenAI Intelligence Quad (South-Central)
      new THREE.Vector3(110, 68, 140),   // 0.56: Figma Canvas Pavilion (Southeast)
      new THREE.Vector3(105, 68, 70),    // 0.67: Vercel Cloud Atrium (Mid-East)
      new THREE.Vector3(130, 75, -5),    // 0.78: Cloudflare Twin Spire (Mid-East Riverside)
      new THREE.Vector3(115, 75, -95),   // 0.89: Databricks Hex-Campus (Northeast)
    ], true, 'centripetal', 0.5);

    this.targetSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 20, 15),      // 0.00: Looking North across central concourse
      new THREE.Vector3(-80, 22, -85),   // 0.11: Stripe plaza
      new THREE.Vector3(-95, 20, 5),     // 0.22: Linear grove
      new THREE.Vector3(-70, 25, 90),    // 0.33: Anthropic bluff
      new THREE.Vector3(-20, 20, 130),   // 0.44: OpenAI quad
      new THREE.Vector3(80, 20, 135),    // 0.56: Figma annex
      new THREE.Vector3(60, 20, 75),     // 0.67: Vercel atrium
      new THREE.Vector3(85, 25, -10),    // 0.78: Cloudflare bridge
      new THREE.Vector3(75, 22, -95),    // 0.89: Databricks lakehouse
    ], true, 'centripetal', 0.5);

    this.init();
  }

  private init() {
    this.detectSoftwareGl();

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: !this.isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: true,
      });

      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.25;
      this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    } catch (e) {
      console.warn('WebGL init fallback:', e);
      return;
    }

    // Atmospheric Cosmic Night Fog
    this.scene.fog = new THREE.FogExp2(0x080D1A, 0.0028);

    // 1. Setup Procedural Textures & Shared Materials
    this.generateProceduralTextures();
    this.createMaterials();

    // 2. Setup Lighting (Enhanced illumination with moon, hemisphere, and plaza points)
    this.setupLighting();

    // 3. Starlight Canopy Starfield
    this.createStarfield();

    // 4. Natural Organic Landscape: S-Curve River, Emerald Turf, Paved Walkways
    this.createLandscapeAndRiver();

    // 5. Far Metropolitian Background Skyline Towers
    this.createBackgroundSkyline();

    // 6. 1,200+ Instanced Trees & 160+ Glowing Bollard Lights
    this.createInstancedVegetationAndBollards();

    // 7. Generate the 8 Asymmetric Masterplan Enterprise Pavilions
    this.generateAsymmetricCampuses();

    // 8. Event Listeners & Initial Camera Position
    this.setupEvents();
    this.smoothedCamPos.set(0, 140, 230);
    this.smoothedTargetPos.set(0, 20, 15);
    this.camera.position.copy(this.smoothedCamPos);
    this.camera.lookAt(this.smoothedTargetPos);

    // 9. Start Smooth Render Loop
    this.animate();
  }

  private detectSoftwareGl() {
    try {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl') || probeCanvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const rendererStr = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
          if (/llvmpipe|swiftshader|software/i.test(rendererStr)) {
            this.isSoftwareGl = true;
          }
        }
      }
    } catch {
      this.isSoftwareGl = true;
    }
  }

  // =========================================================================
  // PROCEDURAL CANVAS TEXTURES
  // =========================================================================

  private generateProceduralTextures() {
    // 1. Architectural Office Facade Texture with Multi-Tone Lights
    const fCanvas = document.createElement('canvas');
    fCanvas.width = 512;
    fCanvas.height = 512;
    const fCtx = fCanvas.getContext('2d')!;

    // Concrete facade backing
    fCtx.fillStyle = '#1E293B';
    fCtx.fillRect(0, 0, 512, 512);

    const cols = 16;
    const rows = 32;
    const cellW = 512 / cols;
    const cellH = 512 / rows;
    const winW = cellW * 0.72;
    const winH = cellH * 0.65;

    // Mixed city lights: warm tungsten, daylight white, champagne gold, celestial cyan
    const lightTones = [
      '#FF9E44', // Warm tungsten / sodium
      '#FFB366', // Warm amber
      '#F8FAFC', // Daylight white
      '#E2E8F0', // Neutral office white
      '#FDE68A', // Champagne gold
      '#38BDF8', // Celestial blue accent
    ];

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = c * cellW + (cellW - winW) / 2;
        const y = r * cellH + (cellH - winH) / 2;

        // Hash pseudo-randomness for stable pattern
        const rand = Math.sin(c * 19.3 + r * 37.1) * 0.5 + 0.5;

        if (rand > 0.28) {
          const toneIdx = Math.floor(rand * lightTones.length);
          fCtx.fillStyle = lightTones[toneIdx];
          fCtx.fillRect(x, y, winW, winH);

          // Subtle horizontal window divider
          fCtx.fillStyle = 'rgba(15, 23, 42, 0.4)';
          fCtx.fillRect(x, y + winH * 0.5, winW, 1.5);
        } else {
          // Unlit office window (dark reflective glass)
          fCtx.fillStyle = '#0F172A';
          fCtx.fillRect(x, y, winW, winH);
        }
      }
    }

    this.facadeTexture = new THREE.CanvasTexture(fCanvas);
    this.facadeTexture.wrapS = THREE.RepeatWrapping;
    this.facadeTexture.wrapT = THREE.RepeatWrapping;
    this.facadeTexture.repeat.set(2, 4);

    // 2. Procedural Emerald-Twilight Turf Grass Texture
    const tCanvas = document.createElement('canvas');
    tCanvas.width = 256;
    tCanvas.height = 256;
    const tCtx = tCanvas.getContext('2d')!;

    tCtx.fillStyle = '#14332B'; // Base rich turf
    tCtx.fillRect(0, 0, 256, 256);

    // Speckle with organic grass fibers
    for (let i = 0; i < 4000; i++) {
      const rx = Math.random() * 256;
      const ry = Math.random() * 256;
      const rColor = Math.random();
      if (rColor > 0.6) {
        tCtx.fillStyle = 'rgba(37, 92, 69, 0.5)'; // #255C45
      } else if (rColor > 0.3) {
        tCtx.fillStyle = 'rgba(30, 77, 59, 0.4)'; // #1E4D3B
      } else {
        tCtx.fillStyle = 'rgba(15, 38, 32, 0.3)';
      }
      tCtx.fillRect(rx, ry, 1.5, 2.5);
    }

    this.turfTexture = new THREE.CanvasTexture(tCanvas);
    this.turfTexture.wrapS = THREE.RepeatWrapping;
    this.turfTexture.wrapT = THREE.RepeatWrapping;
    this.turfTexture.repeat.set(30, 30);

    // 3. Procedural Botanical Leaf-Stipple Texture (512x512) for Billowing Foliage
    const lCanvas = document.createElement('canvas');
    lCanvas.width = 512;
    lCanvas.height = 512;
    const lCtx = lCanvas.getContext('2d')!;

    lCtx.fillStyle = '#163A2C'; // Base deep emerald
    lCtx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 9000; i++) {
      const lx = Math.random() * 512;
      const ly = Math.random() * 512;
      const rad = 0.8 + Math.random() * 2.2;
      const rTone = Math.random();
      if (rTone > 0.7) {
        lCtx.fillStyle = 'rgba(59, 122, 87, 0.65)'; // Warm golden-green #3B7A57
      } else if (rTone > 0.4) {
        lCtx.fillStyle = 'rgba(36, 89, 67, 0.55)'; // Moonlit sage #245943
      } else if (rTone > 0.15) {
        lCtx.fillStyle = 'rgba(42, 64, 37, 0.45)'; // Subtle warm reflection tint #2A4025
      } else {
        lCtx.fillStyle = 'rgba(15, 38, 28, 0.6)';
      }
      lCtx.beginPath();
      lCtx.arc(lx, ly, rad, 0, Math.PI * 2);
      lCtx.fill();
    }

    this.leafStippleTexture = new THREE.CanvasTexture(lCanvas);
    this.leafStippleTexture.wrapS = THREE.RepeatWrapping;
    this.leafStippleTexture.wrapT = THREE.RepeatWrapping;
    this.leafStippleTexture.repeat.set(4, 4);

    // 4. Architectural Slate Paver / Herringbone Joint Texture (512x512)
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 512;
    pCanvas.height = 512;
    const pCtx = pCanvas.getContext('2d')!;

    pCtx.fillStyle = '#111726'; // Dark recessed joint/mortar lines
    pCtx.fillRect(0, 0, 512, 512);

    const pCols = 8;
    const pRows = 16;
    const pCellW = 512 / pCols;
    const pCellH = 512 / pRows;
    const pGap = 2.5;

    const slateTones = [
      '#253346',
      '#2B3A4F',
      '#212C3D',
      '#304158',
      '#28364A',
      '#1E2837',
    ];

    for (let r = 0; r < pRows; r++) {
      const rowOffset = (r % 2 === 0) ? 0 : pCellW * 0.5;
      for (let c = -1; c <= pCols; c++) {
        const px = c * pCellW + rowOffset + pGap / 2;
        const py = r * pCellH + pGap / 2;
        const pw = pCellW - pGap;
        const ph = pCellH - pGap;

        const randT = Math.sin(c * 17.1 + r * 31.7) * 0.5 + 0.5;
        const toneIdx = Math.floor(randT * slateTones.length);
        pCtx.fillStyle = slateTones[toneIdx];
        pCtx.fillRect(px, py, pw, ph);

        // Subtle internal paver texture / grain lines
        pCtx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        pCtx.fillRect(px, py + ph * 0.45, pw, 1);
      }
    }

    this.paverJointTexture = new THREE.CanvasTexture(pCanvas);
    this.paverJointTexture.wrapS = THREE.RepeatWrapping;
    this.paverJointTexture.wrapT = THREE.RepeatWrapping;
    this.paverJointTexture.repeat.set(2, 20);

    // 5. Gnarled Charcoal-Umber Bark Texture (256x256)
    const bCanvas = document.createElement('canvas');
    bCanvas.width = 256;
    bCanvas.height = 256;
    const bCtx = bCanvas.getContext('2d')!;

    bCtx.fillStyle = '#1F1A17';
    bCtx.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 2000; i++) {
      const bx = Math.random() * 256;
      const by = Math.random() * 256;
      const bw = 1.5 + Math.random() * 2;
      const bh = 4 + Math.random() * 12;
      bCtx.fillStyle = Math.random() > 0.5 ? 'rgba(43, 35, 29, 0.6)' : 'rgba(15, 12, 10, 0.5)';
      bCtx.fillRect(bx, by, bw, bh);
    }

    this.barkTexture = new THREE.CanvasTexture(bCanvas);
    this.barkTexture.wrapS = THREE.RepeatWrapping;
    this.barkTexture.wrapT = THREE.RepeatWrapping;
    this.barkTexture.repeat.set(1, 4);

    // 6. Warm Teak / Cedar Bridge Decking Texture (256x256)
    const tmCanvas = document.createElement('canvas');
    tmCanvas.width = 256;
    tmCanvas.height = 256;
    const tmCtx = tmCanvas.getContext('2d')!;

    tmCtx.fillStyle = '#85522E';
    tmCtx.fillRect(0, 0, 256, 256);

    const plankCount = 16;
    const plankH = 256 / plankCount;
    for (let p = 0; p < plankCount; p++) {
      const py = p * plankH;
      tmCtx.fillStyle = 'rgba(25, 14, 8, 0.45)';
      tmCtx.fillRect(0, py, 256, 2);

      tmCtx.fillStyle = Math.random() > 0.5 ? 'rgba(150, 95, 50, 0.25)' : 'rgba(110, 65, 35, 0.25)';
      tmCtx.fillRect(0, py + 2, 256, plankH - 2);
    }

    this.timberTexture = new THREE.CanvasTexture(tmCanvas);
    this.timberTexture.wrapS = THREE.RepeatWrapping;
    this.timberTexture.wrapT = THREE.RepeatWrapping;
    this.timberTexture.repeat.set(1, 8);
  }

  // =========================================================================
  // SHARED HIGH-VISIBILITY MATERIALS
  // =========================================================================

  private createMaterials() {
    // Brushed Silver-Alabaster Concrete (High visibility, clean architecture)
    this.alabasterConcreteMat = new THREE.MeshStandardMaterial({
      color: 0xCBD5E1,
      roughness: 0.35,
      metalness: 0.25,
    });

    // Travertine Stone (Light architectural trim)
    this.travertineStoneMat = new THREE.MeshStandardMaterial({
      color: 0xE2E8F0,
      roughness: 0.45,
      metalness: 0.15,
    });

    // Translucent Starlight Glass
    this.starlightGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x1E294B,
      metalness: 0.1,
      roughness: 0.08,
      transmission: 0.82,
      ior: 1.48,
      transparent: true,
      opacity: 0.85,
    });

    // Reflective Exterior Curtain Glass
    this.reflectiveGlassMat = new THREE.MeshStandardMaterial({
      color: 0x1E293B,
      roughness: 0.12,
      metalness: 0.88,
    });

    // Celestial Slate (Podiums and Structural Shells)
    this.celestialSlateMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.35,
      metalness: 0.55,
    });

    // Titanium & Aluminum Framing
    this.titaniumFrameMat = new THREE.MeshStandardMaterial({
      color: 0x64748B,
      roughness: 0.2,
      metalness: 0.8,
    });

    // Emissive Facade Material with the procedural city window texture
    this.facadeLitMat = new THREE.MeshStandardMaterial({
      map: this.facadeTexture,
      roughness: 0.3,
      metalness: 0.4,
    });

    // Glowing Cyan Data-Stream & Floor Lights
    this.glowingCyanMat = new THREE.MeshBasicMaterial({
      color: 0x38BDF8,
    });

    // Glowing Amber Window Beacon & Elevators
    this.glowingAmberMat = new THREE.MeshBasicMaterial({
      color: 0xFFB366,
    });

    // Reflective River Water
    this.waterMat = new THREE.MeshStandardMaterial({
      color: 0x0A192F,
      roughness: 0.06,
      metalness: 0.92,
    });

    // Emerald-Twilight Turf Lawn
    this.turfMat = new THREE.MeshStandardMaterial({
      map: this.turfTexture,
      roughness: 0.85,
      metalness: 0.08,
    });

    // Paved Winding Boulevards (Slate Asphalt)
    this.roadMat = new THREE.MeshStandardMaterial({
      color: 0x242C3D,
      roughness: 0.7,
      metalness: 0.2,
    });

    // Stone Curbs
    this.curbMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.5,
      metalness: 0.2,
    });

    // Dedicated Botanical Canopy Materials (Leaf-Stipple Bump & High Definition Shading)
    this.foliageMat = new THREE.MeshStandardMaterial({
      color: 0x163A2C, // Deep Emerald Base
      bumpMap: this.leafStippleTexture,
      bumpScale: 0.35,
      roughness: 0.75,
      metalness: 0.05,
    });

    this.foliageSageMat = new THREE.MeshStandardMaterial({
      color: 0x245943, // Moonlit Sage / Mid-Tone
      bumpMap: this.leafStippleTexture,
      bumpScale: 0.35,
      roughness: 0.72,
      metalness: 0.05,
    });

    this.foliageWarmMat = new THREE.MeshStandardMaterial({
      color: 0x3B7A57, // Warm Golden-Green Fringe
      bumpMap: this.leafStippleTexture,
      bumpScale: 0.35,
      roughness: 0.70,
      metalness: 0.05,
    });

    this.foliageSubsurfaceMat = new THREE.MeshStandardMaterial({
      color: 0x2A4025, // Subtle warm ambient reflection tint
      bumpMap: this.leafStippleTexture,
      bumpScale: 0.35,
      roughness: 0.75,
      metalness: 0.05,
    });

    // Gnarled Charcoal-Umber Trunk Bark
    this.trunkBarkMat = new THREE.MeshStandardMaterial({
      color: 0x241D18,
      bumpMap: this.barkTexture,
      bumpScale: 0.28,
      roughness: 0.88,
      metalness: 0.08,
    });

    // Architectural Slate Paver Material (Layer 1)
    this.paverMat = new THREE.MeshStandardMaterial({
      map: this.paverJointTexture,
      roughness: 0.55,
      metalness: 0.22,
    });

    // Raised Brushed Granite Curbs (Layer 2)
    this.pathCurbMat = new THREE.MeshStandardMaterial({
      color: 0x64748B,
      roughness: 0.40,
      metalness: 0.28,
    });

    // Inlaid Warm-Gold Ground LED Guide Strips (Layer 3)
    this.pathLedStripMat = new THREE.MeshBasicMaterial({
      color: 0xFFB366,
    });

    // Warm Architectural Teak Wood Decking & Benches (Layer 4)
    this.timberDeckMat = new THREE.MeshStandardMaterial({
      map: this.timberTexture,
      roughness: 0.65,
      metalness: 0.12,
    });

    // Chamfered Structural Dark Steel
    this.darkSteelMat = new THREE.MeshStandardMaterial({
      color: 0x1E2533,
      roughness: 0.25,
      metalness: 0.85,
    });

    // Illuminated Warm Handrail
    this.warmHandrailMat = new THREE.MeshBasicMaterial({
      color: 0xFFB366,
    });
  }

  // =========================================================================
  // LIGHTING SYSTEM (BOOSTED ILLUMINATION & PLAZA WARM ACCENTS)
  // =========================================================================

  private setupLighting() {
    // 1. Warm Hemisphere Light (Sky: Soft Celestial Blue #93C5FD, Ground: Rich Emerald Turf #1E3A2F, intensity: 1.3)
    const hemiLight = new THREE.HemisphereLight(0x93C5FD, 0x1E3A2F, 1.3);
    hemiLight.position.set(0, 350, 0);
    this.scene.add(hemiLight);

    // 2. High Moon/Twilight Key Directional Light (intensity: 1.8)
    const keyMoonLight = new THREE.DirectionalLight(0xE0F2FE, 1.8);
    keyMoonLight.position.set(180, 260, 160);
    this.scene.add(keyMoonLight);

    // 3. Accent Indigo Rim Light from Opposite Horizon
    const rimLight = new THREE.DirectionalLight(0x6366F1, 1.2);
    rimLight.position.set(-190, 160, -180);
    this.scene.add(rimLight);

    // 4. Central Campus Concourse Point Fill
    const centralPoint = new THREE.PointLight(0x38BDF8, 1.5, 320);
    centralPoint.position.set(0, 30, 0);
    this.scene.add(centralPoint);
  }

  // =========================================================================
  // STARFIELD CANOPY
  // =========================================================================

  private createStarfield() {
    const count = 1800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const cWhite = new THREE.Color(0xF8FAFC);
    const cCyan = new THREE.Color(0x38BDF8);
    const cIndigo = new THREE.Color(0x818CF8);

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0) * 0.48;
      const r = 500 + Math.random() * 300;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = Math.abs(r * Math.cos(phi)) + 50;
      const z = r * Math.sin(phi) * Math.sin(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const randC = Math.random();
      const col = randC > 0.65 ? cWhite : randC > 0.3 ? cCyan : cIndigo;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);
  }

  // =========================================================================
  // NATURAL LANDSCAPE: S-CURVE RIVER, SCULPTED TURF & WINDING BOULEVARDS
  // =========================================================================

  private createLandscapeAndRiver() {
    // 1. Sprawling Emerald Base Ground Plane (650x650)
    const groundGeo = new THREE.PlaneGeometry(650, 650);
    const ground = new THREE.Mesh(groundGeo, this.turfMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.2;
    this.scene.add(ground);

    // 2. Sculpted Organic Grassy Berms & Terraced Mounds
    const bermData = [
      { x: -40, z: -40, r: 24, h: 2.4 },
      { x: 35, z: -35, r: 22, h: 2.2 },
      { x: -50, z: 45, r: 26, h: 2.5 },
      { x: 40, z: 40, r: 20, h: 2.0 },
      { x: 0, z: 105, r: 28, h: 2.8 },
      { x: -115, z: -45, r: 25, h: 3.2 },
      { x: 110, z: -55, r: 25, h: 3.0 },
    ];

    bermData.forEach((b) => {
      const bermGeo = new THREE.CylinderGeometry(b.r * 0.7, b.r, b.h, 24);
      const berm = new THREE.Mesh(bermGeo, this.turfMat);
      berm.position.set(b.x, b.h / 2 - 0.1, b.z);
      this.scene.add(berm);
    });

    // 3. S-Curve River / Parkway Spine flowing from North to South
    const riverCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(15, 0.05, -220),
      new THREE.Vector3(-25, 0.05, -130),
      new THREE.Vector3(-10, 0.05, -50),
      new THREE.Vector3(18, 0.05, 10),
      new THREE.Vector3(-15, 0.05, 75),
      new THREE.Vector3(25, 0.05, 150),
      new THREE.Vector3(10, 0.05, 230),
    ]);

    const riverPoints = riverCurve.getPoints(80);
    const riverGeo = new THREE.BufferGeometry();
    const riverPos: number[] = [];
    const riverIndices: number[] = [];
    const riverHalfWidth = 12;

    for (let i = 0; i < riverPoints.length; i++) {
      const pt = riverPoints[i];
      let tangent = new THREE.Vector3(0, 0, 1);
      if (i < riverPoints.length - 1) {
        tangent = riverPoints[i + 1].clone().sub(pt).normalize();
      } else {
        tangent = pt.clone().sub(riverPoints[i - 1]).normalize();
      }
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      const left = pt.clone().add(normal.clone().multiplyScalar(riverHalfWidth));
      const right = pt.clone().add(normal.clone().multiplyScalar(-riverHalfWidth));

      riverPos.push(left.x, 0.1, left.z);
      riverPos.push(right.x, 0.1, right.z);

      if (i < riverPoints.length - 1) {
        const base = i * 2;
        riverIndices.push(base, base + 1, base + 2);
        riverIndices.push(base + 1, base + 3, base + 2);
      }
    }

    riverGeo.setAttribute('position', new THREE.Float32BufferAttribute(riverPos, 3));
    riverGeo.setIndex(riverIndices);
    riverGeo.computeVertexNormals();

    const riverMesh = new THREE.Mesh(riverGeo, this.waterMat);
    this.scene.add(riverMesh);

    // Stone river embankments along left and right banks
    const riverBorders = [-riverHalfWidth - 0.8, riverHalfWidth + 0.8];
    riverBorders.forEach((offset) => {
      const edgePoints = riverCurve.getPoints(60).map((pt, i, arr) => {
        const next = arr[Math.min(i + 1, arr.length - 1)];
        const prev = arr[Math.max(i - 1, 0)];
        const tan = next.clone().sub(prev).normalize();
        const norm = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
        return pt.clone().add(norm.multiplyScalar(offset)).setY(0.4);
      });
      const edgeCurve = new THREE.CatmullRomCurve3(edgePoints);
      const edgeGeo = new THREE.TubeGeometry(edgeCurve, 60, 0.6, 6, false);
      const edgeMesh = new THREE.Mesh(edgeGeo, this.curbMat);
      this.scene.add(edgeMesh);
    });

    // 4. Ultra-Detailed 4-Layer Master-Planned Campus Hardscape & Bridges
    this.createDetailedCampusPaths();
  }

  // =========================================================================
  // 4-LAYER MASTER-PLANNED HARDSCAPE: PAVERS, CURBS, LED STRIPS & PLAZAS
  // =========================================================================

  private createDetailedCampusPaths() {
    const hardscapeGroup = new THREE.Group();

    // 5 Primary Masterplan Spines
    const pathSplinePoints = [
      // 1. West Parkway: Stripe [-80, -85] -> Linear [-95, 5] -> Anthropic [-70, 90]
      [
        new THREE.Vector3(-80, 0.1, -85),
        new THREE.Vector3(-105, 0.1, -40),
        new THREE.Vector3(-95, 0.1, 5),
        new THREE.Vector3(-100, 0.1, 50),
        new THREE.Vector3(-70, 0.1, 90),
      ],
      // 2. East Parkway: Databricks [75, -95] -> Cloudflare [85, -10] -> Vercel [60, 75] -> Figma [80, 135]
      [
        new THREE.Vector3(75, 0.1, -95),
        new THREE.Vector3(95, 0.1, -50),
        new THREE.Vector3(85, 0.1, -10),
        new THREE.Vector3(70, 0.1, 35),
        new THREE.Vector3(60, 0.1, 75),
        new THREE.Vector3(75, 0.1, 110),
        new THREE.Vector3(80, 0.1, 135),
      ],
      // 3. North Concourse Walkway (Stripe to Databricks crossing River Bridge 1)
      [
        new THREE.Vector3(-80, 0.1, -85),
        new THREE.Vector3(-45, 0.1, -88),
        new THREE.Vector3(-18, 0.1, -90), // Bridge 1 landing
        new THREE.Vector3(25, 0.1, -92),
        new THREE.Vector3(75, 0.1, -95),
      ],
      // 4. Mid Concourse Walkway (Linear to Cloudflare crossing River Bridge 2)
      [
        new THREE.Vector3(-95, 0.1, 5),
        new THREE.Vector3(-40, 0.1, 10),
        new THREE.Vector3(14, 0.1, 12),  // Bridge 2 landing
        new THREE.Vector3(50, 0.1, 6),
        new THREE.Vector3(85, 0.1, -10),
      ],
      // 5. South Concourse Walkway (Anthropic -> OpenAI -> Vercel crossing River Bridge 3)
      [
        new THREE.Vector3(-70, 0.1, 90),
        new THREE.Vector3(-45, 0.1, 110),
        new THREE.Vector3(-20, 0.1, 130), // OpenAI Concourse
        new THREE.Vector3(5, 0.1, 110),   // Bridge 3 landing
        new THREE.Vector3(28, 0.1, 95),
        new THREE.Vector3(60, 0.1, 75),   // Vercel
      ],
    ];

    const halfW = 2.8;      // Paver walkway half-width (5.6m total width)
    const curbW = 0.32;     // Raised curb width
    const ledW = 0.14;      // Recessed ground LED guide strip width

    pathSplinePoints.forEach((pts) => {
      const curve = new THREE.CatmullRomCurve3(pts);
      const divisions = 70;
      const curvePts = curve.getPoints(divisions);

      // Compute cumulative arc length for seamless paver UV texture mapping
      const cumDistances: number[] = [0];
      for (let i = 1; i < curvePts.length; i++) {
        cumDistances.push(cumDistances[i - 1] + curvePts[i].distanceTo(curvePts[i - 1]));
      }

      // ---------------------------------------------------------------------
      // LAYER 1: RECESSED SLATE PAVER / HERRINGBONE SURFACE (y = 0.08)
      // ---------------------------------------------------------------------
      const paverGeo = new THREE.BufferGeometry();
      const paverPos: number[] = [];
      const paverUvs: number[] = [];
      const paverIndices: number[] = [];

      // ---------------------------------------------------------------------
      // LAYER 2: RAISED CHAMFERED GRANITE CURBS (h = 0.22, #64748B)
      // ---------------------------------------------------------------------
      const curbGeo = new THREE.BufferGeometry();
      const curbPos: number[] = [];
      const curbIndices: number[] = [];

      // ---------------------------------------------------------------------
      // LAYER 3: INLAID WARM-GOLD GROUND LED GUIDE STRIPS (y = 0.11, #FFB366)
      // ---------------------------------------------------------------------
      const ledGeo = new THREE.BufferGeometry();
      const ledPos: number[] = [];
      const ledIndices: number[] = [];

      for (let i = 0; i < curvePts.length; i++) {
        const pt = curvePts[i];
        let tan = new THREE.Vector3(0, 0, 1);
        if (i < curvePts.length - 1) tan = curvePts[i + 1].clone().sub(pt).normalize();
        else tan = pt.clone().sub(curvePts[i - 1]).normalize();

        const norm = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
        const dist = cumDistances[i];
        const vCoord = dist * 0.28;

        // Paver surface vertices (recessed y = 0.08)
        const pLeft = pt.clone().add(norm.clone().multiplyScalar(halfW));
        const pRight = pt.clone().add(norm.clone().multiplyScalar(-halfW));
        paverPos.push(pLeft.x, 0.08, pLeft.z);
        paverPos.push(pRight.x, 0.08, pRight.z);
        paverUvs.push(0, vCoord);
        paverUvs.push(1, vCoord);

        // Left Raised Granite Curb (outer edge to inner edge)
        const cLeftOuter = pt.clone().add(norm.clone().multiplyScalar(halfW + curbW));
        const cLeftInner = pt.clone().add(norm.clone().multiplyScalar(halfW));
        curbPos.push(cLeftOuter.x, 0.22, cLeftOuter.z);
        curbPos.push(cLeftInner.x, 0.22, cLeftInner.z);

        // Right Raised Granite Curb
        const cRightInner = pt.clone().add(norm.clone().multiplyScalar(-halfW));
        const cRightOuter = pt.clone().add(norm.clone().multiplyScalar(-halfW - curbW));
        curbPos.push(cRightInner.x, 0.22, cRightInner.z);
        curbPos.push(cRightOuter.x, 0.22, cRightOuter.z);

        // Left & Right Inlaid Warm-Gold LED Strips (recessed into curb lip at y = 0.11)
        const ledLeftOuter = pt.clone().add(norm.clone().multiplyScalar(halfW));
        const ledLeftInner = pt.clone().add(norm.clone().multiplyScalar(halfW - ledW));
        ledPos.push(ledLeftOuter.x, 0.11, ledLeftOuter.z);
        ledPos.push(ledLeftInner.x, 0.11, ledLeftInner.z);

        const ledRightInner = pt.clone().add(norm.clone().multiplyScalar(-halfW + ledW));
        const ledRightOuter = pt.clone().add(norm.clone().multiplyScalar(-halfW));
        ledPos.push(ledRightInner.x, 0.11, ledRightInner.z);
        ledPos.push(ledRightOuter.x, 0.11, ledRightOuter.z);

        // Indices
        if (i < curvePts.length - 1) {
          const bP = i * 2;
          paverIndices.push(bP, bP + 1, bP + 2);
          paverIndices.push(bP + 1, bP + 3, bP + 2);

          // Left curb quads (stride of 4)
          const bC = i * 4;
          curbIndices.push(bC, bC + 1, bC + 4);
          curbIndices.push(bC + 1, bC + 5, bC + 4);
          // Right curb quads
          curbIndices.push(bC + 2, bC + 3, bC + 6);
          curbIndices.push(bC + 3, bC + 7, bC + 6);

          // Left LED strip quads (stride of 4)
          const bL = i * 4;
          ledIndices.push(bL, bL + 1, bL + 4);
          ledIndices.push(bL + 1, bL + 5, bL + 4);
          // Right LED strip quads
          ledIndices.push(bL + 2, bL + 3, bL + 6);
          ledIndices.push(bL + 3, bL + 7, bL + 6);
        }
      }

      // Finalize Layer 1: Paver Ribbon Mesh
      paverGeo.setAttribute('position', new THREE.Float32BufferAttribute(paverPos, 3));
      paverGeo.setAttribute('uv', new THREE.Float32BufferAttribute(paverUvs, 2));
      paverGeo.setIndex(paverIndices);
      paverGeo.computeVertexNormals();
      const paverMesh = new THREE.Mesh(paverGeo, this.paverMat);
      hardscapeGroup.add(paverMesh);

      // Finalize Layer 2: Raised Granite Curb Mesh
      curbGeo.setAttribute('position', new THREE.Float32BufferAttribute(curbPos, 3));
      curbGeo.setIndex(curbIndices);
      curbGeo.computeVertexNormals();
      const curbMesh = new THREE.Mesh(curbGeo, this.pathCurbMat);
      hardscapeGroup.add(curbMesh);

      // Finalize Layer 3: Inlaid Warm-Gold LED Strip Mesh
      ledGeo.setAttribute('position', new THREE.Float32BufferAttribute(ledPos, 3));
      ledGeo.setIndex(ledIndices);
      const ledMesh = new THREE.Mesh(ledGeo, this.pathLedStripMat);
      hardscapeGroup.add(ledMesh);
    });

    // -----------------------------------------------------------------------
    // LAYER 4: PLAZA NODES, WOODEN BRIDGES & CANTILEVERED PARK BENCHES
    // -----------------------------------------------------------------------

    // A. 4 Circular Stone Courtyard Rotundas with Concentric Paver Rings
    const rotundas = [
      { x: 0, z: 10, radius: 16, feature: 'fountain' },       // Central Concourse Rotunda
      { x: -65, z: -85, radius: 13, feature: 'heroTree' },    // Stripe Pavilion Plaza
      { x: 60, z: -95, radius: 13, feature: 'medallion' },   // Databricks Lakehouse Plaza
      { x: -15, z: 115, radius: 14, feature: 'heroTree' },    // OpenAI South Concourse Plaza
    ];

    rotundas.forEach((rot) => {
      const rotGroup = new THREE.Group();
      rotGroup.position.set(rot.x, 0, rot.z);

      // Outer concentric stone slab (y = 0.09)
      const outerRingGeo = new THREE.CylinderGeometry(rot.radius, rot.radius, 0.18, 36);
      const outerRing = new THREE.Mesh(outerRingGeo, this.paverMat);
      outerRing.position.y = 0.09;
      rotGroup.add(outerRing);

      // Raised perimeter granite curb
      const rotCurbGeo = new THREE.RingGeometry(rot.radius - 0.5, rot.radius + 0.2, 36);
      const rotCurb = new THREE.Mesh(rotCurbGeo, this.pathCurbMat);
      rotCurb.rotation.x = -Math.PI / 2;
      rotCurb.position.y = 0.24;
      rotGroup.add(rotCurb);

      // Inlaid perimeter warm-gold LED ring
      const ledRingGeo = new THREE.RingGeometry(rot.radius - 0.72, rot.radius - 0.54, 36);
      const ledRing = new THREE.Mesh(ledRingGeo, this.pathLedStripMat);
      ledRing.rotation.x = -Math.PI / 2;
      ledRing.position.y = 0.25;
      rotGroup.add(ledRing);

      if (rot.feature === 'fountain') {
        // Central Reflecting Fountain Pool with Cyan Underwater Glow
        const poolCurbGeo = new THREE.CylinderGeometry(5.2, 5.5, 0.5, 32);
        const poolCurb = new THREE.Mesh(poolCurbGeo, this.pathCurbMat);
        poolCurb.position.y = 0.35;
        rotGroup.add(poolCurb);

        const waterDiscGeo = new THREE.CircleGeometry(5.0, 32);
        const poolWater = new THREE.Mesh(waterDiscGeo, this.waterMat);
        poolWater.rotation.x = -Math.PI / 2;
        poolWater.position.y = 0.55;
        rotGroup.add(poolWater);

        // Glowing underwater ring
        const cyanRingGeo = new THREE.RingGeometry(4.7, 5.0, 32);
        const cyanRing = new THREE.Mesh(cyanRingGeo, this.glowingCyanMat);
        cyanRing.rotation.x = -Math.PI / 2;
        cyanRing.position.y = 0.56;
        rotGroup.add(cyanRing);
      } else if (rot.feature === 'heroTree') {
        // Raised Planter Bed encircling Hero Tree with Ground Uplighting Ring
        const planterCurbGeo = new THREE.CylinderGeometry(4.2, 4.5, 0.55, 28);
        const planterCurb = new THREE.Mesh(planterCurbGeo, this.pathCurbMat);
        planterCurb.position.y = 0.38;
        rotGroup.add(planterCurb);

        // Rich turf inside planter
        const turfDiscGeo = new THREE.CircleGeometry(4.0, 28);
        const planterTurf = new THREE.Mesh(turfDiscGeo, this.turfMat);
        planterTurf.rotation.x = -Math.PI / 2;
        planterTurf.position.y = 0.62;
        rotGroup.add(planterTurf);

        // Warm ground uplighting fixture ring
        const uplightRingGeo = new THREE.RingGeometry(3.6, 3.9, 28);
        const uplightRing = new THREE.Mesh(uplightRingGeo, this.pathLedStripMat);
        uplightRing.rotation.x = -Math.PI / 2;
        uplightRing.position.y = 0.64;
        rotGroup.add(uplightRing);
      } else {
        // Geometric Compass Rosette Medallion
        const medGeo = new THREE.CircleGeometry(4.5, 12);
        const med = new THREE.Mesh(medGeo, this.celestialSlateMat);
        med.rotation.x = -Math.PI / 2;
        med.position.y = 0.22;
        rotGroup.add(med);

        const starGeo = new THREE.RingGeometry(2.0, 2.3, 8);
        const star = new THREE.Mesh(starGeo, this.pathLedStripMat);
        star.rotation.x = -Math.PI / 2;
        star.position.y = 0.23;
        rotGroup.add(star);
      }

      hardscapeGroup.add(rotGroup);
    });

    // B. Modern Architectural Cantilevered Teak Park Benches
    const benchLocations = [
      { x: -75, z: -60, rot: 0.4 },
      { x: -92, z: -20, rot: -0.3 },
      { x: -88, z: 25, rot: 0.2 },
      { x: -60, z: 100, rot: -0.5 },
      { x: -35, z: 120, rot: 0.1 },
      { x: 10, z: 95, rot: -0.2 },
      { x: 55, z: 85, rot: 0.4 },
      { x: 72, z: 50, rot: -0.3 },
      { x: 80, z: 10, rot: 0.1 },
      { x: 88, z: -35, rot: -0.4 },
      { x: 70, z: -75, rot: 0.3 },
      { x: -12, z: -75, rot: 0.0 },
      { x: 18, z: -5, rot: -0.2 },
      { x: -5, z: 25, rot: 0.3 },
    ];

    benchLocations.forEach((b) => {
      const bench = new THREE.Group();
      bench.position.set(b.x, 0, b.z);
      bench.rotation.y = b.rot;

      // Floating cantilevered teak wood seat slab (2.4m x 0.65m x 0.14m)
      const seatGeo = new THREE.BoxGeometry(2.4, 0.14, 0.65);
      const seat = new THREE.Mesh(seatGeo, this.timberDeckMat);
      seat.position.y = 0.68;
      bench.add(seat);

      // Angled teak backrest slab (2.4m x 0.10m x 0.45m)
      const backGeo = new THREE.BoxGeometry(2.4, 0.45, 0.10);
      const back = new THREE.Mesh(backGeo, this.timberDeckMat);
      back.position.set(0, 1.02, -0.32);
      back.rotation.x = -0.18;
      bench.add(back);

      // Dual dark steel cantilever bracket legs
      const legGeo = new THREE.BoxGeometry(0.12, 0.68, 0.62);
      const leg1 = new THREE.Mesh(legGeo, this.darkSteelMat);
      leg1.position.set(-0.85, 0.34, 0);
      const leg2 = new THREE.Mesh(legGeo, this.darkSteelMat);
      leg2.position.set(0.85, 0.34, 0);
      bench.add(leg1, leg2);

      // Soft warm ground-wash LED strip under the floating seat
      const washGeo = new THREE.BoxGeometry(2.2, 0.04, 0.10);
      const wash = new THREE.Mesh(washGeo, this.pathLedStripMat);
      wash.position.set(0, 0.58, 0.1);
      bench.add(wash);

      hardscapeGroup.add(bench);
    });

    // C. 3 Arched Timber-and-Steel River Footbridges with Illuminated Glass Railings
    const riverBridges = [
      { x: -18, z: -90, rot: -0.2, span: 32 },  // North Bridge (Stripe to Databricks)
      { x: 14, z: 12, rot: 0.3, span: 32 },     // Central Bridge (Linear to Cloudflare)
      { x: 5, z: 110, rot: -0.15, span: 32 },   // South Bridge (OpenAI to Figma)
    ];

    riverBridges.forEach((br) => {
      const bridgeGroup = new THREE.Group();
      bridgeGroup.position.set(br.x, 0, br.z);
      bridgeGroup.rotation.y = br.rot;

      const segs = 32;
      const span = br.span;
      const bWidth = 6.4;

      // 1. Arched curved timber plank deck
      const deckGeo = new THREE.BufferGeometry();
      const deckPos: number[] = [];
      const deckUvs: number[] = [];
      const deckIndices: number[] = [];

      // 2. Structural dark steel arch girders (left & right)
      const girderPos: number[] = [];
      const girderIndices: number[] = [];

      for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const relZ = (t - 0.5) * span;
        // Parabolic arch profile: crown at y = 3.2, landings at y = 1.0
        const archY = 1.0 + Math.sin(t * Math.PI) * 2.2;

        // Timber deck points
        deckPos.push(-bWidth / 2, archY, relZ);
        deckPos.push(bWidth / 2, archY, relZ);
        deckUvs.push(0, t * 12);
        deckUvs.push(1, t * 12);

        // Steel girders directly under deck edges
        girderPos.push(-bWidth / 2 + 0.35, archY - 0.45, relZ);
        girderPos.push(bWidth / 2 - 0.35, archY - 0.45, relZ);

        if (s < segs) {
          const bD = s * 2;
          deckIndices.push(bD, bD + 1, bD + 2);
          deckIndices.push(bD + 1, bD + 3, bD + 2);

          girderIndices.push(bD, bD + 1, bD + 2);
          girderIndices.push(bD + 1, bD + 3, bD + 2);
        }
      }

      deckGeo.setAttribute('position', new THREE.Float32BufferAttribute(deckPos, 3));
      deckGeo.setAttribute('uv', new THREE.Float32BufferAttribute(deckUvs, 2));
      deckGeo.setIndex(deckIndices);
      deckGeo.computeVertexNormals();
      const deckMesh = new THREE.Mesh(deckGeo, this.timberDeckMat);
      bridgeGroup.add(deckMesh);

      // Under-deck structural steel arch ribs
      const girderGeo = new THREE.BufferGeometry();
      girderGeo.setAttribute('position', new THREE.Float32BufferAttribute(girderPos, 3));
      girderGeo.setIndex(girderIndices);
      girderGeo.computeVertexNormals();
      const girderMesh = new THREE.Mesh(girderGeo, this.darkSteelMat);
      bridgeGroup.add(girderMesh);

      // Glass side parapets with Illuminated Warm-Gold Handrails
      for (let s = 0; s < segs; s++) {
        const t = (s + 0.5) / segs;
        const relZ = (t - 0.5) * span;
        const archY = 1.0 + Math.sin(t * Math.PI) * 2.2;
        const segLen = span / segs + 0.1;

        // Left & Right Glass Panels
        const glassGeo = new THREE.BoxGeometry(0.18, 1.25, segLen);
        const glassL = new THREE.Mesh(glassGeo, this.starlightGlassMat);
        glassL.position.set(-bWidth / 2 + 0.1, archY + 0.65, relZ);
        const glassR = new THREE.Mesh(glassGeo, this.starlightGlassMat);
        glassR.position.set(bWidth / 2 - 0.1, archY + 0.65, relZ);
        bridgeGroup.add(glassL, glassR);

        // Warm-Gold Illuminated Handrail Strips on top of glass
        const railGeo = new THREE.BoxGeometry(0.24, 0.08, segLen);
        const railL = new THREE.Mesh(railGeo, this.warmHandrailMat);
        railL.position.set(-bWidth / 2 + 0.1, archY + 1.28, relZ);
        const railR = new THREE.Mesh(railGeo, this.warmHandrailMat);
        railR.position.set(bWidth / 2 - 0.1, archY + 1.28, relZ);
        bridgeGroup.add(railL, railR);
      }

      // Under-deck cyan LED accent band casting soft reflection onto water
      const ledRibbonGeo = new THREE.BoxGeometry(bWidth - 1.2, 0.15, span * 0.85);
      const ledRibbon = new THREE.Mesh(ledRibbonGeo, this.glowingCyanMat);
      ledRibbon.position.y = 1.8;
      bridgeGroup.add(ledRibbon);

      hardscapeGroup.add(bridgeGroup);
    });

    this.scene.add(hardscapeGroup);
  }

  // =========================================================================
  // DISTANT METROPOLITAN BACKGROUND SKYLINE
  // =========================================================================

  private createBackgroundSkyline() {
    const skylineGroup = new THREE.Group();
    const count = 38;

    // Distant background tower materials
    const distMat = new THREE.MeshStandardMaterial({
      color: 0x141B2D,
      roughness: 0.4,
      metalness: 0.6,
    });

    const towerGeo = new THREE.BoxGeometry(1, 1, 1);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 1.8 - 0.4;
      const dist = 240 + Math.random() * 90;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist - 30;

      const w = 18 + Math.random() * 22;
      const d = 16 + Math.random() * 20;
      const h = 55 + Math.random() * 95;

      const tower = new THREE.Mesh(towerGeo, distMat);
      tower.scale.set(w, h, d);
      tower.position.set(x, h / 2, z);
      skylineGroup.add(tower);

      // Crown setback or spire
      if (Math.random() > 0.4) {
        const spireH = 14 + Math.random() * 25;
        const spire = new THREE.Mesh(towerGeo, this.titaniumFrameMat);
        spire.scale.set(w * 0.4, spireH, d * 0.4);
        spire.position.set(x, h + spireH / 2, z);
        skylineGroup.add(spire);

        // Warning red beacon on spire tip
        const beaconGeo = new THREE.SphereGeometry(0.8, 6, 6);
        const beacon = new THREE.Mesh(beaconGeo, new THREE.MeshBasicMaterial({ color: 0xEF4444 }));
        beacon.position.set(x, h + spireH, z);
        skylineGroup.add(beacon);
        this.warningBeacons.push(beacon);
      }
    }

    this.scene.add(skylineGroup);
  }

  // =========================================================================
  // 1,200+ INSTANCED TREES & 160+ GLOWING BOLLARDS (HIGH PERFORMANCE)
  // =========================================================================

  // Helper: Buffer geometry merge utility for compound gnarled trunks
  private mergeBufferGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
    let totalPositions = 0;
    let totalIndices = 0;

    geometries.forEach((g) => {
      totalPositions += g.attributes.position.count * 3;
      if (g.index) totalIndices += g.index.count;
      else totalIndices += g.attributes.position.count;
    });

    const mergedPos = new Float32Array(totalPositions);
    const mergedNorm = new Float32Array(totalPositions);
    const mergedUvs = new Float32Array((totalPositions / 3) * 2);
    const mergedIndices: number[] = [];

    let posOffset = 0;
    let uvOffset = 0;
    let indexVertexOffset = 0;

    geometries.forEach((g) => {
      const posAttr = g.attributes.position;
      const normAttr = g.attributes.normal;
      const uvAttr = g.attributes.uv;

      for (let i = 0; i < posAttr.count; i++) {
        mergedPos[posOffset + i * 3] = posAttr.getX(i);
        mergedPos[posOffset + i * 3 + 1] = posAttr.getY(i);
        mergedPos[posOffset + i * 3 + 2] = posAttr.getZ(i);

        if (normAttr) {
          mergedNorm[posOffset + i * 3] = normAttr.getX(i);
          mergedNorm[posOffset + i * 3 + 1] = normAttr.getY(i);
          mergedNorm[posOffset + i * 3 + 2] = normAttr.getZ(i);
        }

        if (uvAttr) {
          mergedUvs[uvOffset + i * 2] = uvAttr.getX(i);
          mergedUvs[uvOffset + i * 2 + 1] = uvAttr.getY(i);
        }
      }

      if (g.index) {
        for (let j = 0; j < g.index.count; j++) {
          mergedIndices.push(g.index.getX(j) + indexVertexOffset);
        }
      } else {
        for (let j = 0; j < posAttr.count; j++) {
          mergedIndices.push(j + indexVertexOffset);
        }
      }

      indexVertexOffset += posAttr.count;
      posOffset += posAttr.count * 3;
      uvOffset += posAttr.count * 2;
    });

    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.BufferAttribute(mergedPos, 3));
    merged.setAttribute('normal', new THREE.BufferAttribute(mergedNorm, 3));
    merged.setAttribute('uv', new THREE.BufferAttribute(mergedUvs, 2));
    merged.setIndex(mergedIndices);
    merged.computeVertexNormals();
    return merged;
  }

  // 1A. Custom Vertex-Displaced Organic Foliage Geometry Generator
  private createOrganicCanopyGeometry(
    baseRadius: number,
    type: 'broad' | 'tiered' | 'columnar'
  ): THREE.BufferGeometry {
    const geo = new THREE.IcosahedronGeometry(baseRadius, 3);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      if (type === 'broad') {
        // Broad sprawling oak/banyan canopy (flattened ellipsoid with billowing lobes)
        x *= 1.35;
        y *= 0.82;
        z *= 1.35;
        const n1 = Math.sin(x * 0.55) * Math.cos(y * 0.55) * Math.sin(z * 0.55);
        const n2 = Math.sin(x * 1.25 + 1.2) * Math.cos(y * 1.25 + 0.8) * Math.sin(z * 1.25 + 2.1) * 0.45;
        const n3 = Math.sin(x * 2.7 + 2.5) * Math.cos(z * 2.7 + 1.4) * 0.22;
        const disp = 1.0 + (n1 + n2 + n3) * 0.35;
        if (y < -0.1) y *= 0.72; // slight concave underside for branches
        pos.setXYZ(i, x * disp, y * disp + 6.0, z * disp);
      } else if (type === 'tiered') {
        // Tiered flowering canopy with undulating stacked botanical lobes
        x *= 1.15;
        y *= 1.05;
        z *= 1.15;
        const tierWave = Math.sin(y * 1.6) * 0.32;
        const n1 = Math.sin(x * 0.75) * Math.cos(z * 0.75) * 0.38;
        const n2 = Math.sin(x * 1.7 + y) * Math.cos(z * 1.7 + y) * 0.24;
        const disp = 1.0 + tierWave + n1 + n2;
        pos.setXYZ(i, x * disp, y * disp + 5.8, z * disp);
      } else {
        // Dense columnar canopy: vertical architectural silhouette
        x *= 0.85;
        y *= 1.38;
        z *= 0.85;
        const n1 = Math.sin(x * 0.85) * Math.cos(y * 0.48) * Math.sin(z * 0.85);
        const n2 = Math.sin(x * 2.1 + 0.5) * Math.cos(y * 1.7 + 0.3) * Math.sin(z * 2.1 + 0.7) * 0.32;
        const disp = 1.0 + (n1 + n2) * 0.28;
        pos.setXYZ(i, x * disp, y * disp + 6.2, z * disp);
      }
    }

    geo.computeVertexNormals();
    return geo;
  }

  // 1D. Gnarled Multi-Forked Tapered Trunk Generator
  private createGnarledTrunkGeometry(): THREE.BufferGeometry {
    // Main flared base trunk
    const trunkBase = new THREE.CylinderGeometry(0.38, 0.65, 4.2, 8);
    trunkBase.translate(0, 2.1, 0);

    // Branch 1: angled upward-right
    const limb1 = new THREE.CylinderGeometry(0.22, 0.35, 3.2, 7);
    limb1.rotateZ(0.45);
    limb1.rotateY(0.6);
    limb1.translate(0.65, 3.8, 0.35);

    // Branch 2: angled upward-left
    const limb2 = new THREE.CylinderGeometry(0.2, 0.32, 3.0, 7);
    limb2.rotateZ(-0.5);
    limb2.rotateY(-0.8);
    limb2.translate(-0.7, 3.7, -0.3);

    // Branch 3: angled forward-upward
    const limb3 = new THREE.CylinderGeometry(0.18, 0.28, 2.6, 6);
    limb3.rotateX(0.42);
    limb3.rotateY(2.2);
    limb3.translate(0.2, 4.0, 0.65);

    return this.mergeBufferGeometries([trunkBase, limb1, limb2, limb3]);
  }

  // =========================================================================
  // 1,280+ CONNECTED BILLOWING CANOPIES, GNARLED TRUNKS & BOLLARDS
  // =========================================================================

  private createInstancedVegetationAndBollards() {
    const dummy = new THREE.Object3D();

    // 1. Generate 3 Custom Vertex-Displaced Organic Canopy Geometries
    const broadCanopyGeo = this.createOrganicCanopyGeometry(4.2, 'broad');
    const tieredCanopyGeo = this.createOrganicCanopyGeometry(3.8, 'tiered');
    const columnarCanopyGeo = this.createOrganicCanopyGeometry(3.4, 'columnar');
    const gnarledTrunkGeo = this.createGnarledTrunkGeometry();

    const broadCount = 600;
    const tieredCount = 380;
    const columnarCount = 300;
    const totalCanopyCount = broadCount + tieredCount + columnarCount; // 1,280

    this.broadCanopyMesh = new THREE.InstancedMesh(broadCanopyGeo, this.foliageMat, broadCount);
    this.broadCanopyMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    this.tieredCanopyMesh = new THREE.InstancedMesh(tieredCanopyGeo, this.foliageSageMat, tieredCount);
    this.tieredCanopyMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    this.columnarCanopyMesh = new THREE.InstancedMesh(columnarCanopyGeo, this.foliageWarmMat, columnarCount);
    this.columnarCanopyMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    this.trunkMesh = new THREE.InstancedMesh(gnarledTrunkGeo, this.trunkBarkMat, totalCanopyCount);
    this.trunkMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    // Botanical Multi-Toned Color Palette
    const foliageColors = [
      new THREE.Color(0x163A2C), // Deep Emerald Base
      new THREE.Color(0x245943), // Moonlit Sage / Mid-Tone
      new THREE.Color(0x3B7A57), // Warm Golden-Green Fringe
      new THREE.Color(0x2A4025), // Subtle Warm Subsurface/Ambient Reflection
    ];

    interface TreePlacement {
      x: number;
      z: number;
      scale: number;
      rotY: number;
      tiltX: number;
      tiltZ: number;
      type: 'broad' | 'tiered' | 'columnar';
      color: THREE.Color;
    }

    const placements: TreePlacement[] = [];

    // Helper: Add continuous interlocking boulevard tree row along a curve
    const addBoulevardBelts = (curve: THREE.CatmullRomCurve3, stepCount: number, leftOffset: number, rightOffset: number) => {
      const pts = curve.getPoints(stepCount);
      for (let i = 1; i < pts.length - 1; i++) {
        const pt = pts[i];
        const next = pts[i + 1];
        const prev = pts[i - 1];
        const tan = next.clone().sub(prev).normalize();
        const norm = new THREE.Vector3(-tan.z, 0, tan.x).normalize();

        // Left flank
        const pL = pt.clone().add(norm.clone().multiplyScalar(leftOffset + (Math.random() - 0.5) * 1.5));
        // Right flank
        const pR = pt.clone().add(norm.clone().multiplyScalar(rightOffset + (Math.random() - 0.5) * 1.5));

        const types: ('broad' | 'tiered' | 'columnar')[] = ['broad', 'broad', 'tiered', 'columnar'];

        [pL, pR].forEach((pos) => {
          const type = types[Math.floor(Math.random() * types.length)];
          const scale = 0.85 + Math.random() * 0.45;
          const col = foliageColors[Math.floor(Math.random() * foliageColors.length)];
          placements.push({
            x: pos.x,
            z: pos.z,
            scale,
            rotY: Math.random() * Math.PI * 2,
            tiltX: (Math.random() - 0.5) * 0.12,
            tiltZ: (Math.random() - 0.5) * 0.12,
            type,
            color: col,
          });
        });
      }
    };

    // A. West Parkway Interlocking Canopy Tunnel (Stripe -> Linear -> Anthropic)
    const westSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-80, 0, -85),
      new THREE.Vector3(-105, 0, -40),
      new THREE.Vector3(-95, 0, 5),
      new THREE.Vector3(-100, 0, 50),
      new THREE.Vector3(-70, 0, 90),
    ]);
    addBoulevardBelts(westSpline, 36, -5.2, 5.2);

    // B. East Parkway Interlocking Canopy Tunnel (Databricks -> Cloudflare -> Vercel -> Figma)
    const eastSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(75, 0, -95),
      new THREE.Vector3(95, 0, -50),
      new THREE.Vector3(85, 0, -10),
      new THREE.Vector3(70, 0, 35),
      new THREE.Vector3(60, 0, 75),
      new THREE.Vector3(75, 0, 110),
      new THREE.Vector3(80, 0, 135),
    ]);
    addBoulevardBelts(eastSpline, 42, -5.2, 5.2);

    // C. Riverside Riparian Canopy Belts (continuous green promenade along both banks)
    const riverSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(15, 0, -210),
      new THREE.Vector3(-25, 0, -130),
      new THREE.Vector3(-10, 0, -50),
      new THREE.Vector3(18, 0, 10),
      new THREE.Vector3(-15, 0, 75),
      new THREE.Vector3(25, 0, 150),
      new THREE.Vector3(10, 0, 220),
    ]);
    addBoulevardBelts(riverSpline, 50, -16.5, 16.5);

    // D. Cross-Campus Walkway Belts approaching the 3 Footbridges
    const cross1Spline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-80, 0, -85),
      new THREE.Vector3(-45, 0, -88),
      new THREE.Vector3(-18, 0, -90),
      new THREE.Vector3(25, 0, -92),
      new THREE.Vector3(75, 0, -95),
    ]);
    addBoulevardBelts(cross1Spline, 24, -4.8, 4.8);

    const cross2Spline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-95, 0, 5),
      new THREE.Vector3(-40, 0, 10),
      new THREE.Vector3(14, 0, 12),
      new THREE.Vector3(50, 0, 6),
      new THREE.Vector3(85, 0, -10),
    ]);
    addBoulevardBelts(cross2Spline, 24, -4.8, 4.8);

    // E. Hero Trees in Plaza Planters
    // Stripe Plaza Hero Tree
    placements.push({
      x: -65,
      z: -85,
      scale: 1.45,
      rotY: 0.8,
      tiltX: 0.02,
      tiltZ: -0.03,
      type: 'broad',
      color: new THREE.Color(0x3B7A57),
    });

    // OpenAI South Concourse Hero Tree
    placements.push({
      x: -15,
      z: 115,
      scale: 1.45,
      rotY: 2.1,
      tiltX: -0.04,
      tiltZ: 0.02,
      type: 'broad',
      color: new THREE.Color(0x245943),
    });

    // Databricks Plaza Hero Tree
    placements.push({
      x: 60,
      z: -95,
      scale: 1.4,
      rotY: 1.4,
      tiltX: 0.03,
      tiltZ: 0.03,
      type: 'broad',
      color: new THREE.Color(0x163A2C),
    });

    // F. Organic Courtyard Groves, Terraced Berms & Campus Perimeters
    const bermCenters = [
      { x: -40, z: -40, count: 28 },
      { x: 35, z: -35, count: 28 },
      { x: -50, z: 45, count: 32 },
      { x: 40, z: 40, count: 28 },
      { x: 0, z: 105, count: 35 },
      { x: -115, z: -45, count: 40 },
      { x: 110, z: -55, count: 40 },
      { x: -95, z: 5, count: 25 },   // Linear systems grove
      { x: 80, z: 135, count: 30 },  // Figma annex garden
      { x: -70, z: 90, count: 25 },   // Anthropic bluff
    ];

    bermCenters.forEach((bc) => {
      for (let i = 0; i < bc.count; i++) {
        const rad = Math.random() * 18 + 2;
        const ang = Math.random() * Math.PI * 2;
        const gx = bc.x + Math.cos(ang) * rad;
        const gz = bc.z + Math.sin(ang) * rad;

        // Skip river corridor
        if (Math.abs(gx) < 14 && gz > -130 && gz < 160) continue;

        const types: ('broad' | 'tiered' | 'columnar')[] = ['broad', 'tiered', 'columnar'];
        placements.push({
          x: gx,
          z: gz,
          scale: 0.75 + Math.random() * 0.55,
          rotY: Math.random() * Math.PI * 2,
          tiltX: (Math.random() - 0.5) * 0.14,
          tiltZ: (Math.random() - 0.5) * 0.14,
          type: types[Math.floor(Math.random() * types.length)],
          color: foliageColors[Math.floor(Math.random() * foliageColors.length)],
        });
      }
    });

    // Distribute remaining trees organically across outer campus lawn to reach 1,280
    while (placements.length < totalCanopyCount) {
      const rx = (Math.random() - 0.5) * 360;
      const rz = (Math.random() - 0.5) * 360;
      if (Math.abs(rx) < 15 && rz > -140 && rz < 160) continue;

      const types: ('broad' | 'tiered' | 'columnar')[] = ['broad', 'tiered', 'columnar'];
      placements.push({
        x: rx,
        z: rz,
        scale: 0.75 + Math.random() * 0.5,
        rotY: Math.random() * Math.PI * 2,
        tiltX: (Math.random() - 0.5) * 0.12,
        tiltZ: (Math.random() - 0.5) * 0.12,
        type: types[Math.floor(Math.random() * types.length)],
        color: foliageColors[Math.floor(Math.random() * foliageColors.length)],
      });
    }

    // Now populate InstancedMeshes
    let bIdx = 0;
    let tIdx = 0;
    let cIdx = 0;
    let trunkIdx = 0;

    for (let i = 0; i < placements.length; i++) {
      const p = placements[i];

      dummy.position.set(p.x, 0, p.z);
      dummy.scale.set(p.scale, p.scale, p.scale);
      dummy.rotation.set(p.tiltX, p.rotY, p.tiltZ);
      dummy.updateMatrix();

      // Trunk instance (underneath every canopy)
      if (trunkIdx < totalCanopyCount) {
        this.trunkMesh.setMatrixAt(trunkIdx, dummy.matrix);
        trunkIdx++;
      }

      // Canopy instances separated by type
      if (p.type === 'broad' && bIdx < broadCount) {
        this.broadCanopyMesh.setMatrixAt(bIdx, dummy.matrix);
        this.broadCanopyMesh.setColorAt(bIdx, p.color);
        bIdx++;
      } else if (p.type === 'tiered' && tIdx < tieredCount) {
        this.tieredCanopyMesh.setMatrixAt(tIdx, dummy.matrix);
        this.tieredCanopyMesh.setColorAt(tIdx, p.color);
        tIdx++;
      } else if (cIdx < columnarCount) {
        this.columnarCanopyMesh.setMatrixAt(cIdx, dummy.matrix);
        this.columnarCanopyMesh.setColorAt(cIdx, p.color);
        cIdx++;
      } else if (bIdx < broadCount) {
        this.broadCanopyMesh.setMatrixAt(bIdx, dummy.matrix);
        this.broadCanopyMesh.setColorAt(bIdx, p.color);
        bIdx++;
      } else if (tIdx < tieredCount) {
        this.tieredCanopyMesh.setMatrixAt(tIdx, dummy.matrix);
        this.tieredCanopyMesh.setColorAt(tIdx, p.color);
        tIdx++;
      }
    }

    this.broadCanopyMesh.instanceMatrix.needsUpdate = true;
    if (this.broadCanopyMesh.instanceColor) this.broadCanopyMesh.instanceColor.needsUpdate = true;
    this.scene.add(this.broadCanopyMesh);

    this.tieredCanopyMesh.instanceMatrix.needsUpdate = true;
    if (this.tieredCanopyMesh.instanceColor) this.tieredCanopyMesh.instanceColor.needsUpdate = true;
    this.scene.add(this.tieredCanopyMesh);

    this.columnarCanopyMesh.instanceMatrix.needsUpdate = true;
    if (this.columnarCanopyMesh.instanceColor) this.columnarCanopyMesh.instanceColor.needsUpdate = true;
    this.scene.add(this.columnarCanopyMesh);

    this.trunkMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(this.trunkMesh);

    // 2. Conical Cypress / Pine Perimeter Trees (360 instances)
    const pineCount = 360;
    const pineGeo = new THREE.ConeGeometry(2.4, 9, 7);
    pineGeo.translate(0, 4.5, 0);

    const pineMat = new THREE.MeshStandardMaterial({
      color: 0x1E3A2F,
      roughness: 0.85,
      metalness: 0.05,
    });

    this.pineTreeMesh = new THREE.InstancedMesh(pineGeo, pineMat, pineCount);
    this.pineTreeMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    const pineGreens = [
      new THREE.Color(0x163828),
      new THREE.Color(0x1E3A2F),
      new THREE.Color(0x132E21),
    ];

    for (let i = 0; i < pineCount; i++) {
      const sign = Math.random() > 0.5 ? 1 : -1;
      const px = sign * (40 + Math.random() * 115);
      const pz = (Math.random() - 0.5) * 330;
      const pscale = 0.8 + Math.random() * 0.6;

      dummy.position.set(px, 0, pz);
      dummy.scale.set(pscale, pscale * (1.0 + Math.random() * 0.4), pscale);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.updateMatrix();

      this.pineTreeMesh.setMatrixAt(i, dummy.matrix);
      this.pineTreeMesh.setColorAt(i, pineGreens[Math.floor(Math.random() * pineGreens.length)]);
    }
    this.pineTreeMesh.instanceMatrix.needsUpdate = true;
    if (this.pineTreeMesh.instanceColor) this.pineTreeMesh.instanceColor.needsUpdate = true;
    this.scene.add(this.pineTreeMesh);

    // 3. Warm Glowing Bollard Lights along Pathways (180 instances)
    const bollardCount = 180;
    const bollardGeo = new THREE.CylinderGeometry(0.25, 0.25, 1.8, 8);
    bollardGeo.translate(0, 0.9, 0);

    const bollardMat = new THREE.MeshBasicMaterial({
      color: 0xFFB366, // Warm tungsten amber glow
    });

    this.bollardLightMesh = new THREE.InstancedMesh(bollardGeo, bollardMat, bollardCount);
    this.bollardLightMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    for (let i = 0; i < bollardCount; i++) {
      const angle = (i / bollardCount) * Math.PI * 4;
      const rad = 25 + (i % 6) * 20;
      const bx = Math.sin(angle) * rad + (i % 2 === 0 ? -42 : 42);
      const bz = Math.cos(angle) * rad + ((i / bollardCount) - 0.5) * 190;

      dummy.position.set(bx, 0, bz);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();

      this.bollardLightMesh.setMatrixAt(i, dummy.matrix);
    }
    this.bollardLightMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(this.bollardLightMesh);
  }

  // =========================================================================
  // ARCHITECTURAL PAVILION GENERATORS (5 ENHANCED MULTI-WING ARCHETYPES)
  // =========================================================================

  /**
   * Helper: Add Stepped Travertine Terrace Podium with Retaining Walls & Plaza Point Light
   */
  private createTerracedPodium(
    group: THREE.Group,
    width: number,
    depth: number,
    height: number = 1.6,
    lightColor: number = 0xFF9E44
  ) {
    // Stepped Travertine Base
    const podiumGeo = new THREE.BoxGeometry(width, height, depth);
    const podium = new THREE.Mesh(podiumGeo, this.alabasterConcreteMat);
    podium.position.y = height / 2;
    group.add(podium);

    // Retaining Stone Edge Lip
    const lipGeo = new THREE.BoxGeometry(width + 1.2, 0.4, depth + 1.2);
    const lip = new THREE.Mesh(lipGeo, this.curbMat);
    lip.position.y = height;
    group.add(lip);

    // Plaza Warm Point Light
    const plazaLight = new THREE.PointLight(lightColor, 1.8, 55, 1.5);
    plazaLight.position.set(0, height + 4, depth / 2 + 6);
    group.add(plazaLight);

    // Plaza Monument Sign
    const signGeo = new THREE.BoxGeometry(4.5, 1.2, 0.6);
    const sign = new THREE.Mesh(signGeo, this.celestialSlateMat);
    sign.position.set(-width / 3, height + 0.6, depth / 2 + 4);
    group.add(sign);

    const signLedGeo = new THREE.BoxGeometry(4.2, 0.2, 0.65);
    const signLed = new THREE.Mesh(signLedGeo, this.glowingCyanMat);
    signLed.position.set(-width / 3, height + 1.25, depth / 2 + 4);
    group.add(signLed);
  }

  /**
   * Helper: Add Ground Floor Transparent Glass Lobby with Visible Columns
   */
  private createIlluminatedLobby(
    parent: THREE.Group,
    w: number,
    d: number,
    h: number,
    yPos: number
  ) {
    // Glass Lobby Wall
    const lobbyGlassGeo = new THREE.BoxGeometry(w, h, d);
    const lobbyGlass = new THREE.Mesh(lobbyGlassGeo, this.starlightGlassMat);
    lobbyGlass.position.y = yPos + h / 2;
    parent.add(lobbyGlass);

    // Interior Structural Columns
    const colCount = 4;
    const colGeo = new THREE.CylinderGeometry(0.45, 0.45, h, 12);
    for (let i = 0; i < colCount; i++) {
      const cx = (i / (colCount - 1) - 0.5) * (w - 3);
      const cz = (i % 2 === 0 ? 1 : -1) * (d * 0.28);
      const col = new THREE.Mesh(colGeo, this.travertineStoneMat);
      col.position.set(cx, yPos + h / 2, cz);
      parent.add(col);
    }

    // Warm Interior Lobby Floor Glow
    const glowGeo = new THREE.PlaneGeometry(w - 1, d - 1);
    const glow = new THREE.Mesh(glowGeo, this.glowingAmberMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = yPos + 0.15;
    parent.add(glow);
  }

  /**
   * Helper: Add Glass Elevator Shaft with Animated Moving Warm Light Pod
   */
  private createElevatorShaft(
    parent: THREE.Group,
    x: number,
    z: number,
    minY: number,
    maxY: number
  ) {
    const shaftH = maxY - minY;
    const shaftGeo = new THREE.BoxGeometry(2.4, shaftH, 2.4);
    const shaft = new THREE.Mesh(shaftGeo, this.starlightGlassMat);
    shaft.position.set(x, minY + shaftH / 2, z);
    parent.add(shaft);

    // Animated Elevator Car (glowing amber pod)
    const carGeo = new THREE.BoxGeometry(2.0, 2.2, 2.0);
    const car = new THREE.Mesh(carGeo, this.glowingAmberMat);
    car.position.set(x, minY + 2, z);
    parent.add(car);

    this.animatedElevators.push({
      mesh: car,
      minY: minY + 1.2,
      maxY: maxY - 1.2,
      speed: 4.5 + Math.random() * 3.5,
      offset: Math.random() * 10,
    });
  }

  /**
   * Helper: Add Rooftop Helipad with Perimeter Warning Lights
   */
  private createRooftopHelipad(parent: THREE.Group, x: number, y: number, z: number, radius: number = 4) {
    const padGeo = new THREE.CylinderGeometry(radius, radius, 0.3, 24);
    const pad = new THREE.Mesh(padGeo, this.celestialSlateMat);
    pad.position.set(x, y + 0.15, z);
    parent.add(pad);

    // "H" marking ring
    const ringGeo = new THREE.RingGeometry(radius * 0.65, radius * 0.85, 24);
    const ring = new THREE.Mesh(ringGeo, this.glowingCyanMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, y + 0.32, z);
    parent.add(ring);

    // 4 Perimeter Warning Beacons
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const bx = x + Math.cos(angle) * (radius - 0.4);
      const bz = z + Math.sin(angle) * (radius - 0.4);
      const bGeo = new THREE.SphereGeometry(0.35, 6, 6);
      const bMesh = new THREE.Mesh(bGeo, new THREE.MeshBasicMaterial({ color: 0xEF4444 }));
      bMesh.position.set(bx, y + 0.5, bz);
      parent.add(bMesh);
      this.warningBeacons.push(bMesh);
    }
  }

  // =========================================================================
  // 1. ORBITAL RING HQ (Apple Park style, for Linear)
  // =========================================================================
  private createOrbitalRingBuilding(x: number, z: number, rotation: number = 0): { group: THREE.Group; hitMesh: THREE.Mesh } {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotation;

    this.createTerracedPodium(group, 56, 56, 1.8, 0x38BDF8);

    const outerR = 23;
    const innerR = 14;
    const ringH = 19;

    // Ground lobby ring
    const lobbyInner = new THREE.CylinderGeometry(innerR, innerR, 4, 32, 1, true);
    const lobbyMesh = new THREE.Mesh(lobbyInner, this.starlightGlassMat);
    lobbyMesh.position.y = 3.8;
    group.add(lobbyMesh);

    // Main Outer Glass Facade Cylinder with procedural windows
    const outerGeo = new THREE.CylinderGeometry(outerR, outerR, ringH, 36, 1, true);
    const outerWall = new THREE.Mesh(outerGeo, this.facadeLitMat);
    outerWall.position.y = ringH / 2 + 1.8;
    group.add(outerWall);

    // Inner Glass Facade Cylinder
    const innerGeo = new THREE.CylinderGeometry(innerR, innerR, ringH, 36, 1, true);
    const innerWall = new THREE.Mesh(innerGeo, this.starlightGlassMat);
    innerWall.position.y = ringH / 2 + 1.8;
    group.add(innerWall);

    // Cantilevered Roof Disc
    const roofGeo = new THREE.CylinderGeometry(outerR + 2.5, outerR + 2.5, 0.9, 36);
    const roof = new THREE.Mesh(roofGeo, this.alabasterConcreteMat);
    roof.position.y = ringH + 2.2;
    group.add(roof);

    // Inner Garden Pond
    const poolGeo = new THREE.CylinderGeometry(innerR - 1.5, innerR - 1.5, 0.4, 32);
    const pool = new THREE.Mesh(poolGeo, this.waterMat);
    pool.position.y = 1.9;
    group.add(pool);

    // Rooftop Helipad
    this.createRooftopHelipad(group, 0, ringH + 2.7, -outerR * 0.65, 3.5);

    // Invisible Hit Cylinder for Raycasting
    const hitGeo = new THREE.CylinderGeometry(outerR + 2, outerR + 2, ringH + 4, 16);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.y = ringH / 2;
    group.add(hitMesh);

    return { group, hitMesh };
  }

  // =========================================================================
  // 2. TWIN SPIRE WITH GLOWING SKYBRIDGE (Cloudflare)
  // =========================================================================
  private createTwinSpireBuilding(x: number, z: number, rotation: number = 0): { group: THREE.Group; hitMesh: THREE.Mesh } {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotation;

    this.createTerracedPodium(group, 52, 38, 2.0, 0xFF9E44);

    const towerW = 14;
    const towerD = 14;
    const towerH = 46;
    const spacing = 19;

    [-spacing / 2, spacing / 2].forEach((tx, idx) => {
      // Ground Lobby
      this.createIlluminatedLobby(group, towerW, towerD, 5, 2.0);

      // Tower Shaft with mixed lit window facade
      const shaftGeo = new THREE.BoxGeometry(towerW, towerH - 5, towerD);
      const shaft = new THREE.Mesh(shaftGeo, this.facadeLitMat);
      shaft.position.set(tx, (towerH - 5) / 2 + 7, 0);
      group.add(shaft);

      // Travertine Corner Columns
      const colGeo = new THREE.BoxGeometry(1.2, towerH, 1.2);
      [
        [-towerW / 2, -towerD / 2],
        [towerW / 2, -towerD / 2],
        [-towerW / 2, towerD / 2],
        [towerW / 2, towerD / 2],
      ].forEach(([cx, cz]) => {
        const cMesh = new THREE.Mesh(colGeo, this.travertineStoneMat);
        cMesh.position.set(tx + cx, towerH / 2 + 2, cz);
        group.add(cMesh);
      });

      // Rooftop Spire Mast
      const mastGeo = new THREE.CylinderGeometry(0.3, 1.2, 14, 8);
      const mast = new THREE.Mesh(mastGeo, this.titaniumFrameMat);
      mast.position.set(tx, towerH + 9, 0);
      group.add(mast);

      // Spire beacon
      const bGeo = new THREE.SphereGeometry(0.7, 6, 6);
      const bMesh = new THREE.Mesh(bGeo, new THREE.MeshBasicMaterial({ color: 0x38BDF8 }));
      bMesh.position.set(tx, towerH + 16, 0);
      group.add(bMesh);

      // External Glass Elevator Track
      this.createElevatorShaft(group, tx + (idx === 0 ? -towerW / 2 - 1.2 : towerW / 2 + 1.2), 0, 3, towerH);
    });

    // Multi-Level Glowing Glass Skybridge connecting the twin spires
    [24, 35].forEach((by) => {
      const bridgeGeo = new THREE.BoxGeometry(spacing, 4.2, 6);
      const bridge = new THREE.Mesh(bridgeGeo, this.starlightGlassMat);
      bridge.position.set(0, by, 0);
      group.add(bridge);

      // Illuminated floor track
      const trackGeo = new THREE.BoxGeometry(spacing, 0.4, 5.8);
      const track = new THREE.Mesh(trackGeo, this.glowingCyanMat);
      track.position.set(0, by - 1.8, 0);
      group.add(track);
    });

    const hitGeo = new THREE.BoxGeometry(spacing + towerW + 4, towerH + 10, towerD + 6);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.y = towerH / 2;
    group.add(hitMesh);

    return { group, hitMesh };
  }

  // =========================================================================
  // 3. STEPPED ZIGGURAT WITH ROOFTOP SKY-TERRACES (Anthropic)
  // =========================================================================
  private createZigguratBuilding(x: number, z: number, rotation: number = 0): { group: THREE.Group; hitMesh: THREE.Mesh } {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotation;

    this.createTerracedPodium(group, 54, 54, 2.2, 0xFDE68A);

    const tiers = [
      { w: 38, d: 38, h: 9, y: 2.2 },
      { w: 29, d: 29, h: 8, y: 11.2 },
      { w: 21, d: 21, h: 8, y: 19.2 },
      { w: 14, d: 14, h: 7, y: 27.2 },
    ];

    tiers.forEach((t, i) => {
      // Ground lobby on first tier
      if (i === 0) {
        this.createIlluminatedLobby(group, t.w, t.d, 5, t.y);
      }

      const tierGeo = new THREE.BoxGeometry(t.w, t.h, t.d);
      const tierMesh = new THREE.Mesh(tierGeo, this.facadeLitMat);
      tierMesh.position.y = t.y + t.h / 2;
      group.add(tierMesh);

      // Travertine Cantilevered Balcony Slab
      const slabGeo = new THREE.BoxGeometry(t.w + 2.2, 0.6, t.d + 2.2);
      const slab = new THREE.Mesh(slabGeo, this.travertineStoneMat);
      slab.position.y = t.y + t.h;
      group.add(slab);

      // Green Sky Terrace Garden Planter on exposed terrace step
      if (i > 0) {
        const planterGeo = new THREE.BoxGeometry(t.w + 1.8, 0.4, 2.5);
        const planter = new THREE.Mesh(planterGeo, this.turfMat);
        planter.position.set(0, t.y + 0.3, (t.d + 3) / 2);
        group.add(planter);
      }
    });

    // Top Helipad
    const topTier = tiers[tiers.length - 1];
    this.createRooftopHelipad(group, 0, topTier.y + topTier.h + 0.6, 0, 4.2);

    const hitGeo = new THREE.BoxGeometry(42, 38, 42);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.y = 19;
    group.add(hitMesh);

    return { group, hitMesh };
  }

  // =========================================================================
  // 4. HEX-CLUSTER DATA PAVILION (Databricks)
  // =========================================================================
  private createHexClusterBuilding(x: number, z: number, rotation: number = 0): { group: THREE.Group; hitMesh: THREE.Mesh } {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotation;

    this.createTerracedPodium(group, 58, 58, 1.8, 0xFF9E44);

    const hexPods = [
      { r: 12, h: 32, ox: 0, oz: 0 },
      { r: 9, h: 24, ox: -14, oz: 8 },
      { r: 9, h: 22, ox: 14, oz: 8 },
      { r: 8, h: 20, ox: 0, oz: -16 },
    ];

    hexPods.forEach((p, idx) => {
      // Ground Lobby
      if (idx === 0) {
        this.createIlluminatedLobby(group, p.r * 1.8, p.r * 1.8, 5, 1.8);
      }

      const hexGeo = new THREE.CylinderGeometry(p.r, p.r, p.h, 6);
      const hexMesh = new THREE.Mesh(hexGeo, this.facadeLitMat);
      hexMesh.position.set(p.ox, p.h / 2 + 1.8, p.oz);
      group.add(hexMesh);

      // Travertine Crown Cap
      const capGeo = new THREE.CylinderGeometry(p.r + 1.2, p.r + 1.2, 0.8, 6);
      const cap = new THREE.Mesh(capGeo, this.alabasterConcreteMat);
      cap.position.set(p.ox, p.h + 2.2, p.oz);
      group.add(cap);

      // Glowing Data Accent Line along edges
      const edgeRingGeo = new THREE.TorusGeometry(p.r + 0.3, 0.2, 6, 6);
      const edgeRing = new THREE.Mesh(edgeRingGeo, this.glowingCyanMat);
      edgeRing.rotation.x = Math.PI / 2;
      edgeRing.position.set(p.ox, p.h * 0.65, p.oz);
      group.add(edgeRing);
    });

    // Rooftop Helipad on central hex
    this.createRooftopHelipad(group, 0, 34.5, 0, 4.0);

    const hitGeo = new THREE.CylinderGeometry(25, 25, 36, 12);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.y = 18;
    group.add(hitMesh);

    return { group, hitMesh };
  }

  // =========================================================================
  // 5. CLOUD ATRIUM WITH TRANSLUCENT SHELL (Vercel)
  // =========================================================================
  private createCloudAtriumBuilding(x: number, z: number, rotation: number = 0): { group: THREE.Group; hitMesh: THREE.Mesh } {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotation;

    this.createTerracedPodium(group, 50, 46, 1.8, 0x38BDF8);

    const w = 32;
    const d = 26;
    const h = 26;

    // Ground Floor Lobby
    this.createIlluminatedLobby(group, w, d, 6, 1.8);

    // Inner Core Towers (Dual concrete service cores)
    [-7, 7].forEach((cx) => {
      const coreGeo = new THREE.BoxGeometry(9, h - 2, 9);
      const core = new THREE.Mesh(coreGeo, this.facadeLitMat);
      core.position.set(cx, (h - 2) / 2 + 2, 0);
      group.add(core);
    });

    // Outer Translucent Starlight Glass Atrium Shell
    const shellGeo = new THREE.BoxGeometry(w, h - 6, d);
    const shell = new THREE.Mesh(shellGeo, this.starlightGlassMat);
    shell.position.set(0, (h - 6) / 2 + 7.8, 0);
    group.add(shell);

    // Travertine Cantilevered Roof
    const roofGeo = new THREE.BoxGeometry(w + 3, 0.8, d + 3);
    const roof = new THREE.Mesh(roofGeo, this.travertineStoneMat);
    roof.position.set(0, h + 2.2, 0);
    group.add(roof);

    // External Glass Elevator
    this.createElevatorShaft(group, w / 2 + 1.2, 0, 2, h);

    // Helipad
    this.createRooftopHelipad(group, 0, h + 2.8, 0, 4.0);

    const hitGeo = new THREE.BoxGeometry(w + 4, h + 4, d + 4);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.y = h / 2;
    group.add(hitMesh);

    return { group, hitMesh };
  }

  // =========================================================================
  // 6. MONUMENTAL INTELLIGENCE QUAD (OpenAI)
  // =========================================================================
  private createIntelligenceQuadBuilding(x: number, z: number, rotation: number = 0): { group: THREE.Group; hitMesh: THREE.Mesh } {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotation;

    this.createTerracedPodium(group, 54, 50, 2.0, 0xF8FAFC);

    // U-shaped / quad pavilion with central open colonnade galleria
    const mainH = 28;
    const wingW = 12;
    const wingD = 36;

    // Left Wing
    const leftGeo = new THREE.BoxGeometry(wingW, mainH, wingD);
    const leftWing = new THREE.Mesh(leftGeo, this.facadeLitMat);
    leftWing.position.set(-16, mainH / 2 + 2.0, 0);
    group.add(leftWing);

    // Right Wing
    const rightWing = new THREE.Mesh(leftGeo, this.facadeLitMat);
    rightWing.position.set(16, mainH / 2 + 2.0, 0);
    group.add(rightWing);

    // Connecting Glass Gallery
    const galleryGeo = new THREE.BoxGeometry(22, 14, 10);
    const gallery = new THREE.Mesh(galleryGeo, this.starlightGlassMat);
    gallery.position.set(0, 9, -13);
    group.add(gallery);

    // Floating Skybridge at upper level
    const upperBridgeGeo = new THREE.BoxGeometry(22, 3.5, 6);
    const upperBridge = new THREE.Mesh(upperBridgeGeo, this.starlightGlassMat);
    upperBridge.position.set(0, 22, 8);
    group.add(upperBridge);

    // Helipad on right wing
    this.createRooftopHelipad(group, 16, mainH + 2.2, 0, 4.0);

    const hitGeo = new THREE.BoxGeometry(48, mainH + 4, wingD + 4);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.y = mainH / 2;
    group.add(hitMesh);

    return { group, hitMesh };
  }

  // =========================================================================
  // 7. DESIGN SYSTEMS & CANVAS PAVILION (Figma)
  // =========================================================================
  private createCanvasPavilionBuilding(x: number, z: number, rotation: number = 0): { group: THREE.Group; hitMesh: THREE.Mesh } {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotation;

    this.createTerracedPodium(group, 50, 48, 1.8, 0xFF9E44);

    // Cantilevered offset studio blocks stacked dynamically
    const blocks = [
      { w: 26, d: 24, h: 8, x: 0, y: 1.8, z: 0 },
      { w: 28, d: 22, h: 8, x: 4, y: 9.8, z: 2 },
      { w: 22, d: 26, h: 8, x: -3, y: 17.8, z: -2 },
    ];

    blocks.forEach((b, i) => {
      const bGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const mesh = new THREE.Mesh(bGeo, i === 1 ? this.starlightGlassMat : this.facadeLitMat);
      mesh.position.set(b.x, b.y + b.h / 2, b.z);
      group.add(mesh);

      // Travertine horizontal divider slab
      const slabGeo = new THREE.BoxGeometry(b.w + 2.5, 0.5, b.d + 2.5);
      const slab = new THREE.Mesh(slabGeo, this.travertineStoneMat);
      slab.position.set(b.x, b.y + b.h, b.z);
      group.add(slab);
    });

    this.createRooftopHelipad(group, -3, 26.5, -2, 3.8);

    const hitGeo = new THREE.BoxGeometry(34, 28, 34);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.y = 14;
    group.add(hitMesh);

    return { group, hitMesh };
  }

  // =========================================================================
  // 8. GLOBAL PAYMENTS PAVILION & TERRACES (Stripe)
  // =========================================================================
  private createStripePavilionBuilding(x: number, z: number, rotation: number = 0): { group: THREE.Group; hitMesh: THREE.Mesh } {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotation;

    this.createTerracedPodium(group, 56, 52, 2.2, 0xFFB366);

    // Multi-wing banking pavilion with tiered glass atriums
    const wingW = 16;
    const wingH = 34;
    const wingD = 24;

    // West Banking Wing
    const wGeo = new THREE.BoxGeometry(wingW, wingH, wingD);
    const westWing = new THREE.Mesh(wGeo, this.facadeLitMat);
    westWing.position.set(-14, wingH / 2 + 2.2, 0);
    group.add(westWing);

    // East Ledger Wing (Lower stepped terrace)
    const eGeo = new THREE.BoxGeometry(wingW, wingH - 8, wingD);
    const eastWing = new THREE.Mesh(eGeo, this.facadeLitMat);
    eastWing.position.set(14, (wingH - 8) / 2 + 2.2, 0);
    group.add(eastWing);

    // Central Grand Cash-Flow Atrium (Transparent glass)
    const atriumGeo = new THREE.BoxGeometry(14, 18, wingD - 4);
    const atrium = new THREE.Mesh(atriumGeo, this.starlightGlassMat);
    atrium.position.set(0, 11, 0);
    group.add(atrium);

    // Illuminated Skybridge connecting upper executive levels
    const bridgeGeo = new THREE.BoxGeometry(16, 3.8, 6);
    const bridge = new THREE.Mesh(bridgeGeo, this.starlightGlassMat);
    bridge.position.set(0, 22, 0);
    group.add(bridge);

    // Elevator shaft on West tower
    this.createElevatorShaft(group, -23, 0, 2.2, wingH);

    // Helipad on West Wing
    this.createRooftopHelipad(group, -14, wingH + 2.6, 0, 4.0);

    const hitGeo = new THREE.BoxGeometry(50, wingH + 4, wingD + 4);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.y = wingH / 2;
    group.add(hitMesh);

    return { group, hitMesh };
  }

  // =========================================================================
  // GENERATE THE 8 ASYMMETRIC MASTERPLAN CAMPUS COMPOUNDS
  // =========================================================================

  private generateAsymmetricCampuses() {
    this.buildings = [
      {
        id: 'bldg-stripe',
        name: 'Stripe Payments Pavilion',
        companyName: 'Stripe',
        pavilionName: 'Global Payments Pavilion',
        campusZone: 'Zone 01 · West Terraces',
        roleId: 'stripe-backend-l4',
        matchPercentage: 91,
        openRoles: 14,
        archetype: 'pavilion',
        position: new THREE.Vector3(-80, 0, -85),
        cameraTarget: new THREE.Vector3(-80, 22, -85),
        cameraPosition: new THREE.Vector3(-125, 75, -50),
        primaryTech: ['Go', 'PostgreSQL', 'Distributed ACID', 'gRPC'],
        hiringBar: 'High concurrency race conditions, zero-loss idempotency, and multi-region MVCC invariants.',
        avgComp: '$240k - $340k TC',
      },
      {
        id: 'bldg-databricks',
        name: 'Databricks Lakehouse Hex-Campus',
        companyName: 'Databricks',
        pavilionName: 'Lakehouse Hex-Campus',
        campusZone: 'Zone 02 · North Riverbend',
        roleId: 'databricks-lakehouse',
        matchPercentage: 79,
        openRoles: 9,
        archetype: 'hex',
        position: new THREE.Vector3(75, 0, -95),
        cameraTarget: new THREE.Vector3(75, 22, -95),
        cameraPosition: new THREE.Vector3(120, 80, -60),
        primaryTech: ['Scala / Java', 'C++', 'Apache Spark', 'Delta Lake'],
        hiringBar: 'Vectorized query execution engines, columnar storage formats, and distributed shuffle stages.',
        avgComp: '$250k - $360k TC',
      },
      {
        id: 'bldg-linear',
        name: 'Linear Systems Ring HQ',
        companyName: 'Linear',
        pavilionName: 'Workspace Systems Ring',
        campusZone: 'Zone 03 · Mid-West Clearing',
        roleId: 'linear-workspace-systems',
        matchPercentage: 86,
        openRoles: 6,
        archetype: 'ring',
        position: new THREE.Vector3(-95, 0, 5),
        cameraTarget: new THREE.Vector3(-95, 20, 5),
        cameraPosition: new THREE.Vector3(-135, 70, 35),
        primaryTech: ['TypeScript', 'CRDTs / Sync', 'WASM', 'WebSockets'],
        hiringBar: 'Local-first sync engine, CRDT conflict reconciliation, client-side SQLite/WASM, and zero-latency canvas rendering.',
        avgComp: '$210k - $290k TC',
      },
      {
        id: 'bldg-cloudflare',
        name: 'Cloudflare Twin Spire Edge Center',
        companyName: 'Cloudflare',
        pavilionName: 'Edge Network Twin Towers',
        campusZone: 'Zone 04 · Mid-East Riverside',
        roleId: 'cloudflare-edge-network',
        matchPercentage: 84,
        openRoles: 11,
        archetype: 'twin',
        position: new THREE.Vector3(85, 0, -10),
        cameraTarget: new THREE.Vector3(85, 28, -10),
        cameraPosition: new THREE.Vector3(125, 75, 20),
        primaryTech: ['Rust', 'eBPF / Linux', 'C', 'QUIC / HTTP3'],
        hiringBar: 'Kernel-bypass packet processing, XDP / eBPF filtering, and Anycast routing telemetry.',
        avgComp: '$220k - $310k TC',
      },
      {
        id: 'bldg-anthropic',
        name: 'Anthropic Frontier AI Ziggurat',
        companyName: 'Anthropic',
        pavilionName: 'Frontier AI Ziggurat',
        campusZone: 'Zone 05 · Southwest Bluff',
        roleId: 'anthropic-frontier-ai',
        matchPercentage: 72,
        openRoles: 19,
        archetype: 'ziggurat',
        position: new THREE.Vector3(-70, 0, 90),
        cameraTarget: new THREE.Vector3(-70, 28, 90),
        cameraPosition: new THREE.Vector3(-110, 75, 120),
        primaryTech: ['Rust', 'CUDA / Triton', 'vLLM', 'PyTorch DDP'],
        hiringBar: 'Continuous batching kernels, GPU memory tiering (HBM3 to NVMe), and zero-allocation Rust inference runtimes.',
        avgComp: '$280k - $440k TC',
      },
      {
        id: 'bldg-vercel',
        name: 'Vercel Cloud Edge Atrium',
        companyName: 'Vercel',
        pavilionName: 'Cloud Edge Atrium',
        campusZone: 'Zone 06 · Southeast Waterway',
        roleId: 'vercel-cloud-edge',
        matchPercentage: 94,
        openRoles: 8,
        archetype: 'atrium',
        position: new THREE.Vector3(60, 0, 75),
        cameraTarget: new THREE.Vector3(60, 22, 75),
        cameraPosition: new THREE.Vector3(95, 70, 105),
        primaryTech: ['TypeScript', 'Rust / Turbopack', 'Edge Runtime', 'V8 Isolates'],
        hiringBar: 'Edge function runtime isolation, incremental static regeneration, and global cache invalidation protocols.',
        avgComp: '$200k - $280k TC',
      },
      {
        id: 'bldg-openai',
        name: 'OpenAI Intelligence Quad',
        companyName: 'OpenAI',
        pavilionName: 'Intelligence Quad Pavilion',
        campusZone: 'Zone 07 · South Frontier Quad',
        roleId: 'openai-frontier-systems',
        matchPercentage: 76,
        openRoles: 22,
        archetype: 'quad',
        position: new THREE.Vector3(-20, 0, 130),
        cameraTarget: new THREE.Vector3(-20, 22, 130),
        cameraPosition: new THREE.Vector3(-50, 75, 165),
        primaryTech: ['Python / C++', 'RDMA / NCCL', 'Kubernetes', 'Ray'],
        hiringBar: 'Ultra-scale GPU orchestration, RDMA InfiniBand cluster topology, and checkpoint-recovery at scale.',
        avgComp: '$300k - $480k TC',
      },
      {
        id: 'bldg-figma',
        name: 'Figma Design & Canvas Annex',
        companyName: 'Figma',
        pavilionName: 'Design Systems & Canvas Pavilion',
        campusZone: 'Zone 08 · Southeast Concourse',
        roleId: 'figma-systems-canvas',
        matchPercentage: 88,
        openRoles: 7,
        archetype: 'pavilion',
        position: new THREE.Vector3(80, 0, 135),
        cameraTarget: new THREE.Vector3(80, 22, 135),
        cameraPosition: new THREE.Vector3(115, 70, 165),
        primaryTech: ['C++ / WASM', 'WebGL / WebGPU', 'CRDTs', 'TypeScript'],
        hiringBar: 'Multiplayer WebAssembly engine, C++ 2D vector rasterizer, and CRDT canvas syncing algorithms.',
        avgComp: '$230k - $320k TC',
      },
    ];

    // Build each architecture mesh compound
    this.buildings.forEach((bldg) => {
      let result: { group: THREE.Group; hitMesh: THREE.Mesh };

      switch (bldg.id) {
        case 'bldg-stripe':
          result = this.createStripePavilionBuilding(bldg.position.x, bldg.position.z, 0.2);
          break;
        case 'bldg-databricks':
          result = this.createHexClusterBuilding(bldg.position.x, bldg.position.z, -0.3);
          break;
        case 'bldg-linear':
          result = this.createOrbitalRingBuilding(bldg.position.x, bldg.position.z, 0.4);
          break;
        case 'bldg-cloudflare':
          result = this.createTwinSpireBuilding(bldg.position.x, bldg.position.z, -0.2);
          break;
        case 'bldg-anthropic':
          result = this.createZigguratBuilding(bldg.position.x, bldg.position.z, 0.15);
          break;
        case 'bldg-vercel':
          result = this.createCloudAtriumBuilding(bldg.position.x, bldg.position.z, -0.35);
          break;
        case 'bldg-openai':
          result = this.createIntelligenceQuadBuilding(bldg.position.x, bldg.position.z, 0.1);
          break;
        case 'bldg-figma':
          result = this.createCanvasPavilionBuilding(bldg.position.x, bldg.position.z, -0.25);
          break;
        default:
          result = this.createCloudAtriumBuilding(bldg.position.x, bldg.position.z);
      }

      this.scene.add(result.group);
      this.interactiveMeshes.push(result.hitMesh);
      this.buildingGroupMap.set(result.hitMesh, bldg);
    });
  }

  // =========================================================================
  // INTERACTIVE LISTENERS & CONTROLS
  // =========================================================================

  private setupEvents() {
    this.container.addEventListener('pointermove', this.onPointerMove);
    this.container.addEventListener('click', this.onClick);
    this.container.addEventListener('wheel', this.onWheel, { passive: true });

    this.resizeObserver = new ResizeObserver(() => {
      this.onResize();
    });
    this.resizeObserver.observe(this.container);
  }

  private onPointerMove = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.pointer.x = x;
    this.pointer.y = y;

    // Mouse parallax sensitivity halved for silky stability
    this.mouse.targetX = x * 7.5;
    this.mouse.targetY = y * 5.0;
  };

  private onClick = () => {
    if (this.pointer.x === -999) return;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveMeshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const bldg = this.buildingGroupMap.get(hitMesh);
      if (bldg) {
        this.flyToBuilding(bldg);
        this.callbacks.onSelectBuilding(bldg);
      }
    }
  };

  private onWheel = (e: WheelEvent) => {
    // Smooth micro-delta along the closed orbital loop
    const delta = e.deltaY * 0.00018;
    this.targetScrollProgress = ((this.targetScrollProgress + delta) % 1.0 + 1.0) % 1.0;
  };

  private onResize() {
    if (!this.container || !this.renderer) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  public setWaypoint(progress: number) {
    this.targetScrollProgress = ((progress % 1.0) + 1.0) % 1.0;
  }

  public flyToBuilding(bldg: CampusBuildingData) {
    const buildingProgressMap: Record<string, number> = {
      'bldg-stripe': 0.11,
      'bldg-linear': 0.22,
      'bldg-anthropic': 0.33,
      'bldg-openai': 0.44,
      'bldg-figma': 0.56,
      'bldg-vercel': 0.67,
      'bldg-cloudflare': 0.78,
      'bldg-databricks': 0.89,
    };

    const targetP = buildingProgressMap[bldg.id] ?? 0.0;
    this.targetScrollProgress = targetP;
  }

  public togglePause(paused?: boolean) {
    this.isPaused = paused !== undefined ? paused : !this.isPaused;
  }

  // =========================================================================
  // ANIMATION & PROJECTION LOOP (SILKY EXPONENTIAL DAMPING)
  // =========================================================================

  private projectToScreen(pos: THREE.Vector3): { x: number; y: number; inFront: boolean } {
    const v = pos.clone().project(this.camera);
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;

    return {
      x: Math.round(((v.x + 1) * w) / 2),
      y: Math.round(((-v.y + 1) * h) / 2),
      inFront: v.z < 1.0,
    };
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (this.isPaused) return;

    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.pulseClock += delta;

    // Shortest-path circular distance wrapping (eliminates sudden reverse turnarounds)
    let diff = this.targetScrollProgress - this.scrollProgress;
    diff = diff - Math.round(diff); // wraps diff into (-0.5, 0.5]

    const progressDamping = 1 - Math.exp(-2.6 * delta);
    this.scrollProgress = ((this.scrollProgress + diff * progressDamping) % 1.0 + 1.0) % 1.0;

    // Camera Spline Flight along Continuous Oval Loop
    const p = this.scrollProgress;
    const splineCamPos = this.cameraSpline.getPointAt(p);
    const splineTarget = this.targetSpline.getPointAt(p);

    // Mouse Parallax Damping
    const mouseDamping = 1 - Math.exp(-2.8 * delta);
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * mouseDamping;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * mouseDamping;

    // Double-damped Camera Position (silky smooth translation)
    const desiredCamPos = splineCamPos.clone().add(new THREE.Vector3(this.mouse.x, this.mouse.y, 0));
    const posDamping = 1 - Math.exp(-3.2 * delta);
    this.smoothedCamPos.lerp(desiredCamPos, posDamping);
    this.camera.position.copy(this.smoothedCamPos);

    // Damped Gaze / Look Target (silky smooth angular rotation, zero abrupt head-snaps)
    const targetDamping = 1 - Math.exp(-2.8 * delta);
    this.smoothedTargetPos.lerp(splineTarget, targetDamping);
    this.camera.lookAt(this.smoothedTargetPos);

    // Animate moving glass elevator pods
    this.animatedElevators.forEach((el) => {
      const range = el.maxY - el.minY;
      const t = (this.pulseClock * 0.4 * el.speed + el.offset) % (Math.PI * 2);
      const normY = (Math.sin(t) + 1) / 2; // 0 to 1
      el.mesh.position.y = el.minY + normY * range;
    });

    // Animate rooftop warning beacons pulsing
    const beaconPulse = Math.sin(this.pulseClock * 4) * 0.5 + 0.5;
    this.warningBeacons.forEach((b) => {
      (b.material as THREE.MeshBasicMaterial).opacity = 0.4 + beaconPulse * 0.6;
    });

    // Raycast hover check
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveMeshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const bldg = this.buildingGroupMap.get(hitMesh);
      if (bldg) {
        const screenPos = this.projectToScreen(bldg.position.clone().setY(25));
        this.callbacks.onHoverBuilding(bldg, { x: screenPos.x, y: screenPos.y });
      }
    } else {
      this.callbacks.onHoverBuilding(null, null);
    }

    // Update 3D-to-2D Projected Company Beacons
    if (this.callbacks.onBeaconsUpdate) {
      const w = this.canvas.clientWidth;
      const h = this.canvas.clientHeight;

      const beacons: BeaconScreenPos[] = this.buildings.map((b) => {
        const beaconAnchor = b.position.clone().setY(b.archetype === 'twin' ? 50 : 34);
        const proj = this.projectToScreen(beaconAnchor);

        const clampedX = Math.max(65, Math.min(w - 65, proj.x));
        const clampedY = Math.max(45, Math.min(h - 45, proj.y));

        return {
          id: b.id,
          name: b.name,
          companyName: b.companyName,
          campusZone: b.campusZone,
          roleId: b.roleId,
          matchPercentage: b.matchPercentage,
          x: clampedX,
          y: clampedY,
          visible: proj.inFront && proj.x > 0 && proj.x < w && proj.y > 0 && proj.y < h,
        };
      });

      this.callbacks.onBeaconsUpdate(beacons);
    }

    // Telemetry District Update
    let currentDistrict = 'Panoramic Tech Park Campus';
    if (p > 0.05 && p <= 0.16) currentDistrict = 'Stripe Payments Terraces';
    else if (p > 0.16 && p <= 0.27) currentDistrict = 'Linear Systems Ring Clearing';
    else if (p > 0.27 && p <= 0.38) currentDistrict = 'Anthropic Frontier AI Ziggurat';
    else if (p > 0.38 && p <= 0.50) currentDistrict = 'OpenAI Intelligence Quad';
    else if (p > 0.50 && p <= 0.61) currentDistrict = 'Figma Design Systems Annex';
    else if (p > 0.61 && p <= 0.72) currentDistrict = 'Vercel Cloud Edge Atrium';
    else if (p > 0.72 && p <= 0.83) currentDistrict = 'Cloudflare Edge Twin Spire';
    else if (p > 0.83 && p <= 0.94) currentDistrict = 'Databricks Lakehouse Concourse';

    this.callbacks.onCameraUpdate({
      altitude: Math.round(this.camera.position.y),
      fov: Math.round(this.camera.fov),
      district: currentDistrict,
      progress: Math.round(p * 100),
    });

    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  public dispose() {
    cancelAnimationFrame(this.animationFrameId);

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.container.removeEventListener('pointermove', this.onPointerMove);
    this.container.removeEventListener('click', this.onClick);
    this.container.removeEventListener('wheel', this.onWheel);

    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    // Dispose geometries and materials
    if (this.facadeTexture) this.facadeTexture.dispose();
    if (this.turfTexture) this.turfTexture.dispose();
    if (this.leafStippleTexture) this.leafStippleTexture.dispose();
    if (this.paverJointTexture) this.paverJointTexture.dispose();
    if (this.barkTexture) this.barkTexture.dispose();
    if (this.timberTexture) this.timberTexture.dispose();

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
  }
}
