// CaptionedReel: your own footage, auto-cut and auto-captioned.
// Data comes from public/projects/<project>.json, made by `npm run prepare-footage`.
import type { Caption } from "@remotion/captions";
import { Video } from "@remotion/media";
import { zColor } from "@remotion/zod-types";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { BRAND } from "../brand";
import { Captions } from "./Captions";

type Segment = { fromSec: number; toSec: number };
type Project = {
  name: string;
  video: string;
  outputDurationSec: number;
  segments: Segment[];
  captions: string | null;
};

export const captionedReelSchema = z.object({
  project: z.string().describe("Name of a prepared Raw folder"),
  size: z.enum(["9:16", "16:9", "1:1"]).describe("Reel, YouTube or square"),
  hook: z.string().describe("Big title for the first seconds. Empty = none"),
  hookSeconds: z.number().min(0).max(10),
  highlightColor: zColor(),
  captionPosition: z.enum(["middle", "lower"]),
  showCaptions: z.boolean(),
  punchInZoom: z.boolean().describe("Alternate zoom on each jump cut"),
  showProgressBar: z.boolean(),
});

const SIZES = {
  "9:16": { width: 1080, height: 1920 },
  "16:9": { width: 1920, height: 1080 },
  "1:1": { width: 1080, height: 1080 },
} as const;

type Props = z.infer<typeof captionedReelSchema> & {
  loaded?: { project: Project; captions: Caption[] };
};

export const captionedReelDefaults: z.infer<typeof captionedReelSchema> = {
  project: "sample-talking",
  size: "9:16",
  hook: "Edit videos without an editor",
  hookSeconds: 2.5,
  highlightColor: BRAND.colors.highlight,
  captionPosition: "lower",
  showCaptions: true,
  punchInZoom: true,
  showProgressBar: true,
};

export const calculateCaptionedReelMetadata: CalculateMetadataFunction<
  Props
> = async ({ props, abortSignal }) => {
  const res = await fetch(staticFile(`projects/${props.project}.json`), {
    signal: abortSignal,
  });
  if (!res.ok) {
    throw new Error(
      `"${props.project}" is not prepared yet. Run: npm run prepare-footage -- ${props.project}`,
    );
  }
  const project: Project = await res.json();
  let captions: Caption[] = [];
  if (project.captions) {
    const c = await fetch(staticFile(project.captions), {
      signal: abortSignal,
    });
    captions = await c.json();
  }
  return {
    durationInFrames: Math.max(
      1,
      Math.ceil(project.outputDurationSec * BRAND.fps),
    ),
    defaultOutName: project.name,
    ...SIZES[props.size],
    props: { ...props, loaded: { project, captions } },
  };
};

// One kept piece of the original clip.
const Clip: React.FC<{ src: string; segment: Segment; zoom: number }> = ({
  src,
  segment,
  zoom,
}) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ scale: zoom }}>
      <Video
        src={src}
        trimBefore={Math.round(segment.fromSec * fps)}
        trimAfter={Math.round(segment.toSec * fps)}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />
    </AbsoluteFill>
  );
};

const Hook: React.FC<{ text: string; seconds: number }> = ({
  text,
  seconds,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const end = seconds * fps;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: Math.round(height * 0.135),
      }}
    >
      <div
        style={{
          maxWidth: 900,
          padding: "28px 44px",
          borderRadius: 28,
          backgroundColor: "white",
          color: BRAND.colors.dark,
          fontFamily: BRAND.fontFamily,
          fontWeight: 800,
          fontSize: 76,
          lineHeight: 1.1,
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          opacity: interpolate(frame, [0, 6, end - 8, end], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [0, 12], ["0px -60px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const ProgressBar: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end" }}>
      <div
        style={{
          height: 12,
          backgroundColor: color,
          width: `${(frame / Math.max(1, durationInFrames - 1)) * 100}%`,
        }}
      />
    </AbsoluteFill>
  );
};

export const CaptionedReel: React.FC<Props> = (props) => {
  const { fps } = useVideoConfig();
  if (!props.loaded) return null;
  const { project, captions } = props.loaded;
  const src = staticFile(project.video);

  // Place each kept segment right after the previous one (jump cuts).
  let cursorSec = 0;
  const clips = project.segments.map((segment, i) => {
    const from = Math.round(cursorSec * fps);
    cursorSec += segment.toSec - segment.fromSec;
    const to = Math.round(cursorSec * fps);
    return { segment, from, durationInFrames: to - from, index: i };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {clips.map(({ segment, from, durationInFrames, index }) => (
        <Sequence
          key={index}
          name={`Clip ${index + 1}`}
          from={from}
          durationInFrames={durationInFrames}
        >
          <Clip
            src={src}
            segment={segment}
            zoom={props.punchInZoom && index % 2 === 1 ? 1.12 : 1}
          />
        </Sequence>
      ))}
      {props.showCaptions && captions.length > 0 ? (
        <Captions
          captions={captions}
          highlightColor={props.highlightColor}
          position={props.captionPosition}
        />
      ) : null}
      {props.hook.trim() && props.hookSeconds > 0 ? (
        <Sequence
          name="Hook"
          durationInFrames={Math.round(props.hookSeconds * fps)}
        >
          <Hook text={props.hook} seconds={props.hookSeconds} />
        </Sequence>
      ) : null}
      {props.showProgressBar ? (
        <ProgressBar color={props.highlightColor} />
      ) : null}
    </AbsoluteFill>
  );
};
