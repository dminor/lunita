export {
  parse,
  AssignmentNode,
  BinaryOperationNode,
  CallNode,
  ForLoopNode,
  FunctionNode,
  IfThenNode,
  IndexNode,
  ReturnNode,
  ValueNode,
};

import { Tokens } from "./tokenizer.js";

function peekable(iter) {
  let state = iter.next();

  const peekableIterator = (function* () {
    while (!state.done) {
      const current = state;
      state = iter.next();
      yield current.value;
    }
    return state;
  })();

  peekableIterator.peek = function () {
    return state;
  };

  return peekableIterator;
}

function expression(tokens) {
  let node = ValueNode.tryParse(tokens);
  // See if this variable reference is actually a function call or index
  if (node.value == ValueNode.VariableRef) {
    const peeked = tokens.peek();
    if (!peeked.done) {
      if (peeked.value == Tokens.LPAREN) {
        node = CallNode.tryParse(undefined, node.valueData, tokens);
      } else if (peeked.value == Tokens.DOT) {
        tokens.next();
        const token = tokens.next();
        if (token.value !== Tokens.ID) {
          throw "SyntaxError: Expected identifier";
        }
        const method = tokens.next();
        node = CallNode.tryParse(node.valueData, method.value, tokens);
      } else if (peeked.value == Tokens.LBRACKET) {
        node = IndexNode.tryParse(node.valueData, tokens);
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

function identifier(tokens) {
  let token = tokens.next();
  if (token.done || token.value != Tokens.ID) {
    throw "SyntaxError: Expected identifier";
  }
  token = tokens.next();
  if (token.done) {
    throw "SyntaxError: Unexpected end of input";
  }
  return token.value;
}

function statement(tokens) {
  let token = tokens.peek();
  if (token.done) {
    throw "SyntaxError: Unexpected end of input";
  }
  if (token.value == Tokens.LOCAL) {
    tokens.next();
    const lhs = ValueNode.tryParse(tokens);
    return AssignmentNode.tryParse(true, lhs, tokens);
  }
  if (token.value == Tokens.FOR) {
    return ForLoopNode.tryParse(tokens);
  }
  if (token.value == Tokens.FUNCTION) {
    return FunctionNode.tryParse(tokens);
  }
  if (token.value == Tokens.RETURN) {
    return ReturnNode.tryParse(tokens);
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
  lhs;
  rhs;
  constructor(local, lhs, rhs) {
    this.local = local;
    this.lhs = lhs;
    this.rhs = rhs;
  }

  visit(visitor) {
    visitor.visitAssignmentNode(this);
  }

  static tryParse(isLocal, lhs, tokens) {
    if (lhs instanceof ValueNode && lhs.value != ValueNode.VariableRef) {
      throw "SyntaxError: Expected variable reference";
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

  visit(visitor) {
    visitor.visitBinaryOperationNode(this);
  }

  static tryParse(lhs, tokens) {
    const peeked = tokens.peek();
    if (!peeked.done) {
      if (peeked.value == Tokens.NEQ) {
        tokens.next();
        const rhs = expression(tokens);
        if (!rhs) {
          throw "SyntaxError: Expected expression";
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

  visit(visitor) {
    visitor.visitCallNode(this);
  }

  static tryParse(self, fun, tokens) {
    let token = tokens.next();
    if (token.done || token.value != Tokens.LPAREN) {
      throw "SyntaxError: Expected `)`";
    }
    // Parse arguments
    let args = [];
    while (true) {
      token = tokens.peek();
      if (token.done) {
        throw "SyntaxError: Unexpected end of input";
      }
      if (token.value == Tokens.RPAREN) {
        tokens.next();
        break;
      }
      const arg = expression(tokens);
      if (!arg) {
        throw "SyntaxError: Expected expression while parsing arguments";
      }
      args.push(arg);
      token = tokens.peek();
      if (token.value == Tokens.COMMA) {
        tokens.next();
      }
    }
    return new CallNode(self, fun, args);
  }
}

class ForLoopNode {
  initializer;
  range;
  body;

  constructor(initializer, range, body) {
    this.initializer = initializer;
    this.initializer.local = true;
    this.range = range;
    this.body = body;
  }

  visit(visitor) {
    visitor.visitForLoopNode(this);
  }

  static tryParse(tokens) {
    let token = tokens.next();
    if (token.done || token.value != Tokens.FOR) {
      throw "SyntaxError: Expected `for`";
    }
    const variable = ValueNode.tryParse(tokens);
    const initializer = AssignmentNode.tryParse(false, variable, tokens);
    token = tokens.next();
    if (token.done || token.value != Tokens.COMMA) {
      throw "SyntaxError: Expected `,`";
    }
    const range = expression(tokens);
    token = tokens.next();
    if (token.done || token.value != Tokens.DO) {
      throw "SyntaxError: Expected `do`";
    }
    const body = [];
    while (true) {
      body.push(statement(tokens));
      token = tokens.peek();
      if (token.done) {
        throw "SyntaxError: Unexpected end of input";
      }
      if (token.value == Tokens.END) {
        tokens.next();
        break;
      }
    }
    return new ForLoopNode(initializer, range, body);
  }
}

class FunctionNode {
  name;
  parameters;
  body;

  constructor(name, parameters, body) {
    this.name = name;
    this.parameters = parameters;
    this.body = body;
  }

  visit(visitor) {
    visitor.visitFunctionNode(this);
  }

  static tryParse(tokens) {
    let token = tokens.peek();
    if (token.done || token.value != Tokens.FUNCTION) {
      throw "SyntaxError: Expected `function`";
    }
    tokens.next();
    let name = identifier(tokens);
    token = tokens.next();
    if (token.done || token.value != Tokens.LPAREN) {
      throw "SyntaxError: Expected `)`";
    }
    const parameters = [];
    while (true) {
      token = tokens.peek();
      if (token.done) {
        throw "SyntaxError: Unexpected end of input";
      }
      if (token.value == Tokens.RPAREN) {
        tokens.next();
        break;
      }
      let parameter = identifier(tokens);
      parameters.push(parameter);
      token = tokens.peek();
      if (token.done) {
        throw "SyntaxError: Unexpected end of input";
      }
      if (token.value == Tokens.COMMA) {
        tokens.next();
      }
    }
    const body = [];
    while (true) {
      token = tokens.peek();
      if (token.done) {
        throw "SyntaxError: Unexpected end of input";
      }
      if (token.value == Tokens.END) {
        tokens.next();
        break;
      }
      body.push(statement(tokens));
    }
    return new FunctionNode(name, parameters, body);
  }
}

class IfThenNode {
  condition;
  body;

  constructor(condition, body) {
    this.condition = condition;
    this.body = body;
  }

  visit(visitor) {
    visitor.visitIfThenNode(this);
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
      throw "SyntaxError: Expected `then`";
    }
    const body = statement(tokens);
    token = tokens.next();
    if (token.done || token.value != Tokens.END) {
      throw "SyntaxError: Expected `then`";
    }
    return new IfThenNode(condition, body);
  }
}

class IndexNode {
  identifier;
  index;

  constructor(identifier, index) {
    this.identifier = identifier;
    this.index = index;
  }

  visit(visitor) {
    visitor.visitIndexNode(this);
  }

  static tryParse(identifier, tokens) {
    let token = tokens.next();
    if (token.done || token.value != Tokens.LBRACKET) {
      throw "SyntaxError: Expected `[`";
    }
    const index = expression(tokens);
    token = tokens.next();
    if (token.done || token.value != Tokens.RBRACKET) {
      throw "SyntaxError: Expected `]`";
    }
    return new IndexNode(identifier, index);
  }
}

class ReturnNode {
  value;

  constructor(value) {
    this.value = value;
  }

  visit(visitor) {
    visitor.visitReturnNode(this);
  }

  static tryParse(tokens) {
    let token = tokens.peek();
    if (token.done || token.value != Tokens.RETURN) {
      throw "SyntaxError: Expected `return`";
    }
    tokens.next();
    return new ReturnNode(expression(tokens));
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

  visit(visitor) {
    visitor.visitValueNode(this);
  }

  static tryParse(tokens) {
    const peeked = tokens.peek();
    if (peeked.done) {
      throw "SyntaxError: Unexpected end of input";
    }
    if (peeked.value == Tokens.NUM) {
      tokens.next();
      const data = tokens.next();
      if (data.done) {
        throw "SyntaxError: Unexpected end of input";
      }
      return new ValueNode(ValueNode.NumberValue, data.value);
    } else if (peeked.value == Tokens.STR) {
      tokens.next();
      const data = tokens.next();
      if (data.done) {
        throw "SyntaxError: Unexpected end of input";
      }
      return new ValueNode(ValueNode.StringValue, data.value);
    } else if (peeked.value == Tokens.ID) {
      tokens.next();
      const data = tokens.next();
      if (data.done) {
        throw "SyntaxError: Unexpected end of input";
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
        throw "SyntaxError: Expected `]`";
      }
      return new ValueNode(ValueNode.TableValue);
    }
    return null;
  }
}

function parse(tokens) {
  const peekableTokens = peekable(tokens.values());
  const nodes = [];
  while (true) {
    const token = peekableTokens.peek();
    if (token.done) {
      break;
    }
    nodes.push(statement(peekableTokens));
  }
  return nodes;
}
