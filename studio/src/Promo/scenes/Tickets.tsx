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

// Generic helpdesk queue (no real PSA branding). Illustrative ticket names.
const TICKETS = [
  { id: "#4821", title: "Malware cleanup", client: "Client A", tag: "P1" },
  { id: "#4822", title: "Restore encrypted share", client: "Client B", tag: "P1" },
  { id: "#4823", title: "Reimage workstation", client: "Client A", tag: "P2" },
  { id: "#4824", title: "Suspicious download", client: "Client C", tag: "P2" },
  { id: "#4825", title: "Incident report", client: "Client B", tag: "P3" },
];

const CLEAR_AT = 82; // frame: queue starts clearing

// Ticket rows drop into a tilted queue; rendered with motion blur.
const Queue: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        perspective: 1400,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 1100,
          marginTop: 170,
          transform: `rotateX(${interpolate(frame, [0, 140], [26, 18])}deg) rotateZ(-2deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {TICKETS.map((t, i) => {
          const inAt = 4 + i * 6;
          const p = interpolate(frame, [inAt, inAt + 10], [0, 1], {
            ...clamp,
            easing: Easing.bezier(0.2, 0.9, 0.1, 1),
          });
          const outAt = CLEAR_AT + (TICKETS.length - 1 - i) * 4;
          const out = interpolate(frame, [outAt, outAt + 9], [0, 1], {
            ...clamp,
            easing: Easing.in(Easing.cubic),
          });
          const color = t.tag === "P1" ? ZW.red : t.tag === "P2" ? ZW.amber : ZW.faint;
          return (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                marginBottom: 16,
                padding: "22px 30px",
                borderRadius: 18,
                backgroundColor: "rgba(14,21,24,0.95)",
                border: `2px solid ${ZW.line}`,
                borderLeft: `8px solid ${color}`,
                boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
                opacity: p * (1 - out),
                transform: `translateY(${(1 - p) * -260}px) translateX(${out * 1600}px)`,
              }}
            >
              <span style={{ fontFamily: ZW.mono, fontSize: 28, color: ZW.faint }}>{t.id}</span>
              <span
                style={{
                  flex: 1,
                  fontFamily: ZW.sans,
                  fontWeight: 600,
                  fontSize: 36,
                  color: ZW.text,
                }}
              >
                {t.title}
              </span>
              <span style={{ fontFamily: ZW.sans, fontSize: 28, color: ZW.muted }}>{t.client}</span>
              <Pill text={t.tag} color={color} size={22} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Tickets: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const open = Math.round(
    interpolate(frame, [CLEAR_AT, CLEAR_AT + 26], [TICKETS.length, 0], clamp),
  );
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-head] span"), {
        y: 70,
        opacity: 0,
        filter: "blur(12px)",
        duration: 0.55,
        ease: "power4.out",
        stagger: 0.07,
      }, 0.15)
      .from(selector("[data-counter]"), { x: 80, opacity: 0, duration: 0.5, ease: "power3.out" }, 0.9)
      .to(selector("[data-counter]"), { scale: 1.12, duration: 0.25, ease: "power2.out" }, 3.7)
      .to(selector("[data-counter]"), { scale: 1, duration: 0.4, ease: "power2.inOut" }, 3.95)
      .from(selector("[data-never]"), { scale: 2.4, opacity: 0, rotate: -8, duration: 0.45, ease: "back.out(2.2)" }, 3.75)
      .to(selector("[data-cam]"), { scale: 1.05, duration: 5, ease: "none" }, 0);
  });
  const cleared = open === 0;
  return (
    <AbsoluteFill ref={scope}>
      <AbsoluteFill data-cam>
        <div
          data-head
          style={{
            position: "absolute",
            top: 150,
            width: "100%",
            textAlign: "center",
            fontFamily: ZW.sans,
            fontWeight: 800,
            fontSize: 78,
            letterSpacing: -2,
            color: ZW.text,
          }}
        >
          {"The best ticket is the one that never opens.".split(" ").map((w, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: 20,
                color: w === "never" ? ZW.cyan : ZW.text,
              }}
            >
              {w}
            </span>
          ))}
        </div>
        <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={200}>
          <Queue />
        </HtmlInCanvasMotionBlur>
        <div
          data-counter
          style={{
            position: "absolute",
            right: 90,
            top: 300,
            padding: "18px 28px",
            borderRadius: 20,
            border: `2px solid ${cleared ? ZW.jade : ZW.red}`,
            backgroundColor: cleared ? `${ZW.jade}1c` : `${ZW.red}1c`,
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: ZW.mono, fontSize: 22, letterSpacing: 2, color: ZW.muted }}>
            OPEN TICKETS
          </div>
          <div
            style={{
              fontFamily: ZW.mono,
              fontWeight: 600,
              fontSize: 84,
              color: cleared ? ZW.jade : ZW.red,
              lineHeight: 1.1,
            }}
          >
            {open}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 560,
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div data-never>
            <Pill
              text="Never opened"
              color={ZW.jade}
              size={56}
              style={{ padding: "16px 36px", borderWidth: 4, boxShadow: `0 0 50px ${ZW.jade}55` }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
