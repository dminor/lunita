import fs from "node:fs/promises";
import process from "node:process";

import { parse } from "./parser.js";
import { tokenize } from "./tokenizer.js";
import { CodeGenerator } from "./codegen.js";
import { VirtualMachine } from "./vm.js";
import { AstGenerator } from "./astgen.js";

let filename;
let generateAst = false;
for (let i = 2; i < process.argv.length; ++i) {
  if (process.argv[i] == "--generate-ast") {
    generateAst = true;
  } else {
    filename = process.argv[i];
  }
}

const handle = await fs.open(filename, "r");
const program = await handle.readFile();
handle.close();

const tokens = tokenize(program.toString());
const ast = parse(tokens);

if (generateAst) {
  const handle = await fs.open(`${filename}.dot`, "w");
  const ag = new AstGenerator();
  ag.generate(ast);
  await handle.writeFile(ag.dotStrings.join("\n"));
  handle.close();
}

const cg = new CodeGenerator();
cg.generate(ast);
const vm = new VirtualMachine(cg.instructions);
vm.run();
