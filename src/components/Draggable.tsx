import { useDragContext } from "./DragContext";
import { useRef, useEffect, type ReactNode } from "react";
import { type RapierRigidBody, RigidBody } from "@react-three/rapier";
import { Vector3, Plane } from "three";
import { useThree, useFrame, type ThreeEvent } from "@react-three/fiber";

const DRAG_STIFFNESS = 15; // velocity multiplier while dragging
const DRAG_DAMPING = 20; // high damping while held (prevents drift)
const REST_DAMPING = 0.1; // normal damping after release
const THROW_SCALE = 1.0; // multiply computed throw velocity
const HISTORY_SIZE = 6;

interface DraggableProps {
  children: ReactNode;
  position?: [number, number, number];
  colliders?: "ball" | "cuboid" | "hull" | "trimesh";
  restitution?: number;
  friction?: number;
}

export default function Draggable({
  children,
  position,
  colliders = "cuboid",
  restitution = 0.5,
  friction = 0.4,
}: DraggableProps) {
  const orbitRef = useDragContext();

  const rbRef = useRef<RapierRigidBody>(null);
  const isDragging = useRef(false);
  const dragPlane = useRef(new Plane());
  const targetPoint = useRef(new Vector3());
  const velocityHistory = useRef<{ pos: Vector3; time: number }[]>([]);

  const { camera, raycaster } = useThree();

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    if (!rbRef.current) return;

    isDragging.current = true;
    velocityHistory.current = [];

    rbRef.current.setGravityScale(0, true);
    rbRef.current.setLinearDamping(DRAG_DAMPING);
    rbRef.current.setAngularDamping(DRAG_DAMPING);
    rbRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);

    const pos = rbRef.current.translation();
    const cubeWorld = new Vector3(pos.x, pos.y, pos.z);
    const camDir = new Vector3();
    camera.getWorldDirection(camDir);
    dragPlane.current.setFromNormalAndCoplanarPoint(camDir, cubeWorld);

    if (orbitRef.current) orbitRef.current.enabled = false;
    document.body.style.cursor = "grabbing";
  };

  useFrame(({ mouse }) => {
    if (!isDragging.current || !rbRef.current) return;

    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.ray.intersectPlane(
      dragPlane.current,
      targetPoint.current,
    );
    if (!hit) return;

    const pos = rbRef.current.translation();
    rbRef.current.setLinvel(
      {
        x: (targetPoint.current.x - pos.x) * DRAG_STIFFNESS,
        y: (targetPoint.current.y - pos.y) * DRAG_STIFFNESS,
        z: (targetPoint.current.z - pos.z) * DRAG_STIFFNESS,
      },
      true,
    );

    velocityHistory.current.push({
      pos: new Vector3(pos.x, pos.y, pos.z),
      time: performance.now(),
    });
    if (velocityHistory.current.length > HISTORY_SIZE) {
      velocityHistory.current.shift();
    }
  });

  useEffect(() => {
    const handlePointerUp = () => {
      if (!isDragging.current || !rbRef.current) return;

      isDragging.current = false;

      const history = velocityHistory.current;
      let throwVel = { x: 0, y: 0, z: 0 };

      if (history.length >= 2) {
        const newest = history[history.length - 1];
        const oldest = history[0];
        const deltaTime = (newest.time - oldest.time) / 1000;
        if (deltaTime > 0.001) {
          throwVel = {
            x: ((newest.pos.x - oldest.pos.x) / deltaTime) * THROW_SCALE,
            y: ((newest.pos.y - oldest.pos.y) / deltaTime) * THROW_SCALE,
            z: ((newest.pos.z - oldest.pos.z) / deltaTime) * THROW_SCALE,
          };
        }
      }

      if (rbRef.current) {
        rbRef.current.setGravityScale(1, true);
        rbRef.current.setLinearDamping(REST_DAMPING);
        rbRef.current.setAngularDamping(REST_DAMPING);
        rbRef.current.setLinvel(throwVel, true);
      }

      if (orbitRef.current) orbitRef.current.enabled = true;
      velocityHistory.current = [];
      document.body.style.cursor = "default";
    };

    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [orbitRef]);

  return (
    <RigidBody
      ref={rbRef}
      ccd={true}
      colliders={colliders}
      position={position}
      restitution={restitution}
      friction={friction}
      linearDamping={REST_DAMPING}
      angularDamping={REST_DAMPING}
    >
      <group
        onPointerDown={handlePointerDown}
        onPointerOver={() => {
          if (!isDragging.current) document.body.style.cursor = "grab";
        }}
        onPointerOut={() => {
          if (!isDragging.current) document.body.style.cursor = "default";
        }}
      >
        {children}
      </group>
    </RigidBody>
  );
}
