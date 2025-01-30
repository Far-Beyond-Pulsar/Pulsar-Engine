import React, { useState, useRef, useEffect, useCallback, memo, Suspense } from 'react';
import { Plus, X, ChevronDown, Search, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';
import FileExplorer from '../components/FileExplorer';

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

const LevelEditor = createErrorHandledLazyComponent(() => import('../components/LevelEditor'), 'LevelEditor');
const ScriptEditor = createErrorHandledLazyComponent(() => import('../components/ScriptEditor'), 'ScriptEditor');
const BPEdit = createErrorHandledLazyComponent(() => import('../components/BPEdit/page'), 'BlueprintEditor');
const MaterialEditor = createErrorHandledLazyComponent(() => import('../components/editors/MaterialEditor'), 'MaterialEditor');
const AnimationEditor = createErrorHandledLazyComponent(() => import('../components/editors/AnimationEditor'), 'AnimationEditor');
const ParticleSystem = createErrorHandledLazyComponent(() => import('../components/editors/ParticleEditor'), 'ParticleEditor');
const SoundEditor = createErrorHandledLazyComponent(() => import('../components/editors/SoundEditor'), 'SoundEditor');
const UIEditor = createErrorHandledLazyComponent(() => import('../components/editors/UIEditor'), 'UIEditor');
const TerrainEditor = createErrorHandledLazyComponent(() => import('../components/editors/TerrainEditor'), 'TerrainEditor');
const NavMeshEditor = createErrorHandledLazyComponent(() => import('../components/editors/NavMeshEditor'), 'NavMeshEditor');
const PhysicsDebug = createErrorHandledLazyComponent(() => import('../components/editors/PhysicsDebug'), 'PhysicsDebug');
const PrefabEditor = createErrorHandledLazyComponent(() => import('../components/editors/PrefabEditor'), 'PrefabEditor');
const SkeletonEditor = createErrorHandledLazyComponent(() => import('../components/editors/SkeletonEditor'), 'SkeletonEditor');
const BehaviorTreeEditor = createErrorHandledLazyComponent(() => import('../components/editors/BehaviorTree'), 'BehaviorTreeEditor');
const FoliageEditor = createErrorHandledLazyComponent(() => import('../components/editors/FoliageEditor'), 'FoliageEditor');

interface EditorType {
  type: string;
  title: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  icon?: React.ReactNode;
}

const EDITOR_TYPES: EditorType[] = [
  { type: 'level', title: 'Level Editor', component: LevelEditor },
  { type: 'script', title: 'Script Editor', component: ScriptEditor },
  { type: 'blueprint', title: 'Blueprint Editor', component: BPEdit },
  { type: 'material', title: 'Material Editor', component: MaterialEditor },
  { type: 'animation', title: 'Animation Editor', component: AnimationEditor },
  { type: 'particle', title: 'Particle System', component: ParticleSystem },
  { type: 'sound', title: 'Sound Editor', component: SoundEditor },
  { type: 'ui', title: 'UI Editor', component: UIEditor },
  { type: 'terrain', title: 'Terrain Editor', component: TerrainEditor },
  { type: 'navmesh', title: 'Navigation Mesh', component: NavMeshEditor },
  { type: 'physics', title: 'Physics Debug', component: PhysicsDebug },
  { type: 'prefab', title: 'Prefab Editor', component: PrefabEditor },
  { type: 'skeleton', title: 'Skeleton Editor', component: SkeletonEditor },
  { type: 'behavior', title: 'Behavior Tree Editor', component: BehaviorTreeEditor },
  { type: 'foliage', title: 'Foliage Editor', component: FoliageEditor }
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

// TabErrorBoundary component to handle tab-specific errors
const TabErrorBoundary = memo(({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="h-full bg-neutral-900 flex flex-col">
          {/* Error header */}
          <div className="bg-red-500/10 border-b border-red-500/20 p-4">
            <h3 className="text-red-400 font-medium flex items-center gap-2">
              <AlertCircle size={16} />
              Tab Error
            </h3>
          </div>

          {/* Error details */}
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

          {/* Action buttons */}
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

// Memoized Editor component with error handling
const Editor = memo(({ type, isActive }: { type: string; isActive: boolean }) => {

  const EditorComponent = EDITOR_TYPES.find(e => e.type === type)?.component;
  
  // Handle missing editor components gracefully
  if (!EditorComponent) {
    throw new Error(`Editor component not found for type: ${type}`);
  }

  // Wrap the editor component in its own error boundary
  return (
    <ErrorBoundary
      fallback={<TabErrorBoundary children={undefined} />}
      onError={(error, errorInfo) => {
        // Log error to your error tracking service
        console.error('Editor Error:', error, errorInfo);
      }}
      resetKeys={[type]} // Reset when editor type changes
    >
      <EditorComponent isActive={isActive} />
    </ErrorBoundary>
  );
});

Editor.displayName = 'Editor';

// Main EditorTabs component
const EditorTabs: React.FC<EditorTabsProps> = ({
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const newTabMenuRef = useRef<HTMLDivElement>(null);

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

  // Keyboard shortcuts and focus management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts if we're not in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Escape' && showNewTabMenu) {
        setShowNewTabMenu(false);
        return;
      }

      // Alt+N for new tab
      if (e.key === 'n' && e.altKey) {
        e.preventDefault();
        setShowNewTabMenu(true);
        setTimeout(() => searchInputRef.current?.focus(), 0);
        return;
      }

      // Ctrl+W or Cmd+W to close current tab
      if (e.key === 'w' && e.altKey) {
        e.preventDefault();
        removeTab(activeTab);
        return;
      }

      // Ctrl+Tab or Cmd+Tab to switch tabs
      if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = tabs.findIndex(t => t.id === activeTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[nextIndex].id);
        onTabChange?.(tabs[nextIndex].type);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, showNewTabMenu, tabs, removeTab, onTabChange]);

  // Click outside handler for new tab menu
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

  // Filter editors based on search
  const filteredEditors = EDITOR_TYPES.filter(editor =>
    editor.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                      <button
                        key={editor.type}
                        onClick={() => addNewTab(editor.type)}
                        className="w-full px-4 py-3 text-left hover:bg-neutral-800 transition-colors flex items-center gap-3"
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
                      </button>
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
                // Completely prevent any interaction with inactive tabs
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
              {/* Keyboard event trap for inactive tabs */}
              {!isActive && (
                <div 
                  onKeyDown={e => e.stopPropagation()} 
                  tabIndex={-1}
                  aria-hidden="true"
                  className="absolute inset-0"
                />
              )}
              
              {/* Editor instance with error boundary */}
              <TabErrorBoundary>
                <div 
                  className="h-full" 
                  data-editor-type={tab.type}
                  onKeyDown={isActive ? e => {
                    // Allow keyboard events to propagate only within the editor
                    e.stopPropagation();
                  } : undefined}
                >
                  <Suspense fallback={<LoadingEditor />}>
                    <Editor type={tab.type} isActive={isActive} />
                  </Suspense>
                </div>
              </TabErrorBoundary>
            </div>
          );
        })}
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-black border-t border-neutral-800 px-2 flex items-center text-xs text-neutral-400">
        <div className="flex-1">
          {tabs.length} tab{tabs.length !== 1 ? 's' : ''} open
        </div>
        <div className="flex items-center gap-4">
            <div className={`transition-colors ${showNewTabMenu ? 'text-blue-500' : ''}`}>Alt+N: New Tab</div>
            <div className={`transition-colors ${tabs.length > 1 ? 'text-blue-500' : ''}`}>Ctrl+W: Close Tab</div>
            <div className={`transition-colors ${tabs.length > 1 ? 'text-blue-500' : ''}`}>Ctrl+Tab: Switch Tab</div>
        </div>
      </div>
    </div>
  );
};

export default memo(EditorTabs);