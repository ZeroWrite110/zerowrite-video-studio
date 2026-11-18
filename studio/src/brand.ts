// Studio-wide look. Change these once and every template follows.
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["600", "800", "900"],
  subsets: ["latin"],
});

export const BRAND = {
  fontFamily,
  fps: 30,
  // Vertical 9:16, for Reels / TikTok / Shorts.
  width: 1080,
  height: 1920,
  colors: {
    text: "#FFFFFF",
    highlight: "#FFD60A",
    dark: "#0B0F19",
    accent: "#3B82F6",
  },
};
