import { observe } from "./observe.js";
import Dep from "./observe/dep.js";

function defineReactive(data, key, value) {
  let childOb = observe(value); // 递归观测并返回被观测对象或数组上的Observe实例
  let dep = new Dep(value); // 通过闭包让每个基本属性都有一个dep实例
  Object.defineProperty(data, key, {
    get() {
      console.log('数据劫持get操作', key, '->', value);
      // 只收集在渲染过程中模板中使用的变量，如果在外获取变量，target的值为null，就不收集
      if (Dep.target) {
        dep.depend();
        childOb && childOb.dep.depend(); // 让这个属性所在的数组或对象也进行依赖收集
      }
      return value;
    },
    set(newVal) {
      console.log('数据劫持set操作', newVal, '<-', value);
      // 如果没改变值那么直接返回
      if (value === newVal) return;
      // 观察更改的值，让其也变成响应式
      observe(newVal);
      value = newVal;
      dep.notify(); // 如果属性更新了那么就更新视图
    }
  })
}

export {
  defineReactive
}