export { Opcodes, VirtualMachine };

const Opcodes = {
  // Push the boolean false to the stack
  // -> false
  FALSE: "false",
  // Look up the value of identifier in the environment and push it to the stack
  // id -> value
  GETENV: "getenv",
  // Look up the value of identifier in the global environment and push it to the stack
  // id -> value
  GLOBAL_SETENV: "global_setenv",
  // Push an id to the stack
  // -> identifier
  ID: "id",
  // Pop two values from the stack, see if they are not equal
  // a b -> a ~= b
  NEQ: "neq",
  // Push a new table to the stack
  // -> {}
  NEWTABLE: "newtable",
  // Push a number to the stack
  // -> number
  NUMBER: "number",
  // Set the value of id in the environment to value
  // id value ->
  SETENV: "setenv",
  // Push a string to the stack
  // -> string
  STRING: "string",
  // Push the boolean true to the stack
  // -> true
  TRUE: "true",
};

// The Lua nil value
const Nil = {};
Nil.toString = function () {
  return "nil";
};

class VirtualMachine {
  env;
  stack;
  instructions;
  ip;

  constructor(instructions) {
    this.env = [];
    this.env.push(new Map()); // Global environment
    this.stack = [];
    this.instructions = instructions;
    this.ip = 0;
  }

  lookupEnv(id) {}

  step() {
    switch (this.instructions[this.ip]) {
      case Opcodes.FALSE:
        this.stack.push(false);
        break;
      case Opcodes.GETENV:
        {
          const id = this.stack.pop();
          let value = Nil;
          for (let i = this.env.length - 1; i >= 0; i--) {
            if (this.env[i].has(id)) {
              value = this.env[i].get(id);
              break;
            }
          }
          this.stack.push(value);
        }
        break;
      case Opcodes.GLOBAL_SETENV:
        {
          const value = this.stack.pop();
          const id = this.stack.pop();
          this.env[0].set(id, value);
        }
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
      case Opcodes.NUMBER:
        this.ip += 1;
        this.stack.push(this.instructions[this.ip]);
        break;
      case Opcodes.SETENV:
        {
          const value = this.stack.pop();
          const id = this.stack.pop();
          this.env[this.env.length - 1].set(id, value);
        }
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
