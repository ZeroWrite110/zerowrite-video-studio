import type { Caption, TikTokPage } from "@remotion/captions";
import { createTikTokStyleCaptions } from "@remotion/captions";
import { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BRAND } from "../brand";

// How often a new group of words appears. Lower = fewer words on screen.
const SWITCH_CAPTIONS_EVERY_MS = 900;

export type CaptionPosition = "middle" | "lower";

const CaptionPage: React.FC<{
  page: TikTokPage;
  highlightColor: string;
  position: CaptionPosition;
}> = ({ page, highlightColor, position }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const absoluteTimeMs = page.startMs + (frame / fps) * 1000;

  return (
    <AbsoluteFill
      style={{
        justifyContent: position === "middle" ? "center" : "flex-end",
        alignItems: "center",
        // above the Reels/TikTok button area in 9:16, near the bottom in 16:9
        paddingBottom: position === "lower" ? Math.round(height * 0.2) : 0,
        paddingLeft: 90,
        paddingRight: 90,
      }}
    >
      <div
        style={{
          fontFamily: BRAND.fontFamily,
          fontWeight: 900,
          fontSize: 92,
          lineHeight: 1.15,
          textAlign: "center",
          textTransform: "uppercase",
          color: BRAND.colors.text,
          whiteSpace: "pre-wrap",
          WebkitTextStroke: "14px black",
          paintOrder: "stroke fill",
          textShadow: "0 8px 24px rgba(0,0,0,0.55)",
          scale: interpolate(frame, [0, 6], [0.85, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {page.tokens.map((token, i) => {
          const active =
            token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;
          return (
            <span
              key={`${token.fromMs}-${i}`}
              style={{ color: active ? highlightColor : BRAND.colors.text }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC<{
  captions: Caption[];
  highlightColor: string;
  position: CaptionPosition;
}> = ({ captions, highlightColor, position }) => {
  const { fps } = useVideoConfig();
  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
      }),
    [captions],
  );

  return (
    <AbsoluteFill>
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const startFrame = Math.round((page.startMs / 1000) * fps);
        const endFrame = Math.round(
          ((nextPage
            ? nextPage.startMs
            : page.startMs + page.durationMs + 400) /
            1000) *
            fps,
        );
        const durationInFrames = endFrame - startFrame;
        if (durationInFrames <= 0) return null;
        return (
          <Sequence
            key={index}
            name={`Caption ${index + 1}`}
            from={startFrame}
            durationInFrames={durationInFrames}
          >
            <CaptionPage
              page={page}
              highlightColor={highlightColor}
              position={position}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
