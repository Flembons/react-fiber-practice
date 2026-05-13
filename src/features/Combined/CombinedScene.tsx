import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import StarfieldPoints from "../Starfield/components/StarfieldPoints";
import RotatingCube from "../RotatingCube/components/RotatingCube";

export default function CombinedScene() {
  return (
    <Canvas>
      <color attach="background" args={["#000008"]} />
      <ambientLight intensity={0.7} />
      <directionalLight intensity={1} position={[0, 0, 5]} />
      <StarfieldPoints />
      <RotatingCube />
      <OrbitControls enableDamping dampingFactor={0.05} />
    </Canvas>
  );
}
