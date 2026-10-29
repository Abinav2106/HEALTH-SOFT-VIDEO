import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {FlightContext} from '../components/FlightCamera';
import {GameCompass} from '../components/GameCompass';
import {GameplayEnvironment} from '../components/GameplayEnvironment';
import {RearViewTiloAircraft} from '../components/RearViewTiloAircraft';
import {computeFlight} from '../lib/flight';
import {FONT_BODY, loadTiloFonts} from '../lib/fonts';
import {ConfigContext} from '../lib/timeline';
import type {HoldConfig} from './config';
import {EdgeStreaks} from './EdgeStreaks';
import {HeroTicket} from './HeroTicket';
import {HoldAudio} from './HoldAudio';
import {MarkerUnfold} from './MarkerUnfold';
import {OpeningInstruction} from './OpeningInstruction';
import {TicketRewardSheet} from './TicketRewardSheet';

loadTiloFonts();

// Tilo — Hold to Fly. One continuous rear-view flight (authored at path.worldRate × the original
// speed) into a marker → ticket reward reveal. Layer order, back to front.

const ReviewBurnIn: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 24,
      bottom: 24,
      padding: '8px 14px',
      borderRadius: 10,
      background: 'rgba(200,20,40,0.85)',
      color: '#fff',
      fontFamily: FONT_BODY,
      fontWeight: 700,
      fontSize: 24,
      letterSpacing: '0.04em',
    }}
  >
    DOUBLE-SPEED PLAYBACK REVIEW · NOT FOR DELIVERY
  </div>
);

export const HoldToFly: React.FC<HoldConfig> = (props) => {
  const key = JSON.stringify(props);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const config = useMemo(() => props, [key]);
  const flight = useMemo(() => computeFlight(config), [config]);

  return (
    <ConfigContext.Provider value={config}>
      <FlightContext.Provider value={flight}>
        <AbsoluteFill style={{backgroundColor: config.colors.haze, overflow: 'hidden'}}>
          <GameplayEnvironment />
          <EdgeStreaks />
          <MarkerUnfold />
          <RearViewTiloAircraft />
          <GameCompass />
          <OpeningInstruction />
          <TicketRewardSheet />
          <HeroTicket />
          <HoldAudio />
          {config.review.burnIn && <ReviewBurnIn />}
        </AbsoluteFill>
      </FlightContext.Provider>
    </ConfigContext.Provider>
  );
};
