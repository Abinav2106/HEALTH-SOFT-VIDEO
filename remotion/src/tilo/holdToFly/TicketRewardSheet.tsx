import React from 'react';
import {HEIGHT, WIDTH} from '../config';
import {CopyText} from '../components/CopyText';
import {FONT_BODY, FONT_HEAD} from '../lib/fonts';
import {sheetTopAt} from '../lib/sheet';
import {useT} from '../lib/timeline';
import {easeOut, prog, useHold} from './useHold';

// Rounded white GoFloaters reward sheet. Rises from below in shot 05 (empty slot only — no amount,
// headline or CTA yet) and completes in shot 06 with a controlled ease-out. The hero ticket lands
// in the slot (HeroTicket); this component draws everything around it.

// Vertical layout, px from the sheet's top edge.
export const SHEET = {
  handle: 18,
  label: 52,
  headline: 90,
  slot: 196,
  supporting: 548,
  cta: 610,
  ctaH: 116,
  closing: 758,
  terms: 804,
};

export const TicketRewardSheet: React.FC = () => {
  const c = useHold();
  const t = useT();
  const h = c.hold;
  if (t < c.timing.sheetRiseStart) return null;
  const top = sheetTopAt(c, t);
  const colLeft = c.ui.contentLeft;
  const colW = c.ui.contentRight - c.ui.contentLeft;
  const centered: React.CSSProperties = {position: 'absolute', left: colLeft, width: colW, textAlign: 'center'};
  const head = prog(t, [h.copyBlockIn, h.copyBlockIn + 8], easeOut);
  const sup = prog(t, [h.supportingIn, h.supportingIn + 7], easeOut);
  const cta = prog(t, [h.ctaIn, h.ctaIn + 8], easeOut);
  const close = prog(t, [h.closingIn, h.closingIn + 8], easeOut);
  const slotFade = 1 - prog(t, [h.ticketSettle[0] + 4, h.ticketSettle[1]]);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top,
        width: WIDTH,
        height: HEIGHT - c.ui.sheetFinalTop + 80,
        background: c.colors.white,
        borderRadius: '44px 44px 0 0',
        boxShadow: '0 -8px 36px rgba(5,5,6,0.14)',
      }}
    >
      <div style={{position: 'absolute', top: SHEET.handle, left: WIDTH / 2 - 48, width: 96, height: 10, borderRadius: 5, background: '#D5D9DE'}} />
      {/* Empty landing slot while the ticket is in flight. */}
      <div
        style={{
          position: 'absolute',
          top: SHEET.slot,
          left: colLeft + (colW - h.ticketWidth) / 2,
          width: h.ticketWidth,
          height: h.ticketHeight,
          borderRadius: 26,
          background: c.colors.paleYellow,
          opacity: 0.55 * slotFade,
          border: '3px dashed rgba(233,197,71,0.6)',
          boxSizing: 'border-box',
        }}
      />
      <div style={{...centered, top: SHEET.label + (1 - head) * 8, opacity: head, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 25, letterSpacing: '0.16em', color: c.colors.turquoiseText}}>
        {c.copy.sheetLabel}
      </div>
      <div
        style={{
          ...centered,
          top: SHEET.headline + (1 - head) * 10,
          opacity: head,
          fontFamily: FONT_HEAD,
          fontWeight: 800,
          fontSize: 78,
          lineHeight: 1,
          letterSpacing: '-0.01em',
          color: c.colors.ink,
          whiteSpace: 'nowrap',
        }}
      >
        {c.copy.sheetHeadline}
      </div>
      <div style={{...centered, top: SHEET.supporting, opacity: sup, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 36, color: c.colors.ink}}>
        {c.copy.supporting}
      </div>
      <div
        style={{
          position: 'absolute',
          left: colLeft + 30,
          width: colW - 60,
          top: SHEET.cta + (1 - cta) * h.ctaRisePx,
          height: SHEET.ctaH,
          borderRadius: SHEET.ctaH / 2,
          background: c.colors.turquoise,
          boxShadow: '0 10px 24px rgba(30,140,160,0.25)',
          opacity: cta,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT_HEAD,
          fontWeight: 800,
          fontSize: 54,
          letterSpacing: '0.01em',
          color: c.colors.ink,
          whiteSpace: 'nowrap',
        }}
      >
        <CopyText text={c.copy.cta} />
      </div>
      <div style={{...centered, top: SHEET.closing, opacity: close, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 32, color: 'rgba(5,5,6,0.78)'}}>
        {c.copy.closing}
      </div>
      <div style={{...centered, top: SHEET.terms, opacity: close, fontFamily: FONT_BODY, fontWeight: 500, fontSize: 22, color: 'rgba(5,5,6,0.5)'}}>
        {c.copy.terms}
      </div>
    </div>
  );
};
