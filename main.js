import { parse } from "./parser.js";
import { tokenize } from "./tokenizer.js";

const tokens = tokenize(program);
const ast = parse(tokens);
