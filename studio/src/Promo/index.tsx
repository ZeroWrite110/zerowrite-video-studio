// YouTubePromo: a 16:9 motion-graphics promo built from promos/<name>.json.
// Run `node scripts/voiceover.mjs <name> --promo` first; it writes
// public/promo/<name>.json with each scene's audio file and length.
import { Audio } from "@remotion/media";
import { TransitionSeries } from "@remotion/transitions";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  interpolate,
  Sequence,
  staticFile,
} from "remotion";
import { z } from "zod";
import { Backdrop, Caption, Corner, LightLeak } from "./components/ui";
import { Cta, CLICK_AT } from "./scenes/Cta";
import { FEATURE_AT, Features } from "./scenes/Features";
import { Hook } from "./scenes/Hook";
import { How } from "./scenes/How";
import { Problem } from "./scenes/Problem";
import { Reveal } from "./scenes/Reveal";

const FPS = 30;
const VO_DELAY = 8; // frames before the voice starts in each scene
const TAIL_SEC = 0.5;
const HOLD_SEC: Partial<Record<SceneType, number>> = { reveal: 1.1, cta: 2.4 };
const LEAK = 22; // light-leak overlay length at each cut

type SceneType = "hook" | "problem" | "reveal" | "how" | "features" | "cta";
type Scene = {
  type: SceneType;
  chapter: string;
  vo: string;
  audio: string;
  voSec: number;
};
type Script = { name: string; music?: string; scenes: Scene[] };

export const promoSchema = z.object({
  script: z.string().describe("Name of a promo in public/promo"),
  captions: z.boolean(),
  music: z.boolean(),
});
type Props = z.infer<typeof promoSchema> & { loaded?: Script };

export const promoDefaults: z.infer<typeof promoSchema> = {
  script: "zerowrite-youtube-01",
  captions: true,
  music: true,
};

export const sceneFrames = (s: Scene) =>
  VO_DELAY + Math.round((s.voSec + TAIL_SEC + (HOLD_SEC[s.type] ?? 0)) * FPS);

export const calculatePromoMetadata: CalculateMetadataFunction<Props> = async ({
  props,
  abortSignal,
}) => {
  const res = await fetch(staticFile(`promo/${props.script}.json`), {
    signal: abortSignal,
  });
  if (!res.ok) {
    throw new Error(
      `No voiceover for "${props.script}". Run: node scripts/voiceover.mjs ${props.script} --promo`,
    );
  }
  const script: Script = await res.json();
  return {
    durationInFrames: script.scenes.reduce((sum, s) => sum + sceneFrames(s), 0),
    defaultOutName: script.name,
    props: { ...props, loaded: script },
  };
};

const Visual: React.FC<{ type: SceneType }> = ({ type }) => {
  switch (type) {
    case "hook":
      return <Hook />;
    case "problem":
      return <Problem />;
    case "reveal":
      return <Reveal />;
    case "how":
      return <How />;
    case "features":
      return <Features />;
    case "cta":
      return <Cta />;
  }
};

const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({
  at,
  src,
  volume = 0.5,
}) => (
  <Sequence from={Math.round(at)} durationInFrames={45} layout="none" name={`sfx ${src}`}>
    <Audio src={staticFile(`sfx/${src}.wav`)} volume={volume} />
  </Sequence>
);

// Sound design per scene (frames relative to the scene start).
const sceneSfx = (type: SceneType) => {
  switch (type) {
    case "problem":
      return [10, 37, 63].map((f) => <Sfx key={f} at={f - 2} src="whip" volume={0.45} />);
    case "how":
      return [3.3, 7.6].map((s) => <Sfx key={s} at={s * FPS} src="whoosh" volume={0.4} />);
    case "features":
      return [
        <Sfx key="a" at={(FEATURE_AT[1] + 0.5) * FPS} src="switch" volume={0.6} />,
        <Sfx key="b" at={(FEATURE_AT[2] + 0.6) * FPS} src="switch" volume={0.6} />,
      ];
    case "cta":
      return [<Sfx key="c" at={CLICK_AT * FPS} src="mouse-click" volume={0.7} />];
    default:
      return [];
  }
};

export const YouTubePromo: React.FC<Props> = ({ loaded, captions, music }) => {
  if (!loaded) return null;
  const total = loaded.scenes.reduce((sum, s) => sum + sceneFrames(s), 0);
  const withCaptions: SceneType[] = ["problem", "how", "features"];
  return (
    <AbsoluteFill>
      <Backdrop />
      <TransitionSeries name="Scenes">
        {loaded.scenes.flatMap((scene, i) => {
          const items = [
            <TransitionSeries.Sequence
              key={`s${i}`}
              name={`${i + 1}. ${scene.type}`}
              durationInFrames={sceneFrames(scene)}
            >
              <AbsoluteFill>
                <Visual type={scene.type} />
                {scene.type !== "reveal" && scene.type !== "cta" ? <Corner /> : null}
                {captions && withCaptions.includes(scene.type) ? (
                  <Caption text={scene.vo} startFrame={VO_DELAY} seconds={scene.voSec} />
                ) : null}
                <Sequence from={VO_DELAY} name="Voice" layout="none">
                  <Audio src={staticFile(scene.audio)} />
                </Sequence>
                {i > 0 ? <Sfx at={0} src="whoosh" volume={0.35} /> : null}
                {sceneSfx(scene.type)}
              </AbsoluteFill>
            </TransitionSeries.Sequence>,
          ];
          if (i < loaded.scenes.length - 1) {
            items.push(
              <TransitionSeries.Overlay key={`o${i}`} durationInFrames={LEAK}>
                <LightLeak seed={i * 3 + 1} />
              </TransitionSeries.Overlay>,
            );
          }
          return items;
        })}
      </TransitionSeries>
      {music && loaded.music ? (
        <Audio
          src={staticFile(loaded.music)}
          volume={(f) =>
            interpolate(f, [0, 30, total - 75, total - 1], [0, 0.13, 0.13, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
