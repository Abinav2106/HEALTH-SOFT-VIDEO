import {HEIGHT, Quad, WIDTH} from '../constants';
import manifest from './manifest.json';
import s01Track from './tracks/s01.json';
import s06Track from './tracks/s06.json';

export type ShotId = 's01' | 's03' | 's04' | 's05' | 's06' | 's11';

export type StockSource = {
  provider: string;
  assetId: string;
  url: string;
  creator: string | null;
  licence: string;
  licenceStatus: 'free-licence' | 'purchased' | 'pending-approval';
  sha256: string;
};

export type StockClip = {
  role: string;
  file: string | null; // relative to public/stock/
  width: number | null;
  height: number | null;
  fps: number | null;
  sourceIn: number; // seconds into the source at the first frame of the shot
  playbackRate?: number; // 0.96 for 25 fps sources conformed to the 24 fps timeline
  focus: [number, number]; // 0..1 point of the source kept on the same relative point of the frame
  zoom: number; // ≥ 1, extra scale over a cover fit (keep ≤ 1.15 to protect resolution)
  screenTrack: string | null;
  source: StockSource | null;
};

type Track = {shot: string; frames: Quad[]};

const SHOTS = manifest.shots as unknown as Record<ShotId, StockClip>;
const TRACKS: Record<string, Track> = {s01: s01Track as unknown as Track, s06: s06Track as unknown as Track};

export const stockClip = (id: ShotId): StockClip => SHOTS[id];
export const isReady = (c: StockClip) => Boolean(c.file && c.width && c.height);

/** Layout of a source clip in the 1080×1920 frame: cover fit, extra zoom, aligned on the focus point. */
export const coverLayout = (c: StockClip) => {
  const w = c.width ?? WIDTH;
  const h = c.height ?? HEIGHT;
  const s = Math.max(WIDTH / w, HEIGHT / h) * Math.max(1, c.zoom);
  const dw = w * s;
  const dh = h * s;
  // Same rule as CSS object-position: the focus point of the image sits on the same point of the box.
  return {s, dw, dh, left: (WIDTH - dw) * c.focus[0], top: (HEIGHT - dh) * c.focus[1]};
};

export const sourceToFrame = (c: StockClip, [x, y]: [number, number]): [number, number] => {
  const l = coverLayout(c);
  return [l.left + x * l.s, l.top + y * l.s];
};

/** Tracked screen corners for a shot-relative frame, in frame px; null when no track exists yet. */
export const trackedQuad = (c: StockClip, shotFrame: number): Quad | null => {
  if (!c.screenTrack) return null;
  const t = TRACKS[c.screenTrack];
  if (!t || t.frames.length === 0) return null;
  const q = t.frames[Math.min(Math.max(0, shotFrame), t.frames.length - 1)];
  return q.map((p) => sourceToFrame(c, p)) as Quad;
};

export class MissingStockError extends Error {}

/** Master renders must never fall back to a placeholder. */
export const assertStock = (id: ShotId) => {
  const c = stockClip(id);
  if (!isReady(c)) {
    throw new MissingStockError(`Video 06 master: no licensed clip for ${id} (${c.role}). Add it with video06/tools/ingest.py.`);
  }
  if (!c.source || c.source.licenceStatus === 'pending-approval') {
    throw new MissingStockError(`Video 06 master: ${id} has no cleared licence record.`);
  }
  return c;
};
