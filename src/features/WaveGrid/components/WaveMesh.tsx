import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

interface WaveMeshProps {
  amplitude: number;
  frequency: number;
  speed: number;
}

export default function WaveMesh({
  amplitude,
  frequency,
  speed,
}: WaveMeshProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const time = clock.getElapsedTime();
    const position = meshRef.current.geometry.attributes.position;

    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const y = position.getY(i);

      const wave =
        Math.sin(x * frequency + time * speed) * amplitude +
        Math.sin(y * frequency + time * speed) * amplitude;
      position.setZ(i, wave);
    }

    position.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 20, 60, 60]} />
      <meshStandardMaterial color="#00aaff" wireframe />
    </mesh>
  );
}
