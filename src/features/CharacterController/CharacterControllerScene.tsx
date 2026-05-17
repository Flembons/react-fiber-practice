import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { KeyboardControls, OrbitControls, Sky } from "@react-three/drei";
import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { MOUSE } from "three";
import Level from "./components/Level";
import Character from "./components/Character";

const CONTROLS = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
  { name: "jump", keys: ["Space"] },
  { name: "autoRun", keys: ["KeyF"] },
];

export default function CharacterControllerScene() {
  const orbitRef = useRef<OrbitControlsImpl>(null);

  return (
    <KeyboardControls map={CONTROLS}>
      <Canvas camera={{ position: [0, 3, 6], fov: 70 }} shadows="percentage">
        <Sky />
        <ambientLight intensity={0.7} />
        <directionalLight
          intensity={1.5}
          position={[100, 200, 10]}
          castShadow
        />
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
          minDistance={1}
          maxDistance={10}
          maxPolarAngle={Math.PI * 0.75}
          mouseButtons={{
            LEFT: MOUSE.ROTATE,
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.ROTATE,
          }}
        />
      </Canvas>
    </KeyboardControls>
  );
}
