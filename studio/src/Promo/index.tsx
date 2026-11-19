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
import { Cleanup, CLEANUP_AT } from "./scenes/Cleanup";
import { Cta, CLICK_AT } from "./scenes/Cta";
import { FEATURE_AT, Features } from "./scenes/Features";
import { Fleet, FLEET_AT } from "./scenes/Fleet";
import { Hook } from "./scenes/Hook";
import { How } from "./scenes/How";
import { Problem } from "./scenes/Problem";
import { Reveal } from "./scenes/Reveal";
import { Tickets } from "./scenes/Tickets";
import { STEP_AT, Timeline } from "./scenes/Timeline";
import { Usb, USB_AT } from "./scenes/Usb";
import { Download, DOWNLOAD_AT } from "./scenes/Download";
import { Explode, EXPLODE_AT } from "./scenes/Explode";
import { Guard, GUARD_AT } from "./scenes/Guard";
import { Split, SPLIT_AT } from "./scenes/Split";
import { Tamper, TAMPER_AT } from "./scenes/Tamper";
import { Ledger, LEDGER_AT } from "./scenes/Ledger";
import { Isolate, ISOLATE_AT } from "./scenes/Isolate";
import { Resilient, RESILIENT_AT } from "./scenes/Resilient";
import { Define, DEFINE_AT } from "./scenes/Define";
import { Checkpoint, CHECKPOINT_AT } from "./scenes/Checkpoint";
import { Signatures, SIGNATURES_AT } from "./scenes/Signatures";
import { Recap, RECAP_AT } from "./scenes/Recap";
import { Portal, PORTAL_AT } from "./scenes/Portal";
import { Policy, POLICY_AT } from "./scenes/Policy";
import { Globe, GLOBE_AT } from "./scenes/Globe";
import { Inbox, INBOX_AT } from "./scenes/Inbox";
import { Signs, SIGNS_AT } from "./scenes/Signs";
import { Bulk, BULK_AT } from "./scenes/Bulk";
import { Shadow, SHADOW_AT } from "./scenes/Shadow";
import { Hide, HIDE_AT } from "./scenes/Hide";
import { Weigh, WEIGH_AT } from "./scenes/Weigh";

const FPS = 30;
const VO_DELAY = 8; // frames before the voice starts in each scene
const TAIL_SEC = 0.5;
const HOLD_SEC: Partial<Record<SceneType, number>> = {
  reveal: 1.1,
  cta: 2.4,
  tickets: 0.7,
  usb: 0.9,
  download: 0.6,
  explode: 0.9,
  guard: 0.7,
  tamper: 0.8,
  ledger: 0.6,
  isolate: 0.8,
  resilient: 1.2,
  define: 0.5,
  checkpoint: 0.6,
  signatures: 0.8,
  recap: 1.1,
  portal: 0.8,
  policy: 0.8,
  globe: 1.3,
  inbox: 0.9,
  signs: 0.6,
  bulk: 0.9,
  shadow: 0.9,
  hide: 1.0,
  weigh: 1.4,
};
const LEAK = 22; // light-leak overlay length at each cut

type SceneType =
  | "hook"
  | "problem"
  | "reveal"
  | "how"
  | "features"
  | "cta"
  // video 02 (MSP angle)
  | "tickets"
  | "cleanup"
  | "timeline"
  | "fleet"
  | "usb"
  // video 03 (double-click / home-user angle)
  | "download"
  | "split"
  | "explode"
  | "guard"
  // video 04 (control angle)
  | "tamper"
  | "ledger"
  | "isolate"
  | "resilient"
  // video 05 (educational: what is pre-execution protection?)
  | "define"
  | "checkpoint"
  | "signatures"
  | "recap"
  // video 06 (fleet portal: one portal, every machine)
  | "portal"
  | "policy"
  | "globe"
  | "inbox"
  // video 07 (educational: 3 signs a file is malicious before it runs)
  | "signs"
  | "bulk"
  | "shadow"
  | "hide"
  | "weigh";
