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
export const CONSENT_AT = {
  program: 1.7, // "A blocked program"
  sent: 2.75, // "is sent to check the decision."
  docs: 4.25, // "A blocked document, archive or script"
  shown: 6.85, // "is shown to you first,"
  agree: 9.15, // "and sent only if you agree."
};
const F = (s: number) => Math.round(s * 30);

const TOP_Y = 330;
const BOT_Y = 690;

// The blocked program travels to the check (motion-blurred).
const ProgramPacket: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [F(CONSENT_AT.sent) - 4, F(CONSENT_AT.sent) + 16], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  if (frame < F(CONSENT_AT.sent) - 4) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 560 + p * 760,
        top: TOP_Y - 30,
        width: 150,
        height: 60,
        borderRadius: 12,
        border: `3px solid ${ZW.red}`,
        backgroundColor: "#1f0a0d",
        boxShadow: `0 0 30px ${ZW.red}88`,
        display: "grid",
        placeItems: "center",
        fontFamily: ZW.mono,
        fontWeight: 600,
        fontSize: 20,
        color: ZW.red,
        opacity: interpolate(p, [0.9, 1], [1, 0], clamp),
      }}
    >
      setup.exe
    </div>
  );
};

const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  const move = interpolate(frame, [F(CONSENT_AT.agree) - 30, F(CONSENT_AT.agree) - 4], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const press = frame >= F(CONSENT_AT.agree) && frame < F(CONSENT_AT.agree) + 4 ? 0.85 : 1;
  const show = interpolate(frame, [F(CONSENT_AT.shown) + 6, F(CONSENT_AT.shown) + 12], [0, 1], clamp);
  return (
    <svg
      width={44}
      height={56}
      viewBox="0 0 22 28"
      style={{
        position: "absolute",
        left: interpolate(move, [0, 1], [1700, 1440]),
        top: interpolate(move, [0, 1], [930, BOT_Y + 118]),
        opacity: show,
        transform: `scale(${press})`,
        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.7))",
      }}
    >
      <path d="M1 1 L1 22 L7 17 L11 26 L15 24 L11 15 L19 15 Z" fill="#fff" stroke="#000" strokeWidth={1.5} />
    </svg>
  );
};

