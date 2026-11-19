import { useGsapTimeline } from "@remotion/gsap";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Shadow3D } from "../components/Shadow3D";
import { SignHeader } from "../components/SignHeader";
import { Panel, Pill, ZW } from "../components/ui";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Seconds (scene time) matched to the voice line.
export const SHADOW_AT = {
  panel: 1.3, // "It deletes your way back."
  delete: 2.9, // "deletes volume shadow copies"
  gap: 0.28, // between panes
  restore: 5.2, // "so your files cannot be restored."
};
const F = (s: number) => Math.round(s * 30);

// Illustrative restore points.
const POINTS = ["Today 09:00", "Tue 18:00", "Mon 09:00", "Sun 18:00", "Sat 09:00"];

export const Shadow: React.FC = () => {
  const frame = useCurrentFrame();
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-panel]"), { x: 180, opacity: 0, rotateY: -25, duration: 0.6, ease: "power3.out" }, SHADOW_AT.panel)
      .from(selector("[data-chip]"), { y: 30, opacity: 0, duration: 0.4, ease: "back.out(2)" }, SHADOW_AT.delete - 0.1)
      .to(selector("[data-cam]"), { scale: 1.04, duration: 7, ease: "none" }, 0);
  });
  const stamp = interpolate(frame, [F(SHADOW_AT.restore), F(SHADOW_AT.restore) + 6], [1.8, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  return (
    <AbsoluteFill ref={scope} style={{ perspective: 1600 }}>
      <AbsoluteFill data-cam>
        <Shadow3D startAt={F(SHADOW_AT.delete)} gap={F(SHADOW_AT.gap)} />
        <SignHeader n={2} title={<>It deletes <span style={{ color: ZW.red }}>your way back.</span></>} />
        <div data-panel style={{ position: "absolute", left: 1130, top: 300 }}>
          <Panel style={{ width: 640, padding: 30, position: "relative" }} glow={frame >= F(SHADOW_AT.delete) ? ZW.red : ZW.cyan}>
            <div style={{ fontFamily: ZW.mono, fontSize: 22, letterSpacing: 2, color: ZW.muted }}>VOLUME SHADOW COPIES</div>
            {POINTS.map((p, i) => {
              const gone = frame >= F(SHADOW_AT.delete + i * SHADOW_AT.gap);
              return (
                <div
                  key={p}
                  style={{
                    marginTop: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontFamily: ZW.mono,
                    fontSize: 28,
                    color: gone ? ZW.red : ZW.text,
                    opacity: gone ? 0.6 : 1,
                    textDecoration: gone ? "line-through" : "none",
                  }}
                >
                  <span>Restore point · {p}</span>
                  <span style={{ fontSize: 20, color: gone ? ZW.red : ZW.jade }}>{gone ? "DELETED" : "OK"}</span>
                </div>
              );
            })}
            <div data-chip style={{ marginTop: 28, display: "flex", gap: 14, alignItems: "center" }}>
              <Pill text="deletes volume shadow copies" color={ZW.red} size={20} />
              <span style={{ fontFamily: ZW.mono, fontSize: 24, color: ZW.red }}>+32</span>
            </div>
          </Panel>
        </div>
        {frame >= F(SHADOW_AT.restore) ? (
          <div
            style={{
              position: "absolute",
              left: 170,
              top: 470,
              transform: `rotate(-5deg) scale(${stamp})`,
              fontFamily: ZW.mono,
              fontWeight: 700,
              fontSize: 58,
              letterSpacing: 3,
              color: ZW.red,
              border: `5px solid ${ZW.red}`,
              borderRadius: 14,
              padding: "12px 28px",
              backgroundColor: "#16070acc",
              boxShadow: `0 0 60px ${ZW.red}55`,
            }}
          >
            NO WAY TO RESTORE
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
