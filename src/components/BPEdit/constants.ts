export interface PropertyDefinition {
  type: 'string' | 'number' | 'boolean' | 'select' | 'rust_type';
  label: string;
  description?: string;
  required?: boolean;
  default?: any;
  options?: Array<{value: string; label: string}>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export const RUST_TYPES = {
  control_flow: {
    if_statement: {
      name: 'If Statement',
      category: 'control_flow',
      description: 'Conditional branching',
      properties: {
        condition: {
          type: 'string',
          label: 'Condition',
          description: 'Boolean expression',
          required: true,
        }
      },
      inputs: ['execution', 'condition'],
      outputs: ['true_branch', 'false_branch']
    },
    loop: {
      name: 'Loop',
      category: 'control_flow',
      description: 'Infinite loop with break condition',
      properties: {
        break_condition: {
          type: 'string',
          label: 'Break Condition',
          description: 'Expression that breaks the loop when true',
          required: false,
        }
      },
      inputs: ['execution'],
      outputs: ['body', 'after_loop']
    }
  },
  variables: {
    let_declaration: {
      name: 'Let Declaration',
      category: 'variables',
      description: 'Variable declaration',
      properties: {
        name: {
          type: 'string',
          label: 'Variable Name',
          required: true,
        },
        type: {
          type: 'rust_type',
          label: 'Type',
          required: true,
          options: [
            { value: 'i32', label: 'i32 (32-bit integer)' },
            { value: 'f64', label: 'f64 (64-bit float)' },
            { value: 'String', label: 'String' },
            { value: 'bool', label: 'bool' },
            { value: 'Vec<T>', label: 'Vec (Vector)' }
          ]
        },
        mutable: {
          type: 'boolean',
          label: 'Mutable',
          default: false
        }
      },
      inputs: ['execution', 'value'],
      outputs: ['execution']
    },
    assignment: {
      name: 'Assignment',
      category: 'variables',
      description: 'Assign value to variable',
      properties: {
        target: {
          type: 'string',
          label: 'Target Variable',
          required: true,
        }
      },
      inputs: ['execution', 'value'],
      outputs: ['execution']
    }
  },
  functions: {
    function_def: {
      name: 'Function Definition',
      category: 'functions',
      description: 'Define a new function',
      properties: {
        name: {
          type: 'string',
          label: 'Function Name',
          required: true,
        },
        return_type: {
          type: 'rust_type',
          label: 'Return Type',
          required: true,
          options: [
            { value: '()', label: 'Unit (no return)' },
            { value: 'i32', label: 'i32' },
            { value: 'String', label: 'String' },
            { value: 'bool', label: 'bool' }
          ]
        }
      },
      inputs: [],
      outputs: ['body']
    },
    function_call: {
      name: 'Function Call',
      category: 'functions',
      description: 'Call a function',
      properties: {
        function_name: {
          type: 'string',
          label: 'Function Name',
          required: true,
        }
      },
      inputs: ['execution', 'arguments'],
      outputs: ['execution', 'return_value']
    }
  },
  operators: {
    arithmetic: {
      name: 'Arithmetic',
      category: 'operators',
      description: 'Basic arithmetic operations',
      properties: {
        operation: {
          type: 'select',
          label: 'Operation',
          required: true,
          options: [
            { value: 'add', label: 'Add (+)' },
            { value: 'subtract', label: 'Subtract (-)' },
            { value: 'multiply', label: 'Multiply (*)' },
            { value: 'divide', label: 'Divide (/)' }
          ]
        }
      },
      inputs: ['left', 'right'],
      outputs: ['result']
    },
    comparison: {
      name: 'Comparison',
      category: 'operators',
      description: 'Comparison operations',
      properties: {
        operation: {
          type: 'select',
          label: 'Operation',
          required: true,
          options: [
            { value: 'eq', label: 'Equals (==)' },
            { value: 'neq', label: 'Not Equals (!=)' },
            { value: 'gt', label: 'Greater Than (>)' },
            { value: 'lt', label: 'Less Than (<)' },
            { value: 'gte', label: 'Greater Than or Equal (>=)' },
            { value: 'lte', label: 'Less Than or Equal (<=)' }
          ]
        }
      },
      inputs: ['left', 'right'],
      outputs: ['result']
    }
  }
};

export interface Connection {
  id: string;
  fromNode: string;
  toNode: string;
  fromPoint: Point;
  toPoint: Point;
  type: 'execution' | 'data';
  dataType?: string;  // For data connections, specifies the Rust type
}

export interface Point {
  x: number;
  y: number;
}

export interface Node {
  id: string;
  type: string;
  name: string;
  position: Point;
  config: {
    type: string;
    category: string;
    properties: Record<string, any>;
  };
  inputs?: string[];
  outputs?: string[];
}