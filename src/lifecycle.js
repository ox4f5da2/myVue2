import { patch } from './patch.js';
import Watcher from './observe/watcher.js';

function mountComponent(vm) {
  const updateCompnent = () => vm._update(vm._render());
  const watcher = new Watcher(vm, updateCompnent);
  console.log('-------------\n当前页面的watcher: ', watcher, '\n-------------');
}

function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this, el = vm.$el;
    // 在这里接受生成的虚拟DOM，然后转换为真实的DOM节点，更新当前$el节点的值
    vm.$el = patch(el, vnode);
  }
}

export {
  mountComponent,
  lifecycleMixin
}