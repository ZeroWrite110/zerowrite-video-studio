import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ZW } from "./theme";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);

// Dark ink background with a slow cyan glow and the dotted "0" ring from the website.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const dots = [];
  const count = 72;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const r = 380 + (i % 3) * 26;
    dots.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: 540 + Math.cos(a) * r * 0.82 - 5,
          top: 960 + Math.sin(a) * r * 1.12 - 5,
          width: 10,
          height: 10,
          borderRadius: 2,
          backgroundColor: i % 5 === 0 ? ZW.cyanBright : ZW.cyanDeep,
          opacity: 0.12 + 0.18 * Math.abs(Math.sin(i * 1.7 + frame / 25)),
        }}
      />,
    );
  }
  return (
    <AbsoluteFill style={{ backgroundColor: ZW.ink, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${ZW.cyanDeep}33, transparent 55%)`,
        }}
      />
      <AbsoluteFill>{dots}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Brandbar: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 110,
      left: 90,
      display: "flex",
      alignItems: "center",
      gap: 18,
      fontFamily: ZW.sans,
      fontSize: 40,
      fontWeight: 600,
      color: ZW.text,
    }}
  >
    <Img
      src={staticFile("brand/zerowrite-logo.svg")}
      style={{ width: 64, height: 64 }}
    />
    <span>
      ZeroWrite<span style={{ color: ZW.muted }}>.ai</span>
    </span>
  </div>
);

// Big scene headline. Words wrapped in *stars* get the cyan accent.
export const Title: React.FC<{ text: string; top?: number }> = ({
  text,
  top = 280,
}) => {
  const frame = useCurrentFrame();
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 90,
        right: 90,
        fontFamily: ZW.sans,
        fontWeight: 700,
        fontSize: 92,
        lineHeight: 1.08,
        letterSpacing: -1.5,
        color: ZW.text,
        opacity: interpolate(frame, [0, 10], [0, 1], clamp),
        translate: interpolate(frame, [0, 14], ["0px 40px", "0px 0px"], {
          ...clamp,
          easing: EASE,
        }),
      }}
    >
      {parts.map((p, i) =>
        p.startsWith("*") ? (
          <span key={i} style={{ color: ZW.cyan }}>
            {p.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </div>
  );
};

// Voiceover line at the bottom, revealed word by word while it is spoken.
export const Subtitle: React.FC<{
  text: string;
  startFrame: number;
  seconds: number;
}> = ({ text, startFrame, seconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  const progress = interpolate(
    frame,
    [startFrame, startFrame + seconds * fps],
    [0, words.length],
    clamp,
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 90,
        bottom: 300,
        fontFamily: ZW.sans,
        fontWeight: 600,
        fontSize: 46,
        lineHeight: 1.3,
        textAlign: "center",
        color: ZW.text,
      }}
    >
      {words.map((w, i) => (
        <span key={i} style={{ opacity: i < progress ? 1 : 0.22 }}>
          {w}{" "}
        </span>
      ))}
    </div>
  );
};

export const Card: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      backgroundColor: ZW.panel,
      border: `2px solid ${ZW.line}`,
      borderRadius: 28,
      padding: 36,
      boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const FileBadge: React.FC<{
  ext: string;
  color?: string;
  size?: number;
}> = ({ ext, color = ZW.cyan, size = 96 }) => (
  <div
    style={{
      width: size,
      height: size * 1.18,
      borderRadius: size * 0.16,
      border: `3px solid ${color}`,
      display: "grid",
      placeItems: "center",
      fontFamily: ZW.mono,
      fontWeight: 600,
      fontSize: size * 0.26,
      color,
      backgroundColor: `${color}14`,
      flex: "none",
    }}
  >
    {ext}
  </div>
);

export const Tag: React.FC<{ text: string; color: string; size?: number }> = ({
  text,
  color,
  size = 30,
}) => (
  <span
    style={{
      fontFamily: ZW.mono,
      fontWeight: 600,
      fontSize: size,
      letterSpacing: 1,
      textTransform: "uppercase",
      color,
      border: `2px solid ${color}`,
      backgroundColor: `${color}1f`,
      borderRadius: 10,
      padding: "6px 14px",
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </span>
);
