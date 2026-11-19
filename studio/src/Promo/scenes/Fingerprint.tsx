import { useGsapTimeline } from "@remotion/gsap";
import { HtmlInCanvasMotionBlur } from "@remotion/motion-blur";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Panel, Pill, ZW } from "../components/ui";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Seconds (scene time) matched to the voice line (whisper word timings + 0.27 s).
export const FINGERPRINT_AT = {
  signature: 2.8, // "A signature is a fingerprint"
  print: 3.6, // "fingerprint"
  change: 6.45, // "Change one byte"
  byte: 7.0, // "byte"
  rehash: 7.65, // "the fingerprint changes"
  noMatch: 8.95, // "No match."
};
const F = (s: number) => Math.round(s * 30);

const HEX = "0123456789ABCDEF";
// Illustrative bytes of a file (starts with the Windows "MZ" header).
const BYTES = Array.from({ length: 96 }).map((_, i) =>
  i === 0 ? "4D" : i === 1 ? "5A" : HEX[Math.floor(random(`hi${i}`) * 16)] + HEX[Math.floor(random(`lo${i}`) * 16)],
);
const TARGET = 37; // the byte that changes
const OLD_HASH = "a3f9 1c07 e2b4 9d58";
const NEW_HASH = "7e02 d9b1 4fa6 03ce";

// Hash text that scrambles from the old value to the new one, character by character.
const Hash: React.FC = () => {
  const frame = useCurrentFrame();
  const start = F(FINGERPRINT_AT.rehash);
  const chars = OLD_HASH.split("").map((c, i) => {
    if (c === " ") return " ";
    const at = start + i * 1.2;
    if (frame < at) return c;
    if (frame > at + 8) return NEW_HASH[i];
    return HEX[(frame * 5 + i * 3) % 16].toLowerCase();
  });
  const changed = frame >= start;
  return (
    <span style={{ color: changed ? ZW.amber : ZW.cyan }}>{chars.join("")}</span>
  );
};

// A marker that swoops onto the one byte that changes (motion-blurred).
const Marker: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [F(FINGERPRINT_AT.change), F(FINGERPRINT_AT.byte)], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const show = interpolate(frame, [F(FINGERPRINT_AT.change) - 3, F(FINGERPRINT_AT.change) + 3], [0, 1], clamp);
  const fade = interpolate(frame, [F(FINGERPRINT_AT.rehash) + 12, F(FINGERPRINT_AT.rehash) + 22], [1, 0], clamp);
  const mx = interpolate(p, [0, 1], [1700, x]);
  const my = interpolate(p, [0, 1], [180, y]) - Math.sin(p * Math.PI) * 120;
  return (
    <div
      style={{
        position: "absolute",
        left: mx - 34,
        top: my - 30,
        width: 68,
        height: 60,
        borderRadius: 12,
        border: `4px solid ${ZW.amber}`,
        boxShadow: `0 0 34px ${ZW.amber}`,
        opacity: show * fade,
      }}
    />
  );
};

const GRID_X = 150;
const GRID_Y = 360;
const CELL_W = 58;
const CELL_H = 50;
const COLS = 16;

