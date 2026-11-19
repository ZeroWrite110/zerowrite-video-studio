import { useGsapTimeline } from "@remotion/gsap";
import { HtmlInCanvasMotionBlur } from "@remotion/motion-blur";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SignHeader } from "../components/SignHeader";
import { Panel, Pill, ZW } from "../components/ui";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Seconds (scene time) matched to the voice line.
export const BULK_AT = {
  sweep: 1.0, // "It goes after your documents in bulk."
  sweepEnd: 4.0,
  card: 1.0, // card enters with the sweep, so the counter is seen climbing
  lock: 5.2, // "the first step towards encrypting them."
};
const F = (s: number) => Math.round(s * 30);

const COLS = 11;
const ROWS = 5;
const TILE_W = 74;
const TILE_H = 92;
const GAP = 14;
const GRID_X = 150;
const GRID_Y = 330;
const GRID_W = COLS * TILE_W + (COLS - 1) * GAP;
const EXT = ["docx", "xlsx", "pdf", "jpg", "pptx"];

// Scan beam: a bright vertical bar that sweeps across the documents.
const Beam: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [F(BULK_AT.sweep), F(BULK_AT.sweepEnd)], [GRID_X - 40, GRID_X + GRID_W + 20], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const on = frame >= F(BULK_AT.sweep) && frame <= F(BULK_AT.sweepEnd) + 4;
  return on ? (
    <div
      style={{
        position: "absolute",
        left: x,
        top: GRID_Y - 30,
        width: 18,
        height: ROWS * TILE_H + (ROWS - 1) * GAP + 60,
        borderRadius: 9,
        background: `linear-gradient(${ZW.amber}00, ${ZW.amber}, ${ZW.amber}00)`,
        boxShadow: `0 0 50px ${ZW.amber}, 0 0 120px ${ZW.amber}88`,
      }}
    />
  ) : null;
};

export const Bulk: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const sweepX = interpolate(frame, [F(BULK_AT.sweep), F(BULK_AT.sweepEnd)], [GRID_X - 40, GRID_X + GRID_W + 20], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const count = Math.round(
    interpolate(frame, [F(BULK_AT.sweep), F(BULK_AT.sweepEnd)], [0, 1204], {
      ...clamp,
      easing: Easing.inOut(Easing.quad),
    }),
  );
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-tile]"), {
        y: 60,
        opacity: 0,
        rotateX: -60,
        duration: 0.45,
        ease: "power3.out",
        stagger: { each: 0.008, from: "start" },
      }, 0.2)
      .from(selector("[data-card]"), { x: 160, opacity: 0, rotateY: -25, duration: 0.6, ease: "power3.out" }, BULK_AT.card)
      .from(selector("[data-would]"), { y: 30, opacity: 0, duration: 0.4, ease: "back.out(2)" }, BULK_AT.lock)
      .to(selector("[data-cam]"), { scale: 1.05, duration: 7, ease: "none" }, 0);
  });
  const tiles = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      const x = GRID_X + c * (TILE_W + GAP);
      const y = GRID_Y + r * (TILE_H + GAP);
      const read = sweepX > x + TILE_W / 2;
      // After the line about encryption, the tiles flip to .locked in a diagonal wave.
      const lockAt = F(BULK_AT.lock) + (c + r) * 1.4;
      const flip = interpolate(frame, [lockAt, lockAt + 7], [0, 1], clamp);
      const locked = flip > 0.5;
      const color = locked ? ZW.red : read ? ZW.amber : ZW.cyanDeep;
      tiles.push(
        <div
          key={i}
          data-tile
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: TILE_W,
            height: TILE_H,
            borderRadius: 10,
            border: `2px solid ${color}`,
            backgroundColor: `${color}${locked ? "2e" : read ? "24" : "12"}`,
            display: "grid",
            placeItems: "center",
            fontFamily: ZW.mono,
            fontSize: 15,
            color,
            transform: `rotateY(${Math.sin(flip * Math.PI) * 80}deg)`,
          }}
        >
          {locked ? "locked" : EXT[(i * 7) % EXT.length]}
        </div>,
      );
    }
  }
  return (
    <AbsoluteFill ref={scope} style={{ perspective: 1600 }}>
      <AbsoluteFill data-cam>
        <SignHeader n={1} title={<>It goes after your documents <span style={{ color: ZW.amber }}>in bulk.</span></>} color={ZW.amber} />
        <AbsoluteFill style={{ perspective: 1200 }}>{tiles}</AbsoluteFill>
        <AbsoluteFill>
          <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={220}>
            <AbsoluteFill>
              <Beam />
            </AbsoluteFill>
          </HtmlInCanvasMotionBlur>
        </AbsoluteFill>
        <div data-card style={{ position: "absolute", left: 1220, top: 330 }}>
          <Panel style={{ width: 560, padding: 30 }} glow={ZW.amber}>
            <div style={{ fontFamily: ZW.mono, fontSize: 22, letterSpacing: 2, color: ZW.muted }}>WHAT IT WOULD DO</div>
            <div style={{ fontFamily: ZW.mono, fontSize: 30, color: ZW.text, marginTop: 14 }}>invoice_0423.exe</div>
            <div style={{ marginTop: 26, fontFamily: ZW.sans, fontWeight: 800, fontSize: 96, color: ZW.amber, lineHeight: 1 }}>
              {count.toLocaleString("en-US")}
            </div>
            <div style={{ fontFamily: ZW.sans, fontWeight: 600, fontSize: 32, color: ZW.text, marginTop: 6 }}>
              documents read at once
            </div>
            <div data-would style={{ marginTop: 26 }}>
              <Pill text="Next step: encrypt them" color={ZW.red} size={20} />
            </div>
          </Panel>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
