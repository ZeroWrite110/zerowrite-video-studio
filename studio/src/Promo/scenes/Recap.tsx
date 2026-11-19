import { useGsapTimeline } from "@remotion/gsap";
import { HtmlInCanvasMotionBlur } from "@remotion/motion-blur";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ZW } from "../components/ui";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Seconds (scene time) matched to the voice line (voice starts at ~0.27 s).
export const RECAP_AT = {
  steps: [2.8, 3.85, 4.8], // "Hold the code", "Read its intent", "Decide, before it runs"
  verdict: 6.65, // "Nothing runs without a verdict."
};
const F = (s: number) => Math.round(s * 30);

const STEPS = [
  { n: "01", title: "Hold", sub: "the code", color: ZW.amber },
  { n: "02", title: "Read", sub: "its intent", color: ZW.cyan },
  { n: "03", title: "Decide", sub: "before it runs", color: ZW.jade },
];
const CARD_W = 470;
const GAP = 70;
const LEFT = (1920 - (CARD_W * 3 + GAP * 2)) / 2;

// The three cards fly in from below with motion blur.
const Cards: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {STEPS.map((s, i) => {
        const p = interpolate(frame, [F(RECAP_AT.steps[i]) - 6, F(RECAP_AT.steps[i]) + 4], [0, 1], {
          ...clamp,
          easing: Easing.out(Easing.back(1.4)),
        });
        const dim = interpolate(frame, [F(RECAP_AT.verdict) - 4, F(RECAP_AT.verdict) + 8], [1, 0.1], clamp);
        return (
          <div
            key={s.n}
            style={{
              position: "absolute",
              left: LEFT + i * (CARD_W + GAP),
              top: 300 + (1 - p) * 700,
              width: CARD_W,
              height: 360,
              borderRadius: 30,
              padding: 40,
              boxSizing: "border-box",
              opacity: Math.min(1, p * 1.4) * dim,
              transform: `rotate(${(1 - p) * (i - 1) * 12}deg)`,
              backgroundColor: "rgba(14,21,24,0.94)",
              border: `2px solid ${s.color}88`,
              boxShadow: `0 40px 90px rgba(0,0,0,0.55), 0 0 60px ${s.color}33`,
            }}
          >
            <div style={{ fontFamily: ZW.mono, fontWeight: 600, fontSize: 40, color: s.color }}>{s.n}</div>
            <div style={{ marginTop: 40, fontFamily: ZW.sans, fontWeight: 800, fontSize: 96, letterSpacing: -2.5, color: ZW.text, lineHeight: 1 }}>
              {s.title}
            </div>
            <div style={{ marginTop: 18, fontFamily: ZW.sans, fontWeight: 600, fontSize: 40, color: ZW.muted }}>{s.sub}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// "Nothing runs without a verdict." words drop one by one.
const Verdict: React.FC = () => {
  const frame = useCurrentFrame();
  const words = ["Nothing", "runs", "without", "a", "verdict."];
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 440,
        textAlign: "center",
        fontFamily: ZW.sans,
        fontWeight: 800,
        fontSize: 104,
        letterSpacing: -3,
        whiteSpace: "nowrap",
      }}
    >
      {words.map((w, i) => {
        const s = F(RECAP_AT.verdict) + i * 4;
        const p = interpolate(frame, [s, s + 7], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: 30,
              opacity: p,
              transform: `translateY(${(1 - p) * -160}px)`,
              color: i === 4 ? ZW.cyan : ZW.text,
              textShadow: i === 4 ? `0 0 50px ${ZW.cyan}88` : "0 10px 40px rgba(0,0,0,0.8)",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const Recap: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  // Connector line drawn between the cards as each step lands.
  const line = interpolate(frame, [F(RECAP_AT.steps[0]) + 4, F(RECAP_AT.steps[2]) + 4], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const lineFade = interpolate(frame, [F(RECAP_AT.verdict) - 4, F(RECAP_AT.verdict) + 8], [1, 0.1], clamp);
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-head] span"), { y: 50, opacity: 0, duration: 0.5, ease: "power3.out", stagger: 0.08 }, 0.2)
      .to(selector("[data-head]"), { opacity: 0, y: -30, duration: 0.4, ease: "power2.in" }, RECAP_AT.steps[0] - 0.5)
      .to(selector("[data-cam]"), { scale: 1.04, duration: 9, ease: "none" }, 0);
  });
  return (
    <AbsoluteFill ref={scope}>
      <AbsoluteFill data-cam>
        <div
          data-head
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 420,
            textAlign: "center",
            fontFamily: ZW.sans,
            fontWeight: 800,
            fontSize: 110,
            letterSpacing: -3,
            color: ZW.text,
          }}
        >
          <span style={{ display: "inline-block" }}>The&nbsp;whole&nbsp;idea&nbsp;in&nbsp;</span>
          <span style={{ display: "inline-block", color: ZW.cyan }}>three&nbsp;steps</span>
        </div>
        <div
          style={{
            position: "absolute",
            left: LEFT + CARD_W / 2,
            top: 480,
            width: (CARD_W + GAP) * 2 * line,
            height: 4,
            background: `linear-gradient(90deg, ${ZW.amber}, ${ZW.cyan}, ${ZW.jade})`,
            opacity: lineFade,
            boxShadow: `0 0 20px ${ZW.cyan}`,
          }}
        />
        <AbsoluteFill>
          <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={220}>
            <AbsoluteFill>
              <Cards />
              <Verdict />
            </AbsoluteFill>
          </HtmlInCanvasMotionBlur>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
