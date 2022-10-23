import { createElement, createTextVode } from './vnode.js';

function renderMixin(Vue) {
  // 元素节点
  Vue.prototype._c = function() {
    return createElement(...arguments);
  }

  // 文本节点
  Vue.prototype._v = function(text) {
    return createTextVode(text);
  }

  // 变量
  Vue.prototype._s = function (value) {
    if (value === null) return;
    return typeof value === 'object' ? JSON.stringify(value) : value;
  }

  Vue.prototype._render = function () {
    const vm = this,
      render = vm.$options.render,
      vnode = render.call(vm);
    console.log("vnode: ", vnode, "\n--------------------");
    return vnode;
  }
}

export {
  renderMixin
}