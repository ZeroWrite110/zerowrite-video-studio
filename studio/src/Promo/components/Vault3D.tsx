import { ThreeCanvas } from "@remotion/three";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// A local "history" drive: a stack of glowing record discs that grows one disc
// per action, inside a slowly turning cage. Frame-driven, so renders are deterministic.
export const Vault3D: React.FC<{ recordAt: number[]; lockAt: number }> = ({ recordAt, lockAt }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / 30;
  const intro = interpolate(frame, [0, 24], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const lock = interpolate(frame, [lockAt, lockAt + 16], [0, 1], { ...clamp, easing: Easing.bezier(0.34, 1.56, 0.64, 1) });
  const bars = 10;
  return (
    <ThreeCanvas width={width} height={height} camera={{ position: [0, 1.6, 9], fov: 40 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 5, 6]} intensity={90} color="#67E8F9" />
      <pointLight position={[-4, -2, 4]} intensity={40} color="#2FD68C" />
      <group position={[-3.1, -0.15, -1.2]} rotation={[0.18, t * 0.35, 0]} scale={intro * 0.72}>
        {/* base plate */}
        <mesh position={[0, -1.15, 0]}>
          <cylinderGeometry args={[1.7, 1.8, 0.18, 48]} />
          <meshStandardMaterial color="#0E1518" metalness={0.6} roughness={0.35} emissive="#0E7490" emissiveIntensity={0.25} />
        </mesh>
        {/* record discs, one per action */}
        {recordAt.map((at, i) => {
          const p = interpolate(frame, [at, at + 12], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
          if (p <= 0) return null;
          return (
            <mesh key={i} position={[0, -0.92 + i * 0.32 + (1 - p) * 1.6, 0]} scale={[p, 1, p]}>
              <cylinderGeometry args={[1.25, 1.25, 0.2, 48]} />
              <meshStandardMaterial
                color={i % 2 ? "#22D3EE" : "#2FD68C"}
                emissive={i % 2 ? "#22D3EE" : "#2FD68C"}
                emissiveIntensity={0.55}
                metalness={0.3}
                roughness={0.25}
                transparent
                opacity={0.9}
              />
            </mesh>
          );
        })}
        {/* cage bars */}
        {Array.from({ length: bars }).map((_, i) => {
          const a = (i / bars) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 1.75, 0.15, Math.sin(a) * 1.75]}>
              <cylinderGeometry args={[0.035, 0.035, 2.6, 8]} />
              <meshStandardMaterial color="#67E8F9" emissive="#22D3EE" emissiveIntensity={0.6} transparent opacity={0.55} />
            </mesh>
          );
        })}
        {/* lid that closes when "stays on your machine" is said */}
        <mesh position={[0, 1.45 + (1 - lock) * 1.4, 0]} rotation={[0, 0, (1 - lock) * 0.6]}>
          <cylinderGeometry args={[1.85, 1.85, 0.16, 48]} />
          <meshStandardMaterial color="#0E1518" metalness={0.7} roughness={0.3} emissive="#22D3EE" emissiveIntensity={0.25 + lock * 0.4} transparent opacity={0.3 + lock * 0.65} />
        </mesh>
        <mesh position={[0, 1.45 + (1 - lock) * 1.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.9, 0.05, 12, 64]} />
          <meshStandardMaterial color="#67E8F9" emissive="#67E8F9" emissiveIntensity={1.2 * lock} transparent opacity={lock} />
        </mesh>
      </group>
    </ThreeCanvas>
  );
};
