export { Opcodes, VirtualMachine };

class Opcodes {
  static FALSE = "false";
  static NEQ = "neq";
  static ONE = "one";
  static TRUE = "true";
}

class VirtualMachine {
  stack;
  instructions;
  ip;

  constructor(instructions) {
    this.stack = [];
    this.instructions = instructions;
    this.ip = 0;
  }

  step() {
    switch (this.instructions[this.ip]) {
      case Opcodes.FALSE:
        this.stack.push(false);
        break;
      case Opcodes.NEQ:
        const lhs = this.stack.pop();
        const rhs = this.stack.pop();
        this.stack.push(lhs !== rhs);
        break;
      case Opcodes.ONE:
        this.stack.push(1);
        break;
      case Opcodes.TRUE:
        this.stack.push(true);
        break;
    }
    this.ip += 1;
  }

  run() {
    while (this.ip < this.instructions.length) {
      this.step();
    }
  }
}
