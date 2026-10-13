import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCcw, Eye, Play, Pause, Maximize2 } from 'lucide-react';

interface CadViewer3DProps {
  vertices: number[][]; // Array of [x, y, z]
  faces: number[][];    // Array of [i, j, k]
  height?: number | string;
  componentName?: string;
}

export const CadViewer3D: React.FC<CadViewer3DProps> = ({
  vertices,
  faces,
  height = 360,
  componentName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [wireframe, setWireframe] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const autoRotateRef = useRef<boolean>(true);
  autoRotateRef.current = autoRotate;

  useEffect(() => {
    if (!containerRef.current || !vertices || vertices.length === 0 || !faces || faces.length === 0) {
      return;
    }

    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const h = typeof height === 'number' ? height : (container.clientHeight || 360);

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // slate-50
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 5000);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.8;
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(150, 250, 200);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x90b0c8, 0.6);
    dirLight2.position.set(-150, -100, -150);
    scene.add(dirLight2);

    // 6. Geometry construction
    const geometry = new THREE.BufferGeometry();
    const flatVerts = new Float32Array(vertices.flat());
    const flatFaces = new Uint32Array(faces.flat());

    geometry.setAttribute('position', new THREE.BufferAttribute(flatVerts, 3));
    geometry.setIndex(new THREE.BufferAttribute(flatFaces, 1));
    geometry.computeVertexNormals();
    geometry.center(); // Center at origin (0, 0, 0)
    geometry.computeBoundingSphere();

    // 7. Material (Aluminium High-Pressure Die-Casting look)
    const material = new THREE.MeshStandardMaterial({
      color: 0x5a7d92,
      metalness: 0.45,
      roughness: 0.35,
      wireframe: false,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // 8. Grid Helper underneath
    const radius = geometry.boundingSphere ? geometry.boundingSphere.radius : 100;
    const grid = new THREE.GridHelper(radius * 3.5, 20, 0x94a3b8, 0xe2e8f0);
    grid.position.y = -radius * 1.05;
    scene.add(grid);

    // 9. Camera positioning
    const dist = radius * 2.6;
    camera.position.set(dist * 0.9, dist * 0.7, dist * 1.1);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();

    // 10. Animation loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (autoRotateRef.current && meshRef.current) {
        meshRef.current.rotation.y += 0.005;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 11. Resize handling
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = typeof height === 'number' ? height : (container.clientHeight || 360);
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      controls.dispose();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      container.innerHTML = '';
    };
  }, [vertices, faces, height]);

  // Update wireframe property
  useEffect(() => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshStandardMaterial).wireframe = wireframe;
    }
  }, [wireframe]);

  const handleResetCamera = () => {
    if (!meshRef.current || !cameraRef.current || !controlsRef.current) return;
    const geom = meshRef.current.geometry;
    geom.computeBoundingSphere();
    const radius = geom.boundingSphere ? geom.boundingSphere.radius : 100;
    const dist = radius * 2.6;
    cameraRef.current.position.set(dist * 0.9, dist * 0.7, dist * 1.1);
    cameraRef.current.lookAt(0, 0, 0);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
    if (meshRef.current) {
      meshRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <div className="relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-inner group">
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: typeof height === 'number' ? `${height}px` : height }}
        className="cursor-grab active:cursor-grabbing"
      />

      {/* Floating Header Info */}
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-slate-200/80 px-3 py-1.5 rounded-lg text-xs shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-semibold text-slate-800">
          {componentName || 'Component CAD Geometry'}
        </span>
        <span className="text-slate-400 font-mono text-[10px]">
          ({faces.length.toLocaleString()} triangles)
        </span>
      </div>

      {/* Interactive Toolbar */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-slate-200/80 p-1 rounded-lg text-xs shadow-sm">
        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-1.5 rounded transition-colors ${autoRotate ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
          title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
        >
          {autoRotate ? <Pause size={14} /> : <Play size={14} />}
        </button>

        <button
          type="button"
          onClick={() => setWireframe(!wireframe)}
          className={`p-1.5 rounded transition-colors ${wireframe ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
          title="Toggle Wireframe Mode"
        >
          <Eye size={14} />
        </button>

        <button
          type="button"
          onClick={handleResetCamera}
          className="p-1.5 rounded text-slate-600 hover:bg-slate-100 transition-colors"
          title="Reset Camera View"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-2 left-3 text-[11px] text-slate-400 select-none pointer-events-none">
        Left-click drag to rotate • Right-click drag to pan • Scroll to zoom
      </div>
    </div>
  );
};

export default CadViewer3D;
