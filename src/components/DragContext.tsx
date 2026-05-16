import { createContext, useContext } from "react";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { RefObject } from "react";

export const DragContext =
  createContext<RefObject<OrbitControlsImpl | null> | null>(null);

export function useDragContext() {
  const ctx = useContext(DragContext);
  if (!ctx)
    throw new Error("useDragContext must be used within a PhysicsScene");
  return ctx;
}
