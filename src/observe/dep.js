// 收集依赖和通知watcher
let id = 0;
function Dep(val) {
  this.id = id++; // 每个dep的唯一标识符
  this.val = val;
  this.subscribe = []; // 存放含有这个变量的watcher
}

Dep.target = null;

Dep.prototype.depend = function () {
  // 首先询问watcher是否加过当前的dep
  // Dep.target有可能不存在，因为如果为基本类型就直接被return返回了，返回值为undefined
  if (Dep.target) {
    Dep.target.addDep(this); 
  }
}

Dep.prototype.addWatcher = function (watcher) {
  // watcher加了当前dep后，dep把当前的watcher加进去
  this.subscribe.push(watcher);
}

Dep.prototype.notify = function () {
  // 让subscribe里的每个watcher都进行更新
  this.subscribe.forEach(watcher => watcher.update())
}

export default Dep;