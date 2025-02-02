import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Box, Crosshair, Eye, EyeOff, Settings2, Move, Boxes } from 'lucide-react';
import * as THREE from 'three';
import _ from 'lodash';

// Physics debug renderer setup
let renderer, scene, camera, grid;
let debugObjects = [];
const GRID_SIZE = 20;
const GRID_DIVISIONS = 20;

const initializeDebugRenderer = (canvas, width, height) => {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Camera
  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.set(5, 5, 10);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Grid
  grid = new THREE.GridHelper(GRID_SIZE, GRID_DIVISIONS, 0x0066FF, 0x001133);
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add(grid);

  // Ambient light for better visibility
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Directional light for shadows
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  return { scene, camera, renderer };
};

// Debug visualization components
const createDebugBox = (width = 1, height = 1, depth = 1, color = 0x0066FF) => {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const edges = new THREE.EdgesGeometry(geometry);
  const material = new THREE.LineBasicMaterial({ color });
  return new THREE.LineSegments(edges, material);
};

const createDebugSphere = (radius = 0.5, color = 0x0066FF) => {
  const geometry = new THREE.SphereGeometry(radius, 16, 16);
  const edges = new THREE.EdgesGeometry(geometry);
  const material = new THREE.LineBasicMaterial({ color });
  return new THREE.LineSegments(edges, material);
};

const createForceArrow = (direction, length = 1, color = 0xFF0000) => {
  const arrow = new THREE.ArrowHelper(
    direction.normalize(),
    new THREE.Vector3(),
    length,
    color,
    length * 0.2,
    length * 0.1
  );
  return arrow;
};

// Main debug viewport component
const DebugViewport = ({ debugState, showColliders, showForces }) => {
  const canvasRef = useRef();
  const rendererRef = useRef({});
  const animationRef = useRef();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const { width, height } = canvas.parentElement.getBoundingClientRect();
    
    const { scene, camera, renderer } = initializeDebugRenderer(canvas, width, height);
    rendererRef.current = { scene, camera, renderer };

    // Example debug objects
    const box = createDebugBox();
    box.position.set(0, 0.5, 0);
    scene.add(box);
    debugObjects.push(box);

    const sphere = createDebugSphere();
    sphere.position.set(2, 0.5, 0);
    scene.add(sphere);
    debugObjects.push(sphere);

    // Force visualization
    const force = createForceArrow(new THREE.Vector3(0, 1, 0));
    force.position.copy(sphere.position);
    scene.add(force);
    debugObjects.push(force);

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const { width, height } = canvas.parentElement.getBoundingClientRect();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      debugObjects.forEach(obj => {
        obj.geometry?.dispose();
        obj.material?.dispose();
      });
    };
  }, []);

  // Update visibility based on props
  useEffect(() => {
    debugObjects.forEach(obj => {
      if (obj instanceof THREE.LineSegments) {
        obj.visible = showColliders;
      } else if (obj instanceof THREE.ArrowHelper) {
        obj.visible = showForces;
      }
    });
  }, [showColliders, showForces]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full bg-black"
    />
  );
};

// Physics object type definitions
const PHYSICS_TYPES = {
  DYNAMIC: 'Dynamic',
  STATIC: 'Static',
  KINEMATIC: 'Kinematic'
};

