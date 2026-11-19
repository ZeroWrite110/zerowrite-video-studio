import { useGsapTimeline } from "@remotion/gsap";
import { HtmlInCanvasMotionBlur } from "@remotion/motion-blur";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Panel, Pill, ZW } from "../components/ui";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Seconds (scene time) matched to the voice line.
export const ONSITE_AT = {
  clock: 0.4, // "Zero Write has no signature to wait for."
  file: 2.6, // "A file no one has seen before"
  behaviours: [4.4, 4.7, 5.0, 5.3, 5.6], // "is judged on what it would do"
  verdict: 6.5, // "on the machine, when it arrives."
  reputation: 7.4, // "Reputation lookups only add detail."
};
const F = (s: number) => Math.round(s * 30);

// From the zerowrite.ai behavioural-engine sample (illustrative file).
const BEHAVIOURS = [
  { text: "enumerates 1,204 documents", weight: 14 },
  { text: "deletes volume shadow copies", weight: 32 },
  { text: "renames files to *.locked", weight: 28 },
  { text: "writes a Run key", weight: 12 },
  { text: "contacts an unknown address", weight: 8 },
];

// Crossed-out clock (as on the website tile "No signature to wait for").
const Clock: React.FC = () => {
  const frame = useCurrentFrame();
  const hand = (frame / 30) * 220;
  const cross = interpolate(frame, [F(ONSITE_AT.clock) + 10, F(ONSITE_AT.clock) + 22], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <svg width={220} height={220} viewBox="0 0 220 220">
      <circle cx={110} cy={110} r={84} fill="none" stroke={ZW.amber} strokeWidth={8} />
      <line
        x1={110}
        y1={110}
        x2={110 + Math.sin((hand * Math.PI) / 180) * 58}
        y2={110 - Math.cos((hand * Math.PI) / 180) * 58}
        stroke={ZW.amber}
        strokeWidth={8}
        strokeLinecap="round"
      />
      <circle cx={110} cy={110} r={8} fill={ZW.amber} />
      <line
        x1={40}
        y1={180}
        x2={40 + 140 * cross}
        y2={180 - 140 * cross}
        stroke={ZW.cyan}
        strokeWidth={12}
        strokeLinecap="round"
      />
    </svg>
  );
};

// The verdict stamp slams in (motion-blurred).
const Stamp: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [F(ONSITE_AT.verdict) - 8, F(ONSITE_AT.verdict)], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const y = interpolate(p, [0, 1], [-320, 0]);
  return (
    <div
      style={{
        position: "absolute",
        left: 1010,
        top: 776 + y,
        transform: "rotate(-6deg)",
        fontFamily: ZW.mono,
        fontWeight: 600,
        fontSize: 32,
        letterSpacing: 2,
        color: ZW.red,
        border: `4px solid ${ZW.red}`,
        borderRadius: 10,
        padding: "6px 16px",
        backgroundColor: "#16070a",
        opacity: p > 0 ? 1 : 0,
        whiteSpace: "nowrap",
      }}
    >
      MALICIOUS · QUARANTINED
    </div>
  );
};

