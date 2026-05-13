import { Canvas } from "@react-three/fiber";
import RotatingCube from "./components/RotatingCube";
import { OrbitControls } from "@react-three/drei";

export default function RotatingCubeScene() {
  return (
    <Canvas>
      <color attach="background" args={["#ae3d30"]} />
      <ambientLight intensity={0.7} />
      <RotatingCube />
      <directionalLight intensity={1} position={[0, 0, 5]} />
      <OrbitControls enableDamping dampingFactor={0.05} />
    </Canvas>
  );
}
