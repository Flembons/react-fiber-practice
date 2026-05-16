import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CapsuleCollider,
  RigidBody,
  useRapier,
  type RapierRigidBody,
} from "@react-three/rapier";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { MathUtils, Vector3 } from "three";
import type { Group } from "three";

interface CharacterProps {
  orbitRef: RefObject<OrbitControlsImpl | null>;
}

// Jump parameters
const JUMP_PEAK_TIME = 0.5;
const JUMP_FALL_TIME = 0.45;
const JUMP_HEIGHT = 3.0;

// Kinematic equations for jumping
const PLAYER_GRAVITY = (2.0 * JUMP_HEIGHT) / JUMP_PEAK_TIME ** 2; // 24 m/s²
const FALL_GRAVITY = (2.0 * JUMP_HEIGHT) / JUMP_FALL_TIME ** 2; // ~29.6 m/s²
const JUMP_VELOCITY = PLAYER_GRAVITY * JUMP_PEAK_TIME; // 12 m/s

// Movement parameters
const ACCELERATION = 5.0;
const MAX_SPEED = 15.0;
const SLOW_DOWN = 70.0;
const MIN_START_SPEED = 8.0;

function moveToward(current: number, target: number, maxStep: number): number {
  const diff = target - current;
  if (Math.abs(diff) <= maxStep) return target;
  return current + Math.sign(diff) * maxStep;
}

