import {Composition, Folder} from 'remotion';
import {Showcase, showcaseDurationInFrames, showcaseSchema} from './compositions/Showcase/Showcase';
import {Starter, STARTER_SECONDS, starterSchema} from './compositions/Starter/Starter';
import {sec, VIDEO} from './config/video';
// @new-composition-imports (scripts/new-composition.mjs inserts imports above this line)

// Every renderable video is registered here. Format comes from src/config/video.ts;
// override per composition with e.g. width={FORMATS.vertical.width} height={FORMATS.vertical.height}.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Examples">
        <Composition
          id="Showcase"
          component={Showcase}
          schema={showcaseSchema}
          width={VIDEO.width}
          height={VIDEO.height}
          fps={VIDEO.fps}
          durationInFrames={showcaseDurationInFrames(VIDEO.fps)}
          defaultProps={{
            eyebrow: 'Remotion · motion graphics',
            title: 'Motion graphics, written in code.',
            subtitle: 'Typography, shapes, transitions and sound — all React, all frame-accurate.',
            features: [
              {title: 'Compose', caption: 'Scenes are React components on a frame-accurate timeline.'},
              {title: 'Animate', caption: 'Springs, easing and interpolation driven by the current frame.'},
              {title: 'Render', caption: 'Export the same code to MP4 from the CLI or the Studio.'},
            ],
            accent: '#8C6CFF',
            secondary: '#4FE3D3',
            sound: true,
          }}
        />
      </Folder>
      <Folder name="Templates">
        <Composition
          id="Starter"
          component={Starter}
          schema={starterSchema}
          width={VIDEO.width}
          height={VIDEO.height}
          fps={VIDEO.fps}
          durationInFrames={sec(STARTER_SECONDS, VIDEO.fps)}
          defaultProps={{title: 'Your title here', subtitle: 'A minimal starting point for a new composition.'}}
        />
      </Folder>
      {/* @new-composition-registrations (scripts/new-composition.mjs inserts compositions above this line) */}
    </>
  );
};
