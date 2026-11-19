import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// A 3D "guard" made of three tilted metallic rings and an orbit of particles.
// Everything is driven by useCurrentFrame() so renders are deterministic.
export const Rings3D: React.FC<{ intro?: number; scale?: number }> = ({
  intro = 24,
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / 30;
  const grow = interpolate(frame, [0, intro], [0.2, 1], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const particles = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * Math.PI * 2;
      const r = 3.1 + ((i * 7) % 5) * 0.12;
      pts.push([Math.cos(a) * r, ((i * 13) % 9) * 0.05 - 0.2, Math.sin(a) * r]);
    }
    return pts;
  }, []);

  return (
    <ThreeCanvas width={width} height={height} camera={{ position: [0, 0, 9], fov: 40 }}>
      <ambientLight intensity={0.35} />
      <pointLight position={[4, 4, 6]} intensity={60} color="#67E8F9" />
      <pointLight position={[-5, -3, 4]} intensity={40} color="#2563EB" />
      <group scale={grow * scale} rotation={[0.35, t * 0.5, 0]}>
        <mesh rotation={[Math.PI / 2, 0, t * 0.6]}>
          <torusGeometry args={[2.6, 0.06, 32, 160]} />
          <meshStandardMaterial
            color="#22D3EE"
            emissive="#0E7490"
            emissiveIntensity={0.8}
            metalness={0.8}
            roughness={0.25}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2.6, t * 0.8, 0]}>
          <torusGeometry args={[2.25, 0.035, 24, 160]} />
          <meshStandardMaterial
            color="#67E8F9"
            emissive="#22D3EE"
            emissiveIntensity={0.6}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        <mesh rotation={[Math.PI / 1.7, -t * 0.7, Math.PI / 5]}>
          <torusGeometry args={[2.95, 0.025, 24, 160]} />
          <meshStandardMaterial
            color="#2563EB"
            emissive="#2563EB"
            emissiveIntensity={0.7}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        <group rotation={[0, -t * 0.9, 0]}>
          {particles.map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.03 + (i % 3) * 0.012, 8, 8]} />
              <meshBasicMaterial color={i % 4 === 0 ? "#67E8F9" : "#22D3EE"} />
            </mesh>
          ))}
        </group>
      </group>
    </ThreeCanvas>
  );
};
