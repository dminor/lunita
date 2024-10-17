import {
  parse,
  AssignmentNode,
  BinaryOperationNode,
  CallNode,
  ForLoopNode,
  FunctionNode,
  IfThenNode,
  IndexNode,
  ValueNode,
  ReturnNode,
} from "./parser.js";
import { tokenize } from "./tokenizer.js";

test("values", () => {
  expect(parse(tokenize("1"))).toStrictEqual([
    new ValueNode(ValueNode.NumberValue, 1),
  ]);
  expect(parse(tokenize('"true"'))).toStrictEqual([
    new ValueNode(ValueNode.StringValue, "true"),
  ]);
  expect(parse(tokenize('"hello, world!"'))).toStrictEqual([
    new ValueNode(ValueNode.StringValue, "hello, world!"),
  ]);
  expect(parse(tokenize("x"))).toStrictEqual([
    new ValueNode(ValueNode.VariableRef, "x"),
  ]);
  expect(parse(tokenize("true"))).toStrictEqual([
    new ValueNode(ValueNode.BooleanValue, true),
  ]);
  expect(parse(tokenize("false"))).toStrictEqual([
    new ValueNode(ValueNode.BooleanValue, false),
  ]);
  expect(parse(tokenize("{}"))).toStrictEqual([
    new ValueNode(ValueNode.TableValue),
  ]);
});

test("calls", () => {
  expect(parse(tokenize("fn()"))).toStrictEqual([
    new CallNode(undefined, "fn", []),
  ]);
  expect(parse(tokenize("fn(1)"))).toStrictEqual([
    new CallNode(undefined, "fn", [new ValueNode(ValueNode.NumberValue, 1)]),
  ]);
  expect(parse(tokenize("fn(fn(1))"))).toStrictEqual([
    new CallNode(undefined, "fn", [
      new CallNode(undefined, "fn", [new ValueNode(ValueNode.NumberValue, 1)]),
    ]),
  ]);
  expect(parse(tokenize("table.fn()"))).toStrictEqual([
    new CallNode("table", "fn", []),
  ]);
  expect(parse(tokenize("table.fn(1)"))).toStrictEqual([
    new CallNode("table", "fn", [new ValueNode(ValueNode.NumberValue, 1)]),
  ]);
  expect(parse(tokenize("table.fn(1, 2)"))).toStrictEqual([
    new CallNode("table", "fn", [
      new ValueNode(ValueNode.NumberValue, 1),
      new ValueNode(ValueNode.NumberValue, 2),
    ]),
  ]);
  expect(parse(tokenize("table1.fn(table2.fn(1))"))).toStrictEqual([
    new CallNode("table1", "fn", [
      new CallNode("table2", "fn", [new ValueNode(ValueNode.NumberValue, 1)]),
    ]),
  ]);
  expect(parse(tokenize('print("hello, world!")'))).toStrictEqual([
    new CallNode(undefined, "print", [
      new ValueNode(ValueNode.StringValue, "hello, world!"),
    ]),
  ]);
});

test("binaryops", () => {
  expect(parse(tokenize("1 ~= 2"))).toStrictEqual([
    new BinaryOperationNode(
      BinaryOperationNode.OpNeq,
      new ValueNode(ValueNode.NumberValue, 1),
      new ValueNode(ValueNode.NumberValue, 2)
    ),
  ]);
  expect(parse(tokenize("string.len(c1) ~= string.len(c2)"))).toStrictEqual([
    new BinaryOperationNode(
      BinaryOperationNode.OpNeq,
      new CallNode("string", "len", [
        new ValueNode(ValueNode.VariableRef, "c1"),
      ]),
      new CallNode("string", "len", [
        new ValueNode(ValueNode.VariableRef, "c2"),
      ])
    ),
  ]);
});

