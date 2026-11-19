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

// Seconds (scene time) matched to the voice line (voice starts at ~0.27 s).
export const POLICY_AT = {
  open: 0.2, // "Open the policy"
  sensitivity: 1.5, // "sensitivity"
  quarantine: 2.5, // "auto quarantine"
  drives: 3.6, // "drive scanning"
  licence: 4.65, // "once per licence"
  save: 5.4, // "Policy is set once"
  fleet: 6.8, // "for the whole fleet"
};
const F = (s: number) => Math.round(s * 30);

const CARD = { left: 150, top: 200, width: 760 };

const Toggle: React.FC<{ on: number; color: string }> = ({ on, color }) => (
  <div
    style={{
      width: 92,
      height: 50,
      borderRadius: 50,
      backgroundColor: on > 0.5 ? color : "#22303a",
      boxShadow: on > 0.5 ? `0 0 26px ${color}88` : "none",
      position: "relative",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 5,
        left: 5 + on * 42,
        width: 40,
        height: 40,
        borderRadius: 40,
        backgroundColor: "#fff",
      }}
    />
  </div>
);

const Row: React.FC<{ label: string; sub: string; children: React.ReactNode; lit: number }> = ({
  label,
  sub,
  children,
  lit,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      padding: "22px 26px",
      borderRadius: 18,
      marginTop: 16,
      border: `2px solid ${lit > 0 ? `${ZW.cyan}66` : ZW.line}`,
      backgroundColor: lit > 0 ? `${ZW.cyan}10` : "transparent",
    }}
  >
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 32, color: ZW.text }}>{label}</div>
      <div style={{ fontFamily: ZW.mono, fontSize: 18, color: ZW.faint, marginTop: 4 }}>{sub}</div>
    </div>
    {children}
  </div>
);

// Policy packets shoot from the saved card to the right edge (the fleet).
const Cascade: React.FC = () => {
  const frame = useCurrentFrame();
  const start = F(POLICY_AT.save) + 6;
  const items = [];
  for (let i = 0; i < 9; i++) {
    const t0 = start + i * 3;
    const p = interpolate(frame, [t0, t0 + 18], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
    if (p <= 0 || p >= 1) continue;
    const y = 650 + i * 22;
    const x = interpolate(p, [0, 1], [CARD.left + CARD.width, 2000]);
    items.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: 120,
          height: 10,
          borderRadius: 10,
          background: `linear-gradient(90deg, transparent, ${ZW.jade})`,
          boxShadow: `0 0 16px ${ZW.jade}`,
        }}
      />,
    );
  }
  return <>{items}</>;
};

export const Policy: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const sens = interpolate(frame, [F(POLICY_AT.sensitivity), F(POLICY_AT.sensitivity) + 16], [0.25, 0.75], {
    ...clamp,
    easing: Easing.bezier(0.6, 0, 0.2, 1),
  });
  const q = interpolate(frame, [F(POLICY_AT.quarantine), F(POLICY_AT.quarantine) + 6], [0, 1], clamp);
  const d = interpolate(frame, [F(POLICY_AT.drives), F(POLICY_AT.drives) + 6], [0, 1], clamp);
  const saved = frame >= F(POLICY_AT.save);
  const pressed = frame >= F(POLICY_AT.save) && frame < F(POLICY_AT.save) + 5;
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-card]"), { y: 120, rotateX: 25, opacity: 0, duration: 0.7, ease: "power4.out" }, POLICY_AT.open)
      .from(selector("[data-licence]"), { x: 40, opacity: 0, duration: 0.45, ease: "power3.out" }, POLICY_AT.licence)
      .from(selector("[data-once] span"), { y: 80, opacity: 0, duration: 0.55, stagger: 0.12, ease: "power4.out" }, POLICY_AT.save)
      .from(selector("[data-fleet]"), { scale: 0.5, opacity: 0, duration: 0.5, ease: "back.out(2)" }, POLICY_AT.fleet);
  });
  return (
    <AbsoluteFill ref={scope} style={{ perspective: 1400 }}>
      <div data-card style={{ position: "absolute", left: CARD.left, top: CARD.top, width: CARD.width }}>
        <Panel glow={saved ? ZW.jade : ZW.cyan} style={{ padding: 30 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ fontFamily: ZW.mono, fontSize: 20, color: ZW.muted }}>POLICY · LICENCE A</div>
            <div data-licence style={{ marginLeft: "auto" }}>
              <Pill text="once per licence" color={ZW.cyanBright} size={18} />
            </div>
          </div>
          <Row label="Sensitivity" sub="how strict the verdicts are" lit={frame >= F(POLICY_AT.sensitivity) ? 1 : 0}>
            <div style={{ width: 230, position: "relative", height: 50 }}>
              <div style={{ position: "absolute", top: 21, left: 0, right: 0, height: 8, borderRadius: 8, backgroundColor: "#22303a" }} />
              <div
                style={{
                  position: "absolute",
                  top: 21,
                  left: 0,
                  width: `${sens * 100}%`,
                  height: 8,
                  borderRadius: 8,
                  backgroundColor: ZW.cyan,
                  boxShadow: `0 0 14px ${ZW.cyan}`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 7,
                  left: `calc(${sens * 100}% - 18px)`,
                  width: 36,
                  height: 36,
                  borderRadius: 36,
                  backgroundColor: "#fff",
                  boxShadow: `0 0 20px ${ZW.cyan}`,
                }}
              />
            </div>
          </Row>
          <Row label="Auto-quarantine" sub="hold dangerous files automatically" lit={q}>
            <Toggle on={q} color={ZW.cyan} />
          </Row>
          <Row label="Drive scanning" sub="scan USB drives on connect" lit={d}>
            <Toggle on={d} color={ZW.cyan} />
          </Row>
          <div
            style={{
              marginTop: 26,
              height: 74,
              borderRadius: 16,
              display: "grid",
              placeItems: "center",
              fontFamily: ZW.sans,
              fontWeight: 700,
              fontSize: 30,
              color: saved ? ZW.ink : ZW.jade,
              backgroundColor: saved ? ZW.jade : `${ZW.jade}1a`,
              border: `2px solid ${ZW.jade}`,
              boxShadow: saved ? `0 0 34px ${ZW.jade}88` : "none",
              transform: `scale(${pressed ? 0.95 : 1})`,
            }}
          >
            {saved ? "Saved · policy rev 4" : "Save policy"}
          </div>
        </Panel>
      </div>
      <div
        data-once
        style={{
          position: "absolute",
          left: 1060,
          top: 330,
          fontFamily: ZW.sans,
          fontWeight: 800,
          fontSize: 92,
          lineHeight: 1.02,
          letterSpacing: -2.5,
          color: ZW.text,
        }}
      >
        <span style={{ display: "inline-block" }}>Set once.</span>
        <br />
        <span style={{ display: "inline-block", color: ZW.jade }}>Whole fleet.</span>
      </div>
      <div data-fleet style={{ position: "absolute", left: 1064, top: 560 }}>
        <Pill text="every machine in the licence" color={ZW.jade} size={24} />
      </div>
      <AbsoluteFill>
        <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={240}>
          <AbsoluteFill>
            <Cascade />
          </AbsoluteFill>
        </HtmlInCanvasMotionBlur>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
