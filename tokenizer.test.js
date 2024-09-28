import { tokenize } from "./tokenizer.js";

test("tokenize", () => {
  expect(tokenize("")).toStrictEqual([]);
  expect(tokenize("local x = {}")).toStrictEqual([
    "local",
    "id",
    "x",
    "=",
    "{",
    "}",
  ]);
});
