/**
 * Vue内部的nextTick原理，nextTick的执行不是异步任务，只是将多次任务存放到队列中
 * 一起维护和更新，不过执行队列中的所有任务确实是利用浏览器的eventloop机制，也就是
 * 异步执行的
 */
let callbackQueue = []; // 存放待执行的回调函数，可能是内部的或用户的
let waiting = false; // 等待同步代码执行完后再执行队列里的回调

function nextTick(callback) {
  callbackQueue.push(callback);
  if (!waiting) {
    timeFunc(flashCallbackQueue)
    waiting = true;
  }
}

function flashCallbackQueue() {
  const callbackQueueCopy = callbackQueue.slice(0);
  callbackQueue.length = 0;
  waiting = false;
  callbackQueueCopy.forEach(cb => cb());
}

function timeFunc(callback) {
  /**
   * 采用优雅降级处理：
   * 1.优先采用Promise
   * 2.如果没有就用MutationObserver
   * 3.再没有用setImmediate
   * 4.最后才使用setTimeout
   */
  if (Promise) {
    Promise
      .resolve()
      .then(callback)
  } else if (MutationObserver) {
    // 这个方法需要观测一个DOM对象
    const observer = new MutationObserver(callback);
    const textNode = document.createTextNode('Origin Value');
    observer.observe(textNode, {
      characterData: true // 文本变化就执行callback
    })
    textNode.textContent = 'Updated Value';
  } else if (setImmediate) {
    setImmediate(callback);
  } else if (setTimeout) {
    setTimeout(callback);
  }
}

export default nextTick