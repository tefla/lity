import * as util from "util";
import { _p } from "./parser";

function standardEnvironment() {
  return {
    "+": (...args: number[]) => args.reduce((acc, val) => acc + val),
    "-": (...args: number[]) => args.reduce((acc, val) => acc - val),
    "*": (...args: number[]) => args.reduce((acc, val) => acc * val),
    "/": (...args: number[]) => args.reduce((acc, val) => acc / val),
    // ">": (x: number) => x > x,
    // "<": (x: number) => x < x,
    // ">=": (x: number) => x >= x,
    // "<=": (x: number) => x <= x,
    // "=": (x: number) => x === x,
    // abs: (x: number) => Math.abs(x),
    // apply: (proc: any, args: any) => proc(...args),
    // "eq?": (x: any, y: any) => x == y,
    // "equal?": (x: any, y: any) => x === y,
    // list: (x: any) => new Array(x),
    // "list?": (x: any) => x.isArray(),
    // not: (x: any) => !x,
    // "null?": (x: any) => x === undefined || x === null,
    defun: (name: string, args: any, body: any) => {},
    pr: (...args: any[]) => console.log(...args),
  };
}

const globalEnv = standardEnvironment();

const expr = ([firstArg, ...rest], env) => {
  const name = rest[0].value;
  switch (firstArg.value) {
    case "defvar":
      env[name] = rest[1].value;
      return;
    case "defun":
      const args = rest[1].value;
      const body = rest[2];
      function _fn() {
        const newEnv = {
          ...env,
        };
        for (let i = 0; i < args.length; i++) {
          newEnv[args[i].value] = arguments[i];
        }
        return interpretter(body, newEnv);
      }
      env[name] = _fn;
      return;
    default:
      // If we are here, we are calling a function.
      // The first element of the list is the function name.
      const fn = env[firstArg.value];

      // The rest of the elements are the arguments.
      const vals = rest.map((ast) => interpretter(ast, env));
      if (typeof fn !== "function") {
        throw new Error("Not a function: " + ast.value[0].value);
      }
      return fn(...vals);
  }
};

const interpretter = (ast, env) => {
  const _interpretter = (ast) => {
    switch (ast.type) {
      case "file":
        return ast.value.map(_interpretter);
      case "list":
        return expr(ast.value, env);

      case "symbol":
        // If we are here, we are looking up a variable.
        const value = env[ast.value];
        return value;
      case "number":
        return ast.value;
      case "string":
        return ast.value;
      default:
        throw new Error("Unknown type: " + ast.type);
    }
  };

  return _interpretter(ast);
};

function prettyPrint(x) {
  let opts = { depth: null, colors: true };
  let s = util.inspect(x, opts);
  console.log(s);
}

const parser = _p("File");

let ast = parser.tryParse(`
(defun square (y) (* y y))
(defvar x 3)
(pr (square x))
`);

interpretter(ast, globalEnv);
