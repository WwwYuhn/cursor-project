"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import {
  Bounds,
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
  PerspectiveCamera,
  RoundedBox,
  useGLTF,
  useBounds,
} from "@react-three/drei";
import { withBasePath } from "@/lib/basePath";
import { t } from "@/lib/i18n";
import { getDeviceById, type AppleDevice } from "@/lib/devices";
import {
  type Locale,
  usePreviewStore,
  type TextureAdjustments,
} from "@/lib/store";

type SceneProps = {
  onExportReady?: (handler: (() => void) | null) => void;
  isMoveMode: boolean;
  importedFileName: string | null;
  fitToken: number;
  isGlobalPreview: boolean;
  locale: Locale;
  onExitGlobalPreview: () => void;
};

type TexturePair = {
  procedural: THREE.CanvasTexture;
  gltf: THREE.CanvasTexture;
};

type ScreenTextureResult = {
  textures: TexturePair | null;
  canScrollPreview: boolean;
};

type TextureCanvasPair = {
  procedural: HTMLCanvasElement;
  gltf: HTMLCanvasElement;
};

const DEFAULT_SCREEN_SVG = `
<svg width="1200" height="1600" viewBox="0 0 1200 1600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="1600" rx="90" fill="#000000"/>
</svg>
`;

const DEFAULT_SCREEN_DATA_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  DEFAULT_SCREEN_SVG,
)}`;

const SCREEN_COLORS = {
  body: "#d3d8e3",
  shadow: "#778195",
  bezel: "#06080d",
  hinge: "#cfd5e0",
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function applyBrightnessAndContrast(
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  adjustments: TextureAdjustments,
) {
  if (adjustments.brightness === 100 && adjustments.contrast === 100) {
    return;
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const brightness = adjustments.brightness / 100;
  const contrast = adjustments.contrast / 100;

  for (let index = 0; index < data.length; index += 4) {
    data[index] = clamp(((data[index] - 128) * contrast + 128) * brightness, 0, 255);
    data[index + 1] = clamp(
      ((data[index + 1] - 128) * contrast + 128) * brightness,
      0,
      255,
    );
    data[index + 2] = clamp(
      ((data[index + 2] - 128) * contrast + 128) * brightness,
      0,
      255,
    );
  }

  context.putImageData(imageData, 0, 0);
}

function createScreenCanvas(screenAspect: number) {
  const maxSize = 2048;
  const canvas = document.createElement("canvas");

  if (screenAspect >= 1) {
    canvas.width = maxSize;
    canvas.height = Math.round(maxSize / screenAspect);
  } else {
    canvas.width = Math.round(maxSize * screenAspect);
    canvas.height = maxSize;
  }

  return canvas;
}

function paintTextureCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  fitMode: "fit" | "fill",
  adjustments: TextureAdjustments,
  enableScrollPreview: boolean,
  scrollProgress: number,
  shouldFlipVertically: boolean,
) {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create 2D canvas context.");
  }

  const viewportAspect = canvas.width / canvas.height;
  const imageAspect = image.naturalWidth / image.naturalHeight;
  const isTallImage = imageAspect < viewportAspect;
  const useScrollPreview = enableScrollPreview && isTallImage;
  const baseScale = useScrollPreview
    ? canvas.width / image.naturalWidth
    : fitMode === "fill"
      ? Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight)
      : Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
  const scale = baseScale * adjustments.scale;
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const maxOffsetX = Math.abs(drawWidth - canvas.width) / (2 * canvas.width);
  const maxOffsetY = Math.abs(drawHeight - canvas.height) / (2 * canvas.height);
  const offsetX = clamp(adjustments.offsetX, -maxOffsetX, maxOffsetX) * canvas.width;
  const offsetY = useScrollPreview
    ? (0.5 - scrollProgress) * Math.max(0, drawHeight - canvas.height)
    : clamp(adjustments.offsetY, -maxOffsetY, maxOffsetY) * canvas.height;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#05070d";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.save();
  context.translate(canvas.width * 0.5 + offsetX, canvas.height * 0.5 + offsetY);

  if (shouldFlipVertically) {
    context.scale(1, -1);
  }

  context.rotate(THREE.MathUtils.degToRad(adjustments.rotation));
  context.drawImage(image, -drawWidth * 0.5, -drawHeight * 0.5, drawWidth, drawHeight);
  context.restore();
  applyBrightnessAndContrast(context, canvas, adjustments);
}

function createTextureFromCanvas(canvas: HTMLCanvasElement, flipY: boolean) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.flipY = flipY;
  texture.needsUpdate = true;

  return texture;
}

function useScreenTexture(
  device: AppleDevice,
  screenAspect: number,
  liveScrollProgress: number,
): ScreenTextureResult {
  const currentTextureUrl = usePreviewStore((state) => state.currentTextureUrl);
  const fitMode = usePreviewStore((state) => state.fitMode);
  const scrollPreviewEnabled = usePreviewStore((state) => state.scrollPreviewEnabled);
  const textureAdjustments = usePreviewStore((state) => state.textureAdjustments);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const canvasPairRef = useRef<TextureCanvasPair | null>(null);
  const texturesRef = useRef<TexturePair | null>(null);
  const [result, setResult] = useState<ScreenTextureResult>({
    textures: null,
    canScrollPreview: false,
  });

  useEffect(() => {
    const sourceUrl = currentTextureUrl ?? DEFAULT_SCREEN_DATA_URL;
    let cancelled = false;

    const loadImage = (url: string, fallbackUrl?: string) => {
      const nextImage = new Image();
      nextImage.decoding = "async";
      nextImage.onload = () => {
        if (cancelled) {
          return;
        }

        setImage(nextImage);
      };
      nextImage.onerror = () => {
        if (!fallbackUrl || cancelled) {
          return;
        }

        loadImage(fallbackUrl);
      };
      nextImage.src = url;
    };

    loadImage(sourceUrl, sourceUrl === DEFAULT_SCREEN_DATA_URL ? undefined : DEFAULT_SCREEN_DATA_URL);

    return () => {
      cancelled = true;
    };
  }, [currentTextureUrl]);

  useEffect(() => {
    return () => {
      texturesRef.current?.procedural.dispose();
      texturesRef.current?.gltf.dispose();
    };
  }, []);

  useEffect(() => {
    if (!image) {
      setResult({
        textures: null,
        canScrollPreview: false,
      });
      return;
    }

    const nextProceduralCanvas = createScreenCanvas(screenAspect);
    const nextGltfCanvas = createScreenCanvas(screenAspect);
    const currentCanvasPair = canvasPairRef.current;
    const shouldRecreateTextures =
      !currentCanvasPair ||
      currentCanvasPair.procedural.width !== nextProceduralCanvas.width ||
      currentCanvasPair.procedural.height !== nextProceduralCanvas.height;

    if (shouldRecreateTextures) {
      texturesRef.current?.procedural.dispose();
      texturesRef.current?.gltf.dispose();

      canvasPairRef.current = {
        procedural: nextProceduralCanvas,
        gltf: nextGltfCanvas,
      };
      texturesRef.current = {
        procedural: createTextureFromCanvas(nextProceduralCanvas, true),
        gltf: createTextureFromCanvas(nextGltfCanvas, false),
      };
    }

    const canvasPair = canvasPairRef.current;
    const textures = texturesRef.current;

    if (!canvasPair || !textures) {
      return;
    }

    const viewportAspect = canvasPair.procedural.width / canvasPair.procedural.height;
    const imageAspect = image.naturalWidth / image.naturalHeight;
    const canScrollPreview = imageAspect < viewportAspect;
    const shouldEnableScrollPreview = scrollPreviewEnabled && canScrollPreview;

    paintTextureCanvas(
      canvasPair.procedural,
      image,
      fitMode,
      textureAdjustments,
      shouldEnableScrollPreview,
      liveScrollProgress,
      false,
    );
    paintTextureCanvas(
      canvasPair.gltf,
      image,
      fitMode,
      textureAdjustments,
      shouldEnableScrollPreview,
      liveScrollProgress,
      true,
    );

    textures.procedural.needsUpdate = true;
    textures.gltf.needsUpdate = true;

    setResult((previous) => {
      if (previous.textures === textures && previous.canScrollPreview === canScrollPreview) {
        return previous;
      }

      return {
        textures,
        canScrollPreview,
      };
    });
  }, [fitMode, image, liveScrollProgress, screenAspect, scrollPreviewEnabled, textureAdjustments]);

  return result;
}

function LoadingIndicator() {
  const locale = usePreviewStore((state) => state.locale);

  return (
    <Html center>
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-xl">
        {t(locale, "loadingDevice")}
      </div>
    </Html>
  );
}

function ExportBridge({
  onExportReady,
}: {
  onExportReady?: (handler: (() => void) | null) => void;
}) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    if (!onExportReady) {
      return;
    }

    onExportReady(() => {
      gl.render(scene, camera);

      const link = document.createElement("a");
      link.href = gl.domElement.toDataURL("image/png");
      link.download = "apple-3d-preview.png";
      link.click();
    });

    return () => onExportReady(null);
  }, [camera, gl, onExportReady, scene]);

  return null;
}

function ScreenMaterial({ texture }: { texture: THREE.Texture }) {
  return (
    <meshStandardMaterial
      map={texture}
      emissiveMap={texture}
      emissive="#101726"
      emissiveIntensity={0.22}
      toneMapped={false}
      metalness={0}
      roughness={0.92}
      polygonOffset
      polygonOffsetFactor={-2}
      polygonOffsetUnits={-2}
    />
  );
}

function ScreenSurface({
  width,
  height,
  radius,
  position,
  texture,
}: {
  width: number;
  height: number;
  radius: number;
  position: [number, number, number];
  texture: THREE.Texture;
}) {
  return (
    <RoundedBox args={[width, height, 0.006]} radius={radius} smoothness={6} position={position}>
      <ScreenMaterial texture={texture} />
    </RoundedBox>
  );
}

function GltfDevice({
  device,
  screenTexture,
  previewOrientation,
}: {
  device: AppleDevice;
  screenTexture: THREE.Texture;
  previewOrientation: "portrait" | "landscape";
}) {
  const gltf = useGLTF(withBasePath(device.glbPath));
  const clonedScene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const screenMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const rotation = useMemo<[number, number, number]>(() => {
    const [x, y, z] = device.modelRotation ?? [0, 0, 0];

    if (device.category !== "iPhone" || previewOrientation === "portrait") {
      return [x, y, z];
    }

    return [x, y, z - Math.PI / 2];
  }, [device.category, device.modelRotation, previewOrientation]);

  useEffect(() => {
    const exactMatches: THREE.Mesh[] = [];
    const fallbackMatches: THREE.Mesh[] = [];
    const targetName = device.screenMeshName.toLowerCase();
    const screenMaterials: THREE.MeshStandardMaterial[] = [];

    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }

      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      const childName = child.name.toLowerCase();

      if (childName === targetName) {
        exactMatches.push(child);
        return;
      }

      if (/(screen|display|monitor|lcd)/.test(childName)) {
        fallbackMatches.push(child);
      }
    });

    const screenMeshes = exactMatches.length > 0 ? exactMatches : fallbackMatches;

    screenMeshes.forEach((screenMesh) => {
      const sourceMaterials = Array.isArray(screenMesh.material)
        ? screenMesh.material
        : [screenMesh.material];
      const nextMaterials = sourceMaterials.map((sourceMaterial) => {
        const material = sourceMaterial
          ? (sourceMaterial.clone() as THREE.MeshStandardMaterial)
          : new THREE.MeshStandardMaterial();

        material.color = new THREE.Color("#ffffff");
        material.emissive = new THREE.Color("#ffffff");
        material.emissiveIntensity = 0.38;
        material.toneMapped = false;
        material.metalness = 0;
        material.roughness = 1;
        material.transparent = false;
        material.opacity = 1;
        material.side = THREE.DoubleSide;
        material.alphaMap = null;
        material.normalMap = null;
        material.roughnessMap = null;
        material.metalnessMap = null;
        material.aoMap = null;
        material.polygonOffset = true;
        material.polygonOffsetFactor = -2;
        material.polygonOffsetUnits = -2;
        material.needsUpdate = true;

        screenMaterials.push(material);
        return material;
      });

      screenMesh.material = Array.isArray(screenMesh.material) ? nextMaterials : nextMaterials[0];
    });

    screenMaterialsRef.current = screenMaterials;

    return () => {
      screenMaterialsRef.current.forEach((material) => material.dispose());
      screenMaterialsRef.current = [];
    };
  }, [clonedScene, device.screenMeshName]);

  useEffect(() => {
    screenMaterialsRef.current.forEach((material) => {
      material.map = screenTexture;
      material.emissiveMap = screenTexture;
      material.needsUpdate = true;
    });
  }, [screenTexture]);

  return (
    <group
      position={device.modelPosition ?? [0, 0, 0]}
      rotation={rotation}
      scale={device.modelScale ?? 1}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

function ProceduralDevice({
  device,
  screenTexture,
}: {
  device: AppleDevice;
  screenTexture: THREE.Texture;
}) {
  if (device.fallbackVariant === "tablet") {
    return (
      <group rotation={[0.14, -0.52, 0.06]}>
        <RoundedBox args={[3.4, 2.5, 0.12]} radius={0.18} smoothness={6} castShadow receiveShadow>
          <meshStandardMaterial
            color={SCREEN_COLORS.body}
            metalness={0.85}
            roughness={0.22}
          />
        </RoundedBox>
        <RoundedBox
          args={[3.02, 2.18, 0.04]}
          radius={0.12}
          smoothness={6}
          position={[0, 0, 0.042]}
        >
          <meshStandardMaterial
            color={SCREEN_COLORS.bezel}
            metalness={0.55}
            roughness={0.45}
          />
        </RoundedBox>
        <ScreenSurface
          width={2.82}
          height={1.98}
          radius={0.08}
          position={[0, 0, 0.067]}
          texture={screenTexture}
        />
      </group>
    );
  }

  if (device.fallbackVariant === "laptop") {
    return (
      <group rotation={[0.32, -0.62, 0.04]} position={[0, -0.3, 0]}>
        <RoundedBox args={[4.2, 0.14, 2.9]} radius={0.12} smoothness={6} castShadow receiveShadow>
          <meshStandardMaterial
            color={SCREEN_COLORS.body}
            metalness={0.82}
            roughness={0.24}
          />
        </RoundedBox>

        <RoundedBox
          args={[3.92, 0.025, 2.56]}
          radius={0.08}
          smoothness={6}
          position={[0, 0.075, -0.03]}
        >
          <meshStandardMaterial
            color="#151922"
            metalness={0.18}
            roughness={0.62}
          />
        </RoundedBox>

        <mesh position={[0, 0.09, 0.48]} receiveShadow>
          <boxGeometry args={[1.15, 0.01, 0.86]} />
          <meshStandardMaterial color="#2d3440" metalness={0.12} roughness={0.74} />
        </mesh>

        <mesh position={[0, -0.005, 1.48]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[4.45, 3.2]} />
          <shadowMaterial opacity={0.14} />
        </mesh>

        <mesh position={[0, 0.08, -1.36]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.06, 4.0, 10, 24]} />
          <meshStandardMaterial
            color={SCREEN_COLORS.hinge}
            metalness={0.88}
            roughness={0.28}
          />
        </mesh>

        <group position={[0, 0.08, -1.34]} rotation={[-0.34, 0, 0]}>
          <RoundedBox
            args={[3.96, 2.58, 0.12]}
            radius={0.12}
            smoothness={6}
            position={[0, 1.24, -0.04]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color={SCREEN_COLORS.body}
              metalness={0.86}
              roughness={0.2}
            />
          </RoundedBox>

          <RoundedBox
            args={[3.68, 2.3, 0.036]}
            radius={0.08}
            smoothness={6}
            position={[0, 1.24, 0.02]}
          >
            <meshStandardMaterial
              color={SCREEN_COLORS.bezel}
              metalness={0.6}
              roughness={0.45}
            />
          </RoundedBox>

          <ScreenSurface
            width={3.44}
            height={2.06}
            radius={0.03}
            position={[0, 1.24, 0.046]}
            texture={screenTexture}
          />
        </group>
      </group>
    );
  }

  return (
    <group rotation={[0.18, -0.52, 0.05]} position={[0, -0.04, 0]}>
      <RoundedBox args={[1.74, 3.56, 0.16]} radius={0.28} smoothness={10} castShadow receiveShadow>
        <meshStandardMaterial
          color="#d8dde7"
          metalness={0.94}
          roughness={0.12}
        />
      </RoundedBox>

      <RoundedBox
        args={[1.63, 3.42, 0.122]}
        radius={0.23}
        smoothness={8}
        position={[0, 0, 0.012]}
      >
        <meshStandardMaterial
          color="#0a0c11"
          metalness={0.3}
          roughness={0.48}
        />
      </RoundedBox>

      <RoundedBox
        args={[1.54, 3.24, 0.016]}
        radius={0.16}
        smoothness={6}
        position={[0, 0, 0.079]}
      >
        <ScreenMaterial texture={screenTexture} />
      </RoundedBox>

      <mesh position={[0, 1.36, 0.091]}>
        <capsuleGeometry args={[0.066, 0.24, 12, 24]} />
        <meshStandardMaterial color="#05070c" metalness={0.08} roughness={0.95} />
      </mesh>

      <mesh position={[0.255, 1.36, 0.094]}>
        <circleGeometry args={[0.017, 24]} />
        <meshStandardMaterial color="#151b24" metalness={0.15} roughness={0.72} />
      </mesh>

      <mesh position={[-0.915, 0.58, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.018, 0.26, 8, 16]} />
        <meshStandardMaterial color="#c7ced9" metalness={0.92} roughness={0.18} />
      </mesh>

      <mesh position={[-0.915, 0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.018, 0.26, 8, 16]} />
        <meshStandardMaterial color="#c7ced9" metalness={0.92} roughness={0.18} />
      </mesh>

      <mesh position={[0.915, 0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.018, 0.5, 8, 16]} />
        <meshStandardMaterial color="#c7ced9" metalness={0.92} roughness={0.18} />
      </mesh>

      <mesh position={[0, -1.84, 0.01]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.04, 4.04]} />
        <shadowMaterial opacity={0.12} />
      </mesh>
    </group>
  );
}

function DeviceRenderer({
  device,
  liveScrollProgress,
  onReadyChange,
}: {
  device: AppleDevice;
  liveScrollProgress: number;
  onReadyChange: (ready: boolean) => void;
}) {
  const previewOrientation = usePreviewStore((state) => state.previewOrientation);
  const screenAspect =
    device.category === "iPhone" && previewOrientation === "landscape"
      ? 1 / device.screenAspect
      : device.screenAspect;
  const { textures: screenTextures, canScrollPreview } = useScreenTexture(
    device,
    screenAspect,
    liveScrollProgress,
  );
  const hasModel = device.hasRealModel ?? false;
  const setScrollPreviewEnabled = usePreviewStore((state) => state.setScrollPreviewEnabled);

  useEffect(() => {
    setScrollPreviewEnabled(canScrollPreview, { commitHistory: false });
  }, [canScrollPreview, setScrollPreviewEnabled]);

  useEffect(() => {
    onReadyChange(Boolean(screenTextures));
  }, [onReadyChange, screenTextures]);

  if (!screenTextures) {
    return null;
  }

  return hasModel ? (
    <GltfDevice
      device={device}
      screenTexture={screenTextures.gltf}
      previewOrientation={previewOrientation}
    />
  ) : (
    <ProceduralDevice device={device} screenTexture={screenTextures.procedural} />
  );
}

function AutoFrame({
  targetRef,
  fitToken,
  onFramed,
}: {
  targetRef: RefObject<THREE.Group | null>;
  fitToken: number;
  onFramed: () => void;
}) {
  const bounds = useBounds();

  useLayoutEffect(() => {
    if (!targetRef.current) {
      return;
    }

    bounds.refresh(targetRef.current).clip().fit();

    const frame = requestAnimationFrame(() => {
      onFramed();
    });

    return () => cancelAnimationFrame(frame);
  }, [bounds, fitToken, onFramed, targetRef]);

  return null;
}

function SceneContent({
  device,
  onExportReady,
  isMoveMode,
  fitToken,
  onFramed,
  liveScrollProgress,
}: {
  device: AppleDevice;
  onExportReady?: (handler: (() => void) | null) => void;
  isMoveMode: boolean;
  fitToken: number;
  onFramed: () => void;
  liveScrollProgress: number;
}) {
  const framedGroupRef = useRef<THREE.Group>(null);
  const [isDeviceReady, setIsDeviceReady] = useState(false);
  const minOrbitDistance = device.category === "Mac" ? 11.5 : 0.8;
  const orbitZoomSpeed = device.category === "Mac" ? 0.55 : 0.9;

  useEffect(() => {
    setIsDeviceReady(false);
  }, [device.id, fitToken]);

  return (
    <>
      <ExportBridge onExportReady={onExportReady} />

      <color attach="background" args={["#eef2f8"]} />

      <PerspectiveCamera makeDefault position={[0, 1.4, 6]} fov={28} near={0.05} far={100} />

      <ambientLight intensity={0.9} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.3}
      />
      <spotLight
        position={[-6, 6, 4]}
        angle={0.38}
        penumbra={0.85}
        intensity={1.35}
        color="#dde7ff"
      />
      <Environment preset="studio" />

      <Bounds clip margin={device.frameMargin ?? 1.55}>
        <group ref={framedGroupRef} position={[0, -0.2, 0]}>
          <Suspense fallback={<LoadingIndicator />}>
            <DeviceRenderer
              device={device}
              liveScrollProgress={liveScrollProgress}
              onReadyChange={setIsDeviceReady}
            />
            {isDeviceReady ? (
              <AutoFrame targetRef={framedGroupRef} fitToken={fitToken} onFramed={onFramed} />
            ) : null}
          </Suspense>
        </group>
      </Bounds>

      <OrbitControls
        enablePan
        enableZoom
        enableRotate={!isMoveMode}
        enableDamping
        dampingFactor={0.08}
        minDistance={minOrbitDistance}
        maxDistance={30}
        zoomSpeed={orbitZoomSpeed}
        makeDefault
      />
    </>
  );
}

export function Scene({
  onExportReady,
  isMoveMode,
  importedFileName,
  fitToken,
  isGlobalPreview,
  locale,
  onExitGlobalPreview,
}: SceneProps) {
  const currentDeviceId = usePreviewStore((state) => state.currentDevice);
  const currentTextureUrl = usePreviewStore((state) => state.currentTextureUrl);
  const textureAdjustments = usePreviewStore((state) => state.textureAdjustments);
  const setTextureAdjustments = usePreviewStore((state) => state.setTextureAdjustments);
  const commitTextureAdjustments = usePreviewStore((state) => state.commitTextureAdjustments);
  const scrollPreviewEnabled = usePreviewStore((state) => state.scrollPreviewEnabled);
  const scrollProgress = usePreviewStore((state) => state.scrollProgress);
  const setScrollProgress = usePreviewStore((state) => state.setScrollProgress);
  const commitScrollPreview = usePreviewStore((state) => state.commitScrollPreview);
  const deviceRenderKey = usePreviewStore((state) => state.deviceRenderKey);
  const previewOrientation = usePreviewStore((state) => state.previewOrientation);
  const device = getDeviceById(currentDeviceId);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [isFramed, setIsFramed] = useState(false);
  const [liveScrollProgress, setLiveScrollProgress] = useState(scrollProgress);
  const scrollProgressRef = useRef(scrollProgress);
  const scrollVelocityRef = useRef(0);
  const scrollAnimationFrameRef = useRef<number | null>(null);
  const scrollLastTimeRef = useRef<number | null>(null);

  const hasImportedTexture = Boolean(currentTextureUrl);
  const isScrollPreviewActive = scrollPreviewEnabled && hasImportedTexture;

  useEffect(() => {
    setIsFramed(false);
  }, [currentDeviceId, deviceRenderKey, fitToken, previewOrientation, isGlobalPreview]);

  useEffect(() => {
    if (scrollAnimationFrameRef.current !== null) {
      cancelAnimationFrame(scrollAnimationFrameRef.current);
      scrollAnimationFrameRef.current = null;
    }

    scrollLastTimeRef.current = null;
    scrollVelocityRef.current = 0;
    scrollProgressRef.current = scrollProgress;
    setLiveScrollProgress(scrollProgress);
  }, [currentDeviceId, deviceRenderKey, fitToken, isScrollPreviewActive, previewOrientation, scrollProgress]);

  useEffect(() => {
    if (scrollAnimationFrameRef.current !== null) {
      return;
    }

    scrollProgressRef.current = scrollProgress;
    setLiveScrollProgress(scrollProgress);
  }, [scrollProgress]);

  useEffect(() => {
    return () => {
      if (scrollAnimationFrameRef.current !== null) {
        cancelAnimationFrame(scrollAnimationFrameRef.current);
      }
    };
  }, []);

  const animateScrollImpulse = useCallback(
    (deltaVelocity: number) => {
      scrollVelocityRef.current += deltaVelocity;

      if (scrollAnimationFrameRef.current !== null) {
        return;
      }

      const step = (timestamp: number) => {
        const previousTimestamp = scrollLastTimeRef.current ?? timestamp;
        const deltaTime = Math.min((timestamp - previousTimestamp) / 1000, 1 / 30);
        scrollLastTimeRef.current = timestamp;

        let nextProgress = scrollProgressRef.current + scrollVelocityRef.current * deltaTime;
        let nextVelocity = scrollVelocityRef.current;
        const overscroll =
          nextProgress < 0 ? nextProgress : nextProgress > 1 ? nextProgress - 1 : 0;

        if (overscroll !== 0) {
          nextVelocity += (-overscroll * 28 - nextVelocity * 10) * deltaTime;
        } else {
          nextVelocity *= Math.exp(-7.5 * deltaTime);
        }

        nextProgress += nextVelocity * deltaTime;
        nextProgress = clamp(nextProgress, -0.08, 1.08);

        const displayedProgress =
          nextProgress < 0
            ? -Math.tanh(Math.abs(nextProgress) * 8) * 0.035
            : nextProgress > 1
              ? 1 + Math.tanh((nextProgress - 1) * 8) * 0.035
              : nextProgress;

        scrollProgressRef.current = nextProgress;
        scrollVelocityRef.current = nextVelocity;
        setLiveScrollProgress(displayedProgress);

        const settledAtTop = Math.abs(nextProgress) < 0.0008 && Math.abs(nextVelocity) < 0.004;
        const settledAtBottom =
          Math.abs(nextProgress - 1) < 0.0008 && Math.abs(nextVelocity) < 0.004;
        const settledInRange =
          nextProgress >= 0 &&
          nextProgress <= 1 &&
          Math.abs(nextVelocity) < 0.004 &&
          Math.abs(displayedProgress - nextProgress) < 0.0008;

        if (settledAtTop || settledAtBottom || settledInRange) {
          const finalProgress = clamp(nextProgress, 0, 1);
          scrollProgressRef.current = finalProgress;
          scrollVelocityRef.current = 0;
          scrollAnimationFrameRef.current = null;
          scrollLastTimeRef.current = null;
          setLiveScrollProgress(finalProgress);
          setScrollProgress(finalProgress, { commitHistory: false });
          commitScrollPreview();
          return;
        }

        scrollAnimationFrameRef.current = requestAnimationFrame(step);
      };

      scrollAnimationFrameRef.current = requestAnimationFrame(step);
    },
    [commitScrollPreview, setScrollProgress],
  );

  useEffect(() => {
    if (!isScrollPreviewActive) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
        return;
      }

      event.preventDefault();

      const delta = event.key === "ArrowDown" ? -1.3 : 1.3;
      animateScrollImpulse(delta);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [animateScrollImpulse, isScrollPreviewActive]);

  const finishDraggingTexture = () => {
    if (!dragStateRef.current) {
      return;
    }

    dragStateRef.current = null;
    commitTextureAdjustments();
  };

  return (
    <div
      ref={canvasContainerRef}
      className={`relative h-full min-h-[680px] overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 shadow-[0_45px_120px_rgba(0,0,0,0.32)] ${
        hasImportedTexture && isMoveMode ? "cursor-grab active:cursor-grabbing" : ""
      }`}
      onDoubleClick={() => {
        if (isGlobalPreview) {
          onExitGlobalPreview();
        }
      }}
      onPointerDownCapture={(event) => {
        if (!hasImportedTexture || !isMoveMode || event.button !== 0) {
          return;
        }

        const container = canvasContainerRef.current;

        if (!container) {
          return;
        }

        dragStateRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          offsetX: textureAdjustments.offsetX,
          offsetY: textureAdjustments.offsetY,
        };

        container.setPointerCapture(event.pointerId);
        event.preventDefault();
        event.stopPropagation();
      }}
      onPointerMoveCapture={(event) => {
        const dragState = dragStateRef.current;
        const container = canvasContainerRef.current;

        if (!dragState || !container || dragState.pointerId !== event.pointerId) {
          return;
        }

        const bounds = container.getBoundingClientRect();
        const deltaX = (event.clientX - dragState.startX) / bounds.width;
        const deltaY = (event.clientY - dragState.startY) / bounds.height;

        setTextureAdjustments(
          {
            offsetX: dragState.offsetX + deltaX,
            offsetY: dragState.offsetY + deltaY,
          },
          { commitHistory: false },
        );

        event.preventDefault();
        event.stopPropagation();
      }}
      onPointerUpCapture={(event) => {
        const container = canvasContainerRef.current;

        if (dragStateRef.current?.pointerId !== event.pointerId) {
          return;
        }

        container?.releasePointerCapture(event.pointerId);
        finishDraggingTexture();
        event.preventDefault();
        event.stopPropagation();
      }}
      onPointerCancelCapture={(event) => {
        const container = canvasContainerRef.current;

        if (dragStateRef.current?.pointerId !== event.pointerId) {
          return;
        }

        container?.releasePointerCapture(event.pointerId);
        finishDraggingTexture();
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.75),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.42),rgba(226,232,240,0.2))]" />

      {!isGlobalPreview ? (
        <div className="absolute top-5 left-5 z-10 max-w-[280px] rounded-2xl border border-black/8 bg-white/65 px-4 py-3 text-slate-700 backdrop-blur-xl">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-slate-500">
            {t(locale, "preview")}
          </p>
          <p className="mt-1 text-sm font-medium">{device.name}</p>
          <p className="mt-1 truncate text-xs text-slate-500">
            {importedFileName ?? t(locale, "importHint")}
          </p>
        </div>
      ) : null}

      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        style={{ opacity: isFramed ? 1 : 0, transition: "opacity 120ms ease" }}
      >
        <SceneContent
          key={`${device.id}-${deviceRenderKey}`}
          device={device}
          onExportReady={onExportReady}
          isMoveMode={isMoveMode}
          fitToken={fitToken + deviceRenderKey}
          onFramed={() => setIsFramed(true)}
          liveScrollProgress={liveScrollProgress}
        />
      </Canvas>

      {!isFramed ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-slate-100/55 backdrop-blur-[1px]">
          <div className="rounded-2xl border border-black/8 bg-white/70 px-4 py-3 text-sm text-slate-600 shadow-lg">
            {t(locale, "loadingPreview")}
          </div>
        </div>
      ) : null}
    </div>
  );
}
