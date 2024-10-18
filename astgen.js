export { AstGenerator };

import {
  ValueNode,
} from "./parser.js";

class AstGenerator {
  dotStrings;
  nodeCount;

  constructor() {
    this.dotStrings = [];
    this.nodeCount = 0;
  }

  newNodeName() {
    this.nodeCount += 1;
    return `node${this.nodeCount}`;
  }

  generate(nodes) {
    this.dotStrings.push("digraph Ast {")
    let statements = [];
    for (let node of nodes) {
      statements.push(node.visit(this));
    }
    if (statements.length > 1) {
      this.dotStrings.push(`{ rank=same; ${statements.join(";")} }`);
    }
    for (let i = 1; i < statements.length; i++) {
      this.dotStrings.push(`${statements[i - 1]} -> ${statements[i]}`);
    }
    this.dotStrings.push("}");
  }

  visitAssignmentNode(node) {
    const name = this.newNodeName();
    const lhsNode = node.lhs.visit(this);
    const rhsNode = node.rhs.visit(this);
    this.dotStrings.push(`${name}[label="="]`);
    this.dotStrings.push(`${name} -> ${lhsNode}`);
    this.dotStrings.push(`${name} -> ${rhsNode}`);
    return name;
  }

  visitBinaryOperationNode(node) {
    const name = this.newNodeName();
    const lhsNode = node.lhs.visit(this);
    const rhsNode = node.rhs.visit(this);
    this.dotStrings.push(`${name}[label="~="]`);
    this.dotStrings.push(`${name} -> ${lhsNode}`);
    this.dotStrings.push(`${name} -> ${rhsNode}`);
    return name;
  }

  visitCallNode(node) {
    const name = this.newNodeName();
    let args = [];
    for (const arg of node.args) {
      args.push(arg.visit(this));
    }
    if (node.self) {
      this.dotStrings.push(`${name}[label="${node.self}.${node.fun}()"]`);
    } else {
      this.dotStrings.push(`${name}[label="${node.fun}()"]`);
    }
    for (const arg of args) {
      this.dotStrings.push(`${name} -> ${arg}`);
    }
    return name;
  }

  visitIfThenNode(node) {
    const name = this.newNodeName();
    const conditionNode = node.condition.visit(this);
    const bodyNode = node.body.visit(this);
    this.dotStrings.push(`${name}[label="if"]`);
    this.dotStrings.push(`${name} -> ${conditionNode}`);
    this.dotStrings.push(`${name} -> ${bodyNode}`);
    return name;
  }

  visitIndexNode(node) {
    const name = this.newNodeName();
    const indexNode = node.index.visit(this);
    this.dotStrings.push(`${name}[label="${node.identifier}[]"]`);
    this.dotStrings.push(`${name} -> ${indexNode}`);
    return name;
  }

  visitForLoopNode(node) {
    const name = this.newNodeName();
    const initializerNode = node.initializer.visit(this);
    const rangeNode = node.range.visit(this);
    let bodyNodes = [];
    for (const statement of node.body) {
      bodyNodes.push(statement.visit(this));
    }
    this.dotStrings.push(`${name}[label="for"]`);
    this.dotStrings.push(`${name} -> ${initializerNode}`);
    this.dotStrings.push(`${name} -> ${rangeNode}`);
    if (bodyNodes.length > 1) {
      this.dotStrings.push(`{ rank=same; ${bodyNodes.join(";")} }`);
    }
    this.dotStrings.push(`${name} -> ${bodyNodes[0]}`);
    for (let i = 1; i < bodyNodes.length; i++) {
      this.dotStrings.push(`${bodyNodes[i - 1]} -> ${bodyNodes[i]}`);
    }
    return name;
  }

  visitFunctionNode(node) {
    const name = this.newNodeName();
    let bodyNodes = [];
    for (const statement of node.body) {
      bodyNodes.push(statement.visit(this));
    }
    this.dotStrings.push(`${name}[label="function ${node.name}(${node.parameters.join(",")})"]`);
    if (bodyNodes.length > 1) {
      this.dotStrings.push(`{ rank=same; ${bodyNodes.join(";")} }`);
    }
    this.dotStrings.push(`${name} -> ${bodyNodes[0]}`);
    for (let i = 1; i < bodyNodes.length; i++) {
      this.dotStrings.push(`${bodyNodes[i - 1]} -> ${bodyNodes[i]}`);
    }
    return name;
  }

  visitReturnNode(node) {
    const name = this.newNodeName();
    let valueNode = node.value.visit(this);
    this.dotStrings.push(`${name}[label="return"]`);
    this.dotStrings.push(`${name} -> ${valueNode}`);
    return name;
  }

  visitValueNode(node) {
    const name = this.newNodeName();
    this.dotStrings.push(`${name}[label="${node.value == ValueNode.TableValue ? "{}" : node.valueData}"]`);
    return name;
  }
}
