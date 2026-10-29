import React from 'react';

// Neither bundled font has U+2192, so "→" in any copy string is drawn as a matched inline arrow
// rather than falling back to a system font. The copy itself stays editable as plain text.

const Arrow: React.FC = () => (
  <svg
    viewBox="0 0 20 14"
    style={{width: '0.9em', height: '0.63em', verticalAlign: '0.05em', overflow: 'visible'}}
  >
    <path d="M1 7 H17 M11.5 1.5 L17.5 7 L11.5 12.5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CopyText: React.FC<{text: string}> = ({text}) => {
  const parts = text.split('→');
  return (
    <>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Arrow />}
          {p.replace(/ $/, ' ').replace(/^ /, ' ')}
        </React.Fragment>
      ))}
    </>
  );
};
