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
export const SIGNS_AT = {
  file: 0.3, // "Can you tell a file is dangerous"
  would: 2.8, // "You can, by what it would do."
  three: 4.25, // "Here are three signs."
  numbers: [4.75, 5.0, 5.25],
};
const F = (s: number) => Math.round(s * 30);

// The three numbered slots drop in, with motion blur.
const Numbers: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {SIGNS_AT.numbers.map((s, i) => {
        const p = interpolate(frame, [F(s) - 9, F(s)], [0, 1], {
          ...clamp,
          easing: Easing.in(Easing.cubic),
        });
        const settle = interpolate(frame, [F(s), F(s) + 8], [1.18, 1], {
          ...clamp,
          easing: Easing.out(Easing.back(3)),
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 1140 + i * 210,
              top: interpolate(p, [0, 1], [-260, 470]),
              width: 170,
              height: 170,
              borderRadius: 34,
              border: `4px solid ${ZW.cyan}`,
              backgroundColor: "rgba(14,21,24,0.95)",
              boxShadow: `0 0 50px ${ZW.cyan}55`,
              display: "grid",
              placeItems: "center",
              fontFamily: ZW.sans,
              fontWeight: 800,
              fontSize: 110,
              color: ZW.cyan,
              opacity: p > 0 ? 1 : 0,
              transform: `scale(${settle})`,
            }}
          >
            {i + 1}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const Signs: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-q]"), { y: 60, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.1)
      .from(selector("[data-file]"), { x: -220, rotateY: 35, opacity: 0, duration: 0.8, ease: "power3.out" }, SIGNS_AT.file)
      .from(selector("[data-would]"), { y: 40, opacity: 0, duration: 0.45, ease: "back.out(2)" }, SIGNS_AT.would)
      .to(selector("[data-qmark]"), { scale: 0, opacity: 0, duration: 0.3, ease: "power2.in" }, SIGNS_AT.would)
      .from(selector("[data-eye]"), { scale: 0, opacity: 0, duration: 0.45, ease: "back.out(3)" }, SIGNS_AT.would + 0.25)
      .from(selector("[data-three]"), { x: 80, opacity: 0, duration: 0.5, ease: "power3.out" }, SIGNS_AT.three - 0.2)
      .to(selector("[data-cam]"), { scale: 1.06, duration: 7, ease: "none" }, 0);
  });
  // The file card breathes while it is being judged.
  const pulse = 0.5 + 0.5 * Math.sin(frame / 8);
  return (
    <AbsoluteFill ref={scope} style={{ perspective: 1600 }}>
      <AbsoluteFill data-cam>
        <div
          data-q
          style={{
            position: "absolute",
            left: 150,
            right: 150,
            top: 150,
            fontFamily: ZW.sans,
            fontWeight: 800,
            fontSize: 70,
            lineHeight: 1.1,
            letterSpacing: -1.5,
            color: ZW.text,
          }}
        >
          Is this file dangerous <span style={{ color: ZW.cyan }}>before it runs?</span>
        </div>
        <div data-file style={{ position: "absolute", left: 150, top: 360 }}>
          <Panel style={{ width: 800, padding: 34, position: "relative" }} glow={ZW.amber}>
            <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
              <div
                style={{
                  width: 110,
                  height: 130,
                  borderRadius: 18,
                  border: `4px solid ${ZW.amber}`,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: ZW.mono,
                  fontWeight: 600,
                  fontSize: 28,
                  color: ZW.amber,
                  backgroundColor: `${ZW.amber}${Math.round(16 + pulse * 20).toString(16)}`,
                }}
              >
                EXE
              </div>
              <div>
                <div style={{ fontFamily: ZW.mono, fontSize: 40, color: ZW.text }}>invoice_0423.exe</div>
                <div style={{ fontFamily: ZW.mono, fontSize: 24, color: ZW.muted, marginTop: 8 }}>
                  unsigned · 2.1 MB · first seen now
                </div>
              </div>
              <div
                data-qmark
                style={{
                  marginLeft: "auto",
                  fontFamily: ZW.sans,
                  fontWeight: 800,
                  fontSize: 96,
                  color: ZW.amber,
                }}
              >
                ?
              </div>
            </div>
            <div data-would style={{ marginTop: 34, display: "flex", alignItems: "center", gap: 18 }}>
              <div
                data-eye
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 27,
                  border: `5px solid ${ZW.cyan}`,
                  display: "grid",
                  placeItems: "center",
                  boxShadow: `0 0 24px ${ZW.cyan}88`,
                }}
              >
                <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: ZW.cyan }} />
              </div>
              <span style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 40, color: ZW.text }}>
                Judge it by <span style={{ color: ZW.cyan }}>what it would do.</span>
              </span>
            </div>
          </Panel>
        </div>
        <div data-three style={{ position: "absolute", left: 1140, top: 360 }}>
          <Pill text="3 signs to look for" color={ZW.cyan} size={26} />
        </div>
        <AbsoluteFill>
          <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={200}>
            <AbsoluteFill>
              <Numbers />
            </AbsoluteFill>
          </HtmlInCanvasMotionBlur>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
