import { memo, useCallback, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import Platform from "./Platform";
import JumpCharacter, { type JumpCharacterHandle } from "./JumpCharacter";

export type GameState = "idle" | "charging" | "airborne" | "landed" | "failed";

interface JumpGameProps {
  onStateChange: (state: GameState) => void;
  chargeBarFillRef: React.RefObject<HTMLDivElement | null>;
}

const BOX_1_POS = new Vector3(0, 0, 0);
const BOX_2_POS = new Vector3(0, 0, -5);
const PLATFORM_SIZE = new Vector3(3, 1, 3);
const SPAWN = { x: 0, y: 1.25, z: 0 };

const MAX_CHARGE_MS = 1200;
const MAX_SPEED = 14;
const LAUNCH_ANGLE = Math.PI / 4;
const MIN_AIRTIME_MS = 300;

const LAND_Y_MIN = 0.9;
const LAND_Y_MAX = 1.6;
const BOX1_HALF = 1.4;
const BOX2_X_HALF = 1.4;
const BOX2_Z_MIN = -6.4;
const BOX2_Z_MAX = -3.6;

function chargeColor(charge: number): string {
  if (charge < 0.5) {
    const t = charge * 2;
    return `rgb(${Math.round(34 + 216 * t)},${Math.round(197 + 7 * t)},${Math.round(94 - 73 * t)})`;
  }
  const t = (charge - 0.5) * 2;
  return `rgb(${Math.round(250 - 11 * t)},${Math.round(204 - 136 * t)},${Math.round(21 + 47 * t)})`;
}

function JumpGame({ onStateChange, chargeBarFillRef }: JumpGameProps) {
  const characterRef = useRef<JumpCharacterHandle>(null);
  const gameStateRef = useRef<GameState>("idle");
  const chargeStartRef = useRef(0);
  const jumpStartRef = useRef(0);
  const chargeRef = useRef(0);
  const isChargingRef = useRef(false);
  const isAirborneRef = useRef(false);

  const onStateChangeRef = useRef(onStateChange);
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  const notify = useCallback((state: GameState) => {
    gameStateRef.current = state;
    isChargingRef.current = state === "charging";
    // Keep physics active while falling after a miss — "failed" is still airborne
    isAirborneRef.current = state === "airborne" || state === "failed";
    onStateChangeRef.current(state);
  }, []);

  useEffect(() => {
    const doStartCharge = () => {
      if (gameStateRef.current !== "idle") return;
      chargeStartRef.current = performance.now();
      chargeRef.current = 0;
      notify("charging");
    };

    const doReleaseJump = () => {
      if (gameStateRef.current !== "charging") return;
      const charge = Math.min(
        (performance.now() - chargeStartRef.current) / MAX_CHARGE_MS,
        1
      );
      const speed = charge * MAX_SPEED;
      const vy = speed * Math.sin(LAUNCH_ANGLE);
      const vz = -speed * Math.cos(LAUNCH_ANGLE);
      characterRef.current?.jump({ x: 0, y: vy, z: vz });
      chargeRef.current = 0;
      jumpStartRef.current = performance.now();
      if (chargeBarFillRef.current) chargeBarFillRef.current.style.width = "0%";
      notify("airborne");
    };

    const doReset = () => {
      chargeRef.current = 0;
      if (chargeBarFillRef.current) chargeBarFillRef.current.style.width = "0%";
      characterRef.current?.reset(SPAWN);
      notify("idle");
    };

    const handlePress = () => {
      if (gameStateRef.current === "idle") doStartCharge();
      else if (
        gameStateRef.current === "landed" ||
        gameStateRef.current === "failed"
      )
        doReset();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      handlePress();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") doReleaseJump();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("pointerdown", handlePress);
    window.addEventListener("pointerup", doReleaseJump);
    window.addEventListener("pointercancel", doReleaseJump);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("pointerdown", handlePress);
      window.removeEventListener("pointerup", doReleaseJump);
      window.removeEventListener("pointercancel", doReleaseJump);
    };
  }, [notify, chargeBarFillRef]);

  useFrame(() => {
    const state = gameStateRef.current;

    if (state === "charging") {
      const charge = Math.min(
        (performance.now() - chargeStartRef.current) / MAX_CHARGE_MS,
        1
      );
      chargeRef.current = charge;
      const fill = chargeBarFillRef.current;
      if (fill) {
        fill.style.width = `${charge * 100}%`;
        fill.style.backgroundColor = chargeColor(charge);
      }
      return;
    }

    if (state === "airborne") {
      if (performance.now() - jumpStartRef.current < MIN_AIRTIME_MS) return;
      const pos = characterRef.current?.getTranslation();
      if (!pos) return;

      if (pos.y < -3) {
        notify("failed");
        return;
      }

      if (pos.y > LAND_Y_MIN && pos.y < LAND_Y_MAX) {
        if (
          Math.abs(pos.x) < BOX2_X_HALF &&
          pos.z > BOX2_Z_MIN &&
          pos.z < BOX2_Z_MAX
        ) {
          notify("landed");
          return;
        }
        if (Math.abs(pos.x) < BOX1_HALF && Math.abs(pos.z) < BOX1_HALF) {
          notify("idle");
        }
      }
    }
  });

  return (
    <>
      <Platform position={BOX_1_POS} size={PLATFORM_SIZE} />
      <Platform position={BOX_2_POS} size={PLATFORM_SIZE} color="#2a4a7c" />
      <JumpCharacter
        ref={characterRef}
        chargeRef={chargeRef}
        isChargingRef={isChargingRef}
        isAirborneRef={isAirborneRef}
      />
    </>
  );
}

export default memo(JumpGame);
