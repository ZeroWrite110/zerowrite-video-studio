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
export const SPLIT_AT = {
  runs: 3.7, // "...after the program starts"
  spread: 4.3, // "Until then, unknown code can do whatever..."
  right: 8.0, // "Zero Write decides before its first instruction"
  frozen: 9.9,
  waits: 12.3, // "...waits for a verdict"
};

const HALF = 960;

// A file icon that drops into a lane with motion blur.
const FallingFile: React.FC<{ x: number; at: number; color: string }> = ({ x, at, color }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at * 30, at * 30 + 12], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.3, 0.9, 0.25, 1.08),
  });
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: x - 60,
          top: interpolate(p, [0, 1], [-200, 290]),
          width: 120,
          height: 146,
          borderRadius: 18,
          border: `4px solid ${color}`,
          backgroundColor: `${color}18`,
          display: "grid",
          placeItems: "center",
          fontFamily: ZW.mono,
          fontWeight: 600,
          fontSize: 30,
          color,
          boxShadow: `0 0 50px ${color}44`,
        }}
      >
        EXE
      </div>
    </AbsoluteFill>
  );
};

// Left lane: once the program runs, user files flip to .locked one by one.
const FileWall: React.FC = () => {
  const frame = useCurrentFrame();
  const tiles = [];
  for (let i = 0; i < 24; i++) {
    const col = i % 6;
    const row = Math.floor(i / 6);
    const order = (i * 7) % 24;
    const flip = interpolate(
      frame,
      [SPLIT_AT.spread * 30 + order * 3.2, SPLIT_AT.spread * 30 + order * 3.2 + 8],
      [0, 1],
      clamp,
    );
    const hit = flip > 0.5;
    tiles.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: 120 + col * 125,
          top: 500 + row * 100,
          width: 108,
          height: 82,
          borderRadius: 12,
          border: `2px solid ${hit ? ZW.red : ZW.line}`,
          backgroundColor: hit ? `${ZW.red}22` : "rgba(14,21,24,0.9)",
          transform: `rotateY(${flip * 180}deg)`,
          display: "grid",
          placeItems: "center",
          fontFamily: ZW.mono,
          fontSize: 15,
          color: hit ? ZW.red : ZW.muted,
        }}
      >
        <span style={{ transform: hit ? "scaleX(-1)" : undefined }}>{hit ? ".locked" : ["doc", "jpg", "xls", "pdf"][i % 4]}</span>
      </div>,
    );
  }
  return <AbsoluteFill style={{ perspective: 900 }}>{tiles}</AbsoluteFill>;
};

// Right lane: the program is held at its very first instruction.
const Frozen: React.FC = () => {
  const frame = useCurrentFrame();
  const lines = ["push  rbp", "mov   rbp, rsp", "call  CryptEncrypt", "call  DeleteShadows", "jmp   loop"];
  const on = interpolate(frame, [SPLIT_AT.frozen * 30 - 10, SPLIT_AT.frozen * 30], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: HALF + 140,
        top: 500,
        width: 680,
        padding: "22px 28px",
        borderRadius: 20,
        backgroundColor: "rgba(14,21,24,0.94)",
        border: `2px solid ${on > 0 ? ZW.cyan : ZW.line}`,
        boxShadow: on > 0 ? `0 0 60px ${ZW.cyan}33` : "none",
        fontFamily: ZW.mono,
        fontSize: 26,
        lineHeight: 1.75,
      }}
    >
      {lines.map((l, i) => (
        <div key={l} style={{ display: "flex", gap: 18, color: i === 0 ? ZW.text : ZW.muted, opacity: i === 0 ? 1 : 1 - on * 0.6 }}>
          <span style={{ color: i === 0 ? ZW.cyan : ZW.line, width: 28 }}>{i === 0 && on > 0 ? "▶" : ""}</span>
          <span style={{ width: 70, color: ZW.line }}>{String(i + 1).padStart(4, "0")}</span>
          <span>{l}</span>
        </div>
      ))}
      <div style={{ position: "absolute", right: 24, top: 22, opacity: on }}>
        <Pill text="Suspended" color={ZW.cyan} />
      </div>
    </div>
  );
};

