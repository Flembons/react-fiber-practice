export default function Sun() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color="#FDB813"
        emissive={"#ffff00"}
        emissiveIntensity={1}
      />
      <pointLight color="#fff5e0" intensity={100} distance={60} />
    </mesh>
  );
}
