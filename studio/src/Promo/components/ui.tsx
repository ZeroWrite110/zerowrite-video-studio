import { lightLeak } from "@remotion/effects/light-leak";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Solid,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ZW } from "../../Explainer/theme";

export { ZW };

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Slow, deep backdrop: ink, cyan haze, a perspective grid that drifts (parallax
// layer 1) and floating dust (layer 2). Driven by the composition frame.
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const dust = [];
  for (let i = 0; i < 46; i++) {
    const x = (i * 397) % 1920;
    const y0 = (i * 211) % 1080;
    const speed = 0.25 + ((i * 37) % 10) / 14;
    const y = (((y0 - frame * speed) % 1080) + 1080) % 1080;
    const size = 2 + ((i * 13) % 4);
    dust.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: x + Math.sin(frame / 40 + i) * 14,
          top: y,
          width: size,
          height: size,
          borderRadius: size,
          backgroundColor: i % 4 === 0 ? ZW.cyanBright : ZW.cyanDeep,
          opacity: 0.18 + 0.25 * Math.abs(Math.sin(i * 1.3 + frame / 30)),
          filter: "blur(0.5px)",
        }}
      />,
    );
  }
  return (
    <AbsoluteFill style={{ backgroundColor: ZW.ink, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 45%, ${ZW.cyanDeep}40, transparent 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -480,
          right: -480,
          top: 560,
          height: 900,
          transform: "perspective(900px) rotateX(64deg)",
          transformOrigin: "50% 0%",
          backgroundImage: `linear-gradient(${ZW.cyan}26 2px, transparent 2px), linear-gradient(90deg, ${ZW.cyan}26 2px, transparent 2px)`,
          backgroundSize: "120px 120px",
          backgroundPosition: `0px ${(frame * 2.2) % 120}px`,
          maskImage: "linear-gradient(to bottom, black, transparent 85%)",
          opacity: 0.55,
        }}
      />
      <AbsoluteFill>{dust}</AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.75))",
        }}
      />
    </AbsoluteFill>
  );
};

// Cyan light leak that plays over a cut (used as TransitionSeries.Overlay).
export const LightLeak: React.FC<{ seed?: number }> = ({ seed = 0 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  return (
    <Solid
      width={width}
      height={height}
      style={{ mixBlendMode: "screen" }}
      effects={[
        lightLeak({
          seed,
          hueShift: 150,
          progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], clamp),
        }),
      ]}
    />
  );
};

export const Logo: React.FC<{ size: number; style?: React.CSSProperties }> = ({
  size,
  style,
}) => (
  <Img
    src={staticFile("brand/zerowrite-logo.svg")}
    style={{ width: size, height: size, ...style }}
  />
);

export const Wordmark: React.FC<{ size: number }> = ({ size }) => (
  <span
    style={{
      fontFamily: ZW.sans,
      fontWeight: 700,
      fontSize: size,
      letterSpacing: -size * 0.02,
      color: ZW.text,
    }}
  >
    ZeroWrite<span style={{ color: ZW.cyan }}>.ai</span>
  </span>
);

export const Corner: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 54,
      left: 72,
      display: "flex",
      alignItems: "center",
      gap: 14,
      opacity: 0.9,
    }}
  >
    <Logo size={52} />
    <Wordmark size={30} />
  </div>
);

export const Pill: React.FC<{
  text: string;
  color: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({ text, color, size = 22, style }) => (
  <span
    style={{
      fontFamily: ZW.mono,
      fontWeight: 600,
      fontSize: size,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color,
      border: `2px solid ${color}`,
      backgroundColor: `${color}1f`,
      borderRadius: 10,
      padding: "6px 14px",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {text}
  </span>
);

export const Panel: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  glow?: string;
}> = ({ children, style, glow }) => (
  <div
    style={{
      backgroundColor: "rgba(14,21,24,0.92)",
      border: `2px solid ${glow ? `${glow}88` : ZW.line}`,
      borderRadius: 26,
      padding: 32,
      boxShadow: `0 40px 90px rgba(0,0,0,0.55)${glow ? `, 0 0 60px ${glow}33` : ""}`,
      ...style,
    }}
  >
    {children}
  </div>
);

// Lower-third subtitle: shows the sentence being spoken, revealed word by word.
// Sentence timing is estimated from word counts across the voice line.
export const Caption: React.FC<{
  text: string;
  startFrame: number;
  seconds: number;
}> = ({ text, startFrame, seconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const all = text.split(" ");
  const progress = interpolate(
    frame,
    [startFrame, startFrame + seconds * fps],
    [0, all.length],
    clamp,
  );
  // Split into sentences and pick the one containing the current word.
  const sentences: { from: number; words: string[] }[] = [];
  let current: string[] = [];
  all.forEach((w, i) => {
    current.push(w);
    if (/[.!?]$/.test(w) || i === all.length - 1) {
      sentences.push({ from: i + 1 - current.length, words: current });
      current = [];
    }
  });
  const active =
    sentences.find((s) => progress < s.from + s.words.length) ??
    sentences[sentences.length - 1];
  const words = active.words;
  return (
    <div
      style={{
        position: "absolute",
        left: 260,
        right: 260,
        bottom: 64,
        textAlign: "center",
        fontFamily: ZW.sans,
        fontWeight: 600,
        fontSize: 40,
        lineHeight: 1.35,
        color: ZW.text,
        textShadow: "0 2px 12px rgba(0,0,0,0.9)",
      }}
    >
      {words.map((w, i) => (
        <span key={i} style={{ opacity: active.from + i < progress ? 1 : 0.3 }}>
          {w}{" "}
        </span>
      ))}
    </div>
  );
};
