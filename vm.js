export { Opcodes, VirtualMachine };

import {
  Print,
  StringByte,
  StringLen,
  TableLen,
  TableSort,
} from "./builtins.js";

const Opcodes = {
  // Call the function on the top of the stack with the provided arguments
  // arg1 arg2 ... argn function ->
  CALL: "call",
  // Push the boolean false to the stack
  // -> false
  FALSE: "false",
  // Push a new function value to the stack
  // -> function
  FUNCTION: "function",
  // Look up the value of identifier in the environment and push it to the stack
  // id -> value
  GETENV: "getenv",
  // Look up the value of identifier in the table and push it to the stack
  // table id -> value
  GETTABLE: "gettable",
  // Push an id to the stack
  // -> identifier
  ID: "id",
  // Increment the value at the top of the stack
  // a -> a + 1
  INC: "inc",
  // Unconditionally jump to the provided ip
  // ->
  JUMP: "jump",
  // Pop a value from the stack, and jump if it is false
  // boolean ->
  JUMP_IF_FALSE: "jump_if_false",
  // Pop two values from the stack, see if they are not equal
  // a b -> a ~= b
  NEQ: "neq",
  // Do nothing at all
  NOP: "nop",
  // Push a new table to the stack
  // -> {}
  NEWTABLE: "newtable",
  // Push a number to the stack
  // -> number
  NUMBER: "number",
  // Pop the value from the top of the stack
  POP: "pop",
  // Return from a function call
  RET: "ret",
  // Set the value of id in the environment to value
  // id value ->
  SETENV: "setenv",
  // Set the value of id in the global environment to value
  // id -> value
  SETENV_GLOBAL: "setenv_global",
  // Set the value of id in the table to value
  // table id value ->
  SETTABLE: "settable",
  // Push a string to the stack
  // -> string
  STRING: "string",
  // Swap the top two values of the stack
  SWAP: "swap",
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
  callstack;
  instructions;
  ip;

  constructor(instructions) {
    this.env = [];
    this.env.push(new Map()); // Global environment

    // Add builtins to the global environment
    this.env[0].set("print", Print);
    this.env[0].set("string", { byte: StringByte, len: StringLen });
    this.env[0].set("table", { len: TableLen, sort: TableSort });

    this.stack = [];
    this.callstack = [];
    this.instructions = instructions;
    this.ip = 0;
  }

  lookupEnv(id) {}

  step() {
    switch (this.instructions[this.ip]) {
      case Opcodes.CALL:
        const fn = this.stack.pop();
        fn.call(this);
        break;
      case Opcodes.FALSE:
        this.stack.push(false);
        break;
      case Opcodes.FUNCTION:
        this.ip += 1;
        this.stack.push(this.instructions[this.ip]);
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
      case Opcodes.GETTABLE:
        {
          const id = this.stack.pop();
          const table = this.stack.pop();
          if (table.hasOwnProperty(id)) {
            this.stack.push(table[id]);
          } else {
            this.stack.push(Nil);
          }
        }
        break;
      case Opcodes.ID:
        this.ip += 1;
        this.stack.push(this.instructions[this.ip]);
        break;
      case Opcodes.INC:
        this.stack[this.stack.length - 1]++;
        break;
      case Opcodes.JUMP:
        this.ip += 1;
        this.ip = this.instructions[this.ip];
        return;
      case Opcodes.JUMP_IF_FALSE:
        this.ip += 1;
        if (!this.stack.pop()) {
          this.ip = this.instructions[this.ip];
        } else {
          this.ip += 1;
        }
        return;
      case Opcodes.NEQ:
        const lhs = this.stack.pop();
        const rhs = this.stack.pop();
        this.stack.push(lhs !== rhs);
        break;
      case Opcodes.NOP:
        break;
      case Opcodes.NEWTABLE:
        this.stack.push({});
        break;
      case Opcodes.NUMBER:
        this.ip += 1;
        this.stack.push(this.instructions[this.ip]);
        break;
      case Opcodes.POP:
        this.stack.pop();
        break;
      case Opcodes.RET:
        let [ip, instructions] = this.callstack.pop();
        this.instructions = instructions;
        this.ip = ip;
        break;
      case Opcodes.SETENV:
        {
          const value = this.stack.pop();
          const id = this.stack.pop();
          this.env[this.env.length - 1].set(id, value);
        }
        break;
      case Opcodes.SETENV_GLOBAL:
        {
          const value = this.stack.pop();
          const id = this.stack.pop();
          this.env[0].set(id, value);
        }
        break;
      case Opcodes.SETTABLE:
        {
          const value = this.stack.pop();
          const id = this.stack.pop();
          const table = this.stack.pop();
          table[id] = value;
        }
        break;
      case Opcodes.STRING:
        this.ip += 1;
        this.stack.push(this.instructions[this.ip]);
        break;
      case Opcodes.SWAP:
        const a = this.stack.pop();
        const b = this.stack.pop();
        this.stack.push(a);
        this.stack.push(b);
        break;
      case Opcodes.TRUE:
        this.stack.push(true);
        break;
      default:
        throw (
          "RuntimeError: Unrecognized bytecode: " + this.instructions[this.ip]
        );
    }
    this.ip += 1;
  }

  run() {
    while (this.ip < this.instructions.length) {
      this.step();
    }
  }
}
