// types.ts
export interface Pin {
    id: string;
    name: string;
    type: 'execution' | 'data';
    dataType?: string; // For data pins: 'i32', 'String', etc.
    direction: 'input' | 'output';
    color?: string;
  }
  
  export interface NodeWithPins extends Node {
    pins: Pin[];
  }
  
  // Helper function to generate a random color for pins
  export function generatePinColor(): string {
    const colors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#45B7D1', // Blue
      '#96CEB4', // Green
      '#FFEEAD', // Yellow
      '#D4A5A5', // Pink
      '#9B59B6', // Purple
      '#3498DB', // Light Blue
      '#E67E22', // Orange
      '#2ECC71'  // Emerald
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // Helper to create pins for different node types
  export function createPinsForNode(type: string, category: string): Pin[] {
    const pins: Pin[] = [];
    
    switch (category) {
      case 'control_flow':
        if (type.includes('if_statement')) {
          pins.push(
            {
              id: 'exec_in',
              name: 'In',
              type: 'execution',
              direction: 'input',
              color: '#FF6B6B'
            },
            {
              id: 'condition',
              name: 'Condition',
              type: 'data',
              dataType: 'bool',
              direction: 'input',
              color: '#4ECDC4'
            },
            {
              id: 'then',
              name: 'Then',
              type: 'execution',
              direction: 'output',
              color: '#FF6B6B'
            },
            {
              id: 'else',
              name: 'Else',
              type: 'execution',
              direction: 'output',
              color: '#FF6B6B'
            }
          );
        }
        break;
        
      case 'variables':
        if (type.includes('let_declaration')) {
          pins.push(
            {
              id: 'exec_in',
              name: 'In',
              type: 'execution',
              direction: 'input',
              color: '#FF6B6B'
            },
            {
              id: 'value',
              name: 'Value',
              type: 'data',
              direction: 'input',
              color: '#4ECDC4'
            },
            {
              id: 'exec_out',
              name: 'Out',
              type: 'execution',
              direction: 'output',
              color: '#FF6B6B'
            },
            {
              id: 'var_out',
              name: 'Variable',
              type: 'data',
              direction: 'output',
              color: '#4ECDC4'
            }
          );
        }
        break;
        
      case 'operators':
        pins.push(
          {
            id: 'left',
            name: 'Left',
            type: 'data',
            direction: 'input',
            color: '#45B7D1'
          },
          {
            id: 'right',
            name: 'Right',
            type: 'data',
            direction: 'input',
            color: '#45B7D1'
          },
          {
            id: 'result',
            name: 'Result',
            type: 'data',
            direction: 'output',
            color: '#45B7D1'
          }
        );
        break;
    }
    
    // Ensure each pin has a unique color
    return pins.map(pin => ({
      ...pin,
      color: pin.color || generatePinColor()
    }));
  }