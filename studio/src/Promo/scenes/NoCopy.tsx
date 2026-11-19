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
export const NOCOPY_AT = {
  runs: 1.8, // "lets a file run"
  copy: 3.0, // "it never takes a copy of it."
  reasons: [3.7, 4.85, 5.75], // "Not for analysis." "Not for research." "Not for training models."
};
const F = (s: number) => Math.round(s * 30);
const REASONS = ["analysis", "research", "training models"];

// A ghost copy peels off the allowed file, flies toward the cloud and is cut off (motion-blurred).
const Ghost: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [F(NOCOPY_AT.copy) - 6, F(NOCOPY_AT.copy) + 12], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const cut = interpolate(frame, [F(NOCOPY_AT.copy) + 10, F(NOCOPY_AT.copy) + 20], [1, 0], clamp);
  if (p <= 0 || cut <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 560 + p * 560,
        top: 470 - p * 170,
        width: 200,
        height: 240,
        borderRadius: 20,
        border: `3px dashed ${ZW.muted}`,
        backgroundColor: "rgba(233,238,240,0.06)",
        opacity: 0.8 * cut,
        transform: `scale(${1 - p * 0.35})`,
        display: "grid",
        placeItems: "center",
        fontFamily: ZW.mono,
        fontSize: 26,
        color: ZW.muted,
      }}
    >
      copy
    </div>
  );
};

export const NoCopy: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const blocked = interpolate(frame, [F(NOCOPY_AT.copy) + 8, F(NOCOPY_AT.copy) + 18], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });
  const running = frame >= F(NOCOPY_AT.runs);
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-title]"), { y: 40, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.1)
      .from(selector("[data-file]"), { y: 80, opacity: 0, rotateX: 40, duration: 0.7, ease: "power3.out" }, 0.25)
      .from(selector("[data-allowed]"), { scale: 0.5, opacity: 0, duration: 0.4, ease: "back.out(2.5)" }, NOCOPY_AT.runs);
    NOCOPY_AT.reasons.forEach((at, i) => {
      timeline
        .from(selector(`[data-reason="${i}"]`), { x: 160, opacity: 0, duration: 0.45, ease: "power3.out" }, at - 0.15)
        .from(selector(`[data-strike="${i}"]`), { scale: 0, rotate: -90, duration: 0.35, ease: "back.out(2.5)" }, at);
    });
    timeline.to(selector("[data-cam]"), { scale: 1.04, duration: 8, ease: "none" }, 0);
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
            top: 120,
            textAlign: "center",
            fontFamily: ZW.sans,
            fontWeight: 800,
            fontSize: 64,
            letterSpacing: -1.5,
            color: ZW.text,
          }}
        >
          Allowed files are <span style={{ color: ZW.jade }}>never copied.</span>
        </div>
        {/* the allowed file */}
        <div data-file style={{ position: "absolute", left: 360, top: 330, width: 300, textAlign: "center" }}>
          <div
            style={{
              width: 240,
              height: 290,
              margin: "0 auto",
              borderRadius: 24,
              border: `4px solid ${ZW.jade}`,
              backgroundColor: `${ZW.jade}14`,
              boxShadow: running ? `0 0 50px ${ZW.jade}66` : undefined,
              display: "grid",
              placeItems: "center",
              fontFamily: ZW.mono,
              fontWeight: 700,
              fontSize: 40,
              color: ZW.jade,
            }}
          >
            XLSX
          </div>
          <div style={{ marginTop: 16, fontFamily: ZW.mono, fontSize: 24, color: ZW.text }}>budget_2026.xlsx</div>
          <div data-allowed style={{ marginTop: 14 }}>
            <Pill text="Allowed · running" color={ZW.jade} size={22} />
          </div>
        </div>
        {/* the wall the copy hits */}
        <div
          style={{
            position: "absolute",
            left: 1010,
            top: 300,
            width: 8,
            height: 330,
            borderRadius: 4,
            backgroundColor: ZW.red,
            boxShadow: `0 0 30px ${ZW.red}`,
            opacity: blocked,
            transform: `scaleY(${blocked})`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 940,
            top: 650,
            width: 150,
            textAlign: "center",
            fontFamily: ZW.mono,
            fontWeight: 600,
            fontSize: 24,
            color: ZW.red,
            opacity: blocked,
          }}
        >
          no copy
        </div>
        {/* reasons */}
        <div style={{ position: "absolute", left: 1140, top: 330 }}>
          {REASONS.map((r, i) => (
            <div
              key={r}
              data-reason={i}
              style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 34, fontFamily: ZW.sans, fontWeight: 700, fontSize: 46, color: ZW.text }}
            >
              <div
                data-strike={i}
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  border: `4px solid ${ZW.red}`,
                  backgroundColor: `${ZW.red}22`,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 34,
                  color: ZW.red,
                  boxShadow: `0 0 18px ${ZW.red}66`,
                  flex: "none",
                }}
              >
                ✕
              </div>
              <span>
                Not for <span style={{ color: ZW.amber }}>{r}</span>
              </span>
            </div>
          ))}
        </div>
        <AbsoluteFill>
          <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={220}>
            <AbsoluteFill>
              <Ghost />
            </AbsoluteFill>
          </HtmlInCanvasMotionBlur>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
