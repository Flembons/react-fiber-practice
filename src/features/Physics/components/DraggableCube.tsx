import Draggable from "../../../components/Draggable";

export default function DraggableCube() {
  return (
    <Draggable position={[0, 2, 0]} colliders="ball" restitution={0.6}>
      <mesh castShadow>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color="#60cfa8" roughness={0.3} metalness={0.4} />
      </mesh>
    </Draggable>
  );
}
