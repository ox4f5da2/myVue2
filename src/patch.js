function addAttr(dom, key, value) {
  switch (key) {
    case 'class':
      dom.className = value;
      break;
    case 'style':
      let str = '';
      for (let key in value) str += `${key}:${value[key]};`
      dom.style.cssText = str;
      break;
    default:
      dom.setAttribute(key, value);
      break;
  }
}

function addAttrs(dom, attrs) {
  for (let key in attrs) {
    addAttr(dom, key, attrs[key]);
  }
}

function createElement(vnode) {
  const { tag, attrs, children, text } = vnode;
  let dom = vnode.el = null;
  if (tag) {
    // 元素节点
    dom = document.createElement(tag);
    addAttrs(dom, attrs);
    children.forEach(item =>
      dom.appendChild(createElement(item)));
  } else {
    // 文本节点
    dom = document.createTextNode(text)
  }
  return dom;
}

function patch(oldNode, vnode) {
  const el = createElement(vnode),
    parent = oldNode.parentNode;
  console.log('真实DOM: ', el, '\n--------------------');
  parent.insertAdjacentElement('beforeend', el);
  parent.removeChild(oldNode);
}

export {
  patch
}