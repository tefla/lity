import * as P from "parsimmon";
import { parse } from "path";
import * as util from "util";

export class AstNode {
  constructor(public type: string, public value: any) {}
}
export class AstList extends AstNode {
  constructor(public value: AstNode[]) {
    super("list", value);
  }
}
export class AstSymbol extends AstNode {
  constructor(public value: string) {
    super("symbol", value);
  }
}
export class AstNumber extends AstNode {
  constructor(public value: number) {
    super("number", value);
  }
}
export class AstString extends AstNode {
  constructor(public value: string) {
    super("string", value);
  }
}

export class AstFile extends AstNode {
  constructor(public value: AstNode[]) {
    super("file", value);
  }
}

export const _parsers = {};
export const _p = (parser: string, obj?: any) => {
  if (obj) {
    _parsers[parser] = P.lazy(obj);
  }
  return _parsers[parser];
};

// Turn escaped characters into real ones (e.g. "\\n" becomes "\n").
export const interpretEscapes = (str) => {
  const escapes = {
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t",
  };
  return str.replace(/\\(u[0-9a-fA-F]{4}|[^u])/, (_, escape) => {
    let type = escape.charAt(0);
    let hex = escape.slice(1);
    if (type === "u") {
      return String.fromCharCode(parseInt(hex, 16));
    }
    if (escapes.hasOwnProperty(type)) {
      return escapes[type];
    }
    return type;
  });
};

// Use the JSON standard's definition of whitespace rather than Parsimmon's.
//let whitespace = P.regexp(/\s*/m);
export const whitespace = P.regexp(/(?:\s|;.*)*/m);

// JSON is pretty relaxed about whitespace, so let's make it easy to ignore
// after most text.
export const token = (parser) => parser.skip(whitespace);

// Several parsers are just strings with optional whitespace.
export const word = (str) => P.string(str).thru(token);

// An expression is just any of the other values we make in the language. Note
// that because we're using `.createLanguage` here we can reference other
// parsers off of the argument to our function. `r` is short for `rules` here.
_p("Expression", () =>
  P.alt(_p("String"), _p("Number"), _p("List"), _p("Symbol"))
);
_p("String", () =>
  P.regexp(/"((?:\\.|.)*?)"/, 1)
    .map(interpretEscapes)
    .map((str) => new AstString(str))
    .desc("string")
);
// The basic parsers (usually the ones described via regexp) should have a
// description for error message purposes.
_p("Symbol", () =>
  token(
    P.regexp(/[^\s()"]+/)
      .desc("symbol")
      .map((str) => new AstSymbol(str))
  )
);
// Note that Number("10") === 10, Number("9") === 9, etc in JavaScript.
// This is not a recursive parser. Number(x) is similar to parseInt(x, 10).
_p("Number", () =>
  token(
    P.regexp(/[0-9]+/)
      .map((x) => parseInt(x, 10))
      .map((n) => new AstNumber(n))
      .desc("number")
  )
);
// `.trim(P.optWhitespace)` removes whitespace from both sides, then `.many()`
// repeats the expression zero or more times. Finally, `.wrap(...)` removes
// the '(' and ')' from both sides of the list.
_p("List", () =>
  _p("Expression")
    .trim(P.optWhitespace)
    .many()
    .wrap(word("("), word(")"))
    .map((list) => new AstList(list))
);
// A file in Lisp is generally just zero or more expressions.
export const registerFileParser = (interpreter, env) =>
  _p("File", () =>
    _p("Expression")
      .map((x) => {
        interpreter(x, env);
        return x;
      })
      .trim(P.optWhitespace)
      .many()
      .map((list) => new AstFile(list))
  );
