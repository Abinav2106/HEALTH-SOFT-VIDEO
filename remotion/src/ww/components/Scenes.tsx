import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, COPY, FONT, FPS, T} from '../constants';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, keys, lerp, prog} from '../lib/motion';
import {Hand, Logo, QMark} from './Brand';
import {Bookmark, PHONE, Phone} from './Phone';
import {Bar, Card, Copy, ExpandingPanel, Scene, alive, dropY} from './R3Kit';

// R3 service scenes. Each: object composition rises, label + headline build, restrained secondary
// motion, then a lead panel becomes the next scene. Black → orange → white → phone (R4).

type P = {copy?: boolean};
const visible = (t: number, from: number, to: number) => t >= from && t < to;

// ── A · Business consulting + Branding · black ───────────────────────────────
export const SceneA: React.FC<P> = ({copy = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (!visible(t, T.a.from, T.a.to)) return null;
  const at = T.a.from + 0.28;
  // R3 coins → palette swatches: dropped one at a time, each lands with one rebound.
  const DROPS = [16.55, 16.85, 17.15];
  const swatch = (i: number) => {
    const p = prog(frame, DROPS[i], 0.42, EASE_IN);
    return {y: dropY(frame, DROPS[i]), rot: (1 - p) * (i - 1) * 50, on: t >= DROPS[i]};
  };
  // the brand mark "stamps" as each swatch lands
  const stamp = DROPS.reduce((acc, d) => acc + Math.max(0, Math.sin(Math.min(1, Math.max(0, (t - d - 0.42) / 0.18)) * Math.PI)) * 0.035, 0);
  return (
    <Scene bg={C.black}>
      {copy ? <Copy frame={frame} at={T.a.from + 0.45} label={COPY.a.label} headline={COPY.a.headline} ink={C.white} pillBg={C.orange} pillInk={C.black} /> : null}
      <Card frame={frame} at={at} x={350} y={1200} w={460} h={610} rot={-9} bg={C.white} z={1}>
        <div style={{position: 'absolute', left: 40, top: 44}}>
          <Logo width={170} />
        </div>
        {/* the brief gets written, line by line */}
        {[0, 1, 2, 3, 4].map((i) => (
          <Bar key={i} left={40} top={200 + i * 44} w={(i === 4 ? 200 : 360 - (i % 2) * 60) * prog(frame, 15.85 + i * 0.16, 0.35, EASE_OUT)} color="rgba(0,0,0,0.12)" />
        ))}
      </Card>
      <Card frame={frame} at={at + 0.16} x={800} y={1630} w={390} h={226} rot={8} bg={C.white} z={2}>
        <div style={{position: 'absolute', left: 30, top: 40}}>
          <QMark height={140} color={C.black} />
        </div>
        <div style={{position: 'absolute', left: 140, top: 92, fontFamily: FONT, fontWeight: 500, fontSize: 28, color: C.black}}>
          {COPY.brandName}
        </div>
      </Card>
      <ExpandingPanel
        frame={frame}
        at={at + 0.08}
        x={600}
        y={1290}
        w={540}
        h={600}
        rot={3}
        frameColor={C.white}
        inset={24}
        innerBg="#F2F2F0"
        nextBg={C.orange}
        swapAt={19.25}
        expandAt={19.42}
      >
        {/* palette settles into the identity, one swatch at a time */}
        {[C.black, C.white, C.orange].map((col, i) => {
          const s = swatch(i);
          if (!s.on) return null;
          return (
            <div
              key={col}
              style={{
                position: 'absolute',
                left: 92 + i * 116,
                top: 360,
                width: 96,
                height: 96,
                borderRadius: '50%',
                background: col,
                boxShadow: col === C.white ? 'inset 0 0 0 3px rgba(0,0,0,0.14)' : undefined,
                transform: `translateY(${s.y}px) rotate(${s.rot}deg)`,
              }}
            />
          );
        })}
        {/* wordmark sits in front: swatches drop behind it */}
        <div style={{position: 'absolute', left: 56, top: 150, transform: `scale(${1 + stamp})`}}>
          <Logo width={380} />
        </div>
      </ExpandingPanel>
    </Scene>
  );
};

// ── B · Creative + Marketing + Advertising · orange ─────────────────────────
export const KeyVisual: React.FC<{q: number; logo: number; line?: number}> = ({q, logo, line}) => (
  <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: q * 0.16}}>
    <QMark height={q} color={C.black} />
    {line ? <div style={{fontFamily: FONT, fontWeight: 500, fontSize: line, color: C.black, letterSpacing: -0.3}}>{COPY.brandName}</div> : null}
    <Logo width={logo} />
  </div>
);

