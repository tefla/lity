import * as util from "util";
import { _p } from "./parser";
import { interpretter, globalEnv } from "./interpreter";
function prettyPrint(x) {
  let opts = { depth: null, colors: true };
  let s = util.inspect(x, opts);
  console.log(s);
}

const parser = _p("File");

let ast = parser.tryParse(`
(defun square (y) (* y y))
(defun cube (z) (* z z z))
(defvar x 9)
(pr "Square of" x "is" (square x))
(pr "Cube Cube of" x "is" (cube (cube x)))
`);

interpretter(ast, globalEnv);
