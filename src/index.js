import { initMixin } from './init.js';
import { lifecycleMixin } from './lifecycle.js';
import { renderMixin } from './vdom/index.js';

function Vue(options) {
  this._init(options);
}

initMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);

export default Vue;