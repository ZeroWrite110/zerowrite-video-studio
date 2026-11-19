import { useGsapTimeline } from "@remotion/gsap";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Panel, Pill, ZW } from "../components/ui";
import { VARIANT_COUNT, Variants3D } from "../components/Variants3D";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Seconds (scene time) matched to the voice line.
export const VARIANTS_AT = {
  rebuild: 1.85, // "They rebuild the same malware again and again"
  gap: 0.12, // seconds between copies
  looksNew: 4.9, // "so every copy looks new to the list."
};
const F = (s: number) => Math.round(s * 30);

const HEX = "0123456789abcdef";
const hashOf = (i: number) => {
  let h = "";
  for (let k = 0; k < 16; k++) h += HEX[(i * 13 + k * 7 + k * k * (i + 3)) % 16];
  return `${h.slice(0, 4)} ${h.slice(4, 8)} ${h.slice(8, 12)} ${h.slice(12)}`;
};

export const Variants: React.FC = () => {
  const frame = useCurrentFrame();
  const made = Math.max(
    0,
    Math.min(VARIANT_COUNT, Math.floor((frame - F(VARIANTS_AT.rebuild)) / (VARIANTS_AT.gap * 30)) + 1),
  );
  const rows = Array.from({ length: Math.min(made, 6) }).map((_, k) => made - 1 - k);
  const looksNew = frame >= F(VARIANTS_AT.looksNew);
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-title]"), { y: 40, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.1)
      .from(selector("[data-list]"), { x: -180, opacity: 0, rotateY: 25, duration: 0.7, ease: "power3.out" }, 0.5)
      .from(selector("[data-new]"), { y: 30, opacity: 0, scale: 0.8, duration: 0.45, ease: "back.out(2)" }, VARIANTS_AT.looksNew);
  });
  return (
    <AbsoluteFill ref={scope} style={{ perspective: 1600 }}>
      <Variants3D cloneAt={F(VARIANTS_AT.rebuild)} gap={VARIANTS_AT.gap * 30} />
      <div
        data-title
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 130,
          textAlign: "center",
          fontFamily: ZW.sans,
          fontWeight: 800,
          fontSize: 64,
          letterSpacing: -1.5,
          color: ZW.text,
        }}
      >
        Same malware. <span style={{ color: ZW.amber }}>A new fingerprint</span> every time.
      </div>
      <div data-list style={{ position: "absolute", left: 110, top: 270 }}>
        <Panel style={{ width: 560, padding: 28 }} glow={looksNew ? ZW.amber : undefined}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 30, color: ZW.text }}>Signature list check</span>
          </div>
          <div style={{ display: "flex", gap: 34, marginTop: 18 }}>
            <div>
              <div style={{ fontFamily: ZW.sans, fontWeight: 800, fontSize: 72, color: ZW.red, lineHeight: 1 }}>{made + 1}</div>
              <div style={{ fontFamily: ZW.sans, fontSize: 24, color: ZW.muted, marginTop: 4 }}>copies</div>
            </div>
            <div>
              <div style={{ fontFamily: ZW.sans, fontWeight: 800, fontSize: 72, color: ZW.cyan, lineHeight: 1 }}>1</div>
              <div style={{ fontFamily: ZW.sans, fontSize: 24, color: ZW.muted, marginTop: 4 }}>on the list</div>
            </div>
          </div>
          <div style={{ marginTop: 22, height: 6 * 52, overflow: "hidden" }}>
            {rows.map((i) => {
              const born = F(VARIANTS_AT.rebuild) + i * VARIANTS_AT.gap * 30;
              const o = interpolate(frame, [born, born + 6], [0, 1], clamp);
              return (
                <div
                  key={i}
                  style={{
                    height: 44,
                    marginBottom: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontFamily: ZW.mono,
                    fontSize: 22,
                    color: ZW.faint,
                    padding: "0 12px",
                    borderRadius: 8,
                    border: `1px solid ${ZW.line}`,
                    opacity: o,
                  }}
                >
                  {hashOf(i)}
                  <span style={{ color: ZW.amber, fontSize: 18 }}>NO MATCH</span>
                </div>
              );
            })}
          </div>
          <div data-new style={{ marginTop: 10 }}>
            <Pill text="Every copy looks new" color={ZW.amber} size={20} />
          </div>
        </Panel>
      </div>
    </AbsoluteFill>
  );
};
