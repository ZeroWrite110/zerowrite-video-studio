import { useGsapTimeline } from "@remotion/gsap";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Logo, Panel, Pill, ZW } from "../components/ui";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Seconds (scene time) matched to the voice line.
export const GUARD_AT = {
  sources: [0.3, 1.03, 1.85], // "Downloads, scripts and injected code"
  gate: 3.75, // "...the same checkpoint"
  browser: 4.3, // "A browser extension checks files"
  arrived: 6.55, // "...as they arrive from the web"
  cleanup: 7.65, // "And what is left to clean up?"
  only: 8.9, // "Only the quarantined program"
};

const SOURCES = [
  { label: "Downloads", ext: "EXE", y: 250 },
  { label: "Scripts", ext: "PS1", y: 470 },
  { label: "Injected code", ext: "DLL", y: 690 },
];
const GATE = { x: 1180, y: 510 };

// Packets travel from each source card into the checkpoint along a curve.
const Streams: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {SOURCES.map((s, i) => {
        const start = GUARD_AT.sources[i] * 30 + 8;
        const sx = 610;
        const sy = s.y + 60;
        const cx = 880;
        const d = `M${sx} ${sy} C ${cx} ${sy}, ${cx} ${GATE.y}, ${GATE.x - 150} ${GATE.y}`;
        const draw = interpolate(frame, [start, start + 14], [0, 1], clamp);
        return (
          <g key={s.label}>
            <path
              d={d}
              fill="none"
              stroke={ZW.cyan}
              strokeOpacity={0.4}
              strokeWidth={3}
              pathLength={1}
              strokeDasharray={`${draw} 1`}
            />
            {draw >= 1
              ? [0, 1, 2].map((k) => {
                  const p = ((frame - start - 14 + k * 12) % 36) / 36;
                  // point on the cubic bezier
                  const u = 1 - p;
                  const x = u ** 3 * sx + 3 * u * u * p * cx + 3 * u * p * p * cx + p ** 3 * (GATE.x - 150);
                  const y = u ** 3 * sy + 3 * u * u * p * sy + 3 * u * p * p * GATE.y + p ** 3 * GATE.y;
                  return <circle key={k} cx={x} cy={y} r={8} fill={ZW.cyanBright} opacity={0.4 + 0.6 * Math.sin(p * Math.PI)} />;
                })
              : null}
          </g>
        );
      })}
    </svg>
  );
};

// The checkpoint: concentric rotating rings around the logo.
const Gate: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [GUARD_AT.gate * 30, GUARD_AT.gate * 30 + 10], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: GATE.x - 170, top: GATE.y - 170, width: 340, height: 340 }}>
      {[0, 1, 2].map((r) => (
        <div
          key={r}
          style={{
            position: "absolute",
            inset: r * 34,
            borderRadius: 999,
            border: `${4 - r}px ${r === 1 ? "dashed" : "solid"} ${r === 0 ? ZW.cyan : ZW.cyanDeep}`,
            transform: `rotate(${(r % 2 ? -1 : 1) * frame * (1.2 + r)}deg)`,
            boxShadow: r === 0 ? `0 0 ${30 + glow * 60}px ${ZW.cyan}${glow > 0.5 ? "88" : "44"}` : undefined,
          }}
        />
      ))}
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <Logo size={120} />
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 360, textAlign: "center", opacity: glow }}>
        <Pill text="One checkpoint" color={ZW.cyan} />
      </div>
    </div>
  );
};

const BrowserGuard: React.FC = () => {
  const frame = useCurrentFrame();
  const scan = interpolate(frame, [GUARD_AT.browser * 30 + 18, GUARD_AT.arrived * 30], [0, 1], clamp);
  const done = scan >= 1;
  return (
    <div style={{ position: "absolute", left: 360, top: 200, width: 1200 }}>
      <div
        style={{
          borderRadius: 22,
          overflow: "hidden",
          backgroundColor: "#0b1215",
          border: `2px solid ${ZW.line}`,
          boxShadow: "0 50px 120px rgba(0,0,0,0.65)",
        }}
      >
        <div style={{ height: 70, backgroundColor: "#111b1f", display: "flex", alignItems: "center", gap: 14, padding: "0 24px" }}>
          {["#F03E4D", "#E09112", "#2FD68C"].map((c) => (
            <div key={c} style={{ width: 16, height: 16, borderRadius: 16, backgroundColor: c, opacity: 0.8 }} />
          ))}
          <div style={{ marginLeft: 24, flex: 1, height: 40, borderRadius: 20, backgroundColor: "#05090B", display: "flex", alignItems: "center", padding: "0 20px", fontFamily: ZW.mono, fontSize: 20, color: ZW.muted }}>
            https://vendor.example/downloads
          </div>
          {/* extension button */}
          <div
            data-ext
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              display: "grid",
              placeItems: "center",
              backgroundColor: `${ZW.cyan}22`,
              border: `2px solid ${ZW.cyan}`,
              boxShadow: `0 0 ${20 + 20 * Math.abs(Math.sin(frame / 8))}px ${ZW.cyan}66`,
            }}
          >
            <Logo size={34} />
          </div>
        </div>
        <div style={{ padding: 50, height: 330, position: "relative" }}>
          <div style={{ width: 460, height: 40, borderRadius: 10, backgroundColor: "#1a262b" }} />
          <div style={{ width: 760, height: 16, borderRadius: 8, backgroundColor: "#141f23", marginTop: 26 }} />
          <div style={{ width: 640, height: 16, borderRadius: 8, backgroundColor: "#141f23", marginTop: 16 }} />
          {/* extension popover */}
          <div data-pop style={{ position: "absolute", right: 30, top: 14 }}>
            <Panel style={{ width: 520, padding: 24 }} glow={done ? ZW.jade : ZW.cyan}>
              <div style={{ fontFamily: ZW.mono, fontSize: 20, color: ZW.muted, letterSpacing: 2 }}>ZEROWRITE · DOWNLOAD GUARD</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                <span style={{ fontFamily: ZW.mono, fontSize: 28, color: ZW.text }}>setup_x64.exe</span>
                <Pill text={done ? "Checked" : "Checking"} color={done ? ZW.jade : ZW.cyan} />
              </div>
              <div style={{ marginTop: 18, height: 10, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ width: `${scan * 100}%`, height: "100%", backgroundColor: done ? ZW.jade : ZW.cyan }} />
              </div>
              <div style={{ marginTop: 14, fontFamily: ZW.sans, fontSize: 24, color: ZW.muted }}>checked as it arrives from the web</div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};

