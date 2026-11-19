import { useGsapTimeline } from "@remotion/gsap";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ZW } from "../components/ui";

// Seconds (scene time) when each word is spoken: "Cleanup. Restores. And an awkward call".
export const CLEANUP_AT = [5.0, 5.6, 6.55];

const Icon: React.FC<{ kind: "broom" | "restore" | "phone"; color: string }> = ({
  kind,
  color,
}) => {
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg width={150} height={150} viewBox="0 0 24 24">
      {kind === "broom" ? (
        <g {...common}>
          <path d="M20 2.5l-8 8" />
          <path d="M10 9l5 5-1.2 1.2-5-5z" />
          <path d="M8.8 10.2c-2.5 1-4.6 3.4-5.8 7.3l3.5 3.5c3.9-1.2 6.3-3.3 7.3-5.8" />
          <path d="M5 19.5l3-3M7.5 21l2.5-2.5M3.5 17l2.5-2.5" />
        </g>
      ) : kind === "restore" ? (
        <g {...common}>
          <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
          <path d="M3 4v5h5" />
          <path d="M12 7.5V12l3 2" />
        </g>
      ) : (
        <g {...common}>
          <path d="M5 3.5h3l1.5 4-2 1.2a11 11 0 0 0 7.8 7.8l1.2-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3 5.5a2 2 0 0 1 2-2z" />
        </g>
      )}
    </svg>
  );
};

const CARDS = [
  { kind: "broom" as const, label: "Cleanup" },
  { kind: "restore" as const, label: "Restores" },
  { kind: "phone" as const, label: "Client call" },
];

// A clock that keeps spinning while the work piles up.
const Clock: React.FC = () => {
  const frame = useCurrentFrame();
  const minute = frame * 9;
  const hour = frame * 0.75;
  return (
    <svg width={120} height={120} viewBox="0 0 100 100">
      <circle cx={50} cy={50} r={44} fill="none" stroke={ZW.red} strokeWidth={5} />
      <line
        x1={50}
        y1={50}
        x2={50}
        y2={16}
        stroke={ZW.text}
        strokeWidth={5}
        strokeLinecap="round"
        transform={`rotate(${minute} 50 50)`}
      />
      <line
        x1={50}
        y1={50}
        x2={50}
        y2={28}
        stroke={ZW.red}
        strokeWidth={6}
        strokeLinecap="round"
        transform={`rotate(${hour} 50 50)`}
      />
    </svg>
  );
};

export const Cleanup: React.FC = () => {
  const frame = useCurrentFrame();
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-line] > *"), {
        y: 50,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.35,
      }, 0.2)
      .from(selector("[data-arrow]"), { scaleX: 0, transformOrigin: "0% 50%", duration: 0.6, ease: "power3.inOut" }, 1.6)
      .from(selector("[data-clock]"), { scale: 0, opacity: 0, duration: 0.5, ease: "back.out(2)" }, 3.6);
    CLEANUP_AT.forEach((t, i) => {
      timeline.from(selector(`[data-card="${i}"]`), {
        y: 220,
        opacity: 0,
        rotate: i === 0 ? -10 : i === 2 ? 10 : 0,
        duration: 0.55,
        ease: "back.out(1.8)",
      }, t);
    });
    timeline.to(selector("[data-cam]"), { scale: 1.07, duration: 8.5, ease: "none" }, 0);
  });
  // Red pressure builds as the jobs stack up.
  const heat = interpolate(frame, [CLEANUP_AT[0] * 30, CLEANUP_AT[2] * 30 + 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill ref={scope}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 70%, ${ZW.red}${Math.round(heat * 40)
            .toString(16)
            .padStart(2, "0")}, transparent 70%)`,
        }}
      />
      <AbsoluteFill data-cam>
        <div
          data-line
          style={{
            position: "absolute",
            top: 170,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 36,
            fontFamily: ZW.sans,
            fontWeight: 800,
            fontSize: 70,
            letterSpacing: -1.5,
            color: ZW.text,
          }}
        >
          <span>
            File <span style={{ color: ZW.red }}>runs</span>
          </span>
          <span
            data-arrow
            style={{
              display: "inline-block",
              width: 140,
              height: 8,
              borderRadius: 4,
              backgroundColor: ZW.red,
              boxShadow: `0 0 20px ${ZW.red}`,
            }}
          />
          <span>
            Your work <span style={{ color: ZW.red }}>starts</span>
          </span>
        </div>
        <div data-clock style={{ position: "absolute", top: 300, left: 900 }}>
          <Clock />
        </div>
        <div
          style={{
            position: "absolute",
            top: 470,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            gap: 60,
          }}
        >
          {CARDS.map((c, i) => (
            <div
              key={c.kind}
              data-card={i}
              style={{
                width: 400,
                height: 380,
                borderRadius: 30,
                backgroundColor: "rgba(14,21,24,0.94)",
                border: `2px solid ${ZW.red}66`,
                boxShadow: `0 40px 90px rgba(0,0,0,0.55), 0 0 50px ${ZW.red}22`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 24,
              }}
            >
              <Icon kind={c.kind} color={ZW.red} />
              <div
                style={{
                  fontFamily: ZW.sans,
                  fontWeight: 700,
                  fontSize: 48,
                  color: ZW.text,
                }}
              >
                {c.label}
              </div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
