import { Composition, Folder } from "remotion";
import { BRAND } from "./brand";
import {
  CaptionedReel,
  calculateCaptionedReelMetadata,
  captionedReelDefaults,
  captionedReelSchema,
} from "./CaptionedReel";
import {
  TextReel,
  calculateTextReelMetadata,
  textReelDefaults,
  textReelSchema,
} from "./TextReel";
import {
  Explainer,
  calculateExplainerMetadata,
  explainerDefaults,
  explainerSchema,
} from "./Explainer";

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="Templates">
      <Composition
        id="CaptionedReel"
        component={CaptionedReel}
        durationInFrames={300}
        fps={BRAND.fps}
        width={BRAND.width}
        height={BRAND.height}
        schema={captionedReelSchema}
        defaultProps={captionedReelDefaults}
        calculateMetadata={calculateCaptionedReelMetadata}
      />
      <Composition
        id="TextReel"
        component={TextReel}
        durationInFrames={300}
        fps={BRAND.fps}
        width={BRAND.width}
        height={BRAND.height}
        schema={textReelSchema}
        defaultProps={textReelDefaults}
        calculateMetadata={calculateTextReelMetadata}
      />
      <Composition
        id="Explainer"
        component={Explainer}
        durationInFrames={600}
        fps={BRAND.fps}
        width={BRAND.width}
        height={BRAND.height}
        schema={explainerSchema}
        defaultProps={explainerDefaults}
        calculateMetadata={calculateExplainerMetadata}
      />
    </Folder>
  );
};
