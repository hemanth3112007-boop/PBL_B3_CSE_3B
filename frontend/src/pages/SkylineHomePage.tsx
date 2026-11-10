import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowRight, Cpu } from 'lucide-react';
import { DeveloperProfile, TargetRole, PRIMARY_PROFILE, TARGET_ROLES } from '../data/mockProfiles';

interface SkylineHomePageProps {
  onEnterWorkspace: (roleId?: string) => void;
  onSelectRole: (roleId: string) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  readinessPercentage?: number;
  profile?: DeveloperProfile;
  targetRole?: TargetRole;
}

interface GroundShadowPatch {
  stampIndex: number;
  // Ground-plane world coordinates:
  // worldX: -0.6 (left woods) to +1.6 (right twin spires)
  // worldZ: -0.2 (foreground) to +1.2 (deep background along canal)
  worldX: number;
  worldZ: number;
  windVx: number; // Continuous wind drift speed in world units/sec
  windVz: number;
  baseScaleX: number;
  baseScaleY: number;
  opacity: number;
  rotation: number;
  rotSpeed: number;
}

const TOTAL_FRAMES = 240;

// Module-level persistent GPU frame cache so switching pages NEVER dumps or reloads frames!
const globalDarkFrames: Array<ImageBitmap | HTMLImageElement | null> = new Array(TOTAL_FRAMES).fill(null);
const globalLightFrames: Array<ImageBitmap | HTMLImageElement | null> = new Array(TOTAL_FRAMES).fill(null);
let isGlobalPreloadRunning = false;
let globalCacheVersion = 0;
let currentGlobalTheme: 'dark' | 'light' = 'dark';

type PreloadListener = (darkCount: number, lightCount: number) => void;
const preloadListeners = new Set<PreloadListener>();
const notifyPreloadListeners = (darkCount: number, lightCount: number) => {
  preloadListeners.forEach((fn) => fn(darkCount, lightCount));
};

const getLoadedCount = (arr: Array<ImageBitmap | HTMLImageElement | null>) =>
  arr.reduce((acc, item) => (item !== null ? acc + 1 : acc), 0);

// Maps target frame index [0..239] directly 1:1 to source frames based on light/dark mode
const getSourceFrameUrl = (frameIndex: number, isLightMode: boolean): string => {
  const clamped = Math.max(1, Math.min(TOTAL_FRAMES, frameIndex + 1));
  const pad = String(clamped).padStart(3, '0');
  return isLightMode
    ? `/assets/frames_day/frame_${pad}.jpg`
    : `/assets/frames/frame_${pad}.jpg`;
};

const processFrame = async (i: number, isLight: boolean): Promise<ImageBitmap | HTMLImageElement | null> => {
  const targetArr = isLight ? globalLightFrames : globalDarkFrames;
  if (targetArr[i]) return targetArr[i];

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = getSourceFrameUrl(i, isLight);
    img.onload = async () => {
      if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
        try {
          // Cap GPU texture size to 1440x810 to prevent 4GB VRAM thrashing across 480 frames
          const bitmap = await createImageBitmap(img, {
            resizeWidth: 1440,
            resizeHeight: 810,
            resizeQuality: 'medium',
          });
          resolve(bitmap);
          return;
        } catch {
          // fallback to img directly
        }
      }
      resolve(img);
    };
    img.onerror = () => resolve(null);
  });
};

