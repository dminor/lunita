import { parse, CallNode, ValueNode } from "./parser.js";
import { tokenize } from "./tokenizer.js";

test("values", () => {
  expect(parse(tokenize("1"))).toStrictEqual(
    new ValueNode(ValueNode.NumberValue, 1)
  );
  expect(parse(tokenize('"true"'))).toStrictEqual(
    new ValueNode(ValueNode.StringValue, "true")
  );
  expect(parse(tokenize("x"))).toStrictEqual(
    new ValueNode(ValueNode.VariableRef, "x")
  );
  expect(parse(tokenize("true"))).toStrictEqual(
    new ValueNode(ValueNode.BooleanValue, true)
  );
  expect(parse(tokenize("false"))).toStrictEqual(
    new ValueNode(ValueNode.BooleanValue, false)
  );
  expect(parse(tokenize("{}"))).toStrictEqual(
    new ValueNode(ValueNode.TableValue)
  );
});

test("calls", () => {
  expect(parse(tokenize("fn()"))).toStrictEqual(new CallNode("fn", []));
  expect(parse(tokenize("fn(1)"))).toStrictEqual(
    new CallNode("fn", [new ValueNode(ValueNode.NumberValue, 1)])
  );
  expect(parse(tokenize("fn(fn(1))"))).toStrictEqual(
    new CallNode("fn", [
      new CallNode("fn", [new ValueNode(ValueNode.NumberValue, 1)]),
    ])
  );
});
