import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import Ground from "./components/Ground";
import DraggableCube from "./components/DraggableCube";
import { DragContext } from "../../components/DragContext";

export default function PhysicsScene() {
  const orbitRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <Canvas camera={{ position: [0, 5, 12], fov: 90 }} shadows>
      <color attach="background" args={["#0a0a1a"]} />
      <ambientLight intensity={0.8} />
      <directionalLight intensity={1.2} position={[5, 10, 5]} castShadow />
      <DragContext.Provider value={orbitRef}>
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <Ground />
            <DraggableCube orbitRef={orbitRef} />
          </Physics>
          <OrbitControls ref={orbitRef} />
        </Suspense>
      </DragContext.Provider>
    </Canvas>
  );
}
