import React from 'react';
import {Freeze, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {CLIPS, COLORS, FONT_SANS, LOGO, MATCH, PHONE} from '../constants';
import {EASE_IN_OUT, EASE_OUT, lerp, magnetic, progress} from '../lib/motion';
import {hasStatic} from '../lib/renderMode';
import {Check, IconCabin, IconDesk, IconFocus, IconMeeting, IconRoom, IconTeam} from './Icons';

// Realistic handset (generic: no manufacturer marks) with the fictional GoFloaters mini-interaction.
// Screen space is 392 x 858 px; every UI position below is in that space.
const BEZEL = 11;
const SW = PHONE.w - BEZEL * 2;
const SH = PHONE.h - BEZEL * 2;

const COL = [22, 142, 262];
const CARD_W = 108;
const REQ = {y: 214, h: 128};
const SLOT = {y: 356, h: 118};
const TRAY = {y: 530, h: 118};

const REQS = [
  {label: 'FOCUS', Icon: IconFocus},
  {label: 'MEETING', Icon: IconMeeting},
  {label: 'TEAM', Icon: IconTeam},
];
// Tray order is shuffled so the drag travels across the screen: QUIET DESK sits under TEAM.
const SPACES = [
  {label: ['MEETING', 'ROOM'], Icon: IconRoom, col: 0},
  {label: ['TEAM', 'CABIN'], Icon: IconCabin, col: 1},
  {label: ['QUIET', 'DESK'], Icon: IconDesk, col: 2},
];
const DRAGGED = 2;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = progress(frame, PHONE.enter, PHONE.settle - PHONE.enter, EASE_OUT);
  const scale = lerp(1.32, 1, enter);
  const ty = lerp(260, 0, enter);

  return (
    <div
      style={{
        position: 'absolute',
        left: PHONE.x - PHONE.w / 2,
        top: PHONE.y - PHONE.h / 2,
        width: PHONE.w,
        height: PHONE.h,
        transform: `translateY(${ty}px) scale(${scale})`,
        opacity: Math.min(1, enter * 2.5),
      }}
    >
      {/* Shadow, frame, side keys */}
      <div style={{position: 'absolute', inset: 0, borderRadius: 66, boxShadow: '0 60px 120px rgba(10,40,50,0.28), 0 18px 40px rgba(10,40,50,0.18)'}} />
      <div style={{position: 'absolute', left: -4, top: 170, width: 5, height: 60, borderRadius: 3, background: '#cfd4d8'}} />
      <div style={{position: 'absolute', left: -4, top: 250, width: 5, height: 60, borderRadius: 3, background: '#cfd4d8'}} />
      <div style={{position: 'absolute', right: -4, top: 210, width: 5, height: 96, borderRadius: 3, background: '#cfd4d8'}} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 66,
          background: 'linear-gradient(145deg, #f4f6f7 0%, #d9dee1 45%, #eef1f2 100%)',
          padding: 4,
        }}
      >
        <div style={{position: 'absolute', inset: 4, borderRadius: 62, background: '#0b0b0c'}} />
      </div>
      <div style={{position: 'absolute', left: BEZEL, top: BEZEL, width: SW, height: SH, borderRadius: 54, overflow: 'hidden', background: COLORS.white}}>
        <Screen frame={frame} />
        {/* Dynamic island + glass sheen */}
        <div style={{position: 'absolute', left: SW / 2 - 60, top: 14, width: 120, height: 34, borderRadius: 17, background: '#000'}} />
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 38%)', pointerEvents: 'none'}} />
      </div>
    </div>
  );
};

