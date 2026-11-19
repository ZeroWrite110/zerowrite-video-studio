import { useGsapTimeline } from "@remotion/gsap";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Pill, ZW } from "../components/ui";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Seconds (scene time) matched to the voice line.
export const WEIGH_AT = {
  columns: 0.4, // "One sign alone can be normal."
  runKey: 2.6, // "An installer writes a startup key too."
  score: 4.45, // "Zero Write scores the behaviours together,"
  verdict: 7.6, // "and reaches a verdict."
};
const F = (s: number) => Math.round(s * 30);

type Row = { text: string; weight: number; tone: string; runKey?: boolean };
// Samples and weights from the zerowrite.ai behavioural-engine animation.
const INSTALLER: Row[] = [
  { text: "writes to Program Files", weight: 4, tone: ZW.jade },
  { text: "creates a Start menu shortcut", weight: 2, tone: ZW.jade },
  { text: "writes a Run key", weight: 9, tone: ZW.amber, runKey: true },
  { text: "downloads from its own CDN", weight: 3, tone: ZW.jade },
];
const INVOICE: Row[] = [
  { text: "enumerates 1,204 documents", weight: 14, tone: ZW.amber },
  { text: "deletes volume shadow copies", weight: 32, tone: ZW.red },
  { text: "renames files to *.locked", weight: 28, tone: ZW.red },
  { text: "writes a Run key", weight: 12, tone: ZW.amber, runKey: true },
  { text: "contacts an unknown address", weight: 8, tone: ZW.amber },
];

const Column: React.FC<{
  side: "a" | "b";
  name: string;
  meta: string;
  rows: Row[];
  verdict: string;
  verdictColor: string;
}> = ({ side, name, meta, rows, verdict, verdictColor }) => {
  const frame = useCurrentFrame();
  const total = rows.reduce((n, r) => n + r.weight, 0);
  const scoreP = interpolate(frame, [F(WEIGH_AT.score), F(WEIGH_AT.score) + 50], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const score = Math.round(total * scoreP);
  const runKeyGlow = interpolate(frame, [F(WEIGH_AT.runKey), F(WEIGH_AT.runKey) + 8, F(WEIGH_AT.score), F(WEIGH_AT.score) + 10], [0, 1, 1, 0], clamp);
  const decided = frame >= F(WEIGH_AT.verdict);
  const stamp = interpolate(frame, [F(WEIGH_AT.verdict), F(WEIGH_AT.verdict) + 6], [1.9, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  return (
    <div
      data-col={side}
      style={{
        width: 760,
        height: 600,
        borderRadius: 26,
        border: `2px solid ${decided ? `${verdictColor}aa` : ZW.line}`,
        backgroundColor: "rgba(14,21,24,0.93)",
        boxShadow: `0 40px 90px rgba(0,0,0,0.55)${decided ? `, 0 0 70px ${verdictColor}33` : ""}`,
        padding: 30,
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <div style={{ fontFamily: ZW.mono, fontSize: 32, color: ZW.text }}>{name}</div>
      <div style={{ fontFamily: ZW.mono, fontSize: 20, color: ZW.muted, marginTop: 6 }}>{meta}</div>
      <div style={{ marginTop: 14 }}>
        {rows.map((r, i) => {
          const fill = interpolate(frame, [F(WEIGH_AT.score) + i * 6, F(WEIGH_AT.score) + i * 6 + 16], [0, 1], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          });
          const glow = r.runKey ? runKeyGlow : 0;
          return (
            <div
              key={r.text}
              data-row={`${side}${i}`}
              style={{
                marginTop: 6,
                padding: "7px 14px",
                borderRadius: 12,
                backgroundColor: glow > 0 ? `rgba(224,145,18,${0.18 * glow})` : "transparent",
                border: `2px solid rgba(224,145,18,${0.9 * glow})`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: ZW.sans, fontWeight: 600, fontSize: 24, color: ZW.text }}>
                <span>{r.text}</span>
                <span style={{ fontFamily: ZW.mono, color: r.tone }}>+{r.weight}</span>
              </div>
              <div style={{ marginTop: 8, height: 8, borderRadius: 4, backgroundColor: ZW.line }}>
                <div
                  style={{
                    width: `${(r.weight / 32) * 100 * fill}%`,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: r.tone,
                    boxShadow: `0 0 12px ${r.tone}`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 30, bottom: 26, display: "flex", alignItems: "baseline", gap: 14 }}>
        <span style={{ fontFamily: ZW.mono, fontSize: 20, letterSpacing: 2, color: ZW.muted }}>SCORE</span>
        <span style={{ fontFamily: ZW.sans, fontWeight: 800, fontSize: 64, color: score > 50 ? ZW.red : ZW.text }}>{score}</span>
      </div>
      {decided ? (
        <div
          style={{
            position: "absolute",
            right: 26,
            bottom: 34,
            transform: `rotate(-4deg) scale(${stamp})`,
            fontFamily: ZW.mono,
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: 2,
            color: verdictColor,
            border: `4px solid ${verdictColor}`,
            borderRadius: 10,
            padding: "6px 16px",
            backgroundColor: "#0b1113",
            textTransform: "uppercase",
          }}
        >
          {verdict}
        </div>
      ) : null}
    </div>
  );
};

export const Weigh: React.FC = () => {
  const frame = useCurrentFrame();
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-head]"), { y: 40, opacity: 0, duration: 0.5, ease: "power3.out" }, 0.1)
      .from(selector('[data-col="a"]'), { x: -200, rotateY: 30, opacity: 0, duration: 0.7, ease: "power3.out" }, WEIGH_AT.columns)
      .from(selector('[data-col="b"]'), { x: 200, rotateY: -30, opacity: 0, duration: 0.7, ease: "power3.out" }, WEIGH_AT.columns + 0.15)
      .from(selector("[data-together]"), { scale: 0.7, opacity: 0, duration: 0.45, ease: "back.out(2)" }, WEIGH_AT.score)
      .to(selector("[data-cam]"), { scale: 1.04, duration: 9, ease: "none" }, 0);
  });
  return (
    <AbsoluteFill ref={scope} style={{ perspective: 1800 }}>
      <AbsoluteFill data-cam>
        <div
          data-head
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 110,
            textAlign: "center",
            fontFamily: ZW.sans,
            fontWeight: 800,
            fontSize: 62,
            letterSpacing: -1.5,
            color: ZW.text,
          }}
        >
          One sign is not a verdict. <span style={{ color: ZW.cyan }}>All of them together are.</span>
        </div>
        <div style={{ position: "absolute", left: 160, top: 262 }}>
          <Column side="a" name="setup_x64.exe" meta="48 MB · from the vendor's site" rows={INSTALLER} verdict="clean · allowed" verdictColor={ZW.jade} />
        </div>
        <div style={{ position: "absolute", left: 1000, top: 262 }}>
          <Column side="b" name="invoice_0423.exe" meta="unsigned · 2.1 MB · first seen now" rows={INVOICE} verdict="malicious · quarantined" verdictColor={ZW.red} />
        </div>
        <div data-together style={{ position: "absolute", left: 0, right: 0, top: 196, display: "flex", justifyContent: "center", opacity: frame < F(WEIGH_AT.score) ? 0 : 1 }}>
          <Pill text="Scored together · before it runs" color={ZW.cyan} size={22} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
