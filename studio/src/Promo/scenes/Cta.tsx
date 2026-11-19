import { useGsapTimeline } from "@remotion/gsap";
import { AbsoluteFill } from "remotion";
import { Rings3D } from "../components/Rings3D";
import { Logo, Wordmark, ZW } from "../components/ui";

export const CLICK_AT = 4.6; // seconds: cursor presses the button

export const Cta: React.FC = () => {
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .from(selector("[data-brand]"), { y: -40, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.1)
      .from(selector("[data-head] span"), {
        y: 80,
        opacity: 0,
        filter: "blur(14px)",
        duration: 0.6,
        ease: "power4.out",
        stagger: 0.07,
      }, 0.5)
      .from(selector("[data-sub]"), { y: 30, opacity: 0, duration: 0.5, ease: "power3.out" }, 2.4)
      .from(selector("[data-btn]"), { scale: 0.6, opacity: 0, duration: 0.6, ease: "back.out(2)" }, 3.4)
      .fromTo(selector("[data-cursor]"), { x: 420, y: 260, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.9, ease: "power3.inOut" }, 3.7)
      .to(selector("[data-btn]"), { scale: 0.94, duration: 0.08, yoyo: true, repeat: 1 }, CLICK_AT)
      .fromTo(selector("[data-ripple]"), { scale: 0.2, opacity: 0.9 }, { scale: 2.6, opacity: 0, duration: 0.7, ease: "power2.out" }, CLICK_AT)
      .from(selector("[data-url]"), { y: 30, opacity: 0, duration: 0.5, ease: "power3.out" }, 5.2);
  });

  return (
    <AbsoluteFill ref={scope}>
      <AbsoluteFill style={{ opacity: 0.4, filter: "blur(2px)" }}>
        <Rings3D scale={1.15} intro={40} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 50% 50%, rgba(5,9,11,0.82), transparent 80%)",
        }}
      />
      <div
        data-brand
        style={{
          position: "absolute",
          top: 120,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 22,
        }}
      >
        <Logo size={96} style={{ filter: `drop-shadow(0 0 24px ${ZW.cyan}88)` }} />
        <Wordmark size={60} />
      </div>
      <div
        data-head
        style={{
          position: "absolute",
          top: 300,
          width: "100%",
          textAlign: "center",
          fontFamily: ZW.sans,
          fontWeight: 800,
          fontSize: 112,
          letterSpacing: -3,
          color: ZW.text,
        }}
      >
        {["Stop", "threats", "before", "they", "run."].map((w) => (
          <span
            key={w}
            style={{
              display: "inline-block",
              marginRight: 30,
              color: w === "before" ? ZW.cyan : ZW.text,
            }}
          >
            {w}
          </span>
        ))}
      </div>
      <div
        data-sub
        style={{
          position: "absolute",
          top: 480,
          width: "100%",
          textAlign: "center",
          fontFamily: ZW.sans,
          fontWeight: 500,
          fontSize: 40,
          color: ZW.muted,
        }}
      >
        Every new program is paused, read and judged before it can run.
      </div>
      <div
        style={{
          position: "absolute",
          top: 610,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div data-btn style={{ position: "relative" }}>
          <div
            data-ripple
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 200,
              height: 200,
              marginLeft: -100,
              marginTop: -100,
              borderRadius: 200,
              border: `4px solid ${ZW.cyanBright}`,
              opacity: 0,
            }}
          />
          <div
            style={{
              fontFamily: ZW.sans,
              fontWeight: 700,
              fontSize: 46,
              color: ZW.ink,
              backgroundColor: ZW.cyan,
              borderRadius: 999,
              padding: "26px 64px",
              boxShadow: `0 0 60px ${ZW.cyan}88`,
            }}
          >
            Start free trial
          </div>
          <div data-cursor style={{ position: "absolute", left: "62%", top: "58%" }}>
            <svg width={56} height={56} viewBox="0 0 24 24">
              <path d="M4 2l15 10-7 1.5L8.5 21z" fill="#fff" stroke={ZW.ink} strokeWidth={1.4} />
            </svg>
          </div>
        </div>
      </div>
      <div
        data-url
        style={{
          position: "absolute",
          top: 800,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: ZW.mono, fontWeight: 600, fontSize: 64, color: ZW.cyan }}>
          zerowrite.ai
        </div>
        <div style={{ marginTop: 16, fontFamily: ZW.sans, fontSize: 32, color: ZW.muted }}>
          Windows 10 &amp; 11 · Free trial · No card needed
        </div>
      </div>
    </AbsoluteFill>
  );
};
