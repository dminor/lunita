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

  cg = new CodeGenerator();
  cg.generate(parse(tokenize("x[1] = {}")));
  expect(cg.instructions).toStrictEqual([
    Opcodes.ID,
    "x",
    Opcodes.GETENV,
    Opcodes.NUMBER,
    1,
    Opcodes.NEWTABLE,
    Opcodes.SETTABLE,
  ]);

  cg = new CodeGenerator();
  cg.generate(parse(tokenize("x[i] = {}")));
  expect(cg.instructions).toStrictEqual([
    Opcodes.ID,
    "x",
    Opcodes.GETENV,
    Opcodes.ID,
    "i",
    Opcodes.GETENV,
    Opcodes.NEWTABLE,
    Opcodes.SETTABLE,
  ]);

  cg = new CodeGenerator();
  cg.generate(parse(tokenize("y = x[i]")));
  expect(cg.instructions).toStrictEqual([
    Opcodes.ID,
    "y",
    Opcodes.ID,
    "x",
    Opcodes.GETENV,
    Opcodes.ID,
    "i",
    Opcodes.GETENV,
    Opcodes.GETTABLE,
    Opcodes.SETENV_GLOBAL,
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

test("calls", () => {
  let cg = new CodeGenerator();
  cg.generate(parse(tokenize("fn()")));
  expect(cg.instructions).toStrictEqual([
    Opcodes.ID,
    "fn",
    Opcodes.GETENV,
    Opcodes.CALL,
  ]);

  cg = new CodeGenerator();
  cg.generate(parse(tokenize("fn(1)")));
  expect(cg.instructions).toStrictEqual([
    Opcodes.NUMBER,
    1,
    Opcodes.ID,
    "fn",
    Opcodes.GETENV,
    Opcodes.CALL,
  ]);

  cg = new CodeGenerator();
  cg.generate(parse(tokenize('fn("hello, world!")')));
  expect(cg.instructions).toStrictEqual([
    Opcodes.STRING,
    "hello, world!",
    Opcodes.ID,
    "fn",
    Opcodes.GETENV,
    Opcodes.CALL,
  ]);
});

test("forloop", () => {
  let cg = new CodeGenerator();
  cg.generate(parse(tokenize("for i=1,10 do print(i) end")));
  expect(cg.instructions).toStrictEqual([
    Opcodes.ID,
    "i",
    Opcodes.NUMBER,
    1,
    Opcodes.SETENV,
    Opcodes.ID,
    "i",
    Opcodes.GETENV,
    Opcodes.NUMBER,
    10,
    Opcodes.NEQ,
    Opcodes.JUMP_IF_FALSE,
    30,
    Opcodes.ID,
    "i",
    Opcodes.GETENV,
    Opcodes.ID,
    "print",
    Opcodes.GETENV,
    Opcodes.CALL,
    Opcodes.ID,
    "i",
    Opcodes.GETENV,
    Opcodes.INC,
    Opcodes.ID,
    "i",
    Opcodes.SWAP,
    Opcodes.SETENV,
    Opcodes.JUMP,
    5,
  ]);
});

test("ifthen", () => {
  let cg = new CodeGenerator();
  cg.generate(parse(tokenize("if 1 ~= 2 then x = 1 end")));
  expect(cg.instructions).toStrictEqual([
    Opcodes.NUMBER,
    1,
    Opcodes.NUMBER,
    2,
    Opcodes.NEQ,
    Opcodes.JUMP_IF_FALSE,
    12,
    Opcodes.ID,
    "x",
    Opcodes.NUMBER,
    1,
    Opcodes.SETENV_GLOBAL,
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
  expect(cg.instructions).toStrictEqual([Opcodes.ID, "x", Opcodes.GETENV]);
});
