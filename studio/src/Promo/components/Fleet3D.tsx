import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export type Verdict = "idle" | "scan" | "allow" | "quarantine" | "delete" | "isolate";

export const VERDICT_COLOR: Record<Verdict, string> = {
  idle: "#0E7490",
  scan: "#67E8F9",
  allow: "#2FD68C",
  quarantine: "#E09112",
  delete: "#F03E4D",
  isolate: "#2563EB",
};

const COLS = 5;
const ROWS = 3;

// One laptop: a base slab and a tilted screen whose glow shows its state.
const Laptop: React.FC<{
  position: [number, number, number];
  color: string;
  pop: number;
}> = ({ position, color, pop }) => (
  <group position={position} scale={pop}>
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1.5, 0.08, 1.0]} />
      <meshStandardMaterial color="#1b2a30" metalness={0.8} roughness={0.35} />
    </mesh>
    <group position={[0, 0.04, -0.5]} rotation={[-0.32, 0, 0]}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.5, 1.0, 0.06]} />
        <meshStandardMaterial color="#11191c" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.5, 0.035]}>
        <planeGeometry args={[1.36, 0.86]} />
        <meshStandardMaterial color="#05090B" emissive={color} emissiveIntensity={0.85} />
      </mesh>
    </group>
  </group>
);

// Moves the camera every frame (the Canvas camera prop only applies once).
const CameraRig: React.FC<{ x: number }> = ({ x }) => {
  const camera = useThree((s) => s.camera);
  camera.position.set(x, 7.4, 11.8);
  camera.lookAt(0, 0, 0);
  return null;
};

// A fleet of Windows endpoints across a client's office. `verdictAt(i, frame)`
// decides what each screen shows; the camera drifts for parallax.
export const Fleet3D: React.FC<{ verdictAt: (i: number, frame: number) => Verdict }> = ({
  verdictAt,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / 30;
  const camX = interpolate(frame, [0, 380], [-2.2, 2.2], clamp);
  const laptops = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      const pop = interpolate(frame, [4 + i * 1.6, 16 + i * 1.6], [0.001, 1], {
        ...clamp,
        easing: Easing.bezier(0.2, 1.4, 0.4, 1),
      });
      laptops.push(
        <Laptop
          key={i}
          position={[(c - (COLS - 1) / 2) * 2.2, 0, (r - (ROWS - 1) / 2) * 2.0]}
          color={VERDICT_COLOR[verdictAt(i, frame)]}
          pop={pop}
        />,
      );
    }
  }
  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ position: [camX, 7.4, 11.8], fov: 42 }}
    >
      <CameraRig x={camX} />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 6, 4]} intensity={70} color="#67E8F9" />
      <pointLight position={[-6, 3, -4]} intensity={50} color="#2563EB" />
      <group rotation={[0, Math.sin(t * 0.25) * 0.08, 0]} position={[0, -0.6, 0]}>
        {laptops}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <planeGeometry args={[14, 8]} />
          <meshStandardMaterial color="#0a1215" metalness={0.5} roughness={0.8} />
        </mesh>
      </group>
    </ThreeCanvas>
  );
};
