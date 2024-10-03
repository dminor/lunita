import fs from "node:fs/promises";
import process from "node:process";

import { parse } from "./parser.js";
import { tokenize } from "./tokenizer.js";
import { CodeGenerator } from "./codegen.js";
import { VirtualMachine } from "./vm.js";

const filename = process.argv[2];

const handle = await fs.open(filename, "r");
const program = await handle.readFile();
handle.close();

const tokens = tokenize(program.toString());
const ast = parse(tokens);
console.log("AST: ", ast);
const cg = new CodeGenerator();
cg.generate(ast);
const vm = new VirtualMachine(cg.instructions);
vm.run();
