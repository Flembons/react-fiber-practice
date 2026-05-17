# React Three Fiber Practice

A collection of interactive 3D scenes built with React Three Fiber, exploring physics, animation, and character movement. Each scene is accessible from the top navigation bar.

## Scenes

### Rotating Cube
A simple animated cube that rotates continuously. The entry point for the project — demonstrates basic R3F setup, mesh rendering, and `useFrame` animation.

### Solar System
An animated solar system with a central sun, orbiting planets, and a starfield background. Demonstrates hierarchical object transforms and `useFrame`-driven orbital mechanics.

### Wave Grid
A procedurally animated mesh where each vertex oscillates using a sine wave. Includes a live controls panel with sliders for **amplitude**, **frequency**, and **speed**. Demonstrates custom geometry mutation inside `useFrame`.

### Physics
A Rapier-powered physics sandbox with a draggable sphere and a field of falling spheres. The draggable sphere can be picked up and thrown with the mouse. Includes a **Reload** button in the header to reset the simulation.

### Third Person
A momentum-based third-person character controller. Features:
- **WASD / Arrow keys** — move the character
- **Space** — jump
- **Mouse drag** — orbit the camera
- Velocity lerping for smooth acceleration and deceleration
- Surface normal alignment — the character tilts to match slopes

## Stack

| Package | Purpose |
|---|---|
| `@react-three/fiber` | React renderer for Three.js |
| `@react-three/drei` | Helpers: `OrbitControls`, `KeyboardControls`, `Sky`, etc. |
| `@react-three/rapier` | Rapier physics engine bindings |
| `three` | Core 3D library |
| `tailwindcss` | UI styling |
| `vite` + `typescript` | Build tooling |

## Running Locally

```bash
npm install
npm run dev
```