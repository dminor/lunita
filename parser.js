export {
  parse,
  AssignmentNode,
  BinaryOperationNode,
  CallNode,
  IfThenNode,
  ValueNode,
};

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

function expression(tokens) {
  let node = ValueNode.tryParse(tokens);
  // See if this variable reference is actually a function call
  if (node.value == ValueNode.VariableRef) {
    const peeked = tokens.peek();
    if (!peeked.done) {
      if (peeked.value == Tokens.LPAREN) {
        node = CallNode.tryParse(undefined, node.valueData, tokens);
      } else if (peeked.value == Tokens.COLON) {
        tokens.next();
        const token = tokens.next();
        if (token != Tokens.ID) {
          // TODO: Handle syntax error
        }
        const method = tokens.next();
        node = CallNode.tryParse(node.valueData, method.value, tokens);
      }
    }
  }

  const peeked = tokens.peek();
  if (!peeked.done) {
    if (peeked.value == Tokens.NEQ) {
      return BinaryOperationNode.tryParse(node, tokens);
    }
  }

  return node;
}

function statement(tokens) {
  let token = tokens.peek();
  if (token.done) {
    // TODO: Handle syntax error
  }
  if (token.value == Tokens.LOCAL) {
    tokens.next();
    const lhs = ValueNode.tryParse(tokens);
    return AssignmentNode.tryParse(true, lhs, tokens);
  }

  let node = IfThenNode.tryParse(tokens);
  if (node) {
    return node;
  }
  node = expression(tokens);
  token = tokens.peek();
  if (!token.done && token.value == Tokens.EQ) {
    node = AssignmentNode.tryParse(false, node, tokens);
  }
  return node;
}

class AssignmentNode {
  local;
  rhs;
  lhs;
  constructor(local, rhs, lhs) {
    this.local = local;
    this.rhs = rhs;
    this.lhs = lhs;
  }

  static tryParse(isLocal, lhs, tokens) {
    if (!(lhs instanceof ValueNode) || lhs.value != ValueNode.VariableRef) {
      // TODO: Handle syntax error
      return null;
    }
    tokens.next();
    const rhs = expression(tokens);
    return new AssignmentNode(isLocal, lhs, rhs);
  }
}

class BinaryOperationNode {
  op;
  lhs;
  rhs;
  static OpNeq = "neq";

  constructor(op, lhs, rhs) {
    this.op = op;
    this.lhs = lhs;
    this.rhs = rhs;
  }

  static tryParse(lhs, tokens) {
    const peeked = tokens.peek();
    if (!peeked.done) {
      if (peeked.value == Tokens.NEQ) {
        tokens.next();
        const rhs = expression(tokens);
        if (!rhs) {
          //TODO: Handle syntax error
        }
        return new BinaryOperationNode(BinaryOperationNode.OpNeq, lhs, rhs);
      }
    }
  }
}

class CallNode {
  self;
  fun;
  args;

  constructor(self, fun, args) {
    this.self = self;
    this.fun = fun;
    this.args = args;
  }

  static tryParse(self, fun, tokens) {
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
        tokens.next();
        break;
      }
      const arg = expression(tokens);
      if (!arg) {
        // TODO: Handle syntax error
      }
      args.push(arg);
    }
    return new CallNode(self, fun, args);
  }
}

class IfThenNode {
  condition;
  body;

  constructor(condition, body) {
    this.condition = condition;
    this.body = body;
  }

  static tryParse(tokens) {
    let token = tokens.peek();
    if (token.done || token.value != Tokens.IF) {
      return null;
    }

    tokens.next();
    const condition = expression(tokens);
    token = tokens.next();
    if (token.done || token.value != Tokens.THEN) {
      // TODO: Handle syntax error
      return null;
    }
    const body = statement(tokens);
    token = tokens.next();
    if (token.done || token.value != Tokens.END) {
      // TODO: Handle syntax error
      return null;
    }
    return new IfThenNode(condition, body);
  }
}

class ProgramNode {
  nodes;
  constructor() {
    this.nodes = [];
  }

  static tryParse(tokens) {
    return statement(tokens);
  }
}

class ValueNode {
  value;
  valueData;

  static NumberValue = "num";
  static StringValue = "str";
  static VariableRef = "varref";
  static BooleanValue = "bool";
  static TableValue = "table";

  constructor(value, valueData) {
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

function parse(tokens) {
  const peekableTokens = peekable(tokens.values());
  return ProgramNode.tryParse(peekableTokens);
}
