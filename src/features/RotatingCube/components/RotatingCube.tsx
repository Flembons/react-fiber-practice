import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Color, MeshPhongMaterial } from "three";

const ARROW_KEY_COLORS: Record<string, Color> = {
  ArrowLeft: new Color("red"),
  ArrowRight: new Color("green"),
  ArrowUp: new Color("blue"),
  ArrowDown: new Color("yellow"),
};

export default function RotatingCube() {
  const meshRef = useRef<Mesh>(null);
  const pressedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key in ARROW_KEY_COLORS) {
        e.preventDefault();
        pressedKeyRef.current = e.key;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === pressedKeyRef.current) {
        pressedKeyRef.current = null;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.3;
    meshRef.current.rotation.y += delta * 0.53;
    const key = pressedKeyRef.current;
    if (key) {
      (meshRef.current.material as MeshPhongMaterial).color.lerp(
        ARROW_KEY_COLORS[key],
        delta * 2,
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhongMaterial color="#60cfa8" shininess={100} />
    </mesh>
  );
}
