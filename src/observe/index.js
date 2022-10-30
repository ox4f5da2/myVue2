import { defineReactive } from '../defineReactive.js';
import { observe } from '../observe.js';
import { newMethods } from '../proxy/proxyArr.js';
import { def } from '../utils.js';
import Dep from './dep.js';

// 观察者类，用于观测数据使其成为响应式数据
function Observe(value) {
  // 给每个对象下增加dep，因为能到这的只能是对象
  this.dep = new Dep(value);
  // 在对象上添加Observe实例，代表已经监听并变成不可枚举的，否则就会死循环
  def(value, '__ob__', this, false);
  
  if (Array.isArray(value)) {
    // 如果是数组，需要重写七个方法，且更改数组的原型链
    value.__proto__ = newMethods;
    // 观测数组中的每一项
    this.observeArr(value);
  } else {
    // 观测对象
    this.walk(value);
  }
}

Observe.prototype.walk = function (data) {
  for (let key in data) {
    defineReactive(data, key, data[key]);
  }
}

Observe.prototype.observeArr = function (data) {
  for (let i = 0, len = data.length; i < len; i++) {
    observe(data[i]);
  }
}

export {
  Observe
}