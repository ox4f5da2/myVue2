import bable from 'rollup-plugin-babel';

export default {
  input: './src/index.js', // 入口
  output: {
    file: './dist/vue.js', // 出口
    name: 'Vue', // global.Vue
    format: 'umd',
    sourcemap: true, // 可以调试源代码
  },
  plugins: [
    bable({
      exclude: 'node_modules/**', // 排除node_modules文件
    })
  ]
}