export const SceneB: React.FC<P> = ({copy = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (!visible(t, T.b.from, T.b.to)) return null;
  const at = T.b.from + 0.28;
  const draw = prog(frame, 21.15, 0.55, EASE_IN_OUT);
  const tagOn = t >= 21.75;
  const tagY = dropY(frame, 21.75, -200, 0.36);
  const bannerIn = prog(frame, 21.0, 0.6, EASE_OUT);
  const swing = Math.sin(2 * Math.PI * 0.6 * (t - 20)) * 6;
  return (
    <Scene bg={C.orange}>
      {copy ? <Copy frame={frame} at={T.b.from + 0.45} label={COPY.b.label} headline={COPY.b.headline} ink={C.black} pillBg={C.black} pillInk={C.white} /> : null}
      {/* one key visual, connected across formats */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, zIndex: 1}}>
        <path d="M 470 1060 L 700 1010" stroke={C.black} strokeWidth={4} fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
        <path d="M 760 1300 L 700 1520" stroke={C.black} strokeWidth={4} fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
        {draw > 0.98 ? (
          <>
            <circle cx={700} cy={1010} r={9} fill={C.black} />
            <circle cx={700} cy={1520} r={9} fill={C.black} />
          </>
        ) : null}
      </svg>
      <Card frame={frame} at={at + 0.1} x={790} y={1140} w={380} h={380} rot={7} bg={C.white} z={2}>
        <div style={{position: 'absolute', inset: 0, transform: `rotate(${swing}deg)`, transformOrigin: '50% 30%'}}>
          <KeyVisual q={150} logo={150} />
        </div>
      </Card>
      <Card frame={frame} at={at + 0.2} x={610} y={1660} w={660} h={230} rot={-3} bg={C.black} z={3}>
        <div style={{position: 'absolute', left: 50 - (1 - bannerIn) * 220, top: 46, transform: `rotate(${(1 - bannerIn) * -40}deg)`}}>
          <QMark height={138} color={C.orange} />
        </div>
        <div style={{position: 'absolute', right: 50, top: 84, opacity: bannerIn, transform: `translateX(${(1 - bannerIn) * 60}px)`}}>
          <Logo width={300} color={C.white} />
        </div>
      </Card>
      <div
        style={{
          position: 'absolute',
          left: 836,
          top: 1528,
          zIndex: 4,
          padding: '8px 18px',
          borderRadius: 12,
          background: C.white,
          color: C.black,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 30,
          opacity: tagOn ? 1 : 0,
          transform: `translateY(${tagY}px) rotate(${-3 + tagY * 0.08}deg)`,
        }}
      >
        Ad
      </div>
      <ExpandingPanel
        frame={frame}
        at={at}
        x={380}
        y={1230}
        w={390}
        h={690}
        rot={-5}
        r={52}
        frameColor={C.black}
        inset={14}
        innerBg={C.white}
        nextBg={C.white}
        swapAt={24.25}
        expandAt={24.42}
      >
        {/* story format: segment progress fills while it plays */}
        <div style={{position: 'absolute', left: 18, right: 18, top: 18, display: 'flex', gap: 8}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{flex: 1, height: 7, borderRadius: 4, background: 'rgba(0,0,0,0.12)', overflow: 'hidden'}}>
              <div style={{width: `${100 * prog(frame, 20.55 + i * 1.15, 1.15, (x) => x)}%`, height: '100%', background: C.black}} />
            </div>
          ))}
        </div>
        <KeyVisual q={250} logo={180} line={28} />
      </ExpandingPanel>
    </Scene>
  );
};

// ── C · Meta business setup · white → phone ──────────────────────────────────
const C_PHONE = {cx: 530, cy: 1300, s: 0.66};
const BUTTON_Y = 400; // button centre below phone centre, phone-local px

const SetupCard: React.FC<{label: string; bg: string; ink: string; check: number; outline?: boolean}> = ({label, bg, ink, check, outline}) => (
  <div style={{position: 'absolute', inset: 0, background: bg, borderRadius: 28, boxShadow: outline ? 'inset 0 0 0 3px #000' : undefined}}>
    <div style={{position: 'absolute', left: 34, top: 34, fontFamily: FONT, fontWeight: 500, fontSize: 46, letterSpacing: -0.8, color: ink}}>{label}</div>
    <Bar left={34} top={128} w={190} color={ink === C.white ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.18)'} />
    <Bar left={34} top={160} w={130} color={ink === C.white ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.18)'} />
    <div
      style={{
        position: 'absolute',
        right: 30,
        top: 34,
        width: 54,
        height: 54,
        borderRadius: '50%',
        boxShadow: `inset 0 0 0 3px ${ink}`,
        background: check > 0 ? (bg === C.orange ? C.black : C.orange) : 'transparent',
        transform: `scale(${check > 0 ? 0.85 + 0.15 * check : 1})`,
      }}
    >
      {check > 0 ? (
        <svg width="54" height="54" viewBox="0 0 54 54">
          <path d="M16 28 L24 36 L39 19" fill="none" stroke={bg === C.orange ? C.orange : C.black} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - check} />
        </svg>
      ) : null}
    </div>
  </div>
);

