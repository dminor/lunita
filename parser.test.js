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
  expect(parse(tokenize("obj:fn()"))).toStrictEqual([
    new CallNode("obj", "fn", []),
  ]);
  expect(parse(tokenize("obj:fn(1)"))).toStrictEqual([
    new CallNode("obj", "fn", [new ValueNode(ValueNode.NumberValue, 1)]),
  ]);
  expect(parse(tokenize("obj1:fn(obj2:fn(1))"))).toStrictEqual([
    new CallNode("obj1", "fn", [
      new CallNode("obj2", "fn", [new ValueNode(ValueNode.NumberValue, 1)]),
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
  expect(parse(tokenize("c1:len() ~= c2:len()"))).toStrictEqual([
    new BinaryOperationNode(
      BinaryOperationNode.OpNeq,
      new CallNode("c1", "len", []),
      new CallNode("c2", "len", [])
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
});

test("forloops", () => {
  expect(
    parse(tokenize("for i=1, c1:len() do tabla1[i] = c1:byte(i) end"))
  ).toStrictEqual([
    new ForLoopNode(
      new AssignmentNode(
        false,
        new ValueNode(ValueNode.VariableRef, "i"),
        new ValueNode(ValueNode.NumberValue, 1)
      ),
      new CallNode("c1", "len", []),
      new AssignmentNode(
        false,
        new IndexNode("tabla1", new ValueNode(ValueNode.VariableRef, "i")),
        new CallNode("c1", "byte", [new ValueNode(ValueNode.VariableRef, "i")])
      )
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
