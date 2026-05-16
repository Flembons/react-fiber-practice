import { CuboidCollider, RigidBody } from "@react-three/rapier";

export default function Ground() {
  return (
    <>
      <RigidBody type="fixed" restitution={0.4} friction={0.8}>
        <mesh position={[0, -1, 0]}>
          <boxGeometry args={[40, 0.4, 40]} />
          <meshStandardMaterial color="#cb6619" />
        </mesh>
      </RigidBody>

      {/* Back */}
      <RigidBody type="fixed">
        <CuboidCollider args={[20, 500, 0.2]} position={[0, 499, -20]} />
      </RigidBody>

      {/* Front */}
      <RigidBody type="fixed">
        <CuboidCollider args={[20, 500, 0.2]} position={[0, 499, 20]} />
      </RigidBody>

      {/* Left */}
      <RigidBody type="fixed">
        <CuboidCollider args={[0.2, 500, 20]} position={[-20, 499, 0]} />
      </RigidBody>

      {/* Right */}
      <RigidBody type="fixed">
        <CuboidCollider args={[0.2, 500, 20]} position={[20, 499, 0]} />
      </RigidBody>
    </>
  );
}
