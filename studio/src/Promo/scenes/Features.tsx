import { useGsapTimeline } from "@remotion/gsap";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Pill, ZW } from "../components/ui";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// When each feature is spoken (seconds into the scene).
export const FEATURE_AT = [0.3, 3.1, 5.4, 8.7];

const Toggle: React.FC<{ on: number; color: string }> = ({ on, color }) => (
  <div
    style={{
      width: 120,
      height: 64,
      borderRadius: 64,
      backgroundColor: on > 0.5 ? `${color}` : "rgba(255,255,255,0.12)",
      position: "relative",
      boxShadow: on > 0.5 ? `0 0 24px ${color}88` : "none",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 6,
        left: 6 + on * 56,
        width: 52,
        height: 52,
        borderRadius: 52,
        backgroundColor: "#fff",
      }}
    />
  </div>
);

const Machines: React.FC<{ t: number }> = ({ t }) => {
  const pushed = interpolate(t, [FEATURE_AT[3] + 0.3, FEATURE_AT[3] + 1.3], [0, 24], clamp);
  const isolated = t > FEATURE_AT[3] + 1.6;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
      {new Array(24).fill(0).map((_, i) => {
        const bad = i === 15 && isolated;
        return (
          <div
            key={i}
            style={{
              height: 42,
              borderRadius: 8,
              border: `2px solid ${bad ? ZW.red : i < pushed ? ZW.jade : ZW.line}`,
              backgroundColor: bad ? `${ZW.red}44` : i < pushed ? `${ZW.jade}26` : "transparent",
              boxShadow: bad ? `0 0 18px ${ZW.red}` : "none",
            }}
          />
        );
      })}
    </div>
  );
};

const Icon: React.FC<{ d: string; color: string }> = ({ d, color }) => (
  <svg width={84} height={84} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  usb: "M9 2h6v6H9z M7 8h10v9a5 5 0 0 1-10 0z M10 4h1 M13 4h1",
  quarantine: "M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z M9 12l2 2 4-4",
  lock: "M6 10h12v11H6z M8 10V7a4 4 0 0 1 8 0v3 M12 14v3",
  fleet: "M3 4h18v12H3z M8 20h8 M12 16v4",
};

export const Features: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const active = FEATURE_AT.reduce((a, at, i) => (t >= at ? i : a), 0);

  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline.from(selector("[data-title] span"), { y: 50, opacity: 0, duration: 0.5, ease: "power3.out", stagger: 0.05 }, 0);
    FEATURE_AT.forEach((at, i) => {
      timeline.from(
        selector(`[data-card='${i}']`),
        { y: 160, rotateY: -35, opacity: 0, duration: 0.7, ease: "power4.out" },
        Math.max(0, at - 0.25),
      );
    });
    timeline.fromTo(selector("[data-deck]"), { rotateY: 8 }, { rotateY: -8, duration: 11, ease: "none" }, 0);
  });

  const usbScan = interpolate(t, [FEATURE_AT[0] + 0.5, FEATURE_AT[0] + 2.2], [0, 1], clamp);
  const autoQ = interpolate(t, [FEATURE_AT[1] + 0.5, FEATURE_AT[1] + 0.75], [0, 1], clamp);
  const tamper = interpolate(t, [FEATURE_AT[2] + 0.6, FEATURE_AT[2] + 0.85], [0, 1], clamp);

  const cards = [
    {
      icon: ICONS.usb,
      color: ZW.cyan,
      title: "USB scan",
      text: "Removable drives are scanned the moment they are connected.",
      body: (
        <div>
          <div style={{ height: 14, borderRadius: 7, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ width: `${usbScan * 100}%`, height: "100%", backgroundColor: ZW.cyan, boxShadow: `0 0 16px ${ZW.cyan}` }} />
          </div>
          <div style={{ marginTop: 12, fontFamily: ZW.mono, fontSize: 22, color: ZW.muted }}>
            E:\ {usbScan < 1 ? `scanning ${Math.round(usbScan * 100)}%` : "checked"}
          </div>
        </div>
      ),
    },
    {
      icon: ICONS.quarantine,
      color: ZW.red,
      title: "Auto-quarantine",
      text: "Quarantine Critical files without waiting for a decision.",
      body: <Toggle on={autoQ} color={ZW.red} />,
    },
    {
      icon: ICONS.lock,
      color: ZW.amber,
      title: "Tamper protection",
      text: "Only this account may lower protection.",
      body: <Toggle on={tamper} color={ZW.amber} />,
    },
    {
      icon: ICONS.fleet,
      color: ZW.jade,
      title: "Fleet portal",
      text: "One portal pushes policy to every machine.",
      body: <Machines t={t} />,
    },
  ];

  return (
    <AbsoluteFill ref={scope}>
      <div
        data-title
        style={{
          position: "absolute",
          top: 96,
          width: "100%",
          textAlign: "center",
          fontFamily: ZW.sans,
          fontWeight: 800,
          fontSize: 72,
          letterSpacing: -2,
          color: ZW.text,
        }}
      >
        {"What's inside ZeroWrite".split(" ").map((w, i) => (
          <span key={i} style={{ display: "inline-block", marginRight: 20 }}>
            {w}
          </span>
        ))}
      </div>
      <AbsoluteFill style={{ perspective: 1800 }}>
        <div
          data-deck
          style={{
            position: "absolute",
            top: 270,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 36,
            transformStyle: "preserve-3d",
          }}
        >
          {cards.map((c, i) => {
            const on = i === active;
            return (
              <div key={c.title} data-card={String(i)}>
              <div
                style={{
                  width: 400,
                  height: 560,
                  borderRadius: 28,
                  padding: 34,
                  backgroundColor: "rgba(14,21,24,0.94)",
                  border: `2px solid ${on ? c.color : ZW.line}`,
                  boxShadow: on ? `0 0 70px ${c.color}44, 0 40px 90px rgba(0,0,0,0.6)` : "0 40px 90px rgba(0,0,0,0.5)",
                  transform: `scale(${on ? 1.06 : 0.97})`,
                  opacity: on ? 1 : 0.55,
                  display: "flex",
                  flexDirection: "column",
                  gap: 22,
                }}
              >
                <Icon d={c.icon} color={c.color} />
                <Pill text={c.title} color={c.color} style={{ alignSelf: "flex-start" }} />
                <div style={{ fontFamily: ZW.sans, fontWeight: 600, fontSize: 32, lineHeight: 1.3, color: ZW.text, flex: 1 }}>
                  {c.text}
                </div>
                {c.body}
              </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
