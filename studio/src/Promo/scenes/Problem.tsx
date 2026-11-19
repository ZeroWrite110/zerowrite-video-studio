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

const CHIPS = [
  { kind: "Download", file: "invoice_0423.exe", at: 10 },
  { kind: "Script", file: "update.ps1", at: 37 },
  { kind: "Injected process", file: "explorer.exe", at: 63 },
];

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Fast fly-ins; rendered inside HtmlInCanvasMotionBlur so the motion smears.
const FlyingChips: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {CHIPS.map((c, i) => {
        const p = interpolate(frame, [c.at, c.at + 12], [0, 1], {
          ...clamp,
          easing: Easing.bezier(0.2, 0.9, 0.1, 1),
        });
        const running = interpolate(frame, [100, 160], [0, 1], clamp);
        const x = 150 + i * 560;
        return (
          <div
            key={c.file}
            style={{
              position: "absolute",
              left: x + (1 - p) * -1500,
              top: 400,
              width: 500,
              opacity: p > 0 ? 1 : 0,
              transform: `rotate(${(1 - p) * -6}deg)`,
            }}
          >
            <Panel glow={running > 0 ? ZW.red : undefined}>
              <Pill text={c.kind} color={ZW.amber} />
              <div
                style={{
                  marginTop: 22,
                  fontFamily: ZW.mono,
                  fontWeight: 600,
                  fontSize: 38,
                  color: ZW.text,
                }}
              >
                {c.file}
              </div>
              <div
                style={{
                  marginTop: 26,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${running * 100}%`,
                    height: "100%",
                    backgroundColor: ZW.red,
                    boxShadow: `0 0 18px ${ZW.red}`,
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontFamily: ZW.mono,
                  fontSize: 22,
                  color: running > 0 ? ZW.red : ZW.faint,
                }}
              >
                {running > 0 ? "RUNNING" : "ARRIVED"}
              </div>
            </Panel>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const DOCS = ["report.docx", "q3-budget.xlsx", "photos", "contracts.pdf", "backup.zip", "payroll.csv"];

// The user's files lock one after another once the code is running.
const Encrypting: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top: 720,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        gap: 22,
      }}
    >
      {DOCS.map((d, i) => {
        const hit = frame >= 112 + i * 9;
        return (
          <div
            key={d}
            style={{
              fontFamily: ZW.mono,
              fontSize: 22,
              padding: "12px 18px",
              borderRadius: 12,
              border: `2px solid ${hit ? ZW.red : ZW.line}`,
              backgroundColor: hit ? `${ZW.red}22` : "rgba(255,255,255,0.03)",
              color: hit ? ZW.red : ZW.muted,
              opacity: interpolate(frame, [96, 108], [0, 1], clamp),
            }}
          >

            {hit ? `${d}.locked` : d}
          </div>
        );
      })}
    </div>
  );
};

export const Problem: React.FC = () => {
  const { width, height } = useVideoConfig();
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-head] span"), {
        y: 60,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.06,
      }, 3.2)
      .to(selector("[data-flash]"), { opacity: 0.22, duration: 0.08 }, 3.35)
      .to(selector("[data-flash]"), { opacity: 0, duration: 0.5 }, 3.43)
      .to(selector("[data-cam]"), { scale: 1.06, duration: 6, ease: "none" }, 0);
  });
  return (
    <AbsoluteFill ref={scope}>
      <AbsoluteFill data-cam>
        <div
          data-head
          style={{
            position: "absolute",
            top: 170,
            width: "100%",
            textAlign: "center",
            fontFamily: ZW.sans,
            fontWeight: 800,
            fontSize: 84,
            letterSpacing: -2,
            color: ZW.text,
          }}
        >
          {"Whatever it was written to do.".split(" ").map((w, i) => (
            <span key={i} style={{ display: "inline-block", marginRight: 22 }}>
              {w === "do." ? <span style={{ color: ZW.red }}>{w}</span> : w}
            </span>
          ))}
        </div>
        <Encrypting />
        <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={200}>
          <FlyingChips />
        </HtmlInCanvasMotionBlur>
      </AbsoluteFill>
      <AbsoluteFill data-flash style={{ backgroundColor: ZW.red, opacity: 0 }} />
    </AbsoluteFill>
  );
};
