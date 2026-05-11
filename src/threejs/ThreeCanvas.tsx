import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function ThreeCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#ae3d30");

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      90,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 0, 2);

    // 3. Renderer — append to mountRef div
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // 4. Lights (AmbientLight + DirectionalLight)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 0, 5);
    scene.add(directionalLight);

    // 5. Mesh (BoxGeometry + MeshPhongMaterial)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({
      color: "#60cfa8",
      shininess: 100,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // 6. OrbitControls with damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 7. Resize handler
    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // 8. Animation loop with THREE.Clock + getDelta()
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      cube.rotation.x += delta * 0.5;
      cube.rotation.y += delta * 0.5;
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      /* Cleanup */
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      mount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);
  return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
}
