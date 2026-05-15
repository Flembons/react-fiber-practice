import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import RotatingCube from "./components/RotatingCube";

export default function RotatingCubeScene() {
  return (
    <Canvas>
      <color attach="background" args={["#000008"]} />
      <PerspectiveCamera makeDefault position={[0, 0, 2]} fov={90} />
      <ambientLight intensity={0.7} />
      <directionalLight intensity={1} position={[0, 0, 5]} />
      <RotatingCube />
      <OrbitControls enableDamping dampingFactor={0.05} />
    </Canvas>
  );
}
