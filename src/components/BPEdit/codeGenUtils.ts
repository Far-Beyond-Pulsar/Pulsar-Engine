import type { Node, Connection } from './constants';

interface Scope {
  variables: Map<string, string>;  // variable name -> rust type
  parent: Scope | null;
}

interface CodeBlock {
  code: string[];
  scope: Scope;
}

interface CodeGenContext {
  currentBlock: CodeBlock;
  blocks: Map<string, CodeBlock>;  // nodeId -> CodeBlock
  nodeOutputs: Map<string, string>;  // nodeId -> output variable name
  indentLevel: number;
}

function createScope(parent: Scope | null = null): Scope {
  return {
    variables: new Map(),
    parent
  };
}

function indent(level: number): string {
  return '    '.repeat(level);
}

function lookupVariable(scope: Scope, name: string): string | null {
  if (scope.variables.has(name)) {
    return scope.variables.get(name)!;
  }
  return scope.parent ? lookupVariable(scope.parent, name) : null;
}

function generateVariableDeclaration(node: Node, context: CodeGenContext): void {
  if (!node.config?.properties) {
    console.warn('Node is missing config or properties:', node);
    return;
  }

  const props = node.config.properties;
  const varType = props.type || 'i32'; // Default to i32 if type is not specified
  const varName = props.name || `var_${node.id}`; // Generate a default name if not specified
  const mutable = props.mutable ? 'mut ' : '';
  
  // Register variable in current scope
  context.currentBlock.scope.variables.set(varName, varType);
  
  // Generate declaration
  const declaration = `${indent(context.indentLevel)}let ${mutable}${varName}: ${varType}`;
  
  // Find input connections to get initialization value
  const incomingDataConn = Array.from(context.nodeOutputs.entries())
    .find(([nodeId, _]) => node.inputs?.includes(nodeId));
    
  if (incomingDataConn) {
    context.currentBlock.code.push(`${declaration} = ${incomingDataConn[1]};`);
  } else {
    // Default initialization based on type
    const defaultValue = getDefaultValue(varType);
    context.currentBlock.code.push(`${declaration} = ${defaultValue};`);
  }
}

function getDefaultValue(type: string | undefined): string {
  if (!type) return '0'; // Default to integer if type is undefined
  
  switch (type.trim()) {
    case 'i32':
    case 'i64':
    case 'u32':
    case 'u64':
      return '0';
    case 'f32':
    case 'f64':
      return '0.0';
    case 'bool':
      return 'false';
    case 'String':
      return 'String::new()';
    default:
      if (type.startsWith('Vec<')) {
        return 'vec![]';
      }
      return 'Default::default()';
  }
}

function generateFunctionDefinition(node: Node, context: CodeGenContext): void {
  const props = node.config.properties;
  const funcName = props.name;
  const returnType = props.return_type || '()';
  
  // Create new scope for function
  const functionScope = createScope(context.currentBlock.scope);
  const functionBlock: CodeBlock = {
    code: [],
    scope: functionScope
  };
  
  // Add function parameters
  const params = node.inputs
    ?.filter(input => input !== 'execution')
    .map(input => `${input}: ${lookupVariable(context.currentBlock.scope, input) || 'i32'}`)
    .join(', ') || '';
    
  context.currentBlock.code.push(
    `${indent(context.indentLevel)}fn ${funcName}(${params}) -> ${returnType} {`
  );
  
  // Store block for later use
  context.blocks.set(node.id, functionBlock);
  context.indentLevel++;
}

