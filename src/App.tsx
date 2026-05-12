import { useState } from "react";
import Header from "./components/Header";
import RotatingCube from "./threejs/RotatingCube";
import Starfield from "./threejs/Starfield/Starfield";

const SCENES = [
  { id: "rotating-cube", label: "Rotating Cube" },
  { id: "starfield", label: "Starfield" },
];

export default function App() {
  const [active, setActive] = useState("rotating-cube");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header scenes={SCENES} active={active} onSelect={setActive} />
      <div style={{ flex: 1, overflow: "hidden" }}>
        {active === "rotating-cube" && <RotatingCube />}
        {active === "starfield" && <Starfield />}
      </div>
    </div>
  );
}
