import { Canvas } from "@react-three/fiber";
import StarfieldPoints from "./components/StarfieldPoints";

export default function Starfield() {
  return (
    <Canvas>
      <color attach="background" args={["#000008"]} />
      <StarfieldPoints />
    </Canvas>
  );
}
