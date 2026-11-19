import { ThreeCanvas } from "@remotion/three";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const PANES = 5;
const SHARDS = 9; // per pane, a 3x3 split

// A stack of glowing glass panes ("restore points") that one by one turn red,
// split into shards and fall away. Frame-driven, so renders are deterministic.
export const Shadow3D: React.FC<{ startAt: number; gap: number }> = ({ startAt, gap }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / 30;
  const intro = interpolate(frame, [0, 26], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  return (
    <ThreeCanvas width={width} height={height} camera={{ position: [0, 0.6, 9], fov: 38 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 4, 6]} intensity={70} color="#67E8F9" />
      <pointLight position={[-4, -2, 5]} intensity={50} color="#F03E4D" />
      <group position={[-2.3, -0.1, 0]} rotation={[0.18, -0.55 + Math.sin(t * 0.5) * 0.06, 0]} scale={intro}>
        {Array.from({ length: PANES }).map((_, p) => {
          // Front pane goes first.
          const at = startAt + p * gap;
          const hit = interpolate(frame, [at - 4, at + 2], [0, 1], clamp);
          const fall = interpolate(frame, [at, at + 30], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
          const z = 1.6 - p * 0.8;
          const color = hit > 0.5 ? "#F03E4D" : "#22D3EE";
          return (
            <group key={p} position={[0, 0, z]}>
              {Array.from({ length: SHARDS }).map((__, s) => {
                const cx = (s % 3) - 1;
                const cy = Math.floor(s / 3) - 1;
                const spin = ((s * 37 + p * 11) % 7) - 3;
                return (
                  <mesh
                    key={s}
                    position={[
                      cx * 0.95 + cx * fall * 1.4,
                      cy * 0.7 - fall * fall * 4.5 + cy * fall * 0.6,
                      fall * (1 + (s % 3) * 0.7),
                    ]}
                    rotation={[fall * spin * 0.9, fall * spin * 0.6, fall * spin * 0.4]}
                  >
                    <boxGeometry args={[0.93, 0.68, 0.03]} />
                    <meshStandardMaterial
                      color={color}
                      emissive={color}
                      emissiveIntensity={0.55 + hit * 0.6}
                      metalness={0.3}
                      roughness={0.2}
                      transparent
                      opacity={(0.42 - p * 0.04) * (1 - fall * 0.85)}
                    />
                  </mesh>
                );
              })}
            </group>
          );
        })}
      </group>
    </ThreeCanvas>
  );
};
