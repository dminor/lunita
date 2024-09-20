export { parse, CallNode, ValueNode };

import { Tokens } from "./tokenizer.js";

function peekable(iter) {
  let state = iter.next().value;

  const peekableIterator = (function* () {
    while (!state.done) {
      const current = state;
      state = iter.next().value;
      yield current;
    }
    return { value: state, done: true };
  })();

  peekableIterator.peek = function () {
    return { value: state, done: false };
  };
  return peekableIterator;
}

class ASTNode {
  generate() {}
  toString() {}
}

class BinaryOperationNode extends ASTNode {
  left;
  right;
}

function expression(tokens) {
  const valueNode = ValueNode.tryParse(tokens);
  // See if this variable reference is actually a function call
  if (valueNode.value == ValueNode.VariableRef) {
    const peeked = tokens.peek();
    if (!peeked.done && peeked.value == Tokens.LPAREN) {
      return CallNode.tryParse(valueNode.valueData, tokens);
    }
  }

  return valueNode;
}

class ProgramNode extends ASTNode {
  nodes;
  constructor() {
    super();
    this.nodes = [];
  }

  static tryParse(tokens) {
    return expression(tokens);
  }
}

class CallNode extends ASTNode {
  fun;
  args;

  constructor(funName, args) {
    super();
    this.funNmae = funName;
    this.args = args;
  }

  static tryParse(fun, tokens) {
    let token = tokens.next();
    if (token.done || token.value != Tokens.LPAREN) {
      // TODO: Handle unexpected end of input or syntax error
    }
    // Parse arguments
    let args = [];
    while (true) {
      token = tokens.peek();
      if (token.done) {
        // TODO: Handle unexpected end of input
      }
      if (token.value == Tokens.RPAREN) {
        break;
      }
      const arg = expression(tokens);
      if (!arg) {
        // TODO: Handle syntax error
      }
      args.push(arg);
      // TODO: We only need to support functions of 0 or 1 argument
      // Otherwise, we would check for `,` here.
    }
    return new CallNode(fun, args);
  }
}

class ValueNode extends ASTNode {
  value;
  valueData;

  static NumberValue = "num";
  static StringValue = "str";
  static VariableRef = "varref";
  static BooleanValue = "bool";
  static TableValue = "table";

  constructor(value, valueData) {
    super();
    this.value = value;
    this.valueData = valueData;
  }

  static tryParse(tokens) {
    const peeked = tokens.peek();
    if (peeked.done) {
      // TODO: Handle unexpected end of input
    }
    if (peeked.value == Tokens.NUM) {
      tokens.next();
      const data = tokens.next();
      if (data.done) {
        // TODO: Handle unexpected end of input
      }
      return new ValueNode(ValueNode.NumberValue, data.value);
    } else if (peeked.value == Tokens.STR) {
      tokens.next();
      const data = tokens.next();
      if (data.done) {
        // TODO: Handle unexpected end of input
      }
      return new ValueNode(ValueNode.StringValue, data.value);
    } else if (peeked.value == Tokens.ID) {
      tokens.next();
      const data = tokens.next();
      if (data.done) {
        // TODO: Handle unexpected end of input
      }
      return new ValueNode(ValueNode.VariableRef, data.value);
    } else if (peeked.value == Tokens.TRUE) {
      tokens.next();
      return new ValueNode(ValueNode.BooleanValue, true);
    } else if (peeked.value == Tokens.FALSE) {
      tokens.next();
      return new ValueNode(ValueNode.BooleanValue, false);
    } else if (peeked.value == Tokens.LBRACE) {
      tokens.next();
      const next = tokens.next();
      if (next.done || next.value != Tokens.RBRACE) {
        //TODO: handle end of input or SyntaxError
      }
      return new ValueNode(ValueNode.TableValue);
    }
    return null;
  }
}

class ForLoopNode extends ASTNode {}

class FunctionDefinitionNode extends ASTNode {}

class IfThenNode extends ASTNode {}

function parse(tokens) {
  const peekableTokens = peekable(tokens.values());
  return ProgramNode.tryParse(peekableTokens);
}
