import { Observe } from "./observe/index.js"

function observe(value) {
  // 不对基础类型进行观察
  if (typeof value !== 'object' || value === null) return;
  if (value.__ob__ instanceof Observe) {
    // 如果观察过了就不观察
    return value.__ob__;
  }
  // 没观察过该对象就进行观察
  return new Observe(value);
}

export {
  observe
}