// Main component
const PhysicsDebugger = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showColliders, setShowColliders] = useState(true);
  const [showForces, setShowForces] = useState(true);
  const [selectedObject, setSelectedObject] = useState(null);
  const [debugState, setDebugState] = useState({
    objects: [
      { id: 1, name: 'Player', type: PHYSICS_TYPES.DYNAMIC },
      { id: 2, name: 'Ground', type: PHYSICS_TYPES.STATIC },
      { id: 3, name: 'Trigger', type: PHYSICS_TYPES.KINEMATIC }
    ]
  });

  return (
    <div className="flex h-full bg-black text-white">
      {/* Left Panel - Objects */}
      <div className="w-64 border-r border-neutral-700">
        <div className="p-2 border-b border-neutral-700 flex items-center justify-between">
          <h2 className="text-sm font-medium text-blue-400">Physics Objects</h2>
          <button className="p-1 hover:bg-blue-950 rounded text-blue-400">
            <Settings2 size={16} />
          </button>
        </div>
        <div className="p-2">
          <div className="space-y-1">
            {debugState.objects.map(obj => (
              <div
                key={obj.id}
                className={`flex items-center p-2 rounded cursor-pointer ${
                  selectedObject?.id === obj.id ? 'bg-blue-900' : 'hover:bg-blue-950'
                }`}
                onClick={() => setSelectedObject(obj)}
              >
                <Box size={14} className="mr-2 text-blue-400" />
                <span className="text-sm">{obj.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-10 border-b border-neutral-700 flex items-center px-4 justify-between bg-black">
          <div className="flex items-center space-x-2">
            <button 
              className="p-1 hover:bg-blue-950 rounded text-blue-400"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button className="p-1 hover:bg-blue-950 rounded text-blue-400">
              <RotateCcw size={16} />
            </button>
            <div className="h-4 w-px bg-blue-950 mx-2" />
            <button 
              className={`px-2 py-1 rounded text-sm flex items-center space-x-1 ${
                showColliders ? 'bg-blue-600' : 'hover:bg-blue-950'
              }`}
              onClick={() => setShowColliders(!showColliders)}
            >
              {showColliders ? <Eye size={14} /> : <EyeOff size={14} />}
              <span>Colliders</span>
            </button>
            <button 
              className={`px-2 py-1 rounded text-sm flex items-center space-x-1 ${
                showForces ? 'bg-blue-600' : 'hover:bg-blue-950'
              }`}
              onClick={() => setShowForces(!showForces)}
            >
              <Crosshair size={14} />
              <span>Forces</span>
            </button>
          </div>
        </div>

        {/* Debug Viewport */}
        <div className="flex-1 relative">
          <DebugViewport 
            debugState={debugState}
            showColliders={showColliders}
            showForces={showForces}
          />
        </div>
      </div>

      {/* Right Panel - Properties */}
      <div className="w-80 border-l border-neutral-700">
        <div className="h-8 border-b border-neutral-700 px-4 flex items-center">
          <span className="text-sm text-blue-400">Physics Properties</span>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-blue-400 mb-1">Body Type</label>
              <select className="w-full bg-black border border-blue-900 rounded px-2 py-1 text-sm text-blue-100">
                {Object.values(PHYSICS_TYPES).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-blue-400 mb-1">Mass</label>
              <input 
                type="number" 
                defaultValue="1.0" 
                className="bg-black border border-blue-900 rounded px-2 py-1 text-sm w-24 text-blue-100" 
              />
            </div>
            <div>
              <label className="block text-sm text-blue-400 mb-1">Linear Drag</label>
              <input 
                type="range" 
                className="w-full accent-blue-600" 
              />
            </div>
            <div>
              <label className="block text-sm text-blue-400 mb-1">Angular Drag</label>
              <input 
                type="range" 
                className="w-full accent-blue-600" 
              />
            </div>

            <div className="pt-4 border-t border-neutral-700">
              <label className="block text-sm font-medium text-blue-400 mb-2">Collision</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2 accent-blue-600" />
                  <span className="text-sm text-blue-300">Use Gravity</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2 accent-blue-600" />
                  <span className="text-sm text-blue-300">Is Trigger</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2 accent-blue-600" />
                  <span className="text-sm text-blue-300">Continuous Detection</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-700">
              <label className="block text-sm font-medium text-blue-400 mb-2">Layer Matrix</label>
              <div className="grid grid-cols-4 gap-1">
                {[...Array(16)].map((_, i) => (
                  <label key={i} className="flex items-center">
                    <input type="checkbox" className="mr-1 accent-blue-600" />
                    <span className="text-xs text-blue-300">{i}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicsDebugger;