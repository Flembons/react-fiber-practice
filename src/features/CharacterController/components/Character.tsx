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
import { MathUtils, Matrix4, Quaternion, Vector3 } from "three";
import type { Group } from "three";
import { useKeyboardControls } from "@react-three/drei";

interface CharacterProps {
  orbitRef: RefObject<OrbitControlsImpl | null>;
}

// Speed of rotation when changing direction
const ROTATION_SPEED = 8.0;
// Speed of tilt when aligning to slopes
const TILT_SPEED = 8.0;
// Minimum angle change (radians) before tilt updates — suppresses micro-jitter
const TILT_THRESHOLD = 0.005;

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
  const { world, rapier } = useRapier();
  type KCC = ReturnType<typeof world.createCharacterController>;

  const rbRef = useRef<RapierRigidBody>(null);
  const visualRef = useRef<Group>(null);
  const meshRef = useRef<Group>(null);
  const controllerRef = useRef<KCC | null>(null);

  const [, getKeys] = useKeyboardControls();

  const vel = useRef(new Vector3());
  const speed = useRef(0);
  const hasDoubleJump = useRef(true);
  const mouseBtns = useRef({ left: false, right: false });
  const jumpPrev = useRef(false);
  const prevPlayerPos = useRef(new Vector3(0, 1, 0));
  const yaw = useRef(0);

  useEffect(() => {
    const ctrl = world.createCharacterController(0.01);
    ctrl.setMaxSlopeClimbAngle((45 * Math.PI) / 180);
    ctrl.setMinSlopeSlideAngle((30 * Math.PI) / 180);
    ctrl.enableAutostep(0.5, 0.2, true);
    ctrl.setSlideEnabled(true);
    controllerRef.current = ctrl;
    return () => world.removeCharacterController(ctrl);
  }, [world]);

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

    const {
      forward: keyForward,
      backward,
      left: keyLeft,
      right: keyRight,
      jump,
      autoRun,
    } = getKeys();

    const v = vel.current;
    const grounded = controllerRef.current.computedGrounded();

    if (!grounded) {
      const gravity = v.y > 0 ? PLAYER_GRAVITY : FALL_GRAVITY;
      v.y -= gravity * delta;
    } else {
      v.y = 0;
    }

    // Jump edge detection
    const justPressed = jump && !jumpPrev.current;
    const justReleased = !jump && jumpPrev.current;
    jumpPrev.current = jump;

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
      (mouseBtns.current.left && mouseBtns.current.right) || autoRun;
    const rightOnly = mouseBtns.current.right && !mouseBtns.current.left;

    const inputX = (keyRight ? 1 : 0) - (keyLeft ? 1 : 0);
    const inputZ = (backward ? 1 : 0) - (keyForward || bothButtons ? 1 : 0);
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

    if (rightOnly) {
      yaw.current = Math.atan2(camDir.x, camDir.z);
    } else if (moveDir) {
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      let diff = targetAngle - yaw.current;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      yaw.current += diff * Math.min(ROTATION_SPEED * delta, 1);
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

    // Raycast straight down to get the surface normal under the character.
    const ray = new rapier.Ray(newPos, { x: 0, y: -1, z: 0 });
    const hit = world.castRayAndGetNormal(
      ray,
      1.2,
      true,
      undefined,
      undefined,
      undefined,
      rbRef.current ?? undefined,
    );
    if (meshRef.current) {
      const worldUp = new Vector3(0, 1, 0);
      const forward = new Vector3(
        Math.sin(yaw.current),
        0,
        Math.cos(yaw.current),
      );
      let targetQuat: Quaternion;

      if (hit && hit.normal.y > 0.7) {
        // Port of Godot's align_with_floor:
        //   basis.y = floor_normal
        //   basis.x = -(basis.z × floor_normal)  →  up × forward (Three.js +Z forward)
        //   basis.orthonormalized()               →  newForward = right × up
        const up = new Vector3(hit.normal.x, hit.normal.y, hit.normal.z);
        const right = new Vector3().crossVectors(up, forward).normalize();
        const newForward = new Vector3().crossVectors(right, up).normalize();
        targetQuat = new Quaternion().setFromRotationMatrix(
          new Matrix4().makeBasis(right, up, newForward),
        );
      } else {
        targetQuat = new Quaternion().setFromAxisAngle(worldUp, yaw.current);
      }

      if (meshRef.current.quaternion.angleTo(targetQuat) > TILT_THRESHOLD) {
        meshRef.current.quaternion.slerp(
          targetQuat,
          Math.min(TILT_SPEED * delta, 1),
        );
      }
    }

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
          <mesh position={[-0.1, 0.5, 0.3]}>
            <sphereGeometry args={[0.05, 1, 4]} />
            <meshStandardMaterial color="#efebeb" />
          </mesh>
          <mesh position={[0.1, 0.5, 0.3]}>
            <sphereGeometry args={[0.05, 1, 4]} />
            <meshStandardMaterial color="#efebeb" />
          </mesh>
        </group>
      </group>
    </>
  );
}
