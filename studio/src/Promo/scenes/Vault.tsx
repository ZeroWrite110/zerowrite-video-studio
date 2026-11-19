import { useGsapTimeline } from "@remotion/gsap";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Pill, ZW } from "../components/ui";
import { Vault3D } from "../components/Vault3D";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Seconds (scene time) matched to the voice line.
export const VAULT_AT = {
  records: [0.65, 1.65, 2.2, 2.75], // "Every action is written to a local event history."
  stays: 3.75, // "That history stays on your machine."
  switchable: 5.05, // "And every part of this is switchable."
};
const F = (s: number) => Math.round(s * 30);

// Illustrative entries; the four actions are the ones the website docs list.
const EVENTS = [
  { time: "09:14", action: "Allowed", file: "setup_tool.exe", color: ZW.jade },
  { time: "10:02", action: "Quarantined", file: "invoice_0423.exe", color: ZW.amber },
  { time: "11:37", action: "Deleted", file: "macro_update.vbs", color: ZW.red },
  { time: "13:05", action: "Restored", file: "report_tool.exe", color: ZW.cyan },
];
const SWITCHES = ["Send blocked programs for checking", "Ask before sending documents", "Telemetry"];

// Settings start in a mixed state; at "switchable" the first one is turned off by the user.
const SWITCH_START = [true, true, false];
const Toggle: React.FC<{ initial: boolean; flipAt?: number }> = ({ initial, flipAt }) => {
  const frame = useCurrentFrame();
  const flip = flipAt === undefined ? 0 : interpolate(frame, [flipAt, flipAt + 8], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const on = initial ? 1 - flip : flip;
  return (
    <div
      style={{
        width: 78,
        height: 40,
        borderRadius: 20,
        backgroundColor: on > 0.5 ? ZW.cyan : ZW.line,
        position: "relative",
        flex: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 5,
          left: 5 + on * 38,
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: on > 0.5 ? ZW.ink : ZW.text,
        }}
      />
    </div>
  );
};

export const Vault: React.FC = () => {
  const frame = useCurrentFrame();
  const stays = interpolate(frame, [F(VAULT_AT.stays), F(VAULT_AT.stays) + 12], [0, 1], clamp);
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline.from(selector("[data-title]"), { y: 40, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.1);
    VAULT_AT.records.forEach((at, i) => {
      timeline.from(selector(`[data-event="${i}"]`), { x: 120, opacity: 0, duration: 0.4, ease: "power3.out" }, at - 0.1);
    });
    timeline
      .from(selector("[data-stays]"), { y: 30, opacity: 0, scale: 0.8, duration: 0.45, ease: "back.out(2)" }, VAULT_AT.stays)
      .from(selector("[data-switches]"), { y: 60, opacity: 0, rotateX: 30, duration: 0.6, ease: "power3.out" }, VAULT_AT.switchable - 0.2);
  });
  return (
    <AbsoluteFill ref={scope} style={{ perspective: 1600 }}>
      <Vault3D recordAt={VAULT_AT.records.map(F)} lockAt={F(VAULT_AT.stays)} />
      <div
        data-title
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 110,
          textAlign: "center",
          fontFamily: ZW.sans,
          fontWeight: 800,
          fontSize: 62,
          letterSpacing: -1.5,
          color: ZW.text,
        }}
      >
        Your history <span style={{ color: ZW.cyan }}>stays on your machine.</span>
      </div>
      <div data-stays style={{ position: "absolute", left: 250, top: 875, width: 520, textAlign: "center", opacity: stays }}>
        <Pill text="Local only · this PC" color={ZW.cyan} size={24} />
      </div>
      {/* event history panel */}
      <div
        style={{
          position: "absolute",
          left: 900,
          top: 250,
          width: 860,
          borderRadius: 24,
          border: `2px solid ${ZW.line}`,
          backgroundColor: "rgba(14,21,24,0.94)",
          boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
          padding: "24px 30px",
        }}
      >
        <div style={{ fontFamily: ZW.mono, fontSize: 22, color: ZW.muted, marginBottom: 14 }}>Event history · on this PC</div>
        {EVENTS.map((e, i) => (
          <div
            key={e.file}
            data-event={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "12px 0",
              borderTop: i ? `1px solid ${ZW.line}` : undefined,
              fontFamily: ZW.mono,
              fontSize: 24,
              color: ZW.text,
            }}
          >
            <span style={{ color: ZW.muted, width: 80 }}>{e.time}</span>
            <span style={{ width: 230 }}>
              <Pill text={e.action} color={e.color} size={18} />
            </span>
            <span>{e.file}</span>
          </div>
        ))}
      </div>
      {/* switches */}
      <div
        data-switches
        style={{
          position: "absolute",
          left: 900,
          top: 640,
          width: 860,
          borderRadius: 24,
          border: `2px solid ${ZW.cyan}66`,
          backgroundColor: "rgba(14,21,24,0.94)",
          padding: "20px 30px",
        }}
      >
        {SWITCHES.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", fontFamily: ZW.sans, fontWeight: 600, fontSize: 28, color: ZW.text }}>
            <span>{s}</span>
            <Toggle initial={SWITCH_START[i]} flipAt={i === 0 ? F(VAULT_AT.switchable + 1.0) : undefined} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
