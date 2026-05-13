import { useRef } from "react";
import type { Points } from "three";
import { useFrame } from "@react-three/fiber";

const positions = (() => {
  const count = 6000;
  const arr = new Float32Array(count * 3);
  const minDist = 20;
  let i = 0;
  while (i < count) {
    const x = (Math.random() - 0.5) * 100;
    const y = (Math.random() - 0.5) * 100;
    const z = (Math.random() - 0.5) * 100;
    if (Math.sqrt(x * x + y * y + z * z) > minDist) {
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
      i++;
    }
  }
  return arr;
})();

export default function StarfieldPoints() {
  const pointsRef = useRef<Points>(null);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={0xffffff} size={0.1} sizeAttenuation={true} />
    </points>
  );
}
