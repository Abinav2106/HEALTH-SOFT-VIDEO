import React, {useEffect, useState} from 'react';
import {Img, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {LOCKUP_ORIGIN, LOCKUP_SCALE, LOGO, T} from '../constants';
import {EASE_IN_OUT, EASE_OUT, progress} from '../../video06/lib/motion';
import {Camera, speedLinesAt, tiloAt, toScreen} from '../lib/scene';

// Every layer is the supplied artwork on its full 2000x667 canvas; one box places them all in register.
type Box = {left: number; top: number; width: number; height: number};
const boxFor = (x: number, y: number, k: number): Box => ({left: x, top: y, width: LOGO.width * k, height: LOGO.height * k});
const layer = (b: Box, extra?: React.CSSProperties): React.CSSProperties => ({position: 'absolute', ...b, ...extra});

// CSS masks are not tracked by Remotion's asset loader, so hold the frame until the mask is decoded.
const usePreloaded = (src: string) => {
  const [handle] = useState(() => delayRender(`Loading ${src}`));
  useEffect(() => {
    const img = new Image();
    img.onload = () => continueRender(handle);
    img.onerror = () => continueRender(handle);
    img.src = src;
  }, [handle, src]);
};

// Propeller: blade glints sweep the disc (masked to the disc's own pixels), then settle to rest.
const PropellerGlint: React.FC<{b: Box; strength: number}> = ({b, strength}) => {
  const frame = useCurrentFrame();
  const mask = staticFile(LOGO.propellerMask);
  usePreloaded(mask);
  if (strength <= 0) return null;
  const [px0, py0, px1, py1] = LOGO.propellerBox;
  const sweep = ((frame % 7) / 7) * 140 - 20; // % down the disc
  const band = (p: number) => `rgba(255,255,255,0) ${p - 14}%, rgba(255,255,255,0.8) ${p}%, rgba(255,255,255,0) ${p + 14}%`;
  return (
    <div
      style={layer(b, {
        maskImage: `url(${mask})`,
        WebkitMaskImage: `url(${mask})`,
        maskSize: '100% 100%',
        WebkitMaskSize: '100% 100%',
        opacity: strength,
      })}
    >
      <div
        style={{
          position: 'absolute',
          left: `${((px0 - 6) / LOGO.width) * 100}%`,
          top: `${((py0 - 6) / LOGO.height) * 100}%`,
          width: `${((px1 - px0 + 12) / LOGO.width) * 100}%`,
          height: `${((py1 - py0 + 12) / LOGO.height) * 100}%`,
          // Two glints half a turn apart over a faint white blur.
          backgroundImage: `linear-gradient(180deg, ${band(sweep)}, rgba(255,255,255,0) ${sweep + 30}%, ${band(sweep + 70)})`,
          backgroundColor: 'rgba(255,255,255,0.22)',
        }}
      />
    </div>
  );
};

// Tilo in flight and on the lock-up: rigid source layers — position, uniform scale, propeller only.
export const Tilo: React.FC<{camera: Camera}> = ({camera}) => {
  const frame = useCurrentFrame();
  if (frame < T.tiloIn.from) return null;
  const {o, k} = tiloAt(frame);
  const s = toScreen(camera, o);
  const b = boxFor(s.x, s.y, k * camera.s);
  const sl = speedLinesAt(frame);
  const glint = 1 - progress(frame, T.propellerSettle.from, T.propellerSettle.to - T.propellerSettle.from, EASE_IN_OUT);
  return (
    <>
      {sl.opacity > 0 ? (
        <Img src={staticFile(LOGO.speedLines)} style={layer({...b, left: b.left + sl.dx * k * camera.s}, {opacity: sl.opacity})} />
      ) : null}
      <Img src={staticFile(LOGO.symbol)} style={layer(b)} />
      <PropellerGlint b={b} strength={glint} />
    </>
  );
};

// Wordmark and tagline resolve beside Tilo with a soft left-to-right wipe and a short rise.
export const Wordmark: React.FC = () => {
  const frame = useCurrentFrame();
  const b = boxFor(LOCKUP_ORIGIN.x, LOCKUP_ORIGIN.y, LOCKUP_SCALE);
  const part = (src: string, w: {from: number; to: number}, box: readonly number[]) => {
    const t = progress(frame, w.from, w.to - w.from, EASE_OUT);
    if (t <= 0) return null;
    // Wipe edge in canvas %, travelling across this part's own box, with a soft 6% feather.
    const a = (box[0] / LOGO.width) * 100;
    const z = (box[2] / LOGO.width) * 100;
    const edge = a + (z - a + 8) * t;
    const mask = `linear-gradient(90deg, #000 ${edge - 6}%, transparent ${edge}%)`;
    return (
      <Img
        src={staticFile(src)}
        style={layer(
          {...b, top: b.top + 10 * (1 - t)},
          {opacity: Math.min(1, t * 1.4), maskImage: mask, WebkitMaskImage: mask},
        )}
      />
    );
  };
  return (
    <>
      {part(LOGO.wordmark, T.wordmark, LOGO.wordmarkBox)}
      {part(LOGO.tagline, T.tagline, LOGO.taglineBox)}
    </>
  );
};

// From the lock frame on: the supplied logo file itself, untouched, perfectly still.
export const OriginalLogo: React.FC = () => (
  <Img src={staticFile(LOGO.original)} style={layer(boxFor(LOCKUP_ORIGIN.x, LOCKUP_ORIGIN.y, LOCKUP_SCALE))} />
);
