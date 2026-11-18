// Explainer: a voiced motion-graphics video built from a script in
// explainers/<name>.json. Run `node scripts/voiceover.mjs <name>` first; it
// writes public/explainers/<name>.json with each scene's audio and length.
import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Sequence,
  staticFile,
} from "remotion";
import { z } from "zod";
import {
  CtaScene,
  DownloadScene,
  HeldScene,
  IntentScene,
  RansomwareScene,
  VerdictScene,
} from "./scenes";
import { Background, Brandbar, Subtitle, Title } from "./ui";

const FPS = 30;
const VO_DELAY = 6; // frames of breathing room before the voice starts
const TAIL_SEC = 0.7; // pause after each line
const END_HOLD_SEC = 1.6; // extra time on the last scene
const TRANSITION = 10;

type Scene = {
  type: "download" | "ransomware" | "held" | "intent" | "verdict" | "cta";
  title: string;
  vo: string;
  file?: string;
  audio: string;
  voSec: number;
};
type Script = { name: string; scenes: Scene[] };

export const explainerSchema = z.object({
  script: z.string().describe("Name of an explainer in public/explainers"),
  subtitles: z.boolean(),
});
type Props = z.infer<typeof explainerSchema> & { loaded?: Script };

export const explainerDefaults: z.infer<typeof explainerSchema> = {
  script: "zerowrite-explainer-01",
  subtitles: true,
};

const sceneFrames = (s: Scene, last: boolean) =>
  Math.round((s.voSec + TAIL_SEC + (last ? END_HOLD_SEC : 0)) * FPS) + VO_DELAY;

export const calculateExplainerMetadata: CalculateMetadataFunction<
  Props
> = async ({ props, abortSignal }) => {
  const res = await fetch(staticFile(`explainers/${props.script}.json`), {
    signal: abortSignal,
  });
  if (!res.ok) {
    throw new Error(
      `No voiceover for "${props.script}". Run: node scripts/voiceover.mjs ${props.script}`,
    );
  }
  const script: Script = await res.json();
  const total = script.scenes.reduce(
    (sum, s, i) => sum + sceneFrames(s, i === script.scenes.length - 1),
    0,
  );
  return {
    durationInFrames: total - (script.scenes.length - 1) * TRANSITION,
    defaultOutName: script.name,
    props: { ...props, loaded: script },
  };
};

const Visual: React.FC<{ scene: Scene }> = ({ scene }) => {
  const file = scene.file ?? "invoice_0423.exe";
  switch (scene.type) {
    case "download":
      return <DownloadScene file={file} />;
    case "ransomware":
      return <RansomwareScene />;
    case "held":
      return <HeldScene file={file} />;
    case "intent":
      return <IntentScene file={file} />;
    case "verdict":
      return <VerdictScene file={file} />;
    case "cta":
      return <CtaScene />;
  }
};

export const Explainer: React.FC<Props> = ({ loaded, subtitles }) => {
  if (!loaded) return null;
  const n = loaded.scenes.length;
  return (
    <AbsoluteFill>
      <Background />
      <TransitionSeries name="Scenes">
        {loaded.scenes.flatMap((scene, i) => {
          const items = [
            <TransitionSeries.Sequence
              key={`s${i}`}
              name={`${i + 1}. ${scene.type}`}
              durationInFrames={sceneFrames(scene, i === n - 1)}
            >
              <AbsoluteFill>
                {scene.type !== "cta" ? (
                  <>
                    <Brandbar />
                    <Title text={scene.title} />
                  </>
                ) : null}
                <Visual scene={scene} />
                {subtitles && scene.type !== "cta" ? (
                  <Subtitle
                    text={scene.vo}
                    startFrame={VO_DELAY}
                    seconds={scene.voSec}
                  />
                ) : null}
                <Sequence from={VO_DELAY} name="Voice" layout="none">
                  <Audio src={staticFile(scene.audio)} />
                </Sequence>
              </AbsoluteFill>
            </TransitionSeries.Sequence>,
          ];
          if (i < n - 1) {
            items.push(
              <TransitionSeries.Transition
                key={`t${i}`}
                presentation={slide({ direction: "from-right" })}
                timing={linearTiming({ durationInFrames: TRANSITION })}
              />,
            );
          }
          return items;
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
