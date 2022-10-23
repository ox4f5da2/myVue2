function createElement(tag, attrs, ...children) {
  return vnode(tag, attrs, children)
}

function createTextVode(text) {
  return vnode(undefined, undefined, undefined, text);
}

function vnode(tag, attrs, children, text) {
  return {
    tag,
    attrs,
    children,
    text
  }
}

export {
  createElement,
  createTextVode
}