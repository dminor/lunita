export { CodeGenerator };

import {
  AssignmentNode,
  BinaryOperationNode,
  IndexNode,
  ValueNode,
} from "./parser.js";
import { Opcodes } from "./vm.js";

class CodeGenerator {
  instructions;
  locals;

  constructor() {
    this.instructions = [];
    this.locals = [new Set()];
  }

  generate(nodes) {
    for (let node of nodes) {
      node.visit(this);
    }
  }

  isLocal(id) {
    for (var i = this.locals.length - 1; i >= 0; --i) {
      if (this.locals[i].has(id)) {
        return true;
      }
    }
    return false;
  }

  visitAssignmentNode(node) {
    if (node.lhs instanceof ValueNode) {
      const id = node.lhs.valueData;
      this.instructions.push(Opcodes.ID);
      this.instructions.push(id);
      node.rhs.visit(this);
      if (node.local) {
        this.locals.at(-1).add(id);
      }
      if (node.local || this.isLocal(id)) {
        this.instructions.push(Opcodes.SETENV);
      } else {
        this.instructions.push(Opcodes.SETENV_GLOBAL);
      }
    } else if (node.lhs instanceof IndexNode) {
      this.instructions.push(Opcodes.ID);
      this.instructions.push(node.lhs.identifier);
      this.instructions.push(Opcodes.GETENV);
      node.lhs.index.visit(this);
      node.rhs.visit(this);
      this.instructions.push(Opcodes.SETTABLE);
    } else {
      throw "InternalError: Unexpected rhs: " + node;
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
    if (node.self) {
      this.instructions.push(Opcodes.ID);
      this.instructions.push(node.self);
      this.instructions.push(Opcodes.GETENV);
      this.instructions.push(Opcodes.ID);
      this.instructions.push(node.fun);
      this.instructions.push(Opcodes.GETTABLE);
    } else {
      this.instructions.push(Opcodes.ID);
      this.instructions.push(node.fun);
      this.instructions.push(Opcodes.GETENV);
    }
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

  visitIndexNode(node) {
    this.instructions.push(Opcodes.ID);
    this.instructions.push(node.identifier);
    this.instructions.push(Opcodes.GETENV);
    node.index.visit(this);
    this.instructions.push(Opcodes.GETTABLE);
  }

  visitForLoopNode(node) {
    const loopvar = node.initializer.lhs.valueData;
    this.locals.push(new Set());
    this.locals.at(-1).add(loopvar);
    node.initializer.visit(this);
    const jumpAddr = this.instructions.length;
    this.instructions.push(Opcodes.ID);
    this.instructions.push(loopvar);
    this.instructions.push(Opcodes.GETENV);
    node.range.visit(this);
    this.instructions.push(Opcodes.NEQ);
    this.instructions.push(Opcodes.JUMP_IF_FALSE);
    // Track ip to patch in jump address
    const patch_ip = this.instructions.length;
    // Reserve space for jump address
    this.instructions.push(0);
    node.body.visit(this);
    // [STACK]
    this.instructions.push(Opcodes.ID);
    this.instructions.push(loopvar);
    // [STACK] loopvar
    this.instructions.push(Opcodes.GETENV);
    // [STACK] env[loopvar]
    this.instructions.push(Opcodes.INC);
    // [STACK] env[loopvar]+1
    this.instructions.push(Opcodes.ID);
    this.instructions.push(loopvar);
    // [STACK] env[loopvar]+1 loopvar
    this.instructions.push(Opcodes.SWAP);
    // [STACK] loopvar env[loopvar]+1
    this.instructions.push(Opcodes.SETENV);
    // [STACK]
    this.instructions.push(Opcodes.JUMP);
    this.instructions.push(jumpAddr);
    this.instructions[patch_ip] = this.instructions.length;
    this.locals.pop();
  }

  visitFunctionNode(node) {
    this.instructions.push(Opcodes.ID);
    this.instructions.push(node.name);
    const cg = new CodeGenerator();
    cg.locals = this.locals;
    cg.locals.push(new Set());
    // Insert a NOP at the top, because the vm will increment the ip automatically after the call
    cg.instructions.push(Opcodes.NOP);
    for (let i = node.parameters.length - 1; i >= 0; --i) {
      const parameter = node.parameters[i];
      this.locals.at(-1).add(parameter);
      cg.instructions.push(Opcodes.ID);
      cg.instructions.push(parameter);
      cg.instructions.push(Opcodes.SWAP);
      cg.instructions.push(Opcodes.SETENV);
    }
    cg.generate(node.body);
    if (cg.instructions.at(-1) != Opcodes.RET) {
      cg.instructions.push(Opcodes.RET);
    }
    cg.locals.pop();
    this.instructions.push(Opcodes.FUNCTION);
    this.instructions.push({
      call(vm) {
        vm.callstack.push([vm.ip, vm.instructions]);
        vm.instructions = cg.instructions;
        vm.ip = 0;
      },
    });
    this.instructions.push(Opcodes.SETENV);
  }

  visitReturnNode(node) {
    node.value.visit(this);
    this.instructions.push(Opcodes.RET);
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
