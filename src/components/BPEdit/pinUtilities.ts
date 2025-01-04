// pinUtils.ts
export interface Pin {
    id: string;
    name: string;
    type: 'execution' | 'data';
    dataType?: string;
    direction: 'input' | 'output';
    color: string;
  }
  
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
  
  export function createPinsForNode(type: string, category: string): Pin[] {
    const pins: Pin[] = [];
  
    // Common execution pins
    const executionColor = '#FF6B6B';
    const dataColor = '#4ECDC4';
  
    switch (category) {
      case 'control_flow':
        if (type.includes('if_statement')) {
          pins.push(
            {
              id: 'exec_in',
              name: 'In',
              type: 'execution',
              direction: 'input',
              color: executionColor
            },
            {
              id: 'condition',
              name: 'Condition',
              type: 'data',
              dataType: 'bool',
              direction: 'input',
              color: dataColor
            },
            {
              id: 'then',
              name: 'Then',
              type: 'execution',
              direction: 'output',
              color: executionColor
            },
            {
              id: 'else',
              name: 'Else',
              type: 'execution',
              direction: 'output',
              color: executionColor
            }
          );
        } else if (type.includes('loop')) {
          pins.push(
            {
              id: 'exec_in',
              name: 'In',
              type: 'execution',
              direction: 'input',
              color: executionColor
            },
            {
              id: 'body',
              name: 'Loop Body',
              type: 'execution',
              direction: 'output',
              color: executionColor
            },
            {
              id: 'completed',
              name: 'Completed',
              type: 'execution',
              direction: 'output',
              color: executionColor
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
              color: executionColor
            },
            {
              id: 'value',
              name: 'Value',
              type: 'data',
              direction: 'input',
              color: dataColor
            },
            {
              id: 'exec_out',
              name: 'Out',
              type: 'execution',
              direction: 'output',
              color: executionColor
            },
            {
              id: 'var_out',
              name: 'Variable',
              type: 'data',
              direction: 'output',
              color: dataColor
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
            color: dataColor
          },
          {
            id: 'right',
            name: 'Right',
            type: 'data',
            direction: 'input',
            color: dataColor
          },
          {
            id: 'result',
            name: 'Result',
            type: 'data',
            direction: 'output',
            color: dataColor
          }
        );
        break;
  
      case 'functions':
        if (type.includes('function_def')) {
          pins.push(
            {
              id: 'exec_body',
              name: 'Body',
              type: 'execution',
              direction: 'output',
              color: executionColor
            },
            {
              id: 'return_value',
              name: 'Return',
              type: 'data',
              direction: 'input',
              color: dataColor
            }
          );
        } else if (type.includes('function_call')) {
          pins.push(
            {
              id: 'exec_in',
              name: 'In',
              type: 'execution',
              direction: 'input',
              color: executionColor
            },
            {
              id: 'exec_out',
              name: 'Out',
              type: 'execution',
              direction: 'output',
              color: executionColor
            },
            {
              id: 'params',
              name: 'Parameters',
              type: 'data',
              direction: 'input',
              color: dataColor
            },
            {
              id: 'return',
              name: 'Return Value',
              type: 'data',
              direction: 'output',
              color: dataColor
            }
          );
        }
        break;
  
      default:
        console.warn(`No pins defined for category: ${category}, type: ${type}`);
    }
  
    // Give unique colors to data pins if needed
    return pins.map(pin => ({
      ...pin,
      color: pin.color || generatePinColor()
    }));
  }