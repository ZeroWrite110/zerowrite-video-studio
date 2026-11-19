import { useGsapTimeline } from "@remotion/gsap";
import { HtmlInCanvasMotionBlur } from "@remotion/motion-blur";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SignHeader } from "../components/SignHeader";
import { Pill, ZW } from "../components/ui";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Seconds (scene time) matched to the voice line.
export const HIDE_AT = {
  doc: 1.2, // "It hides inside something trusted."
  shell: 3.85, // "A document starts PowerShell,"
  encoded: 5.05, // "runs a hidden command,"
  inject: 6.35, // "and injects into explorer."
};
const F = (s: number) => Math.round(s * 30);

const Y = 470;
const W = 360;
const H = 210;
const NODES = [
  { x: 110, label: "Q3-report.docm", meta: "macro · from email", at: HIDE_AT.doc, ext: "DOCM" },
  { x: 560, label: "powershell.exe", meta: "macro starts a shell", at: HIDE_AT.shell, ext: "PS", weight: 26 },
  { x: 1010, label: "encoded command", meta: "hides what it does", at: HIDE_AT.encoded, ext: "-enc", weight: 22 },
  { x: 1460, label: "explorer.exe", meta: "trusted system process", at: HIDE_AT.inject, ext: "SYS", weight: 21 },
];

// Encoded-looking text that keeps scrambling (illustrative, not a real command).
const scramble = (frame: number, n: number) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let s = "";
  const k = Math.floor(frame / 2);
  for (let i = 0; i < n; i++) s += chars[(i * i * 7 + i * 13 + k * (i * 31 + 17) + k * k * 3) % chars.length];
  return s;
};

// The payload packet that flies from the encoded command into explorer.exe.
const Packet: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [F(HIDE_AT.inject) - 2, F(HIDE_AT.inject) + 10], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  if (p <= 0 || p >= 1) return null;
  const x = interpolate(p, [0, 1], [NODES[2].x + W - 20, NODES[3].x + 20]);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: Y + H / 2 - 22,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: ZW.red,
        boxShadow: `0 0 40px ${ZW.red}, 0 0 90px ${ZW.red}aa`,
      }}
    />
  );
};

export const Hide: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    NODES.forEach((n, i) => {
      timeline.from(selector(`[data-node="${i}"]`), { y: 80, opacity: 0, rotateX: -40, duration: 0.5, ease: "power3.out" }, n.at - 0.15);
    });
    timeline
      .from(selector("[data-trusted]"), { scale: 0, opacity: 0, duration: 0.35, ease: "back.out(3)" }, HIDE_AT.inject - 0.2)
      .to(selector("[data-cam]"), { scale: 1.05, duration: 8, ease: "none" }, 0);
  });
  const injected = frame >= F(HIDE_AT.inject) + 10;
  const shake = injected ? Math.sin(frame * 2.3) * interpolate(frame, [F(HIDE_AT.inject) + 10, F(HIDE_AT.inject) + 24], [8, 0], clamp) : 0;
  return (
    <AbsoluteFill ref={scope} style={{ perspective: 1600 }}>
      <AbsoluteFill data-cam>
        <SignHeader n={3} title={<>It hides inside <span style={{ color: ZW.red }}>something trusted.</span></>} />
        {/* edges, drawn as each next node appears */}
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
          {NODES.slice(1).map((n, i) => {
            const from = NODES[i].x + W;
            const to = n.x;
            const draw = interpolate(frame, [F(n.at) - 10, F(n.at) + 2], [0, 1], clamp);
            return (
              <line
                key={i}
                x1={from}
                y1={Y + H / 2}
                x2={from + (to - from) * draw}
                y2={Y + H / 2}
                stroke={i === 2 ? ZW.red : ZW.amber}
                strokeWidth={6}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 10px ${i === 2 ? ZW.red : ZW.amber})` }}
              />
            );
          })}
        </svg>
        {NODES.map((n, i) => {
          const isTarget = i === 3;
          const color = isTarget ? (injected ? ZW.red : ZW.jade) : i === 0 ? ZW.amber : ZW.red;
          return (
            <div
              key={n.label}
              data-node={i}
              style={{
                position: "absolute",
                left: n.x + (isTarget ? shake : 0),
                top: Y,
                width: W,
                height: H,
                borderRadius: 24,
                border: `3px solid ${color}`,
                backgroundColor: "rgba(14,21,24,0.95)",
                boxShadow: `0 30px 70px rgba(0,0,0,0.5), 0 0 ${isTarget && injected ? 70 : 34}px ${color}55`,
                padding: 24,
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    minWidth: 62,
                    height: 62,
                    padding: "0 8px",
                    boxSizing: "border-box",
                    borderRadius: 12,
                    border: `3px solid ${color}`,
                    display: "grid",
                    placeItems: "center",
                    fontFamily: ZW.mono,
                    fontWeight: 600,
                    fontSize: 20,
                    color,
                    backgroundColor: `${color}18`,
                  }}
                >
                  {n.ext}
                </div>
                <div style={{ fontFamily: ZW.mono, fontSize: 24, color: ZW.text, whiteSpace: "nowrap" }}>{n.label}</div>
              </div>
              {i === 2 ? (
                <div style={{ marginTop: 18, fontFamily: ZW.mono, fontSize: 20, color: ZW.red, wordBreak: "break-all", lineHeight: 1.3 }}>
                  {scramble(frame, 44)}
                </div>
              ) : (
                <div style={{ marginTop: 22, fontFamily: ZW.sans, fontWeight: 600, fontSize: 26, color: ZW.muted }}>{n.meta}</div>
              )}
              {n.weight ? (
                <div style={{ position: "absolute", right: 20, bottom: 16, fontFamily: ZW.mono, fontSize: 22, color: ZW.red }}>
                  +{n.weight}
                </div>
              ) : null}
              {isTarget ? (
                <div data-trusted style={{ position: "absolute", left: 22, top: -24 }}>
                  <Pill text={injected ? "Injected" : "Trusted"} color={injected ? ZW.red : ZW.jade} size={18} />
                </div>
              ) : null}
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: Y + H + 70,
            textAlign: "center",
            fontFamily: ZW.sans,
            fontWeight: 700,
            fontSize: 40,
            color: ZW.text,
            opacity: interpolate(frame, [F(HIDE_AT.inject) + 14, F(HIDE_AT.inject) + 24], [0, 1], clamp),
          }}
        >
          No new file on disk. <span style={{ color: ZW.cyan }}>Same checkpoint.</span>
        </div>
        <AbsoluteFill>
          <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={240}>
            <AbsoluteFill>
              <Packet />
            </AbsoluteFill>
          </HtmlInCanvasMotionBlur>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
