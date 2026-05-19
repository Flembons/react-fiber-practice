import { RigidBody } from "@react-three/rapier";
import { Vector3 } from "three";

interface PlatformProps {
  position: Vector3;
  size: Vector3;
  color?: string;
}

export default function Platform({ position, size, color = "#4a7c5f" }: PlatformProps) {
  return (
    <RigidBody type="fixed" friction={1}>
      <mesh receiveShadow position={[position.x, position.y, position.z]}>
        <boxGeometry args={[size.x, size.y, size.z]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}
