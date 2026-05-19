import { forwardRef, useImperativeHandle, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CapsuleCollider,
  CoefficientCombineRule,
  RigidBody,
} from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import type { Group } from "three";

export interface JumpCharacterHandle {
  jump(velocity: { x: number; y: number; z: number }): void;
  reset(position: { x: number; y: number; z: number }): void;
  getTranslation(): { x: number; y: number; z: number };
}

interface JumpCharacterProps {
  chargeRef?: React.RefObject<number>;
  isChargingRef?: React.RefObject<boolean>;
  isAirborneRef?: React.RefObject<boolean>;
}

const SPAWN = { x: 0, y: 1.25, z: 0 };

const SPRING_K = 300;
const SPRING_D = 25;

// Angular velocity for the forward flip (rad/s).
// Negative world-X = rotation where +Y tilts toward -Z (toward Box 2).
const FLIP_ANGULAR_VEL = Math.PI * 2.2;

// Quaternion for Euler(0, -π, 0): faces the character toward -Z (Box 2 direction)
const INITIAL_ROTATION = { x: 0, y: -1, z: 0, w: 0 } as const;

const JumpCharacter = forwardRef<JumpCharacterHandle, JumpCharacterProps>(
  ({ chargeRef, isChargingRef, isAirborneRef }, ref) => {
    const rbRef = useRef<RapierRigidBody>(null);
    const visualRef = useRef<Group>(null);
    const springVelRef = useRef(0);
    const prevAirborneRef = useRef(false);

    useImperativeHandle(ref, () => ({
      jump(velocity) {
        rbRef.current?.setLinvel(velocity, true);
      },
      reset(position) {
        const rb = rbRef.current;
        if (!rb) return;
        rb.setTranslation(position, true);
        rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
        rb.setRotation(INITIAL_ROTATION, true);
        rb.setEnabledRotations(false, false, false, true);
        if (visualRef.current) {
          visualRef.current.scale.set(1, 1, 1);
          visualRef.current.position.set(0, 0, 0);
        }
      },
      getTranslation() {
        return rbRef.current?.translation() ?? SPAWN;
      },
    }));

    useFrame((_, delta) => {
      const group = visualRef.current;
      if (!group) return;

      const isCharging = isChargingRef?.current ?? false;
      const isAirborne = isAirborneRef?.current ?? false;

      const justBecameAirborne = isAirborne && !prevAirborneRef.current;
      const justLanded = !isAirborne && !isCharging && prevAirborneRef.current;
      prevAirborneRef.current = isAirborne;

      if (justBecameAirborne) {
        springVelRef.current = (1 - group.scale.y) * 5;
        // Unlock X and Z so collisions can spin the body; keep Y locked (no top-spin)
        rbRef.current?.setEnabledRotations(true, false, true, true);
        // Kick in a forward flip toward Box 2 (-Z world direction)
        rbRef.current?.setAngvel({ x: -FLIP_ANGULAR_VEL, y: 0, z: 0 }, true);
      }

      if (justLanded) {
        springVelRef.current = 0;
        const rb = rbRef.current;
        rb?.setEnabledRotations(false, false, false, true);
        rb?.setAngvel({ x: 0, y: 0, z: 0 }, true);
        // Snap physics rotation back to upright-and-facing
        rb?.setRotation(INITIAL_ROTATION, true);
      }

      if (isCharging) {
        const charge = chargeRef?.current ?? 0;
        const squish = Math.pow(charge, 0.75);
        const sy = Math.max(0.3, 1 - squish * 0.4);
        const sxz = 1 / Math.sqrt(sy);
        group.scale.set(sxz, sy, sxz);
        springVelRef.current = 0;
        // Pin visual bottom to the ground while squishing
        group.position.y = 0.75 * (sy - 1);
      } else if (isAirborne) {
        // Damped spring pops scale back to 1 with slight overshoot
        const force =
          SPRING_K * (1 - group.scale.y) - SPRING_D * springVelRef.current;
        springVelRef.current += force * delta;
        group.scale.y = Math.max(0.1, group.scale.y + springVelRef.current * delta);
        const sxz = 1 / Math.sqrt(group.scale.y);
        group.scale.x = sxz;
        group.scale.z = sxz;
        // Physics body is now tumbling — ease the grounding offset back to zero
        group.position.y += (0 - group.position.y) * Math.min(delta * 20, 0.9);
      } else {
        const t = Math.min(delta * 10, 0.9);
        group.scale.x += (1 - group.scale.x) * t;
        group.scale.y += (1 - group.scale.y) * t;
        group.scale.z += (1 - group.scale.z) * t;
        group.position.y = 0;
      }
    });

    return (
      <RigidBody
        ref={rbRef}
        type="dynamic"
        colliders={false}
        position={[SPAWN.x, SPAWN.y, SPAWN.z]}
        lockRotations
        ccd={true}
        friction={1}
        frictionCombineRule={CoefficientCombineRule.Min}
        rotation={[0, -Math.PI, 0]}
      >
        <CapsuleCollider args={[0.4, 0.35]} />
        <group ref={visualRef}>
          <mesh castShadow>
            <capsuleGeometry args={[0.35, 0.8, 8, 16]} />
            <meshStandardMaterial color="#60cfa8" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.3, 0.35]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ff6b6b" />
          </mesh>
          <mesh position={[-0.1, 0.5, 0.32]}>
            <sphereGeometry args={[0.05, 4, 4]} />
            <meshStandardMaterial color="#efebeb" />
          </mesh>
          <mesh position={[0.1, 0.5, 0.32]}>
            <sphereGeometry args={[0.05, 4, 4]} />
            <meshStandardMaterial color="#efebeb" />
          </mesh>
        </group>
      </RigidBody>
    );
  },
);

JumpCharacter.displayName = "JumpCharacter";
export default JumpCharacter;
