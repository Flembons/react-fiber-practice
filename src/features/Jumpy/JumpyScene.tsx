import { Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import JumpGame, { type GameState } from "./components/JumpGame";

export default function JumpyScene() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const chargeBarFillRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        camera={{ position: [9, 11, 9], fov: 50 }}
        onCreated={({ camera }) => camera.lookAt(0, 0, -2.5)}
      >
        <color attach="background" args={["#0a0a1a"]} />
        <ambientLight intensity={0.8} />
        <directionalLight intensity={1.5} position={[0, 10, 5]} castShadow />
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <JumpGame
              onStateChange={setGameState}
              chargeBarFillRef={chargeBarFillRef}
            />
          </Physics>
        </Suspense>
      </Canvas>

      {/* bottom hint / charge bar */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-10">
        {gameState === "idle" && (
          <p className="text-white/50 text-sm tracking-wide">
            Hold{" "}
            <kbd className="px-1.5 py-0.5 bg-white/15 rounded text-xs font-mono">
              SPACE
            </kbd>{" "}
            or tap to charge · release to jump
          </p>
        )}

        {gameState === "charging" && (
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-white/40 text-xs tracking-widest uppercase">
              Power
            </span>
            <div className="w-52 h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                ref={chargeBarFillRef}
                className="h-full w-0 rounded-full"
                style={{ backgroundColor: "#22c55e" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* centered result banner */}
      {(gameState === "landed" || gameState === "failed") && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-2xl font-semibold mb-1">
              {gameState === "landed" ? "Nice landing!" : "Missed!"}
            </p>
            <p className="text-white/50 text-sm">
              Press{" "}
              <kbd className="px-1.5 py-0.5 bg-white/15 rounded text-xs font-mono">
                SPACE
              </kbd>{" "}
              or tap to {gameState === "landed" ? "play again" : "try again"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
