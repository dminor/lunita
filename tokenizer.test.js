import { tokenize } from "./tokenizer.js";

test("tokenize", () => {
  expect(tokenize("")).toStrictEqual([]);
  expect(tokenize("-- This is a comment")).toStrictEqual([]);
  expect(tokenize("local x = {}")).toStrictEqual([
    "local",
    "id",
    "x",
    "=",
    "{",
    "}",
  ]);
  expect(() => tokenize(";")).toThrow();
});
