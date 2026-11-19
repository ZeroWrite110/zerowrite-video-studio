import { useGsapTimeline } from "@remotion/gsap";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Fleet3D, Verdict, VERDICT_COLOR } from "../components/Fleet3D";
import { Panel, Pill, ZW } from "../components/ui";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Seconds (scene time) matched to the voice line.
export const FLEET_AT = {
  local: 4.85, // "analysed locally"
  score: 6.8, // "risk score from low to critical"
  verdicts: [9.36, 10.03, 10.83, 11.5], // allowed, quarantined, deleted, isolated
};

const VERDICTS: { v: Verdict; label: string; laptop: number }[] = [
  { v: "allow", label: "Allowed", laptop: -1 },
  { v: "quarantine", label: "Quarantined", laptop: 6 },
  { v: "delete", label: "Deleted", laptop: 2 },
  { v: "isolate", label: "Isolated", laptop: 13 },
];

// What each laptop screen shows at a given frame (illustrative only).
const verdictAt = (i: number, frame: number): Verdict => {
  const s = frame / 30;
  for (let k = VERDICTS.length - 1; k >= 1; k--) {
    if (VERDICTS[k].laptop === i && s >= FLEET_AT.verdicts[k]) return VERDICTS[k].v;
  }
  if (s >= FLEET_AT.verdicts[0] + (i % 5) * 0.05) return "allow";
  const scanStart = FLEET_AT.local + (i % 5) * 0.12 + Math.floor(i / 5) * 0.2;
  if (s >= scanStart && s < FLEET_AT.verdicts[0]) {
    return Math.floor((s - scanStart) * 4) % 2 === 0 ? "scan" : "idle";
  }
  return "idle";
};

const LEVELS = [
  { t: "Low", c: ZW.jade },
  { t: "Medium", c: ZW.cyan },
  { t: "High", c: ZW.amber },
  { t: "Critical", c: ZW.red },
];

const RiskMeter: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(
    frame,
    [FLEET_AT.score * 30 + 10, FLEET_AT.score * 30 + 60, FLEET_AT.score * 30 + 80],
    [0, 1, 0.92],
    clamp,
  );
  return (
    <Panel style={{ width: 520, padding: 28 }}>
      <div style={{ fontFamily: ZW.mono, fontSize: 22, letterSpacing: 2, color: ZW.muted }}>
        RISK SCORE
      </div>
      <div
        style={{
          position: "relative",
          marginTop: 22,
          height: 18,
          borderRadius: 9,
          background: `linear-gradient(90deg, ${ZW.jade}, ${ZW.cyan}, ${ZW.amber}, ${ZW.red})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${p * 100}%`,
            top: -12,
            width: 8,
            height: 42,
            marginLeft: -4,
            borderRadius: 4,
            backgroundColor: ZW.text,
            boxShadow: `0 0 16px ${ZW.text}`,
          }}
        />
      </div>
      <div
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: ZW.sans,
          fontWeight: 600,
          fontSize: 24,
        }}
      >
        {LEVELS.map((l) => (
          <span key={l.t} style={{ color: l.c }}>
            {l.t}
          </span>
        ))}
      </div>
    </Panel>
  );
};

export const Fleet: React.FC = () => {
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-head] span"), {
        y: 60,
        opacity: 0,
        filter: "blur(10px)",
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.05,
      }, 0.15)
      .from(selector("[data-local]"), { x: -120, opacity: 0, duration: 0.55, ease: "power3.out" }, FLEET_AT.local)
      .from(selector("[data-meter]"), { x: 120, opacity: 0, duration: 0.55, ease: "power3.out" }, FLEET_AT.score);
    FLEET_AT.verdicts.forEach((t, i) => {
      timeline.from(selector(`[data-verdict="${i}"]`), {
        y: 50,
        scale: 0.5,
        opacity: 0,
        duration: 0.4,
        ease: "back.out(2.2)",
      }, t);
    });
  });
  return (
    <AbsoluteFill ref={scope}>
      <AbsoluteFill style={{ top: 60 }}>
        <Fleet3D verdictAt={verdictAt} />
      </AbsoluteFill>
      <div
        data-head
        style={{
          position: "absolute",
          top: 120,
          width: "100%",
          textAlign: "center",
          fontFamily: ZW.sans,
          fontWeight: 800,
          fontSize: 66,
          letterSpacing: -1.5,
          color: ZW.text,
        }}
      >
        {"Every Windows 10 & 11 machine you manage.".split(" ").map((w, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: 18,
              color: w === "10" || w === "11" || w === "&" ? ZW.cyan : ZW.text,
            }}
          >
            {w}
          </span>
        ))}
      </div>
      <div data-local style={{ position: "absolute", left: 80, top: 270 }}>
        <Panel style={{ padding: "22px 28px", display: "flex", alignItems: "center", gap: 18 }}>
          <svg width={54} height={54} viewBox="0 0 24 24" fill="none" stroke={ZW.cyan} strokeWidth={1.6}>
            <rect x={6} y={6} width={12} height={12} rx={2} />
            <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
          </svg>
          <div>
            <div style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 36, color: ZW.text }}>
              Analysed locally
            </div>
            <div style={{ fontFamily: ZW.mono, fontSize: 22, color: ZW.muted }}>on the machine itself</div>
          </div>
        </Panel>
      </div>
      <div data-meter style={{ position: "absolute", right: 80, top: 270 }}>
        <RiskMeter />
      </div>
      <div
        style={{
          position: "absolute",
          top: 880,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: 28,
        }}
      >
        {VERDICTS.map((v, i) => (
          <div key={v.v} data-verdict={i}>
            <Pill
              text={v.label}
              color={VERDICT_COLOR[v.v]}
              size={32}
              style={{ padding: "10px 24px", backgroundColor: "rgba(5,9,11,0.9)" }}
            />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
