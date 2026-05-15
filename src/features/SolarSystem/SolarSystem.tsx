import Stars from "./components/Stars";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import Planet from "./components/Planet";
import Sun from "./components/Sun";

const PLANETS = [
  {
    name: "Mercury",
    color_start: "#b5b5b5",
    color_end: "#8a8a8a",
    distance: 2.5,
    size: 0.1,
    speed: 1.6,
  },
  {
    name: "Venus",
    color_start: "#e8cda0",
    color_end: "#c8a070",
    distance: 3.5,
    size: 0.18,
    speed: 1.17,
  },
  {
    name: "Earth",
    color_start: "#4fa3e0",
    color_end: "#2a6fba",
    distance: 5,
    size: 0.2,
    speed: 1.0,
  },
  {
    name: "Mars",
    color_start: "#c1440e",
    color_end: "#8b2e06",
    distance: 6.5,
    size: 0.13,
    speed: 0.8,
  },
  {
    name: "Jupiter",
    color_start: "#c88b3a",
    color_end: "#8b5a2b",
    distance: 10,
    size: 0.5,
    speed: 0.43,
  },
  {
    name: "Saturn",
    color_start: "#e8d5a3",
    color_end: "#c8b283",
    distance: 14,
    size: 0.4,
    speed: 0.32,
  },
];

export default function SolarSystem() {
  return (
    <>
      <color attach="background" args={["#000008"]} />
      <PerspectiveCamera makeDefault position={[0, 12, 10]} fov={60} />
      <ambientLight intensity={0.2} />
      <Stars />
      <Sun />
      {PLANETS.map((planet) => (
        <Planet key={planet.name} {...planet} />
      ))}
      <OrbitControls enableDamping dampingFactor={0.05} />
    </>
  );
}
