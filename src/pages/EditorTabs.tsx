import React, { useState, useRef, useEffect, useCallback, memo, Suspense } from 'react';
import { Plus, X, ChevronDown, Search, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';

// Canvas context types and interfaces
interface CanvasContext {
  offscreen: OffscreenCanvas | null;
  context: OffscreenCanvasRenderingContext2D | null;
}

interface EditorContextState {
  [tabId: number]: CanvasContext;
}

// Canvas Context Provider
const CanvasContext = React.createContext<{
  getContext: (tabId: number) => CanvasContext | null;
  initContext: (tabId: number) => void;
  destroyContext: (tabId: number) => void;
}>({
  getContext: () => null,
  initContext: () => {},
  destroyContext: () => {},
});

// Lazy load all editor components with error handling
const createErrorHandledLazyComponent = (importFn: () => Promise<any>, componentName: string) => {
  return React.lazy(() => 
    importFn().catch(error => ({
      default: () => (
        <div className="h-full bg-neutral-900 flex flex-col">
          <div className="bg-red-500/10 border-b border-red-500/20 p-4">
            <h3 className="text-red-400 font-medium flex items-center gap-2">
              <AlertCircle size={16} />
              Module Load Error: {componentName}
            </h3>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <pre className="text-red-400 text-sm whitespace-pre-wrap font-mono">
                {error.message}
              </pre>
            </div>
            {error.stack && (
              <div className="text-xs text-neutral-500 font-mono whitespace-pre-wrap">
                {error.stack}
              </div>
            )}
          </div>
        </div>
      )
    }))
  );
};

const BehaviorTreeEditor = createErrorHandledLazyComponent(() => import('../components/editors/BehaviorTree/page'), 'BehaviorTreeEditor');
const BPEdit =             createErrorHandledLazyComponent(() => import('../components/editors/Blueprint/page'),    'BlueprintEditor');
const AnimationEditor =    createErrorHandledLazyComponent(() => import('../components/editors/Animation/page'),    'AnimationEditor');
const ParticleSystem =     createErrorHandledLazyComponent(() => import('../components/editors/Particle/page'),     'ParticleEditor');
const MaterialEditor =     createErrorHandledLazyComponent(() => import('../components/editors/Material/page'),     'MaterialEditor');
const SkeletonEditor =     createErrorHandledLazyComponent(() => import('../components/editors/Skeleton/page'),     'SkeletonEditor');
const TerrainEditor =      createErrorHandledLazyComponent(() => import('../components/editors/Terrain/page'),      'TerrainEditor');
const NavMeshEditor =      createErrorHandledLazyComponent(() => import('../components/editors/NavMesh/page'),      'NavMeshEditor');
const PhysicsDebug =       createErrorHandledLazyComponent(() => import('../components/editors/Physics/page'),      'PhysicsDebug');
const DiagramEditor =      createErrorHandledLazyComponent(() => import('../components/editors/Diagram/page'),      'DiagramEditor');
const FoliageEditor =      createErrorHandledLazyComponent(() => import('../components/editors/Foliage/page'),      'FoliageEditor');
const PrefabEditor =       createErrorHandledLazyComponent(() => import('../components/editors/Prefab/page'),       'PrefabEditor');
const ScriptEditor =       createErrorHandledLazyComponent(() => import('../components/editors/Script/page'),       'ScriptEditor');
const SoundEditor =        createErrorHandledLazyComponent(() => import('../components/editors/Sound/page'),        'SoundEditor');
const LevelEditor =        createErrorHandledLazyComponent(() => import('../components/editors/Level/page'),        'LevelEditor');
const UIEditor =           createErrorHandledLazyComponent(() => import('../components/editors/UI/page'),           'UIEditor');

interface EditorType {
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  title: string;
  icon?: React.ReactNode;
  type: string;
}

const EDITOR_TYPES: EditorType[] = [
  { type: 'level',     title: 'Level Editor',         component: LevelEditor },
  { type: 'script',    title: 'Script Editor',        component: ScriptEditor },
  { type: 'blueprint', title: 'Blueprint Editor',     component: BPEdit },
  { type: 'material',  title: 'Material Editor',      component: MaterialEditor },
  { type: 'animation', title: 'Animation Editor',     component: AnimationEditor },
  { type: 'particle',  title: 'Particle System',      component: ParticleSystem },
  { type: 'sound',     title: 'Sound Editor',         component: SoundEditor },
  { type: 'terrain',   title: 'Terrain Editor',       component: TerrainEditor },
  { type: 'navmesh',   title: 'Navigation Mesh',      component: NavMeshEditor },
  { type: 'physics',   title: 'Physics Debug',        component: PhysicsDebug },
  { type: 'diagram',   title: 'Diagram Editor',       component: DiagramEditor },
  { type: 'prefab',    title: 'Prefab Editor',        component: PrefabEditor },
  { type: 'skeleton',  title: 'Skeleton Editor',      component: SkeletonEditor },
  { type: 'behavior',  title: 'Behavior Tree Editor', component: BehaviorTreeEditor },
  { type: 'foliage',   title: 'Foliage Editor',       component: FoliageEditor },
  { type: 'ui',        title: 'UI Editor',            component: UIEditor }
];

interface Tab {
  id: number;
  title: string;
  type: string;
}

interface EditorTabsProps {
  onTabChange?: (type: string) => void;
  defaultTabs?: Tab[];
  onTabsChange?: (tabs: Tab[]) => void;
}

// Canvas Provider Component
const CanvasProvider = ({ children }: { children: React.ReactNode }) => {
  const [contexts, setContexts] = useState<EditorContextState>({});

  const initContext = useCallback((tabId: number) => {
    const canvas = new OffscreenCanvas(800, 600);
    const context = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
      willReadFrequently: true
    });
    
    if (context) {
      setContexts(prev => ({
        ...prev,
        [tabId]: {
          offscreen: canvas,
          context: context
        }
      }));
    }
  }, []);

  const destroyContext = useCallback((tabId: number) => {
    setContexts(prev => {
      const newContexts = { ...prev };
      const context = newContexts[tabId];
      
      if (context?.context) {
        // Clean up any resources
        context.context = null;
      }
      if (context?.offscreen) {
        // Clean up OffscreenCanvas
        context.offscreen = null;
      }
      
      delete newContexts[tabId];
      return newContexts;
    });
  }, []);

  const getContext = useCallback((tabId: number) => {
    return contexts[tabId] || null;
  }, [contexts]);

  return (
    <CanvasContext.Provider value={{ getContext, initContext, destroyContext }}>
      {children}
    </CanvasContext.Provider>
  );
};

