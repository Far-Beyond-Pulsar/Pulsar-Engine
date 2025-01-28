import React, { useState, useEffect, useRef } from 'react';
import { Grid, Layers, Eye, EyeOff, Palette, Plus, X, Move, Circle, Maximize2 } from 'lucide-react';
import _ from 'lodash';
import * as THREE from 'three';

// Material node system
const NODE_TYPES = {
  COLOR: 'COLOR',
  ROUGHNESS: 'ROUGHNESS',
  METALNESS: 'METALNESS',
  OUTPUT: 'OUTPUT'
};

// Canvas setup for persistent render loop
let renderer, scene, camera, sphere, material;
const initThreeJS = (canvas, width, height) => {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 4;

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = THREE.sRGBEncoding;

  // Lights
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
  scene.add(hemiLight);

  const frontLight = new THREE.DirectionalLight(0xffffff, 0.7);
  frontLight.position.set(2, 2, 2);
  scene.add(frontLight);

  const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
  backLight.position.set(-2, -2, -2);
  scene.add(backLight);

  // Default material
  material = new THREE.MeshStandardMaterial({
    color: 0x4080ff,
    roughness: 0.5,
    metalness: 0.5,
  });

  // Sphere geometry
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // Environment map for realistic PBR
  new THREE.TextureLoader().load('/api/placeholder/512/512', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  });

  // Animation loop
  const animate = () => {
    requestAnimationFrame(animate);
    sphere.rotation.y += 0.005;
    renderer.render(scene, camera);
  };
  animate();

  return { material };
};

// Preview component
const MaterialPreview = ({ materialProps }) => {
  const canvasRef = useRef();
  const rendererRef = useRef();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const { width, height } = canvas.parentElement.getBoundingClientRect();
    
    const { material } = initThreeJS(canvas, width, height);
    rendererRef.current = { material };

    const handleResize = () => {
      const { width, height } = canvas.parentElement.getBoundingClientRect();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update material when props change
  useEffect(() => {
    if (rendererRef.current?.material) {
      const { color, roughness, metalness } = materialProps;
      rendererRef.current.material.color.setStyle(color);
      rendererRef.current.material.roughness = roughness;
      rendererRef.current.material.metalness = metalness;
      rendererRef.current.material.needsUpdate = true;
    }
  }, [materialProps]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
    />
  );
};

// Main editor component
const MaterialEditor = () => {
  const [materialProps, setMaterialProps] = useState({
    color: '#4080ff',
    roughness: 0.5,
    metalness: 0.5
  });

  const [nodes, setNodes] = useState([
    {
      id: '1',
      type: NODE_TYPES.COLOR,
      position: { x: 50, y: 50 },
      data: { color: '#4080ff' }
    },
    {
      id: '2',
      type: NODE_TYPES.ROUGHNESS,
      position: { x: 50, y: 200 },
      data: { value: 0.5 }
    },
    {
      id: '3',
      type: NODE_TYPES.METALNESS,
      position: { x: 50, y: 350 },
      data: { value: 0.5 }
    }
  ]);

  const [selectedNode, setSelectedNode] = useState(null);

  const updateMaterialProperty = (property, value) => {
    setMaterialProps(prev => ({
      ...prev,
      [property]: value
    }));
  };

  return (
    <div className="flex h-full bg-black text-white">
      {/* Properties Panel */}
      <div className="w-80 border-r border-neutral-700 flex flex-col">
        <div className="p-4 border-b border-neutral-700">
          <h2 className="text-lg font-semibold text-blue-400">Material Properties</h2>
        </div>
        
        <div className="p-4 space-y-6 flex-1 overflow-y-auto">
          {/* Color */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-blue-300">
              Base Color
            </label>
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded border border-blue-900"
                style={{ backgroundColor: materialProps.color }}
              />
              <input
                type="text"
                value={materialProps.color}
                onChange={(e) => updateMaterialProperty('color', e.target.value)}
                className="flex-1 bg-black border border-blue-900 rounded px-3 py-1 text-blue-100 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
              />
            </div>
          </div>

          {/* Roughness */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-blue-300">
              Roughness
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={materialProps.roughness}
              onChange={(e) => updateMaterialProperty('roughness', parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="text-sm text-blue-400">
              {materialProps.roughness.toFixed(2)}
            </div>
          </div>

          {/* Metalness */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-blue-300">
              Metalness
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={materialProps.metalness}
              onChange={(e) => updateMaterialProperty('metalness', parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="text-sm text-blue-400">
              {materialProps.metalness.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-neutral-700">
          <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
            Export Material
          </button>
        </div>
      </div>

      {/* Main Preview */}
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <MaterialPreview materialProps={materialProps} />
        </div>
        
        {/* Preview Controls */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <button className="p-2 bg-black border border-blue-900 rounded hover:bg-blue-950 hover:border-blue-800 transition-colors">
            <Grid size={16} className="text-blue-400" />
          </button>
          <button className="p-2 bg-black border border-blue-900 rounded hover:bg-blue-950 hover:border-blue-800 transition-colors">
            <Maximize2 size={16} className="text-blue-400" />
          </button>
        </div>
      </div>

      {/* Node Editor (Initially Hidden) */}
      <div className="w-96 border-l border-neutral-700 hidden">
        <div className="p-4 border-b border-neutral-700">
          <h2 className="text-lg font-semibold text-blue-400">Node Editor</h2>
        </div>
        <div className="p-4">
          {/* Node content will go here */}
        </div>
      </div>
    </div>
  );
};

export default MaterialEditor;