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
Tokens.keywords = [
  Tokens.DO,
  Tokens.ELSE,
  Tokens.END,
  Tokens.FALSE,
  Tokens.FOR,
  Tokens.FUNCTION,
  Tokens.IF,
  Tokens.LOCAL,
  Tokens.THEN,
  Tokens.TRUE,
  Tokens.RETURN,
];

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
          throw "SyntaxError: expected `=` after `~`";
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
      case "-":
        // We treat comments as whitespace and do not pass them to the parser
        if (i + 1 < source.length && source[i + 1] == "-") {
          while (i < source.length && source[i] != "\n") {
            i++;
          }
        } else {
          throw "SyntaxError: expected `-` after `-`";
        }
        break;
      // Strings
      case '"':
        let chars = [];
        i += 1;
        while (i < source.length) {
          if (source[i] == '"') {
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
          const idx = Tokens.keywords.indexOf(string);
          if (idx > -1) {
            result.push(Tokens.keywords[idx]);
          } else {
            result.push(Tokens.ID, string);
          }
          continue;
        }
        throw "SyntaxError: unrecognized character: " + source[i];
    }
    i += 1;
  }
  return result;
}
