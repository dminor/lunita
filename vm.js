export { Opcodes, VirtualMachine };

const Opcodes = {
  FALSE: "false",
  ID: "id",
  NEQ: "neq",
  NEWTABLE: "newtable",
  ONE: "one",
  STRING: "string",
  TRUE: "true",
};

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
      case Opcodes.ID:
        this.ip += 1;
        this.stack.push(this.instructions[this.ip]);
        break;
      case Opcodes.NEQ:
        const lhs = this.stack.pop();
        const rhs = this.stack.pop();
        this.stack.push(lhs !== rhs);
        break;
      case Opcodes.NEWTABLE:
        this.stack.push({});
        break;
      case Opcodes.ONE:
        this.stack.push(1);
        break;
      case Opcodes.STRING:
        this.ip += 1;
        this.stack.push(this.instructions[this.ip]);
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
