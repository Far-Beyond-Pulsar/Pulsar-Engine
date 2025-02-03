import React, { useEffect } from 'react';
import { ScrollArea } from '@/components/shared/ScrollArea';
import { Input } from '@/components/shared/Input';
import { Search } from 'lucide-react';
import { useNodeStore } from '../store/nodeStore';
import { useNodeEditor } from '../context/NodeEditorContext';

const NodeLibrary = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const definitions = useNodeStore(state => state.definitions);
  const loadDefinition = useNodeStore(state => state.loadDefinition);
  const { addNode } = useNodeEditor();

  // Load node definitions on mount
  useEffect(() => {
    const loadNodeDefinitions = async () => {
      try {
        const nodeFiles = [
          'arithmetic.yaml',
          'control_flow.yaml',
          'variables.yaml',
          'functions.yaml',
          'types.yaml'
        ];

        for (const file of nodeFiles) {
          const response = await fetch(`/nodes/${file}`);
          if (!response.ok) {
            throw new Error(`Failed to load ${file}`);
          }
          const content = await response.text();
          loadDefinition(content);
        }
      } catch (error) {
        console.error('Error loading node definitions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNodeDefinitions();
  }, [loadDefinition]);

  // Group nodes by category
  const nodesByCategory = React.useMemo(() => {
    const grouped = Object.values(definitions).reduce((acc, def) => {
      if (!acc[def.category]) {
        acc[def.category] = [];
      }
      if (def.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        acc[def.category].push(def);
      }
      return acc;
    }, {} as Record<string, typeof definitions[keyof typeof definitions][]>);

    // Sort categories and nodes within categories
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce((acc, [category, nodes]) => {
        acc[category] = nodes.sort((a, b) => a.name.localeCompare(b.name));
        return acc;
      }, {} as Record<string, typeof definitions[keyof typeof definitions][]>);
  }, [definitions, searchQuery]);

  // Handle node drag start
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading node definitions...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold mb-4">Node Library</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-gray-800 border-gray-700"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {Object.entries(nodesByCategory).map(([category, nodes]) => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-medium mb-2 text-gray-400">{category}</h3>
            <div className="space-y-2">
              {nodes.map((node) => (
                <div
                  key={node.name}
                  draggable
                  onDragStart={(e) => onDragStart(e, node.name)}
                  className="p-2 bg-gray-800 rounded-md cursor-move hover:bg-gray-700 transition-colors border border-gray-700 hover:border-blue-500"
                >
                  <div className="text-sm font-medium">{node.name}</div>
                  <div className="text-xs text-gray-400">{node.description}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default NodeLibrary;