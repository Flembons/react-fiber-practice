import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Mesh, MeshStandardMaterial } from "three";
import type { JumpCharacterHandle } from "./JumpCharacter";

const GREEN = new Color("#22c55e");
const YELLOW = new Color("#facc15");
const RED = new Color("#ef4444");
const tmp = new Color();

interface ChargeIndicatorProps {
  characterRef: React.RefObject<JumpCharacterHandle | null>;
  chargeRef: React.RefObject<number>;
  isChargingRef: React.RefObject<boolean>;
}

export default function ChargeIndicator({
  characterRef,
  chargeRef,
  isChargingRef,
}: ChargeIndicatorProps) {
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;

    const active = isChargingRef.current;
    mesh.visible = active;
    if (!active) return;

    const pos = characterRef.current?.getTranslation() ?? { x: 0, y: 1.25, z: 0 };
    mesh.position.set(pos.x, pos.y + 1.8, pos.z);

    const charge = chargeRef.current;
    const scale = 0.3 + charge * 1.2;
    mesh.scale.set(scale, 1, scale);

    if (charge < 0.5) {
      tmp.lerpColors(GREEN, YELLOW, charge * 2);
    } else {
      tmp.lerpColors(YELLOW, RED, (charge - 0.5) * 2);
    }
    mat.color.copy(tmp);
    mat.emissive.copy(tmp).multiplyScalar(0.3);
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <torusGeometry args={[0.5, 0.07, 8, 32]} />
      <meshStandardMaterial ref={matRef} color="#22c55e" />
    </mesh>
  );
}