const Cleanup: React.FC = () => {
  const frame = useCurrentFrame();
  const onlyOn = interpolate(frame, [GUARD_AT.only * 30 - 4, GUARD_AT.only * 30 + 6], [0, 1], clamp);
  const col = (title: string, color: string, items: string[], strong: number) => (
    <Panel style={{ width: 620, padding: 34, opacity: strong }} glow={strong > 0.9 ? color : undefined}>
      <div style={{ fontFamily: ZW.mono, fontSize: 22, letterSpacing: 3, color }}>{title}</div>
      <div style={{ fontFamily: ZW.sans, fontWeight: 600, fontSize: 30, color: ZW.muted, marginTop: 10 }}>Left to clean up</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 22 }}>
        {items.map((it) => (
          <div key={it} style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: ZW.sans, fontWeight: 600, fontSize: 38, color: ZW.text }}>
            <div style={{ width: 14, height: 14, borderRadius: 14, backgroundColor: color }} />
            {it}
          </div>
        ))}
      </div>
    </Panel>
  );
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: 60, marginTop: -60 }}>
        <div data-col>{col("DETECT AND RESPOND", ZW.red, ["Files", "Processes", "Sometimes data"], 1 - onlyOn * 0.55)}</div>
        <div data-col>{col("ZEROWRITE · PREVENT FIRST", ZW.amber, ["The quarantined program"], 0.45 + onlyOn * 0.55)}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Guard: React.FC = () => {
  const scope = useGsapTimeline<HTMLDivElement>(({ timeline, selector }) => {
    timeline
      .to(selector("[data-phase-a]"), { x: -140, opacity: 0, filter: "blur(10px)", duration: 0.45, ease: "power2.in" }, GUARD_AT.browser - 0.35)
      .from(selector("[data-phase-b]"), { y: 120, rotateX: 14, opacity: 0, duration: 0.6, ease: "power3.out" }, GUARD_AT.browser - 0.1)
      .from(selector("[data-pop]"), { y: -30, scale: 0.9, opacity: 0, duration: 0.4, ease: "back.out(1.6)" }, GUARD_AT.browser + 0.4)
      .to(selector("[data-phase-b]"), { y: -100, opacity: 0, filter: "blur(10px)", duration: 0.45, ease: "power2.in" }, GUARD_AT.cleanup - 0.35)
      .from(selector("[data-col]"), { y: 80, opacity: 0, duration: 0.5, stagger: 0.18, ease: "power3.out" }, GUARD_AT.cleanup);
    // source cards arrive with the words, one by one
    SOURCES.forEach((_, i) => {
      timeline.fromTo(
        selector(`[data-src="${i}"]`),
        { x: -260, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.45, ease: "power3.out" },
        GUARD_AT.sources[i],
      );
    });
  });
  return (
    <AbsoluteFill ref={scope} style={{ perspective: 1600 }}>
      <AbsoluteFill data-phase-a>
        <Streams />
        {SOURCES.map((s, i) => (
          <div key={s.label} data-src={i} style={{ position: "absolute", left: 160, top: s.y }}>
            <Panel style={{ width: 450, padding: 22, display: "flex", alignItems: "center", gap: 20 }}>
              <div
                style={{
                  width: 64,
                  height: 76,
                  borderRadius: 10,
                  border: `3px solid ${ZW.cyan}`,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: ZW.mono,
                  fontSize: 18,
                  color: ZW.cyan,
                }}
              >
                {s.ext}
              </div>
              <span style={{ fontFamily: ZW.sans, fontWeight: 700, fontSize: 40, color: ZW.text }}>{s.label}</span>
            </Panel>
          </div>
        ))}
        <Gate />
      </AbsoluteFill>
      <AbsoluteFill data-phase-b>
        <BrowserGuard />
      </AbsoluteFill>
      <Cleanup />
    </AbsoluteFill>
  );
};
