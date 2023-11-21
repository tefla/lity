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
(defvar x 3)
(pr (square x))
`);

interpretter(ast, globalEnv);
