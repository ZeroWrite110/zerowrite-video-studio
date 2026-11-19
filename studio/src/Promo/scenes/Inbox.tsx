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
export const INBOX_AT = {
  held: 1.3, // "a file is held"
  machine: 2.6, // "from the machine"
  portal: 3.45, // "or from the portal"
  allow: 3.87,
  restore: 4.48,
  remove: 5, // "or delete"
  record: 6.4, // "on the record"
};
const F = (s: number) => Math.round(s * 30);

// Illustrative held files on different machines (not real data).
const ROWS = [
  { file: "setup_x64.exe", machine: "LAPTOP-11", risk: "Low", riskColor: ZW.jade, action: "Allowed", color: ZW.jade, at: INBOX_AT.allow, via: "via portal" },
  { file: "report_q3.xlsm", machine: "SALES-04", risk: "Medium", riskColor: ZW.amber, action: "Restored", color: ZW.cyan, at: INBOX_AT.restore, via: "via machine" },
  { file: "invoice_0423.exe", machine: "FRONTDESK-02", risk: "Critical", riskColor: ZW.red, action: "Deleted", color: ZW.red, at: INBOX_AT.remove, via: "via portal" },
];
const TABLE = { left: 130, top: 330, width: 1100 };
const ROW_H = 104;

// Decision chips that fly from each row into the record.
const Flyers: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {ROWS.map((r, i) => {
        const p = interpolate(frame, [F(r.at) + 4, F(r.at) + 18], [0, 1], {
          ...clamp,
          easing: Easing.bezier(0.7, 0, 0.3, 1),
        });
        if (p <= 0 || p >= 1) return null;
        const x0 = TABLE.left + TABLE.width - 210;
        const y0 = TABLE.top + 90 + i * ROW_H + 30;
        const x1 = 1350;
        const y1 = 340 + i * 92;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: interpolate(p, [0, 1], [x0, x1]),
              top: interpolate(p, [0, 1], [y0, y1]) - Math.sin(p * Math.PI) * 80,
            }}
          >
            <Pill text={r.action} color={r.color} size={22} />
          </div>
        );
      })}
    </>
  );
};

export const Inbox: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const where = frame >= F(INBOX_AT.portal) ? "portal" : frame >= F(INBOX_AT.machine) ? "machine" : null;
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-head]"), { y: -50, opacity: 0, duration: 0.5, ease: "power3.out" }, 0.1)
      .from(selector("[data-row]"), { x: -140, opacity: 0, duration: 0.45, stagger: 0.12, ease: "power3.out" }, INBOX_AT.held - 0.3)
      .from(selector("[data-where]"), { scale: 0.6, opacity: 0, duration: 0.4, ease: "back.out(2)" }, INBOX_AT.machine)
      .from(selector("[data-log]"), { x: 160, opacity: 0, duration: 0.6, ease: "power4.out" }, INBOX_AT.allow - 0.6)
      .from(selector("[data-onrecord]"), { y: 40, opacity: 0, duration: 0.5, ease: "power3.out" }, INBOX_AT.record);
  });
  return (
    <AbsoluteFill ref={scope}>
      <div
        data-head
        style={{
          position: "absolute",
          left: TABLE.left,
          top: 170,
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        <span style={{ fontFamily: ZW.sans, fontWeight: 800, fontSize: 64, letterSpacing: -1.5, color: ZW.text }}>
          Held files
        </span>
        <span data-where>
          {where ? (
            <Pill text={`decide from the ${where}`} color={where === "portal" ? ZW.cyan : ZW.cyanBright} size={24} />
          ) : null}
        </span>
      </div>
      <div style={{ position: "absolute", left: TABLE.left, top: TABLE.top, width: TABLE.width }}>
        <Panel style={{ padding: "18px 28px" }}>
          <div style={{ display: "flex", fontFamily: ZW.mono, fontSize: 18, color: ZW.faint, padding: "8px 0 14px" }}>
            <span style={{ width: 360 }}>FILE</span>
            <span style={{ width: 250 }}>MACHINE</span>
            <span style={{ width: 200 }}>RISK</span>
            <span>DECISION</span>
          </div>
          {ROWS.map((r) => {
            const done = frame >= F(r.at) + 4;
            const flash = interpolate(frame, [F(r.at), F(r.at) + 4, F(r.at) + 16], [0, 1, 0], clamp);
            return (
              <div
                data-row
                key={r.file}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: ROW_H,
                  borderTop: `2px solid ${ZW.line}`,
                  backgroundColor: `rgba(34,211,238,${0.12 * flash})`,
                }}
              >
                <span style={{ width: 360, fontFamily: ZW.mono, fontSize: 26, color: ZW.text }}>{r.file}</span>
                <span style={{ width: 250, fontFamily: ZW.mono, fontSize: 22, color: ZW.muted }}>{r.machine}</span>
                <span style={{ width: 200 }}>
                  <Pill text={r.risk} color={r.riskColor} size={18} />
                </span>
                <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {done ? (
                    <span style={{ fontFamily: ZW.mono, fontSize: 22, color: r.color }}>{r.action.toLowerCase()} →</span>
                  ) : (
                    <Pill text="Held" color={ZW.amber} size={18} />
                  )}
                </span>
              </div>
            );
          })}
        </Panel>
      </div>
      <div data-log style={{ position: "absolute", left: 1320, top: 250, width: 480 }}>
        <Panel glow={ZW.cyan} style={{ padding: 26, height: 520 }}>
          <div style={{ fontFamily: ZW.mono, fontSize: 20, color: ZW.muted }}>DECISION RECORD</div>
          {ROWS.map((r, i) => {
            const landed = frame >= F(r.at) + 18;
            return (
              <div
                key={r.file}
                style={{
                  marginTop: 22,
                  height: 70,
                  borderRadius: 14,
                  border: `2px dashed ${landed ? `${r.color}88` : ZW.line}`,
                  backgroundColor: landed ? `${r.color}12` : "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "0 16px",
                  opacity: landed ? 1 : 0.5,
                }}
              >
                {landed ? (
                  <>
                    <Pill text={r.action} color={r.color} size={18} />
                    <span style={{ fontFamily: ZW.mono, fontSize: 17, color: ZW.text }}>{r.machine}</span>
                    <span style={{ marginLeft: "auto", fontFamily: ZW.mono, fontSize: 15, color: ZW.faint }}>{r.via}</span>
                  </>
                ) : (
                  <span style={{ fontFamily: ZW.mono, fontSize: 16, color: ZW.faint }}>waiting · {i + 1}</span>
                )}
              </div>
            );
          })}
          <div data-onrecord style={{ marginTop: 34 }}>
            <Pill text="every decision on the record" color={ZW.jade} size={20} />
          </div>
        </Panel>
      </div>
      <AbsoluteFill>
        <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={220}>
          <AbsoluteFill>
            <Flyers />
          </AbsoluteFill>
        </HtmlInCanvasMotionBlur>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
