import {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import {LOGO_FILE, RING_SAMPLES} from './constants';

// The supplied SVG is loaded and parsed at render time, never redrawn: every path keeps its own
// `d`, fill and transform, and each group keeps its transform. The final frames are that SVG.

export type LogoPath = {id: string; d: string; fill: string; transform: string};
export type LogoGroup = {id: string; transform: string; paths: LogoPath[]};
export type Pt = [number, number];
/** A wordmark "o" sampled into matching outer/inner contours, centred on its bbox (logo units). */
export type RingContours = {outer: Pt[]; inner: Pt[]; center: Pt; innerHalf: Pt};
export type Logo = {
  groups: Record<'mascot' | 'speed' | 'wordmark' | 'tagline', LogoGroup>;
  /** Wordmark letters left to right, with their bbox centre in logo units. */
  letters: {path: LogoPath; center: Pt; char: string}[];
  /** Tagline words, each a set of glyph paths with a bbox centre in logo units. */
  words: {paths: LogoPath[]; center: Pt}[];
  ringBold: RingContours; // the "o" in "Go"
  ringLight: RingContours; // the "o" in "Floaters"
};

const GROUP_IDS = {mascot: 'mascot-airplane', speed: 'speed-lines', wordmark: 'wordmark', tagline: 'tagline'} as const;
const CHARS = ['G', 'o', 'F', 'l', 'o', 'a', 't', 'e', 'r', 's'];

const svgNS = 'http://www.w3.org/2000/svg';

const bboxInRoot = (root: SVGSVGElement, el: SVGGraphicsElement) => {
  const b = el.getBBox();
  const m = root.getScreenCTM()!.inverse().multiply(el.getScreenCTM()!);
  const pts = [
    [b.x, b.y],
    [b.x + b.width, b.y + b.height],
  ].map(([x, y]) => new DOMPoint(x, y).matrixTransform(m));
  return {x0: pts[0].x, y0: pts[0].y, x1: pts[1].x, y1: pts[1].y};
};

/** Even arc-length samples of one closed subpath, in root (logo) units, clockwise from the top. */
const sampleContour = (root: SVGSVGElement, host: SVGGElement, d: string, transform: string, n: number): Pt[] => {
  const p = document.createElementNS(svgNS, 'path');
  p.setAttribute('d', d);
  p.setAttribute('transform', transform);
  host.appendChild(p);
  const m = root.getScreenCTM()!.inverse().multiply(p.getScreenCTM()!);
  const len = p.getTotalLength();
  let pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const q = p.getPointAtLength((len * i) / n).matrixTransform(m);
    pts.push([q.x, q.y]);
  }
  host.removeChild(p);
  // Shoelace in y-down space: positive area = clockwise on screen.
  let area = 0;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % n];
    area += x0 * y1 - x1 * y0;
  }
  if (area < 0) pts = pts.reverse();
  const cx = pts.reduce((s, q) => s + q[0], 0) / n;
  let top = 0;
  pts.forEach((q, i) => {
    const score = q[1] + Math.abs(q[0] - cx) * 0.5;
    const best = pts[top][1] + Math.abs(pts[top][0] - cx) * 0.5;
    if (score < best) top = i;
  });
  return [...pts.slice(top), ...pts.slice(0, top)];
};

const splitSubpaths = (d: string) =>
  d
    .split(/(?=M)/)
    .map((s) => s.trim())
    .filter(Boolean);

