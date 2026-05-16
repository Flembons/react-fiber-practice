import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import Level from "./components/Level";
import Character from "./components/Character";

export default function CharacterControllerScene() {
  const orbitRef = useRef<OrbitControlsImpl>(null);

  return (
    <Canvas camera={{ position: [0, 2, 6], fov: 70 }} shadows="percentage">
      <color attach="background" args={["#0a0a1a"]} />
      <ambientLight intensity={0.7} />
      <directionalLight intensity={1.5} position={[10, 20, 10]} castShadow />
      <Suspense fallback={null}>
        <Physics gravity={[0, -20, 0]}>
          <Level />
          <Character orbitRef={orbitRef} />
        </Physics>
      </Suspense>
      <OrbitControls
        ref={orbitRef}
        enablePan={false}
        enableDamping
        dampingFactor={0.1}
        minDistance={3}
        maxDistance={15}
        maxPolarAngle={Math.PI * 0.85}
      />
    </Canvas>
  );
}
