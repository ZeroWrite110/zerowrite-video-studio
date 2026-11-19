import { useGsapTimeline } from "@remotion/gsap";
import { AbsoluteFill } from "remotion";
import { Rings3D } from "../components/Rings3D";
import { Logo, ZW } from "../components/ui";

// Brand reveal: 3D rings open around the logo, wordmark letters cascade in.
export const Reveal: React.FC = () => {
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-logo]"), {
        scale: 0.3,
        opacity: 0,
        rotate: -25,
        duration: 0.8,
        ease: "back.out(1.7)",
      }, 0.05)
      .from(selector("[data-glow]"), { opacity: 0, scale: 0.5, duration: 0.9, ease: "power2.out" }, 0.1)
      .from(selector("[data-ch]"), {
        y: 70,
        opacity: 0,
        rotateX: -90,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.035,
      }, 0.45)
      .from(selector("[data-tag]"), { y: 30, opacity: 0, filter: "blur(10px)", duration: 0.6, ease: "power3.out" }, 1.1)
      .to(selector("[data-logo]"), { y: -8, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: 2 }, 0.9);
  });
  const word = "ZeroWrite";
  return (
    <AbsoluteFill ref={scope}>
      <AbsoluteFill style={{ top: -170 }}>
        <Rings3D scale={0.66} />
      </AbsoluteFill>
      <div
        data-glow
        style={{
          position: "absolute",
          left: 960 - 330,
          top: 380 - 330,
          width: 660,
          height: 660,
          borderRadius: 660,
          background: `radial-gradient(circle, ${ZW.cyan}55, transparent 65%)`,
        }}
      />
      <div data-logo style={{ position: "absolute", left: 960 - 150, top: 380 - 150 }}>
        <Logo size={300} style={{ filter: `drop-shadow(0 0 40px ${ZW.cyan}88)` }} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 720,
          width: "100%",
          textAlign: "center",
          fontFamily: ZW.sans,
          fontWeight: 800,
          fontSize: 120,
          letterSpacing: -3,
          color: ZW.text,
          perspective: 800,
        }}
      >
        {word.split("").map((c, i) => (
          <span key={i} data-ch style={{ display: "inline-block" }}>
            {c}
          </span>
        ))}
        <span data-ch style={{ display: "inline-block", color: ZW.cyan }}>
          .ai
        </span>
      </div>
      <div
        data-tag
        style={{
          position: "absolute",
          top: 880,
          width: "100%",
          textAlign: "center",
          fontFamily: ZW.sans,
          fontWeight: 600,
          fontSize: 46,
          color: ZW.muted,
        }}
      >
        Stop threats <span style={{ color: ZW.cyan }}>before</span> they run.
      </div>
    </AbsoluteFill>
  );
};
