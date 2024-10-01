export { CodeGenerator };

import { ValueNode } from "./parser.js";
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

  visitValueNode(node) {
    switch (node.value) {
      case ValueNode.BooleanValue:
        node.valueData
          ? this.instructions.push(Opcodes.TRUE)
          : this.instructions.push(Opcodes.FALSE);
        break;
      case ValueNode.NumberValue:
        // We only support the number one :)
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
