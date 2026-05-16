import { useState, useRef } from "react";
import Header from "./components/Header";
import RotatingCubeScene from "./features/RotatingCube/RotatingCubeScene";
import SolarSystem from "./features/SolarSystem/SolarSystem";
import WaveGrid from "./features/WaveGrid/WaveGrid";
import PhysicsScene from "./features/Physics/PhysicsScene";

const DURATION = 200;
const STORAGE_KEY = "active-scene";
const DEFAULT_SCENE = "rotating-cube";

function getSavedScene() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return SCENES.some((s) => s.id === saved) ? saved! : DEFAULT_SCENE;
}

const SCENES = [
  { id: "rotating-cube", label: "Rotating Cube" },
  { id: "solar-system", label: "Solar System" },
  { id: "wave-grid", label: "Wave Grid" },
  { id: "physics-scene", label: "Physics" },
];

export default function App() {
  const [active, setActive] = useState(getSavedScene);
  const [displayed, setDisplayed] = useState(getSavedScene);
  const [leaving, setLeaving] = useState(false);
  const [physicsResetKey, setPhysicsResetKey] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSelect = (id: string) => {
    if (id === displayed || leaving) return;
    setActive(id);
    setLeaving(true);
    timeoutRef.current = setTimeout(() => {
      setDisplayed(id);
      setLeaving(false);
      localStorage.setItem(STORAGE_KEY, id);
    }, DURATION);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        scenes={SCENES}
        active={active}
        onSelect={handleSelect}
        rightContent={
          active === "physics-scene" ? (
            <button
              onClick={() => setPhysicsResetKey((k) => k + 1)}
              className="px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors duration-250 bg-none hover:bg-gray-800 hover:text-gray-400 text-gray-500"
            >
              Reload
            </button>
          ) : undefined
        }
      />
      <main className="relative flex-1 bg-[#0a0a1a]">
        <div
          key={displayed}
          className={`absolute inset-0 ${leaving ? "scene-leave" : "scene-enter"}`}
        >
          {displayed === "rotating-cube" && <RotatingCubeScene />}
          {displayed === "solar-system" && <SolarSystem />}
          {displayed === "wave-grid" && <WaveGrid />}
          {displayed === "physics-scene" && (
            <PhysicsScene resetKey={physicsResetKey} />
          )}
        </div>
      </main>
    </div>
  );
}
