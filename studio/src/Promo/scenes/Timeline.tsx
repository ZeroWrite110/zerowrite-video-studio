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

// Timeline geometry (px)
const Y = 500;
const ARRIVE_X = 300;
const RUN_X = 1180;
const REACT_X = 1600;
const DECIDE_X = 900;

// Seconds: the marker moves earlier, then Hold / Check / Decide are spoken.
const MOVE = [1.9, 2.8];
export const STEP_AT = [3.85, 5.45, 6.2];

// The "decision" marker: starts after RUN (red, "React") and slides before it (cyan, "Decide").
const Marker: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [MOVE[0] * 30, MOVE[1] * 30], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.7, 0, 0.2, 1),
  });
  const x = interpolate(p, [0, 1], [REACT_X, DECIDE_X]);
  const color = p < 0.5 ? ZW.red : ZW.cyan;
  const appear = interpolate(frame, [12, 24], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: x - 110,
          top: Y - 210,
          width: 220,
          textAlign: "center",
          opacity: appear,
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontFamily: ZW.mono,
            fontWeight: 600,
            fontSize: 34,
            letterSpacing: 2,
            color: ZW.ink,
            backgroundColor: color,
            borderRadius: 12,
            padding: "10px 22px",
            boxShadow: `0 0 40px ${color}`,
          }}
        >
          {p < 0.5 ? "REACT" : "DECIDE"}
        </div>
        <div
          style={{
            margin: "0 auto",
            width: 6,
            height: 130,
            backgroundColor: color,
            boxShadow: `0 0 20px ${color}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const Node: React.FC<{ x: number; label: string; color: string; sub?: string }> = ({
  x,
  label,
  color,
  sub,
}) => (
  <div style={{ position: "absolute", left: x - 150, top: Y - 28, width: 300, textAlign: "center" }}>
    <div
      style={{
        margin: "0 auto",
        width: 56,
        height: 56,
        borderRadius: 56,
        border: `6px solid ${color}`,
        backgroundColor: ZW.ink,
        boxShadow: `0 0 30px ${color}88`,
      }}
    />
    <div
      style={{
        marginTop: 22,
        fontFamily: ZW.sans,
        fontWeight: 800,
        fontSize: 44,
        letterSpacing: 2,
        color: ZW.text,
      }}
    >
      {label}
    </div>
    {sub ? (
      <div style={{ marginTop: 6, fontFamily: ZW.mono, fontSize: 24, color }}>{sub}</div>
    ) : null}
  </div>
);

export const Timeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const draw = interpolate(frame, [4, 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const moved = frame >= MOVE[1] * 30;
  const waiting = frame >= STEP_AT[2] * 30 + 10;
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline.from(selector("[data-head] span"), {
      y: 60,
      opacity: 0,
      duration: 0.5,
      ease: "power3.out",
      stagger: 0.06,
    }, 0.1);
    STEP_AT.forEach((t, i) => {
      timeline.from(selector(`[data-step="${i}"]`), {
        y: 60,
        scale: 0.6,
        opacity: 0,
        duration: 0.45,
        ease: "back.out(2)",
      }, t);
    });
    timeline
      .to(selector("[data-zone]"), { opacity: 1, duration: 0.4 }, MOVE[1])
      .to(selector("[data-cam]"), { scale: 1.06, x: -30, duration: 7.5, ease: "none" }, 0);
  });
  return (
    <AbsoluteFill ref={scope}>
      <AbsoluteFill data-cam>
        <div
          data-head
          style={{
            position: "absolute",
            top: 120,
            width: "100%",
            textAlign: "center",
            fontFamily: ZW.sans,
            fontWeight: 800,
            fontSize: 76,
            letterSpacing: -2,
            color: ZW.text,
          }}
        >
          {"Move the decision earlier.".split(" ").map((w, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: 20,
                color: w === "earlier." ? ZW.cyan : ZW.text,
              }}
            >
              {w}
            </span>
          ))}
        </div>
        {/* Highlight zone between ARRIVE and RUN, where the decision now happens. */}
        <div
          data-zone
          style={{
            position: "absolute",
            left: ARRIVE_X + 40,
            width: RUN_X - ARRIVE_X - 80,
            top: Y - 90,
            height: 180,
            borderRadius: 24,
            background: `linear-gradient(90deg, ${ZW.cyan}00, ${ZW.cyan}22, ${ZW.cyan}00)`,
            opacity: 0,
          }}
        />
        {/* Track */}
        <div
          style={{
            position: "absolute",
            left: ARRIVE_X,
            top: Y - 3,
            width: (REACT_X + 120 - ARRIVE_X) * draw,
            height: 6,
            borderRadius: 3,
            background: `linear-gradient(90deg, ${ZW.cyan}, ${ZW.cyanDeep} 55%, ${ZW.red})`,
          }}
        />
        <Node x={ARRIVE_X} label="ARRIVE" color={ZW.cyan} />
        <Node
          x={RUN_X}
          label="RUN"
          color={moved ? ZW.faint : ZW.red}
          sub={waiting ? "WAITING FOR VERDICT" : undefined}
        />
        <HtmlInCanvasMotionBlur width={width} height={height} samples={10} shutterAngle={220}>
          <Marker />
        </HtmlInCanvasMotionBlur>
        <div
          style={{
            position: "absolute",
            top: Y + 170,
            left: ARRIVE_X,
            width: RUN_X - ARRIVE_X,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {[
            { t: "Hold", c: ZW.cyan },
            { t: "Check", c: ZW.amber },
            { t: "Decide", c: ZW.jade },
          ].map((s, i) => (
            <div key={s.t} data-step={i}>
              <Pill text={`${i + 1} · ${s.t}`} color={s.c} size={36} style={{ padding: "12px 26px" }} />
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