export default function Character({ orbitRef }: CharacterProps) {
  const { world } = useRapier();
  type KCC = ReturnType<typeof world.createCharacterController>;

  const rbRef = useRef<RapierRigidBody>(null);
  const visualRef = useRef<Group>(null);
  const meshRef = useRef<Group>(null);
  const controllerRef = useRef<KCC | null>(null);

  const vel = useRef(new Vector3());
  const speed = useRef(0);
  const hasDoubleJump = useRef(true);
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    autoRun: false,
  });
  const mouseBtns = useRef({ left: false, right: false });
  const spacePrev = useRef(false);
  const prevPlayerPos = useRef(new Vector3(0, 1, 0));

  useEffect(() => {
    const ctrl = world.createCharacterController(0.01);
    ctrl.setMaxSlopeClimbAngle((45 * Math.PI) / 180);
    ctrl.setMinSlopeSlideAngle((30 * Math.PI) / 180);
    ctrl.enableAutostep(0.5, 0.2, true);
    ctrl.enableSnapToGround(0.5);
    ctrl.setSlideEnabled(true);
    controllerRef.current = ctrl;
    return () => world.removeCharacterController(ctrl);
  }, [world]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === "KeyW") keys.current.w = true;
      if (e.code === "KeyA") keys.current.a = true;
      if (e.code === "KeyS") keys.current.s = true;
      if (e.code === "KeyD") keys.current.d = true;
      if (e.code === "Space") {
        e.preventDefault();
        keys.current.space = true;
      }
      if (e.code === "KeyF") keys.current.autoRun = true;
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === "KeyW") keys.current.w = false;
      if (e.code === "KeyA") keys.current.a = false;
      if (e.code === "KeyS") keys.current.s = false;
      if (e.code === "KeyD") keys.current.d = false;
      if (e.code === "Space") keys.current.space = false;
      if (e.code === "KeyF") keys.current.autoRun = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (e.button === 0) mouseBtns.current.left = true;
      if (e.button === 2) mouseBtns.current.right = true;
    };
    const onUp = (e: MouseEvent) => {
      if (e.button === 0) mouseBtns.current.left = false;
      if (e.button === 2) mouseBtns.current.right = false;
    };
    const noCtxMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("contextmenu", noCtxMenu);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("contextmenu", noCtxMenu);
    };
  }, []);

  useFrame(({ camera }, delta) => {
    if (!rbRef.current || !controllerRef.current) return;

    const v = vel.current;
    const grounded = controllerRef.current.computedGrounded();

    // Gravity: stronger on the way down, matching Godot's split gravity
    if (!grounded) {
      const gravity = v.y > 0 ? PLAYER_GRAVITY : FALL_GRAVITY;
      v.y -= gravity * delta;
    } else if (v.y < 0) {
      v.y = 0;
    }

    // Jump edge detection
    const spaceDown = keys.current.space;
    const justPressed = spaceDown && !spacePrev.current;
    const justReleased = !spaceDown && spacePrev.current;
    spacePrev.current = spaceDown;

    // Jump cut: releasing space early while ascending cuts velocity (Godot _input)
    if (justReleased && v.y > 0) {
      v.y *= 0.4;
    }

    if (justPressed) {
      if (grounded) {
        v.y = JUMP_VELOCITY;
      } else if (hasDoubleJump.current) {
        v.y = JUMP_VELOCITY;
        hasDoubleJump.current = false;
      }
    }

    // Reset double jump when touching ground
    if (grounded) hasDoubleJump.current = true;

    // Camera-relative movement direction
    const camDir = new Vector3();
    camera.getWorldDirection(camDir);
    camDir.y = 0;
    camDir.normalize();
    const camRight = new Vector3()
      .crossVectors(camDir, new Vector3(0, 1, 0))
      .normalize();

    const bothButtons =
      (mouseBtns.current.left && mouseBtns.current.right) ||
      keys.current.autoRun;
    const rightOnly = mouseBtns.current.right && !mouseBtns.current.left;

    const inputX = (keys.current.d ? 1 : 0) - (keys.current.a ? 1 : 0);
    const inputZ =
      (keys.current.s ? 1 : 0) - (keys.current.w || bothButtons ? 1 : 0);
    const hasInput = inputX !== 0 || inputZ !== 0;

    let moveDir: Vector3 | null = null;

    if (hasInput) {
      moveDir = new Vector3();
      moveDir.addScaledVector(camDir, -inputZ);
      moveDir.addScaledVector(camRight, inputX);
      moveDir.normalize();

      if (speed.current < MIN_START_SPEED) speed.current = MIN_START_SPEED;
      speed.current = moveToward(
        speed.current,
        MAX_SPEED,
        ACCELERATION * delta,
      );

      const t = Math.min(ACCELERATION * delta, 1);
      v.x = MathUtils.lerp(v.x, moveDir.x * speed.current, t);
      v.z = MathUtils.lerp(v.z, moveDir.z * speed.current, t);
    } else {
      speed.current = moveToward(speed.current, 0, SLOW_DOWN * delta);
      v.x = moveToward(v.x, 0, SLOW_DOWN * delta);
      v.z = moveToward(v.z, 0, SLOW_DOWN * delta);
    }

    if (meshRef.current) {
      if (rightOnly) {
        // Right mouse only: instantly snap to face the camera's forward direction
        meshRef.current.rotation.y = Math.atan2(camDir.x, camDir.z);
      } else if (moveDir) {
        const targetAngle = Math.atan2(moveDir.x, moveDir.z);
        let diff = targetAngle - meshRef.current.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        meshRef.current.rotation.y += diff * Math.min(5 * delta, 1);
      }
    }

    // Compute collision-resolved displacement and apply
    const displacement = new Vector3(v.x * delta, v.y * delta, v.z * delta);
    const collider = rbRef.current.collider(0);
    controllerRef.current.computeColliderMovement(collider, displacement);
    const corrected = controllerRef.current.computedMovement();
    const pos = rbRef.current.translation();
    const newPos = {
      x: pos.x + corrected.x,
      y: pos.y + corrected.y,
      z: pos.z + corrected.z,
    };
    rbRef.current.setNextKinematicTranslation(newPos);

    // Drive the visual directly to newPos so it matches the camera target
    // in the same frame, eliminating the one-frame Rapier-sync lag.
    if (visualRef.current) {
      visualRef.current.position.set(newPos.x, newPos.y, newPos.z);
    }

    // Translate both camera and target by the player's movement delta.
    // This keeps the spherical offset (camera - target) unchanged each frame,
    // so OrbitControls never rotates to "re-acquire" the player — it only
    // rotates in response to mouse input.
    const playerPos = new Vector3(newPos.x, newPos.y + 1.0, newPos.z);
    const playerDelta = playerPos.clone().sub(prevPlayerPos.current);
    prevPlayerPos.current.copy(playerPos);

    if (orbitRef.current) {
      orbitRef.current.target.add(playerDelta);
      camera.position.add(playerDelta);
    }
  });

  return (
    <>
      <RigidBody
        ref={rbRef}
        type="kinematicPosition"
        colliders={false}
        position={[0, 2, 0]}
      >
        <CapsuleCollider args={[0.4, 0.35]} />
      </RigidBody>
      <group ref={visualRef} position={[0, 2, 0]}>
        <group ref={meshRef}>
          <mesh castShadow>
            <capsuleGeometry args={[0.35, 0.8, 4, 8]} />
            <meshStandardMaterial color="#60cfa8" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.3, 0.35]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ff6b6b" />
          </mesh>
        </group>
      </group>
    </>
  );
}