// TabErrorBoundary component
const TabErrorBoundary = memo(({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="h-full bg-neutral-900 flex flex-col">
          <div className="bg-red-500/10 border-b border-red-500/20 p-4">
            <h3 className="text-red-400 font-medium flex items-center gap-2">
              <AlertCircle size={16} />
              Tab Error
            </h3>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <pre className="text-red-400 text-sm whitespace-pre-wrap font-mono">
                {error.message}
              </pre>
            </div>
            {error.stack && (
              <div className="text-xs text-neutral-500 font-mono whitespace-pre-wrap">
                {error.stack}
              </div>
            )}
          </div>
          <div className="border-t border-neutral-800 p-4 bg-black/30 flex justify-end gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 text-sm bg-neutral-800 hover:bg-neutral-700 text-white rounded"
            >
              Reload App
            </button>
            <button
              onClick={resetErrorBoundary}
              className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-500 text-white rounded"
            >
              Reset Tab
            </button>
          </div>
        </div>
      )}
      onReset={() => {
        // Add any cleanup or state reset logic here
      }}
    >
      {children}
    </ErrorBoundary>
  );
});

TabErrorBoundary.displayName = 'TabErrorBoundary';

// Loading component
const LoadingEditor = () => (
  <div className="flex items-center justify-center h-full bg-black/50">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"/>
  </div>
);

// Modified Editor component with canvas context support
const Editor = memo(({ type, isActive, tabId }: { type: string; isActive: boolean; tabId: number }) => {
  const { getContext, initContext, destroyContext } = React.useContext(CanvasContext);
  
  useEffect(() => {
    if (isActive) {
      initContext(tabId);
      return () => destroyContext(tabId);
    }
  }, [isActive, tabId, initContext, destroyContext]);

  const EditorComponent = EDITOR_TYPES.find(e => e.type === type)?.component;
  
  if (!EditorComponent) {
    throw new Error(`Editor component not found for type: ${type}`);
  }

  const canvasContext = getContext(tabId);

  return (
    <ErrorBoundary
      fallback={<TabErrorBoundary children={undefined} />}
      onError={(error, errorInfo) => {
        console.error('Editor Error:', error, errorInfo);
      }}
      resetKeys={[type]}
    >
      <EditorComponent 
        isActive={isActive}
        canvasContext={canvasContext}
      />
    </ErrorBoundary>
  );
});

