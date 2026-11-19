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
export const SIGNATURES_AT = {
  intent: 0.6, // "Then it reads intent."
  unseen: 1.9, // "no one has seen before"
  judged: 3.6, // "judged on what it would do"
  intents: [3.7, 4.05, 4.4], // the three intent lines
  stopped: 6.0, // "does not need a signature to be stopped."
};
const F = (s: number) => Math.round(s * 30);

// Illustrative hashes only.
const HASHES = Array.from({ length: 16 }).map((_, i) => {
  let h = "";
  for (let k = 0; k < 16; k++) h += "0123456789abcdef"[(i * 7 + k * 13 + k * k * 3) % 16];
  return `${h.slice(0, 8)}…${h.slice(8)}`;
});
// From the zerowrite.ai attack examples (illustrative file).
const INTENTS = [
  "would read every document",
  "would delete the backups",
  "would start PowerShell",
];

const SignatureList: React.FC = () => {
  const frame = useCurrentFrame();
  const scroll = interpolate(frame, [0, F(SIGNATURES_AT.unseen)], [0, 360], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const miss = frame >= F(SIGNATURES_AT.unseen);
  return (
    <Panel style={{ width: 620, height: 560, padding: 26, overflow: "hidden", position: "relative" }} glow={miss ? ZW.amber : undefined}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 32, color: ZW.text }}>Signature list</span>
        <Pill text={miss ? "No match" : "Checking"} color={miss ? ZW.amber : ZW.muted} size={18} />
      </div>
      <div style={{ position: "relative", height: 440, marginTop: 20, overflow: "hidden" }}>
        <div style={{ transform: `translateY(${-scroll}px)` }}>
          {HASHES.map((h, i) => (
            <div
              key={i}
              style={{
                fontFamily: ZW.mono,
                fontSize: 26,
                color: ZW.faint,
                padding: "8px 0",
                borderBottom: `1px solid ${ZW.line}`,
              }}
            >
              {h}
            </div>
          ))}
        </div>
        {/* scan bar */}
        {!miss ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 180,
              height: 46,
              backgroundColor: `${ZW.cyan}22`,
              borderTop: `2px solid ${ZW.cyan}`,
              borderBottom: `2px solid ${ZW.cyan}`,
            }}
          />
        ) : null}
      </div>
    </Panel>
  );
};

// The loupe sweeps from the list over to the file, with motion blur.
const Loupe: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [F(SIGNATURES_AT.judged) - 14, F(SIGNATURES_AT.judged)], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const x = interpolate(p, [0, 1], [430, 1560]);
  const y = interpolate(p, [0, 1], [560, 450]) + Math.sin(frame / 10) * 6;
  const show = interpolate(frame, [F(SIGNATURES_AT.intent), F(SIGNATURES_AT.intent) + 8], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: show }}>
      <div
        style={{
          width: 170,
          height: 170,
          borderRadius: 999,
          border: `8px solid ${ZW.cyan}`,
          backgroundColor: `${ZW.cyan}14`,
          boxShadow: `0 0 50px ${ZW.cyan}88`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 140,
          width: 90,
          height: 22,
          borderRadius: 11,
          backgroundColor: ZW.cyan,
          transform: "rotate(45deg)",
          transformOrigin: "0% 50%",
        }}
      />
    </div>
  );
};

export const Signatures: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const stamp = interpolate(frame, [F(SIGNATURES_AT.stopped), F(SIGNATURES_AT.stopped) + 6], [2.2, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-list]"), { x: -160, opacity: 0, rotateY: 25, duration: 0.7, ease: "power3.out" }, 0)
      .from(selector("[data-file]"), { x: 200, opacity: 0, rotateY: -25, duration: 0.7, ease: "power3.out" }, 0.25)
      .from(selector("[data-unseen]"), { y: 30, opacity: 0, duration: 0.4, ease: "back.out(2)" }, SIGNATURES_AT.unseen);
    SIGNATURES_AT.intents.forEach((s, i) => {
      timeline.from(selector(`[data-intent="${i}"]`), { x: 60, opacity: 0, duration: 0.35, ease: "power3.out" }, s);
    });
    timeline.to(selector("[data-cam]"), { scale: 1.05, duration: 8, ease: "none" }, 0);
  });
  const stopped = frame >= F(SIGNATURES_AT.stopped);
  return (
    <AbsoluteFill ref={scope} style={{ perspective: 1600 }}>
      <AbsoluteFill data-cam>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 120,
            textAlign: "center",
            fontFamily: ZW.sans,
            fontWeight: 800,
            fontSize: 64,
            letterSpacing: -1.5,
            color: ZW.text,
          }}
        >
          Intent, <span style={{ color: ZW.cyan }}>not signatures.</span>
        </div>
        <div data-list style={{ position: "absolute", left: 150, top: 270 }}>
          <SignatureList />
        </div>
        <div data-file style={{ position: "absolute", left: 960, top: 270 }}>
          <Panel style={{ width: 810, height: 560, padding: 30, position: "relative" }} glow={stopped ? ZW.red : ZW.cyan}>
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <div
                style={{
                  width: 84,
                  height: 100,
                  borderRadius: 14,
                  border: `3px solid ${ZW.cyan}`,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: ZW.mono,
                  fontWeight: 600,
                  fontSize: 22,
                  color: ZW.cyan,
                  backgroundColor: `${ZW.cyan}14`,
                }}
              >
                EXE
              </div>
              <div>
                <div style={{ fontFamily: ZW.mono, fontSize: 34, color: ZW.text }}>new_tool.exe</div>
                <div data-unseen style={{ marginTop: 10 }}>
                  <Pill text="Never seen before" color={ZW.amber} size={18} />
                </div>
              </div>
            </div>
            <div style={{ marginTop: 36, fontFamily: ZW.mono, fontSize: 22, color: ZW.muted, letterSpacing: 1.5 }}>
              WHAT IT WOULD DO
            </div>
            {INTENTS.map((t, i) => (
              <div
                key={t}
                data-intent={i}
                style={{
                  marginTop: 14,
                  fontFamily: ZW.sans,
                  fontWeight: 600,
                  fontSize: 34,
                  color: ZW.text,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <span style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: ZW.red, boxShadow: `0 0 14px ${ZW.red}` }} />
                {t}
              </div>
            ))}
            {stopped ? (
              <div
                style={{
                  position: "absolute",
                  right: 34,
                  bottom: 40,
                  transform: `rotate(-8deg) scale(${stamp})`,
                  fontFamily: ZW.mono,
                  fontWeight: 700,
                  fontSize: 34,
                  letterSpacing: 2,
                  color: ZW.red,
                  border: `4px solid ${ZW.red}`,
                  borderRadius: 10,
                  padding: "6px 16px",
                  backgroundColor: "#16070a",
                }}
              >
                STOPPED · NO SIGNATURE NEEDED
              </div>
            ) : null}
          </Panel>
        </div>
        <AbsoluteFill>
          <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={220}>
            <AbsoluteFill>
              <Loupe />
            </AbsoluteFill>
          </HtmlInCanvasMotionBlur>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