const Screen: React.FC<{frame: number}> = ({frame}) => {
  const morph = progress(frame, MATCH.morph, 14, EASE_IN_OUT); // match → discovery
  const header = progress(frame, MATCH.headerIn, 8);
  const logoOk = hasStatic(LOGO.src);

  // Drag of QUIET DESK from the tray to the slot under FOCUS, with a magnetic snap.
  const m = magnetic(frame, MATCH.dragFrom, MATCH.snapAt);
  const lift = interpolate(frame, [MATCH.touchIn + 2, MATCH.dragFrom, MATCH.snapAt - 1, MATCH.snapAt + 3], [0, 1, 1, 0], clamp);
  const dragX = lerp(COL[SPACES[DRAGGED].col], COL[0], m);
  const dragY = lerp(TRAY.y, SLOT.y, m);
  const snapped = frame >= MATCH.snapAt;
  const found = progress(frame, MATCH.foundIn, 10);
  const foundPop = magnetic(frame, MATCH.foundIn - 6, MATCH.foundIn, 10);

  // Discovery: matched card grows into the result card; requirement cards shrink into filter chips.
  const result = {x: lerp(dragX, 22, morph), y: lerp(dragY, 246, morph), w: lerp(CARD_W, 348, morph), h: lerp(SLOT.h, 334, morph)};
  const fadeMatchUi = 1 - progress(frame, MATCH.morph, 8, EASE_IN_OUT);
  const discovery = progress(frame, MATCH.morph + 8, 10);
  const tap = progress(frame, MATCH.bookTap, 3) * (1 - progress(frame, MATCH.bookTap + 3, 6));

  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: FONT_SANS, color: COLORS.ink}}>
      {/* Status bar */}
      <div style={{position: 'absolute', left: 36, top: 20, fontSize: 17, fontWeight: 650}}>9:41</div>
      <StatusIcons />

      {/* Header: the official lockup, unaltered, small */}
      <div style={{position: 'absolute', left: 20, top: 62, opacity: header, transform: `translateY(${(1 - header) * 8}px)`}}>
        {logoOk ? (
          <Img src={staticFile(LOGO.src)} style={{width: 168, height: (168 * LOGO.height) / LOGO.width, display: 'block'}} />
        ) : (
          <div style={{width: 168, height: 56, border: `1px dashed ${COLORS.cyan}`, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>LOGO PENDING</div>
        )}
      </div>
      <div style={{position: 'absolute', left: 22, right: 22, top: 136, height: 64, opacity: header}}>
        <div style={{position: 'absolute', opacity: Math.max(0, 1 - morph * 2)}}>
          <div style={{fontSize: 23, fontWeight: 850, letterSpacing: '0.06em'}}>WORKSPACE MATCH</div>
          <div style={{fontSize: 15, fontWeight: 500, color: COLORS.inkSoft, marginTop: 6}}>Drag a space to what you need</div>
        </div>
        <div style={{position: 'absolute', opacity: morph, transform: `translateY(${(1 - morph) * 10}px)`}}>
          <div style={{fontSize: 23, fontWeight: 850, letterSpacing: '-0.01em'}}>Find your space</div>
        </div>
      </div>

      {/* Requirement cards → filter chips */}
      {REQS.map((r, i) => {
        const p = progress(frame, MATCH.reqIn[i], 9);
        const active = i === 0 && snapped;
        const y = lerp(REQ.y, 186, morph);
        const h = lerp(REQ.h, 40, morph);
        return (
          <div
            key={r.label}
            style={{
              position: 'absolute',
              left: COL[i],
              top: y,
              width: CARD_W,
              height: h,
              borderRadius: lerp(20, 20, morph),
              background: active ? COLORS.cyan : COLORS.cyanWash,
              border: `2px solid ${active ? COLORS.cyan : 'rgba(110,208,225,0.55)'}`,
              opacity: p,
              transform: `translateY(${(1 - p) * 18}px) scale(${lerp(0.92, 1, p)})`,
              overflow: 'hidden',
            }}
          >
            <div style={{position: 'absolute', left: 0, right: 0, top: 20, display: 'flex', justifyContent: 'center', opacity: 1 - morph}}>
              <div style={{width: 54, height: 54, borderRadius: 27, background: COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <r.Icon size={30} />
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: lerp(88, 9, morph),
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 5,
                fontSize: 15,
                fontWeight: 850,
                letterSpacing: '0.06em',
              }}
            >
              {r.label}
              {active && morph > 0.5 ? <Check size={15} /> : null}
            </div>
          </div>
        );
      })}

      {/* Drop slots + tray (fade out on morph) */}
      <div style={{position: 'absolute', inset: 0, opacity: fadeMatchUi}}>
        {COL.map((x, i) => {
          const p = progress(frame, MATCH.reqIn[i] + 3, 9);
          const glow = i === 0 ? lift * m : 0;
          return (
            <div
              key={`slot${i}`}
              style={{
                position: 'absolute',
                left: x,
                top: SLOT.y,
                width: CARD_W,
                height: SLOT.h,
                borderRadius: 20,
                border: `2px dashed ${glow > 0.3 ? COLORS.cyan : 'rgba(17,17,17,0.18)'}`,
                background: `rgba(110,208,225,${0.18 * glow})`,
                opacity: p,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
                fontWeight: 300,
                color: 'rgba(17,17,17,0.25)',
              }}
            >
              +
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 22, top: 500, fontSize: 12, fontWeight: 750, letterSpacing: '0.16em', color: COLORS.inkSoft, opacity: progress(frame, MATCH.spaceIn[0], 8)}}>
          WORKSPACES
        </div>
        {SPACES.map((s, i) =>
          i === DRAGGED ? null : <SpaceCard key={i} s={s} x={COL[s.col]} y={TRAY.y} p={progress(frame, MATCH.spaceIn[i], 9)} />,
        )}
        {/* MATCH FOUND ✓ */}
        <div
          style={{
            position: 'absolute',
            left: 22,
            top: 682,
            width: 348,
            height: 66,
            borderRadius: 33,
            background: COLORS.black,
            color: COLORS.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            fontSize: 21,
            fontWeight: 850,
            letterSpacing: '0.08em',
            opacity: found,
            transform: `scale(${lerp(0.86, 1, Math.min(foundPop, 1.04))})`,
          }}
        >
          MATCH FOUND
          <div style={{width: 34, height: 34, borderRadius: 17, background: COLORS.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Check size={20} />
          </div>
        </div>
      </div>

      {/* The dragged card (stays on top; becomes the result card) */}
      <div
        style={{
          position: 'absolute',
          left: result.x,
          top: result.y,
          width: result.w,
          height: result.h,
          borderRadius: 20,
          background: snapped ? COLORS.cyan : COLORS.white,
          border: `2px solid ${snapped ? COLORS.cyan : '#E3E6E8'}`,
          boxShadow: `0 ${4 + lift * 16}px ${14 + lift * 26}px rgba(0,0,0,${0.08 + lift * 0.12})`,
          transform: `scale(${1 + lift * 0.06}) rotate(${lift * (1 - m) * -4}deg)`,
          opacity: progress(frame, MATCH.spaceIn[DRAGGED], 9),
          overflow: 'hidden',
        }}
      >
        <div style={{position: 'absolute', inset: 0, opacity: 1 - morph}}>
          <SpaceFace s={SPACES[DRAGGED]} />
        </div>
        {morph > 0 ? <ResultCard o={discovery} morph={morph} /> : null}
      </div>

      {/* Book */}
      <div
        style={{
          position: 'absolute',
          left: 22,
          top: 602,
          width: 348,
          height: 66,
          borderRadius: 33,
          background: tap > 0.2 ? COLORS.black : COLORS.yellow,
          color: tap > 0.2 ? COLORS.yellow : COLORS.ink,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 21,
          fontWeight: 850,
          letterSpacing: '0.02em',
          opacity: discovery,
          transform: `translateY(${(1 - discovery) * 16}px) scale(${1 - tap * 0.04})`,
        }}
      >
        Book this space
      </div>

      <Touch frame={frame} dragX={dragX} dragY={dragY} />

      {/* Home indicator */}
      <div style={{position: 'absolute', left: SW / 2 - 70, bottom: 10, width: 140, height: 5, borderRadius: 3, background: '#111'}} />
    </div>
  );
};

const SpaceFace: React.FC<{s: (typeof SPACES)[number]}> = ({s}) => (
  <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10}}>
    <s.Icon size={34} />
    <div style={{fontSize: 14, fontWeight: 850, letterSpacing: '0.05em', textAlign: 'center', lineHeight: 1.15}}>
      {s.label[0]}
      <br />
      {s.label[1]}
    </div>
  </div>
);

const SpaceCard: React.FC<{s: (typeof SPACES)[number]; x: number; y: number; p: number}> = ({s, x, y, p}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: CARD_W,
      height: TRAY.h,
      borderRadius: 20,
      background: COLORS.white,
      border: '2px solid #E3E6E8',
      boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
      opacity: p,
      transform: `translateY(${(1 - p) * 18}px)`,
    }}
  >
    <SpaceFace s={s} />
  </div>
);

