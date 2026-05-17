import { useRef } from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CapsuleCollider,
  RigidBody,
  useRapier,
  type RapierRigidBody,
} from "@react-three/rapier";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Vector3 } from "three";
import type { Group } from "three";
import { useKeyboardControls } from "@react-three/drei";
import Character from "./Character";

interface CharacterControllerProps {
  orbitRef: RefObject<OrbitControlsImpl | null>;
}

const SPEED = 10.0;
const JUMP_FORCE = 12.0;
const ROTATION_SPEED = 8.0;
const ACCEL_FACTOR = 12.0;
const DECEL_FACTOR = 8.0;

export default function CharacterController({
  orbitRef,
}: CharacterControllerProps) {
  const { world, rapier } = useRapier();
  const rbRef = useRef<RapierRigidBody>(null);
  const visualRef = useRef<Group>(null);
  const [, getKeys] = useKeyboardControls();

  const isGrounded = useRef(false);
  const jumpPrev = useRef(false);

  useFrame(({ camera }, delta) => {
    if (!rbRef.current) return;

    const { forward, backward, left, right, jump } = getKeys();
    const currentVelocity = rbRef.current.linvel();
    const playerPos = rbRef.current.translation();

    // Grounded detection via short downward raycast
    const ray = new rapier.Ray(playerPos, { x: 0, y: -1, z: 0 });
    const hit = world.castRay(
      ray,
      0.85,
      true,
      undefined,
      undefined,
      undefined,
      rbRef.current,
    );
    isGrounded.current = hit !== null;

    // Camera-relative movement vectors flattened to the horizontal plane
    const camForward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const camRight = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    camForward.y = 0;
    camRight.y = 0;
    camForward.normalize();
    camRight.normalize();

    const moveDirection = new Vector3();
    if (forward) moveDirection.add(camForward);
    if (backward) moveDirection.sub(camForward);
    if (left) moveDirection.sub(camRight);
    if (right) moveDirection.add(camRight);
    const hasInput = moveDirection.lengthSq() > 0;
    if (hasInput) moveDirection.normalize();

    // Momentum-based velocity: lerp toward target instead of snapping
    const targetX = moveDirection.x * SPEED;
    const targetZ = moveDirection.z * SPEED;
    const lerpRate = hasInput ? ACCEL_FACTOR : DECEL_FACTOR;
    const t = Math.min(lerpRate * delta, 1);
    const newVx = currentVelocity.x + (targetX - currentVelocity.x) * t;
    const newVz = currentVelocity.z + (targetZ - currentVelocity.z) * t;

    // Jump (edge-detect so holding space doesn't re-trigger)
    const justPressed = jump && !jumpPrev.current;
    jumpPrev.current = jump;
    const newVy =
      justPressed && isGrounded.current ? JUMP_FORCE : currentVelocity.y;

    rbRef.current.setLinvel({ x: newVx, y: newVy, z: newVz }, true);

    // Drive visual position directly from physics translation so it matches
    // the camera target in the same frame — Rapier's own mesh sync happens at
    // a different point in the loop and would otherwise lag by one frame.
    if (visualRef.current) {
      visualRef.current.position.set(playerPos.x, playerPos.y, playerPos.z);
    }

    // Rotate visual toward movement direction
    if (hasInput && visualRef.current) {
      const targetAngle = Math.atan2(moveDirection.x, moveDirection.z);
      let diff = targetAngle - visualRef.current.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      visualRef.current.rotation.y +=
        diff * Math.min(ROTATION_SPEED * delta, 1);
    }

    // Follow the player: translate both target and camera by the same delta
    // so the view angle and distance are preserved each frame.
    if (orbitRef.current) {
      const dx = playerPos.x - orbitRef.current.target.x;
      const dy = playerPos.y - orbitRef.current.target.y;
      const dz = playerPos.z - orbitRef.current.target.z;
      camera.position.x += dx;
      camera.position.y += dy;
      camera.position.z += dz;
      orbitRef.current.target.set(playerPos.x, playerPos.y, playerPos.z);
      orbitRef.current.update();
    }
  });

  return (
    <>
      <RigidBody
        ref={rbRef}
        type="dynamic"
        colliders={false}
        ccd={true}
        lockRotations
        position={[0, 2, 0]}
      >
        <CapsuleCollider args={[0.4, 0.35]} />
      </RigidBody>
      <Character ref={visualRef} />
    </>
  );
}
