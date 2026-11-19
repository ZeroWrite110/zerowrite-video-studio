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
export const LEDGER_AT = {
  decide: 1.95,
  allow: 2.55,
  restore: 3.15,
  remove: 5.15, // "or delete it"
  fly: 5.5,
  land: 6.1,
  history: 7.3,
  trace: 8.6,
};
const F = (s: number) => Math.round(s * 30);

const CARD = { left: 170, top: 270, width: 720 };
const BTN_Y = CARD.top + 330;
const BTN_X = [CARD.left + 32, CARD.left + 262, CARD.left + 492];
const LEDGER = { left: 1010, top: 210, width: 760 };
const ROW_H = 92;

const BUTTONS: { label: string; color: string; at: number }[] = [
  { label: "Allow", color: ZW.jade, at: LEDGER_AT.allow },
  { label: "Restore", color: ZW.cyan, at: LEDGER_AT.restore },
  { label: "Delete", color: ZW.red, at: LEDGER_AT.remove },
];

const OLD_ROWS = [
  { time: "10:38:51", file: "setup_v2.1.4.exe", action: "Allowed", color: ZW.jade },
  { time: "10:31:07", file: "free_gpu_miner.exe", action: "Deleted", color: ZW.red },
  { time: "10:24:40", file: "quarterly_report.xlsm", action: "Restored", color: ZW.cyan },
  { time: "10:12:16", file: "svc_helper.dll", action: "Deleted", color: ZW.red },
];

const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  // hop from button to button as each action is named
  const stops = [
    { at: LEDGER_AT.decide, x: 1000, y: 820 },
    { at: LEDGER_AT.allow, x: BTN_X[0] + 120, y: BTN_Y + 44 },
    { at: LEDGER_AT.restore, x: BTN_X[1] + 120, y: BTN_Y + 44 },
    { at: LEDGER_AT.remove, x: BTN_X[2] + 120, y: BTN_Y + 44 },
  ];
  let x = stops[0].x;
  let y = stops[0].y;
  for (let i = 1; i < stops.length; i++) {
    const p = interpolate(frame, [F(stops[i].at) - 9, F(stops[i].at)], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.6, 0, 0.2, 1),
    });
    x = x + (stops[i].x - x) * p;
    y = y + (stops[i].y - y) * p;
  }
  const out = interpolate(frame, [F(LEDGER_AT.fly) + 4, F(LEDGER_AT.fly) + 14], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <svg
        width={44}
        height={56}
        viewBox="0 0 22 28"
        style={{ position: "absolute", left: x, top: y, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.6))" }}
      >
        <path d="M2 2 L2 22 L7.5 17 L11 25 L14.5 23.5 L11 15.8 L18.5 15.8 Z" fill="#fff" stroke="#05090B" strokeWidth={1.4} />
      </svg>
    </AbsoluteFill>
  );
};

// The decision record flies from the card into the top of the history.
const Flyer: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [F(LEDGER_AT.fly), F(LEDGER_AT.land)], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.7, 0, 0.2, 1),
  });
  if (p <= 0 || p >= 1) return null;
  const x0 = CARD.left + 40;
  const y0 = CARD.top + 110;
  const x1 = LEDGER.left + 24;
  const y1 = LEDGER.top + 104;
  const x = x0 + (x1 - x0) * p;
  const y = y0 + (y1 - y0) * p - Math.sin(p * Math.PI) * 160;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: LEDGER.width - 48,
          height: ROW_H - 14,
          borderRadius: 14,
          border: `2px solid ${ZW.red}`,
          backgroundColor: "rgba(240,62,77,0.16)",
          boxShadow: `0 0 40px ${ZW.red}66`,
          transform: `rotate(${Math.sin(p * Math.PI) * -6}deg) scale(${1 + Math.sin(p * Math.PI) * 0.06})`,
          display: "flex",
          alignItems: "center",
          padding: "0 22px",
          fontFamily: ZW.mono,
          fontSize: 24,
          color: ZW.text,
        }}
      >
        update_check.vbs · Deleted
      </div>
    </AbsoluteFill>
  );
};

