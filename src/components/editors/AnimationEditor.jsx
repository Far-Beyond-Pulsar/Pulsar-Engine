import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, Pause, SkipBack, ChevronRight, Plus, RotateCcw, Clock, Upload, Save, Trash2, 
  Edit, ChevronsRight, ChevronsLeft, Camera 
} from 'lucide-react';

// Dynamically import Three.js to ensure it's only loaded on client-side
const importThree = () => {
  if (typeof window !== 'undefined') {
    return {
      THREE: require('three'),
      FBXLoader: require('three/examples/jsm/loaders/FBXLoader').FBXLoader,
      OrbitControls: require('three/examples/jsm/controls/OrbitControls').OrbitControls
    };
  }
  return {};
};

const FBXAnimator = () => {
  // State management
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [animations, setAnimations] = useState([]);
  const [selectedAnimation, setSelectedAnimation] = useState(null);
  const [animationSettings, setAnimationSettings] = useState({
    duration: 1.0,
    frameRate: 30,
    loopMode: 'None'
  });
  const [isClient, setIsClient] = useState(false);

  // Refs for 3D scene management
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const mixerRef = useRef(null);
  const animationActionRef = useRef(null);
  const animationFrameRef = useRef(null);

  // File handling
  const fileInputRef = useRef(null);

  // Ensure client-side loading
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize 3D scene
  const initializeScene = useCallback(() => {
    // Ensure we're on the client and have a valid DOM element
    if (!isClient || !sceneRef.current || rendererRef.current) return;

    // Dynamically import Three.js modules
    const { THREE, FBXLoader, OrbitControls } = importThree();
    if (!THREE || !FBXLoader || !OrbitControls) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    
    // Camera
    const camera = new THREE.PerspectiveCamera(75, sceneRef.current.clientWidth / sceneRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 100, 200);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(sceneRef.current.clientWidth, sceneRef.current.clientHeight);
    
    // Clear previous content and append new renderer
    if (sceneRef.current.firstChild) {
      sceneRef.current.removeChild(sceneRef.current.firstChild);
    }
    sceneRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 200, 100);
    scene.add(directionalLight);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 100, 0);
    controls.update();

    // Grid
    const gridHelper = new THREE.GridHelper(500, 50);
    scene.add(gridHelper);

    // Store references
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;

    // Create a reference to the scene
    const sceneInstance = scene;

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      // Update animation mixer if exists
      if (mixerRef.current) {
        mixerRef.current.update(0.016); // Approximate 60fps
      }

      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.render(sceneInstance, cameraRef.current);
      }
    };
    animate();

    return sceneInstance;
  }, [isClient]);

  // Handle scene initialization and cleanup
  useEffect(() => {
    const scene = initializeScene();

    // Cleanup function
    return () => {
      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Dispose renderer
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }

      // Dispose controls
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
  }, [initializeScene]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current && sceneRef.current) {
        cameraRef.current.aspect = sceneRef.current.clientWidth / sceneRef.current.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(sceneRef.current.clientWidth, sceneRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load FBX file
  const handleFileUpload = (event) => {
    if (!isClient) return;

    const { THREE, FBXLoader } = importThree();
    if (!THREE || !FBXLoader) return;

    const file = event.target.files[0];
    if (!file) return;

    const loader = new FBXLoader();
    loader.load(
      URL.createObjectURL(file),
      (fbx) => {
        // Remove previous model if exists
        if (modelRef.current && sceneRef.current) {
          const scene = cameraRef.current?.userData?.scene;
          if (scene) {
            scene.remove(modelRef.current);
          }
        }

        // Store new model
        modelRef.current = fbx;
        
        // Ensure scene is initialized and add model
        const scene = cameraRef.current?.userData?.scene;
        if (scene) {
          scene.add(fbx);
        }

        // Handle animations
        const newAnimations = fbx.animations || [];
        setAnimations(newAnimations);

        // Setup animation mixer
        if (mixerRef.current) {
          mixerRef.current.stopAllAction();
        }
        mixerRef.current = new THREE.AnimationMixer(fbx);

        // If animations exist, select the first one
        if (newAnimations.length > 0) {
          playAnimation(newAnimations[0]);
        }
      },
      (progress) => {
        console.log((progress.loaded / progress.total) * 100 + '% loaded');
      },
      (error) => {
        console.error('Error loading FBX:', error);
      }
    );
  };

  // Play animation
  const playAnimation = (animation) => {
    if (!isClient) return;

    const { THREE } = importThree();
    if (!THREE) return;

    if (mixerRef.current && animation) {
      // Stop previous animation
      if (animationActionRef.current) {
        animationActionRef.current.stop();
      }

      // Play new animation
      const action = mixerRef.current.clipAction(animation);
      action.setLoop(
        animationSettings.loopMode === 'Loop' ? THREE.LoopRepeat :
        animationSettings.loopMode === 'Ping Pong' ? THREE.LoopPingPong :
        THREE.LoopOnce
      );
      action.play();
      animationActionRef.current = action;
      setSelectedAnimation(animation);
      setIsPlaying(true);
    }
  };

  // Export current animation as FBX
  const exportAnimation = () => {
    if (selectedAnimation) {
      // Note: Full FBX export requires additional libraries
      // This is a placeholder for actual export functionality
      console.log('Exporting animation:', selectedAnimation);
      alert('Full FBX export requires server-side processing');
    }
  };

  // Render the component
  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Animation List */}
        <div className="w-64 border-r border-neutral-800">
          <div className="p-2 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-sm font-medium">Animations</h2>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload}
              accept=".fbx"
              className="hidden"
            />
            <button 
              className="p-1 hover:bg-neutral-800 rounded"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
            </button>
          </div>
          <div className="p-2">
            {animations.map((anim, index) => (
              <div 
                key={index} 
                className={`flex items-center p-2 ${selectedAnimation === anim ? 'bg-neutral-800' : 'hover:bg-neutral-800'} rounded cursor-pointer`}
                onClick={() => playAnimation(anim)}
              >
                <ChevronRight size={16} className="mr-2" />
                <span className="text-sm">{anim.name || `Animation ${index + 1}`}</span>
              </div>
            ))}
            {animations.length === 0 && (
              <div className="text-sm text-neutral-500 text-center py-4">
                No animations loaded
              </div>
            )}
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex flex-col">
          {/* 3D Preview Window */}
          <div 
            ref={sceneRef} 
            className="flex-1 relative"
          >
            <div className="absolute top-2 left-2 bg-black/50 p-2 rounded text-sm">
              {selectedAnimation 
                ? `Loaded: ${selectedAnimation.name || 'Unnamed Animation'}` 
                : 'Load an FBX model'}
            </div>
          </div>

          {/* Timeline */}
          <div className="h-48 border-t border-neutral-800">
            {/* Timeline Controls */}
            <div className="h-10 border-b border-neutral-800 flex items-center px-4 space-x-2">
              <button 
                className="p-1 hover:bg-neutral-800 rounded"
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={!selectedAnimation}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button 
                className="p-1 hover:bg-neutral-800 rounded"
                disabled={!selectedAnimation}
              >
                <SkipBack size={16} />
              </button>
              <button 
                className="p-1 hover:bg-neutral-800 rounded"
                disabled={!selectedAnimation}
              >
                <RotateCcw size={16} />
              </button>
              <div className="h-4 w-px bg-neutral-800 mx-2" />
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-neutral-400" />
                <span className="text-sm text-neutral-400">Frame {currentFrame}</span>
              </div>
              <div className="ml-auto flex space-x-2">
                <button 
                  className="p-1 hover:bg-neutral-800 rounded"
                  onClick={exportAnimation}
                  disabled={!selectedAnimation}
                >
                  <Save size={16} />
                </button>
              </div>
            </div>

            {/* Timeline Grid */}
            <div className="relative h-[calc(100%-2.5rem)] p-4">
              <div className="absolute inset-0 p-4">
                <div className="h-full" style={{
                  backgroundImage: 'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to right, #0d0d0d 1px, transparent 1px)',
                  backgroundSize: '100px 100%, 20px 100%'
                }}></div>
              </div>
              {/* Keyframe Visualization */}
              <div className="relative h-6 bg-neutral-800/30 rounded">
                {selectedAnimation && selectedAnimation.tracks && 
                  selectedAnimation.tracks.map((track, index) => (
                    <div 
                      key={index} 
                      className="absolute h-4 w-1 bg-blue-500 top-1"
                      style={{ 
                        left: `${(track.times[0] / selectedAnimation.duration) * 100}%`
                      }}
                    ></div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div className="w-80 border-l border-neutral-800">
          <div className="h-8 border-b border-neutral-800 px-4 flex items-center">
            <span className="text-sm text-neutral-400">Properties</span>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Duration (s)</label>
                <input 
                  type="number" 
                  value={animationSettings.duration}
                  onChange={(e) => setAnimationSettings(prev => ({
                    ...prev, 
                    duration: parseFloat(e.target.value)
                  }))}
                  className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-24" 
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Framerate</label>
                <input 
                  type="number" 
                  value={animationSettings.frameRate}
                  onChange={(e) => setAnimationSettings(prev => ({
                    ...prev, 
                    frameRate: parseInt(e.target.value)
                  }))}
                  className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-24" 
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Loop</label>
                <select 
                  value={animationSettings.loopMode}
                  onChange={(e) => setAnimationSettings(prev => ({
                    ...prev, 
                    loopMode: e.target.value
                  }))}
                  className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm w-full"
                >
                  <option>None</option>
                  <option>Loop</option>
                  <option>Ping Pong</option>
                </select>
              </div>
              <div className="pt-4 border-t border-neutral-800">
                <label className="block text-sm font-medium mb-2">Keyframe Events</label>
                <button 
                  className="w-full px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-sm text-center"
                  disabled={!selectedAnimation}
                >
                  Add Keyframe Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FBXAnimator;