const parse = (text: string): Logo => {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  // Measuring needs a laid-out SVG; mount a hidden copy, read it, remove it.
  const holder = document.createElement('div');
  holder.style.cssText = 'position:absolute;left:-10000px;top:0;width:600px;height:170px;visibility:hidden';
  holder.appendChild(document.importNode(doc.documentElement, true));
  document.body.appendChild(holder);
  const root = holder.querySelector('svg') as SVGSVGElement;
  try {
    const groups = {} as Logo['groups'];
    for (const [key, id] of Object.entries(GROUP_IDS) as [keyof typeof GROUP_IDS, string][]) {
      const g = root.querySelector(`g#${id}`) as SVGGElement | null;
      if (!g) throw new Error(`GoFloaters SVG: group #${id} not found`);
      groups[key] = {
        id,
        transform: g.getAttribute('transform') ?? '',
        paths: [...g.querySelectorAll('path')].map((p) => ({
          id: p.id,
          d: p.getAttribute('d') ?? '',
          fill: p.getAttribute('fill') ?? '#000',
          transform: p.getAttribute('transform') ?? '',
        })),
      };
    }
    const boxOf = (id: string) => bboxInRoot(root, root.querySelector(`path#${id}`) as SVGGraphicsElement);
    const centre = (b: ReturnType<typeof boxOf>): Pt => [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2];

    const letters = groups.wordmark.paths
      .map((path) => ({path, box: boxOf(path.id)}))
      .sort((a, b) => a.box.x0 - b.box.x0)
      .map(({path, box}, i) => ({path, center: centre(box), char: CHARS[i] ?? '?'}));
    if (letters.length !== 10) throw new Error(`GoFloaters SVG: expected 10 wordmark glyphs, found ${letters.length}`);

    // Tagline glyphs → words, split wherever the gap between glyphs is wider than a letter gap.
    const glyphs = groups.tagline.paths.map((path) => ({path, box: boxOf(path.id)})).sort((a, b) => a.box.x0 - b.box.x0);
    const words: Logo['words'] = [];
    let cur: typeof glyphs = [];
    const flush = () => {
      if (!cur.length) return;
      const x0 = Math.min(...cur.map((g) => g.box.x0));
      const x1 = Math.max(...cur.map((g) => g.box.x1));
      const y0 = Math.min(...cur.map((g) => g.box.y0));
      const y1 = Math.max(...cur.map((g) => g.box.y1));
      words.push({paths: cur.map((g) => g.path), center: [(x0 + x1) / 2, (y0 + y1) / 2]});
      cur = [];
    };
    glyphs.forEach((g, i) => {
      if (i > 0 && g.box.x0 - glyphs[i - 1].box.x1 > 7) flush();
      cur.push(g);
    });
    flush();

    const wordmarkG = root.querySelector('g#wordmark') as SVGGElement;
    const ring = (idx: number): RingContours => {
      const {path, center} = letters[idx];
      const [outerD, innerD] = splitSubpaths(path.d);
      const a = sampleContour(root, wordmarkG, outerD, path.transform, RING_SAMPLES);
      const b = sampleContour(root, wordmarkG, innerD, path.transform, RING_SAMPLES);
      const area = (pts: Pt[]) => {
        const xs = pts.map((p) => p[0]);
        const ys = pts.map((p) => p[1]);
        return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
      };
      const [outer, inner] = area(a) >= area(b) ? [a, b] : [b, a];
      const rel = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [x - center[0], y - center[1]]);
      const ix = inner.map((p) => p[0]);
      const iy = inner.map((p) => p[1]);
      return {
        outer: rel(outer),
        inner: rel(inner),
        center,
        innerHalf: [(Math.max(...ix) - Math.min(...ix)) / 2, (Math.max(...iy) - Math.min(...iy)) / 2],
      };
    };
    return {groups, letters, words, ringBold: ring(1), ringLight: ring(4)};
  } finally {
    document.body.removeChild(holder);
  }
};

let cache: Logo | null = null;

export const useLogo = (): Logo | null => {
  const [logo, setLogo] = useState<Logo | null>(cache);
  const [handle] = useState(() => (cache ? null : delayRender('Loading GoFloaters SVG')));
  useEffect(() => {
    if (cache || handle === null) return;
    fetch(staticFile(LOGO_FILE))
      .then((r) => {
        if (!r.ok) throw new Error(`Missing ${LOGO_FILE}: place the supplied SVG in public/ (see gofloaters/README.md)`);
        return r.text();
      })
      .then((text) => {
        cache = parse(text);
        setLogo(cache);
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [handle]);
  return logo;
};