export const Consent: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const clicked = frame >= F(CONSENT_AT.agree);
  const checked = frame >= F(CONSENT_AT.sent) + 16;
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-title]"), { y: 40, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.1)
      .from(selector("[data-prog]"), { x: -200, opacity: 0, duration: 0.6, ease: "power3.out" }, CONSENT_AT.program - 0.3)
      .from(selector("[data-check]"), { x: 200, opacity: 0, duration: 0.6, ease: "power3.out" }, CONSENT_AT.program)
      .from(selector("[data-doc]"), { y: 60, opacity: 0, scale: 0.7, duration: 0.45, ease: "back.out(2)", stagger: 0.28 }, CONSENT_AT.docs - 0.2)
      .from(selector("[data-dialog]"), { y: 60, opacity: 0, scale: 0.85, rotateX: 25, duration: 0.6, ease: "back.out(1.6)" }, CONSENT_AT.shown - 0.15)
      .to(selector("[data-cam]"), { scale: 1.04, duration: 10, ease: "none" }, 0);
  });
  return (
    <AbsoluteFill ref={scope} style={{ perspective: 1600 }}>
      <AbsoluteFill data-cam>
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
          Blocked files: <span style={{ color: ZW.cyan }}>you stay in charge.</span>
        </div>
        {/* lane 1: blocked program */}
        <div data-prog style={{ position: "absolute", left: 200, top: TOP_Y - 70, display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 110,
              height: 130,
              borderRadius: 16,
              border: `3px solid ${ZW.red}`,
              backgroundColor: `${ZW.red}18`,
              display: "grid",
              placeItems: "center",
              fontFamily: ZW.mono,
              fontWeight: 700,
              fontSize: 26,
              color: ZW.red,
            }}
          >
            EXE
          </div>
          <div>
            <div style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 34, color: ZW.text }}>Blocked program</div>
            <div style={{ marginTop: 10 }}>
              <Pill text="Sent automatically" color={ZW.amber} size={20} />
            </div>
          </div>
        </div>
        <div
          data-check
          style={{
            position: "absolute",
            left: 1330,
            top: TOP_Y - 70,
            width: 400,
            height: 140,
            borderRadius: 22,
            border: `3px solid ${checked ? ZW.cyan : ZW.line}`,
            backgroundColor: "rgba(14,21,24,0.95)",
            boxShadow: checked ? `0 0 40px ${ZW.cyan}55` : undefined,
            padding: "22px 28px",
          }}
        >
          <div style={{ fontFamily: ZW.mono, fontSize: 20, color: ZW.muted }}>ZeroWrite team</div>
          <div style={{ marginTop: 8, fontFamily: ZW.sans, fontWeight: 700, fontSize: 28, color: checked ? ZW.cyan : ZW.text }}>
            {checked ? "Checking the decision" : "Waiting…"}
          </div>
        </div>
        <div style={{ position: "absolute", left: 160, right: 160, top: (TOP_Y + BOT_Y) / 2 - 30, height: 2, backgroundColor: ZW.line }} />
        {/* lane 2: documents, archives, scripts */}
        <div style={{ position: "absolute", left: 200, top: BOT_Y - 80, display: "flex", gap: 22 }}>
          {[
            { e: "DOCX", n: "document" },
            { e: "ZIP", n: "archive" },
            { e: "PS1", n: "script" },
          ].map((d) => (
            <div key={d.e} data-doc style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 110,
                  height: 130,
                  borderRadius: 16,
                  border: `3px solid ${ZW.amber}`,
                  backgroundColor: `${ZW.amber}18`,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: ZW.mono,
                  fontWeight: 700,
                  fontSize: 24,
                  color: ZW.amber,
                }}
              >
                {d.e}
              </div>
              <div style={{ marginTop: 10, fontFamily: ZW.sans, fontSize: 24, color: ZW.muted }}>{d.n}</div>
            </div>
          ))}
        </div>
        {/* the consent dialog */}
        <div
          data-dialog
          style={{
            position: "absolute",
            left: 1000,
            top: BOT_Y - 140,
            width: 700,
            borderRadius: 22,
            border: `2px solid ${ZW.line}`,
            backgroundColor: "rgba(14,21,24,0.97)",
            boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
            padding: "28px 34px",
          }}
        >
          <div style={{ fontFamily: ZW.mono, fontSize: 20, color: ZW.muted }}>ZeroWrite · your choice</div>
          <div style={{ marginTop: 10, fontFamily: ZW.sans, fontWeight: 700, fontSize: 32, color: ZW.text }}>
            Send <span style={{ color: ZW.amber }}>contract.docx</span> for checking?
          </div>
          <div style={{ marginTop: 24, display: "flex", gap: 20, justifyContent: "flex-end" }}>
            <div
              style={{
                padding: "12px 26px",
                borderRadius: 12,
                border: `2px solid ${ZW.line}`,
                fontFamily: ZW.sans,
                fontWeight: 600,
                fontSize: 26,
                color: ZW.text,
              }}
            >
              Send
            </div>
            <div
              style={{
                padding: "12px 26px",
                borderRadius: 12,
                border: `2px solid ${ZW.cyan}`,
                backgroundColor: clicked ? ZW.cyan : `${ZW.cyan}22`,
                fontFamily: ZW.sans,
                fontWeight: 700,
                fontSize: 26,
                color: clicked ? ZW.ink : ZW.cyan,
              }}
            >
              Don&apos;t send
            </div>
          </div>
          <div style={{ marginTop: 18, height: 34, opacity: clicked ? 1 : 0 }}>
            <Pill text="Kept on this PC" color={ZW.jade} size={20} />
          </div>
        </div>
        <AbsoluteFill>
          <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={220}>
            <AbsoluteFill>
              <ProgramPacket />
            </AbsoluteFill>
          </HtmlInCanvasMotionBlur>
        </AbsoluteFill>
        <AbsoluteFill>
          <Cursor />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
