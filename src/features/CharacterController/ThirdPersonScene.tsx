import { KeyboardControls, Sky } from "@react-three/drei";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import Ecctrl from "ecctrl";
import Level from "./components/Level";
import Character from "./components/Character";

const CONTROLS = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
  { name: "rightward", keys: ["ArrowRight", "KeyD"] },
  { name: "jump", keys: ["Space"] },
  { name: "run", keys: ["ShiftLeft", "ShiftRight"] },
];

export default function ThirdPersonScene() {
  return (
    <KeyboardControls map={CONTROLS}>
      <Canvas camera={{ position: [0, 2, 4], fov: 70 }} shadows="percentage">
        <Sky />
        <ambientLight intensity={0.7} />
        <directionalLight
          intensity={1.5}
          position={[100, 200, 10]}
          castShadow
        />
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <Level />
            <Ecctrl
              camMoveSpeed={2.5}
              camZoomSpeed={10}
              camCollisionSpeedMult={10}
              maxVelLimit={6}
              turnSpeed={1000}
              jumpVel={4}
            >
              <Character />
            </Ecctrl>
          </Physics>
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
}
