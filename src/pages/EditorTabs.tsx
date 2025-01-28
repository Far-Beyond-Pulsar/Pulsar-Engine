import React, { useState } from 'react';
import { Plus, X, ChevronDown } from 'lucide-react';
import LevelEditor from '../components/LevelEditor';
import ScriptEditor from '../components/ScriptEditor';
import BPEdit from '../components/BPEdit/page';
import MaterialEditor from '../components/editors/MaterialEditor';
import AnimationEditor from '../components/editors/AnimationEditor';
import ParticleSystem from '../components/editors/ParticleEditor';
import SoundEditor from '../components/editors/SoundEditor';
import UIEditor from '../components/editors/UIEditor';
import TerrainEditor from '../components/editors/TerrainEditor';
import NavMeshEditor from '../components/editors/NavMeshEditor';
import PhysicsDebug from '../components/editors/PhysicsDebug';
import PrefabEditor from '../components/editors/PrefabEditor';

const EDITOR_TYPES = [
  { type: 'level', title: 'Level Editor' },
  { type: 'script', title: 'Script Editor' },
  { type: 'blueprint', title: 'Blueprint Editor' },
  { type: 'material', title: 'Material Editor' },
  { type: 'animation', title: 'Animation Editor' },
  { type: 'particle', title: 'Particle System' },
  { type: 'sound', title: 'Sound Editor' },
  { type: 'ui', title: 'UI Editor' },
  { type: 'terrain', title: 'Terrain Editor' },
  { type: 'navmesh', title: 'Navigation Mesh' },
  { type: 'physics', title: 'Physics Debug' },
  { type: 'prefab', title: 'Prefab Editor' }
];

interface EditorTabsProps {
  onTabChange?: (type: string) => void;
}

const EditorTabs: React.FC<EditorTabsProps> = ({ onTabChange }) => {
  const [tabs, setTabs] = useState([
    { id: 1, title: 'Level Editor', type: 'level' },
    { id: 2, title: 'Script Editor', type: 'script' }
  ]);
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [showNewTabMenu, setShowNewTabMenu] = useState(false);

  interface Tab {
    id: number;
    title: string;
    type: string;
  }

  const addNewTab = (editorType: string) => {
    const newId = Math.max(...tabs.map(t => t.id)) + 1;
    const editorInfo = EDITOR_TYPES.find(e => e.type === editorType);
    if (!editorInfo) return;
    const newTab: Tab = { 
      id: newId, 
      title: editorInfo.title, 
      type: editorType 
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newId);
    setShowNewTabMenu(false);
  };

  const removeTab = (tabId: number, e: React.MouseEvent<SVGElement, MouseEvent>) => {
    e.stopPropagation();
    if (tabs.length > 1) {
      const newTabs = tabs.filter((t: Tab) => t.id !== tabId);
      setTabs(newTabs);
      if (activeTab === tabId) {
        setActiveTab(newTabs[0].id);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <div className="flex items-center bg-black border-b border-neutral-800">
        <div className="flex-1 flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
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
            </button>
          ))}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowNewTabMenu(!showNewTabMenu)}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-950 transition-colors flex items-center gap-1"
          >
            <Plus size={20} />
            <ChevronDown size={14} />
          </button>
          
          {showNewTabMenu && (
            <div className="absolute right-0 top-full mt-1 bg-neutral-950 rounded shadow-lg py-1 z-10 max-h-96 overflow-y-auto">
              {EDITOR_TYPES.map(editor => (
                <button
                  key={editor.type}
                  onClick={() => addNewTab(editor.type)}
                  className="w-full px-4 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-700 transition-colors"
                >
                  {editor.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {tabs.map(tab => (
            <div
            key={tab.id}
            className={`absolute inset-0 transition-opacity ${
              activeTab === tab.id ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            >
            {tab.type === 'level' && <LevelEditor />}
            {tab.type === 'script' && <ScriptEditor />}
            {tab.type === 'blueprint' && <BPEdit />}
            {tab.type === 'material' && <MaterialEditor />}
            {tab.type === 'animation' && <AnimationEditor />}
            {tab.type === 'particle' && <ParticleSystem />}
            {tab.type === 'sound' && <SoundEditor />}
            {tab.type === 'ui' && <UIEditor />}
            {tab.type === 'terrain' && <TerrainEditor />}
            {tab.type === 'navmesh' && <NavMeshEditor />}
            {tab.type === 'physics' && <PhysicsDebug />}
            {tab.type === 'prefab' && <PrefabEditor />}
            </div>
        ))}
      </div>
    </div>
  );
};

export default EditorTabs;