export const SceneC: React.FC<P> = ({copy = true}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (!visible(t, T.c.from, T.c.to)) return null;
  const at = T.c.from + 0.25;
  const exit = 29.55;
  const move = prog(frame, 29.75, 0.85, EASE_IN_OUT);
  const riseP = prog(frame, at, 0.55);
  const life = alive(frame, 7, 0.8, riseP * (1 - move));
  const cx = lerp(C_PHONE.cx, PHONE.cx, move) + life.x;
  const cy = lerp(C_PHONE.cy, PHONE.cy, move) + (1 - riseP) * 1200 + life.y;
  const s = lerp(C_PHONE.s, 1, move);
  const press = keys(frame, [26.18, 26.27, 26.42], [0, 1, 0], EASE_IN_OUT);
  const pressed = t >= 26.27;
  const clear = prog(frame, 29.7, 0.3, EASE_IN);
  const mark = prog(frame, 30.3, 0.35, EASE_OUT);
  const checks = [26.45, 26.65, 26.85].map((c) => prog(frame, c, 0.3, EASE_OUT));
  // Doubt's approved hand from bottom-right presses the phone's button.
  const handIn = prog(frame, 25.85, 0.35, EASE_OUT);
  const handOut = prog(frame, 26.45, 0.35, EASE_IN);
  const btn = {x: C_PHONE.cx, y: C_PHONE.cy + BUTTON_Y * C_PHONE.s};
  const tip = {x: lerp(1010, btn.x + 22, handIn) + handOut * 300, y: lerp(2180, btn.y + 20, handIn) + press * 10 + handOut * 900};
  return (
    <Scene bg={C.white}>
      {copy ? <Copy frame={frame} at={T.c.from + 0.45} label={COPY.c.label} headline={COPY.c.headline} ink={C.black} pillBg={C.orange} pillInk={C.black} exitAt={exit} /> : null}
      <Card frame={frame} at={at + 0.1} x={262} y={1030} w={360} h={220} rot={-8} bg={C.black} z={1} exitAt={exit}>
        <SetupCard label={COPY.c.items[0]} bg={C.black} ink={C.white} check={checks[0]} />
      </Card>
      <Card frame={frame} at={at + 0.18} x={888} y={1150} w={360} h={220} rot={7} bg={C.white} z={1} exitAt={exit + 0.06}>
        <SetupCard label={COPY.c.items[1]} bg={C.white} ink={C.black} check={checks[1]} outline />
      </Card>
      <Card frame={frame} at={at + 0.26} x={292} y={1640} w={360} h={220} rot={5} bg={C.orange} z={1} exitAt={exit + 0.12}>
        <SetupCard label={COPY.c.items[2]} bg={C.orange} ink={C.black} check={checks[2]} />
      </Card>
      <Phone cx={cx} cy={cy} scale={s} rot={(1 - riseP) * 6 + life.r} screenBg={C.white} style={{zIndex: 3}}>
        <div style={{position: 'absolute', inset: 0, opacity: 1 - clear}}>
          <div style={{position: 'absolute', left: 60, top: 130}}>
            <Logo width={250} />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{position: 'absolute', left: 60, top: 330 + i * 120, display: 'flex', gap: 24, alignItems: 'center'}}>
              <div style={{width: 64, height: 64, borderRadius: 18, background: checks[i] > 0.5 ? C.orange : 'rgba(0,0,0,0.1)'}} />
              <div style={{position: 'relative', width: 280 - i * 40, height: 26, borderRadius: 13, background: 'rgba(0,0,0,0.12)', overflow: 'hidden'}}>
                <div style={{width: `${100 * prog(frame, 26.3 + i * 0.2, 0.45, EASE_OUT)}%`, height: '100%', background: C.black}} />
              </div>
            </div>
          ))}
          {/* the button invites the press: pulse rings until it is tapped */}
          {!pressed
            ? [0, 1].map((k) => {
                const ph = ((t - 25.45) * 1.4 + k * 0.5) % 1;
                return t > 25.45 ? (
                  <div
                    key={k}
                    style={{
                      position: 'absolute',
                      left: 282 - 80,
                      top: 1000 - 80,
                      width: 160,
                      height: 160,
                      borderRadius: '50%',
                      border: `6px solid ${C.orange}`,
                      transform: `scale(${1 + ph * 0.55})`,
                      opacity: 1 - ph,
                    }}
                  />
                ) : null;
              })
            : null}
          <div
            style={{
              position: 'absolute',
              left: 282 - 80,
              top: 1000 - 80,
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: pressed ? C.orange : C.black,
              transform: `scale(${1 - press * 0.08})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="80" height="80" viewBox="0 0 54 54">
              <path d="M16 28 L24 36 L39 19" fill="none" stroke={pressed ? C.black : C.white} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        {mark > 0 ? (
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: mark}}>
            <Bookmark size={lerp(150, 200, mark)} color={C.black} />
          </div>
        ) : null}
      </Phone>
      {t >= 25.85 && t < 26.85 ? (
        <div style={{position: 'absolute', inset: 0, zIndex: 4}}>
          <Hand x={tip.x} y={tip.y} scale={1.1} rotate={150} />
        </div>
      ) : null}
    </Scene>
  );
};

