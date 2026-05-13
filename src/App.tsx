import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import Header from "./components/Header";
import RotatingCubeScene from "./features/RotatingCube/RotatingCubeScene";
import Starfield from "./features/Starfield/Starfield";
import CombinedScene from "./features/Combined/CombinedScene";

const SCENES = [
  { id: "rotating-cube", label: "Rotating Cube" },
  { id: "starfield", label: "Starfield" },
  { id: "combined", label: "Combined" },
];

export default function App() {
  const [active, setActive] = useState("rotating-cube");

  return (
    <div className="flex flex-col h-screen">
      <Header scenes={SCENES} active={active} onSelect={setActive} />
      <div className="flex-1 overflow-hidden">
        <Canvas>
          {active === "rotating-cube" && <RotatingCubeScene />}
          {active === "starfield" && <Starfield />}
          {active === "combined" && <CombinedScene />}
        </Canvas>
      </div>
    </div>
  );
}
