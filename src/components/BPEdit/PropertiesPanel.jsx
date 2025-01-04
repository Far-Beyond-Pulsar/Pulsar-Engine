import React from 'react';
import { Input } from './components/ui/Input';
import { Switch } from './components/ui/Switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/Select';
import { RUST_TYPES } from './constants';


const PropertiesPanel = ({ selectedNode, onUpdateNode }) => {
  if (!selectedNode) {
    return (
      <div className="w-80 border-l border-neutral-800 bg-neutral-900">
        <div className="p-4 text-neutral-500 text-center">
          Select a resource to view its properties
        </div>
      </div>
    );
  }

  const resourceType = RUST_TYPES[selectedNode.config.category][selectedNode.type];
  const properties = resourceType.properties || {};

  const renderPropertyInput = (key, property) => {
    const value = selectedNode.config.properties[key] ?? property.default;
    const updateProperty = (newValue) => {
      onUpdateNode(selectedNode.id, {
        config: {
          ...selectedNode.config,
          properties: {
            ...selectedNode.config.properties,
            [key]: newValue
          }
        }
      });
    };

    switch (property.type) {
      case 'string':
        return (
          <Input
            value={value || ''}
            onChange={(e) => updateProperty(e.target.value)}
            className="bg-neutral-800 border-neutral-700 text-neutral-100"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => updateProperty(Number(e.target.value))}
            min={property.validation?.min}
            max={property.validation?.max}
            className="bg-neutral-800 border-neutral-700 text-neutral-100"
          />
        );

      case 'boolean':
        return (
          <Switch
            checked={value || false}
            onCheckedChange={updateProperty}
          />
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={updateProperty}
          >
            <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-100">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {property.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-80 border-l border-neutral-800 bg-neutral-900">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Resource Properties</h2>
        <div className="space-y-4">
          {/* Basic Properties */}
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-300">Name</label>
            <Input 
              value={selectedNode.name}
              onChange={(e) => {
                onUpdateNode(selectedNode.id, { name: e.target.value });
              }}
              className="bg-neutral-800 border-neutral-700 text-neutral-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-300">Type</label>
            <Input 
              value={resourceType.name}
              disabled
              className="bg-neutral-800 border-neutral-700 text-neutral-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-300">Category</label>
            <Input 
              value={selectedNode.config.category}
              disabled
              className="bg-neutral-800 border-neutral-700 text-neutral-400"
            />
          </div>

          {/* Resource-specific Properties */}
          {Object.entries(properties).map(([key, property]) => (
            <div key={key}>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-neutral-300">
                  {property.label}
                  {property.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              </div>
              {property.description && (
                <p className="text-xs text-neutral-500 mb-1">{property.description}</p>
              )}
              {renderPropertyInput(key, property)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;