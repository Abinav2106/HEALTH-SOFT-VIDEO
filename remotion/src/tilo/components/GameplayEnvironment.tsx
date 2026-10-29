import React, {useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {
  AmbientLight,
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  Fog,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {HEIGHT, WIDTH, type TiloConfig} from '../config';
import {buildCity, type Building, type City} from '../lib/city';
import {sheetProgressAt} from '../lib/sheet';
import {useConfig, useT} from '../lib/timeline';
import {useFlight, useFlightCamera} from './FlightCamera';

// VISUAL APPROXIMATION of the game map, reconstructed from the storyboard. Not gameplay capture.

const lin = (hex: string) => new Color(hex); // three converts sRGB hex to linear working space

const withColor = (g: BufferGeometry, col: Color) => {
  const n = g.getAttribute('position').count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) arr.set([col.r, col.g, col.b], i * 3);
  g.setAttribute('color', new BufferAttribute(arr, 3));
  return g;
};

const placedBox = (w: number, h: number, d: number, x: number, y: number, z: number, angle: number) => {
  const g = new BoxGeometry(w, h, d);
  g.rotateY(angle);
  g.translate(x, y, z);
  return g;
};

const stripeTexture = (config: TiloConfig) => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = config.colors.building;
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = config.colors.floorLine;
  ctx.fillRect(0, 0, 64, 7); // one white floor division per storey
  const tex = new CanvasTexture(canvas);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.colorSpace = SRGBColorSpace;
  tex.minFilter = LinearMipmapLinearFilter;
  tex.anisotropy = 8;
  return tex;
};

const buildingParts = (b: Building, config: TiloConfig) => {
  const body = placedBox(b.w, b.height, b.d, b.cx, b.height / 2, b.cz, b.angle);
  // Side faces: v spans the number of storeys so the stripe repeats once per floor.
  const uv = body.getAttribute('uv') as BufferAttribute;
  for (let i = 0; i < uv.count; i++) {
    const face = Math.floor(i / 4); // BoxGeometry: +x, −x, +y, −y, +z, −z
    if (face !== 2 && face !== 3) uv.setY(i, uv.getY(i) * b.floors);
  }
  const shade = 0.9 + b.tint * 0.1;
  withColor(body, new Color(shade, shade, shade));
  const roofT = 0.7;
  const roof = placedBox(b.w + 0.8, roofT, b.d + 0.8, b.cx, b.height + roofT / 2, b.cz, b.angle);
  const pad = b.destination ? 7 : 3;
  const foundation = new PlaneGeometry(b.w + pad * 2, b.d + pad * 2);
  foundation.rotateX(-Math.PI / 2);
  foundation.rotateY(b.angle);
  foundation.translate(b.cx, 0.08, b.cz);
  let box: BufferGeometry | null = null;
  if (b.roofBox) {
    const ca = Math.cos(b.angle);
    const sa = Math.sin(b.angle);
    const ox = b.roofBox.ox * ca + b.roofBox.oz * sa;
    const oz = -b.roofBox.ox * sa + b.roofBox.oz * ca;
    box = placedBox(b.roofBox.w, b.roofBox.h, b.roofBox.d, b.cx + ox, b.height + roofT + b.roofBox.h / 2, b.cz + oz, b.angle);
  }
  void config;
  return {body, roof, foundation, box};
};

