import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import type {TiloConfig} from './config';
import {AudioBed} from './components/AudioBed';
import {DestinationMarker} from './components/DestinationMarker';
import {DestinationToast} from './components/DestinationToast';
import {FlightContext} from './components/FlightCamera';
import {GameCompass} from './components/GameCompass';
import {GameplayEnvironment} from './components/GameplayEnvironment';
import {HoldSpeedCue, OpeningHeadline} from './components/OpeningOverlays';
import {RearViewTiloAircraft} from './components/RearViewTiloAircraft';
import {RewardBottomSheet} from './components/RewardBottomSheet';
import {computeFlight} from './lib/flight';
import {FONT_UI, loadTiloFonts} from './lib/fonts';
import {ConfigContext} from './lib/timeline';

loadTiloFonts();

// Tilo — The Reward Flight. One continuous flight on one global timeline; the six storyboard
// beats are timings in config.shots, not separate scenes. Layer order, back to front.

const ReviewBurnIn: React.FC<{speed: number}> = ({speed}) => {
  const frame = useCurrentFrame();
  const t = frame * speed;
  return (
    <div
      style={{
        position: 'absolute',
        left: 24,
        bottom: 24,
        padding: '8px 14px',
        borderRadius: 10,
        background: 'rgba(200,20,40,0.85)',
        color: '#fff',
        fontFamily: FONT_UI,
        fontWeight: 700,
        fontSize: 24,
        letterSpacing: '0.04em',
      }}
    >
      {speed}× REVIEW · NOT FOR DELIVERY · master f{Math.round(t)} · {(t / 30).toFixed(2)}s
    </div>
  );
};

export const TiloRewardFlight: React.FC<TiloConfig> = (props) => {
  // Studio may hand over a new props object each frame; key the heavy work on content.
  const key = JSON.stringify(props);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const config = useMemo(() => props, [key]);
  const flight = useMemo(() => computeFlight(config), [config]);

  return (
    <ConfigContext.Provider value={config}>
      <FlightContext.Provider value={flight}>
        <AbsoluteFill style={{backgroundColor: config.colors.haze, overflow: 'hidden'}}>
          <GameplayEnvironment />
          <DestinationMarker />
          <RearViewTiloAircraft />
          <DestinationToast />
          <GameCompass />
          <OpeningHeadline />
          <HoldSpeedCue />
          <RewardBottomSheet />
          <AudioBed />
          {config.review.burnIn && <ReviewBurnIn speed={config.review.playbackSpeed} />}
        </AbsoluteFill>
      </FlightContext.Provider>
    </ConfigContext.Provider>
  );
};
