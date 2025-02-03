#!/bin/bash

# Create nodes directory if it doesn't exist
mkdir -p src/nodes

# Generate Basic Rust Node Types
cat > src/nodes/arithmetic.yaml << 'EOL'
---
name: AddNode
category: Arithmetic
description: Add two numbers together
fields:
  comment:
    type: string
    label: Comment
    description: Optional comment for this operation
    required: false
pins:
  inputs:
    - name: a
      type: number
      description: First number to add
    - name: b
      type: number
      description: Second number to add
  outputs:
    - name: sum
      type: number
      description: Result of a + b
template: |
  // {{comment}}
  {{a}} + {{b}}
---
name: SubtractNode
category: Arithmetic
description: Subtract two numbers
fields:
  comment:
    type: string
    label: Comment
    description: Optional comment for this operation
    required: false
pins:
  inputs:
    - name: a
      type: number
      description: Number to subtract from
    - name: b
      type: number
      description: Number to subtract
  outputs:
    - name: difference
      type: number
      description: Result of a - b
template: |
  // {{comment}}
  {{a}} - {{b}}
EOL

# Generate Control Flow Nodes
cat > src/nodes/control_flow.yaml << 'EOL'
---
name: IfNode
category: ControlFlow
description: Conditional branching
fields:
  condition:
    type: string
    label: Condition
    description: The condition to evaluate
    required: true
pins:
  inputs:
    - name: condition
      type: bool
      description: Boolean condition
    - name: then_value
      type: any
      description: Value if condition is true
    - name: else_value
      type: any
      description: Value if condition is false
  outputs:
    - name: result
      type: any
      description: Selected value based on condition
template: |
  if {{condition}} { {{then_value}} } else { {{else_value}} }
---
name: LoopNode
category: ControlFlow
description: Loop over a range
fields:
  count:
    type: number
    label: Count
    description: Number of iterations
    required: true
    validation:
      min: 1
      max: 1000
pins:
  inputs:
    - name: body
      type: any
      description: Code to execute in loop
  outputs:
    - name: result
      type: array
      description: Array of results
template: |
  (0..{{count}}).map(|_| { {{body}} }).collect::<Vec<_>>()
EOL

# Generate Variable Nodes
cat > src/nodes/variables.yaml << 'EOL'
---
name: LetNode
category: Variables
description: Declare a variable
fields:
  name:
    type: string
    label: Variable Name
    description: Name of the variable
    required: true
    validation:
      pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$"
  mutable:
    type: boolean
    label: Mutable
    description: Whether the variable can be modified
    default: false
pins:
  inputs:
    - name: value
      type: any
      description: Value to assign
  outputs:
    - name: variable
      type: any
      description: The declared variable
template: |
  let {{#if mutable}}mut {{/if}}{{name}} = {{value}}
---
name: AssignNode
category: Variables
description: Assign a value to a variable
fields:
  variable:
    type: string
    label: Variable Name
    description: Name of the variable to assign to
    required: true
pins:
  inputs:
    - name: value
      type: any
      description: Value to assign
template: |
  {{variable}} = {{value}}
EOL

# Generate Function Nodes
cat > src/nodes/functions.yaml << 'EOL'
---
name: FunctionNode
category: Functions
description: Define a function
fields:
  name:
    type: string
    label: Function Name
    description: Name of the function
    required: true
    validation:
      pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$"
  params:
    type: string
    label: Parameters
    description: Function parameters (comma-separated)
    required: false
  return_type:
    type: string
    label: Return Type
    description: Function return type
    required: true
pins:
  inputs:
    - name: body
      type: any
      description: Function body
  outputs:
    - name: function
      type: function
      description: The defined function
template: |
  fn {{name}}({{params}}) -> {{return_type}} {
      {{body}}
  }
EOL

# Generate Type Nodes
cat > src/nodes/types.yaml << 'EOL'
---
name: StructNode
category: Types
description: Define a struct
fields:
  name:
    type: string
    label: Struct Name
    description: Name of the struct
    required: true
    validation:
      pattern: "^[A-Z][a-zA-Z0-9_]*$"
  fields:
    type: string
    label: Fields
    description: Struct fields (field: type format, one per line)
    required: true
template: |
  struct {{name}} {
      {{fields}}
  }
---
name: EnumNode
category: Types
description: Define an enum
fields:
  name:
    type: string
    label: Enum Name
    description: Name of the enum
    required: true
    validation:
      pattern: "^[A-Z][a-zA-Z0-9_]*$"
  variants:
    type: string
    label: Variants
    description: Enum variants (one per line)
    required: true
template: |
  enum {{name}} {
      {{variants}}
  }
EOL

# Make the script executable
chmod +x generate-nodes.sh

echo "Node definitions have been generated in src/nodes/"
ls -l src/nodes/