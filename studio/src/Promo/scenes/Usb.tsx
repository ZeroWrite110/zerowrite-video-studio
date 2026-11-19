import { useGsapTimeline } from "@remotion/gsap";
import { HtmlInCanvasMotionBlur } from "@remotion/motion-blur";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo, Panel, Pill, ZW } from "../components/ui";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Seconds (scene time) matched to the voice line.
export const USB_AT = { plug: 0.5, scanned: 2.35, portal: 2.95 };

// Port on the side of a laptop body (left half of the frame).
const PORT_X = 660;
const PORT_Y = 470;

const Stick: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [USB_AT.plug * 30, USB_AT.plug * 30 + 10], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.3, 0.9, 0.2, 1),
  });
  const x = interpolate(p, [0, 1], [-500, PORT_X - 330]);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: x,
          top: PORT_Y - 45,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 250,
            height: 90,
            borderRadius: 18,
            background: `linear-gradient(180deg, #2a3a40, #152024)`,
            border: `2px solid ${ZW.line}`,
            boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: ZW.mono,
            fontSize: 26,
            color: ZW.muted,
          }}
        >
          USB
        </div>
        <div
          style={{
            width: 80,
            height: 52,
            borderRadius: 4,
            background: "linear-gradient(180deg, #c9d1d4, #8b9599)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Policy pulses travelling from the portal to six machines.
const Network: React.FC = () => {
  const frame = useCurrentFrame();
  const start = USB_AT.portal * 30;
  const hub = { x: 1400, y: 330 };
  const nodes = [0, 1, 2, 3, 4].map((i) => ({
    x: 1060 + i * 170,
    y: 690 + Math.abs(i - 2) * -40,
  }));
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {nodes.map((n, i) => {
        const d = interpolate(frame, [start + i * 3, start + 18 + i * 3], [0, 1], clamp);
        const pulse = interpolate(frame, [start + 14 + i * 3, start + 34 + i * 3], [0, 1], clamp);
        const px = hub.x + (n.x - hub.x) * pulse;
        const py = hub.y + (n.y - hub.y) * pulse;
        const got = pulse >= 1;
        return (
          <g key={i}>
            <line
              x1={hub.x}
              y1={hub.y}
              x2={hub.x + (n.x - hub.x) * d}
              y2={hub.y + (n.y - hub.y) * d}
              stroke={ZW.cyan}
              strokeOpacity={0.45}
              strokeWidth={3}
              strokeDasharray="10 10"
              strokeDashoffset={-frame * 2}
            />
            {pulse > 0 && !got ? <circle cx={px} cy={py} r={10} fill={ZW.cyanBright} /> : null}
            <rect
              x={n.x - 64}
              y={n.y - 42}
              width={128}
              height={84}
              rx={12}
              fill={got ? `${ZW.jade}30` : "rgba(14,21,24,0.95)"}
              stroke={got ? ZW.jade : ZW.line}
              strokeWidth={3}
              opacity={interpolate(frame, [start - 6 + i * 2, start + 4 + i * 2], [0, 1], clamp)}
            />
            {got ? (
              <path
                d={`M${n.x - 20} ${n.y} l14 14 l28 -30`}
                fill="none"
                stroke={ZW.jade}
                strokeWidth={6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};

export const Usb: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const plugged = frame >= USB_AT.plug * 30 + 10;
  const scan = interpolate(frame, [USB_AT.plug * 30 + 10, USB_AT.scanned * 30], [0, 1], clamp);
  const done = scan >= 1;
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-laptop]"), { x: -80, opacity: 0, duration: 0.5, ease: "power3.out" }, 0)
      .fromTo(
        selector("[data-ring]"),
        { scale: 0.3, opacity: 0.9 },
        { scale: 2.2, opacity: 0, duration: 0.9, ease: "power2.out", repeat: 1 },
        USB_AT.plug + 0.35,
      )
      .from(selector("[data-portal]"), { y: -60, opacity: 0, duration: 0.5, ease: "power3.out" }, USB_AT.portal - 0.3)
      .to(selector("[data-cam]"), { scale: 1.05, duration: 6, ease: "none" }, 0);
  });
  return (
    <AbsoluteFill ref={scope}>
      <AbsoluteFill data-cam>
        {/* Laptop body seen side-on with a port */}
        <div
          data-laptop
          style={{
            position: "absolute",
            left: PORT_X,
            top: 290,
            width: 300,
            height: 360,
            borderRadius: 28,
            background: "linear-gradient(90deg, #1b2a30, #0f181b)",
            border: `2px solid ${plugged ? (done ? ZW.jade : ZW.cyan) : ZW.line}`,
            boxShadow: `0 40px 90px rgba(0,0,0,0.55), 0 0 60px ${plugged ? (done ? ZW.jade : ZW.cyan) : "transparent"}44`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -4,
              top: PORT_Y - 290 - 30,
              width: 24,
              height: 60,
              borderRadius: 4,
              backgroundColor: "#05090B",
              border: `2px solid ${ZW.line}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
            }}
          >
            <Logo size={110} style={{ opacity: plugged ? 1 : 0.35 }} />
            <div style={{ fontFamily: ZW.mono, fontSize: 24, color: ZW.muted }}>WINDOWS PC</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[0, 1, 2, 3, 4].map((v) => (
                <div
                  key={v}
                  style={{ width: 26, height: 6, borderRadius: 3, backgroundColor: ZW.line }}
                />
              ))}
            </div>
          </div>
          <div
            data-ring
            style={{
              position: "absolute",
              left: -110,
              top: PORT_Y - 290 - 110,
              width: 220,
              height: 220,
              borderRadius: 220,
              border: `5px solid ${ZW.cyanBright}`,
              opacity: 0,
            }}
          />
        </div>
        <HtmlInCanvasMotionBlur width={width} height={height} samples={8} shutterAngle={220}>
          <Stick />
        </HtmlInCanvasMotionBlur>
        {/* Scan status card */}
        <div style={{ position: "absolute", left: 300, top: 700, opacity: plugged ? 1 : 0 }}>
          <Panel style={{ width: 640, padding: 26 }} glow={done ? ZW.jade : ZW.cyan}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: ZW.mono, fontSize: 28, color: ZW.text }}>
                {done ? "Removable drive scanned" : "Scanning removable drive"}
              </span>
              <Pill text={done ? "Done" : `${Math.round(scan * 100)}%`} color={done ? ZW.jade : ZW.cyan} />
            </div>
            <div
              style={{
                marginTop: 18,
                height: 12,
                borderRadius: 6,
                backgroundColor: "rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${scan * 100}%`,
                  height: "100%",
                  backgroundColor: done ? ZW.jade : ZW.cyan,
                  boxShadow: `0 0 16px ${done ? ZW.jade : ZW.cyan}`,
                }}
              />
            </div>
          </Panel>
        </div>
        {/* Portal + fleet */}
        <Network />
        <div data-portal style={{ position: "absolute", left: 1180, top: 200 }}>
          <Panel style={{ width: 440, padding: 22, display: "flex", alignItems: "center", gap: 16 }} glow={ZW.cyan}>
            <Logo size={56} />
            <div>
              <div style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 32, color: ZW.text }}>
                One portal
              </div>
              <div style={{ fontFamily: ZW.mono, fontSize: 20, color: ZW.muted }}>policy → all machines</div>
            </div>
          </Panel>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
