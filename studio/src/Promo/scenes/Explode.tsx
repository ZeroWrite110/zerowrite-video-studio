import { useGsapTimeline } from "@remotion/gsap";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { FileBurst3D } from "../components/FileBurst3D";
import { Panel, Pill, ZW } from "../components/ui";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Seconds (scene time) matched to the voice line.
export const EXPLODE_AT = {
  burst: 2.05, // "Intent is scored on behaviour"
  behaviours: [3.6, 4.3, 5.0, 5.65, 6.35], // "Each behaviour is weighed, one by one..."
  verdict: 8.25, // "...reaches a verdict"
};

// The sample from the zerowrite.ai engine illustration (illustrative only).
const BEHAVIOURS = [
  { text: "enumerates 1,204 documents", weight: 14, tone: "amber" },
  { text: "deletes volume shadow copies", weight: 32, tone: "red" },
  { text: "renames files to *.locked", weight: 28, tone: "red" },
  { text: "writes a Run key", weight: 12, tone: "amber" },
  { text: "contacts 185.220.101.4", weight: 8, tone: "amber" },
] as const;

const CENTER = { x: 960, y: 470 };
const SLOTS = [
  { x: 80, y: 190 },
  { x: 1270, y: 190 },
  { x: 50, y: 450 },
  { x: 1300, y: 450 },
  { x: 160, y: 710 },
];
const CHIP_W = 570;

const toneColor = (t: string) => (t === "red" ? ZW.red : t === "amber" ? ZW.amber : ZW.jade);

// ThreeCanvas and HtmlInCanvasMotionBlur cannot share a scene (the 3D canvas
// never finishes creating), so the chips get a manual motion blur: each chip is
// drawn at several sub-frame times along its path, fainter the further back.
const SUBFRAMES = [0, 0.25, 0.5, 0.75, 1, 1.25];

const chipProgress = (t: number, i: number) => {
  const at = EXPLODE_AT.behaviours[i] * 30;
  return interpolate(t, [at, at + 11], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 0.9, 0.25, 1.05),
  });
};

