import { useGsapTimeline } from "@remotion/gsap";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Isolate3D } from "../components/Isolate3D";
import { Logo, Panel, Pill, ZW } from "../components/ui";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Seconds (scene time) matched to the voice line (voice starts at ~0.27 s).
export const ISOLATE_AT = {
  threat: 1.6, // "holds a threat"
  click: 2.2, // "isolate it"
  cut: 3.9, // "cut off"
  keep: 5.3, // "except Zero Write"
  managed: 7.0,
  release: 7.85, // "released"
};
const F = (s: number) => Math.round(s * 30);

// Plain cursor (no canvas motion blur here: this scene has a ThreeCanvas).
const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  const move = interpolate(frame, [F(0.9), F(ISOLATE_AT.click) - 2], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.6, 0, 0.2, 1),
  });
  const x = interpolate(move, [0, 1], [1200, 1530]);
  const y = interpolate(move, [0, 1], [960, 742]);
  const out = interpolate(frame, [F(ISOLATE_AT.click) + 12, F(ISOLATE_AT.click) + 22], [1, 0], clamp);
  return (
    <svg
      width={44}
      height={56}
      viewBox="0 0 22 28"
      style={{ position: "absolute", left: x, top: y, opacity: out, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.6))" }}
    >
      <path d="M2 2 L2 22 L7.5 17 L11 25 L14.5 23.5 L11 15.8 L18.5 15.8 Z" fill="#fff" stroke="#05090B" strokeWidth={1.4} />
    </svg>
  );
};

export const Isolate: React.FC = () => {
  const frame = useCurrentFrame();
  const clickF = F(ISOLATE_AT.click);
  const state =
    frame >= F(ISOLATE_AT.release)
      ? { text: "Released · clean", color: ZW.jade }
      : frame >= clickF
        ? { text: "Isolated", color: ZW.amber }
        : frame >= F(ISOLATE_AT.threat)
          ? { text: "Threat held", color: ZW.amber }
          : { text: "Online", color: ZW.cyan };
  const pressed = frame >= clickF && frame < clickF + 6;
  const btnOn = frame >= clickF && frame < F(ISOLATE_AT.release);
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-title]"), { x: -80, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.1)
      .from(selector("[data-status]"), { x: 120, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.4)
      .from(selector("[data-keep]"), { y: 30, opacity: 0, duration: 0.45, ease: "power3.out" }, ISOLATE_AT.keep)
      .from(selector("[data-managed]"), { y: 30, opacity: 0, duration: 0.45, ease: "power3.out" }, ISOLATE_AT.managed);
  });
  return (
    <AbsoluteFill ref={scope}>
      <Isolate3D
        at={{
          threat: F(ISOLATE_AT.threat),
          isolate: F(ISOLATE_AT.cut) - 10,
          keep: F(ISOLATE_AT.keep),
          release: F(ISOLATE_AT.release),
        }}
      />
      <div
        data-title
        style={{
          position: "absolute",
          left: 110,
          top: 160,
          fontFamily: ZW.sans,
          fontWeight: 700,
          fontSize: 66,
          lineHeight: 1.08,
          letterSpacing: -1,
          color: ZW.text,
        }}
      >
        Isolate in
        <br />
        <span style={{ color: ZW.amber }}>one step.</span>
      </div>
      <div data-keep style={{ position: "absolute", left: 110, top: 360, display: "flex", alignItems: "center", gap: 14 }}>
        <Logo size={44} />
        <span style={{ fontFamily: ZW.mono, fontSize: 26, color: ZW.cyanBright }}>only ZeroWrite.ai stays connected</span>
      </div>
      <div data-managed style={{ position: "absolute", left: 110, top: 420, fontFamily: ZW.mono, fontSize: 24, color: ZW.muted }}>
        still managed · released once clean
      </div>
      <div data-status style={{ position: "absolute", right: 110, top: 520 }}>
        <Panel style={{ width: 420, padding: 26 }} glow={state.color}>
          <div style={{ fontFamily: ZW.mono, fontSize: 20, color: ZW.muted }}>MACHINE · FINANCE-PC-07</div>
          <div style={{ marginTop: 14 }}>
            <Pill text={state.text} color={state.color} size={24} />
          </div>
          <div
            style={{
              marginTop: 24,
              height: 70,
              borderRadius: 14,
              display: "grid",
              placeItems: "center",
              fontFamily: ZW.sans,
              fontWeight: 700,
              fontSize: 28,
              color: btnOn ? ZW.ink : ZW.amber,
              backgroundColor: btnOn ? ZW.amber : `${ZW.amber}1c`,
              border: `2px solid ${ZW.amber}`,
              boxShadow: btnOn ? `0 0 30px ${ZW.amber}88` : "none",
              transform: `scale(${pressed ? 0.95 : 1})`,
            }}
          >
            {btnOn ? "Isolated" : "Isolate machine"}
          </div>
        </Panel>
      </div>
      <Cursor />
    </AbsoluteFill>
  );
};
