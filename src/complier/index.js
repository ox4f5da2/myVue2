import { parseHTMLToAST } from './astParse.js';
import { generate } from './generate.js';

function compileToRender(html) {
  const ast = parseHTMLToAST(html);
  console.log('AST树: ', ast, '\n--------------------');
  const code = generate(ast);
  const render = new Function(`with(this){ return ${code} }`);
  console.log('render函数: ', render, '\n--------------------');
  return render;
}

export {
  compileToRender
}