import { Tokens, tokenize } from "./tokenizer.js";

test("tokenize", () => {
  expect(tokenize("")).toStrictEqual([]);
  expect(tokenize("local x = {}")).toStrictEqual([
    "id",
    "local",
    "id",
    "x",
    "=",
    "{",
    "}",
  ]);
});
