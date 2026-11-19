import { useGsapTimeline } from "@remotion/gsap";
import { HtmlInCanvasMotionBlur } from "@remotion/motion-blur";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Pill, ZW } from "../components/ui";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Seconds (scene time) matched to the voice line.
export const WAITLINE_AT = {
  arrive: 0.5, // "Then there is the wait."
  written: 2.35, // "has to be written"
  shipped: 3.0, // "and shipped"
  stop: 4.3, // "before a list can stop that file."
  runs: 5.15, // "Until it arrives, the file can run."
};
const F = (s: number) => Math.round(s * 30);

const X0 = 230;
const X1 = 1690;
const Y = 600;
const STOPS = [
  { label: "File arrives", at: WAITLINE_AT.arrive },
  { label: "Sample collected", at: WAITLINE_AT.written - 0.6 },
  { label: "Signature written", at: WAITLINE_AT.written },
  { label: "Signature shipped", at: WAITLINE_AT.shipped },
  { label: "List can stop it", at: WAITLINE_AT.stop },
];
const stopX = (i: number) => X0 + ((X1 - X0) * i) / (STOPS.length - 1);

// The new signature travels along the track, from "written" to the end (motion-blurred).
const Packet: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [F(WAITLINE_AT.written), F(WAITLINE_AT.stop)], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const show = interpolate(frame, [F(WAITLINE_AT.written) - 4, F(WAITLINE_AT.written) + 2], [0, 1], clamp);
  const x = interpolate(p, [0, 1], [stopX(2), stopX(4)]);
  return (
    <div
      style={{
        position: "absolute",
        left: x - 70,
        top: Y - 110,
        width: 140,
        height: 58,
        borderRadius: 12,
        border: `3px solid ${ZW.cyan}`,
        backgroundColor: "#071a1f",
        boxShadow: `0 0 36px ${ZW.cyan}88`,
        display: "grid",
        placeItems: "center",
        fontFamily: ZW.mono,
        fontWeight: 600,
        fontSize: 20,
        color: ZW.cyan,
        opacity: show,
      }}
    >
      new sig
    </div>
  );
};

export const Waitline: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const draw = interpolate(frame, [F(WAITLINE_AT.arrive), F(WAITLINE_AT.stop)], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  const gap = interpolate(frame, [F(WAITLINE_AT.runs) - 4, F(WAITLINE_AT.runs) + 14], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const runs = frame >= F(WAITLINE_AT.runs);
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline.from(selector("[data-title]"), { y: 40, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.1);
    STOPS.forEach((s, i) => {
      timeline.from(selector(`[data-stop="${i}"]`), { y: 40, opacity: 0, scale: 0.6, duration: 0.45, ease: "back.out(2)" }, s.at);
    });
    timeline
      .from(selector("[data-file]"), { x: -260, opacity: 0, duration: 0.6, ease: "power3.out" }, WAITLINE_AT.arrive - 0.2)
      .from(selector("[data-runs]"), { y: -30, opacity: 0, scale: 0.6, duration: 0.4, ease: "back.out(2.5)" }, WAITLINE_AT.runs)
      .to(selector("[data-cam]"), { scale: 1.04, duration: 8, ease: "none" }, 0);
  });
  return (
    <AbsoluteFill ref={scope} style={{ perspective: 1600 }}>
      <AbsoluteFill data-cam>
        <div
          data-title
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 130,
            textAlign: "center",
            fontFamily: ZW.sans,
            fontWeight: 800,
            fontSize: 64,
            letterSpacing: -1.5,
            color: ZW.text,
          }}
        >
          Then there is <span style={{ color: ZW.amber }}>the wait.</span>
        </div>
        {/* track */}
        <div style={{ position: "absolute", left: X0, top: Y - 2, width: X1 - X0, height: 4, backgroundColor: ZW.line }} />
        <div
          style={{
            position: "absolute",
            left: X0,
            top: Y - 3,
            width: (X1 - X0) * draw,
            height: 6,
            borderRadius: 3,
            background: `linear-gradient(90deg, ${ZW.red}, ${ZW.amber}, ${ZW.cyan})`,
            boxShadow: `0 0 18px ${ZW.amber}66`,
          }}
        />
        {STOPS.map((s, i) => (
          <div key={s.label} data-stop={i} style={{ position: "absolute", left: stopX(i) - 130, top: Y - 18, width: 260, textAlign: "center" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                margin: "0 auto",
                border: `4px solid ${i === 0 ? ZW.red : i === 4 ? ZW.cyan : ZW.amber}`,
                backgroundColor: ZW.ink,
              }}
            />
            <div style={{ marginTop: 18, fontFamily: ZW.sans, fontWeight: 600, fontSize: 28, color: ZW.text }}>{s.label}</div>
          </div>
        ))}
        {/* the file, already on the machine */}
        <div data-file style={{ position: "absolute", left: stopX(0) - 60, top: Y - 190, textAlign: "center", width: 120 }}>
          <div
            style={{
              width: 96,
              height: 116,
              margin: "0 auto",
              borderRadius: 14,
              border: `3px solid ${ZW.red}`,
              backgroundColor: `${ZW.red}1a`,
              display: "grid",
              placeItems: "center",
              fontFamily: ZW.mono,
              fontWeight: 600,
              fontSize: 24,
              color: ZW.red,
              boxShadow: runs ? `0 0 40px ${ZW.red}` : undefined,
            }}
          >
            EXE
          </div>
        </div>
        <div data-runs style={{ position: "absolute", left: stopX(0) + 70, top: Y - 175 }}>
          <Pill text="Can run" color={ZW.red} size={22} />
        </div>
        {/* the gap */}
        <div
          style={{
            position: "absolute",
            left: X0,
            top: Y + 120,
            width: (X1 - X0) * gap,
            height: 40,
            borderLeft: `4px solid ${ZW.red}`,
            borderRight: gap > 0.98 ? `4px solid ${ZW.red}` : undefined,
            borderBottom: `4px solid ${ZW.red}`,
            borderRadius: "0 0 12px 12px",
            opacity: gap > 0 ? 1 : 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: Y + 190,
            textAlign: "center",
            fontFamily: ZW.sans,
            fontWeight: 700,
            fontSize: 44,
            color: ZW.red,
            opacity: gap,
          }}
        >
          Until the signature arrives, the file can run.
        </div>
        <AbsoluteFill>
          <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={220}>
            <AbsoluteFill>
              <Packet />
            </AbsoluteFill>
          </HtmlInCanvasMotionBlur>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