const LedgerRow: React.FC<{
  time: string;
  file: string;
  action: string;
  color: string;
  highlight?: number;
}> = ({ time, file, action, color, highlight = 0 }) => (
  <div
    style={{
      height: ROW_H - 14,
      marginBottom: 14,
      borderRadius: 14,
      display: "flex",
      alignItems: "center",
      gap: 22,
      padding: "0 22px",
      backgroundColor: highlight > 0 ? `rgba(240,62,77,${0.16 * highlight})` : "rgba(255,255,255,0.03)",
      border: `2px solid ${highlight > 0 ? `${ZW.red}${Math.round(highlight * 200).toString(16).padStart(2, "0")}` : ZW.line}`,
    }}
  >
    <span style={{ fontFamily: ZW.mono, fontSize: 22, color: ZW.muted, width: 120 }}>{time}</span>
    <span style={{ fontFamily: ZW.mono, fontSize: 24, color: ZW.text, flex: 1 }}>{file}</span>
    <Pill text={action} color={color} size={19} />
  </div>
);

export const Ledger: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const landed = frame >= F(LEDGER_AT.land);
  const shift = interpolate(frame, [F(LEDGER_AT.land) - 6, F(LEDGER_AT.land) + 4], [0, ROW_H], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const newRowIn = interpolate(frame, [F(LEDGER_AT.land), F(LEDGER_AT.land) + 6], [0, 1], clamp);
  const trace = interpolate(frame, [F(LEDGER_AT.trace), F(LEDGER_AT.trace) + 18], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const cardGone = interpolate(frame, [F(LEDGER_AT.fly), F(LEDGER_AT.fly) + 8], [1, 0.25], clamp);
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-card]"), { y: 80, opacity: 0, duration: 0.6, ease: "power3.out" }, 0)
      .from(selector("[data-held]"), { scale: 0.5, opacity: 0, duration: 0.4, ease: "back.out(2.4)" }, 0.45)
      .from(selector("[data-btn]"), { y: 30, opacity: 0, duration: 0.35, stagger: 0.12, ease: "power3.out" }, LEDGER_AT.decide - 0.3)
      .from(selector("[data-ledger]"), { x: 160, opacity: 0, duration: 0.7, ease: "power3.out" }, 0.25)
      .from(selector("[data-local]"), { scale: 0.6, opacity: 0, duration: 0.4, ease: "back.out(2)" }, LEDGER_AT.history)
      .to(selector("[data-cam]"), { scale: 1.05, x: -20, duration: 10, ease: "none" }, 0);
  });
  return (
    <AbsoluteFill ref={scope}>
      <AbsoluteFill data-cam>
        <div
          style={{
            position: "absolute",
            top: 140,
            left: CARD.left,
            fontFamily: ZW.sans,
            fontWeight: 700,
            fontSize: 60,
            letterSpacing: -1,
            color: ZW.text,
          }}
        >
          A file is held. <span style={{ color: ZW.cyan }}>You decide.</span>
        </div>
        {/* Held-file card */}
        <div data-card style={{ position: "absolute", left: CARD.left, top: CARD.top, opacity: cardGone }}>
          <Panel style={{ width: CARD.width, padding: 32 }} glow={ZW.amber}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div
                style={{
                  width: 76,
                  height: 90,
                  borderRadius: 12,
                  border: `3px solid ${ZW.amber}`,
                  backgroundColor: `${ZW.amber}18`,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: ZW.mono,
                  fontWeight: 600,
                  fontSize: 22,
                  color: ZW.amber,
                }}
              >
                VBS
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: ZW.mono, fontSize: 30, color: ZW.text }}>update_check.vbs</div>
                <div style={{ fontFamily: ZW.mono, fontSize: 20, color: ZW.muted, marginTop: 6 }}>held before it could run</div>
              </div>
              <div data-held>
                <Pill text="Held" color={ZW.amber} />
              </div>
            </div>
            <div style={{ marginTop: 26, fontFamily: ZW.sans, fontSize: 26, color: ZW.muted, lineHeight: 1.5 }}>
              Waiting for your decision
            </div>
            <div style={{ height: 120 }} />
          </Panel>
        </div>
        {BUTTONS.map((b, i) => {
          const next = BUTTONS[i + 1]?.at;
          const hot =
            interpolate(frame, [F(b.at) - 2, F(b.at) + 4], [0, 1], clamp) *
            (next ? interpolate(frame, [F(next) - 4, F(next)], [1, 0], clamp) : 1);
          const pressed = i === 2 && frame >= F(LEDGER_AT.remove) + 3 && frame < F(LEDGER_AT.remove) + 9;
          return (
            <div
              key={b.label}
              data-btn
              style={{
                position: "absolute",
                left: BTN_X[i],
                top: BTN_Y,
                width: 200,
                height: 76,
                borderRadius: 16,
                display: "grid",
                placeItems: "center",
                fontFamily: ZW.sans,
                fontWeight: 700,
                fontSize: 30,
                color: hot > 0.5 ? ZW.ink : b.color,
                backgroundColor: hot > 0.5 ? b.color : `${b.color}1c`,
                border: `2px solid ${b.color}`,
                boxShadow: hot > 0.5 ? `0 0 34px ${b.color}88` : "none",
                transform: `scale(${pressed ? 0.94 : 1 + hot * 0.04})`,
                opacity: cardGone,
              }}
            >
              {b.label}
            </div>
          );
        })}
        {/* Local history */}
        <div data-ledger style={{ position: "absolute", left: LEDGER.left, top: LEDGER.top }}>
          <Panel style={{ width: LEDGER.width, padding: 24, height: 640, overflow: "hidden" }} glow={trace > 0 ? ZW.cyan : undefined}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, padding: "0 6px" }}>
              <span style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 34, color: ZW.text }}>Decision history</span>
              <div data-local>
                <Pill text="stored locally" color={ZW.cyan} size={19} />
              </div>
            </div>
            <div style={{ position: "relative" }}>
              {landed ? (
                <div style={{ position: "absolute", left: 0, right: 0, top: 0, opacity: newRowIn }}>
                  <LedgerRow
                    time="10:42:07"
                    file="update_check.vbs"
                    action="Deleted"
                    color={ZW.red}
                    highlight={interpolate(frame, [F(LEDGER_AT.land), F(LEDGER_AT.land) + 40], [1, 0.45], clamp)}
                  />
                </div>
              ) : null}
              <div style={{ transform: `translateY(${shift}px)` }}>
                {OLD_ROWS.map((r) => (
                  <LedgerRow key={r.file} {...r} />
                ))}
              </div>
            </div>
          </Panel>
        </div>
        {/* Trace: scan line down the history */}
        {trace > 0 && trace < 1 ? (
          <div
            style={{
              position: "absolute",
              left: LEDGER.left + 20,
              width: LEDGER.width - 40,
              top: LEDGER.top + 90 + trace * 520,
              height: 4,
              backgroundColor: ZW.cyanBright,
              boxShadow: `0 0 24px ${ZW.cyanBright}`,
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            left: LEDGER.left,
            top: LEDGER.top + 660,
            fontFamily: ZW.mono,
            fontSize: 24,
            color: ZW.cyan,
            opacity: interpolate(frame, [F(LEDGER_AT.trace), F(LEDGER_AT.trace) + 8], [0, 1], clamp),
          }}
        >
          every decision can be traced
        </div>
        <AbsoluteFill>
          <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={220}>
            <AbsoluteFill>
              <Flyer />
              <Cursor />
            </AbsoluteFill>
          </HtmlInCanvasMotionBlur>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
