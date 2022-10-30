import { def } from "../utils.js";

const METHODS = [
  'push',
  'pop',
  'unshift',
  'shift',
  'sort',
  'reverse',
  'splice'
];

const arrayPrototypeCopy = Array.prototype,
  newMethods = Object.create(arrayPrototypeCopy);

for (let m of METHODS) {
  def(newMethods, m, function () {
    const args = Array.prototype.slice.call(arguments);
    const res = arrayPrototypeCopy[m].apply(this, args);
    const ob = this.__ob__;
    console.log('监听数组的', m, '方法');
    // 监听修改数组的操作，如果添加的元素中有对象也要监听
    let addElement;
    switch (m) {
      case 'push':
      case 'unshift':
        addElement = args;
        break;
      case 'splice':
        // 因为splice添加的元素得从第三个开始算
        addElement = args.slice(2);
        break;
      default:
        break;
    }

    // 如果有添加的元素就进行观察
    addElement && ob.observeArr(addElement);
    // 如果数组更新了那么就更新页面
    ob.dep.notify();
    return res;
  }, false);
}

export {
  newMethods
}