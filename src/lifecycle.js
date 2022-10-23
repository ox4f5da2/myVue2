import { patch } from './patch.js';
function mountComponent(vm) {
  vm._update(vm._render());
}

function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this, el = vm.$el;
    // 在这里接受生成的虚拟DOM，然后转换为真实的DOM节点
    patch(el, vnode);
  }
}

export {
  mountComponent,
  lifecycleMixin
}