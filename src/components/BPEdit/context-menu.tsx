export const items = (nodeTypes = [], addNodeCallback = async () => {}) => {
    return async (context) => {
      // Ensure context exists
      if (!context) return [];
  
      // Define the core list of items
      return [
        {
          label: 'Input Node',
          key: 'input-node',
          handler: () => {
            const inputNode = {
              label: 'Input Node',
              inputs: {},
              outputs: {
                output: { label: 'Output' }
              },
              clone: function(deep) {
                return deep ? { ...this } : this;
              }
            };
  
            // Call the add node callback directly
            return addNodeCallback(inputNode);
          }
        },
        {
          label: 'Process Node',
          key: 'process-node',
          handler: () => {
            const processNode = {
              label: 'Process Node',
              inputs: {
                input1: { label: 'Input 1' },
                input2: { label: 'Input 2' }
              },
              outputs: {
                output: { label: 'Output' }
              },
              clone: function(deep) {
                return deep ? { ...this } : this;
              }
            };
  
            // Call the add node callback directly
            return addNodeCallback(processNode);
          }
        },
        {
          label: 'Output Node',
          key: 'output-node',
          handler: () => {
            const outputNode = {
              label: 'Output Node',
              inputs: {
                input: { label: 'Input' }
              },
              outputs: {},
              clone: function(deep) {
                return deep ? { ...this } : this;
              }
            };
  
            // Call the add node callback directly
            return addNodeCallback(outputNode);
          }
        }
      ];
    };
  };