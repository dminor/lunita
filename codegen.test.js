import { CodeGenerator } from "./codegen.js";
import { parse } from "./parser.js";
import { Opcodes } from "./vm.js";
import { tokenize } from "./tokenizer.js";

test("values", () => {
  let cg = new CodeGenerator();
  cg.generate(parse(tokenize("false")));
  expect(cg.instructions).toStrictEqual([Opcodes.FALSE]);

  cg = new CodeGenerator();
  cg.generate(parse(tokenize("true")));
  expect(cg.instructions).toStrictEqual([Opcodes.TRUE]);

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
