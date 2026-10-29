import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ASSETS, BOLD, C, City, CITIES, COPY, FONT, MEDIUM} from '../constants';
import {EASE_IN_OUT, lerp, prog} from '../lib/motion';
import {makeInset, makeProjection} from '../lib/geo';
import {Tilo} from './Tilo';

// 26–30 s. Full-frame India map (Natural Earth, India point of view), one marker per city plotted
// from coordinates through the boundary's own projection, an NCR inset for New Delhi, Gurugram and
// Noida, the game title, the question and the CTA. Everything is settled by ~27 s and holds.

const MAP_H = 1040;
const MAP_TOP = 356;
const probe = makeProjection({x: 0, y: MAP_TOP, height: MAP_H});
export const MAP = makeProjection({x: (1080 - probe.width) / 2, y: MAP_TOP, height: MAP_H});

// NCR inset: same projection, magnified about the three cities' centroid.
const NCR_CITIES: City[] = ['New Delhi', 'Gurugram', 'Noida'];
const NCR_CENTRE: [number, number] = [
  NCR_CITIES.reduce((s, c) => s + CITIES[c][0], 0) / 3,
  NCR_CITIES.reduce((s, c) => s + CITIES[c][1], 0) / 3,
];
export const INSET = {x: 612, y: 364, w: 398, h: 262, zoom: 16.5};
const insetProject = makeInset(MAP, NCR_CENTRE, INSET.zoom, INSET.x + INSET.w / 2 + 6, INSET.y + INSET.h / 2 + 8);

type Label = {city: City; dx: number; dy: number; anchor: 'start' | 'end'};
// Label anchor offsets from each dot (px). Mumbai sits in the Arabian Sea with a leader so it can
// never collide with Pune; Chennai and Bangalore read level with each other on opposite sides.
const MAIN_LABELS: Label[] = [
  {city: 'Mumbai', dx: -48, dy: 52, anchor: 'end'},
  {city: 'Pune', dx: 24, dy: 50, anchor: 'start'},
  {city: 'Hyderabad', dx: 28, dy: 12, anchor: 'start'},
  {city: 'Bangalore', dx: -28, dy: 12, anchor: 'end'},
  {city: 'Chennai', dx: 28, dy: 12, anchor: 'start'},
];
const INSET_LABELS: Label[] = [
  {city: 'New Delhi', dx: 26, dy: -16, anchor: 'start'},
  {city: 'Gurugram', dx: 16, dy: 46, anchor: 'start'},
  {city: 'Noida', dx: -30, dy: 34, anchor: 'end'},
];

export const MARKER_R = 11;
export const MARKERS_AT = 782;

const Spark: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0 -20 C2 -6 6 -2 20 0 C6 2 2 6 0 20 C-2 6 -6 2 -20 0 C-6 -2 -2 -6 0 -20Z"
    fill={C.yellow}
  />
);

const Marker: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) =>
  p > 0 ? <circle cx={x} cy={y} r={MARKER_R * p} fill={C.blue} stroke={C.navy} strokeWidth={3.5} /> : null;

const CityLabel: React.FC<{x: number; y: number; l: Label; p: number; leader?: boolean}> = ({x, y, l, p, leader}) => {
  const lx = x + l.dx;
  const ly = y + l.dy;
  // Leader: from the dot's edge to just short of the label's anchor. Always drawn in the NCR inset;
  // on the main map only where the label sits away from its dot.
  const ang = Math.atan2(ly - 11 - y, lx - x);
  const len = Math.hypot(lx - x, ly - 11 - y);
  const x1 = x + Math.cos(ang) * (MARKER_R + 4);
  const y1 = y + Math.sin(ang) * (MARKER_R + 4);
  const x2 = x + Math.cos(ang) * Math.max(MARKER_R + 6, len - 8);
  const y2 = y + Math.sin(ang) * Math.max(MARKER_R + 6, len - 8);
  return (
    <g opacity={p}>
      {(leader || len > 36) && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.navy} strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />}
      <text
        x={lx + (l.anchor === 'start' ? 4 : -4)}
        y={ly}
        textAnchor={l.anchor}
        fontFamily={FONT}
        fontWeight={MEDIUM}
        fontSize={34}
        fill={C.navy}
      >
        {l.city}
      </text>
    </g>
  );
};

