import { useState, useRef } from "react";
import Header from "./components/Header";
import RotatingCubeScene from "./features/RotatingCube/RotatingCubeScene";
import SolarSystem from "./features/SolarSystem/SolarSystem";
import WaveGrid from "./features/WaveGrid/WaveGrid";
import PhysicsScene from "./features/Physics/PhysicsScene";

const DURATION = 200;

const SCENES = [
  { id: "rotating-cube", label: "Rotating Cube" },
  { id: "solar-system", label: "Solar System" },
  { id: "wave-grid", label: "Wave Grid" },
  { id: "physics-scene", label: "Physics" },
];

export default function App() {
  const [active, setActive] = useState("rotating-cube");
  const [displayed, setDisplayed] = useState("rotating-cube");
  const [leaving, setLeaving] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSelect = (id: string) => {
    if (id === displayed || leaving) return;
    setActive(id);
    setLeaving(true);
    timeoutRef.current = setTimeout(() => {
      setDisplayed(id);
      setLeaving(false);
    }, DURATION);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header scenes={SCENES} active={active} onSelect={handleSelect} />
      <main className="relative flex-1 bg-black">
        <div
          key={displayed}
          className={`absolute inset-0 ${leaving ? "scene-leave" : "scene-enter"}`}
        >
          {displayed === "rotating-cube" && <RotatingCubeScene />}
          {displayed === "solar-system" && <SolarSystem />}
          {displayed === "wave-grid" && <WaveGrid />}
          {displayed === "physics-scene" && <PhysicsScene />}
        </div>
      </main>
    </div>
  );
}