const startGlobalPreloadIfNeeded = () => {
  if (isGlobalPreloadRunning) return;
  isGlobalPreloadRunning = true;

  (async () => {
    try {
      // 1. Immediately decode Frame 0 of BOTH Dark and Light modes so instant toggle works at 0ms
      if (!globalDarkFrames[0] || !globalLightFrames[0]) {
        const [firstDark, firstLight] = await Promise.all([
          processFrame(0, false),
          processFrame(0, true),
        ]);
        if (firstDark) globalDarkFrames[0] = firstDark;
        if (firstLight) globalLightFrames[0] = firstLight;
        globalCacheVersion++;
        notifyPreloadListeners(getLoadedCount(globalDarkFrames), getLoadedCount(globalLightFrames));
      }

      // Build progressive stride order: [4, 2, 1]
      const strideIndices: number[] = [];
      for (const step of [4, 2, 1]) {
        for (let i = 0; i < TOTAL_FRAMES; i += step) {
          if (!strideIndices.includes(i)) strideIndices.push(i);
        }
      }

      const BATCH_SIZE = 8;
      for (let b = 0; b < strideIndices.length; b += BATCH_SIZE) {
        const slice = strideIndices.slice(b, b + BATCH_SIZE);
        await Promise.all(
          slice.map(async (frameIdx) => {
            const isLightPriority = currentGlobalTheme === 'light';
            if (isLightPriority) {
              if (!globalLightFrames[frameIdx]) {
                const bm = await processFrame(frameIdx, true);
                if (bm) globalLightFrames[frameIdx] = bm;
              }
              if (!globalDarkFrames[frameIdx]) {
                const bm = await processFrame(frameIdx, false);
                if (bm) globalDarkFrames[frameIdx] = bm;
              }
            } else {
              if (!globalDarkFrames[frameIdx]) {
                const bm = await processFrame(frameIdx, false);
                if (bm) globalDarkFrames[frameIdx] = bm;
              }
              if (!globalLightFrames[frameIdx]) {
                const bm = await processFrame(frameIdx, true);
                if (bm) globalLightFrames[frameIdx] = bm;
              }
            }
          })
        );

        globalCacheVersion++;
        notifyPreloadListeners(getLoadedCount(globalDarkFrames), getLoadedCount(globalLightFrames));
      }
    } catch (err) {
      console.warn('Preload batch encountered non-fatal error:', err);
    } finally {
      isGlobalPreloadRunning = false;
    }
  })();
};

