import { forwardRef } from "react";
import "@react-three/fiber";
import type { Group } from "three";

const Character = forwardRef<Group>((_, ref) => (
  <group ref={ref}>
    <mesh castShadow>
      <capsuleGeometry args={[0.35, 0.8, 4, 8]} />
      <meshStandardMaterial color="#60cfa8" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.3, 0.35]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color="#ff6b6b" />
    </mesh>
    <mesh position={[-0.1, 0.5, 0.3]}>
      <sphereGeometry args={[0.05, 1, 4]} />
      <meshStandardMaterial color="#efebeb" />
    </mesh>
    <mesh position={[0.1, 0.5, 0.3]}>
      <sphereGeometry args={[0.05, 1, 4]} />
      <meshStandardMaterial color="#efebeb" />
    </mesh>
  </group>
));

Character.displayName = "Character";
export default Character;
