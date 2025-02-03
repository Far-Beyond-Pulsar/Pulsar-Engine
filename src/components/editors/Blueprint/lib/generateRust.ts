import { Node, Edge } from 'reactflow';

function generateRustCode(nodes: Node[], edges: Edge[]): string {
  // Sort nodes based on dependencies
  const sortedNodes = topologicalSort(nodes, edges);
  
  let code = "// Generated Rust Code\n\n";
  
  // Generate variable declarations and node logic
  sortedNodes.forEach((node) => {
    const def = node.data.nodeDefinition;
    const fields = node.data.fields;
    
    // Use the template from node definition
    let nodeCode = def.template;
    
    // Replace field placeholders
    Object.entries(fields).forEach(([key, value]) => {
      nodeCode = nodeCode.replace(`{{${key}}}`, String(value));
    });
    
    // Replace input placeholders with actual connected node outputs
    def.pins.inputs?.forEach((input: { name: string | null | undefined; }) => {
      const incomingEdge = edges.find(
        (edge) => edge.target === node.id && edge.targetHandle === input.name
      );
      if (incomingEdge) {
        const sourceNode = nodes.find((n) => n.id === incomingEdge.source);
        if (sourceNode) {
          nodeCode = nodeCode.replace(
            `{{${input.name}}}`,
            `${sourceNode.id}_output`
          );
        }
      }
    });
    
    // Add variable declaration for node output
    if (def.pins.outputs?.length) {
      nodeCode = `let ${node.id}_output = ${nodeCode};\n`;
    }
    
    code += nodeCode + "\n";
  });
  
  return code;
}

// Helper function for topological sort
function topologicalSort(nodes: Node[], edges: Edge[]): Node[] {
  const graph = new Map<string, Set<string>>();
  const inDegree = new Map<string, number>();
  
  // Initialize graphs
  nodes.forEach((node) => {
    graph.set(node.id, new Set());
    inDegree.set(node.id, 0);
  });
  
  // Build dependency graph
  edges.forEach((edge) => {
    graph.get(edge.source)?.add(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });
  
  // Find nodes with no dependencies
  const queue = nodes
    .filter((node) => (inDegree.get(node.id) || 0) === 0)
    .map((node) => node.id);
  
  const result: Node[] = [];
  
  // Process queue
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      result.push(node);
      
      // Update dependencies
      graph.get(nodeId)?.forEach((dependent) => {
        inDegree.set(dependent, (inDegree.get(dependent) || 0) - 1);
        if (inDegree.get(dependent) === 0) {
          queue.push(dependent);
        }
      });
    }
  }
  
  return result;
}

export { generateRustCode };