import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Deterministic pseudo-random in [0, 1).
const rand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// A 3D file that spins, then bursts into shards at `burstFrame`, leaving a
// glowing core whose colour follows `coreColor`. Everything is frame-driven.
export const FileBurst3D: React.FC<{ burstFrame: number; coreColor: string }> = ({
  burstFrame,
  coreColor,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / 30;
  const intro = interpolate(frame, [0, 22], [0.2, 1], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const burst = interpolate(frame, [burstFrame, burstFrame + 26], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.1, 0.9, 0.2, 1),
  });
  const body = interpolate(frame, [burstFrame - 2, burstFrame + 4], [1, 0.001], clamp);
  const core = interpolate(frame, [burstFrame, burstFrame + 14], [0.001, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 1.5, 0.4, 1),
  });

  const shards = useMemo(
    () =>
      new Array(70).fill(0).map((_, i) => {
        const theta = rand(i) * Math.PI * 2;
        const phi = Math.acos(2 * rand(i + 99) - 1);
        const dist = 2.4 + rand(i + 7) * 2.8;
        return {
          dir: [
            Math.sin(phi) * Math.cos(theta) * dist * 1.5,
            Math.cos(phi) * dist * 0.9,
            Math.sin(phi) * Math.sin(theta) * dist,
          ] as [number, number, number],
          start: [(rand(i + 3) - 0.5) * 1.6, (rand(i + 5) - 0.5) * 2.0, 0] as [number, number, number],
          size: 0.07 + rand(i + 11) * 0.14,
          spin: (rand(i + 13) - 0.5) * 8,
          cyan: rand(i + 17) > 0.35,
        };
      }),
    [],
  );

  return (
    <ThreeCanvas width={width} height={height} camera={{ position: [0, 0, 9], fov: 40 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 6]} intensity={70} color="#67E8F9" />
      <pointLight position={[-5, -3, 4]} intensity={40} color="#2563EB" />
      <group rotation={[0.15, t * 0.7, 0]} scale={intro}>
        {/* file body */}
        <group scale={body}>
          <mesh>
            <boxGeometry args={[1.6, 2.0, 0.16]} />
            <meshStandardMaterial color="#0E1518" metalness={0.7} roughness={0.3} emissive="#0E7490" emissiveIntensity={0.35} />
          </mesh>
          {[0.45, 0.15, -0.15, -0.45].map((y, i) => (
            <mesh key={y} position={[i === 0 ? -0.2 : 0, y, 0.09]}>
              <boxGeometry args={[i === 0 ? 0.8 : 1.15, 0.08, 0.02]} />
              <meshBasicMaterial color="#22D3EE" />
            </mesh>
          ))}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.66, 2.06, 0.1]} />
            <meshBasicMaterial color="#22D3EE" wireframe />
          </mesh>
        </group>
        {/* shards */}
        {burst > 0
          ? shards.map((s, i) => (
              <mesh
                key={i}
                position={[
                  s.start[0] + s.dir[0] * burst,
                  s.start[1] + s.dir[1] * burst,
                  s.start[2] + s.dir[2] * burst,
                ]}
                rotation={[s.spin * burst, s.spin * 0.7 * burst, 0]}
                scale={1 - burst * 0.55}
              >
                <boxGeometry args={[s.size, s.size * 1.3, 0.03]} />
                <meshStandardMaterial
                  color={s.cyan ? "#22D3EE" : "#0E7490"}
                  emissive={s.cyan ? "#22D3EE" : "#2563EB"}
                  emissiveIntensity={0.9}
                  metalness={0.6}
                  roughness={0.3}
                />
              </mesh>
            ))
          : null}
        {/* intent core */}
        <mesh scale={core}>
          <icosahedronGeometry args={[0.62, 1]} />
          <meshStandardMaterial color={coreColor} emissive={coreColor} emissiveIntensity={1.2} wireframe />
        </mesh>
        <mesh scale={core * 0.55}>
          <sphereGeometry args={[0.62, 32, 32]} />
          <meshBasicMaterial color={coreColor} />
        </mesh>
      </group>
    </ThreeCanvas>
  );
};