function generateOperatorExpression(node: Node, context: CodeGenContext): void {
  const props = node.config.properties;
  const operation = props.operation;
  
  // Get input values from incoming connections
  const inputs = node.inputs?.map(input => {
    const connectedOutput = Array.from(context.nodeOutputs.entries())
      .find(([nodeId, _]) => input.includes(nodeId));
    return connectedOutput ? connectedOutput[1] : 'undefined';
  }) || [];
  
  const [left, right] = inputs;
  let expression = '';
  
  switch (operation) {
    case 'add':
      expression = `${left} + ${right}`;
      break;
    case 'subtract':
      expression = `${left} - ${right}`;
      break;
    case 'multiply':
      expression = `${left} * ${right}`;
      break;
    case 'divide':
      expression = `${left} / ${right}`;
      break;
    case 'eq':
      expression = `${left} == ${right}`;
      break;
    case 'neq':
      expression = `${left} != ${right}`;
      break;
    case 'gt':
      expression = `${left} > ${right}`;
      break;
    case 'lt':
      expression = `${left} < ${right}`;
      break;
  }
  
  // Store the result in a temp variable
  const resultVar = `temp_${node.id}`;
  context.currentBlock.code.push(
    `${indent(context.indentLevel)}let ${resultVar} = ${expression};`
  );
  context.nodeOutputs.set(node.id, resultVar);
}

function generateIfStatement(node: Node, context: CodeGenContext): void {
  const props = node.config.properties;
  const condition = props.condition;
  
  // Create scopes for true and false branches
  const trueScope = createScope(context.currentBlock.scope);
  const falseScope = createScope(context.currentBlock.scope);
  
  context.currentBlock.code.push(
    `${indent(context.indentLevel)}if ${condition} {`
  );
  
  // Store blocks for branch processing
  context.blocks.set(`${node.id}_true`, { code: [], scope: trueScope });
  context.blocks.set(`${node.id}_false`, { code: [], scope: falseScope });
  
  context.indentLevel++;
}

function generateLoopStatement(node: Node, context: CodeGenContext): void {
  const props = node.config.properties;
  const breakCondition = props.break_condition;
  
  context.currentBlock.code.push(`${indent(context.indentLevel)}loop {`);
  
  if (breakCondition) {
    context.indentLevel++;
    context.currentBlock.code.push(
      `${indent(context.indentLevel)}if ${breakCondition} { break; }`
    );
    context.indentLevel--;
  }
  
  // Create scope for loop body
  const loopScope = createScope(context.currentBlock.scope);
  context.blocks.set(`${node.id}_body`, { code: [], scope: loopScope });
  
  context.indentLevel++;
}

export function generateRustCode(nodes: Node[], connections: Connection[]): string {
  const context: CodeGenContext = {
    currentBlock: {
      code: [],
      scope: createScope()
    },
    blocks: new Map(),
    nodeOutputs: new Map(),
    indentLevel: 0
  };
  
  // Add necessary imports/prelude
  let code = "// Generated Rust Code\n";
  code += "use std::io;\n\n";
  
  // Process nodes in topological order
  const sortedNodes = sortNodesTopologically(nodes, connections);
  
  for (const node of sortedNodes) {
    switch (node.config.category) {
      case 'variables':
        generateVariableDeclaration(node, context);
        break;
        
      case 'functions':
        generateFunctionDefinition(node, context);
        break;
        
      case 'control_flow':
        if (node.type.includes('if_statement')) {
          generateIfStatement(node, context);
        } else if (node.type.includes('loop')) {
          generateLoopStatement(node, context);
        }
        break;
        
      case 'operators':
        generateOperatorExpression(node, context);
        break;
    }
  }
  
  // Combine all code blocks
  code += context.currentBlock.code.join('\n');
  
  // Add any nested blocks
  for (const block of context.blocks.values()) {
    code += '\n' + block.code.join('\n');
  }
  
  // Close any open blocks
  while (context.indentLevel > 0) {
    context.indentLevel--;
    code += `\n${indent(context.indentLevel)}}`;
  }
  
  return code;
}

function sortNodesTopologically(nodes: Node[], connections: Connection[]): Node[] {
  const visited = new Set<string>();
  const sorted: Node[] = [];
  
  function visit(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    
    // Visit all dependencies first
    const deps = connections
      .filter(conn => conn.toNode === nodeId)
      .map(conn => conn.fromNode);
      
    for (const dep of deps) {
      visit(dep);
    }
    
    const node = nodes.find(n => n.id === nodeId);
    if (node) sorted.push(node);
  }
  
  // Start with nodes that have no outgoing connections
  const startNodes = nodes.filter(node =>
    !connections.some(conn => conn.fromNode === node.id)
  );
  
  for (const node of startNodes) {
    visit(node.id);
  }
  
  return sorted.reverse();
}