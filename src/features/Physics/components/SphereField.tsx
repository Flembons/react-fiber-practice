import { useState } from "react";
import {
  InstancedRigidBodies,
  type InstancedRigidBodyProps,
} from "@react-three/rapier";

const COUNT = 2000;
const RADIUS = 0.5;

function generateInstances(): InstancedRigidBodyProps[] {
  return Array.from({ length: COUNT }, (_, i) => ({
    key: i,
    position: [(Math.random() - 0.5) * 38, 20, (Math.random() - 0.5) * 38] as [
      number,
      number,
      number,
    ],
  }));
}

export default function SphereField() {
  const [instances] = useState<InstancedRigidBodyProps[]>(generateInstances);

  return (
    <InstancedRigidBodies
      instances={instances}
      colliders="ball"
      restitution={1}
      ccd={true}
    >
      <instancedMesh args={[undefined, undefined, COUNT]} castShadow>
        <sphereGeometry args={[RADIUS, 16, 16]} />
        <meshStandardMaterial color="#a78bfa" roughness={0.4} metalness={0.3} />
      </instancedMesh>
    </InstancedRigidBodies>
  );
}
