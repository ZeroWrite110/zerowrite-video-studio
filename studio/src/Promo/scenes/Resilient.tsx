import { useGsapTimeline } from "@remotion/gsap";
import { HtmlInCanvasMotionBlur } from "@remotion/motion-blur";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo, Panel, Pill, ZW } from "../components/ui";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Seconds (scene time) matched to the voice line (voice starts at ~0.27 s).
export const RESILIENT_AT = {
  offline: 0.75, // "Losing the network"
  steady: 1.6, // "never lowers protection"
  expired: 3.0, // "expired subscription"
  steady2: 4.2, // "never disables it"
  updates: 5.9, // "The updates stop"
  stays: 6.6, // "but the protection does not."
};
const F = (s: number) => Math.round(s * 30);

const Wifi: React.FC<{ bars: number; color: string }> = ({ bars, color }) => (
  <svg width={96} height={80} viewBox="0 0 48 40">
    {[0, 1, 2].map((i) => (
      <path
        key={i}
        d={`M${24 - (8 + i * 8)} ${30 - (6 + i * 6)} Q24 ${30 - (16 + i * 9)} ${24 + 8 + i * 8} ${30 - (6 + i * 6)}`}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        opacity={i < bars ? 1 : 0.15}
      />
    ))}
    <circle cx={24} cy={32} r={3.5} fill={color} />
  </svg>
);

// The shield ring in the middle: it never flickers.
const Shield: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 0.5 + 0.5 * Math.sin(frame / 9);
  const hits = [RESILIENT_AT.offline, RESILIENT_AT.expired].map((s) =>
    interpolate(frame, [F(s), F(s) + 16], [0, 1], clamp),
  );
  return (
    <div style={{ position: "relative", width: 420, height: 420 }}>
      {hits.map((h, i) =>
        h > 0 && h < 1 ? (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: -h * 140,
              borderRadius: 999,
              border: `4px solid ${ZW.red}`,
              opacity: (1 - h) * 0.8,
            }}
          />
        ) : null,
      )}
      <svg width={420} height={420} viewBox="0 0 420 420" style={{ position: "absolute", inset: 0, transform: `rotate(${frame * 0.6}deg)` }}>
        <circle cx={210} cy={210} r={196} fill="none" stroke={ZW.cyanDeep} strokeWidth={3} strokeDasharray="4 14" />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 34,
          borderRadius: 999,
          border: `6px solid ${ZW.cyan}`,
          boxShadow: `0 0 ${50 + pulse * 40}px ${ZW.cyan}88, inset 0 0 60px ${ZW.cyan}33`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          backgroundColor: "rgba(14,21,24,0.85)",
        }}
      >
        <Logo size={120} />
        <Pill text="Protected" color={ZW.jade} size={26} />
      </div>
    </div>
  );
};

