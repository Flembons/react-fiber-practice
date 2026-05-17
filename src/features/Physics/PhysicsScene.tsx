import { Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import Ground from "./components/Ground";
import { DragContext } from "../../components/DragContext";
import DraggableSphere from "./components/DraggableSphere";
import SphereField from "./components/SphereField";

export default function PhysicsScene() {
  const orbitRef = useRef<OrbitControlsImpl | null>(null);
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 15, 50], fov: 75 }} shadows="percentage">
        <color attach="background" args={["#0a0a1a"]} />
        <ambientLight intensity={0.8} />
        <directionalLight intensity={1.2} position={[5, 10, 5]} castShadow />
        <DragContext.Provider value={orbitRef}>
          <Suspense fallback={null}>
            <Physics key={resetKey} gravity={[0, -9.81, 0]}>
              <Ground />
              <DraggableSphere />
              <SphereField />
            </Physics>
            <OrbitControls ref={orbitRef} target={[0, 10, 0]} />
          </Suspense>
        </DragContext.Provider>
      </Canvas>
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setResetKey((k) => k + 1)}
          className="px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors duration-250 bg-blue-950 border border-blue-400/80 hover:bg-blue-900 text-white/80"
        >
          Reload
        </button>
      </div>
    </div>
  );
}
