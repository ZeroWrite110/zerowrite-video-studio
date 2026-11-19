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
export const TAMPER_AT = {
  click: 1.75, // "...protection off?"
  cmd1: 2.5,
  denied1: 3.35, // "standard users cannot"
  denied2: 4.9, // "change the agent's files"
  lock: 3.6,
  admin: 6.2, // "Only an admin"
  portal: 7.1, // "or the portal"
};
const F = (s: number) => Math.round(s * 30);

const PANEL = { left: 250, top: 230, width: 700 };
const TOGGLE = { x: PANEL.left + PANEL.width - 150, y: PANEL.top + 72 };

const Toggle: React.FC<{ shake: number }> = ({ shake }) => (
  <div
    style={{
      width: 112,
      height: 58,
      borderRadius: 58,
      backgroundColor: ZW.cyan,
      boxShadow: `0 0 28px ${ZW.cyan}88`,
      position: "relative",
      transform: `translateX(${shake}px)`,
    }}
  >
    <div
      style={{
        position: "absolute",
        right: 6,
        top: 6,
        width: 46,
        height: 46,
        borderRadius: 46,
        backgroundColor: "#fff",
      }}
    />
  </div>
);

const Row: React.FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 0",
      borderTop: `1px solid ${ZW.line}`,
      fontFamily: ZW.sans,
      fontSize: 28,
      color: ZW.text,
    }}
  >
    <span>{label}</span>
    <span style={{ fontFamily: ZW.mono, fontSize: 22, color: ZW.jade }}>ON</span>
  </div>
);

// Standard user's cursor: drifts in and clicks the master toggle.
const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  const move = interpolate(frame, [F(0.6), F(TAMPER_AT.click) - 2], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.6, 0, 0.2, 1),
  });
  const x = interpolate(move, [0, 1], [80, TOGGLE.x + 60]);
  const y = interpolate(move, [0, 1], [900, TOGGLE.y + 34]);
  const out = interpolate(frame, [F(TAMPER_AT.lock) - 4, F(TAMPER_AT.lock) + 6], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: "absolute", left: x, top: y }}>
        <svg width={44} height={56} viewBox="0 0 22 28" style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.6))" }}>
          <path d="M2 2 L2 22 L7.5 17 L11 25 L14.5 23.5 L11 15.8 L18.5 15.8 Z" fill="#fff" stroke="#05090B" strokeWidth={1.4} />
        </svg>
        <div
          style={{
            marginTop: 2,
            marginLeft: 26,
            fontFamily: ZW.mono,
            fontSize: 18,
            color: ZW.muted,
            backgroundColor: "rgba(5,9,11,0.85)",
            border: `1px solid ${ZW.line}`,
            borderRadius: 6,
            padding: "3px 8px",
            whiteSpace: "nowrap",
          }}
        >
          standard user
        </div>
      </div>
    </AbsoluteFill>
  );
};

// The padlock that slams onto the panel.
const Padlock: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [F(TAMPER_AT.lock), F(TAMPER_AT.lock) + 7], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  if (p <= 0) return null;
  const scale = interpolate(p, [0, 1], [3.2, 1]);
  const y = interpolate(p, [0, 1], [-420, 0]);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 690,
          top: 236 + y,
          width: 90,
          height: 103,
          transform: `scale(${scale})`,
          opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
        }}
      >
        <svg width={90} height={103} viewBox="0 0 70 80">
          <path d="M18 36 V24 a17 17 0 0 1 34 0 V36" fill="none" stroke={ZW.amber} strokeWidth={7} />
          <rect x={8} y={34} width={54} height={42} rx={8} fill="#1d1608" stroke={ZW.amber} strokeWidth={4} />
          <circle cx={35} cy={52} r={5} fill={ZW.amber} />
          <rect x={33} y={54} width={4} height={11} rx={2} fill={ZW.amber} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

const TERM_LINES: { at: number; text: string; color: string }[] = [
  { at: TAMPER_AT.cmd1, text: "> Stop-Service ZeroWrite", color: ZW.text },
  { at: TAMPER_AT.denied1, text: "Access is denied.", color: ZW.red },
  { at: TAMPER_AT.denied1 + 0.35, text: '> del "C:\\ProgramData\\ZeroWrite\\*"', color: ZW.text },
  { at: TAMPER_AT.denied2, text: "Access is denied.", color: ZW.red },
];

