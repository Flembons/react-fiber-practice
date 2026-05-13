import { useState } from "react";
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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header scenes={SCENES} active={active} onSelect={setActive} />
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {SCENES.map(({ id }) => (
          <div
            key={id}
            style={{
              position: "absolute",
              inset: 0,
              visibility: active === id ? "visible" : "hidden",
            }}
          >
            {id === "rotating-cube" && <RotatingCubeScene />}
            {id === "starfield" && <Starfield />}
            {id === "combined" && <CombinedScene />}
          </div>
        ))}
      </div>
    </div>
  );
}
