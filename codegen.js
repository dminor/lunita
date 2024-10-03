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

  visitAssignmentNode(node) {
    if (node.lhs instanceof ValueNode) {
      this.instructions.push(Opcodes.ID);
      this.instructions.push(node.lhs.valueData);
    } else {
      // TODO: Handle indexing
    }
    node.rhs.visit(this);
    if (node.local) {
      this.instructions.push(Opcodes.SETENV);
    } else {
      this.instructions.push(Opcodes.SETENV_GLOBAL);
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

  visitCallNode(node) {
    for (const arg of node.args) {
      arg.visit(this);
    }
    // TODO: We need to handle looking up methods using `.` and `:` notation.
    this.instructions.push(Opcodes.ID);
    this.instructions.push(node.fun);
    this.instructions.push(Opcodes.GETENV);
    this.instructions.push(Opcodes.CALL);
  }

  visitIfThenNode(node) {
    node.condition.visit(this);
    this.instructions.push(Opcodes.JUMP_IF_FALSE);
    // Track ip to patch in jump address
    const patch_ip = this.instructions.length;
    // Reserve space for jump address
    this.instructions.push(0);
    node.body.visit(this);
    this.instructions[patch_ip] = this.instructions.length;
  }

  visitValueNode(node) {
    switch (node.value) {
      case ValueNode.BooleanValue:
        node.valueData
          ? this.instructions.push(Opcodes.TRUE)
          : this.instructions.push(Opcodes.FALSE);
        break;
      case ValueNode.NumberValue:
        this.instructions.push(Opcodes.NUMBER);
        this.instructions.push(node.valueData);
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
        this.instructions.push(Opcodes.GETENV);
        break;
    }
  }
}
