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
import { Vector3 } from "three";
import type { Mesh } from "three";

interface CharacterProps {
  orbitRef: RefObject<OrbitControlsImpl | null>;
}

const SPEED = 6;
const JUMP_FORCE = 8;
const GRAVITY = -20;

export default function Character({ orbitRef }: CharacterProps) {
  const { world } = useRapier();
  type KCC = ReturnType<typeof world.createCharacterController>;

  const rbRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<Mesh>(null);
  const controllerRef = useRef<KCC | null>(null);
  const yVelRef = useRef(0);
  const keys = useRef({ w: false, a: false, s: false, d: false, space: false });

  // Setup character controller
  useEffect(() => {
    const ctrl = world.createCharacterController(0.01);
    ctrl.setMaxSlopeClimbAngle((45 * Math.PI) / 180);
    ctrl.setMinSlopeSlideAngle((30 * Math.PI) / 180);
    ctrl.enableAutostep(0.5, 0.2, true);
    ctrl.enableSnapToGround(0.5);
    ctrl.setSlideEnabled(true);
    controllerRef.current = ctrl;
    return () => {
      world.removeCharacterController(ctrl);
    };
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
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === "KeyW") keys.current.w = false;
      if (e.code === "KeyA") keys.current.a = false;
      if (e.code === "KeyS") keys.current.s = false;
      if (e.code === "KeyD") keys.current.d = false;
      if (e.code === "Space") keys.current.space = false;
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  useFrame(({ camera }, delta) => {
    if (!rbRef.current || !controllerRef.current) return;

    // 1. Camera-relative movement directions
    const camDir = new Vector3();
    camera.getWorldDirection(camDir);
    camDir.y = 0;
    camDir.normalize();
    const camRight = new Vector3()
      .crossVectors(camDir, new Vector3(0, 1, 0))
      .normalize();

    // 2. Build WASD movement
    const moveDir = new Vector3();
    if (keys.current.w) moveDir.addScaledVector(camDir, SPEED * delta);
    if (keys.current.s) moveDir.addScaledVector(camDir, -SPEED * delta);
    if (keys.current.a) moveDir.addScaledVector(camRight, -SPEED * delta);
    if (keys.current.d) moveDir.addScaledVector(camRight, SPEED * delta);

    // 3. Jumping + gravity
    const grounded = controllerRef.current.computedGrounded();
    if (keys.current.space && grounded) {
      yVelRef.current = JUMP_FORCE;
      keys.current.space = false; // consume so jump doesn't retrigger
    }
    if (!grounded) {
      yVelRef.current += GRAVITY * delta; // apply gravity over time
    } else {
      yVelRef.current = Math.max(yVelRef.current, -1);
    }

    moveDir.y = yVelRef.current * delta;

    // 4. Compute + apply collision-resolved movement
    const collider = rbRef.current.collider(0);
    controllerRef.current.computeColliderMovement(collider, moveDir);
    const corrected = controllerRef.current.computedMovement();
    const pos = rbRef.current.translation();
    const newPos = {
      x: pos.x + corrected.x,
      y: pos.y + corrected.y,
      z: pos.z + corrected.z,
    };
    rbRef.current.setNextKinematicTranslation(newPos);

    // 5. Rotate character to face movement direction
    const horizontal = new Vector3(moveDir.x, 0, moveDir.z);
    if (horizontal.length() > 0.001 && meshRef.current) {
      const angle = Math.atan2(horizontal.x, horizontal.z);
      let delta = angle - meshRef.current.rotation.y;
      // Normalize to [-π, π] so we always take the shortest arc
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      meshRef.current.rotation.y += delta * 0.1;
    }

    // 6. Update OrbitControls target to follow character
    // Use newPos (predicted position after physics step) so the camera
    // target matches where the mesh will actually render this frame.
    // Calling update() immediately ensures ordering doesn't matter.
    if (orbitRef.current) {
      orbitRef.current.target.set(newPos.x, newPos.y + 1, newPos.z);
      orbitRef.current.update();
    }
  });
  return (
    <RigidBody
      ref={rbRef}
      type="kinematicPosition"
      colliders={false}
      position={[0, 2, 0]}
    >
      <CapsuleCollider args={[0.4, 0.35]} /> {/* half-height, radius */}
      <group ref={meshRef}>
        <mesh castShadow position={[0, 0, 0]}>
          <capsuleGeometry args={[0.35, 0.8, 4, 8]} />
          <meshStandardMaterial color="#60cfa8" roughness={0.8} />
        </mesh>
        {/* "face" indicator so rotation is visible */}
        <mesh position={[0, 0.3, 0.35]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
      </group>
    </RigidBody>
  );
}
