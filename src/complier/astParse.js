// 匹配id="app"/id='app'/id=app
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
// 匹配开始标签的起始部分，如：<div
const startTagOpen = new RegExp(`^<${qnameCapture}`)
// 匹配开始标签的结束部分，如：>、/>
const startTagClose = /^\s*(\/?)>/
// 匹配结束标签，如：</div>
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

function parseHTMLToAST(html) {
  let root = null, currentParent, stack = [];
  while (html) {
    let startTagIndex = html.indexOf('<');
    if (startTagIndex === 0) {
      let match;
      // 如果为开始标签
      if (match = html.match(startTagOpen)) {
        advance(match[0]);
        let attrs = parseStartTag(); // 获取属性值
        start(match[1], attrs);
      }

      // 如果为结束标签
      if (match = html.match(endTag)) {
        end(match[1]);
        advance(match[0]);
      }
    }
    else {
      // 为文本
      let text = html.substring(0, startTagIndex);
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
    const element = createElement(tagName, 1, attrs);
    !root && (root = element);
    currentParent = element;
    stack.push(element);
  }
  
  function end(tagName) {
    console.log('---------结束---------');
    console.log(tagName);
    const element = stack.pop(),
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
      })
    }
  }
  
  function createElement(tag, type, attrs=[], children=[]) {
    return {
      tag,
      type,
      attrs,
      children
    }
  }

  function parseStartTag() {
    let attrs, end, attrList = [];
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
      })
    }
    end && advance(end[0]);
    return attrList;
  }
}

export {
  parseHTMLToAST
}