import { useGsapTimeline } from "@remotion/gsap";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { Panel, Pill, ZW } from "../components/ui";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Behaviours worded after zerowrite.ai; the weights are illustrative.
const BEHAVIOURS = [
  { text: "Adds a Run key to start again", w: 18 },
  { text: "Deletes shadow copies", w: 34 },
  { text: "Contacts an unknown address", w: 21 },
  { text: "Mass-renames files to one extension", w: 21 },
];
const SCORE_START = 4.0; // seconds
const STEP = 0.75;
const GAP = 1300; // distance between stations on the strip
const STEPS = ["Hold", "Score", "Verdict"];
const PAN = [3.3, 7.6]; // when the camera moves to station 2 and 3

const Station: React.FC<{ i: number; children: React.ReactNode }> = ({ i, children }) => (
  <div
    style={{
      position: "absolute",
      left: 960 + i * GAP - 560,
      top: 250,
      width: 1120,
      height: 620,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);

export const How: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let score = 0;
  BEHAVIOURS.forEach((b, i) => {
    score +=
      b.w *
      interpolate(t, [SCORE_START + i * STEP, SCORE_START + i * STEP + 0.4], [0, 1], clamp);
  });
  const gauge = score / 100;

  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      // Camera pans along the strip (with a slight push-in on arrival).
      .to(selector("[data-strip]"), { x: -GAP, duration: 0.9, ease: "power3.inOut" }, PAN[0])
      .to(selector("[data-strip]"), { x: -GAP * 2, duration: 0.9, ease: "power3.inOut" }, PAN[1])
      .fromTo(selector("[data-strip]"), { scale: 0.96 }, { scale: 1, duration: 3, ease: "sine.out" }, 0)
      // Steps rail.
      .to(selector("[data-step='0']"), { color: ZW.cyan, borderColor: ZW.cyan, duration: 0.3 }, 0.2)
      .to(selector("[data-step='1']"), { color: ZW.cyan, borderColor: ZW.cyan, duration: 0.3 }, PAN[0] + 0.4)
      .to(selector("[data-step='2']"), { color: ZW.cyan, borderColor: ZW.cyan, duration: 0.3 }, PAN[1] + 0.4)
      .fromTo(selector("[data-rail]"), { scaleX: 0 }, { scaleX: 0.5, duration: 0.9, ease: "power3.inOut" }, PAN[0])
      .to(selector("[data-rail]"), { scaleX: 1, duration: 0.9, ease: "power3.inOut" }, PAN[1])
      // Station 1: file drops onto the dial and is held.
      .from(selector("[data-file1]"), { y: -420, opacity: 0, duration: 0.7, ease: "bounce.out" }, 0.2)
      .fromTo(selector("[data-dial]"), { strokeDashoffset: 1200 }, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" }, 0.5)
      .from(selector("[data-held]"), { scale: 2.4, opacity: 0, rotate: -12, duration: 0.35, ease: "power4.in" }, 1.25)
      .from(selector("[data-note1]"), { y: 30, opacity: 0, duration: 0.5, ease: "power3.out" }, 1.6)
      // Station 2: behaviours appear one by one.
      .from(selector("[data-row]"), { x: -60, opacity: 0, duration: 0.4, ease: "power3.out", stagger: STEP }, SCORE_START)
      // Station 3: verdict stamp.
      .from(selector("[data-file3]"), { scale: 0.85, opacity: 0, duration: 0.5, ease: "power3.out" }, PAN[1] + 0.3)
      .from(selector("[data-stamp]"), { scale: 3, opacity: 0, rotate: 18, duration: 0.3, ease: "power4.in" }, PAN[1] + 0.9)
      .to(selector("[data-shake]"), { x: 6, duration: 0.04, repeat: 5, yoyo: true, ease: "none" }, PAN[1] + 1.2)
      .from(selector("[data-note3]"), { y: 30, opacity: 0, duration: 0.5, ease: "power3.out" }, PAN[1] + 1.4);
  });

  const level = gauge >= 0.75 ? "Critical" : gauge >= 0.5 ? "High" : gauge >= 0.25 ? "Medium" : "Low";
  const levelColor = gauge >= 0.75 ? ZW.red : gauge >= 0.5 ? ZW.amber : ZW.cyan;
  const arc = interpolate(gauge, [0, 1], [0, 1], { easing: Easing.linear, ...clamp });

  return (
    <AbsoluteFill ref={scope}>
      {/* Steps rail */}
      <div style={{ position: "absolute", top: 110, left: 560, right: 560, height: 60 }}>
        <div style={{ position: "absolute", top: 28, left: 40, right: 40, height: 4, backgroundColor: ZW.line }} />
        <div
          data-rail
          style={{
            position: "absolute",
            top: 28,
            left: 40,
            right: 40,
            height: 4,
            backgroundColor: ZW.cyan,
            transformOrigin: "0% 50%",
            transform: "scaleX(0)",
            boxShadow: `0 0 14px ${ZW.cyan}`,
          }}
        />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
          {STEPS.map((s, i) => (
            <div
              key={s}
              data-step={String(i)}
              style={{
                fontFamily: ZW.mono,
                fontWeight: 600,
                fontSize: 26,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: ZW.faint,
                backgroundColor: ZW.ink,
                border: `2px solid ${ZW.line}`,
                borderRadius: 12,
                padding: "10px 22px",
              }}
            >
              {i + 1} · {s}
            </div>
          ))}
        </div>
      </div>

      <AbsoluteFill data-strip style={{ transformOrigin: "960px 560px" }}>
        {/* 1. Hold */}
        <Station i={0}>
          <div style={{ position: "relative", width: 560, height: 560 }}>
            <svg width={560} height={560} style={{ position: "absolute" }}>
              <circle cx={280} cy={280} r={250} fill="none" stroke={ZW.line} strokeWidth={10} />
              <circle
                data-dial
                cx={280}
                cy={280}
                r={250}
                fill="none"
                stroke={ZW.cyan}
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={1200}
                transform="rotate(-90 280 280)"
                style={{ filter: `drop-shadow(0 0 10px ${ZW.cyan})` }}
              />
            </svg>
            <div data-file1 style={{ position: "absolute", left: 105, top: 170, width: 350 }}>
              <Panel glow={ZW.cyan} style={{ textAlign: "center", padding: 28 }}>
                <div style={{ fontFamily: ZW.mono, fontSize: 30, fontWeight: 600, color: ZW.text }}>
                  invoice_0423.exe
                </div>
                <div style={{ marginTop: 18 }}>
                  <span data-held style={{ display: "inline-block" }}>
                    <Pill text="Held" color={ZW.cyan} size={30} />
                  </span>
                </div>
              </Panel>
            </div>
          </div>
          <div
            data-note1
            style={{
              position: "absolute",
              bottom: -70,
              fontFamily: ZW.sans,
              fontWeight: 700,
              fontSize: 54,
              color: ZW.text,
            }}
          >
            Before its <span style={{ color: ZW.cyan }}>first instruction</span>
          </div>
        </Station>

        {/* 2. Score */}
        <Station i={1}>
          <Panel style={{ width: 1080, display: "flex", gap: 50, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: ZW.mono, fontSize: 24, color: ZW.faint, letterSpacing: 2 }}>
                BEHAVIOURS · invoice_0423.exe
              </div>
              {BEHAVIOURS.map((b) => (
                <div
                  key={b.text}
                  data-row
                  style={{
                    marginTop: 22,
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: ZW.sans,
                    fontSize: 32,
                    fontWeight: 600,
                    color: ZW.text,
                    padding: "14px 18px",
                    borderRadius: 14,
                    backgroundColor: "rgba(255,255,255,0.04)",
                  }}
                >
                  <span>{b.text}</span>
                  <span style={{ fontFamily: ZW.mono, color: ZW.amber }}>+{b.w}</span>
                </div>
              ))}
            </div>
            <div style={{ width: 300, height: 300, position: "relative" }}>
              <svg width={300} height={300}>
                <circle cx={150} cy={150} r={128} fill="none" stroke={ZW.line} strokeWidth={18} />
                <circle
                  cx={150}
                  cy={150}
                  r={128}
                  fill="none"
                  stroke={levelColor}
                  strokeWidth={18}
                  strokeLinecap="round"
                  strokeDasharray={`${arc * 804} 804`}
                  transform="rotate(-90 150 150)"
                  style={{ filter: `drop-shadow(0 0 12px ${levelColor})` }}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ fontFamily: ZW.mono, fontWeight: 600, fontSize: 92, color: ZW.text }}>
                  {Math.round(score)}
                </div>
                <div style={{ fontFamily: ZW.mono, fontSize: 26, letterSpacing: 2, color: levelColor }}>
                  {level.toUpperCase()}
                </div>
              </div>
            </div>
          </Panel>
        </Station>

        {/* 3. Verdict */}
        <Station i={2}>
          <div data-shake style={{ position: "relative" }}>
            <div data-file3>
              <Panel glow={ZW.red} style={{ width: 640, padding: 40 }}>
                <div style={{ fontFamily: ZW.mono, fontSize: 34, fontWeight: 600, color: ZW.text }}>
                  invoice_0423.exe
                </div>
                <div style={{ marginTop: 12, fontFamily: ZW.mono, fontSize: 24, color: ZW.muted }}>
                  Status: still waiting · never ran
                </div>
              </Panel>
            </div>
            <div
              data-stamp
              style={{
                position: "absolute",
                right: -60,
                top: -50,
                transform: "rotate(-8deg)",
                fontFamily: ZW.mono,
                fontWeight: 600,
                fontSize: 54,
                letterSpacing: 4,
                color: ZW.red,
                border: `6px solid ${ZW.red}`,
                borderRadius: 16,
                padding: "8px 24px",
                backgroundColor: "rgba(5,9,11,0.85)",
                boxShadow: `0 0 40px ${ZW.red}66`,
              }}
            >
              QUARANTINED
            </div>
          </div>
          <div
            data-note3
            style={{
              position: "absolute",
              bottom: -40,
              fontFamily: ZW.sans,
              fontWeight: 700,
              fontSize: 54,
              color: ZW.text,
              textAlign: "center",
            }}
          >
            Decided here, <span style={{ color: ZW.cyan }}>while the program is still waiting.</span>
          </div>
        </Station>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
