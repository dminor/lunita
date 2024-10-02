import { CodeGenerator } from "./codegen.js";
import { parse } from "./parser.js";
import { Opcodes } from "./vm.js";
import { tokenize } from "./tokenizer.js";

test("assignments", () => {
  let cg = new CodeGenerator();
  cg.generate(parse(tokenize("x = true")));
  expect(cg.instructions).toStrictEqual([
    Opcodes.ID,
    "x",
    Opcodes.TRUE,
    Opcodes.SETENV_GLOBAL,
  ]);

  cg = new CodeGenerator();
  cg.generate(parse(tokenize("local x = {}")));
  expect(cg.instructions).toStrictEqual([
    Opcodes.ID,
    "x",
    Opcodes.NEWTABLE,
    Opcodes.SETENV,
  ]);
});

test("binaryops", () => {
  let cg = new CodeGenerator();
  cg.generate(parse(tokenize("true ~= false")));
  expect(cg.instructions).toStrictEqual([
    Opcodes.TRUE,
    Opcodes.FALSE,
    Opcodes.NEQ,
  ]);
});

test("values", () => {
  let cg = new CodeGenerator();
  cg.generate(parse(tokenize("false")));
  expect(cg.instructions).toStrictEqual([Opcodes.FALSE]);

  cg = new CodeGenerator();
  cg.generate(parse(tokenize("true")));
  expect(cg.instructions).toStrictEqual([Opcodes.TRUE]);

  cg = new CodeGenerator();
  cg.generate(parse(tokenize("42")));
  expect(cg.instructions).toStrictEqual([Opcodes.NUMBER, 42]);

  cg = new CodeGenerator();
  cg.generate(parse(tokenize('"hello, world"')));
  expect(cg.instructions).toStrictEqual([Opcodes.STRING, "hello, world"]);

  cg = new CodeGenerator();
  cg.generate(parse(tokenize("{}")));
  expect(cg.instructions).toStrictEqual([Opcodes.NEWTABLE]);

  cg = new CodeGenerator();
  cg.generate(parse(tokenize("x")));
  expect(cg.instructions).toStrictEqual([Opcodes.ID, "x"]);
});
