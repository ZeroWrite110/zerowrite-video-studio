// ZeroWrite look, from Brand Kit/colors.txt (taken from zerowrite.ai).
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily: sans } = loadInter("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin"],
});
const { fontFamily: mono } = loadMono("normal", {
  weights: ["400", "600"],
  subsets: ["latin"],
});

export const ZW = {
  sans,
  mono,
  ink: "#05090B",
  panel: "#0E1518",
  line: "rgba(233,238,240,0.10)",
  text: "#E9EEF0",
  muted: "#ADB6B9",
  faint: "#7A8386",
  cyan: "#22D3EE",
  cyanBright: "#67E8F9",
  cyanDeep: "#0E7490",
  blue: "#2563EB",
  jade: "#2FD68C",
  amber: "#E09112",
  red: "#F03E4D",
};
