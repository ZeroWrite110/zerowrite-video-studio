// TextReel: a reel made only from text scenes (no footage needed).
// Good for tips, hooks, quotes and announcements.
import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { zColor } from "@remotion/zod-types";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { BRAND } from "../brand";

const TRANSITION_FRAMES = 12;

const sceneSchema = z.object({
  kicker: z.string().describe("Small label above the text. Empty = none"),
  text: z.string(),
  seconds: z.number().min(1).max(15),
});

export const textReelSchema = z.object({
  scenes: z.array(sceneSchema).min(1),
  background: zColor(),
  accent: zColor(),
  music: z
    .string()
    .describe("File in public/music, e.g. calm.mp3. Empty = none"),
  musicVolume: z.number().min(0).max(1),
});

type Props = z.infer<typeof textReelSchema>;

export const textReelDefaults: Props = {
  scenes: [
    { kicker: "", text: "Stop editing videos by hand.", seconds: 2.5 },
    { kicker: "Step 1", text: "Drop your raw clip in a folder.", seconds: 3 },
    {
      kicker: "Step 2",
      text: "Claude cuts the pauses and adds captions.",
      seconds: 3.5,
    },
    { kicker: "Step 3", text: "Post the finished reel.", seconds: 3 },
  ],
  background: BRAND.colors.dark,
  accent: BRAND.colors.highlight,
  music: "",
  musicVolume: 0.25,
};

export const calculateTextReelMetadata: CalculateMetadataFunction<Props> = ({
  props,
}) => {
  const total = props.scenes.reduce(
    (sum, s) => sum + Math.round(s.seconds * BRAND.fps),
    0,
  );
  // Transitions overlap neighbouring scenes, so they shorten the video.
  const overlap = (props.scenes.length - 1) * TRANSITION_FRAMES;
  return { durationInFrames: Math.max(1, total - overlap) };
};

const Scene: React.FC<{
  kicker: string;
  text: string;
  accent: string;
  background: string;
}> = ({ kicker, text, accent, background }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const words = text.split(" ");

  return (
    <AbsoluteFill style={{ backgroundColor: background, overflow: "hidden" }}>
      {/* slow drifting glow so the background is never static */}
      <div
        style={{
          position: "absolute",
          inset: -600,
          background: `radial-gradient(circle at 40% 40%, ${accent}38, transparent 35%)`,
          translate: interpolate(
            frame,
            [0, durationInFrames],
            ["0px 0px", "120px 200px"],
          ),
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          padding: "0 100px",
          fontFamily: BRAND.fontFamily,
        }}
      >
        {kicker ? (
          <div
            style={{
              color: accent,
              fontSize: 48,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 32,
              opacity: interpolate(frame, [0, 8], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {kicker}
          </div>
        ) : null}
        <div
          style={{
            color: BRAND.colors.text,
            fontSize: 110,
            fontWeight: 900,
            lineHeight: 1.08,
          }}
        >
          {words.map((word, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: "0.25em",
                opacity: interpolate(frame, [4 + i * 3, 10 + i * 3], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                translate: interpolate(
                  frame,
                  [4 + i * 3, 14 + i * 3],
                  ["0px 40px", "0px 0px"],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(0.16, 1, 0.3, 1),
                  },
                ),
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const TextReel: React.FC<Props> = ({
  scenes,
  background,
  accent,
  music,
  musicVolume,
}) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: background }}>
      <TransitionSeries name="Scenes">
        {scenes.flatMap((scene, i) => {
          const items = [
            <TransitionSeries.Sequence
              key={`s${i}`}
              name={`Scene ${i + 1}`}
              durationInFrames={Math.round(scene.seconds * fps)}
            >
              <Scene
                kicker={scene.kicker}
                text={scene.text}
                accent={accent}
                background={background}
              />
            </TransitionSeries.Sequence>,
          ];
          if (i < scenes.length - 1) {
            items.push(
              <TransitionSeries.Transition
                key={`t${i}`}
                presentation={slide({
                  direction: i % 2 === 0 ? "from-bottom" : "from-right",
                })}
                timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
              />,
            );
          }
          return items;
        })}
      </TransitionSeries>
      {music ? (
        <Audio src={staticFile(`music/${music}`)} volume={musicVolume} />
      ) : null}
    </AbsoluteFill>
  );
};
