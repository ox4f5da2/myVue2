import { compileToRender } from './complier/index.js';
import { mountComponent } from './lifecycle.js';
import { proxyData } from './proxy/index.js';
import { Observe } from './observe/index.js';
import nextTick from './nextTick.js';

function initMixin(Vue) {

  function initState(vm) {
    const options = vm.$options;
    // 初始化data数据
    options.data && initData(vm);
  }
  
  function initData(vm) {
    let data = vm.$options.data, type = typeof data;
    // 如果data为函数那么就调用，并修改this指向，不修改指向GlobalThis，如果为对象就赋值给data
    if (!(['object', 'function'].includes(type)) || data === null) {
      throw new Error('data must be a object!');
    }
    vm.$data = data = (type === 'function' ? data.call(vm) : data);
    proxyData(vm);
    new Observe(vm.$data);
  }

  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options;
    vm.$data = options.data;
    vm.$nextTick = nextTick;
    // 初始化数据
    initState(vm)

    let el = vm.$options.el;
    if (el) {
      // 渲染页面
      vm.$mount(el);
    }
  }

  Vue.prototype.$mount = function (el) {
    const vm = this,
      options = vm.$options;
    if (!options.render) {
      // 获取模板，可能是options里的template也可能是DOM
      let template = options.template;
      el = document.querySelector(el);
      vm.$el = el;
      if (!template && el) {
        template = el.outerHTML;
      }
      // 将模板编译为render函数
      options.render = compileToRender(template);
    }
    // 渲染组件
    mountComponent(vm);
  }
}

export {
  initMixin
}