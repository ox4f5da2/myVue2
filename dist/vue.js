(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  // 匹配id="app"/id='app'/id=app
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  // 匹配开始标签的起始部分，如：<div
  var startTagOpen = new RegExp("^<".concat(qnameCapture));
  // 匹配开始标签的结束部分，如：>、/>
  var startTagClose = /^\s*(\/?)>/;
  // 匹配结束标签，如：</div>
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));
  function parseHTMLToAST(html) {
    var root = null,
      currentParent,
      stack = [];
    while (html) {
      var startTagIndex = html.indexOf('<');
      if (startTagIndex === 0) {
        var match = void 0;
        // 如果为开始标签
        if (match = html.match(startTagOpen)) {
          advance(match[0]);
          var attrs = parseStartTag(); // 获取属性值
          start(match[1], attrs);
        }

        // 如果为结束标签
        if (match = html.match(endTag)) {
          end(match[1]);
          advance(match[0]);
        }
      } else {
        // 为文本
        var text = html.substring(0, startTagIndex);
        chars(text);
        advance(text);
      }
    }
    return root;
    function advance(text) {
      html = html.substring(text.length);
    }
    function start(tagName, attrs) {
      console.log('---------开始---------');
      console.log(tagName, attrs);
      var element = createElement(tagName, 1, attrs);
      !root && (root = element);
      currentParent = element;
      stack.push(element);
    }
    function end(tagName) {
      console.log('---------结束---------');
      console.log(tagName);
      var element = stack.pop(),
        parent = stack[stack.length - 1];
      // 遇到结束标签那么需要找该元素的父元素，如果stack没有说明其为根元素
      if (parent) {
        parent.children.push(element);
      }
    }
    function chars(text) {
      text = text.trim();
      // 如果文本节点不为空则加入，因为有时候为换行符等空白字符
      if (text) {
        console.log('---------文本---------');
        console.log(text);
        currentParent.children.push({
          type: 3,
          value: text.trim()
        });
      }
    }
    function createElement(tag, type) {
      var attrs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      var children = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
      return {
        tag: tag,
        type: type,
        attrs: attrs,
        children: children
      };
    }
    function parseStartTag() {
      var attrs,
        end,
        attrList = [];
      /**
       * 这里一定要先获取end，因为如果先获取attrs的话在匹配 > 或者 /> 的时候，
       * 就会因为attrs没有而直接跳出while循环，导致end没有值，那么就不能在结束
       * 循环后把开始标签的结束部分给删除掉了
       */
      while (!(end = html.match(startTagClose)) && (attrs = html.match(attribute))) {
        advance(attrs[0]);
        attrList.push({
          name: attrs[1],
          value: attrs[3] || attrs[4] || attrs[5]
        });
      }
      end && advance(end[0]);
      return attrList;
    }
  }

  var defautTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
  function genTextNode(text) {
    console.log("text: ", text);
    // 如果为纯文本则直接返回
    if (!defautTagRE.test(text)) return "_v(".concat(JSON.stringify(text), ")");
    var match,
      index = 0,
      lastIndex = defautTagRE.lastIndex = 0;
    var tokens = [];
    // 如果为混合文本，先将每一部分存入tokens然后用+连接
    while (match = defautTagRE.exec(text)) {
      index = match.index;
      if (index > lastIndex) {
        tokens.push(JSON.stringify(text.substring(lastIndex, index)));
      }
      tokens.push("_s(".concat(match[1].trim(), ")"));
      lastIndex = index + match[0].length;
    }
    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.substring(lastIndex)));
    }
    return "_v(".concat(tokens.join("+"), ")");
  }
  function genChildren(children) {
    // 防止产生多余的逗号，那么需要把子元素都收集起来再用逗号连接即可
    var str = [];
    children.forEach(function (item) {
      if (item.type === 1) {
        // 如果为元素节点就用generate函数产生一次
        str.push(generate(item));
      } else if (item.type === 3) {
        // 如果为文本节点
        str.push(genTextNode(item.value));
      }
    });
    return str.join(',');
  }
  function genAtrrs(attrs) {
    var obj = {};
    attrs.forEach(function (item) {
      if (item.name === 'style') {
        /**
         * 如果为style属性单独处理，将value按照:;分割，会形成数组，每两个为一组键值对，
         * 所以按照两个一起添加即可
         */
        var temp = item.value.split(/[:;]/);
        obj.style = {};
        for (var i = 0, len = Math.floor(temp.length / 2); i < len; i++) {
          obj.style[temp[i * 2].trim()] = temp[i * 2 + 1].trim();
        }
      } else {
        obj[item.name] = item.value;
      }
    });
    console.log("attrs: ", obj);
    return JSON.stringify(obj);
  }
  function generate(obj) {
    var children = genChildren(obj.children);
    return "_c(\"".concat(obj.tag, "\",").concat(obj.attrs.length ? genAtrrs(obj.attrs) : 'undefined').concat(children ? ",".concat(children) : '', ")");
  }

  function compileToRender(html) {
    var ast = parseHTMLToAST(html);
    console.log('AST树: ', ast, '\n--------------------');
    var code = generate(ast);
    var render = new Function("with(this){ return ".concat(code, " }"));
    console.log('render函数: ', render, '\n--------------------');
    return render;
  }

  function addAttr(dom, key, value) {
    switch (key) {
      case 'class':
        dom.className = value;
        break;
      case 'style':
        var str = '';
        for (var _key in value) {
          str += "".concat(_key, ":").concat(value[_key], ";");
        }
        dom.style.cssText = str;
        break;
      default:
        dom.setAttribute(key, value);
        break;
    }
  }
  function addAttrs(dom, attrs) {
    for (var key in attrs) {
      addAttr(dom, key, attrs[key]);
    }
  }
  function createElement$1(vnode) {
    var tag = vnode.tag,
      attrs = vnode.attrs,
      children = vnode.children,
      text = vnode.text;
    var dom = vnode.el = null;
    if (tag) {
      // 元素节点
      dom = document.createElement(tag);
      addAttrs(dom, attrs);
      children.forEach(function (item) {
        return dom.appendChild(createElement$1(item));
      });
    } else {
      // 文本节点
      dom = document.createTextNode(text);
    }
    return dom;
  }
  function patch(oldNode, vnode) {
    var el = createElement$1(vnode),
      parent = oldNode.parentNode;
    console.log('真实DOM: ', el, '\n--------------------');
    parent.insertAdjacentElement('beforeend', el);
    parent.removeChild(oldNode);
    return el;
  }

  /**
   * Vue内部的nextTick原理，nextTick的执行不是异步任务，只是将多次任务存放到队列中
   * 一起维护和更新，不过执行队列中的所有任务确实是利用浏览器的eventloop机制，也就是
   * 异步执行的
   */
  var callbackQueue = []; // 存放待执行的回调函数，可能是内部的或用户的
  var waiting$1 = false; // 等待同步代码执行完后再执行队列里的回调

  function nextTick(callback) {
    callbackQueue.push(callback);
    if (!waiting$1) {
      timeFunc(flashCallbackQueue);
      waiting$1 = true;
    }
  }
  function flashCallbackQueue() {
    var callbackQueueCopy = callbackQueue.slice(0);
    callbackQueue.length = 0;
    waiting$1 = false;
    callbackQueueCopy.forEach(function (cb) {
      return cb();
    });
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
      Promise.resolve().then(callback);
    } else if (MutationObserver) {
      // 这个方法需要观测一个DOM对象
      var observer = new MutationObserver(callback);
      var textNode = document.createTextNode('Origin Value');
      observer.observe(textNode, {
        characterData: true // 文本变化就执行callback
      });

      textNode.textContent = 'Updated Value';
    } else if (setImmediate) {
      setImmediate(callback);
    } else if (setTimeout) {
      setTimeout(callback);
    }
  }

  // 收集依赖和通知watcher
  var id$1 = 0;
  function Dep(val) {
    this.id = id$1++; // 每个dep的唯一标识符
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
  };
  Dep.prototype.addWatcher = function (watcher) {
    // watcher加了当前dep后，dep把当前的watcher加进去
    this.subscribe.push(watcher);
  };
  Dep.prototype.notify = function () {
    // 让subscribe里的每个watcher都进行更新
    this.subscribe.forEach(function (watcher) {
      return watcher.update();
    });
  };

  // 存储组件中的变量
  var id = 0;
  var queue = []; // 存放待更新的watcher队列
  var watcherSet = new Set(); // 去重存放watcher的id
  var waiting = false; // 防抖

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
  };
  Watcher.prototype.update = function () {
    // this.mountPage();
    // 批量处理更新，多次设置合并成一次渲染
    this.queueWatcher();
  };
  Watcher.prototype.addDep = function (dep) {
    var id = dep.id;
    // 如果watcher没有添加过当前的dep
    if (!this.depIds.has(id)) {
      this.deps.push(dep);
      this.depIds.add(id);
      dep.addWatcher(this);
    }
  };
  Watcher.prototype.queueWatcher = function () {
    var id = this.id;
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
  };
  function flashSchedulerQueue() {
    // 让内部任务队列里的watcher进行更新操作并重置参数
    var queueCopy = queue.slice(0);
    queue.length = 0;
    watcherSet.clear();
    waiting = false;
    queueCopy.forEach(function (watcher) {
      return watcher.mountPage();
    });
  }

  function mountComponent(vm) {
    var updateCompnent = function updateCompnent() {
      return vm._update(vm._render());
    };
    var watcher = new Watcher(vm, updateCompnent);
    console.log('-------------\n当前页面的watcher: ', watcher, '\n-------------');
  }
  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      var vm = this,
        el = vm.$el;
      // 在这里接受生成的虚拟DOM，然后转换为真实的DOM节点，更新当前$el节点的值
      vm.$el = patch(el, vnode);
    };
  }

  function proxyData(vm) {
    // 代理$data，能通过this.xxx直接访问属性
    var $data = vm.$data;
    var _loop = function _loop(key) {
      Object.defineProperty(vm, key, {
        get: function get() {
          return $data[key];
        },
        set: function set(newVal) {
          $data[key] = newVal;
        }
      });
    };
    for (var key in $data) {
      _loop(key);
    }
  }

  function observe(value) {
    // 不对基础类型进行观察
    if (_typeof(value) !== 'object' || value === null) return;
    if (value.__ob__ instanceof Observe) {
      // 如果观察过了就不观察
      return value.__ob__;
    }
    // 没观察过该对象就进行观察
    return new Observe(value);
  }

  function defineReactive(data, key, value) {
    var childOb = observe(value); // 递归观测并返回被观测对象或数组上的Observe实例
    var dep = new Dep(value); // 通过闭包让每个基本属性都有一个dep实例
    Object.defineProperty(data, key, {
      get: function get() {
        console.log('数据劫持get操作', key, '->', value);
        // 只收集在渲染过程中模板中使用的变量，如果在外获取变量，target的值为null，就不收集
        if (Dep.target) {
          dep.depend();
          childOb && childOb.dep.depend(); // 让这个属性所在的数组或对象也进行依赖收集
        }

        return value;
      },
      set: function set(newVal) {
        console.log('数据劫持set操作', newVal, '<-', value);
        // 如果没改变值那么直接返回
        if (value === newVal) return;
        // 观察更改的值，让其也变成响应式
        observe(newVal);
        value = newVal;
        dep.notify(); // 如果属性更新了那么就更新视图
      }
    });
  }

  function def(obj, key, value, enumerable) {
    Object.defineProperty(obj, key, {
      writable: true,
      configurable: true,
      value: value,
      enumerable: enumerable
    });
  }

  var METHODS = ['push', 'pop', 'unshift', 'shift', 'sort', 'reverse', 'splice'];
  var arrayPrototypeCopy = Array.prototype,
    newMethods = Object.create(arrayPrototypeCopy);
  var _loop = function _loop() {
    var m = _METHODS[_i];
    def(newMethods, m, function () {
      var args = Array.prototype.slice.call(arguments);
      var res = arrayPrototypeCopy[m].apply(this, args);
      var ob = this.__ob__;
      console.log('监听数组的', m, '方法');
      // 监听修改数组的操作，如果添加的元素中有对象也要监听
      var addElement;
      switch (m) {
        case 'push':
        case 'unshift':
          addElement = args;
          break;
        case 'splice':
          // 因为splice添加的元素得从第三个开始算
          addElement = args.slice(2);
          break;
      }

      // 如果有添加的元素就进行观察
      addElement && ob.observeArr(addElement);
      // 如果数组更新了那么就更新页面
      ob.dep.notify();
      return res;
    }, false);
  };
  for (var _i = 0, _METHODS = METHODS; _i < _METHODS.length; _i++) {
    _loop();
  }

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
    for (var key in data) {
      defineReactive(data, key, data[key]);
    }
  };
  Observe.prototype.observeArr = function (data) {
    for (var i = 0, len = data.length; i < len; i++) {
      observe(data[i]);
    }
  };

  function initMixin(Vue) {
    function initState(vm) {
      var options = vm.$options;
      // 初始化data数据
      options.data && initData(vm);
    }
    function initData(vm) {
      var data = vm.$options.data,
        type = _typeof(data);
      // 如果data为函数那么就调用，并修改this指向，不修改指向GlobalThis，如果为对象就赋值给data
      if (!['object', 'function'].includes(type) || data === null) {
        throw new Error('data must be a object!');
      }
      vm.$data = data = type === 'function' ? data.call(vm) : data;
      proxyData(vm);
      new Observe(vm.$data);
    }
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options;
      vm.$data = options.data;
      vm.$nextTick = nextTick;
      // 初始化数据
      initState(vm);
      var el = vm.$options.el;
      if (el) {
        // 渲染页面
        vm.$mount(el);
      }
    };
    Vue.prototype.$mount = function (el) {
      var vm = this,
        options = vm.$options;
      if (!options.render) {
        // 获取模板，可能是options里的template也可能是DOM
        var template = options.template;
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
    };
  }

  function createElement(tag, attrs) {
    for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }
    return vnode(tag, attrs, children);
  }
  function createTextVode(text) {
    return vnode(undefined, undefined, undefined, text);
  }
  function vnode(tag, attrs, children, text) {
    return {
      tag: tag,
      attrs: attrs,
      children: children,
      text: text
    };
  }

  function renderMixin(Vue) {
    // 元素节点
    Vue.prototype._c = function () {
      return createElement.apply(void 0, arguments);
    };

    // 文本节点
    Vue.prototype._v = function (text) {
      return createTextVode(text);
    };

    // 变量
    Vue.prototype._s = function (value) {
      if (value === null) return;
      return _typeof(value) === 'object' ? JSON.stringify(value) : value;
    };
    Vue.prototype._render = function () {
      var vm = this,
        render = vm.$options.render,
        vnode = render.call(vm);
      console.log("vnode: ", vnode, "\n--------------------");
      return vnode;
    };
  }

  function Vue(options) {
    this._init(options);
  }
  initMixin(Vue);
  lifecycleMixin(Vue);
  renderMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
