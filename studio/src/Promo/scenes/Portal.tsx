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
export const PORTAL_AT = {
  window: 0.35, // portal window flies in
  clients: 3.3, // "for your clients"
  licences: 4.95, // "licences"
  devices: 5.75, // "devices"
  policy: 6.7, // "a policy per licence"
  account: 8.6, // "one account"
};
const F = (s: number) => Math.round(s * 30);

const WIN = { left: 760, top: 190, width: 1060, height: 590 };
const TABS = [
  { label: "Licences", at: PORTAL_AT.licences },
  { label: "Devices", at: PORTAL_AT.devices },
  { label: "Policy", at: PORTAL_AT.policy },
];
// Illustrative sample numbers, not real customer data.
const STATS = [
  { label: "Licences", value: 3, at: PORTAL_AT.licences, color: ZW.cyan },
  { label: "Devices", value: 48, at: PORTAL_AT.devices, color: ZW.cyanBright },
  { label: "Policy", value: 3, at: PORTAL_AT.policy, color: ZW.jade, prefix: "rev " },
];
const BARS = [14, 9, 25];
const BAR_NAMES = ["Lic. A", "Lic. B", "Lic. C"];

const PortalWindow: React.FC = () => {
  const frame = useCurrentFrame();
  const fly = interpolate(frame, [F(PORTAL_AT.window), F(PORTAL_AT.window) + 16], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const active = [...TABS].reverse().find((t) => frame >= F(t.at));
  const line = interpolate(frame, [F(PORTAL_AT.devices), F(PORTAL_AT.account)], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  // Sparkline of check-ins (illustrative)
  const pts = [0.3, 0.42, 0.38, 0.55, 0.5, 0.66, 0.62, 0.78, 0.74, 0.9];
  const W = 420;
  const H = 120;
  const path = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i / (pts.length - 1)) * W} ${H - p * H}`)
    .join(" ");
  return (
    <div
      style={{
        position: "absolute",
        left: WIN.left,
        top: WIN.top,
        width: WIN.width,
        height: WIN.height,
        transform: `translateX(${(1 - fly) * 900}px) rotate(${(1 - fly) * 6}deg)`,
        opacity: fly,
      }}
    >
      <Panel style={{ width: "100%", height: "100%", padding: 0, overflow: "hidden" }} glow={ZW.cyan}>
        {/* title bar */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "0 26px",
            borderBottom: `2px solid ${ZW.line}`,
          }}
        >
          <Logo size={34} />
          <span style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 24, color: ZW.text }}>
            ZeroWrite.ai portal
          </span>
          <span style={{ marginLeft: "auto", fontFamily: ZW.mono, fontSize: 18, color: ZW.faint }}>
            one account
          </span>
        </div>
        <div style={{ display: "flex", height: WIN.height - 64 }}>
          {/* sidebar */}
          <div style={{ width: 230, padding: 22, borderRight: `2px solid ${ZW.line}` }}>
            {TABS.map((t) => {
              const on = active?.label === t.label;
              return (
                <div
                  key={t.label}
                  style={{
                    marginBottom: 12,
                    padding: "14px 18px",
                    borderRadius: 14,
                    fontFamily: ZW.sans,
                    fontWeight: 600,
                    fontSize: 24,
                    color: on ? ZW.ink : ZW.muted,
                    backgroundColor: on ? ZW.cyan : "transparent",
                    boxShadow: on ? `0 0 30px ${ZW.cyan}66` : "none",
                  }}
                >
                  {t.label}
                </div>
              );
            })}
          </div>
          {/* main */}
          <div style={{ flex: 1, padding: 28 }}>
            <div style={{ display: "flex", gap: 20 }}>
              {STATS.map((s) => {
                const p = interpolate(frame, [F(s.at), F(s.at) + 18], [0, 1], {
                  ...clamp,
                  easing: Easing.out(Easing.cubic),
                });
                return (
                  <div
                    key={s.label}
                    style={{
                      flex: 1,
                      padding: "18px 20px",
                      borderRadius: 18,
                      border: `2px solid ${p > 0 ? `${s.color}66` : ZW.line}`,
                      backgroundColor: `${s.color}${p > 0 ? "14" : "05"}`,
                      transform: `translateY(${(1 - p) * 24}px)`,
                      opacity: 0.35 + p * 0.65,
                    }}
                  >
                    <div style={{ fontFamily: ZW.mono, fontSize: 18, color: ZW.muted }}>{s.label.toUpperCase()}</div>
                    <div style={{ fontFamily: ZW.sans, fontWeight: 800, fontSize: 56, color: s.color }}>
                      {p > 0 ? `${s.prefix ?? ""}${Math.max(1, Math.round(s.value * p))}` : "–"}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 24, marginTop: 26 }}>
              {/* bar chart: devices per licence */}
              <div style={{ flex: 1, padding: 20, borderRadius: 18, border: `2px solid ${ZW.line}` }}>
                <div style={{ fontFamily: ZW.mono, fontSize: 17, color: ZW.faint }}>DEVICES PER LICENCE</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 26, height: 190, marginTop: 14 }}>
                  {BARS.map((b, i) => {
                    const g = interpolate(frame, [F(PORTAL_AT.devices) + i * 4, F(PORTAL_AT.devices) + 20 + i * 4], [0, 1], {
                      ...clamp,
                      easing: Easing.bezier(0.2, 1.3, 0.4, 1),
                    });
                    return (
                      <div key={i} style={{ flex: 1, textAlign: "center" }}>
                        <div
                          style={{
                            height: (b / 25) * 130 * g,
                            borderRadius: 10,
                            background: `linear-gradient(to top, ${ZW.cyanDeep}, ${ZW.cyan})`,
                            boxShadow: `0 0 24px ${ZW.cyan}44`,
                          }}
                        />
                        <div style={{ marginTop: 8, fontFamily: ZW.mono, fontSize: 15, color: ZW.muted }}>{BAR_NAMES[i]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* sparkline: check-ins */}
              <div style={{ width: 460, padding: 20, borderRadius: 18, border: `2px solid ${ZW.line}` }}>
                <div style={{ fontFamily: ZW.mono, fontSize: 17, color: ZW.faint }}>CHECK-INS</div>
                <svg width={W} height={H + 20} style={{ marginTop: 26, overflow: "visible" }}>
                  <path
                    d={path}
                    fill="none"
                    stroke={ZW.jade}
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - line}
                    style={{ filter: `drop-shadow(0 0 8px ${ZW.jade}aa)` }}
                  />
                </svg>
                <div style={{ marginTop: 18 }}>
                  <Pill text="policy set per licence" color={ZW.jade} size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
};

export const Portal: React.FC = () => {
  const { width, height } = useVideoConfig();
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-q]"), { y: 60, opacity: 0, duration: 0.7, ease: "power4.out" }, 0.15)
      .from(selector("[data-who] span"), { y: 30, opacity: 0, duration: 0.4, stagger: 0.18, ease: "power3.out" }, PORTAL_AT.clients)
      .from(selector("[data-one]"), { scale: 0.6, opacity: 0, duration: 0.5, ease: "back.out(2)" }, PORTAL_AT.account);
  });
  return (
    <AbsoluteFill ref={scope}>
      <div
        data-q
        style={{
          position: "absolute",
          left: 110,
          top: 200,
          width: 600,
          fontFamily: ZW.sans,
          fontWeight: 800,
          fontSize: 76,
          lineHeight: 1.04,
          letterSpacing: -2,
          color: ZW.text,
        }}
      >
        Many machines.
        <br />
        <span style={{ color: ZW.cyan }}>One account.</span>
      </div>
      <div data-who style={{ position: "absolute", left: 110, top: 420, display: "flex", gap: 14 }}>
        <span><Pill text="your business" color={ZW.cyanBright} size={22} /></span>
        <span><Pill text="your clients" color={ZW.cyanBright} size={22} /></span>
      </div>
      <div
        data-one
        style={{
          position: "absolute",
          left: 110,
          top: 520,
          fontFamily: ZW.mono,
          fontSize: 26,
          color: ZW.muted,
          lineHeight: 1.6,
        }}
      >
        licences · devices · policy
        <br />
        <span style={{ color: ZW.jade }}>managed in one place</span>
      </div>
      <AbsoluteFill>
        <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={200}>
          <AbsoluteFill>
            <PortalWindow />
          </AbsoluteFill>
        </HtmlInCanvasMotionBlur>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