export const Fingerprint: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const flipped = frame >= F(FINGERPRINT_AT.byte) + 2;
  const flip = interpolate(frame, [F(FINGERPRINT_AT.byte) - 2, F(FINGERPRINT_AT.byte) + 6], [0, 1], clamp);
  const noMatch = frame >= F(FINGERPRINT_AT.noMatch);
  const stamp = interpolate(frame, [F(FINGERPRINT_AT.noMatch), F(FINGERPRINT_AT.noMatch) + 6], [2.2, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-q]"), { y: 40, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.1)
      .from(selector("[data-cell]"), {
        opacity: 0,
        scale: 0.4,
        duration: 0.3,
        ease: "power2.out",
        stagger: { each: 0.006, from: "center" },
      }, 0.4)
      .from(selector("[data-sig]"), { x: 180, opacity: 0, rotateY: -25, duration: 0.7, ease: "power3.out" }, FINGERPRINT_AT.signature - 0.3)
      .from(selector("[data-print]"), { scale: 0.6, opacity: 0, duration: 0.5, ease: "back.out(2)" }, FINGERPRINT_AT.print)
      .to(selector("[data-cam]"), { scale: 1.05, duration: 10, ease: "none" }, 0);
  });
  const tx = GRID_X + (TARGET % COLS) * CELL_W + CELL_W / 2 - 4;
  const ty = GRID_Y + 96 + Math.floor(TARGET / COLS) * CELL_H + CELL_H / 2 - 4;
  return (
    <AbsoluteFill ref={scope} style={{ perspective: 1600 }}>
      <AbsoluteFill data-cam>
        <div
          data-q
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
          Why does antivirus miss <span style={{ color: ZW.amber }}>brand new</span> malware?
        </div>
        {/* the file, as bytes */}
        <div style={{ position: "absolute", left: GRID_X - 30, top: GRID_Y }}>
          <Panel style={{ width: COLS * CELL_W + 60, padding: 30 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: ZW.mono, fontSize: 28, color: ZW.text }}>payload.exe</span>
              <span style={{ fontFamily: ZW.mono, fontSize: 20, color: ZW.muted }}>{flipped ? "1 byte changed" : "bytes"}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", marginTop: 22, width: COLS * CELL_W }}>
              {BYTES.map((b, i) => {
                const hit = i === TARGET;
                const value = hit && flipped ? "4E" : b;
                const color = hit && flip > 0 ? ZW.amber : i < 2 ? ZW.cyanBright : ZW.faint;
                return (
                  <div
                    key={i}
                    data-cell
                    style={{
                      width: CELL_W,
                      height: CELL_H,
                      display: "grid",
                      placeItems: "center",
                      fontFamily: ZW.mono,
                      fontSize: 24,
                      color,
                      fontWeight: hit ? 600 : 400,
                      transform: hit ? `rotateX(${Math.sin(flip * Math.PI) * 90}deg)` : undefined,
                    }}
                  >
                    {value}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 22, fontFamily: ZW.mono, fontSize: 22, color: ZW.muted, letterSpacing: 1.5 }}>FINGERPRINT (HASH)</div>
            <div data-print style={{ marginTop: 8, fontFamily: ZW.mono, fontWeight: 600, fontSize: 40, letterSpacing: 2 }}>
              <Hash />
            </div>
          </Panel>
        </div>
        {/* the signature list */}
        <div data-sig style={{ position: "absolute", left: 1270, top: GRID_Y }}>
          <Panel style={{ width: 520, padding: 30, position: "relative" }} glow={noMatch ? ZW.amber : ZW.cyan}>
            <div style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 32, color: ZW.text }}>Signature list</div>
            <div style={{ fontFamily: ZW.sans, fontSize: 24, color: ZW.muted, marginTop: 6 }}>files someone has already seen</div>
            {["a3f9 1c07 e2b4 9d58", "5b10 c3e7 88a2 f046", "e9d4 27bc 1a03 6f91"].map((h, i) => {
              const match = i === 0 && frame >= F(FINGERPRINT_AT.print) + 6 && !flipped;
              return (
                <div
                  key={h}
                  style={{
                    marginTop: 18,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontFamily: ZW.mono,
                    fontSize: 26,
                    color: match ? ZW.cyan : ZW.faint,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: `2px solid ${match ? ZW.cyan : ZW.line}`,
                  }}
                >
                  {h}
                  {match ? <Pill text="Match" color={ZW.cyan} size={16} /> : null}
                </div>
              );
            })}
            {noMatch ? (
              <div
                style={{
                  position: "absolute",
                  right: 30,
                  bottom: -40,
                  transform: `rotate(-7deg) scale(${stamp})`,
                  fontFamily: ZW.mono,
                  fontWeight: 700,
                  fontSize: 40,
                  letterSpacing: 3,
                  color: ZW.amber,
                  border: `4px solid ${ZW.amber}`,
                  borderRadius: 10,
                  padding: "6px 18px",
                  backgroundColor: "#170f04",
                }}
              >
                NO MATCH
              </div>
            ) : null}
          </Panel>
        </div>
        <AbsoluteFill>
          <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={220}>
            <AbsoluteFill>
              <Marker x={tx} y={ty} />
            </AbsoluteFill>
          </HtmlInCanvasMotionBlur>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
