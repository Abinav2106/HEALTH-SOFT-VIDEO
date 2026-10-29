import React from 'react';
import {Img, staticFile} from 'remotion';
import {ASSETS} from '../constants';

// The corporate lockup exactly as supplied: Tilo artwork + wordmark (navy on light, white on
// navy). Static — never animated beyond a fade. Its mascot is part of the logo.
export const LOGO = {top: 92};

export const Logo: React.FC<{reversed?: number; opacity?: number}> = ({reversed = 0, opacity = 1}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: LOGO.top, height: 118, opacity}}>
    <Img src={staticFile(ASSETS.tilo)} style={{position: 'absolute', left: 280, top: 0, width: 222, height: 118}} />
    <Img src={staticFile(ASSETS.wordmark)} style={{position: 'absolute', left: 508, top: 8, width: 286, height: 105, opacity: 1 - reversed}} />
    {reversed > 0 && (
      <Img src={staticFile(ASSETS.wordmarkWhite)} style={{position: 'absolute', left: 508, top: 10, width: 268, height: 102, opacity: reversed}} />
    )}
  </div>
);