type Scene = {
  type: SceneType;
  chapter: string;
  vo: string;
  caption?: string; // on-screen text when it differs from the spoken spelling
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
    case "tickets":
      return <Tickets />;
    case "cleanup":
      return <Cleanup />;
    case "timeline":
      return <Timeline />;
    case "fleet":
      return <Fleet />;
    case "usb":
      return <Usb />;
    case "download":
      return <Download />;
    case "split":
      return <Split />;
    case "explode":
      return <Explode />;
    case "guard":
      return <Guard />;
    case "tamper":
      return <Tamper />;
    case "ledger":
      return <Ledger />;
    case "isolate":
      return <Isolate />;
    case "resilient":
      return <Resilient />;
    case "define":
      return <Define />;
    case "checkpoint":
      return <Checkpoint />;
    case "signatures":
      return <Signatures />;
    case "recap":
      return <Recap />;
    case "portal":
      return <Portal />;
    case "policy":
      return <Policy />;
    case "globe":
      return <Globe />;
    case "inbox":
      return <Inbox />;
    case "signs":
      return <Signs />;
    case "bulk":
      return <Bulk />;
    case "shadow":
      return <Shadow />;
    case "hide":
      return <Hide />;
    case "weigh":
      return <Weigh />;
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
    case "tickets":
      return [<Sfx key="t" at={2.7 * FPS} src="whoosh" volume={0.35} />];
    case "cleanup":
      return CLEANUP_AT.map((s) => <Sfx key={s} at={s * FPS} src="whip" volume={0.4} />);
    case "timeline":
      return [
        <Sfx key="m" at={1.8 * FPS} src="whoosh" volume={0.45} />,
        ...STEP_AT.map((s) => <Sfx key={s} at={s * FPS} src="switch" volume={0.5} />),
      ];
    case "fleet":
      return FLEET_AT.verdicts.map((s) => <Sfx key={s} at={s * FPS} src="switch" volume={0.5} />);
    case "usb":
      return [
        <Sfx key="u" at={USB_AT.plug * FPS + 8} src="mouse-click" volume={0.7} />,
        <Sfx key="p" at={USB_AT.portal * FPS} src="whoosh" volume={0.4} />,
      ];
    case "download":
      return [
        <Sfx key="c1" at={DOWNLOAD_AT.click * FPS} src="mouse-click" volume={0.7} />,
        <Sfx key="c2" at={DOWNLOAD_AT.click * FPS + 6} src="mouse-click" volume={0.7} />,
        <Sfx key="w" at={(DOWNLOAD_AT.freeze - 0.35) * FPS} src="whoosh" volume={0.45} />,
      ];
    case "split":
      return [
        <Sfx key="a" at={0.5 * FPS} src="whip" volume={0.4} />,
        <Sfx key="b" at={SPLIT_AT.right * FPS} src="whip" volume={0.4} />,
        <Sfx key="c" at={(SPLIT_AT.right + 0.5) * FPS} src="switch" volume={0.6} />,
      ];
    case "explode":
      return [
        <Sfx key="x" at={EXPLODE_AT.burst * FPS - 2} src="whoosh" volume={0.55} />,
        ...EXPLODE_AT.behaviours.map((s) => <Sfx key={s} at={s * FPS} src="switch" volume={0.45} />),
        <Sfx key="v" at={EXPLODE_AT.verdict * FPS} src="whip" volume={0.5} />,
      ];
    case "guard":
      return [
        ...GUARD_AT.sources.map((s) => <Sfx key={s} at={s * FPS} src="whip" volume={0.35} />),
        <Sfx key="b" at={(GUARD_AT.browser - 0.1) * FPS} src="whoosh" volume={0.4} />,
        <Sfx key="d" at={GUARD_AT.arrived * FPS} src="switch" volume={0.6} />,
        <Sfx key="c" at={GUARD_AT.cleanup * FPS} src="whoosh" volume={0.4} />,
      ];
    case "tamper":
      return [
        <Sfx key="c" at={TAMPER_AT.click * FPS} src="mouse-click" volume={0.7} />,
        <Sfx key="l" at={(TAMPER_AT.lock + 0.2) * FPS} src="whip" volume={0.55} />,
        <Sfx key="a" at={TAMPER_AT.admin * FPS} src="switch" volume={0.5} />,
        <Sfx key="p" at={TAMPER_AT.portal * FPS} src="switch" volume={0.5} />,
      ];
    case "ledger":
      return [
        <Sfx key="d" at={LEDGER_AT.remove * FPS + 3} src="mouse-click" volume={0.7} />,
        <Sfx key="f" at={LEDGER_AT.fly * FPS} src="whoosh" volume={0.45} />,
        <Sfx key="l" at={LEDGER_AT.land * FPS} src="switch" volume={0.55} />,
      ];
    case "isolate":
      return [
        <Sfx key="c" at={ISOLATE_AT.click * FPS} src="mouse-click" volume={0.7} />,
        <Sfx key="x" at={ISOLATE_AT.cut * FPS - 10} src="whip" volume={0.5} />,
        <Sfx key="r" at={ISOLATE_AT.release * FPS} src="whoosh" volume={0.4} />,
      ];
    case "resilient":
      return [
        <Sfx key="o" at={RESILIENT_AT.offline * FPS} src="switch" volume={0.5} />,
        <Sfx key="e" at={RESILIENT_AT.expired * FPS} src="whip" volume={0.45} />,
        <Sfx key="u" at={RESILIENT_AT.updates * FPS} src="whoosh" volume={0.45} />,
        <Sfx key="s" at={RESILIENT_AT.stays * FPS} src="whoosh" volume={0.45} />,
      ];
    case "define":
      return [
        <Sfx key="t" at={DEFINE_AT.term * FPS} src="switch" volume={0.4} />,
        <Sfx key="b" at={DEFINE_AT.before * FPS - 2} src="whip" volume={0.5} />,
      ];
    case "checkpoint":
      return [
        <Sfx key="m" at={CHECKPOINT_AT.memory * FPS - 4} src="whip" volume={0.4} />,
        <Sfx key="g" at={CHECKPOINT_AT.gate * FPS} src="whoosh" volume={0.5} />,
        ...CHECKPOINT_AT.arrive.map((s) => <Sfx key={s} at={s * FPS} src="switch" volume={0.45} />),
        <Sfx key="f" at={CHECKPOINT_AT.flare * FPS} src="whoosh" volume={0.4} />,
      ];
    case "signatures":
      return [
        <Sfx key="u" at={SIGNATURES_AT.unseen * FPS} src="switch" volume={0.5} />,
        <Sfx key="l" at={(SIGNATURES_AT.judged - 0.45) * FPS} src="whoosh" volume={0.45} />,
        ...SIGNATURES_AT.intents.map((s) => <Sfx key={s} at={s * FPS} src="switch" volume={0.35} />),
        <Sfx key="s" at={SIGNATURES_AT.stopped * FPS} src="whip" volume={0.55} />,
      ];
    case "recap":
      return [
        ...RECAP_AT.steps.map((s) => <Sfx key={s} at={s * FPS - 6} src="whip" volume={0.45} />),
        <Sfx key="v" at={RECAP_AT.verdict * FPS} src="whoosh" volume={0.5} />,
      ];
    case "portal":
      return [
        <Sfx key="w" at={PORTAL_AT.window * FPS} src="whoosh" volume={0.5} />,
        ...[PORTAL_AT.licences, PORTAL_AT.devices, PORTAL_AT.policy].map((s) => <Sfx key={s} at={s * FPS} src="switch" volume={0.45} />),
      ];
    case "policy":
      return [
        <Sfx key="s" at={POLICY_AT.sensitivity * FPS} src="whoosh" volume={0.3} />,
        <Sfx key="q" at={POLICY_AT.quarantine * FPS} src="switch" volume={0.6} />,
        <Sfx key="d" at={POLICY_AT.drives * FPS} src="switch" volume={0.6} />,
        <Sfx key="c" at={POLICY_AT.save * FPS} src="mouse-click" volume={0.7} />,
        <Sfx key="f" at={(POLICY_AT.save + 0.2) * FPS} src="whoosh" volume={0.45} />,
      ];
    case "globe":
      return [
        <Sfx key="r" at={GLOBE_AT.ripple * FPS} src="whoosh" volume={0.45} />,
        <Sfx key="c" at={GLOBE_AT.checkin * FPS} src="switch" volume={0.4} />,
        <Sfx key="e" at={GLOBE_AT.every * FPS} src="whip" volume={0.45} />,
      ];
    case "inbox":
      return [
        ...[INBOX_AT.allow, INBOX_AT.restore, INBOX_AT.remove].map((s) => <Sfx key={s} at={s * FPS} src="switch" volume={0.5} />),
        <Sfx key="r" at={INBOX_AT.record * FPS} src="whoosh" volume={0.4} />,
      ];
    case "signs":
      return [
        <Sfx key="f" at={SIGNS_AT.file * FPS} src="whoosh" volume={0.4} />,
        ...SIGNS_AT.numbers.map((s) => <Sfx key={s} at={s * FPS - 1} src="whip" volume={0.45} />),
      ];
    case "bulk":
      return [
        <Sfx key="s" at={BULK_AT.sweep * FPS} src="whoosh" volume={0.45} />,
        <Sfx key="l" at={BULK_AT.lock * FPS} src="switch" volume={0.55} />,
      ];
    case "shadow":
      return [0, 1, 2, 3, 4].map((i) => (
        <Sfx key={i} at={(SHADOW_AT.delete + i * SHADOW_AT.gap) * FPS} src={i % 2 ? "switch" : "whip"} volume={0.35} />
      ));
    case "hide":
      return [
        ...[HIDE_AT.shell, HIDE_AT.encoded].map((s) => <Sfx key={s} at={s * FPS} src="switch" volume={0.45} />),
        <Sfx key="i" at={HIDE_AT.inject * FPS - 2} src="whoosh" volume={0.55} />,
      ];
    case "weigh":
      return [
        <Sfx key="r" at={WEIGH_AT.runKey * FPS} src="switch" volume={0.45} />,
        <Sfx key="s" at={WEIGH_AT.score * FPS} src="whoosh" volume={0.4} />,
        <Sfx key="v" at={WEIGH_AT.verdict * FPS} src="whip" volume={0.55} />,
      ];
    default:
      return [];
  }
};

export const YouTubePromo: React.FC<Props> = ({ loaded, captions, music }) => {
  if (!loaded) return null;
  const total = loaded.scenes.reduce((sum, s) => sum + sceneFrames(s), 0);
  const withCaptions: SceneType[] = [
    "problem",
    "how",
    "features",
    "cleanup",
    "timeline",
    "fleet",
    "usb",
    "split",
    "explode",
    "guard",
    "tamper",
    "ledger",
    "isolate",
    "resilient",
    // define and recap already spell the line out on screen
    "checkpoint",
    "signatures",
    "portal",
    "policy",
    "globe",
    "inbox",
    "signs",
    "bulk",
    "shadow",
    "hide",
    "weigh",
  ];
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
                  <Caption text={scene.caption ?? scene.vo} startFrame={VO_DELAY} seconds={scene.voSec} />
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