export const SkylineHomePage: React.FC<SkylineHomePageProps> = ({
  onEnterWorkspace,
  theme = 'dark',
  onToggleTheme,
  readinessPercentage = 93,
  profile = PRIMARY_PROFILE,
  targetRole = TARGET_ROLES[0],
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const atmoCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active theme detection: light mode uses the newly generated daytime video frames
  const isLightMode = theme === 'light';

  // Ground-Plane World-Locked Shadows & Continuous Wind Drift
  const shadowStampsRef = useRef<HTMLCanvasElement[]>([]);
  const shadowPatchesRef = useRef<GroundShadowPatch[]>([]);
  const [isCloudsActive] = useState<boolean>(true);
  const [sunlitTheme] = useState<'daylight' | 'golden'>('daylight');

  // Preloader State with Live Listener Subscription
  const [loadProgress, setLoadProgress] = useState<number>(() => {
    const isLight = theme === 'light';
    const activeCount = isLight ? getLoadedCount(globalLightFrames) : getLoadedCount(globalDarkFrames);
    return Math.min(100, Math.round((activeCount / TOTAL_FRAMES) * 100));
  });
  const [isPreloaderVisible, setIsPreloaderVisible] = useState<boolean>(() => {
    const isLight = theme === 'light';
    const activeCount = isLight ? getLoadedCount(globalLightFrames) : getLoadedCount(globalDarkFrames);
    const combinedCount = getLoadedCount(globalDarkFrames) + getLoadedCount(globalLightFrames);
    return !(activeCount >= 24 || combinedCount >= 32);
  });
  const [isSharpenerActive] = useState<boolean>(true);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const progressFillRef = useRef<HTMLDivElement>(null);

  // Reference the persistent module-level frame caches
  const darkFramesRef = useRef<Array<ImageBitmap | HTMLImageElement | null>>(globalDarkFrames);
  const lightFramesRef = useRef<Array<ImageBitmap | HTMLImageElement | null>>(globalLightFrames);
  const lastDrawnCacheVersionRef = useRef<number>(-1);
  const activeThemeRef = useRef<'dark' | 'light'>(theme);
  activeThemeRef.current = theme;
  currentGlobalTheme = theme;
  // Continuous Cinematic 650ms Day/Night GPU Cross-Dissolve State
  const targetThemeBlendRef = useRef<number>(isLightMode ? 1 : 0);
  const currentThemeBlendRef = useRef<number>(isLightMode ? 1 : 0);
  const hasInitialDrawRef = useRef<boolean>(false);

  // Silky Ping-Pong Scrubbing State Machine
  const targetFrameRef = useRef<number>(0);
  const currentFrameFloatRef = useRef<number>(0);
  const lastDrawnFrameIndexRef = useRef<number>(-1);
  const lastDrawnBlendRef = useRef<number>(-1);
  const scrollDirectionRef = useRef<1 | -1>(1); // 1 = forward, -1 = reverse
  const dragStartYRef = useRef<number | null>(null);

  // Clean single-frame renderer: returns true if the exact requested frame was drawn, false if fallback was used
  const drawInterpolatedSequence = useCallback((
    ctx: CanvasRenderingContext2D,
    frames: Array<ImageBitmap | HTMLImageElement | null>,
    frameFloat: number,
    layerAlpha: number
  ): boolean => {
    if (layerAlpha <= 0.005 || frames.length === 0) return true;

    const maxFrame = TOTAL_FRAMES - 1;
    const idx = Math.max(0, Math.min(maxFrame, Math.round(frameFloat)));
    const hasExactFrame = Boolean(frames[idx]);

    // Full-range fallback search (searches entire 240-frame array so scrubbing NEVER freezes on a gap)
    const getValidBitmap = (targetIdx: number): ImageBitmap | HTMLImageElement | null => {
      if (frames[targetIdx]) return frames[targetIdx];
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        if (targetIdx - offset >= 0 && frames[targetIdx - offset]) return frames[targetIdx - offset];
        if (targetIdx + offset <= maxFrame && frames[targetIdx + offset]) return frames[targetIdx + offset];
      }
      return null;
    };

    const bitmap = getValidBitmap(idx);
    if (!bitmap) return false;

    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;
    const bw = (bitmap as ImageBitmap).width || (bitmap as HTMLImageElement).naturalWidth || cw;
    const bh = (bitmap as ImageBitmap).height || (bitmap as HTMLImageElement).naturalHeight || ch;

    const scale = Math.max(cw / bw, ch / bh);
    const nw = bw * scale;
    const nh = bh * scale;
    const cx = (cw - nw) / 2;
    const cy = (ch - nh) / 2;

    ctx.globalAlpha = layerAlpha;
    ctx.drawImage(bitmap, cx, cy, nw, nh);
    return hasExactFrame;
  }, []);

  // Simple frame draw fallback
  const drawFrameToCanvas = useCallback((source: ImageBitmap | HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas || !source) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const bw = (source as ImageBitmap).width || (source as HTMLImageElement).naturalWidth || cw;
    const bh = (source as ImageBitmap).height || (source as HTMLImageElement).naturalHeight || ch;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const scale = Math.max(cw / bw, ch / bh);
    const nw = bw * scale;
    const nh = bh * scale;
    const cx = (cw - nw) / 2;
    const cy = (ch - nh) / 2;

    ctx.globalAlpha = 1.0;
    ctx.drawImage(source, cx, cy, nw, nh);
  }, []);

  // 1. Persistent Priority Preloader: Live subscriber connection & interleaved background loader
  useEffect(() => {
    const handleProgress: PreloadListener = (darkCount, lightCount) => {
      const isLight = activeThemeRef.current === 'light';
      const activeCount = isLight ? lightCount : darkCount;
      const combinedCount = darkCount + lightCount;
      const pct = Math.min(100, Math.round((activeCount / TOTAL_FRAMES) * 100));
      setLoadProgress(pct);

      if (activeCount >= 24 || combinedCount >= 32) {
        setIsPreloaderVisible(false);
      }
    };

    preloadListeners.add(handleProgress);
    // Immediately invoke with current state
    handleProgress(getLoadedCount(globalDarkFrames), getLoadedCount(globalLightFrames));

    // Safety timeout: user is NEVER trapped on the preloader screen
    const safetyTimer = setTimeout(() => {
      setIsPreloaderVisible(false);
    }, 2200);

    // Initial frame draw if already available in cache
    const isLight = activeThemeRef.current === 'light';
    const initFrame = isLight
      ? globalLightFrames[0] || globalDarkFrames[0]
      : globalDarkFrames[0] || globalLightFrames[0];
    if (initFrame && !hasInitialDrawRef.current) {
      drawFrameToCanvas(initFrame);
      hasInitialDrawRef.current = true;
    }

    startGlobalPreloadIfNeeded();

    return () => {
      preloadListeners.delete(handleProgress);
      clearTimeout(safetyTimer);
    };
  }, [drawFrameToCanvas]);

  // Continuous Day/Night Cross-Dissolve Target Trigger (Cinematic 650ms Dusk/Dawn Morph)
  useEffect(() => {
    currentGlobalTheme = theme;
    activeThemeRef.current = theme;
    targetThemeBlendRef.current = theme === 'light' ? 1 : 0;
    lastDrawnBlendRef.current = -1; // Force immediate canvas repaint & cross-dissolve on theme toggle!
  }, [theme]);

  // 1. Pre-Bake 6 Massive, Morphologically Varied Cumulus Shadow Archetypes (On Mount)
  useEffect(() => {
    const STAMP_W = 768;
    const STAMP_H = 768;
    const stamps: HTMLCanvasElement[] = [];

    // 6 distinct cloud shadow silhouettes so shadows are never uniform or thin:
    // 0: Giant Dense Super-Cumulus (thick multi-lobed mass covering multiple buildings)
    // 1: Sprawling L-Shaped Weather Front (wide asymmetric dogleg cluster)
    // 2: Billowing Twin-Core Anvil (two massive dense cores joined by a bridge)
    // 3: Diagonal Squall Band (broad diagonal bank with trailing puffs)
    // 4: Round Towering Cumulonimbus Footprint (deep, high-opacity central mass)
    // 5: Scattered Archipelago Cluster (3 distinct medium-large shadow islands)
    const archetypes = [
      { lobes: [{ cx: 0, cy: 0, rx: 190, ry: 155, count: 28 }, { cx: 95, cy: -55, rx: 140, ry: 120, count: 18 }] },
      { lobes: [{ cx: -90, cy: -40, rx: 165, ry: 115, count: 22 }, { cx: 85, cy: -20, rx: 150, ry: 110, count: 20 }, { cx: 110, cy: 95, rx: 135, ry: 125, count: 18 }] },
      { lobes: [{ cx: -115, cy: 15, rx: 175, ry: 145, count: 24 }, { cx: 120, cy: -25, rx: 185, ry: 150, count: 24 }, { cx: 0, cy: 0, rx: 110, ry: 90, count: 12 }] },
      { lobes: [{ cx: -130, cy: -85, rx: 155, ry: 120, count: 20 }, { cx: 0, cy: 0, rx: 180, ry: 135, count: 24 }, { cx: 135, cy: 80, rx: 150, ry: 115, count: 20 }] },
      { lobes: [{ cx: 0, cy: 0, rx: 220, ry: 185, count: 38 }] },
      { lobes: [{ cx: -120, cy: -70, rx: 130, ry: 110, count: 16 }, { cx: 115, cy: -45, rx: 145, ry: 120, count: 18 }, { cx: -15, cy: 105, rx: 160, ry: 125, count: 20 }] },
    ];

    for (let s = 0; s < archetypes.length; s++) {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = STAMP_W;
      offCanvas.height = STAMP_H;
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) continue;

      const centerX = STAMP_W / 2;
      const centerY = STAMP_H / 2;
      const arch = archetypes[s];

      // Pass 1: Broad outer solar penumbra (soft ambient edge)
      offCtx.filter = 'blur(26px)';
      offCtx.fillStyle = 'rgba(10, 22, 46, 0.36)';
      for (const lobe of arch.lobes) {
        for (let b = 0; b < lobe.count; b++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.pow(Math.random(), 1.2) * 1.0;
          const bx = centerX + lobe.cx + Math.cos(angle) * dist * lobe.rx;
          const by = centerY + lobe.cy + Math.sin(angle) * dist * lobe.ry;
          const rx = 55 + Math.random() * 95;
          const ry = rx * (0.65 + Math.random() * 0.32); // Full, billowy body (not thin!)
          const rot = (Math.random() - 0.5) * 0.8;

          offCtx.beginPath();
          offCtx.ellipse(bx, by, rx, ry, rot, 0, Math.PI * 2);
          offCtx.fill();
        }
      }

      // Pass 2: Dense umbra core (deep sunlight occlusion in the center of the cloud mass)
      offCtx.filter = 'blur(14px)';
      offCtx.fillStyle = 'rgba(6, 14, 32, 0.52)';
      for (const lobe of arch.lobes) {
        for (let b = 0; b < Math.floor(lobe.count * 0.65); b++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.pow(Math.random(), 1.6) * 0.65;
          const bx = centerX + lobe.cx + Math.cos(angle) * dist * lobe.rx;
          const by = centerY + lobe.cy + Math.sin(angle) * dist * lobe.ry;
          const rx = 45 + Math.random() * 75;
          const ry = rx * (0.68 + Math.random() * 0.28);

          offCtx.beginPath();
          offCtx.ellipse(bx, by, rx, ry, 0, 0, Math.PI * 2);
          offCtx.fill();
        }
      }

      stamps.push(offCanvas);
    }

    shadowStampsRef.current = stamps;

    // 2. Initialize 7 Varied World-Anchored Shadow Patches (ranging from massive sprawling banks to medium clusters)
    shadowPatchesRef.current = [
      { stampIndex: 0, worldX: 0.15, worldZ: 0.20, windVx: 0.048, windVz: 0.014, baseScaleX: 1.65, baseScaleY: 1.15, opacity: 0.72, rotation: 0.12, rotSpeed: 0.008 },
      { stampIndex: 1, worldX: 0.75, worldZ: 0.32, windVx: 0.036, windVz: 0.010, baseScaleX: 2.10, baseScaleY: 1.35, opacity: 0.68, rotation: -0.25, rotSpeed: -0.006 },
      { stampIndex: 2, worldX: 0.28, worldZ: 0.58, windVx: 0.042, windVz: 0.015, baseScaleX: 1.40, baseScaleY: 0.95, opacity: 0.65, rotation: 0.35, rotSpeed: 0.007 },
      { stampIndex: 4, worldX: 0.85, worldZ: 0.74, windVx: 0.032, windVz: 0.009, baseScaleX: 1.95, baseScaleY: 1.45, opacity: 0.74, rotation: -0.10, rotSpeed: 0.005 },
      { stampIndex: 3, worldX: -0.18, worldZ: 0.44, windVx: 0.044, windVz: 0.013, baseScaleX: 1.75, baseScaleY: 1.10, opacity: 0.66, rotation: 0.22, rotSpeed: -0.009 },
      { stampIndex: 5, worldX: 0.50, worldZ: 0.92, windVx: 0.039, windVz: 0.011, baseScaleX: 1.55, baseScaleY: 1.05, opacity: 0.62, rotation: -0.40, rotSpeed: 0.006 },
      { stampIndex: 0, worldX: -0.35, worldZ: 0.82, windVx: 0.046, windVz: 0.014, baseScaleX: 2.25, baseScaleY: 1.40, opacity: 0.70, rotation: 0.05, rotSpeed: -0.005 },
    ];
  }, []);

  // Handle Canvas Resize and High DPI for Both Main Frame & Atmosphere Layers
  useEffect(() => {
    const handleResize = () => {
      // Cap main canvas DPR at 1.5 for 60FPS 2D drawImage throughput
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        lastDrawnFrameIndexRef.current = -1; // Force redraw
      }

      // Render soft blurred shadow canvas at 0.5x resolution (cuts multiply-blend GPU cost by 90%!)
      const atmoCanvas = atmoCanvasRef.current;
      if (atmoCanvas) {
        const rect = atmoCanvas.getBoundingClientRect();
        atmoCanvas.width = Math.max(1, Math.round(rect.width * 0.5));
        atmoCanvas.height = Math.max(1, Math.round(rect.height * 0.5));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. 60/120 FPS Zero-Lag Integer Frame & Continuous Cross-Dissolve Render Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const renderScrubLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // 1. Continuous Day/Night Cross-Dissolve Transition (~650ms dusk/dawn GPU morph)
      const themeDiff = targetThemeBlendRef.current - currentThemeBlendRef.current;
      const isThemeTransitioning = Math.abs(themeDiff) > 0.002;
      if (isThemeTransitioning) {
        currentThemeBlendRef.current += themeDiff * (1 - Math.exp(-5.5 * dt));
        if (Math.abs(targetThemeBlendRef.current - currentThemeBlendRef.current) < 0.005) {
          currentThemeBlendRef.current = targetThemeBlendRef.current;
        }
      } else {
        currentThemeBlendRef.current = targetThemeBlendRef.current;
      }

      // 2. Critically Damped Spring scroll physics for weighted camera gimbal deceleration
      const frameDiff = targetFrameRef.current - currentFrameFloatRef.current;
      if (Math.abs(frameDiff) > 0.01) {
        currentFrameFloatRef.current += frameDiff * (1 - Math.exp(-14 * dt));
      } else {
        currentFrameFloatRef.current = targetFrameRef.current;
      }

      const maxFrame = TOTAL_FRAMES - 1;
      const targetIntFrame = Math.max(0, Math.min(maxFrame, Math.round(currentFrameFloatRef.current)));
      const blend = currentThemeBlendRef.current; // 0 = Night, 1 = Day

      // CRITICAL PERFORMANCE GUARD: Only repaint main canvas when the integer frame index OR theme blend actually changes!
      // Also repaint if new frames arrived in cache while we were waiting on an uncached frame!
      const frameChanged = targetIntFrame !== lastDrawnFrameIndexRef.current;
      const blendChanged = Math.abs(blend - lastDrawnBlendRef.current) > 0.003;
      const cacheUpdated = globalCacheVersion !== lastDrawnCacheVersionRef.current;

      const canvas = canvasRef.current;
      if (canvas && (frameChanged || blendChanged || cacheUpdated || !hasInitialDrawRef.current)) {
        const ctx = canvas.getContext('2d', { alpha: false });
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          let exactDarkDrawn = true;
          let exactLightDrawn = true;

          // Draw Night Base if visible
          if (blend < 0.998) {
            exactDarkDrawn = drawInterpolatedSequence(ctx, darkFramesRef.current, targetIntFrame, 1.0);
          }

          // Cross-dissolve Daylight Layer over Night Layer
          if (blend > 0.002) {
            exactLightDrawn = drawInterpolatedSequence(ctx, lightFramesRef.current, targetIntFrame, blend);
          }

          ctx.globalAlpha = 1.0;
          hasInitialDrawRef.current = true;
          lastDrawnBlendRef.current = blend;
          lastDrawnCacheVersionRef.current = globalCacheVersion;
          // Only lock lastDrawnFrameIndexRef if the EXACT target frame was in cache!
          if (exactDarkDrawn && exactLightDrawn) {
            lastDrawnFrameIndexRef.current = targetIntFrame;
          }
        }

        // Update progress bar via DOM ref to avoid 60FPS React state re-renders
        if (progressFillRef.current) {
          progressFillRef.current.style.width = `${(targetIntFrame / maxFrame) * 100}%`;
        }
      }

      // 4. Ground-Plane Projection & Continuous Wind Drift (Only runs in Daylight / transition mode!)
      const shadowCanvas = atmoCanvasRef.current;
      if (shadowCanvas && shadowStampsRef.current.length > 0) {
        const shadowOpacity = isCloudsActive ? Math.min(1, blend * 0.95) : 0;
        shadowCanvas.style.opacity = String(shadowOpacity);

        // Skip shadow canvas clearing & drawing completely in Dark Mode (blend <= 0.01) to save GPU!
        if (shadowOpacity > 0.01) {
          const sCtx = shadowCanvas.getContext('2d');
          if (sCtx) {
            const scw = shadowCanvas.width;
            const sch = shadowCanvas.height;
            sCtx.clearRect(0, 0, scw, sch);

            const camProgress = currentFrameFloatRef.current / maxFrame;
            const vanishX = scw * 0.48;
            const vanishY = sch * 0.16;

            for (const patch of shadowPatchesRef.current) {
              patch.worldX += patch.windVx * dt;
              patch.worldZ += patch.windVz * dt;
              patch.rotation += patch.rotSpeed * dt;

              if (patch.worldX > 1.65) patch.worldX = -0.65;
              if (patch.worldZ > 1.35) patch.worldZ = -0.15;

              const relZ = patch.worldZ + camProgress * 0.42;
              const depthScale = Math.max(0.25, Math.pow(relZ + 0.35, 1.35));
              const screenX = vanishX + (patch.worldX - 0.48) * scw * depthScale * 0.95;
              const screenY = vanishY + relZ * sch * 0.72;

              // Larger footprint multiplier (0.48x width, 0.42x height) so shadows sweep across entire building complexes
              const drawW = scw * 0.48 * patch.baseScaleX * depthScale;
              const drawH = sch * 0.42 * patch.baseScaleY * depthScale;

              const edgeFade = Math.min(1, Math.max(0, (relZ - 0.05) * 4));
              sCtx.globalAlpha = patch.opacity * edgeFade;

              const stamp = shadowStampsRef.current[patch.stampIndex];
              if (stamp) {
                sCtx.save();
                sCtx.translate(screenX, screenY);
                sCtx.rotate(patch.rotation);
                sCtx.drawImage(
                  stamp,
                  -drawW * 0.5,
                  -drawH * 0.5,
                  drawW,
                  drawH
                );
                sCtx.restore();
              }
            }
            sCtx.globalAlpha = 1.0;
          }
        }
      }

      animId = requestAnimationFrame(renderScrubLoop);
    };

    animId = requestAnimationFrame(renderScrubLoop);
    return () => cancelAnimationFrame(animId);
  }, [drawInterpolatedSequence, isCloudsActive]);

  // Shared helper for clean Ping-Pong (Triangle-Wave) boundary reflection
  const advanceTargetFrame = useCallback((rawStep: number) => {
    const maxFrame = TOTAL_FRAMES - 1;
    let next = targetFrameRef.current + rawStep * scrollDirectionRef.current;

    // Reflect cleanly off [0, maxFrame] boundaries and flip polarity
    while (next > maxFrame || next < 0) {
      if (next > maxFrame) {
        next = maxFrame - (next - maxFrame);
        scrollDirectionRef.current = (scrollDirectionRef.current * -1) as 1 | -1;
      } else if (next < 0) {
        next = -next;
        scrollDirectionRef.current = (scrollDirectionRef.current * -1) as 1 | -1;
      }
    }

    targetFrameRef.current = next;
  }, []);

  // 3. Continuous Ping-Pong (Triangle-Wave) Wheel Scrubbing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault();

      // Normalize deltaMode (0 = pixels, 1 = lines)
      const pixelDelta = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
      const isNotchedMouse = Math.abs(pixelDelta) >= 48;

      // Tuned for effortless traversal across 240 frames:
      // Notched wheel moves ~6.5 frames per click; trackpad glides smoothly
      const deltaFrames = isNotchedMouse
        ? Math.sign(pixelDelta) * Math.min(Math.abs(pixelDelta) * 0.075, 8.5)
        : pixelDelta * 0.14;

      advanceTargetFrame(deltaFrames);
    };

    container.addEventListener('wheel', handleWheelEvent, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheelEvent);
    };
  }, [advanceTargetFrame]);

  // Mouse drag support for scrubbing with boundary polarity bounce
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragStartYRef.current = e.clientY;
    setIsScrubbing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragStartYRef.current === null) return;
    const deltaY = dragStartYRef.current - e.clientY;
    advanceTargetFrame(deltaY * 0.45);
    dragStartYRef.current = e.clientY;
  };

  const handleMouseUp = () => {
    dragStartYRef.current = null;
    setIsScrubbing(false);
  };

  // Touch swipe support for mobile/tablets
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      dragStartYRef.current = e.touches[0].clientY;
      setIsScrubbing(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (dragStartYRef.current === null || e.touches.length === 0) return;
    const deltaY = dragStartYRef.current - e.touches[0].clientY;
    advanceTargetFrame(deltaY * 0.48);
    dragStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    dragStartYRef.current = null;
    setIsScrubbing(false);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-[calc(100vh-3.5rem)] overflow-hidden select-none cursor-ns-resize ${isScrubbing ? 'active:cursor-ns-resize' : ''}`}
      style={{
        background: isLightMode
          ? 'url(/assets/frames_day/frame_001.jpg) center/cover no-repeat, linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 50%, #BFDBFE 100%)'
          : 'url(/image_188.png) center/cover no-repeat, radial-gradient(ellipse at 50% 0%, #1E293B 0%, #0F172A 45%, #070B16 100%)',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. Zero-Latency Locked 60 FPS Canvas Frame Renderer */}
      <canvas
        id="campus-frame-canvas"
        ref={canvasRef}
        className={`w-full h-full object-cover z-0 select-none pointer-events-none transition-[filter] duration-200 ${
          isSharpenerActive ? 'extra-crisp' : ''
        }`}
      />

      {/* 2. DYNAMIC CAST GROUND & BUILDING SHADOWS LAYER (GPU Multiply Blended, Sky-Masked) */}
      <canvas
        id="atmosphere-layer"
        ref={atmoCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        style={{
          mixBlendMode: 'multiply',
          maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 14%, rgba(0,0,0,0.5) 24%, black 38%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 14%, rgba(0,0,0,0.5) 24%, black 38%)',
        }}
      />

      {/* Subtle Daylight Golden-Hour Ambient Sky Glow */}
      <div 
        className="absolute inset-0 z-5 pointer-events-none transition-opacity duration-300"
        style={{
          background: sunlitTheme === 'golden'
            ? 'radial-gradient(ellipse at 70% 12%, rgba(251, 191, 36, 0.22) 0%, rgba(245, 158, 11, 0.08) 45%, transparent 80%)'
            : 'radial-gradient(ellipse at 75% 15%, rgba(254, 243, 199, 0.16) 0%, rgba(226, 232, 240, 0.05) 50%, transparent 80%)',
        }}
      />

      {/* Subtle Architectural Dot/Dither Overlay */}
      <div className="upscale-dither-overlay opacity-15" />

      {/* Startup Preloader Overlay (Theme-Adaptive Warm Glass / Nocturnal HUD) */}
      {isPreloaderVisible && (
        <div className={`absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md transition-all duration-300 ${
          isLightMode ? 'bg-[#E2E8F0]/80 text-[#0F172A]' : 'bg-[#070B16]/85 text-[#F8FAFC]'
        }`}>
          <div className={`p-6 max-w-sm w-full mx-4 space-y-4 rounded-2xl shadow-2xl text-center backdrop-blur-xl border transition-colors duration-300 ${
            isLightMode 
              ? 'bg-white/85 border-slate-300/80 text-[#0F172A]' 
              : 'bg-[#0A0A0A]/90 border-white/15 text-[#F8FAFC]'
          }`}>
            <div className="flex items-center justify-center gap-2">
              <Cpu className={`w-5 h-5 animate-spin ${isLightMode ? 'text-[#0284C7]' : 'text-[#38BDF8]'}`} style={{ animationDuration: '6s' }} />
              <span className={`text-xs font-mono font-bold tracking-wider uppercase ${isLightMode ? 'text-[#0F172A]' : 'text-[#F8FAFC]'}`}>
                Dual-Spectrum Frame Engine
              </span>
            </div>

            <div className="space-y-1.5">
              <div className={`text-[11px] font-mono ${isLightMode ? 'text-[#475569]' : 'text-[#94A3B8]'}`}>
                Preloading Day & Night Frames for Zero-Lag Switch...
              </div>
              <div className={`text-xl font-bold font-mono ${isLightMode ? 'text-[#0284C7]' : 'text-[#38BDF8]'}`}>
                {loadProgress}%
              </div>
            </div>

            {/* Thin Progress Bar */}
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLightMode ? 'bg-[#CBD5E1]' : 'bg-[#1E293B]'}`}>
              <div
                className="h-full bg-gradient-to-r from-[#0284C7] to-[#38BDF8] transition-all duration-150 rounded-full"
                style={{ width: `${loadProgress}%` }}
              />
            </div>

            <div className="pt-2 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreloaderVisible(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#0284C7] hover:bg-[#0369A1] text-white transition-colors cursor-pointer shadow"
              >
                Enter Campus &rarr;
              </button>
              <div className="text-[10px] font-mono text-[#64748B]">
                Daytime & night sequences cached in GPU memory
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Floating Starlight Architectural Title Scrim (Translucent Glass) */}
      <div className="absolute top-6 left-6 z-20 max-w-lg pointer-events-auto">
        <div 
          className="sunlit-hud p-5 rounded-2xl space-y-3 transition-all duration-300 bg-white/35 dark:bg-black/60 backdrop-blur-xl border border-white/50 dark:border-white/15 text-[#0F172A] dark:text-[#F8FAFC]"
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
          }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0284C7] dark:text-[#38BDF8] tracking-tight leading-tight">
            Where Systems Code Meets Enterprise Campuses.
          </h2>

          <div className="pt-1 flex items-center gap-3">
            <button
              onClick={() => onEnterWorkspace()}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0284C7] hover:bg-[#0369A1] text-white flex items-center gap-1.5 transition-colors shadow-lg shadow-[#0284C7]/25 cursor-pointer"
            >
              <span>Enter Codolio Portfolio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Unified Connected Bottom-Right HUD Console: Hiring Readiness */}
      <div className="fixed bottom-0 right-0 z-40 w-72 sm:w-80 bg-[#000000] border-t border-l border-white/10 shadow-2xl rounded-tl-2xl overflow-hidden pointer-events-auto flex flex-col">
        {/* Integrated Main Body: Candidate & Benchmark Profile + Hiring Readiness */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-[#050505] min-h-[296px] h-[296px]">
          {/* Upper Section: Profile Pic, Name, Targeting Role & Company */}
          <div className="space-y-3.5">
            {/* Candidate Identity */}
            <div className="flex items-center gap-3">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#38BDF8] shadow-md shadow-[#38BDF8]/20 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-[#F8FAFC] truncate">
                    {profile.name}
                  </h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2cbb5d]" title="Verified Active Candidate" />
                </div>
                <p className="text-[11px] font-mono text-[#94A3B8] truncate">
                  @{profile.handle}
                </p>
              </div>
            </div>

            {/* Target Role & Benchmark Company */}
            <div className="p-3 rounded-xl bg-[#0F0F0F] border border-white/10 space-y-1.5">
              <span className="text-[9px] font-mono uppercase text-[#64748B] font-semibold tracking-wider block">
                Targeting Role &amp; Company
              </span>
              <div className="text-xs font-bold text-[#F8FAFC] truncate">
                {targetRole.title.split('//')[0]}
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono pt-0.5">
                <span className="text-[#38BDF8] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                  {targetRole.companyName}
                </span>
                <span className="text-[#94A3B8] text-[10px]">
                  {targetRole.campusPavilion}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Section: Hiring Readiness & Progress Bar */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
                <span className="text-[11px] font-mono uppercase text-[#94A3B8] font-bold tracking-wider">
                  Hiring Readiness
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#38BDF8] px-2 py-0.5 rounded bg-[#38BDF8]/10 border border-[#38BDF8]/20">
                {readinessPercentage}% Match
              </span>
            </div>

            {/* Mini progress bar */}
            <div className="w-full h-1.5 rounded-full bg-[#121212] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0284C7] to-[#38BDF8] rounded-full transition-all duration-300"
                style={{ width: `${readinessPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
