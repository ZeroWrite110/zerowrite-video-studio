import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const CYAN = "#22D3EE";
const CYAN_BRIGHT = "#67E8F9";
const JADE = "#2FD68C";
const R = 3;

// Point on the sphere from latitude/longitude in degrees.
const ll = (lat: number, lon: number, r = R): THREE.Vector3 => {
  const phi = ((90 - lat) * Math.PI) / 180;
  const th = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
};

// Illustrative machine locations (not real customers), spread over the front.
const SITES: [number, number][] = [
  [47, -122], [37, -100], [41, -87], [40, -74], [33, -84], [30, -97], [45, -75],
  [25, -80], [39, -105], [34, -118], [44, -93], [36, -86], [42, -71], [29, -90],
];
const PORTAL: [number, number] = [52, -96];

export type GlobeTimes = { ripple: number; checkin: number; done: number };

const CameraRig: React.FC<{ angle: number; dist: number }> = ({ angle, dist }) => {
  const camera = useThree((s) => s.camera);
  camera.position.set(Math.sin(angle) * dist, 2.4, Math.cos(angle) * dist);
  camera.lookAt(0, 0.4, 0);
  return null;
};

// Arc from the portal to a site, drawn up to `p` (0..1) as a tube.
const Arc: React.FC<{ from: THREE.Vector3; to: THREE.Vector3; p: number; color: string }> = ({
  from,
  to,
  p,
  color,
}) => {
  const curve = useMemo(() => {
    const mid = from.clone().add(to).multiplyScalar(0.5);
    mid.setLength(R + 0.45 + from.distanceTo(to) * 0.35);
    return new THREE.QuadraticBezierCurve3(from, mid, to);
  }, [from, to]);
  const geom = useMemo(() => {
    if (p <= 0.01) return null;
    const pts: THREE.Vector3[] = [];
    const n = 24;
    for (let i = 0; i <= n; i++) pts.push(curve.getPoint((i / n) * p));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.018, 6, false);
  }, [curve, p]);
  if (!geom) return null;
  return (
    <mesh geometry={geom}>
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
};

export const Globe3D: React.FC<{ at: GlobeTimes }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / 30;

  const dots = useMemo(() => {
    const n = 900;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const a = i * 2.39996;
      arr[i * 3] = Math.cos(a) * r * R;
      arr[i * 3 + 1] = y * R;
      arr[i * 3 + 2] = Math.sin(a) * r * R;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  const portal = useMemo(() => ll(PORTAL[0], PORTAL[1], R + 0.05), []);
  const sites = useMemo(() => SITES.map(([a, b]) => ll(a, b, R + 0.04)), []);
  const maxD = Math.max(...sites.map((s) => s.distanceTo(portal)));

  // Globe turns so the sites face the camera.
  const spin = interpolate(frame, [0, 260], [-0.45, 0.05], clamp);
  const angle = interpolate(frame, [0, 260], [-0.25, 0.25], clamp);
  const dist = interpolate(frame, [0, 60, 260], [16, 14.2, 13.4], clamp);

  const ringP = interpolate(frame, [at.ripple, at.ripple + 50], [0, 1], clamp);

  return (
    <ThreeCanvas width={width} height={height} camera={{ position: [0, 2.4, 12.5], fov: 36 }}>
      <CameraRig angle={angle} dist={dist} />
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 6, 8]} intensity={90} color={CYAN_BRIGHT} />
      <pointLight position={[-6, -2, -4]} intensity={40} color="#2563EB" />
      <group position={[2.5, 0.1, 0]} rotation={[0.35, spin, 0]}>
        <mesh>
          <sphereGeometry args={[R * 0.985, 48, 48]} />
          <meshStandardMaterial color="#071116" metalness={0.3} roughness={0.8} transparent opacity={0.92} />
        </mesh>
        <points geometry={dots}>
          <pointsMaterial color={CYAN} size={0.035} transparent opacity={0.55} />
        </points>
        <mesh>
          <sphereGeometry args={[R * 1.08, 32, 32]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0.05} side={THREE.BackSide} />
        </mesh>
        {/* the portal */}
        <group position={portal}>
          <mesh>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshBasicMaterial color={CYAN_BRIGHT} />
          </mesh>
          <mesh scale={1 + Math.sin(t * 4) * 0.12}>
            <sphereGeometry args={[0.24, 16, 16]} />
            <meshBasicMaterial color={CYAN} transparent opacity={0.25} />
          </mesh>
        </group>
        {/* ripple shell expanding from the portal */}
        {ringP > 0 && ringP < 1 ? (
          <mesh position={portal}>
            <sphereGeometry args={[0.2 + ringP * maxD, 32, 32]} />
            <meshBasicMaterial color={JADE} wireframe transparent opacity={0.22 * (1 - ringP)} />
          </mesh>
        ) : null}
        {sites.map((s, i) => {
          const reach = s.distanceTo(portal) / maxD; // 0..1
          const arcStart = at.ripple + reach * 40;
          const arcP = interpolate(frame, [arcStart, arcStart + 14], [0, 1], clamp);
          const inF = at.checkin + i * 3;
          const checked = frame >= inF;
          const pop = interpolate(frame, [inF, inF + 8], [1, 1.8], clamp) - interpolate(frame, [inF + 8, inF + 16], [0, 0.8], clamp);
          const color = checked ? JADE : CYAN;
          return (
            <group key={i}>
              <Arc from={portal} to={s} p={arcP} color={checked ? JADE : CYAN} />
              <mesh position={s} scale={pop}>
                <boxGeometry args={[0.11, 0.11, 0.11]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
              </mesh>
            </group>
          );
        })}
      </group>
    </ThreeCanvas>
  );
};
