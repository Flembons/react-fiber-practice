import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import Ground from "./components/Ground";
import { DragContext } from "../../components/DragContext";
import DraggableSphere from "./components/DraggableSphere";
import SphereField from "./components/SphereField";

export default function PhysicsScene({ resetKey }: { resetKey?: number }) {
  const orbitRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <Canvas camera={{ position: [0, 15, 50], fov: 75 }} shadows="percentage">
      <color attach="background" args={["#0a0a1a"]} />
      <ambientLight intensity={0.8} />
      <directionalLight intensity={1.2} position={[5, 10, 5]} castShadow />
      <DragContext.Provider value={orbitRef}>
        <Suspense fallback={null}>
          <Physics key={resetKey} gravity={[0, -9.81, 0]}>
            <Ground />
            <DraggableSphere orbitRef={orbitRef} />
            <SphereField />
          </Physics>
          <OrbitControls ref={orbitRef} target={[0, 10, 0]} />
        </Suspense>
      </DragContext.Provider>
    </Canvas>
  );
}
