import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/Tabs';
import { Card, CardContent } from '@/components/shared/Card';
import { Input } from '@/components/shared/Input';
import { Label } from '@/components/shared/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shared/Select';
import { Button } from '@/components/shared/Button';
import { Alert, AlertDescription } from '@/components/shared/Alert';
import Editor from '@monaco-editor/react';
import { useNodeEditor } from '../context/NodeEditorContext';
import { ScrollArea } from '@/components/shared/ScrollArea';
import { Trash2, Copy, Info } from 'lucide-react';

const PropertiesPanel = () => {
  const { 
    selectedNode, 
    updateNode, 
    deleteNode, 
    duplicateNode, 
    generateCode,
    validationErrors 
  } = useNodeEditor();

  // Handle field updates
  const handleFieldUpdate = (fieldName: string, value: string) => {
    if (!selectedNode) return;

    const updatedFields = {
      ...selectedNode.data.fields,
      [fieldName]: value,
    };

    updateNode(selectedNode.id, {
      ...selectedNode.data,
      fields: updatedFields,
    });
  };

  return (
    <Tabs defaultValue="properties" className="h-full">
      <div className="p-4 border-b border-gray-800">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="code">Generated Code</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>
      </div>

      <div className="p-4 h-[calc(100%-64px)]">
        <TabsContent value="properties" className="h-full mt-0">
          <ScrollArea className="h-full">
            <Card url={''} title={''} description={''}>
              <CardContent className="pt-6">
                {selectedNode ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        {selectedNode.data.nodeDefinition.name}
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => duplicateNode(selectedNode.id)}
                          title="Duplicate node"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteNode(selectedNode.id)}
                          title="Delete node"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Node Description */}
                    <div className="bg-gray-800 rounded-md p-3 flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-300">
                        {selectedNode.data.nodeDefinition.description}
                      </p>
                    </div>
                    
                    {/* Node Fields */}
                    <div className="space-y-4">
                      {Object.entries(selectedNode.data.nodeDefinition.fields).map(([fieldName, field]) => (
                        <div key={fieldName} className="space-y-2">
                          <Label htmlFor={fieldName}>{field.label}</Label>
                          
                          {field.type === 'select' ? (
                            <Select
                              value={selectedNode.data.fields[fieldName]}
                              onValueChange={(value) => handleFieldUpdate(fieldName, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={`Select ${field.label}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : field.type === 'multiline' ? (
                            <textarea
                              className="w-full min-h-[100px] rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
                              value={selectedNode.data.fields[fieldName] || ''}
                              onChange={(e) => handleFieldUpdate(fieldName, e.target.value)}
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                            />
                          ) : (
                            <Input
                              id={fieldName}
                              type={field.type}
                              value={selectedNode.data.fields[fieldName] || ''}
                              onChange={(e) => handleFieldUpdate(fieldName, e.target.value)}
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                            />
                          )}
                          
                          {field.description && (
                            <p className="text-xs text-gray-400">{field.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Pin Information */}
                    <div className="space-y-4 mt-6">
                      <h4 className="text-sm font-semibold text-gray-400">Input Pins</h4>
                      {selectedNode.data.nodeDefinition.pins.inputs?.map((pin) => (
                        <div key={pin.name} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-white">{pin.name}</span>
                          <span className="text-gray-400">({pin.type})</span>
                          {pin.description && (
                            <span className="text-gray-500 text-xs">- {pin.description}</span>
                          )}
                        </div>
                      ))}
                      
                      <h4 className="text-sm font-semibold text-gray-400">Output Pins</h4>
                      {selectedNode.data.nodeDefinition.pins.outputs?.map((pin) => (
                        <div key={pin.name} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-white">{pin.name}</span>
                          <span className="text-gray-400">({pin.type})</span>
                          {pin.description && (
                            <span className="text-gray-500 text-xs">- {pin.description}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    Select a node to view properties
                  </div>
                )}
              </CardContent>
            </Card>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="code" className="h-full mt-0">
          <Card className="h-full">
            <CardContent className="p-0">
              <Editor
                height="100%"
                defaultLanguage="rust"
                theme="vs-dark"
                value={generateCode()}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              {validationErrors.length > 0 ? (
                <div className="space-y-4">
                  {validationErrors.map((error, index) => (
                    <div key={index}>
                      {error.message}
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="text-green-500">
                  No validation errors found
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default PropertiesPanel;