const Chips: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {BEHAVIOURS.map((b, i) => {
        const s = SLOTS[i];
        const c = toneColor(b.tone);
        return SUBFRAMES.map((k) => {
          const p = chipProgress(frame - k, i);
          if (p <= 0) return null;
          const moving = chipProgress(frame, i) < 1;
          if (k > 0 && !moving) return null;
          const x = interpolate(p, [0, 1], [CENTER.x - CHIP_W / 2, s.x]);
          const y = interpolate(p, [0, 1], [CENTER.y - 40, s.y]);
          return (
            <div
              key={`${b.text}-${k}`}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: CHIP_W,
                opacity: k === 0 ? 1 : 0.32 / (1 + k * 1.6),
                transform: `scale(${0.5 + p * 0.5})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                padding: "18px 22px",
                borderRadius: 18,
                backgroundColor: "rgba(14,21,24,0.95)",
                border: `2px solid ${c}`,
                boxShadow: k === 0 ? `0 0 40px ${c}33, 0 20px 50px rgba(0,0,0,0.5)` : "none",
              }}
            >
              <span style={{ fontFamily: ZW.mono, fontSize: 25, color: ZW.text }}>{b.text}</span>
              <span style={{ fontFamily: ZW.mono, fontWeight: 600, fontSize: 28, color: c }}>+{b.weight}</span>
            </div>
          );
        });
      })}
    </AbsoluteFill>
  );
};

// Thin links from the core to each chip once it has landed.
const Links: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {BEHAVIOURS.map((b, i) => {
        const at = EXPLODE_AT.behaviours[i] * 30 + 8;
        const d = interpolate(frame, [at, at + 10], [0, 1], clamp);
        if (d <= 0) return null;
        const s = SLOTS[i];
        const tx = s.x < CENTER.x ? s.x + CHIP_W : s.x;
        const ty = s.y + 36;
        return (
          <line
            key={b.text}
            x1={CENTER.x}
            y1={CENTER.y}
            x2={CENTER.x + (tx - CENTER.x) * d}
            y2={CENTER.y + (ty - CENTER.y) * d}
            stroke={toneColor(b.tone)}
            strokeOpacity={0.55}
            strokeWidth={3}
            strokeDasharray="8 10"
            strokeDashoffset={-frame * 2}
          />
        );
      })}
    </svg>
  );
};

export const Explode: React.FC = () => {
  const frame = useCurrentFrame();
  const lit = EXPLODE_AT.behaviours.filter((s) => frame >= s * 30 + 6).length;
  const target = BEHAVIOURS.slice(0, lit).reduce((n, b) => n + b.weight, 0);
  // Count up smoothly towards the latest target.
  const prev = BEHAVIOURS.slice(0, Math.max(0, lit - 1)).reduce((n, b) => n + b.weight, 0);
  const lastAt = lit > 0 ? EXPLODE_AT.behaviours[lit - 1] * 30 + 6 : 0;
  const score = Math.round(interpolate(frame, [lastAt, lastAt + 10], [prev, target], clamp));
  const gauge = score >= 70 ? ZW.red : score >= 40 ? ZW.amber : ZW.jade;
  const level = score >= 70 ? "Critical" : score >= 40 ? "High" : score > 0 ? "Low" : "—";
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-head]"), { y: -40, opacity: 0, duration: 0.5, ease: "power3.out" }, 0.1)
      .to(selector("[data-head]"), { y: -30, opacity: 0, duration: 0.35, ease: "power2.in" }, EXPLODE_AT.burst - 0.3)
      .from(selector("[data-head2]"), { y: 40, opacity: 0, duration: 0.5, ease: "power3.out" }, EXPLODE_AT.burst + 0.1)
      .from(selector("[data-score]"), { x: 120, opacity: 0, duration: 0.5, ease: "power3.out" }, EXPLODE_AT.behaviours[0] - 0.4)
      .from(selector("[data-local]"), { y: 30, opacity: 0, duration: 0.45, ease: "power3.out" }, 6.0)
      .fromTo(
        selector("[data-stamp]"),
        { scale: 2.6, rotate: -14, opacity: 0 },
        { scale: 1, rotate: -6, opacity: 1, duration: 0.3, ease: "power4.in" },
        EXPLODE_AT.verdict,
      )
      .to(selector("[data-cam]"), { scale: 1.06, duration: 9, ease: "none" }, 0);
  });
  return (
    <AbsoluteFill ref={scope}>
      <AbsoluteFill data-cam>
        <Links />
        <FileBurst3D burstFrame={EXPLODE_AT.burst * 30} coreColor={lit === 0 ? ZW.cyan : gauge} />
        <Chips />
      </AbsoluteFill>
      <div data-head style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center" }}>
        <span style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 60, color: ZW.text }}>
          Nothing depends on <span style={{ color: ZW.cyan }}>signatures</span>.
        </span>
      </div>
      <div data-head2 style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center" }}>
        <span style={{ fontFamily: ZW.mono, fontSize: 26, letterSpacing: 4, color: ZW.cyan }}>
          INTENT · SCORED ON BEHAVIOUR
        </span>
      </div>
      <div data-score style={{ position: "absolute", left: 1300, top: 700 }}>
        <Panel style={{ width: 500, padding: 24 }} glow={gauge}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: ZW.mono, fontSize: 22, color: ZW.muted }}>RISK SCORE</span>
            <span style={{ fontFamily: ZW.mono, fontSize: 22, color: gauge }}>{level}</span>
          </div>
          <div style={{ fontFamily: ZW.mono, fontWeight: 600, fontSize: 84, color: ZW.text, lineHeight: 1.1 }}>{score}</div>
          <div style={{ height: 12, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ width: `${score}%`, height: "100%", backgroundColor: gauge, boxShadow: `0 0 16px ${gauge}` }} />
          </div>
        </Panel>
      </div>
      <div data-local style={{ position: "absolute", left: 760, top: 820 }}>
        <Pill text="analysed on this machine" color={ZW.cyan} />
      </div>
      <div
        data-stamp
        style={{
          position: "absolute",
          left: CENTER.x - 260,
          top: CENTER.y - 70,
          width: 520,
          textAlign: "center",
          padding: "18px 0",
          borderRadius: 18,
          border: `6px solid ${ZW.amber}`,
          backgroundColor: "rgba(5,9,11,0.88)",
          fontFamily: ZW.mono,
          fontWeight: 700,
          fontSize: 54,
          letterSpacing: 4,
          color: ZW.amber,
          boxShadow: `0 0 60px ${ZW.amber}55`,
        }}
      >
        QUARANTINED
      </div>
    </AbsoluteFill>
  );
};