export const S6Ending: React.FC<{f: number}> = ({f}) => {
  const bg = f >= 778;
  const map = prog(f, 770, 22, EASE_IN_OUT);
  const logo = prog(f, 772, 18);
  const title = prog(f, 776, 18);
  const inset = prog(f, 784, 14);
  const question = prog(f, 790, 16);
  const cta = prog(f, 796, 14);
  const tiloT = prog(f, 778, 30, EASE_IN_OUT);
  const delhi = MAP.city('New Delhi');

  return (
    <AbsoluteFill style={{backgroundColor: bg ? C.white : 'transparent'}}>
      {/* logo lockup: supplied artwork, static, fade only */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 92, height: 118, opacity: logo}}>
        <Img src={staticFile(ASSETS.tilo)} style={{position: 'absolute', left: 292, top: 0, width: 222, height: 118}} />
        <Img src={staticFile(ASSETS.wordmark)} style={{position: 'absolute', left: 520, top: 8, width: 286, height: 105}} />
      </div>

      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {/* title */}
        <g opacity={title} transform={`translate(0 ${lerp(16, 0, title)})`}>
          <text x={540} y={300} textAnchor="middle" fontFamily={FONT} fontWeight={BOLD} fontSize={56} letterSpacing={-0.6} fill={C.navy}>
            {COPY.gameTitle}
          </text>
          <Spark x={152} y={281} s={0.9} />
          <Spark x={928} y={281} s={0.9} />
        </g>

        {/* India */}
        <g opacity={map} transform={`translate(540 ${MAP_TOP + MAP_H / 2}) scale(${lerp(0.97, 1, map)}) translate(-540 ${-(MAP_TOP + MAP_H / 2)})`}>
          <path d={MAP.path} fill={C.blue} fillOpacity={0.16} stroke={C.blue} strokeWidth={3} strokeLinejoin="round" />
        </g>

        {/* NCR: area marker on the main map, leader to the inset */}
        <g opacity={inset}>
          <rect x={delhi[0] - 20} y={delhi[1] - 20} width={40} height={40} rx={8} fill="none" stroke={C.navy} strokeWidth={3} />
          <line x1={delhi[0] + 20} y1={delhi[1] - 10} x2={INSET.x} y2={INSET.y + INSET.h * 0.62} stroke={C.navy} strokeWidth={2.5} opacity={0.7} />
          <rect x={INSET.x} y={INSET.y} width={INSET.w} height={INSET.h} rx={22} fill={C.white} stroke={C.blue} strokeWidth={3} />
          <text x={INSET.x + 24} y={INSET.y + 46} fontFamily={FONT} fontWeight={BOLD} fontSize={30} fill={C.navy}>
            NCR
          </text>
        </g>
        {INSET_LABELS.map((l, i) => {
          const [x, y] = insetProject(CITIES[l.city][0], CITIES[l.city][1]);
          const p = prog(f, MARKERS_AT + 6 + i * 2, 10);
          return (
            <g key={l.city}>
              <CityLabel x={x} y={y} l={l} p={prog(f, MARKERS_AT + 10 + i * 2, 12)} leader />
              <Marker x={x} y={y} p={p} />
            </g>
          );
        })}

        {MAIN_LABELS.map((l, i) => {
          const [x, y] = MAP.city(l.city);
          return (
            <g key={l.city}>
              <CityLabel x={x} y={y} l={l} p={prog(f, MARKERS_AT + 4 + i * 2, 12)} />
              <Marker x={x} y={y} p={l.city === 'Mumbai' ? (f >= MARKERS_AT ? 1 : 0) : prog(f, MARKERS_AT + i * 2, 10)} />
            </g>
          );
        })}

        {/* question */}
        <text
          x={540}
          y={1540 + lerp(18, 0, question)}
          opacity={question}
          textAnchor="middle"
          fontFamily={FONT}
          fontWeight={BOLD}
          fontSize={66}
          letterSpacing={-1.2}
          fill={C.navy}
        >
          {COPY.question}
        </text>
      </svg>

      {/* CTA */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 250,
          top: 1606,
          width: 500,
          height: 108,
          borderRadius: 54,
          border: `5px solid ${C.navy}`,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT,
          fontWeight: BOLD,
          fontSize: 46,
          letterSpacing: '-0.01em',
          color: C.navy,
          backgroundColor: C.white,
          opacity: cta,
          transform: `translateY(${lerp(16, 0, cta)}px)`,
        }}
      >
        {COPY.cta}
      </div>

      {tiloT > 0 && <Tilo x={lerp(-220, 176, tiloT)} y={1348 - Math.sin(tiloT * Math.PI) * 20} width={236} rotate={lerp(-5, -2, tiloT)} />}
    </AbsoluteFill>
  );
};