// Discovery result: a real frame of the calm workspace from S07, then name + suitability + filter tag.
const ResultCard: React.FC<{o: number; morph: number}> = ({o, morph}) => {
  const clip = CLIPS.s07;
  const ok = hasStatic(clip.file);
  return (
    <div style={{position: 'absolute', inset: 0, background: COLORS.white, opacity: Math.min(1, morph * 1.6)}}>
      <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: 198, overflow: 'hidden', background: COLORS.cyanWash}}>
        {ok ? (
          <Freeze frame={clip.in + 40}>
            <OffthreadVideo src={staticFile(clip.file)} muted style={{width: 352, height: 198, objectFit: 'cover'}} />
          </Freeze>
        ) : null}
      </div>
      <div style={{position: 'absolute', left: 18, top: 214, opacity: o, transform: `translateY(${(1 - o) * 8}px)`}}>
        <div style={{fontSize: 23, fontWeight: 850}}>Quiet desk</div>
        <div style={{fontSize: 15, fontWeight: 500, color: COLORS.inkSoft, marginTop: 6}}>Suited to focused work</div>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '6px 12px', borderRadius: 999, background: COLORS.cyan, fontSize: 13, fontWeight: 800, letterSpacing: '0.06em'}}>
          <IconFocus size={15} stroke={2.4} /> FOCUS
        </div>
      </div>
    </div>
  );
};