const buildScene = (config: TiloConfig, city: City) => {
  const col = config.colors;
  const scene = new Scene();
  scene.fog = new Fog(lin(col.haze), config.city.fogNear, config.city.fogFar);
  scene.background = lin(col.haze);

  // Sky dome: zenith → haze at the horizon (unfogged).
  const sky = new SphereGeometry(3500, 32, 16);
  const pos = sky.getAttribute('position');
  const top = lin(col.zenith);
  const hz = lin(col.haze);
  const skyCol = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const k = Math.min(1, Math.max(0, pos.getY(i) / 3500 / 0.45));
    const c = hz.clone().lerp(top, Math.pow(k, 0.8));
    skyCol.set([c.r, c.g, c.b], i * 3);
  }
  sky.setAttribute('color', new BufferAttribute(skyCol, 3));
  scene.add(new Mesh(sky, new MeshBasicMaterial({vertexColors: true, side: BackSide, fog: false, depthWrite: false})));

  // Ground: white road surface, parcels on top.
  const ground = new PlaneGeometry(9000, 9000);
  ground.rotateX(-Math.PI / 2);
  scene.add(new Mesh(ground, new MeshBasicMaterial({color: lin(col.road)})));

  const parcelColors = col.parcels.map(lin);
  const pp = new Float32Array(city.parcels.length * 18);
  const pc = new Float32Array(city.parcels.length * 18);
  city.parcels.forEach((p, n) => {
    const [a, b, c, d] = p.corners;
    const tri = [a, c, b, a, d, c];
    const pcol = parcelColors[p.color];
    tri.forEach((v, k) => {
      pp.set([v.x, 0, v.z], n * 18 + k * 3);
      pc.set([pcol.r, pcol.g, pcol.b], n * 18 + k * 3);
    });
  });
  const parcels = new BufferGeometry();
  parcels.setAttribute('position', new BufferAttribute(pp, 3));
  parcels.setAttribute('color', new BufferAttribute(pc, 3));
  scene.add(
    new Mesh(
      parcels,
      new MeshBasicMaterial({vertexColors: true, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4}),
    ),
  );

  const bodies: BufferGeometry[] = [];
  const roofs: BufferGeometry[] = [];
  const pads: BufferGeometry[] = [];
  const boxes: BufferGeometry[] = [];
  for (const b of city.buildings) {
    const parts = buildingParts(b, config);
    bodies.push(parts.body);
    roofs.push(parts.roof);
    pads.push(parts.foundation);
    if (parts.box) boxes.push(parts.box);
  }
  scene.add(new Mesh(mergeGeometries(bodies), new MeshLambertMaterial({map: stripeTexture(config), vertexColors: true})));
  scene.add(new Mesh(mergeGeometries(roofs), new MeshLambertMaterial({color: lin(col.roof), emissive: lin(col.roof), emissiveIntensity: 0.12})));
  scene.add(
    new Mesh(
      mergeGeometries(pads),
      new MeshBasicMaterial({color: lin(col.foundation), polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -8}),
    ),
  );
  if (boxes.length) scene.add(new Mesh(mergeGeometries(boxes), new MeshLambertMaterial({color: lin(col.rooftopBox)})));

  scene.add(new AmbientLight(0xffffff, 1.9));
  const sun = new DirectionalLight(0xffffff, 1.5);
  sun.position.set(-0.55, 1, 0.75);
  scene.add(sun);
  return scene;
};

export const GameplayEnvironment: React.FC = () => {
  const config = useConfig();
  const flight = useFlight();
  const t = useT();
  const cam = useFlightCamera();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);

  const city = useMemo(() => buildCity(config, flight), [config, flight]);
  const scene = useMemo(() => buildScene(config, city), [config, city]);

  // WebGL renders into an offscreen canvas; each finished frame is copied into a plain 2D canvas
  // on the page. Keeping the GL surface out of the compositor avoids stale-tile ghosting that
  // software GL (SwiftShader) otherwise produces in headless renders.
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!rendererRef.current) {
      const gl = document.createElement('canvas');
      const r = new WebGLRenderer({canvas: gl, antialias: true, preserveDrawingBuffer: true});
      r.setPixelRatio(1);
      r.setSize(WIDTH, HEIGHT, false);
      rendererRef.current = r;
    }
    const r = rendererRef.current;
    r.render(scene, cam.camera);
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(r.domElement, 0, 0, WIDTH, HEIGHT);
  });

  useEffect(
    () => () => {
      rendererRef.current?.dispose();
      rendererRef.current = null;
    },
    [],
  );

  // Shot 06: the city recedes behind the reward UI — slight veil and a light blur only.
  const s06 = config.shots.s06[0];
  const recede = interpolate(t, [s06, s06 + config.timing.sheetSlideFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const veil = Math.max(sheetProgressAt(config, t) * 0.08, recede * config.ui.backgroundVeil);

  return (
    <AbsoluteFill>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{width: WIDTH, height: HEIGHT, filter: recede > 0 ? `blur(${recede * config.ui.backgroundBlurPx}px)` : undefined}}
      />
      <AbsoluteFill style={{backgroundColor: config.colors.white, opacity: veil}} />
    </AbsoluteFill>
  );
};
