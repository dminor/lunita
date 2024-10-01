export { CodeGenerator };

import { BinaryOperationNode, ValueNode } from "./parser.js";
import { Opcodes } from "./vm.js";

class CodeGenerator {
  instructions;

  constructor() {
    this.instructions = [];
  }

  generate(nodes) {
    for (let node of nodes) {
      node.visit(this);
    }
  }

  visitBinaryOperationNode(node) {
    node.lhs.visit(this);
    node.rhs.visit(this);
    if (node.op !== BinaryOperationNode.OpNeq) {
      throw "InternalError: Only the neq operation is supported";
    }
    this.instructions.push(Opcodes.NEQ);
  }

  visitValueNode(node) {
    switch (node.value) {
      case ValueNode.BooleanValue:
        node.valueData
          ? this.instructions.push(Opcodes.TRUE)
          : this.instructions.push(Opcodes.FALSE);
        break;
      case ValueNode.NumberValue:
        // We only support the number one :)
        if (node.valueData !== 1) {
          throw "InternalError: Only the number one is supported";
        }
        this.instructions.push(Opcodes.ONE);
        break;
      case ValueNode.StringValue:
        this.instructions.push(Opcodes.STRING);
        this.instructions.push(node.valueData);
        break;
      case ValueNode.TableValue:
        this.instructions.push(Opcodes.NEWTABLE);
        break;
      case ValueNode.VariableRef:
        this.instructions.push(Opcodes.ID);
        this.instructions.push(node.valueData);
        break;
    }
  }
}
