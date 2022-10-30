import nextTick from "../nextTick.js";
import Dep from "./dep.js";

// 存储组件中的变量
let id = 0;
let queue = []; // 存放待更新的watcher队列
let watcherSet = new Set(); // 去重存放watcher的id
let waiting = false; // 防抖

function Watcher(vm, fn) {
  this.id = id++; // 每个watcher的唯一标识符
  this.fn = fn;
  this.deps = []; // 记录watcher中的dep，实现计算属性和清理工作要用到
  this.depIds = new Set(); // 去重dep
  this.mountPage(); // 初次渲染页面 
}

Watcher.prototype.mountPage = function () {
  console.log('渲染页面: run...');
  Dep.target = this;
  this.fn();
  Dep.target = null;
}

Watcher.prototype.update = function () {
  // this.mountPage();
  // 批量处理更新，多次设置合并成一次渲染
  this.queueWatcher();
}

Watcher.prototype.addDep = function (dep) {
  const id = dep.id;
  // 如果watcher没有添加过当前的dep
  if (!this.depIds.has(id)) {
    this.deps.push(dep);
    this.depIds.add(id);
    dep.addWatcher(this);
  }
}

Watcher.prototype.queueWatcher = function () {
  const id = this.id;
  if (!watcherSet.has(id)) {
    queue.push(this);
    watcherSet.add(id);
    /**
     * 如果改变了不同组件的变量，那么会有不同的watcher待更新，因此需要等同步代码都执行完了
     * 一起更新，所以需要有waiting开关，使多次更新合并为一次更新，因为最后执行的时候所有的
     * 更新任务都存放在queue中了
     */
    if (!waiting) {
      nextTick(flashSchedulerQueue);
      waiting = true;
    }
  }
}

function flashSchedulerQueue() {
  // 让内部任务队列里的watcher进行更新操作并重置参数
  let queueCopy = queue.slice(0);
  queue.length = 0;
  watcherSet.clear();
  waiting = false;
  queueCopy.forEach(watcher => watcher.mountPage());
}

export default Watcher;