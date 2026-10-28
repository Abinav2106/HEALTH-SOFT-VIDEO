// Footage slots and their placement. Edit this file when the real assets
// arrive; nothing else in the composition needs to change.
GF.CONFIG = {
  // Real GoFloaters game screen recording (Tilo Tour). The renderer extracts
  // it to frames; it is shown cover-fit (never stretched) from 14.0 s to 35.3 s.
  // Each segment maps film time -> recording time. rate 0 = freeze frame
  // (the beat of silence when Tilo touches the Spark).
  gameplay: {
    file: "gameplay.mp4",
    segments: [
      { film: [14.0, 30.0], src: 0.0, rate: 1 },
      { film: [30.0, 30.2], src: 16.0, rate: 0 },
      { film: [30.2, 40.0], src: 16.0, rate: 1 },
    ],
  },
  // Green route overlay laid over the game, in 0..1 screen coordinates.
  // Trace it over the real in-game route once the recording is in.
  gameRoute: [
    [0.16, 0.9], [0.26, 0.78], [0.4, 0.73], [0.52, 0.64], [0.5, 0.53],
    [0.58, 0.44], [0.72, 0.39], [0.82, 0.3],
  ],
  // after the hand-off the in-game route carries on; set true if the
  // recording has no visible route of its own
  keepRouteOverlay: false,
  // Draw Tilo over the game during the fog + Spark chase (23-32 s). Set false
  // if the recording already shows Tilo flying the route at that moment.
  overlayTilo: true,
  // where the Spark waits on the route (0..1 along it)
  sparkAt: 0.86,
  // the workspace card as it sits in the recording at ~20.2 s (0..1 coords);
  // the photo opens out of this rectangle and closes back into it
  workspaceCard: { x: 0.06, y: 0.6, w: 0.88, h: 0.24 },
  workspace: { file: "workspace_01.jpg" },
};
