import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Camera, Play } from 'lucide-react';

function Box(props) {
  const meshRef = React.useRef();

  React.useEffect(() => {
    if (!props.isPlaying) return;
    
    const interval = setInterval(() => {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }, 16);

    return () => clearInterval(interval);
  }, [props.isPlaying]);

  return (
    <mesh {...props} ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#2563eb" />
    </mesh>
  );
}

function Scene({ isPlaying }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <Box position={[0, 0.5, 0]} isPlaying={isPlaying} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <gridHelper args={[10, 10, '#444444', '#222222']} />
      <OrbitControls />
    </>
  );
}

const Viewport = ({ 
  activeTool, 
  isPlaying, 
  fps, 
  onToolChange, 
  onPlayToggle,
  logMessage 
}) => {
  return (
    <div className="flex-1 relative h-full">
      <Canvas
        shadows
        camera={{ position: [5, 5, 5], fov: 75 }}
        style={{ background: '#111' }}
      >
        <Scene isPlaying={isPlaying} />
      </Canvas>
      
      <div className="absolute top-3 left-3 flex gap-1 bg-black/80 border border-blue-900/20 rounded-lg p-1">
        <button
          className={`p-2 rounded hover:bg-blue-900/10 hover:text-blue-500
            ${activeTool === 'select' ? 'text-blue-500 bg-blue-900/10' : 'text-gray-400'}`}
          onClick={() => onToolChange('select')}
          title="Select (V)"
        >
          <Camera size={20} />
        </button>

        <div className="w-px h-6 bg-blue-900/20 mx-1" />
        <button
          className={`p-2 rounded hover:bg-blue-900/10 hover:text-blue-500
            ${isPlaying ? 'text-blue-500 bg-blue-900/10' : 'text-gray-400'}`}
          onClick={() => {
            onPlayToggle(!isPlaying);
            logMessage('info', isPlaying ? 'Stopped simulation' : 'Started simulation');
          }}
          title="Play/Stop (Space)"
        >
          <Play size={20} />
        </button>
      </div>

      <div className="absolute top-3 right-3 bg-black/80 px-3 py-2 rounded-lg border border-blue-900/20 text-blue-500 text-sm">
        FPS: {fps}
      </div>
    </div>
  );
};

export default Viewport;