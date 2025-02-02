import React, { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Plane } from "@react-three/drei";
import * as THREE from "three";

export default function TerrainEditor() {
  const [heightMap, setHeightMap] = useState([]);
  const [tool, setTool] = useState("raise");
  const [strength, setStrength] = useState(0.1);
  const [brushSize, setBrushSize] = useState(1);
  const [hoverPoint, setHoverPoint] = useState(null);
  const canvasRef = useRef(null);

  const handleExport = () => {
    const size = 256;
    const renderTarget = new THREE.WebGLRenderTarget(size, size);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });

    renderer.setRenderTarget(renderTarget);
    renderer.render(canvasRef.current.scene, canvasRef.current.camera);

    const pixels = new Uint8Array(size * size * 4);
    renderer.readRenderTargetPixels(renderTarget, 0, 0, size, size, pixels);

    const heightMapData = [];
    for (let y = 0; y < size; y++) {
      heightMapData[y] = [];
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        heightMapData[y][x] = pixels[i] / 255;
      }
    }

    setHeightMap(heightMapData);
    downloadHeightMap(heightMapData);
  };

  const downloadHeightMap = (data) => {
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "heightmap.json";
    link.click();
  };

  const modifyTerrain = (terrain, tool, strength, brushSize, point) => {
    const positions = terrain.attributes.position.array;
    const size = Math.sqrt(positions.length / 3);
    const radius = brushSize * size / 10;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);

      if (distance <= radius) {
        const factor = 1 - distance / radius;

        if (tool === "raise") {
          positions[i + 2] += strength * factor;
        } else if (tool === "lower") {
          positions[i + 2] -= strength * factor;
        } else if (tool === "smooth") {
          positions[i + 2] += (strength * factor) * 0.5;
        }
      }
    }

    terrain.attributes.position.needsUpdate = true;
  };

  return (
    <div className="h-screen w-full flex bg-black text-blue-500">
      <div className="w-64 p-4 flex flex-col bg-neutral-950 space-y-4 border-white">
        <h2 className="text-lg font-bold text-white">Terrain Tools</h2>
        <div>
          <button
            onClick={() => setTool("raise")}
            className={`px-4 py-2 rounded ${tool === "raise" ? "bg-blue-700 text-white" : "bg-gray-800 text-blue-500"} hover:bg-blue-600`}
          >
            Raise
          </button>
          <button
            onClick={() => setTool("lower")}
            className={`px-4 py-2 rounded mt-2 ${tool === "lower" ? "bg-blue-700 text-white" : "bg-gray-800 text-blue-500"} hover:bg-blue-600`}
          >
            Lower
          </button>
          <button
            onClick={() => setTool("smooth")}
            className={`px-4 py-2 rounded mt-2 ${tool === "smooth" ? "bg-blue-700 text-white" : "bg-gray-800 text-blue-500"} hover:bg-blue-600`}
          >
            Smooth
          </button>
        </div>
        <div>
          <label className="block mt-4 mb-2 text-white">Strength:</label>
          <input
            type="range"
            min="0.01"
            max="1"
            step="0.01"
            value={strength}
            onChange={(e) => setStrength(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block mt-4 mb-2 text-white">Brush Size:</label>
          <input
            type="range"
            min="1"
            max="5"
            step="0.1"
            value={brushSize}
            onChange={(e) => setBrushSize(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <button
          onClick={handleExport}
          className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-500 mt-4"
        >
          Export Heightmap
        </button>
      </div>
      <div className="flex-grow">
        <Canvas
          className="h-full"
          ref={canvasRef}
          style={{ background: "#000" }}
          shadows
          camera={{ position: [5, 5, 5], fov: 50 }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <OrbitControls />
          <Plane
            args={[10, 10, 64, 64]}
            onPointerMove={(e) => {
              if (e.buttons === 1) {
                const point = {
                  x: e.point.x,
                  y: e.point.y,
                };
                modifyTerrain(e.object.geometry, tool, strength, brushSize, point);
              }
            }}
            receiveShadow
            castShadow
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial color="#999" wireframe />
          </Plane>
        </Canvas>
      </div>
    </div>
  );
}
