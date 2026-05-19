export default function Character() {
  return (
    <group>
      <mesh castShadow>
        <capsuleGeometry args={[0.35, 0.8, 8, 16]} />
        <meshStandardMaterial color="#60cfa8" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.3, 0.35]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      <mesh position={[-0.1, 0.5, 0.32]}>
        <sphereGeometry args={[0.05, 4, 4]} />
        <meshStandardMaterial color="#efebeb" />
      </mesh>
      <mesh position={[0.1, 0.5, 0.32]}>
        <sphereGeometry args={[0.05, 4, 4]} />
        <meshStandardMaterial color="#efebeb" />
      </mesh>
    </group>
  );
}
