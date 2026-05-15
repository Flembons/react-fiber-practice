import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh } from "three";
import { GradientTexture } from "@react-three/drei";
import { MathUtils } from "three";
import type { ThreeEvent } from "@react-three/fiber";

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
  const meshRef = useRef<Mesh>(null);
  const targetScale = useRef(1);

  useFrame((_, delta) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y += speed * delta;
    }

    if (meshRef.current) {
      const current = meshRef.current.scale.x;
      const next = MathUtils.damp(current, targetScale.current, 5, delta);
      meshRef.current.scale.setScalar(next);
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    targetScale.current *= 1.5;
  };

  const handleRightClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    targetScale.current *= 0.5;
  };

  return (
    <group ref={orbitRef}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onContextMenu={handleRightClick}
        position={[distance, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial roughness={0.9} metalness={0.4}>
          <GradientTexture
            stops={[0, 1]} // 0% to 100% of the mesh
            colors={[color_start, color_end]} // Colors to transition between
            size={1024} // Texture size
          />
        </meshStandardMaterial>
      </mesh>
    </group>
  );
}
