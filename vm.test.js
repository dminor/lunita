import { Opcodes, VirtualMachine } from "./vm.js";

test("values", () => {
  let instr = [Opcodes.FALSE];
  let vm = new VirtualMachine(instr);
  vm.run();
  expect(vm.stack.length).toBe(1);
  expect(vm.stack[0]).toBe(false);

  instr = [Opcodes.ONE];
  vm = new VirtualMachine(instr);
  vm.run();
  expect(vm.stack.length).toBe(1);
  expect(vm.stack[0]).toBe(1);

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
