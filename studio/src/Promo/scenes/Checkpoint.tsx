import { useGsapTimeline } from "@remotion/gsap";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Checkpoint3D } from "../components/Checkpoint3D";
import { Panel, Pill, ZW } from "../components/ui";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Seconds (scene time) matched to the voice line (voice starts at ~0.27 s).
export const CHECKPOINT_AT = {
  memory: 3.0, // "already in memory."
  gate: 3.7, // "Pre-execution protection"
  arrive: [6.5, 7.1, 8.0], // "program," "script," "injected payload"
  flare: 9.1, // "at a checkpoint"
  moment: 10.1, // "the moment it arrives."
};
const F = (s: number) => Math.round(s * 30);
const LABELS = ["Program", "Script", "Injected payload"];

// No canvas motion blur in this scene: it has a ThreeCanvas.
export const Checkpoint: React.FC = () => {
  const frame = useCurrentFrame();
  const usual = interpolate(frame, [F(CHECKPOINT_AT.gate) - 8, F(CHECKPOINT_AT.gate) + 4], [1, 0], clamp);
  const memHit = frame >= F(CHECKPOINT_AT.memory) - 6 && usual > 0;
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-usual]"), { x: -80, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.1)
      .from(selector("[data-pre]"), { x: -80, opacity: 0, duration: 0.6, ease: "power3.out" }, CHECKPOINT_AT.gate)
      .from(selector("[data-queue]"), { x: 120, opacity: 0, duration: 0.6, ease: "power3.out" }, CHECKPOINT_AT.arrive[0] - 0.5);
    CHECKPOINT_AT.arrive.forEach((a, i) => {
      timeline.from(selector(`[data-row="${i}"]`), { x: 80, opacity: 0, duration: 0.35, ease: "back.out(2)" }, a - 0.1);
    });
    timeline.from(selector("[data-moment]"), { y: 40, opacity: 0, duration: 0.45, ease: "power3.out" }, CHECKPOINT_AT.moment - 0.2);
  });
  return (
    <AbsoluteFill ref={scope}>
      <Checkpoint3D
        at={{
          early: [F(0.2), F(CHECKPOINT_AT.memory)],
          gate: F(CHECKPOINT_AT.gate),
          arrive: CHECKPOINT_AT.arrive.map(F),
          flare: F(CHECKPOINT_AT.flare),
        }}
      />
      {/* Top-left statement swaps from "usually" to "pre-execution" */}
      <div style={{ position: "absolute", left: 90, top: 150 }}>
        <div data-usual style={{ position: "absolute" }}><div style={{ opacity: usual, whiteSpace: "nowrap" }}>
          <Pill text="Usually" color={memHit ? ZW.red : ZW.muted} size={22} />
          <div style={{ marginTop: 18, fontFamily: ZW.sans, fontWeight: 800, fontSize: 64, color: ZW.text, letterSpacing: -1.5 }}>
            Acts once code is <span style={{ color: memHit ? ZW.red : ZW.text }}>in memory</span>
          </div>
        </div></div>
        <div data-pre style={{ position: "absolute" }}><div style={{ opacity: 1 - usual, whiteSpace: "nowrap" }}>
          <Pill text="Pre-execution" color={ZW.cyan} size={22} />
          <div style={{ marginTop: 18, fontFamily: ZW.sans, fontWeight: 800, fontSize: 64, color: ZW.text, letterSpacing: -1.5 }}>
            Held at a <span style={{ color: ZW.cyan }}>checkpoint</span>
          </div>
        </div></div>
      </div>
      {/* Queue legend on the right */}
      <div data-queue style={{ position: "absolute", right: 90, top: 300 }}>
        <Panel style={{ width: 470, padding: 26 }} glow={ZW.amber}>
          <div style={{ fontFamily: ZW.mono, fontSize: 22, color: ZW.muted, letterSpacing: 1.5, marginBottom: 16 }}>
            WAITING FOR A VERDICT
          </div>
          {LABELS.map((l, i) => (
            <div
              key={l}
              data-row={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 0",
                borderTop: i ? `1px solid ${ZW.line}` : undefined,
              }}
            >
              <span style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 32, color: ZW.text }}>{l}</span>
              <Pill text="Held" color={ZW.amber} size={18} />
            </div>
          ))}
        </Panel>
      </div>
      <div
        data-moment
        style={{
          position: "absolute",
          right: 90,
          top: 660,
          width: 470,
          textAlign: "right",
          fontFamily: ZW.mono,
          fontSize: 26,
          color: ZW.cyanBright,
        }}
      >
        held the moment it arrives
      </div>
    </AbsoluteFill>
  );
};
