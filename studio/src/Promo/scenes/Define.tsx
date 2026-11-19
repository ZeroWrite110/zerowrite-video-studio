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

// Seconds (scene time) matched to the voice line (voice starts at ~0.27 s).
export const DEFINE_AT = {
  term: 0.6, // "pre-execution protection?"
  means: 2.2, // "It means deciding"
  newCode: 3.6, // "new code may run"
  before: 4.85, // "before it runs."
};
const F = (s: number) => Math.round(s * 30);

const TERM = "pre-execution";
const DEFINITION = ["Deciding", "whether", "new", "code", "may", "run,"];

// The headword types itself in, letter by letter, with a blinking caret.
const Headword: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.floor(
    interpolate(frame, [F(DEFINE_AT.term), F(DEFINE_AT.term) + 22], [0, TERM.length], clamp),
  );
  const caret = Math.floor(frame / 8) % 2 === 0 && n < TERM.length + 1;
  return (
    <div
      style={{
        fontFamily: ZW.sans,
        fontWeight: 800,
        fontSize: 150,
        letterSpacing: -4,
        color: ZW.text,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {TERM.slice(0, n)}
      <span style={{ color: ZW.cyan, opacity: caret ? 1 : 0 }}>|</span>
    </div>
  );
};

// Definition words drop in on the voice, then "before it runs." slams in.
const Definition: React.FC = () => {
  const frame = useCurrentFrame();
  const words = DEFINITION.map((w, i) => {
    const start = F(DEFINE_AT.means) + i * 4;
    const p = interpolate(frame, [start, start + 9], [0, 1], {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    });
    return (
      <span
        key={i}
        style={{
          display: "inline-block",
          marginRight: 22,
          opacity: p,
          transform: `translateY(${(1 - p) * -90}px)`,
          color: i === 2 || i === 3 ? ZW.cyanBright : ZW.text,
        }}
      >
        {w}
      </span>
    );
  });
  const b = interpolate(frame, [F(DEFINE_AT.before), F(DEFINE_AT.before) + 7], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(2)),
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 250,
        top: 630,
        fontFamily: ZW.sans,
        fontWeight: 700,
        fontSize: 62,
        letterSpacing: -1,
        whiteSpace: "nowrap",
      }}
    >
      <div>{words}</div>
      {b > 0 ? (
        <span
          style={{
            display: "inline-block",
            marginTop: 10,
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: -2,
            color: ZW.cyan,
            opacity: Math.min(1, b * 1.5),
            transform: `translateX(${(1 - b) * 600}px) scale(${0.8 + b * 0.2})`,
            textShadow: `0 0 40px ${ZW.cyan}88`,
          }}
        >
          before it runs.
        </span>
      ) : null}
    </div>
  );
};

export const Define: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const underline = interpolate(frame, [F(DEFINE_AT.before) + 6, F(DEFINE_AT.before) + 20], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const qSpin = frame * 0.25;
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-card]"), { y: 120, opacity: 0, rotateX: 35, duration: 0.8, ease: "power4.out" }, 0)
      .from(selector("[data-meta]"), { x: -60, opacity: 0, duration: 0.5, ease: "power3.out", stagger: 0.12 }, DEFINE_AT.term + 0.6)
      .from(selector("[data-rule]"), { scaleX: 0, transformOrigin: "0% 50%", duration: 0.7, ease: "power2.inOut" }, DEFINE_AT.means - 0.4)
      .to(selector("[data-cam]"), { scale: 1.06, duration: 7, ease: "none" }, 0);
  });
  return (
    <AbsoluteFill ref={scope} style={{ perspective: 1400 }}>
      {/* Huge faint question mark, slowly turning (parallax layer) */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 40,
          fontFamily: ZW.sans,
          fontWeight: 800,
          fontSize: 980,
          lineHeight: 1,
          color: ZW.cyanDeep,
          opacity: 0.12,
          transform: `rotate(${-8 + Math.sin(qSpin / 20) * 4}deg) translateY(${-frame * 0.4}px)`,
        }}
      >
        ?
      </div>
      <AbsoluteFill data-cam>
        <div
          data-card
          style={{
            position: "absolute",
            left: 200,
            top: 230,
            width: 1520,
            height: 640,
            borderRadius: 32,
            border: `2px solid ${ZW.line}`,
            background: "linear-gradient(160deg, rgba(14,21,24,0.95), rgba(5,9,11,0.9))",
            boxShadow: `0 50px 120px rgba(0,0,0,0.6), 0 0 80px ${ZW.cyan}18`,
          }}
        />
        <div style={{ position: "absolute", left: 250, top: 270 }}>
          <Pill text="Security glossary" color={ZW.cyan} size={22} />
        </div>
        <div style={{ position: "absolute", left: 250, top: 340 }}>
          <Headword />
        </div>
        <div
          style={{
            position: "absolute",
            left: 254,
            top: 520,
            display: "flex",
            gap: 28,
            alignItems: "center",
            fontFamily: ZW.mono,
            fontSize: 30,
            color: ZW.muted,
          }}
        >
          <span data-meta>/priː ˌek.sɪˈkjuː.ʃən/</span>
          <span data-meta style={{ color: ZW.cyan }}>protection · noun</span>
        </div>
        <div
          data-rule
          style={{ position: "absolute", left: 250, top: 600, width: 1420, height: 2, backgroundColor: ZW.line }}
        />
        <AbsoluteFill>
          <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={200}>
            <AbsoluteFill>
              <Definition />
            </AbsoluteFill>
          </HtmlInCanvasMotionBlur>
        </AbsoluteFill>
        <div
          style={{
            position: "absolute",
            left: 252,
            top: 812,
            width: 640 * underline,
            height: 8,
            borderRadius: 4,
            backgroundColor: ZW.cyan,
            boxShadow: `0 0 24px ${ZW.cyan}`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