// Fingertip indicator: lands on QUIET DESK, presses, drags with the card, releases with a cyan ripple at the snap;
// returns for the Book tap.
const Touch: React.FC<{frame: number; dragX: number; dragY: number}> = ({frame, dragX, dragY}) => {
  const appear = progress(frame, MATCH.touchIn, 5) * (1 - progress(frame, MATCH.snapAt + 2, 6));
  const ripple = progress(frame, MATCH.snapAt, 12);
  const tapIn = progress(frame, MATCH.bookTap - 6, 5) * (1 - progress(frame, MATCH.bookTap + 4, 6));
  const tapRipple = progress(frame, MATCH.bookTap, 12);
  const press = interpolate(frame, [MATCH.touchIn + 2, MATCH.touchIn + 4], [1, 0.82], clamp);
  // Fingertip sits on the lower-right of the card so the label stays readable during the drag.
  const cx = dragX + CARD_W - 22;
  const cy = dragY + TRAY.h - 16;
  const dot = (x: number, y: number, o: number, s: number) => (
    <div
      style={{
        position: 'absolute',
        left: x - 27,
        top: y - 27,
        width: 54,
        height: 54,
        borderRadius: 27,
        background: 'rgba(255,255,255,0.55)',
        border: '3px solid rgba(17,17,17,0.55)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
        opacity: o,
        transform: `scale(${s})`,
      }}
    />
  );
  const ring = (x: number, y: number, t: number) =>
    t > 0 && t < 1 ? (
      <div
        style={{
          position: 'absolute',
          left: x - 30 - t * 50,
          top: y - 30 - t * 50,
          width: 60 + t * 100,
          height: 60 + t * 100,
          borderRadius: '50%',
          border: `3px solid ${COLORS.cyan}`,
          opacity: 1 - t,
        }}
      />
    ) : null;
  return (
    <>
      {appear > 0 ? dot(cx, cy, appear, press) : null}
      {ring(COL[0] + CARD_W / 2, SLOT.y + SLOT.h / 2, ripple)}
      {tapIn > 0 ? dot(262, 635, tapIn, 1 - 0.15 * progress(frame, MATCH.bookTap - 1, 2)) : null}
      {ring(262, 635, tapRipple)}
    </>
  );
};

const StatusIcons: React.FC = () => (
  <div style={{position: 'absolute', right: 30, top: 22, display: 'flex', gap: 6, alignItems: 'flex-end'}}>
    {[6, 9, 12, 15].map((h) => (
      <div key={h} style={{width: 3.5, height: h, borderRadius: 1, background: '#111'}} />
    ))}
    <div style={{marginLeft: 6, width: 26, height: 13, borderRadius: 4, border: '1.6px solid #111', padding: 1.5}}>
      <div style={{width: '78%', height: '100%', borderRadius: 2, background: '#111'}} />
    </div>
  </div>
);
