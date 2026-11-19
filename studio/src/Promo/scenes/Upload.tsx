import { useGsapTimeline } from "@remotion/gsap";
import { HtmlInCanvasMotionBlur } from "@remotion/motion-blur";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Pill, ZW } from "../components/ui";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Seconds (scene time) matched to the voice line.
export const UPLOAD_AT = {
  checks: 1.5, // "checks a file on your computer"
  where: 3.3, // "where does that file go?"
  fair: 4.9, // "It is a fair question."
};
const F = (s: number) => Math.round(s * 30);

const PC = { x: 470, y: 600 };
const CLOUD = { x: 1450, y: 470 };
// Point on the arc from the PC to the cloud (p: 0..1).
const arc = (p: number) => {
  const x = interpolate(p, [0, 1], [PC.x + 150, CLOUD.x - 170]);
  const y = interpolate(p, [0, 1], [PC.y - 80, CLOUD.y]) - Math.sin(p * Math.PI) * 230;
  return { x, y };
};
const FILES = ["invoice.pdf", "photo.jpg", "taxes.xlsx"];

// Files leave the PC along the arc and stop halfway, as if nobody knows where they go.
const Travellers: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {FILES.map((name, i) => {
        const start = F(UPLOAD_AT.where) - 18 + i * 7;
        const p = interpolate(frame, [start, start + 22], [0, 0.14 + i * 0.29], {
          ...clamp,
          easing: Easing.out(Easing.cubic),
        });
        const show = interpolate(frame, [start - 2, start + 3], [0, 1], clamp);
        const { x, y } = arc(p);
        return (
          <div
            key={name}
            style={{
              position: "absolute",
              left: x - 95,
              top: y - 26,
              width: 190,
              height: 52,
              borderRadius: 12,
              border: `2px solid ${ZW.cyan}`,
              backgroundColor: "#071a1f",
              boxShadow: `0 0 26px ${ZW.cyan}55`,
              display: "grid",
              placeItems: "center",
              fontFamily: ZW.mono,
              fontWeight: 600,
              fontSize: 20,
              color: ZW.text,
              opacity: show,
            }}
          >
            {name}
          </div>
        );
      })}
    </>
  );
};

export const Upload: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const dash = interpolate(frame, [F(UPLOAD_AT.where) - 20, F(UPLOAD_AT.where) + 10], [0, 1], clamp);
  const q = interpolate(frame, [F(UPLOAD_AT.fair) - 4, F(UPLOAD_AT.fair) + 10], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });
  const scan = (frame % 50) / 50;
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-title]"), { y: 40, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.1)
      .from(selector("[data-pc]"), { x: -200, opacity: 0, rotateY: 25, duration: 0.8, ease: "power3.out" }, 0.3)
      .from(selector("[data-cloud]"), { x: 200, opacity: 0, scale: 0.8, duration: 0.8, ease: "power3.out" }, UPLOAD_AT.where - 0.9)
      .from(selector("[data-checking]"), { y: 20, opacity: 0, duration: 0.4, ease: "back.out(2)" }, UPLOAD_AT.checks)
      .to(selector("[data-cam]"), { scale: 1.05, duration: 7, ease: "none" }, 0);
  });
  // Dashed arc as an SVG path.
  const pts = Array.from({ length: 41 }).map((_, k) => arc(k / 40));
  const d = pts.map((p, k) => `${k ? "L" : "M"}${p.x},${p.y}`).join(" ");
  return (
    <AbsoluteFill ref={scope} style={{ perspective: 1600 }}>
      <AbsoluteFill data-cam>
        <div
          data-title
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 120,
            textAlign: "center",
            fontFamily: ZW.sans,
            fontWeight: 800,
            fontSize: 66,
            letterSpacing: -1.5,
            color: ZW.text,
          }}
        >
          Where does <span style={{ color: ZW.cyan }}>your file</span> go?
        </div>
        {/* the PC */}
        <div data-pc style={{ position: "absolute", left: PC.x - 210, top: PC.y - 170 }}>
          <div
            style={{
              width: 420,
              height: 270,
              borderRadius: 22,
              border: `3px solid ${ZW.line}`,
              backgroundColor: "rgba(14,21,24,0.95)",
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
            }}
          >
            <div style={{ padding: "22px 26px", fontFamily: ZW.mono, fontSize: 22, color: ZW.muted }}>C:\Users\you\Downloads</div>
            <div style={{ display: "flex", gap: 22, padding: "8px 26px" }}>
              {["PDF", "JPG", "XLS"].map((e) => (
                <div
                  key={e}
                  style={{
                    width: 88,
                    height: 104,
                    borderRadius: 12,
                    border: `3px solid ${ZW.cyan}`,
                    backgroundColor: `${ZW.cyan}14`,
                    display: "grid",
                    placeItems: "center",
                    fontFamily: ZW.mono,
                    fontWeight: 600,
                    fontSize: 22,
                    color: ZW.cyan,
                  }}
                >
                  {e}
                </div>
              ))}
            </div>
            {/* scan line */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 60 + scan * 190,
                height: 3,
                backgroundColor: ZW.cyanBright,
                boxShadow: `0 0 18px ${ZW.cyan}`,
                opacity: 0.8,
              }}
            />
          </div>
          <div style={{ width: 120, height: 34, margin: "0 auto", backgroundColor: ZW.line, borderRadius: "0 0 10px 10px" }} />
          <div data-checking style={{ marginTop: 18, textAlign: "center" }}>
            <Pill text="Checking a file…" color={ZW.cyan} size={22} />
          </div>
        </div>
        {/* the unknown cloud */}
        <div data-cloud style={{ position: "absolute", left: CLOUD.x - 170, top: CLOUD.y - 110 }}>
          <svg width={340} height={220} viewBox="0 0 340 220">
            <path
              d="M80 190 C30 190 10 150 30 120 C10 80 60 40 105 60 C120 20 200 10 225 55 C270 40 320 80 300 125 C335 150 310 195 265 190 Z"
              fill="rgba(14,21,24,0.9)"
              stroke={ZW.muted}
              strokeWidth={4}
              strokeDasharray="12 10"
            />
          </svg>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 52,
              textAlign: "center",
              fontFamily: ZW.sans,
              fontWeight: 800,
              fontSize: 110,
              color: ZW.amber,
              transform: `scale(${0.4 + q * 0.6})`,
              opacity: q,
              textShadow: `0 0 40px ${ZW.amber}88`,
            }}
          >
            ?
          </div>
          <div style={{ textAlign: "center", fontFamily: ZW.mono, fontSize: 22, color: ZW.muted, marginTop: 6 }}>somewhere online</div>
        </div>
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
          <path d={d} fill="none" stroke={ZW.muted} strokeWidth={3} strokeDasharray="10 12" opacity={dash * 0.7} />
        </svg>
        <AbsoluteFill>
          <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={220}>
            <AbsoluteFill>
              <Travellers />
            </AbsoluteFill>
          </HtmlInCanvasMotionBlur>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