export const Split: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const leftDim = interpolate(frame, [SPLIT_AT.right * 30 - 12, SPLIT_AT.right * 30], [1, 0.38], clamp);
  const rightDim = interpolate(frame, [SPLIT_AT.right * 30 - 12, SPLIT_AT.right * 30], [0.38, 1], clamp);
  const ran = frame >= SPLIT_AT.runs * 30;
  const waitPulse = 0.6 + 0.4 * Math.abs(Math.sin(frame / 6));
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-divider]"), { scaleY: 0, duration: 0.6, ease: "power3.inOut" }, 0)
      .from(selector("[data-label]"), { y: -40, opacity: 0, duration: 0.5, stagger: 0.15, ease: "power3.out" }, 0.2)
      .fromTo(selector("[data-runglow]"), { scale: 0.4, opacity: 0.9 }, { scale: 2.4, opacity: 0, duration: 0.8, ease: "power2.out", immediateRender: false }, SPLIT_AT.runs)
      .from(selector("[data-alert]"), { x: 160, opacity: 0, duration: 0.45, ease: "back.out(1.5)" }, SPLIT_AT.right - 1.1)
      .from(selector("[data-clamp]"), { scaleX: 1.8, opacity: 0, duration: 0.35, ease: "power4.in" }, SPLIT_AT.right + 0.5)
      .from(selector("[data-frozen]"), { y: 50, opacity: 0, duration: 0.5, ease: "power3.out" }, SPLIT_AT.frozen - 0.6)
      .from(selector("[data-wait]"), { y: 30, opacity: 0, duration: 0.45, ease: "power3.out" }, SPLIT_AT.waits - 0.2);
  });
  return (
    <AbsoluteFill ref={scope}>
      {/* LEFT: detect and respond */}
      <AbsoluteFill style={{ opacity: leftDim }}>
        <div data-label style={{ position: "absolute", left: 120, top: 150 }}>
          <div style={{ fontFamily: ZW.mono, fontSize: 24, letterSpacing: 3, color: ZW.red }}>DETECT AND RESPOND</div>
          <div style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 48, color: ZW.text, marginTop: 8 }}>
            Decides <span style={{ color: ZW.red }}>after</span> it starts
          </div>
        </div>
        <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={200}>
          <FallingFile x={HALF - 230} at={0.5} color={ran ? ZW.red : ZW.amber} />
        </HtmlInCanvasMotionBlur>
        <div
          data-runglow
          style={{ position: "absolute", left: HALF - 330, top: 260, width: 200, height: 200, borderRadius: 200, border: `6px solid ${ZW.red}`, opacity: 0 }}
        />
        <div style={{ position: "absolute", left: HALF - 300, top: 450, opacity: ran ? 1 : 0 }}>
          <Pill text="Running" color={ZW.red} />
        </div>
        <FileWall />
        <div data-alert style={{ position: "absolute", left: 230, top: 905 }}>
          <Pill text="⚠ Alert · clean up needed" color={ZW.amber} size={24} />
        </div>
      </AbsoluteFill>

      {/* divider */}
      <div
        data-divider
        style={{
          position: "absolute",
          left: HALF - 2,
          top: 120,
          bottom: 120,
          width: 4,
          borderRadius: 2,
          background: `linear-gradient(180deg, transparent, ${ZW.cyan}, transparent)`,
          boxShadow: `0 0 30px ${ZW.cyan}`,
        }}
      />

      {/* RIGHT: prevent first */}
      <AbsoluteFill style={{ opacity: rightDim }}>
        <div data-label style={{ position: "absolute", left: HALF + 140, top: 150 }}>
          <div style={{ fontFamily: ZW.mono, fontSize: 24, letterSpacing: 3, color: ZW.cyan }}>ZEROWRITE · PREVENT FIRST</div>
          <div style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 48, color: ZW.text, marginTop: 8 }}>
            Decides <span style={{ color: ZW.cyan }}>before</span> it runs
          </div>
        </div>
        <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={200}>
          <FallingFile x={HALF + 480} at={SPLIT_AT.right} color={ZW.cyan} />
        </HtmlInCanvasMotionBlur>
        {/* clamp brackets that grip the held file */}
        <div data-clamp style={{ position: "absolute", left: HALF + 480 - 110, top: 270, width: 220, height: 186 }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 26, borderLeft: `6px solid ${ZW.cyanBright}`, borderTop: `6px solid ${ZW.cyanBright}`, borderBottom: `6px solid ${ZW.cyanBright}`, borderRadius: "14px 0 0 14px" }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 26, borderRight: `6px solid ${ZW.cyanBright}`, borderTop: `6px solid ${ZW.cyanBright}`, borderBottom: `6px solid ${ZW.cyanBright}`, borderRadius: "0 14px 14px 0" }} />
          <div style={{ position: "absolute", left: 250, top: 70 }}>
            <Pill text="Held" color={ZW.cyan} size={26} />
          </div>
        </div>
        <AbsoluteFill data-frozen>
          <Frozen />
        </AbsoluteFill>
        <div data-wait style={{ position: "absolute", left: HALF + 140, top: 905, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 18, height: 18, borderRadius: 18, backgroundColor: ZW.cyan, opacity: waitPulse, boxShadow: `0 0 20px ${ZW.cyan}` }} />
          <span style={{ fontFamily: ZW.mono, fontSize: 28, color: ZW.text }}>waiting for a verdict…</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
