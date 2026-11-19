import { useGsapTimeline } from "@remotion/gsap";
import { AbsoluteFill } from "remotion";
import { Panel, Pill, ZW } from "../components/ui";

const LINE1 = "By the time an alert fires,".split(" ");
const LINE2 = ["the", "damage", "has", "started."];

// Kinetic headline over a wall of files that turn red from the centre out.
export const Hook: React.FC = () => {
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-tile]"), {
        opacity: 0,
        scale: 0.6,
        duration: 0.5,
        ease: "power2.out",
        stagger: { each: 0.004, from: "center" },
      })
      .from(
        selector("[data-w1]"),
        {
          yPercent: 110,
          opacity: 0,
          filter: "blur(12px)",
          duration: 0.45,
          ease: "power4.out",
          stagger: 0.07,
        },
        0.2,
      )
      .from(
        selector("[data-alert]"),
        { x: 520, opacity: 0, duration: 0.5, ease: "back.out(1.6)" },
        0.9,
      )
      .to(
        selector("[data-tile]"),
        {
          backgroundColor: `${ZW.red}55`,
          borderColor: ZW.red,
          duration: 0.25,
          stagger: { each: 0.006, from: "center" },
        },
        1.35,
      )
      .from(
        selector("[data-w2]"),
        {
          yPercent: 110,
          opacity: 0,
          filter: "blur(12px)",
          duration: 0.45,
          ease: "power4.out",
          stagger: 0.09,
        },
        1.45,
      )
      .fromTo(
        selector("[data-damage]"),
        { x: -8 },
        { x: 0, duration: 0.05, repeat: 7, yoyo: true, ease: "none" },
        1.7,
      )
      .to(selector("[data-wall]"), { scale: 1.08, duration: 2.6, ease: "none" }, 0.8);
  });

  const tiles = [];
  for (let i = 0; i < 16 * 9; i++) {
    tiles.push(
      <div
        key={i}
        data-tile
        style={{
          width: 96,
          height: 96,
          borderRadius: 14,
          border: `2px solid ${ZW.cyanDeep}66`,
          backgroundColor: `${ZW.cyanDeep}1a`,
        }}
      />,
    );
  }

  return (
    <AbsoluteFill ref={scope}>
      <AbsoluteFill
        data-wall
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(16, 96px)",
          gap: 22,
          justifyContent: "center",
          alignContent: "center",
          opacity: 0.45,
        }}
      >
        {tiles}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 50%, rgba(5,9,11,0.94), rgba(5,9,11,0.35))",
        }}
      />
      <div
        data-alert
        style={{ position: "absolute", top: 80, right: 90, width: 470 }}
      >
        <Panel glow={ZW.red} style={{ padding: 24 }}>
          <Pill text="Alert" color={ZW.red} />
          <div
            style={{
              marginTop: 14,
              fontFamily: ZW.mono,
              fontSize: 22,
              color: ZW.text,
              lineHeight: 1.45,
            }}
          >
            Threat detected on FIN-LT-022
            <br />
            <span style={{ color: ZW.muted }}>files already encrypting…</span>
          </div>
        </Panel>
      </div>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          fontFamily: ZW.sans,
          fontWeight: 800,
          fontSize: 110,
          letterSpacing: -3,
          lineHeight: 1.08,
          color: ZW.text,
          textAlign: "center",
        }}
      >
        <div style={{ overflow: "hidden", paddingBottom: 8 }}>
          {LINE1.map((w, i) => (
            <span key={i} data-w1 style={{ display: "inline-block", marginRight: 28 }}>
              {w}
            </span>
          ))}
        </div>
        <div style={{ overflow: "hidden", paddingBottom: 8 }}>
          {LINE2.map((w, i) => (
            <span
              key={i}
              data-w2
              style={{
                display: "inline-block",
                marginRight: 28,
                color: w === "damage" ? ZW.red : ZW.text,
              }}
            >
              <span data-damage={w === "damage" ? true : undefined} style={{ display: "inline-block" }}>
                {w}
              </span>
            </span>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
