import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { GradientTexture } from "@react-three/drei";

interface PlanetProps {
  color_start: string;
  color_end: string;
  distance: number;
  size: number;
  speed: number;
}

export default function Planet({
  color_start,
  color_end,
  distance,
  size,
  speed,
}: PlanetProps) {
  const orbitRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y += speed * delta;
    }
  });

  return (
    <group ref={orbitRef}>
      <mesh position={[distance, 0, 0]}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial>
          <GradientTexture
            stops={[0, 1]} // 0% to 100% of the mesh
            colors={[color_start, color_end]} // Colors to transition between
            size={1024} // Texture size
          />
        </meshBasicMaterial>
      </mesh>
    </group>
  );
}