const Terminal: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Panel style={{ width: 760, padding: 0, overflow: "hidden" }} glow={frame >= F(TAMPER_AT.denied1) ? ZW.red : undefined}>
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "16px 22px",
          borderBottom: `1px solid ${ZW.line}`,
          alignItems: "center",
        }}
      >
        {[ZW.red, ZW.amber, ZW.jade].map((c) => (
          <div key={c} style={{ width: 14, height: 14, borderRadius: 14, backgroundColor: c, opacity: 0.7 }} />
        ))}
        <span style={{ marginLeft: 14, fontFamily: ZW.mono, fontSize: 20, color: ZW.muted }}>
          script.ps1 · running as standard user
        </span>
      </div>
      <div style={{ padding: "22px 26px", minHeight: 230 }}>
        {TERM_LINES.map((l, i) => {
          const start = F(l.at);
          const typed = l.color === ZW.red ? l.text.length : Math.floor(interpolate(frame, [start, start + 12], [0, l.text.length], clamp));
          if (frame < start) return null;
          return (
            <div key={i} style={{ fontFamily: ZW.mono, fontSize: 26, lineHeight: 1.7, color: l.color }}>
              {l.text.slice(0, typed)}
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

export const Tamper: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const clickF = F(TAMPER_AT.click);
  const shake = frame >= clickF && frame < clickF + 12 ? Math.sin((frame - clickF) * 2.2) * 12 * (1 - (frame - clickF) / 12) : 0;
  const locked = frame >= F(TAMPER_AT.lock) + 7;
  const impact = interpolate(frame, [F(TAMPER_AT.lock) + 7, F(TAMPER_AT.lock) + 16], [1, 0], clamp);
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-title]"), { y: -40, opacity: 0, duration: 0.5, ease: "power3.out" }, 0)
      .from(selector("[data-panel]"), { x: -120, opacity: 0, rotationY: 18, duration: 0.7, ease: "power3.out" }, 0.1)
      .from(selector("[data-term]"), { x: 140, opacity: 0, duration: 0.6, ease: "power3.out" }, TAMPER_AT.cmd1 - 0.45)
      .from(selector("[data-denied]"), { scale: 0.6, opacity: 0, duration: 0.35, ease: "back.out(2.2)" }, TAMPER_AT.lock + 0.25)
      .from(selector("[data-admin]"), { y: 50, opacity: 0, duration: 0.45, ease: "power3.out" }, TAMPER_AT.admin)
      .from(selector("[data-portal]"), { y: 50, opacity: 0, duration: 0.45, ease: "power3.out" }, TAMPER_AT.portal)
      .to(selector("[data-cam]"), { scale: 1.06, duration: 10, ease: "none" }, 0);
  });
  return (
    <AbsoluteFill ref={scope}>
      <AbsoluteFill data-cam style={{ transform: `translate(${Math.sin(frame * 2.1) * 10 * impact}px, ${Math.cos(frame * 1.7) * 8 * impact}px)` }}>
        <div
          data-title
          style={{
            position: "absolute",
            top: 120,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: ZW.sans,
            fontWeight: 700,
            fontSize: 64,
            letterSpacing: -1,
            color: ZW.text,
          }}
        >
          Who can turn your protection <span style={{ color: ZW.amber }}>off</span>?
        </div>
        <div data-panel style={{ position: "absolute", left: PANEL.left, top: PANEL.top }}>
          <Panel style={{ width: PANEL.width, padding: 30 }} glow={locked ? ZW.amber : ZW.cyan}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Logo size={58} />
                <div>
                  <div style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 34, color: ZW.text }}>Protection</div>
                  <div style={{ fontFamily: ZW.mono, fontSize: 20, color: ZW.muted }}>ZeroWrite agent</div>
                </div>
              </div>
              <Toggle shake={shake} />
            </div>
            <Row label="Pre-execution hold" />
            <Row label="Auto-quarantine" />
            <Row label="Removable drive scanning" />
            <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 8 }}>
              <div data-denied>
                <Pill text="change denied · admin approval required" color={ZW.amber} size={22} />
              </div>
            </div>
          </Panel>
        </div>
        <div data-term style={{ position: "absolute", left: 1010, top: 260 }}>
          <Terminal />
        </div>
        {/* Who can lower protection */}
        <div style={{ position: "absolute", left: 1010, top: 650, display: "flex", gap: 26, alignItems: "center" }}>
          <div data-admin>
            <Panel style={{ padding: "18px 26px", display: "flex", alignItems: "center", gap: 14 }} glow={ZW.jade}>
              <svg width={40} height={40} viewBox="0 0 24 24">
                <circle cx={8} cy={12} r={5} fill="none" stroke={ZW.jade} strokeWidth={2.4} />
                <path d="M13 12 H22 M18 12 V16 M21 12 V15" stroke={ZW.jade} strokeWidth={2.4} strokeLinecap="round" />
              </svg>
              <span style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 32, color: ZW.text }}>Admin</span>
            </Panel>
          </div>
          <span data-portal style={{ fontFamily: ZW.sans, fontSize: 30, color: ZW.muted }}>or</span>
          <div data-portal>
            <Panel style={{ padding: "18px 26px", display: "flex", alignItems: "center", gap: 14 }} glow={ZW.cyan}>
              <Logo size={40} />
              <span style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 32, color: ZW.text }}>Portal</span>
            </Panel>
          </div>
        </div>
        <div data-portal style={{ position: "absolute", left: 1010, top: 770, fontFamily: ZW.mono, fontSize: 24, color: ZW.jade }}>
          can lower protection
        </div>
        {/* positioned layer so blurred elements paint above the absolute panels */}
        <AbsoluteFill>
          <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={220}>
            <AbsoluteFill>
              <Padlock />
              <Cursor />
            </AbsoluteFill>
          </HtmlInCanvasMotionBlur>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