// "Updates stop. Protection does not." slams in with motion blur.
const Kinetic: React.FC = () => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [F(RESILIENT_AT.updates), F(RESILIENT_AT.updates) + 8], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const b = interpolate(frame, [F(RESILIENT_AT.stays), F(RESILIENT_AT.stays) + 8], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const style: React.CSSProperties = {
    position: "absolute",
    top: 800,
    fontFamily: ZW.sans,
    fontWeight: 800,
    fontSize: 72,
    letterSpacing: -1.5,
    whiteSpace: "nowrap",
  };
  return (
    <AbsoluteFill>
      {a > 0 ? (
        <div style={{ ...style, left: interpolate(a, [0, 1], [-700, 330]), color: ZW.amber, opacity: a }}>
          Updates stop.
        </div>
      ) : null}
      {b > 0 ? (
        <div style={{ ...style, left: interpolate(b, [0, 1], [1920, 870]), color: ZW.cyan, opacity: b, textShadow: `0 0 40px ${ZW.cyan}66` }}>
          Protection does not.
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const Resilient: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const offline = frame >= F(RESILIENT_AT.offline);
  const bars = Math.round(interpolate(frame, [F(RESILIENT_AT.offline) - 8, F(RESILIENT_AT.offline)], [3, 0], clamp));
  const expired = frame >= F(RESILIENT_AT.expired);
  const stamp = interpolate(frame, [F(RESILIENT_AT.expired), F(RESILIENT_AT.expired) + 6], [2.4, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const updatesPaused = frame >= F(RESILIENT_AT.updates);
  const lift = interpolate(frame, [F(RESILIENT_AT.updates) - 10, F(RESILIENT_AT.updates)], [0, -70], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-shield]"), { scale: 0.5, opacity: 0, duration: 0.7, ease: "back.out(1.6)" }, 0)
      .from(selector("[data-net]"), { x: -140, opacity: 0, duration: 0.55, ease: "power3.out" }, 0.15)
      .from(selector("[data-sub]"), { x: 140, opacity: 0, duration: 0.55, ease: "power3.out" }, RESILIENT_AT.expired - 0.55)
      .to(selector("[data-cam]"), { scale: 1.05, duration: 9, ease: "none" }, 0);
  });
  return (
    <AbsoluteFill ref={scope}>
      <AbsoluteFill data-cam style={{ transform: `translateY(${lift}px)` }}>
        <div data-shield style={{ position: "absolute", left: 750, top: 250 }}>
          <Shield />
        </div>
        {/* Network card */}
        <div data-net style={{ position: "absolute", left: 150, top: 330 }}>
          <Panel style={{ width: 460, padding: 28 }} glow={offline ? ZW.red : ZW.cyan}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Wifi bars={bars} color={offline ? ZW.red : ZW.cyan} />
              <div>
                <div style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 34, color: ZW.text }}>Network</div>
                <div style={{ marginTop: 8 }}>
                  <Pill text={offline ? "Offline" : "Connected"} color={offline ? ZW.red : ZW.cyan} size={20} />
                </div>
              </div>
            </div>
            <div style={{ marginTop: 22, fontFamily: ZW.mono, fontSize: 22, color: ZW.muted }}>
              analysis runs on the machine
            </div>
          </Panel>
        </div>
        {/* Subscription card */}
        <div data-sub style={{ position: "absolute", left: 1310, top: 330 }}>
          <Panel style={{ width: 460, padding: 28, position: "relative" }} glow={expired ? ZW.amber : undefined}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <svg width={80} height={80} viewBox="0 0 40 40">
                <rect x={4} y={8} width={32} height={28} rx={5} fill="none" stroke={ZW.amber} strokeWidth={3} />
                <path d="M4 16 H36 M13 4 V11 M27 4 V11" stroke={ZW.amber} strokeWidth={3} strokeLinecap="round" />
              </svg>
              <div>
                <div style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 34, color: ZW.text }}>Subscription</div>
                <div style={{ fontFamily: ZW.mono, fontSize: 20, color: ZW.muted, marginTop: 8 }}>renewal date passed</div>
              </div>
            </div>
            <div style={{ marginTop: 22, fontFamily: ZW.mono, fontSize: 22, color: updatesPaused ? ZW.amber : ZW.muted }}>
              rule updates: {updatesPaused ? "paused" : "on"}
            </div>
            {expired ? (
              <div
                style={{
                  position: "absolute",
                  right: 28,
                  top: -30,
                  backgroundColor: "#140f05",
                  transform: `rotate(-12deg) scale(${stamp})`,
                  fontFamily: ZW.mono,
                  fontWeight: 700,
                  fontSize: 30,
                  letterSpacing: 2,
                  color: ZW.amber,
                  border: `4px solid ${ZW.amber}`,
                  borderRadius: 10,
                  padding: "4px 12px",
                }}
              >
                EXPIRED
              </div>
            ) : null}
          </Panel>
        </div>
        <AbsoluteFill>
          <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={220}>
            <Kinetic />
          </HtmlInCanvasMotionBlur>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
