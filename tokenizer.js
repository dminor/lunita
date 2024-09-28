export { Tokens, tokenize };

const Tokens = {
  // Symbols
  COLON: ":",
  COMMA: ",",
  DOT: ".",
  EQ: "=",
  LBRACE: "{",
  LBRACKET: "[",
  LPAREN: "(",
  NEQ: "~=",
  RBRACE: "}",
  RBRACKET: "]",
  RPAREN: ")",

  // Keywords
  DO: "do",
  ELSE: "else",
  END: "end",
  FOR: "for",
  FALSE: "false",
  FUNCTION: "function",
  IF: "if",
  LOCAL: "local",
  THEN: "then",
  TRUE: "true",
  RETURN: "return",

  // Literals
  NUM: "num",
  STR: "str",
  ID: "id",
};

function tokenize(source) {
  let result = [];
  let i = 0;
  while (i < source.length) {
    switch (source[i]) {
      case ":":
        result.push(Tokens.COLON);
        break;
      case ",":
        result.push(Tokens.COMMA);
        break;
      case ".":
        result.push(Tokens.DOT);
        break;
      case "=":
        result.push(Tokens.EQ);
        break;
      case "{":
        result.push(Tokens.LBRACE);
        break;
      case "[":
        result.push(Tokens.LBRACKET);
        break;
      case "(":
        result.push(Tokens.LPAREN);
        break;
      case "~":
        if (i + 1 < source.length && source[i + 1] == "=") {
          i += 1;
          result.push(Tokens.NEQ);
        } else {
          // TODO: Handle error
        }
        break;
      case "}":
        result.push(Tokens.RBRACE);
        break;
      case "]":
        result.push(Tokens.RBRACKET);
        break;
      case ")":
        result.push(Tokens.RPAREN);
        break;
      // Whitespace
      case " ":
        break;
      case "\n":
        break;
      // Strings
      case '"':
        let chars = [];
        i += 1;
        while (i < source.length) {
          if (source[i] == '"') {
            i += 1;
            break;
          }
          chars.push(source[i]);
          i += 1;
        }
        result.push(Tokens.STR, chars.join(""));
        break;
      default:
        const matchedNumber = /^[\d]+/.exec(source.substring(i));
        if (matchedNumber) {
          const number = matchedNumber[0];
          i += number.length;
          result.push(Tokens.NUM, parseInt(number));
          continue;
        }
        const matchedString = /^[\w]+/.exec(source.substring(i));
        if (matchedString) {
          const string = matchedString[0];
          i += string.length;
          if (string == Tokens.DO) {
            result.push(Tokens.DO);
          } else if (string == Tokens.ELSE) {
            result.push(Tokens.ELSE);
          } else if (string == Tokens.END) {
            result.push(Tokens.END);
          } else if (string == Tokens.FALSE) {
            result.push(Tokens.FALSE);
          } else if (string == Tokens.FOR) {
            result.push(Tokens.FOR);
          } else if (string == Tokens.FUNCTION) {
            result.push(Tokens.FUNCTION);
          } else if (string == Tokens.IF) {
            result.push(Tokens.IF);
          } else if (string == Tokens.LOCAL) {
            result.push(Tokens.LOCAL);
          } else if (string == Tokens.THEN) {
            result.push(Tokens.THEN);
          } else if (string == Tokens.TRUE) {
            result.push(Tokens.TRUE);
          } else if (string == Tokens.RETURN) {
            result.push(Tokens.RETURN);
          } else {
            result.push(Tokens.ID, string);
          }
          continue;
        }
        // TODO: Handle syntax error
        break;
    }
    i += 1;
  }
  return result;
}
