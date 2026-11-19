import { useGsapTimeline } from "@remotion/gsap";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Globe3D } from "../components/Globe3D";
import { Pill, ZW } from "../components/ui";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Seconds (scene time) matched to the voice line (voice starts at ~0.27 s).
export const GLOBE_AT = {
  ripple: 1.15, // "ripples out"
  checkin: 3.2, // "next check in"
  portal: 5.15, // "One portal"
  every: 6.1, // "every machine"
};
const F = (s: number) => Math.round(s * 30);
const TOTAL = 14; // machines on the globe (illustrative)

export const Globe: React.FC = () => {
  const frame = useCurrentFrame();
  const checked = Math.max(
    0,
    Math.min(TOTAL, Math.floor((frame - F(GLOBE_AT.checkin)) / 3) + 1),
  );
  const done = checked === TOTAL;
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-rev]"), { x: -60, opacity: 0, duration: 0.5, ease: "power3.out" }, 0.2)
      .from(selector("[data-count]"), { x: -60, opacity: 0, duration: 0.5, ease: "power3.out" }, GLOBE_AT.checkin - 0.3)
      .from(selector("[data-one]"), { y: 70, opacity: 0, duration: 0.55, ease: "power4.out" }, GLOBE_AT.portal)
      .from(selector("[data-every]"), { y: 70, opacity: 0, duration: 0.55, ease: "power4.out" }, GLOBE_AT.every);
  });
  const glow = interpolate(frame, [F(GLOBE_AT.every), F(GLOBE_AT.every) + 20], [0, 1], clamp);
  return (
    <AbsoluteFill ref={scope}>
      <Globe3D at={{ ripple: F(GLOBE_AT.ripple), checkin: F(GLOBE_AT.checkin), done: F(GLOBE_AT.every) }} />
      <AbsoluteFill>
        <div data-rev style={{ position: "absolute", left: 110, top: 190 }}>
          <Pill text="policy rev 4 · sent from the portal" color={ZW.jade} size={24} />
        </div>
        <div
          data-count
          style={{
            position: "absolute",
            left: 110,
            top: 260,
            fontFamily: ZW.mono,
            fontSize: 30,
            color: done ? ZW.jade : ZW.muted,
          }}
        >
          checked in{" "}
          <span style={{ fontFamily: ZW.sans, fontWeight: 800, fontSize: 64, color: done ? ZW.jade : ZW.text }}>
            {checked}
          </span>{" "}
          / {TOTAL}
        </div>
        <div
          style={{
            position: "absolute",
            left: 110,
            top: 470,
            fontFamily: ZW.sans,
            fontWeight: 800,
            fontSize: 104,
            lineHeight: 1.0,
            letterSpacing: -3,
            color: ZW.text,
          }}
        >
          <div data-one>One portal,</div>
          <div
            data-every
            style={{ color: ZW.cyan, textShadow: `0 0 ${40 * glow}px ${ZW.cyan}aa` }}
          >
            every machine.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
