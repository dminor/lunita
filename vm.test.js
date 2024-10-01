import { Opcodes, VirtualMachine } from "./vm.js";

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

  instr = [Opcodes.ID, "x", Opcodes.NUMBER, 1, Opcodes.GLOBAL_SETENV];
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
    Opcodes.GLOBAL_SETENV,
  ];
  vm = new VirtualMachine(instr);
  vm.env.push(new Map()); // Add a local environment
  vm.run();
  expect(vm.stack.length).toBe(0);
  expect(vm.env[1].get("x")).toBe(2);
  expect(vm.env[0].get("x")).toBe(1);
});
