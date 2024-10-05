import { Opcodes, VirtualMachine } from "./vm.js";

test("calls", () => {
  let called;
  const BuiltinFn = {
    call(vm) {
      const arg = vm.stack.pop();
      called = arg;
    },
  };

  let instr = [
    Opcodes.STRING,
    "hello, world",
    Opcodes.ID,
    "fn",
    Opcodes.GETENV,
    Opcodes.CALL,
  ];
  let vm = new VirtualMachine(instr);
  vm.env[0].set("fn", BuiltinFn);
  vm.run();
  expect(vm.stack.length).toBe(0);
  expect(called).toBe("hello, world");
});

test("env", () => {
  let instr = [Opcodes.ID, "x", Opcodes.GETENV];
  let vm = new VirtualMachine(instr);
  vm.env[0].set("x", 1);
  vm.run();
  expect(vm.stack.length).toBe(1);
  expect(vm.stack[0]).toBe(1);

  instr = [Opcodes.ID, "x", Opcodes.GETENV];
  vm = new VirtualMachine(instr);
  vm.env[0].set("x", 1);
  vm.env.push(new Map()); // Add a local environment
  vm.run();
  expect(vm.stack.length).toBe(1);
  expect(vm.stack[0]).toBe(1);

  instr = [Opcodes.ID, "x", Opcodes.NUMBER, 1, Opcodes.SETENV];
  vm = new VirtualMachine(instr);
  vm.run();
  expect(vm.stack.length).toBe(0);
  expect(vm.env[0].get("x")).toBe(1);

  instr = [Opcodes.ID, "x", Opcodes.NUMBER, 1, Opcodes.SETENV_GLOBAL];
  vm = new VirtualMachine(instr);
  vm.env.push(new Map()); // Add a local environment
  vm.run();
  expect(vm.stack.length).toBe(0);
  expect(vm.env[0].get("x")).toBe(1);

  instr = [
    Opcodes.ID,
    "x",
    Opcodes.NUMBER,
    2,
    Opcodes.SETENV,
    Opcodes.ID,
    "x",
    Opcodes.NUMBER,
    1,
    Opcodes.SETENV_GLOBAL,
  ];
  vm = new VirtualMachine(instr);
  vm.env.push(new Map()); // Add a local environment
  vm.run();
  expect(vm.stack.length).toBe(0);
  expect(vm.env[1].get("x")).toBe(2);
  expect(vm.env[0].get("x")).toBe(1);
});

test("inc", () => {
  let instr = [Opcodes.NUMBER, 1, Opcodes.INC];
  let vm = new VirtualMachine(instr);
  vm.run();
  expect(vm.stack.length).toBe(1);
  expect(vm.stack[0]).toBe(2);
});

test("jumps", () => {
  let instr = [Opcodes.FALSE, Opcodes.JUMP, 4, Opcodes.TRUE];
  let vm = new VirtualMachine(instr);
  vm.run();
  expect(vm.stack.length).toBe(1);
  expect(vm.stack[0]).toBe(false);

  instr = [Opcodes.FALSE, Opcodes.JUMP_IF_FALSE, 4, Opcodes.TRUE];
  vm = new VirtualMachine(instr);
  vm.run();
  expect(vm.stack.length).toBe(0);

  instr = [Opcodes.TRUE, Opcodes.JUMP_IF_FALSE, 4, Opcodes.TRUE];
  vm = new VirtualMachine(instr);
  vm.run();
  expect(vm.stack.length).toBe(1);
  expect(vm.stack[0]).toBe(true);
});

test("neq", () => {
  let instr = [Opcodes.FALSE, Opcodes.TRUE, Opcodes.NEQ];
  let vm = new VirtualMachine(instr);
  vm.run();
  expect(vm.stack.length).toBe(1);
  expect(vm.stack[0]).toBe(true);

  instr = [Opcodes.TRUE, Opcodes.TRUE, Opcodes.NEQ];
  vm = new VirtualMachine(instr);
  vm.run();
  expect(vm.stack.length).toBe(1);
  expect(vm.stack[0]).toBe(false);
});

test("pop", () => {
  let instr = [
    Opcodes.NUMBER,
    1,
    Opcodes.NUMBER,
    2,
    Opcodes.NUMBER,
    3,
    Opcodes.POP,
    Opcodes.POP,
  ];
  let vm = new VirtualMachine(instr);
  vm.run();
  expect(vm.stack.length).toBe(1);
  expect(vm.stack[0]).toBe(1);
});

