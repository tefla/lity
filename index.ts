import * as util from "util";
import { registerFileParser } from "./parser";
import { interpretter, globalEnv } from "./interpreter";
function prettyPrint(x) {
  let opts = { depth: null, colors: true };
  let s = util.inspect(x, opts);
  console.log(s);
}

const parser = registerFileParser(interpretter, globalEnv);

let ast = parser.tryParse(`
"Hello World"

(defun square (y) (* y y))
(defun cube2 (z) (* (square z) (square z)))
(defvar x 2)
(defun bla (a b) (+ a b))
(defun inc (a) (+ a 1))
(defvar y 10)

(pr "Square of" x "is" (square x))
(pr "Cube Cube of" x "is" (cube2 (cube2 x)))
(pr "bla" (bla (inc 1) 2))

`);
console.log(globalEnv["cube2"](42));
//interpretter(ast, globalEnv);
