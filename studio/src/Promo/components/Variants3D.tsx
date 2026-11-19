import { ThreeCanvas } from "@remotion/three";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const VARIANT_COUNT = 18;

// Where each copy settles: three rings around the original, on a gentle arc.
export const variantSlot = (i: number) => {
  const ring = i < 6 ? 0 : i < 12 ? 1 : 2;
  const k = i % 6;
  const a = (k / 6) * Math.PI * 2 + ring * 0.5;
  const r = 1.55 + ring * 0.85;
  return { x: Math.cos(a) * r * 1.15, y: Math.sin(a) * r * 0.55, z: -ring * 0.9 };
};

// One file block in the middle that keeps cloning itself. Each copy is the same
// shape with a slightly different tint ("same malware, new fingerprint").
// Frame-driven, so renders are deterministic.
export const Variants3D: React.FC<{ cloneAt: number; gap: number }> = ({ cloneAt, gap }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / 30;
  const intro = interpolate(frame, [0, 22], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const pulse = 1 + Math.sin(t * 5) * 0.03;
  return (
    <ThreeCanvas width={width} height={height} camera={{ position: [0, 0.4, 10], fov: 40 }}>
      <ambientLight intensity={0.45} />
      <pointLight position={[4, 4, 7]} intensity={80} color="#67E8F9" />
      <pointLight position={[-5, -3, 5]} intensity={60} color="#F03E4D" />
      <group position={[2.4, -0.35, 0]} rotation={[0.12, Math.sin(t * 0.4) * 0.12, 0]}>
        {/* the original */}
        <mesh scale={intro * pulse} rotation={[0.2, t * 0.9, 0.08]}>
          <boxGeometry args={[1.1, 1.4, 0.22]} />
          <meshStandardMaterial color="#F03E4D" emissive="#F03E4D" emissiveIntensity={0.7} metalness={0.4} roughness={0.25} />
        </mesh>
        {Array.from({ length: VARIANT_COUNT }).map((_, i) => {
          const at = cloneAt + i * gap;
          const p = interpolate(frame, [at, at + 14], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
          if (p <= 0) return null;
          const s = variantSlot(i);
          // Each copy's tint drifts between red and amber, so no two match.
          const hue = 350 + ((i * 23) % 40);
          const color = `hsl(${hue % 360}, 85%, ${52 + (i % 3) * 5}%)`;
          return (
            <mesh
              key={i}
              position={[s.x * p, s.y * p, s.z * p]}
              rotation={[0.2 + i * 0.3, t * (0.6 + (i % 4) * 0.15) + i, 0.1]}
              scale={0.62 * p}
            >
              <boxGeometry args={[1.1, 1.4, 0.22]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5}
                metalness={0.35}
                roughness={0.3}
                transparent
                opacity={0.9}
              />
            </mesh>
          );
        })}
      </group>
    </ThreeCanvas>
  );
};
