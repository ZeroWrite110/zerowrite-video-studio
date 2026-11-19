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
const JADE = "#2FD68C";

export type IsolateTimes = {
  threat: number; // frame the machine turns amber
  isolate: number; // frame the links are cut
  keep: number; // frame the ZeroWrite link pulses
  release: number; // frame the links come back
};

const N = 9; // outside connections
// Node positions on a tilted ring; index 0 is ZeroWrite.ai.
const nodePos = (i: number): [number, number, number] => {
  if (i === 0) return [0, 3.4, -1.2]; // ZeroWrite.ai, above the machine
  const a = ((i - 1) / N) * Math.PI * 2 + 0.2;
  const r = 4.6;
  return [Math.cos(a) * r, -0.2 + Math.sin(i * 1.9) * 0.9, Math.sin(a) * r * 0.6];
};

// A link from the machine to a node, drawn as a thin cylinder whose length
// is `grow` (0..1) of the full distance.
const Link: React.FC<{
  to: [number, number, number];
  grow: number;
  color: string;
  width: number;
}> = ({ to, grow, color, width }) => {
  const len = Math.hypot(to[0], to[1], to[2]);
  if (grow <= 0.001) return null;
  const dir = [to[0] / len, to[1] / len, to[2] / len];
  const l = len * grow;
  // rotate the Y-axis cylinder onto dir
  const yaw = Math.atan2(dir[0], dir[2]);
  const pitch = Math.acos(Math.max(-1, Math.min(1, dir[1])));
  return (
    <group rotation={[0, yaw, 0]}>
      <group rotation={[pitch, 0, 0]}>
        <mesh position={[0, l / 2, 0]}>
          <cylinderGeometry args={[width, width, l, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.85} />
        </mesh>
      </group>
    </group>
  );
};

const CameraRig: React.FC<{ angle: number; dist: number }> = ({ angle, dist }) => {
  const camera = useThree((s) => s.camera);
  camera.position.set(Math.sin(angle) * dist, 5.2, Math.cos(angle) * dist);
  camera.lookAt(0, 0.7, 0);
  return null;
};

export const Isolate3D: React.FC<{ at: IsolateTimes }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / 30;
  const angle = interpolate(frame, [0, 330], [-0.45, 0.45], clamp);
  const dist = interpolate(frame, [0, at.isolate, at.isolate + 30], [17.5, 16.5, 15], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

  const cut = interpolate(frame, [at.isolate, at.isolate + 16], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const back = interpolate(frame, [at.release, at.release + 18], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const threat = interpolate(frame, [at.threat, at.threat + 8], [0, 1], clamp);
  const keepPulse = frame >= at.keep ? 0.5 + 0.5 * Math.sin((frame - at.keep) / 3) : 0;
  const bubble = interpolate(frame, [at.isolate + 6, at.isolate + 20], [0, 1], clamp) * (1 - back);

  const machineColor = back > 0.5 ? JADE : threat > 0.5 ? AMBER : CYAN;

  const nodes = [];
  for (let i = 0; i < N + 1; i++) {
    const pos = nodePos(i);
    const isZw = i === 0;
    const appear = interpolate(frame, [2 + i * 2, 12 + i * 2], [0.001, 1], {
      ...clamp,
      easing: Easing.bezier(0.2, 1.4, 0.4, 1),
    });
    const linkGrow = isZw ? appear : appear * (1 - cut) + back;
    const linkColor = isZw
      ? CYAN_BRIGHT
      : back > 0
        ? JADE
        : cut > 0
          ? RED
          : CYAN;
    const dim = isZw ? 1 : 1 - cut * 0.65 + back * 0.65;
    // data packets travelling outwards on live links
    const packetP = ((t * 0.9 + i * 0.37) % 1);
    const live = isZw || cut < 0.05 || back > 0.95;
    nodes.push(
      <group key={i}>
        <Link
          to={pos}
          grow={Math.min(1, linkGrow)}
          color={linkColor}
          width={isZw ? 0.05 + keepPulse * 0.04 : 0.03}
        />
        {live ? (
          <mesh position={[pos[0] * packetP, pos[1] * packetP, pos[2] * packetP]}>
            <sphereGeometry args={[isZw ? 0.13 : 0.09, 12, 12]} />
            <meshBasicMaterial color={isZw ? CYAN_BRIGHT : linkColor} />
          </mesh>
        ) : null}
        <group position={pos} scale={appear}>
          {isZw ? (
            <mesh rotation={[Math.PI / 2, 0, t]}>
              <torusGeometry args={[0.7, 0.16, 16, 48]} />
              <meshStandardMaterial
                color={CYAN}
                emissive={CYAN}
                emissiveIntensity={0.8 + keepPulse * 1.2}
              />
            </mesh>
          ) : (
            <mesh>
              <icosahedronGeometry args={[0.32, 0]} />
              <meshStandardMaterial
                color="#1b2a30"
                emissive={back > 0 ? JADE : cut > 0 ? RED : CYAN}
                emissiveIntensity={0.55 * dim}
                transparent
                opacity={0.35 + 0.65 * dim}
              />
            </mesh>
          )}
        </group>
      </group>,
    );
  }

  return (
    <ThreeCanvas width={width} height={height} camera={{ position: [0, 5.2, 17.5], fov: 38 }}>
      <CameraRig angle={angle} dist={dist} />
      <ambientLight intensity={0.45} />
      <pointLight position={[0, 6, 5]} intensity={80} color={CYAN_BRIGHT} />
      <pointLight position={[-6, 2, -5]} intensity={50} color="#2563EB" />
      <group rotation={[0, t * 0.05, 0]}>
        {nodes}
        {/* The machine: a monitor on a stand */}
        <group rotation={[0, -t * 0.05 + Math.sin(t * 0.6) * 0.1, 0]}>
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[2.1, 1.35, 0.12]} />
            <meshStandardMaterial color="#11191c" metalness={0.7} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.55, 0.065]}>
            <planeGeometry args={[1.9, 1.15]} />
            <meshStandardMaterial color="#05090B" emissive={machineColor} emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, -0.35, 0]}>
            <boxGeometry args={[0.2, 0.6, 0.12]} />
            <meshStandardMaterial color="#1b2a30" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.66, 0.1]}>
            <boxGeometry args={[1.0, 0.06, 0.6]} />
            <meshStandardMaterial color="#1b2a30" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
        {/* Isolation bubble */}
        {bubble > 0.01 ? (
          <mesh scale={0.6 + bubble * 1.4}>
            <icosahedronGeometry args={[1.3, 2]} />
            <meshBasicMaterial color={AMBER} wireframe transparent opacity={0.45 * bubble} />
          </mesh>
        ) : null}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.72, 0]}>
        <circleGeometry args={[6.5, 64]} />
        <meshStandardMaterial color="#0a1215" metalness={0.5} roughness={0.85} transparent opacity={0.45} />
      </mesh>
    </ThreeCanvas>
  );
};