test("ifthen", () => {
  expect(parse(tokenize("if 1 ~= 2 then 1 end"))).toStrictEqual([
    new IfThenNode(
      new BinaryOperationNode(
        BinaryOperationNode.OpNeq,
        new ValueNode(ValueNode.NumberValue, 1),
        new ValueNode(ValueNode.NumberValue, 2)
      ),
      new ValueNode(ValueNode.NumberValue, 1)
    ),
  ]);
});

test("assignments", () => {
  expect(parse(tokenize("tabla1 = {}"))).toStrictEqual([
    new AssignmentNode(
      false,
      new ValueNode(ValueNode.VariableRef, "tabla1"),
      new ValueNode(ValueNode.TableValue)
    ),
  ]);
  expect(parse(tokenize("local tabla1 = {}"))).toStrictEqual([
    new AssignmentNode(
      true,
      new ValueNode(ValueNode.VariableRef, "tabla1"),
      new ValueNode(ValueNode.TableValue)
    ),
  ]);

  expect(() => parse(tokenize("local foo ( 1"))).toThrow();
  expect(() => parse(tokenize("for foo ( 1, 10 do 1 end"))).toThrow();
});

test("forloops", () => {
  expect(parse(tokenize("for i=1, 2 do end"))).toStrictEqual([
    new ForLoopNode(
      new AssignmentNode(
        false,
        new ValueNode(ValueNode.VariableRef, "i"),
        new ValueNode(ValueNode.NumberValue, 1)
      ),
      new ValueNode(ValueNode.NumberValue, 2),
      []
    ),
  ]);
  expect(
    parse(
      tokenize("for i=1, string.len(c1) do tabla1[i] = string.byte(c1, i) end")
    )
  ).toStrictEqual([
    new ForLoopNode(
      new AssignmentNode(
        false,
        new ValueNode(ValueNode.VariableRef, "i"),
        new ValueNode(ValueNode.NumberValue, 1)
      ),
      new CallNode("string", "len", [
        new ValueNode(ValueNode.VariableRef, "c1"),
      ]),
      [
        new AssignmentNode(
          false,
          new IndexNode("tabla1", new ValueNode(ValueNode.VariableRef, "i")),
          new CallNode("string", "byte", [
            new ValueNode(ValueNode.VariableRef, "c1"),
            new ValueNode(ValueNode.VariableRef, "i"),
          ])
        ),
      ]
    ),
  ]);
});

test("index", () => {
  expect(parse(tokenize("i[0]"))).toStrictEqual([
    new IndexNode("i", new ValueNode(ValueNode.NumberValue, 0)),
  ]);
  expect(parse(tokenize("i[0] = 0"))).toStrictEqual([
    new AssignmentNode(
      false,
      new IndexNode("i", new ValueNode(ValueNode.NumberValue, 0)),
      new ValueNode(ValueNode.NumberValue, 0)
    ),
  ]);

  expect(parse(tokenize("tabla1[i] ~= tabla2[i]"))).toStrictEqual([
    new BinaryOperationNode(
      BinaryOperationNode.OpNeq,
      new IndexNode("tabla1", new ValueNode(ValueNode.VariableRef, "i")),
      new IndexNode("tabla2", new ValueNode(ValueNode.VariableRef, "i"))
    ),
  ]);
});

test("functions", () => {
  expect(parse(tokenize("function fn() end"))).toStrictEqual([
    new FunctionNode("fn", [], []),
  ]);
  expect(parse(tokenize("function fn(i) end"))).toStrictEqual([
    new FunctionNode("fn", ["i"], []),
  ]);
  expect(parse(tokenize("function fn(i, j) end"))).toStrictEqual([
    new FunctionNode("fn", ["i", "j"], []),
  ]);
  expect(parse(tokenize("function fn(i, j) return i ~= j end"))).toStrictEqual([
    new FunctionNode(
      "fn",
      ["i", "j"],
      [
        new ReturnNode(
          new BinaryOperationNode(
            BinaryOperationNode.OpNeq,
            new ValueNode(ValueNode.VariableRef, "i"),
            new ValueNode(ValueNode.VariableRef, "j")
          )
        ),
      ]
    ),
  ]);
});
