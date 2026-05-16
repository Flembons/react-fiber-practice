import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { OrbitControls, Sky } from "@react-three/drei";
import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { MOUSE } from "three";
import Level from "./components/Level";
import Character from "./components/Character";

export default function CharacterControllerScene() {
  const orbitRef = useRef<OrbitControlsImpl>(null);

  return (
    <div style={{ width: "100%", height: "100%" }} onContextMenu={(e) => e.preventDefault()}>
      <Canvas camera={{ position: [0, 2, 6], fov: 70 }} shadows="percentage">
        <Sky />
        <ambientLight intensity={0.7} />
        <directionalLight intensity={1.5} position={[100, 200, 10]} castShadow />
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
          mouseButtons={{ LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.ROTATE }}
        />
      </Canvas>
    </div>
  );
}
