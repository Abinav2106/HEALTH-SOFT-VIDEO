import React from 'react';
import {C, FONT} from '../constants';
import {Logo, QMark} from './Brand';

// W&W graphic/work panels that replace R2's grid of other characters. Same Doubt in the centre cell;
// the eight neighbours are service panels (never other mascots). Design size 295 x 504 px.

export const PANEL = {w: 295, h: 504, r: 30};

type PanelId = 'consulting' | 'branding' | 'creative' | 'content' | 'marketing' | 'advertising' | 'meta' | 'brand';

const label = (color: string): React.CSSProperties => ({
  position: 'absolute',
  left: 26,
  right: 26,
  bottom: 26,
  fontFamily: FONT,
  fontWeight: 500,
  fontSize: 25,
  lineHeight: 1.15,
  letterSpacing: -0.2,
  color,
});

const line = (w: number, color: string, top: number, left = 26): React.CSSProperties => ({
  position: 'absolute',
  left,
  top,
  width: w,
  height: 10,
  borderRadius: 5,
  background: color,
});

const Frame: React.FC<{bg: string; border?: boolean; children: React.ReactNode}> = ({bg, border, children}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      borderRadius: PANEL.r,
      background: bg,
      overflow: 'hidden',
      boxShadow: border ? 'inset 0 0 0 2px rgba(0,0,0,0.08)' : undefined,
    }}
  >
    {children}
  </div>
);

export const PanelArt: React.FC<{id: PanelId; wobble?: number}> = ({id, wobble = 0}) => {
  const w = {transform: `rotate(${wobble * 4}deg) translateY(${-wobble * 6}px)`};
  switch (id) {
    case 'consulting':
      return (
        <Frame bg={C.black}>
          <div style={{position: 'absolute', left: 26, top: 40, ...w}}>
            <QMark height={150} color={C.orange} />
          </div>
          <div style={line(120, 'rgba(255,255,255,0.25)', 240)} />
          <div style={line(180, 'rgba(255,255,255,0.25)', 262)} />
          <div style={label(C.white)}>Business consulting</div>
        </Frame>
      );
    case 'branding':
      return (
        <Frame bg={C.white} border>
          <div style={{position: 'absolute', left: 30, top: 150, ...w}}>
            <Logo width={235} />
          </div>
          <div style={label(C.black)}>Branding</div>
        </Frame>
      );
    case 'creative':
      return (
        <Frame bg={C.orange}>
          <div style={{position: 'absolute', left: 92, top: 70, ...w}}>
            <QMark height={190} color={C.black} />
          </div>
          <div style={label(C.black)}>Creative direction</div>
        </Frame>
      );
    case 'content':
      return (
        <Frame bg={C.white} border>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 26 + i * 84,
                top: 70 + (i % 2) * 40,
                width: 72,
                height: 128,
                borderRadius: 14,
                background: i === 1 ? C.black : 'rgba(0,0,0,0.08)',
                transform: `rotate(${(i - 1) * 4 + wobble * 3}deg)`,
              }}
            />
          ))}
          <div style={label(C.black)}>Content creation</div>
        </Frame>
      );
    case 'marketing':
      return (
        <Frame bg={C.black}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 26 + (i % 2) * 40,
                top: 60 + i * 66,
                width: 190 - (i % 2) * 40,
                height: 48,
                borderRadius: 24,
                background: i === 2 ? C.orange : 'rgba(255,255,255,0.18)',
                transform: `translateX(${wobble * (i - 1) * 6}px)`,
              }}
            />
          ))}
          <div style={label(C.white)}>Marketing</div>
        </Frame>
      );
    case 'advertising':
      return (
        <Frame bg={C.white} border>
          <div
            style={{
              position: 'absolute',
              left: 26,
              top: 60,
              width: 243,
              height: 170,
              borderRadius: 18,
              background: 'rgba(0,0,0,0.07)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 40,
              top: 74,
              padding: '6px 14px',
              borderRadius: 10,
              background: C.black,
              color: C.white,
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 22,
              ...w,
            }}
          >
            Ad
          </div>
          <div style={label(C.black)}>Advertising</div>
        </Frame>
      );
    case 'meta':
      return (
        <Frame bg={C.orange}>
          {['Business', 'Access', 'Ads'].map((t, i) => (
            <div
              key={t}
              style={{
                position: 'absolute',
                left: 26,
                top: 54 + i * 62,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontFamily: FONT,
                fontWeight: 500,
                fontSize: 24,
                color: C.black,
              }}
            >
              <span style={{width: 26, height: 26, borderRadius: 8, background: C.black}} />
              {t}
            </div>
          ))}
          <div style={label(C.black)}>Meta business setup</div>
        </Frame>
      );
    case 'brand':
    default:
      return (
        <Frame bg={C.white} border>
          <div style={{position: 'absolute', left: 64, top: 120, ...w}}>
            <QMark height={150} color={C.black} />
          </div>
          <div style={label(C.black)}>Why &amp; Whatever</div>
        </Frame>
      );
  }
};

// 3 x 3 cells around Doubt (centre cell is Doubt himself).
export const GRID_PANELS: {id: PanelId; col: number; row: number}[] = [
  {id: 'consulting', col: -1, row: -1},
  {id: 'branding', col: 0, row: -1},
  {id: 'creative', col: 1, row: -1},
  {id: 'content', col: -1, row: 0},
  {id: 'marketing', col: 1, row: 0},
  {id: 'advertising', col: -1, row: 1},
  {id: 'meta', col: 0, row: 1},
  {id: 'brand', col: 1, row: 1},
];
