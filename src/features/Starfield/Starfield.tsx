import { PerspectiveCamera } from "@react-three/drei";
import StarfieldPoints from "./components/StarfieldPoints";

export default function Starfield() {
  return (
    <>
      <color attach="background" args={["#000008"]} />
      <PerspectiveCamera makeDefault position={[0, 0, 1]} fov={75} />
      <StarfieldPoints />
    </>
  );
}
