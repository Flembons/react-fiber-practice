import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import WaveMesh from "./components/WaveMesh";
import WaveControls from "./components/WaveControls";

type WaveParam = "amplitude" | "frequency" | "speed";

export default function WaveGrid() {
  const [amplitude, setAmplitude] = useState(0.6);
  const [frequency, setFrequency] = useState(1.5);
  const [speed, setSpeed] = useState(1);

  const handleChange = (key: WaveParam, value: number) => {
    if (key === "amplitude") setAmplitude(value);
    if (key === "frequency") setFrequency(value);
    if (key === "speed") setSpeed(value);
  };

  return (
    <div className="w-full h-full relative">
      <Canvas>
        <color attach="background" args={["#0a0a1a"]} />
        <PerspectiveCamera makeDefault position={[0, 10, 15]} fov={60} />
        <ambientLight intensity={1} />
        <directionalLight intensity={1} position={[5, 10, 5]} />
        <WaveMesh amplitude={amplitude} frequency={frequency} speed={speed} />
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
      <WaveControls
        amplitude={amplitude}
        frequency={frequency}
        speed={speed}
        onChange={handleChange}
      />
    </div>
  );
}
