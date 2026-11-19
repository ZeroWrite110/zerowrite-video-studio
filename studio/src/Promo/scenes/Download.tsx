import { useGsapTimeline } from "@remotion/gsap";
import { HtmlInCanvasMotionBlur } from "@remotion/motion-blur";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo, Pill, ZW } from "../components/ui";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Seconds (scene time) matched to the voice line.
export const DOWNLOAD_AT = { done: 1.0, click: 1.45, freeze: 2.1 };

const WIN = { left: 300, top: 150, width: 1320, height: 760 };
const CHIP = { x: WIN.left + 40, y: WIN.top + WIN.height - 96 };

// Cursor: glides from the right edge to the download chip, then double-clicks.
const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  const move = interpolate(frame, [0.6 * 30, DOWNLOAD_AT.click * 30 - 3], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.6, 0, 0.2, 1),
  });
  const x = interpolate(move, [0, 1], [1700, CHIP.x + 230]);
  const y = interpolate(move, [0, 1], [380, CHIP.y + 34]);
  return (
    <AbsoluteFill>
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

const Ripple: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 14], [0, 1], clamp);
  if (p <= 0 || p >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: CHIP.x + 236 - 60 * p,
        top: CHIP.y + 40 - 60 * p,
        width: 120 * p,
        height: 120 * p,
        borderRadius: 999,
        border: `4px solid ${ZW.cyanBright}`,
        opacity: 1 - p,
      }}
    />
  );
};

export const Download: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const clickF = DOWNLOAD_AT.click * 30;
  const freezeF = DOWNLOAD_AT.freeze * 30;
  const progress = interpolate(frame, [6, DOWNLOAD_AT.done * 30], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });
  // The "next second": a millisecond clock that runs while the camera pushes in.
  const ms = Math.round(interpolate(frame, [freezeF, freezeF + 60], [0, 1000], clamp));
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-win]"), { rotateX: 18, y: 120, opacity: 0, duration: 0.7, ease: "power3.out" }, 0)
      .to(selector("[data-cam]"), { scale: 1.06, duration: 2.2, ease: "none" }, 0)
      .to(selector("[data-cam]"), { scale: 1.9, x: 520, y: -560, duration: 0.9, ease: "power3.inOut" }, DOWNLOAD_AT.freeze - 0.35)
      .to(selector("[data-dim]"), { opacity: 0.82, duration: 0.5 }, DOWNLOAD_AT.freeze - 0.1)
      .from(selector("[data-clock]"), { scale: 0.6, opacity: 0, duration: 0.5, ease: "back.out(1.6)" }, DOWNLOAD_AT.freeze)
      .from(selector("[data-line]"), { y: 40, opacity: 0, duration: 0.5, ease: "power3.out" }, DOWNLOAD_AT.freeze + 0.25);
  });
  return (
    <AbsoluteFill ref={scope} style={{ perspective: 1600 }}>
      <AbsoluteFill data-cam style={{ transformOrigin: `${CHIP.x + 200}px ${CHIP.y + 40}px` }}>
        <div
          data-win
          style={{
            position: "absolute",
            ...WIN,
            borderRadius: 22,
            overflow: "hidden",
            backgroundColor: "#0b1215",
            border: `2px solid ${ZW.line}`,
            boxShadow: "0 60px 140px rgba(0,0,0,0.7)",
          }}
        >
          {/* tab strip + address bar */}
          <div style={{ height: 64, backgroundColor: "#111b1f", display: "flex", alignItems: "center", gap: 14, padding: "0 24px" }}>
            {["#F03E4D", "#E09112", "#2FD68C"].map((c) => (
              <div key={c} style={{ width: 16, height: 16, borderRadius: 16, backgroundColor: c, opacity: 0.8 }} />
            ))}
            <div
              style={{
                marginLeft: 24,
                flex: 1,
                height: 38,
                borderRadius: 19,
                backgroundColor: "#05090B",
                display: "flex",
                alignItems: "center",
                padding: "0 20px",
                fontFamily: ZW.mono,
                fontSize: 20,
                color: ZW.muted,
              }}
            >
              https://files.example/invoice_0423.exe
            </div>
          </div>
          {/* page skeleton */}
          <div style={{ padding: 60, display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ width: 520, height: 46, borderRadius: 10, backgroundColor: "#1a262b" }} />
            {[900, 820, 960, 700].map((w, i) => (
              <div key={i} style={{ width: w, height: 18, borderRadius: 9, backgroundColor: "#141f23" }} />
            ))}
            <div style={{ display: "flex", gap: 28, marginTop: 20 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 340, height: 190, borderRadius: 18, backgroundColor: "#111a1e", border: `1px solid ${ZW.line}` }} />
              ))}
            </div>
          </div>
          {/* download bar */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 120,
              backgroundColor: "#111b1f",
              borderTop: `2px solid ${ZW.line}`,
            }}
          />
        </div>
        {/* download chip (outside the window box so the zoom can target it) */}
        <div
          style={{
            position: "absolute",
            left: CHIP.x,
            top: CHIP.y,
            width: 470,
            height: 80,
            borderRadius: 16,
            backgroundColor: "#05090B",
            border: `2px solid ${frame >= clickF ? ZW.cyan : ZW.line}`,
            boxShadow: frame >= clickF ? `0 0 40px ${ZW.cyan}55` : "none",
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "0 18px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: 44,
              height: 52,
              borderRadius: 8,
              border: `3px solid ${ZW.cyan}`,
              display: "grid",
              placeItems: "center",
              fontFamily: ZW.mono,
              fontSize: 13,
              color: ZW.cyan,
              flex: "none",
            }}
          >
            EXE
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: ZW.mono, fontSize: 22, color: ZW.text }}>invoice_0423.exe</div>
            <div style={{ fontFamily: ZW.mono, fontSize: 17, color: ZW.muted, marginTop: 4 }}>
              {progress < 1 ? `${(2.1 * progress).toFixed(1)} of 2.1 MB` : "2.1 MB · Done"}
            </div>
          </div>
          <div style={{ position: "absolute", left: 0, bottom: 0, height: 5, width: `${progress * 100}%`, backgroundColor: ZW.cyan }} />
        </div>
        <Ripple at={clickF} />
        <Ripple at={clickF + 6} />
        {/* positioned layer so the blurred cursor paints above the absolute browser window */}
        <AbsoluteFill>
          <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={200}>
            <Cursor />
          </HtmlInCanvasMotionBlur>
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill data-dim style={{ backgroundColor: ZW.ink, opacity: 0 }} />
      {/* "the next second" */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 34 }}>
        <div data-clock style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <Logo size={70} style={{ opacity: 0.85 }} />
          <span
            style={{
              fontFamily: ZW.mono,
              fontWeight: 600,
              fontSize: 150,
              color: ZW.text,
              letterSpacing: -2,
              textShadow: `0 0 50px ${ZW.cyan}66`,
            }}
          >
            {(ms / 1000).toFixed(3)}
            <span style={{ color: ZW.cyan, fontSize: 80 }}>s</span>
          </span>
        </div>
        <div data-line>
          <span style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 64, color: ZW.text, letterSpacing: -1 }}>
            The <span style={{ color: ZW.cyan }}>next second</span> matters most.
          </span>
        </div>
        <div style={{ opacity: frame >= freezeF ? 1 : 0 }}>
          <Pill text="double-click" color={ZW.amber} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
