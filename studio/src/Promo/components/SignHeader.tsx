import { useGsapTimeline } from "@remotion/gsap";
import { ZW } from "./ui";

// "SIGN n" badge plus headline, used by the three sign scenes of video 07.
export const SignHeader: React.FC<{ n: number; title: React.ReactNode; color?: string }> = ({
  n,
  title,
  color = ZW.red,
}) => {
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-badge]"), { scale: 2.4, opacity: 0, duration: 0.35, ease: "power3.in" }, 0.15)
      .from(selector("[data-title]"), { x: -70, opacity: 0, duration: 0.55, ease: "power3.out" }, 0.45);
  });
  return (
    <div
      ref={scope}
      style={{ position: "absolute", left: 150, top: 138, display: "flex", alignItems: "center", gap: 34 }}
    >
      <div
        data-badge
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "10px 22px",
          borderRadius: 16,
          border: `3px solid ${color}`,
          backgroundColor: `${color}1f`,
          boxShadow: `0 0 40px ${color}44`,
        }}
      >
        <span style={{ fontFamily: ZW.mono, fontWeight: 600, fontSize: 26, letterSpacing: 3, color }}>SIGN</span>
        <span style={{ fontFamily: ZW.sans, fontWeight: 800, fontSize: 56, color, lineHeight: 1 }}>{n}</span>
      </div>
      <div
        data-title
        style={{ fontFamily: ZW.sans, fontWeight: 800, fontSize: 62, letterSpacing: -1.5, color: ZW.text }}
      >
        {title}
      </div>
    </div>
  );
};
