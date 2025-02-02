import { Node, Edge } from 'reactflow';
import { NODE_CONFIGS } from './nodeConfigs';

// Types for code generation
interface NodeConnections {
    [nodeId: string]: Edge[];
}

// Code generation utility class
export class CodeGenerator {
    private nodes: Node[];
    private edges: Edge[];
    private nodeConnections: NodeConnections;
    private incomingConnections: NodeConnections;

    constructor(nodes: Node[], edges: Edge[]) {
        this.nodes = nodes;
        this.edges = edges;
        this.nodeConnections = this.createNodeConnectionMap(edges);
        this.incomingConnections = this.createIncomingConnectionMap(edges);
    }

    // Create a map of nodes to their outgoing connections
    private createNodeConnectionMap(edges: Edge[]): NodeConnections {
        return edges.reduce((acc, edge) => {
            if (!acc[edge.source]) acc[edge.source] = [];
            acc[edge.source].push(edge);
            return acc;
        }, {} as NodeConnections);
    }

    // Create a map of nodes to their incoming connections
    private createIncomingConnectionMap(edges: Edge[]): NodeConnections {
        return edges.reduce((acc, edge) => {
            if (!acc[edge.target]) acc[edge.target] = [];
            acc[edge.target].push(edge);
            return acc;
        }, {} as NodeConnections);
    }

    // Get the input source for a specific node handle
    private getInputSource(nodeId: string, handleId: string): string {
        const incoming = this.incomingConnections[nodeId] || [];
        const connection = incoming.find(edge => edge.targetHandle === handleId);
        if (!connection) return 'false'; // Default for unconnected boolean inputs

        const sourceNode = this.nodes.find(n => n.id === connection.source);
        if (!sourceNode) return 'false';

        switch (sourceNode.data.label) {
            case 'Equals':
                const aSource = this.getInputSource(sourceNode.id, 'A');
                const bSource = this.getInputSource(sourceNode.id, 'B');
                return `(${aSource} == ${bSource})`;
            case 'Variable':
                return sourceNode.data.fields.name || 'undefined_var';
            case 'AND Gate':
                return `(${this.getInputSource(sourceNode.id, 'A:bool')} && ${this.getInputSource(sourceNode.id, 'B:bool')})`;
            case 'OR Gate':
                return `(${this.getInputSource(sourceNode.id, 'A:bool')} || ${this.getInputSource(sourceNode.id, 'B:bool')})`;
            case 'NOT Gate':
                return `!${this.getInputSource(sourceNode.id, 'input:bool')}`;
            case 'Greater Than':
                return `(${this.getInputSource(sourceNode.id, 'A:number')} > ${this.getInputSource(sourceNode.id, 'B:number')})`;
            case 'Less Than':
                return `(${this.getInputSource(sourceNode.id, 'A:number')} < ${this.getInputSource(sourceNode.id, 'B:number')})`;
            case 'Greater Than or Equal':
                return `(${this.getInputSource(sourceNode.id, 'A:number')} >= ${this.getInputSource(sourceNode.id, 'B:number')})`;
            case 'Less Than or Equal':
                return `(${this.getInputSource(sourceNode.id, 'A:number')} <= ${this.getInputSource(sourceNode.id, 'B:number')})`;
            default:
                return 'false';
        }
    }

    // Process a single node and its connections
    private processNode(
        node: Node,
        indent: string = '',
        processed: Set<string> = new Set<string>()
    ): string {
        if (processed.has(node.id)) return '';
        processed.add(node.id);

        let nodeCode = '';
        const connections = this.nodeConnections[node.id] || [];

        switch (node.data.label) {
            case 'Variable':
                nodeCode = `${indent}let mut ${node.data.fields.name}: ${node.data.fields.type} = ${node.data.fields.value || 'Default::default()'};\n`;
                break;

            case 'Function':
                nodeCode = `${indent}fn ${node.data.fields.name}() -> ${node.data.fields.returnType} {\n`;
                // Process function body (connected nodes)
                connections.forEach(conn => {
                    const targetNode = this.nodes.find(n => n.id === conn.target);
                    if (targetNode) {
                        nodeCode += this.processNode(targetNode, indent + '    ', processed);
                    }
                });
                nodeCode += `${indent}}\n`;
                break;

            case 'If Statement':
                const condition = this.getInputSource(node.id, 'condition:bool');
                nodeCode += `${indent}if ${condition} {\n`;

                // Process true branch
                const trueConnections = connections.filter(conn => conn.sourceHandle === 'true');
                trueConnections.forEach(conn => {
                    const targetNode = this.nodes.find(n => n.id === conn.target);
                    if (targetNode) {
                        nodeCode += this.processNode(targetNode, indent + '    ', processed);
                    }
                });

                nodeCode += `${indent}} else {\n`;

                // Process false branch
                const falseConnections = connections.filter(conn => conn.sourceHandle === 'false');
                falseConnections.forEach(conn => {
                    const targetNode = this.nodes.find(n => n.id === conn.target);
                    if (targetNode) {
                        nodeCode += this.processNode(targetNode, indent + '    ', processed);
                    }
                });

                nodeCode += `${indent}}\n`;
                break;
        }

        return nodeCode;
    }
}