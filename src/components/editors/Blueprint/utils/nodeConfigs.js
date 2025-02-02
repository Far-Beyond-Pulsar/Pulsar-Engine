// Node type configurations for Blueprint editor
export const NODE_CONFIGS = {
  // Variable Node Configuration
  Variable: {
    fields: {
      name: { 
        label: 'Variable Name', 
        type: 'text',
        description: 'Unique identifier for the variable'
      },
      type: { 
        label: 'Type', 
        type: 'select',
        options: ['int', 'float', 'bool', 'string'],
        description: 'Data type of the variable'
      },
      value: { 
        label: 'Initial Value', 
        type: 'text',
        description: 'Starting value for the variable'
      }
    },
    handles: {
      inputs: [],
      outputs: ['value:*']
    }
  },

  // Function Node Configuration
  Function: {
    fields: {
      name: { 
        label: 'Function Name', 
        type: 'text',
        description: 'Name of the function'
      },
      returnType: { 
        label: 'Return Type', 
        type: 'select',
        options: ['void', 'int', 'float', 'bool', 'string'],
        description: 'Return type of the function'
      }
    },
    handles: {
      inputs: ['params:*'],
      outputs: ['return:*']
    }
  },

  // If Statement Node Configuration
  'If Statement': {
    fields: {
      description: { 
        label: 'Condition Description', 
        type: 'text',
        description: 'Optional description of the condition'
      }
    },
    handles: {
      inputs: ['condition:bool'],
      outputs: ['true', 'false']
    }
  },

  // Comparison Nodes
  'Equals': {
    fields: {},
    handles: {
      inputs: ['A', 'B'],
      outputs: ['result:bool']
    }
  },

  'Greater Than': {
    fields: {},
    handles: {
      inputs: ['A:number', 'B:number'],
      outputs: ['result:bool']
    }
  },

  'Less Than': {
    fields: {},
    handles: {
      inputs: ['A:number', 'B:number'],
      outputs: ['result:bool']
    }
  },

  'Greater Than or Equal': {
    fields: {},
    handles: {
      inputs: ['A:number', 'B:number'],
      outputs: ['result:bool']
    }
  },

  'Less Than or Equal': {
    fields: {},
    handles: {
      inputs: ['A:number', 'B:number'],
      outputs: ['result:bool']
    }
  },

  // Logic Gates
  'AND Gate': {
    fields: {},
    handles: {
      inputs: ['A:bool', 'B:bool'],
      outputs: ['result:bool']
    }
  },

  'OR Gate': {
    fields: {},
    handles: {
      inputs: ['A:bool', 'B:bool'],
      outputs: ['result:bool']
    }
  },

  'NOT Gate': {
    fields: {},
    handles: {
      inputs: ['input:bool'],
      outputs: ['result:bool']
    }
  }
};