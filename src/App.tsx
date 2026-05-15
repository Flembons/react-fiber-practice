import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import Header from "./components/Header";
import RotatingCubeScene from "./features/RotatingCube/RotatingCubeScene";
import SolarSystem from "./features/SolarSystem/SolarSystem";

const SCENES = [
  { id: "rotating-cube", label: "Rotating Cube" },
  { id: "solar-system", label: "Solar System" },
];

export default function App() {
  const [active, setActive] = useState("rotating-cube");

  return (
    <div className="flex flex-col h-screen">
      <Header scenes={SCENES} active={active} onSelect={setActive} />
      <main className="flex flex-col h-full bg-black">
        <Canvas>
          {active === "solar-system" && <SolarSystem />}
          {active === "rotating-cube" && <RotatingCubeScene />}
        </Canvas>
      </main>
    </div>
  );
}
