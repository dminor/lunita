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
        if (token != Tokens.ID) {
          // TODO: Handle syntax error
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
    // TODO: Handle syntax error
    return null;
  }
  token = tokens.next();
  if (token.done) {
    // TODO: Handle syntax error
    return null;
  }
  return token.value;
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

  visit(visitor) {
    visitor.visitCallNode(this);
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
      // TODO: Handle Syntax error
      return null;
    }
    const variable = ValueNode.tryParse(tokens);
    const initializer = AssignmentNode.tryParse(false, variable, tokens);
    token = tokens.next();
    if (token.done || token.value != Tokens.COMMA) {
      // TODO: Handle Syntax error
      return null;
    }
    const range = expression(tokens);
    token = tokens.next();
    if (token.done || token.value != Tokens.DO) {
      // TODO: Handle Syntax error
      return null;
    }
    const body = statement(tokens);
    token = tokens.next();
    if (token.done || token.value != Tokens.END) {
      // TODO: Handle Syntax error
      return null;
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
      return null;
    }
    tokens.next();
    let name = identifier(tokens);
    token = tokens.next();
    if (token.done || token.value != Tokens.LPAREN) {
      // TODO: Handle syntax error
      return null;
    }
    const parameters = [];
    while (true) {
      token = tokens.peek();
      if (token.done) {
        // TODO: Handle syntax error
        return null;
      }
      if (token.value == Tokens.RPAREN) {
        tokens.next();
        break;
      }
      let parameter = identifier(tokens);
      parameters.push(parameter);
      token = tokens.peek();
      if (token.done) {
        // TODO: Handle syntax error
        return null;
      }
      if (token.value == Tokens.COMMA) {
        tokens.next();
      }
    }
    const body = [];
    while (true) {
      token = tokens.peek();
      if (token.done) {
        // TODO: Handle syntax error
        return null;
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
      // TODO: Handle syntax error
      return null;
    }
    const index = expression(tokens);
    token = tokens.next();
    if (token.done || token.value != Tokens.RBRACKET) {
      // TODO: Handle syntax error
      return null;
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
      return null;
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
