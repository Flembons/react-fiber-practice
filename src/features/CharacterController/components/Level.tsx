import { RigidBody } from "@react-three/rapier";

export default function Level() {
  return (
    <>
      {/* Floor */}
      <RigidBody type="fixed" friction={1}>
        <mesh receiveShadow position={[0, -0.2, 0]}>
          <boxGeometry args={[50, 0.4, 50]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
      </RigidBody>

      {/* Platforms */}
      <RigidBody type="fixed" friction={1}>
        <mesh castShadow receiveShadow position={[5, 1, -5]}>
          <boxGeometry args={[4, 0.4, 4]} />
          <meshStandardMaterial color="#2a2a4e" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" friction={1}>
        <mesh castShadow receiveShadow position={[-5, 1, 5]}>
          <boxGeometry args={[4, 0.4, 4]} />
          <meshStandardMaterial color="#2a2a4e" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" friction={1}>
        <mesh castShadow receiveShadow position={[0, 1, 0]}>
          <boxGeometry args={[4, 0.4, 4]} />
          <meshStandardMaterial color="#2a2a4e" />
        </mesh>
      </RigidBody>

      {/* Ramp */}
      <RigidBody type="fixed" friction={1}>
        <mesh
          castShadow
          receiveShadow
          position={[-5, 0.75, -3]}
          rotation={[0.35, 0, 0]}
        >
          <boxGeometry args={[4, 0.4, 6]} />
          <meshStandardMaterial color="#2a2a4e" />
        </mesh>
      </RigidBody>
    </>
  );
}
