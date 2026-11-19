import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const CYAN = "#22D3EE";
const CYAN_BRIGHT = "#67E8F9";
const RED = "#F03E4D";
const AMBER = "#E09112";

export type CheckpointTimes = {
  early: [number, number]; // frames the "usual" block travels through, unchecked
  gate: number; // frame the checkpoint rises
  arrive: number[]; // frames each new block reaches the queue
  flare: number; // frame the checkpoint flares ("the moment it arrives")
};

const CameraRig: React.FC<{ x: number; z: number }> = ({ x, z }) => {
  const camera = useThree((s) => s.camera);
  camera.position.set(x, 4.2, z);
  camera.lookAt(-1.2, 0.6, 0);
  return null;
};

// One block on the conveyor: program (box), script (octahedron), payload (sphere).
const Block: React.FC<{ kind: number; color: string; glow: number }> = ({
  kind,
  color,
  glow,
}) => {
  const mat = (
    <meshStandardMaterial
      color="#14232a"
      emissive={color}
      emissiveIntensity={0.18 + glow * 0.5}
      metalness={0.6}
      roughness={0.3}
    />
  );
  if (kind === 0)
    return (
      <mesh>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        {mat}
      </mesh>
    );
  if (kind === 1)
    return (
      <mesh>
        <octahedronGeometry args={[0.62, 0]} />
        {mat}
      </mesh>
    );
  return (
    <mesh>
      <icosahedronGeometry args={[0.55, 1]} />
      {mat}
    </mesh>
  );
};

export const Checkpoint3D: React.FC<{ at: CheckpointTimes }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / 30;

  const camX = interpolate(frame, [0, at.gate, at.flare + 40], [-3, -7.5, -9.5], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
  const camZ = interpolate(frame, [0, at.gate, at.flare + 40], [14, 10.5, 8.5], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });

  // The early block: rolls straight into "memory" (right side) unchecked.
  const ep = interpolate(frame, at.early, [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const earlyX = interpolate(ep, [0, 1], [-11, 5.2]);
  const earlyFade = interpolate(frame, [at.gate - 10, at.gate + 8], [1, 0], clamp);
  const memHot = interpolate(earlyX, [3, 4.5], [0, 1], clamp) * earlyFade;

  const gate = interpolate(frame, [at.gate, at.gate + 14], [0.001, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 1.5, 0.4, 1),
  });
  const flare = frame >= at.flare ? Math.max(0, 1 - (frame - at.flare) / 25) : 0;
  const scanY = 0.4 + Math.sin(t * 3.2) * 1.2;

  const blocks = at.arrive.map((a, i) => {
    const p = interpolate(frame, [a - 24, a], [0, 1], {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    });
    if (p <= 0) return null;
    const qx = -1.5 - i * 1.6;
    const x = interpolate(p, [0, 1], [-12, qx]);
    const bob = Math.sin(t * 2 + i) * 0.08;
    const held = p >= 1;
    return (
      <group key={i} position={[x, 0.55 + bob, 0]} rotation={[t * 0.4 + i, t * 0.6 + i, 0]}>
        <Block kind={i} color={held ? AMBER : CYAN} glow={held ? 0.4 + flare : 0} />
        {held ? (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.95, 0.03, 8, 40]} />
            <meshBasicMaterial color={AMBER} transparent opacity={0.7} />
          </mesh>
        ) : null}
      </group>
    );
  });

  return (
    <ThreeCanvas width={width} height={height} camera={{ position: [3.5, 4.2, 15.5], fov: 36 }}>
      <CameraRig x={camX} z={camZ} />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 6, 6]} intensity={90} color={CYAN_BRIGHT} />
      <pointLight position={[6, 2, -4]} intensity={40} color="#2563EB" />

      {/* Conveyor track */}
      <mesh position={[-2.5, -0.05, 0]}>
        <boxGeometry args={[19, 0.1, 1.8]} />
        <meshStandardMaterial color="#0d171b" metalness={0.6} roughness={0.5} />
      </mesh>
      {Array.from({ length: 24 }).map((_, i) => {
        const x = ((i * 0.8 - t * 1.4) % 19.2 + 19.2) % 19.2 - 12;
        return (
          <mesh key={i} position={[x, 0.01, 0]}>
            <boxGeometry args={[0.06, 0.02, 1.6]} />
            <meshBasicMaterial color={CYAN} transparent opacity={0.25} />
          </mesh>
        );
      })}

      {/* "Memory" zone on the right */}
      <mesh position={[5.4, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 2.6]} />
        <meshBasicMaterial color={memHot > 0.01 ? RED : "#16343c"} transparent opacity={0.35 + memHot * 0.5} />
      </mesh>
      {earlyFade > 0.01 && ep > 0 ? (
        <group position={[earlyX, 0.55, 0]} rotation={[t * 0.5, t * 0.7, 0]} scale={earlyFade}>
          <Block kind={0} color={memHot > 0.3 ? RED : CYAN} glow={memHot} />
        </group>
      ) : null}

      {/* The checkpoint gate */}
      <group scale={[1, gate, 1]} position={[0, 0, 0]}>
        {[-1.2, 1.2].map((z) => (
          <mesh key={z} position={[0, 1.4, z]}>
            <boxGeometry args={[0.22, 2.8, 0.22]} />
            <meshStandardMaterial color="#11191c" emissive={CYAN} emissiveIntensity={0.6 + flare * 2} />
          </mesh>
        ))}
        <mesh position={[0, 2.85, 0]}>
          <boxGeometry args={[0.22, 0.22, 2.62]} />
          <meshStandardMaterial color="#11191c" emissive={CYAN} emissiveIntensity={0.6 + flare * 2} />
        </mesh>
        {/* translucent field + moving scan line */}
        <mesh position={[0, 1.4, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[2.4, 2.8]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0.12 + flare * 0.3} side={2} />
        </mesh>
        <mesh position={[0, 1.4 + scanY * 0.9, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[2.4, 0.05]} />
          <meshBasicMaterial color={CYAN_BRIGHT} side={2} />
        </mesh>
      </group>
      {flare > 0 ? (
        <mesh position={[0, 1.4, 0]} rotation={[0, Math.PI / 2, 0]} scale={1 + (1 - flare) * 0.9}>
          <ringGeometry args={[1.5, 1.62, 64]} />
          <meshBasicMaterial color={CYAN_BRIGHT} transparent opacity={flare} side={2} />
        </mesh>
      ) : null}

      {blocks}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color="#071013" metalness={0.4} roughness={0.9} transparent opacity={0.6} />
      </mesh>
    </ThreeCanvas>
  );
};