Editor.displayName = 'Editor';

// Main EditorTabs component
const EditorTabs: React.FC<EditorTabsProps> = (props) => {
  return (
    <CanvasProvider>
      <EditorTabsContent {...props} />
    </CanvasProvider>
  );
};

// EditorTabs content component
const EditorTabsContent: React.FC<EditorTabsProps> = ({
  onTabChange,
  defaultTabs = [
    { id: 1, title: 'Level Editor', type: 'level' },
    { id: 2, title: 'Script Editor', type: 'script' }
  ],
  onTabsChange
}) => {
  const [tabs, setTabs] = useState<Tab[]>(defaultTabs);
  const [activeTab, setActiveTab] = useState<number>(defaultTabs[0].id);
  const [showNewTabMenu, setShowNewTabMenu] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEditorIndex, setSelectedEditorIndex] = useState<number>(0);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const newTabMenuRef = useRef<HTMLDivElement>(null);
  const editorListRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Tab management
  const updateTabs = useCallback((newTabs: Tab[]) => {
    setTabs(newTabs);
    onTabsChange?.(newTabs);
  }, [onTabsChange]);

  const addNewTab = useCallback((editorType: string) => {
    const editorInfo = EDITOR_TYPES.find(e => e.type === editorType);
    if (!editorInfo) return;

    const newId = Math.max(0, ...tabs.map(t => t.id)) + 1;
    const newTab: Tab = {
      id: newId,
      title: editorInfo.title,
      type: editorType
    };

    updateTabs([...tabs, newTab]);
    setActiveTab(newId);
    setShowNewTabMenu(false);
    setSearchTerm('');
    setSelectedEditorIndex(0);
  }, [tabs, updateTabs]);

  const removeTab = useCallback((tabId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (tabs.length <= 1) return;

    const newTabs = tabs.filter(t => t.id !== tabId);
    updateTabs(newTabs);
    
    if (activeTab === tabId) {
      setActiveTab(newTabs[newTabs.length - 1].id);
      onTabChange?.(newTabs[newTabs.length - 1].type);
    }
  }, [tabs, activeTab, updateTabs, onTabChange]);

  // Filter editors based on search
  const filteredEditors = EDITOR_TYPES.filter(editor =>
    editor.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Keyboard navigation and event handlers
  useEffect(() => {
    setSelectedEditorIndex(0);
  }, [searchTerm, showNewTabMenu]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const modifierKey = e.ctrlKey || e.metaKey;
      const shiftKey = e.shiftKey;

      if (showNewTabMenu) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedEditorIndex((prevIndex) => 
            Math.min(prevIndex + 1, filteredEditors.length - 1)
          );
          
          setTimeout(() => {
            const selectedElement = editorListRef.current[selectedEditorIndex + 1];
            if (selectedElement) {
              selectedElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
              });
            }
          }, 0);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedEditorIndex((prevIndex) => 
            Math.max(prevIndex - 1, 0)
          );
          
          setTimeout(() => {
            const selectedElement = editorListRef.current[selectedEditorIndex - 1];
            if (selectedElement) {
              selectedElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
              });
            }
          }, 0);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const selectedEditor = filteredEditors[selectedEditorIndex];
          if (selectedEditor) {
            addNewTab(selectedEditor.type);
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setShowNewTabMenu(false);
        }
        return;
      }

      if (e.key === 'n' && e.altKey) {
        e.preventDefault();
        setShowNewTabMenu(true);
        setTimeout(() => searchInputRef.current?.focus(), 0);
        return;
      }

      if (e.key === 'w' && e.altKey) {
        e.preventDefault();
        removeTab(activeTab);
        return;
      }

      if (modifierKey && e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = tabs.findIndex(t => t.id === activeTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[nextIndex].id);
        onTabChange?.(tabs[nextIndex].type);
      }

      if (modifierKey && shiftKey && e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = tabs.findIndex(t => t.id === activeTab);
        const nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        setActiveTab(tabs[nextIndex].id);
        onTabChange?.(tabs[nextIndex].type);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, [
    activeTab, 
    tabs, 
    removeTab, 
    onTabChange, 
    showNewTabMenu, 
    filteredEditors, 
    selectedEditorIndex, 
    addNewTab
  ]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (newTabMenuRef.current && !newTabMenuRef.current.contains(e.target as Node)) {
        setShowNewTabMenu(false);
      }
    };

    if (showNewTabMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNewTabMenu]);

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Tab Bar */}
      <div className="flex items-center bg-black border-b border-neutral-800">
        <div className="flex-1 flex overflow-x-auto">
          <AnimatePresence mode="popLayout">
            {tabs.map(tab => (
              <motion.button
                key={tab.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => {
                  setActiveTab(tab.id);
                  onTabChange?.(tab.type);
                }}
                className={`flex items-center min-w-40 px-4 py-2 text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-black text-white border-b-2 border-blue-500'
                    : 'text-neutral-400 hover:bg-neutral-950'
                }`}
              >
                <span className="truncate">{tab.title}</span>
                {tabs.length > 1 && (
                  <X
                    size={14}
                    onClick={(e) => removeTab(tab.id, e)}
                    className="ml-2 opacity-60 hover:opacity-100"
                  />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* New Tab Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNewTabMenu(true);
              setTimeout(() => searchInputRef.current?.focus(), 0);
            }}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-950 transition-colors flex items-center gap-1"
            title="New Tab (Alt+N)"
          >
            <Plus size={20} />
            <ChevronDown size={14} />
          </button>

          {/* New Tab Menu */}
          <AnimatePresence>
            {showNewTabMenu && (
              <motion.div
                ref={newTabMenuRef}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.1 }}
                className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
              >
                <div className="bg-neutral-900 rounded-lg shadow-xl w-full max-w-xl overflow-hidden m-4">
                  <div className="p-4 border-b border-neutral-800">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 text-neutral-400" size={20} />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search Editors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-neutral-800 text-white pl-10 pr-4 py-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {filteredEditors.map((editor, index) => (
                      <motion.button
                        ref={(el) => { editorListRef.current[index] = el; }}
                        key={editor.type}
                        onClick={() => addNewTab(editor.type)}
                        initial={false}
                        animate={{
                          backgroundColor: 
                            index === selectedEditorIndex 
                              ? 'rgba(64, 64, 64, 0.5)' 
                              : 'rgba(64, 64, 64, 0)'
                        }}
                        transition={{ duration: 0.1 }}
                        className="w-full px-4 py-3 text-left transition-colors flex items-center gap-3 focus:outline-none"
                      >
                        <div className="p-1 rounded bg-neutral-700">
                          {editor.icon || <Plus size={16} />}
                        </div>
                        <div>
                          <div className="text-sm text-white">{editor.title}</div>
                          <div className="text-xs text-neutral-400">
                            Open a new {editor.title.toLowerCase()}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <div className="p-2 border-t border-neutral-800 bg-neutral-900 text-xs text-neutral-400 flex justify-between items-center">
                    <div className="flex gap-4">
                      <span>↑↓ to navigate</span>
                      <span>alt + n to open</span>
                    </div>
                    <span>esc to close</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative flex-1 overflow-hidden">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          
          return (
            <div
              key={tab.id}
              className={`absolute inset-0 ${
                isActive
                  ? 'opacity-100 z-10'
                  : 'opacity-0 pointer-events-none z-0'
              }`}
              onKeyDown={isActive ? e => e.stopPropagation() : undefined}
              tabIndex={isActive ? 0 : -1}
              aria-hidden={!isActive}
              style={{
                ...(isActive ? {} : {
                  visibility: 'hidden',
                  position: 'absolute',
                  width: 0,
                  height: 0,
                  overflow: 'hidden',
                  clip: 'rect(0 0 0 0)',
                  clipPath: 'inset(50%)',
                })
              }}
            >
              {!isActive && (
                <div 
                  onKeyDown={e => e.stopPropagation()} 
                  tabIndex={-1}
                  aria-hidden="true"
                  className="absolute inset-0"
                />
              )}
              
              <TabErrorBoundary>
                <div 
                  className="h-full" 
                  data-editor-type={tab.type}
                  onKeyDown={isActive ? e => {
                    e.stopPropagation();
                  } : undefined}
                >
                  <Suspense fallback={<LoadingEditor />}>
                    <Editor 
                      type={tab.type} 
                      isActive={isActive} 
                      tabId={tab.id}
                    />
                  </Suspense>
                </div>
              </TabErrorBoundary>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(EditorTabs);