export const Onsite: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const shown = ONSITE_AT.behaviours.filter((s) => frame >= F(s)).length;
  const target = BEHAVIOURS.slice(0, shown).reduce((sum, b) => sum + b.weight, 0);
  const score = Math.round(
    interpolate(frame, [F(ONSITE_AT.behaviours[0]), F(ONSITE_AT.behaviours[4]) + 12], [0, 94], {
      ...clamp,
      easing: Easing.out(Easing.quad),
    }),
  );
  const shownScore = Math.min(score, target);
  const verdict = frame >= F(ONSITE_AT.verdict);
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-left]"), { x: -160, opacity: 0, duration: 0.7, ease: "power3.out" }, ONSITE_AT.clock - 0.2)
      .from(selector("[data-machine]"), { y: 80, opacity: 0, rotateX: 18, duration: 0.7, ease: "power3.out" }, ONSITE_AT.file - 0.3)
      .from(selector("[data-unseen]"), { scale: 0.6, opacity: 0, duration: 0.4, ease: "back.out(2)" }, ONSITE_AT.file + 0.3)
      .from(selector("[data-onm]"), { y: 20, opacity: 0, duration: 0.4, ease: "power3.out" }, ONSITE_AT.verdict + 0.3)
      .from(selector("[data-rep]"), { x: 160, opacity: 0, duration: 0.6, ease: "power3.out" }, ONSITE_AT.reputation - 0.2)
      .to(selector("[data-cam]"), { scale: 1.04, duration: 10, ease: "none" }, 0);
    ONSITE_AT.behaviours.forEach((s, i) => {
      timeline.from(selector(`[data-b="${i}"]`), { x: 60, opacity: 0, duration: 0.3, ease: "power3.out" }, s);
    });
  });
  return (
    <AbsoluteFill ref={scope} style={{ perspective: 1600 }}>
      <AbsoluteFill data-cam>
        <div data-left style={{ position: "absolute", left: 110, top: 240, width: 420 }}>
          <Clock />
          <div style={{ marginTop: 24, fontFamily: ZW.sans, fontWeight: 800, fontSize: 56, lineHeight: 1.08, letterSpacing: -1, color: ZW.text }}>
            No signature <span style={{ color: ZW.cyan }}>to wait for.</span>
          </div>
        </div>
        <div data-machine style={{ position: "absolute", left: 590, top: 200 }}>
          <Panel style={{ width: 760, height: 690, padding: 30, position: "relative" }} glow={verdict ? ZW.red : ZW.cyan}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: ZW.mono, fontSize: 22, color: ZW.muted, letterSpacing: 1.5 }}>THIS MACHINE · ZEROWRITE</span>
              <span data-onm>
                <Pill text="On the machine · on arrival" color={ZW.cyan} size={16} />
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 24 }}>
              <div style={{ fontFamily: ZW.mono, fontSize: 34, color: ZW.text }}>brand_new.exe</div>
              <span data-unseen>
                <Pill text="Never seen before" color={ZW.amber} size={18} />
              </span>
            </div>
            <div style={{ marginTop: 26, fontFamily: ZW.mono, fontSize: 22, color: ZW.muted, letterSpacing: 1.5 }}>WHAT IT WOULD DO</div>
            {BEHAVIOURS.map((b, i) => (
              <div
                key={b.text}
                data-b={i}
                style={{
                  marginTop: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: ZW.sans,
                  fontWeight: 600,
                  fontSize: 30,
                  color: ZW.text,
                }}
              >
                <span>{b.text}</span>
                <span style={{ fontFamily: ZW.mono, color: b.weight >= 28 ? ZW.red : ZW.amber }}>+{b.weight}</span>
              </div>
            ))}
            <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ flex: 1, height: 18, borderRadius: 9, backgroundColor: ZW.line, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${shownScore}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${ZW.jade}, ${ZW.amber}, ${ZW.red})`,
                  }}
                />
              </div>
              <span style={{ fontFamily: ZW.sans, fontWeight: 800, fontSize: 54, color: shownScore > 70 ? ZW.red : ZW.amber, width: 90, textAlign: "right" }}>
                {shownScore}
              </span>
            </div>
          </Panel>
        </div>
        <div data-rep style={{ position: "absolute", left: 1400, top: 300 }}>
          <Panel style={{ width: 440, padding: 28, opacity: 0.85 }}>
            <div style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 28, color: ZW.text }}>Reputation lookups</div>
            {[
              ["Hash", "unknown"],
              ["Intel", "extra detail"],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  marginTop: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: ZW.mono,
                  fontSize: 24,
                  color: ZW.faint,
                }}
              >
                <span>{k}</span>
                <span>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 22 }}>
              <Pill text="Only adds detail" color={ZW.muted} size={18} />
            </div>
          </Panel>
        </div>
        <AbsoluteFill>
          <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={220}>
            <AbsoluteFill>
              <Stamp />
            </AbsoluteFill>
          </HtmlInCanvasMotionBlur>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
