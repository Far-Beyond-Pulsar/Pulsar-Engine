import React from 'react';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Plus, FileJson, Code } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "./components/ui/DropdownMenu";
import { ReactNode } from 'react';
import { RUST_TYPES } from './constants';

interface TitleBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddNode: (typeKey: string, typeInfo: any) => void;
  onExport: () => void;
}

const TitleBar = ({ searchTerm, onSearchChange, onAddNode, onExport }: TitleBarProps) => {
  // Filter infrastructure types based on search
  const filteredTypes = Object.entries(RUST_TYPES).reduce((acc, [category, types]) => {
    const filtered = Object.entries(types).filter(([key, value]) =>
      value.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      value.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = Object.fromEntries(filtered);
    }
    return acc;
  }, {} as Record<string, any>);

  const handleNodeAdd = (typeKey: string, typeInfo: any) => {
    console.log('Adding node:', { typeKey, typeInfo });
    onAddNode(typeKey, typeInfo);
    onSearchChange('');
  };

  return (
    <div className="h-16 border-b border-neutral-800 flex items-center justify-between px-4 bg-black">
      <h1 className="text-xl font-semibold"> </h1>
      <div className="flex space-x-4">
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild></DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto bg-neutral-950 border-neutral-700">
            <div className="p-2 sticky top-0 bg-neutral-950 border-b border-neutral-700">
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-black border-neutral-700"
              />
            </div>
            {Object.entries(filteredTypes).map(([category, types]) => (
              <div key={category}>
                <div className="px-2 py-1 text-sm font-semibold bg-neutral-950 sticky top-14">
                  {category.toUpperCase()}
                </div>
                {Object.entries(types).map(([typeKey, typeInfo]) => (
                  <DropdownMenuItem
                    key={typeKey}
                    onSelect={() => handleNodeAdd(typeKey, typeInfo)}
                    className="flex flex-col items-start hover:bg-neutral-700"
                  >
                    <span className="font-medium">{typeInfo.name}</span>
                    <span className="text-xs text-neutral-400">{typeInfo.description}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator/>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu> */}

        <button
          onClick={onExport}
          className="flex items-center bg-blue-500 border-blue-950 hover:bg-blue-700"
        >
          <Code className="w-4 h-4 mr-2" />
          Export Rust
        </button>
      </div>
    </div>
  );
};

export default TitleBar;