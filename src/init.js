import { compileToRender } from './complier/index.js';
import { mountComponent } from './lifecycle.js';

function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options;
    vm.$data = options.data;
    let el = vm.$options.el;
    if (el) {
      vm.$mount(el);
    }
  }

  Vue.prototype.$mount = function (el) {
    const vm = this,
      options = vm.$options;
    if (!options.render) {
      let template = options.template;
      el = document.querySelector(el);
      vm.$el = el;
      if (!template && el) {
        template = el.outerHTML;
      }
      options.render = compileToRender(template);
    }
    mountComponent(vm);
  }
}

export {
  initMixin
}