test("strings", () => {
  let instr = [
    Opcodes.ID,
    "s",
    Opcodes.GETENV,
    Opcodes.ID,
    "string",
    Opcodes.GETENV,
    Opcodes.ID,
    "len",
    Opcodes.GETTABLE,
    Opcodes.CALL,
  ];
  let vm = new VirtualMachine(instr);
  vm.env[0].set("s", "hello, world");
  vm.run();
  expect(vm.stack.length).toBe(1);
  expect(vm.stack[0]).toBe(12);

  instr = [
    Opcodes.ID,
    "s",
    Opcodes.GETENV,
    Opcodes.NUMBER,
    4,
    Opcodes.ID,
    "string",
    Opcodes.GETENV,
    Opcodes.ID,
    "byte",
    Opcodes.GETTABLE,
    Opcodes.CALL,
  ];
  vm = new VirtualMachine(instr);
  vm.env[0].set("s", "hello, world");
  vm.run();
  expect(vm.stack.length).toBe(1);
  expect(vm.stack[0]).toBe("l");
});

test("swap", () => {
  let instr = [Opcodes.NUMBER, 1, Opcodes.NUMBER, 2, Opcodes.SWAP];
  let vm = new VirtualMachine(instr);
  vm.run();
  expect(vm.stack.length).toBe(2);
  expect(vm.stack[0]).toBe(2);
  expect(vm.stack[1]).toBe(1);
});

test("tables", () => {
  let instr = [
    Opcodes.ID,
    "t",
    Opcodes.NEWTABLE,
    Opcodes.SETENV,
    Opcodes.ID,
    "t",
    Opcodes.GETENV,
    Opcodes.ID,
    1,
    Opcodes.STRING,
    "hello, world",
    Opcodes.SETTABLE,
  ];
  let vm = new VirtualMachine(instr);
  vm.run();
  expect(vm.stack.length).toBe(0);
  expect(vm.env[0].get("t")).toStrictEqual({ 1: "hello, world" });

  instr = [Opcodes.ID, "t", Opcodes.GETENV, Opcodes.ID, 1, Opcodes.GETTABLE];
  vm = new VirtualMachine(instr);
  vm.env[0].set("t", { 1: "hello, world" });
  vm.run();
  expect(vm.stack.length).toBe(1);
  expect(vm.stack[0]).toBe("hello, world");

  instr = [
    Opcodes.ID,
    "t",
    Opcodes.GETENV,
    Opcodes.ID,
    "table",
    Opcodes.GETENV,
    Opcodes.ID,
    "len",
    Opcodes.GETTABLE,
    Opcodes.CALL,
  ];
  vm = new VirtualMachine(instr);
  vm.env[0].set("t", { 1: "a", 2: "b", 3: "c", 5: "e" });
  vm.run();
  expect(vm.stack.length).toBe(1);
  expect(vm.stack[0]).toBe(3);

  vm = new VirtualMachine(instr);
  vm.env[0].set("t", { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e" });
  vm.run();
  expect(vm.stack.length).toBe(1);
  expect(vm.stack[0]).toBe(5);

  instr = [
    Opcodes.ID,
    "t",
    Opcodes.GETENV,
    Opcodes.ID,
    "table",
    Opcodes.GETENV,
    Opcodes.ID,
    "sort",
    Opcodes.GETTABLE,
    Opcodes.CALL,
  ];
  vm = new VirtualMachine(instr);
  vm.env[0].set("t", { 1: "c", 2: "a", 3: "b", 5: "a" });
  vm.run();
  expect(vm.stack.length).toBe(0);
  expect(vm.env[0].get("t")).toStrictEqual({ 1: "a", 2: "b", 3: "c", 5: "a" });

  vm = new VirtualMachine(instr);
  vm.env[0].set("t", { 1: "d", 2: "e", 3: "a", 4: "b", 5: "c" });
  vm.run();
  expect(vm.stack.length).toBe(0);
  expect(vm.env[0].get("t")).toStrictEqual({
    1: "a",
    2: "b",
    3: "c",
    4: "d",
    5: "e",
  });
});

test("values", () => {
  let instr = [Opcodes.FALSE];
  let vm = new VirtualMachine(instr);
  vm.run();
  expect(vm.stack.length).toBe(1);
  expect(vm.stack[0]).toBe(false);

  instr = [Opcodes.ID, "x"];
  vm = new VirtualMachine(instr);
  vm.run();
  expect(vm.stack.length).toBe(1);
  expect(vm.stack[0]).toBe("x");

  instr = [Opcodes.NEWTABLE];
  vm = new VirtualMachine(instr);
  vm.run();
  expect(vm.stack.length).toBe(1);
  expect(vm.stack[0]).toStrictEqual({});

  instr = [Opcodes.NUMBER, 42];
  vm = new VirtualMachine(instr);
  vm.run();
  expect(vm.stack.length).toBe(1);
  expect(vm.stack[0]).toBe(42);

  instr = [Opcodes.STRING, "hello, world"];
  vm = new VirtualMachine(instr);
  vm.run();
  expect(vm.stack.length).toBe(1);
  expect(vm.stack[0]).toBe("hello, world");

  instr = [Opcodes.TRUE];
  vm = new VirtualMachine(instr);
  vm.run();
  expect(vm.stack.length).toBe(1);
  expect(vm.stack[0]).toBe(true);
});
