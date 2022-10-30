const defautTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

function genTextNode(text) {
  console.log("text: ", text);
  // 如果为纯文本则直接返回
  if (!defautTagRE.test(text)) return `_v(${JSON.stringify(text)})`;
  let match, index = 0, lastIndex = defautTagRE.lastIndex = 0;
  const tokens = [];
  // 如果为混合文本，先将每一部分存入tokens然后用+连接
  while (match = defautTagRE.exec(text)) {
    index = match.index;
    if (index > lastIndex) {
      tokens.push(JSON.stringify(text.substring(lastIndex, index)));
    }
    tokens.push(`_s(${match[1].trim()})`);
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push(JSON.stringify(text.substring(lastIndex)));
  }
  return `_v(${tokens.join("+")})`;
}

function genChildren(children) {
  // 防止产生多余的逗号，那么需要把子元素都收集起来再用逗号连接即可
  let str = [];
  children.forEach(item => {
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
  let obj = {};
  attrs.forEach(item => {
    if (item.name === 'style') {
      /**
       * 如果为style属性单独处理，将value按照:;分割，会形成数组，每两个为一组键值对，
       * 所以按照两个一起添加即可
       */
      const temp = item.value.split(/[:;]/);
      obj.style = {};
      for (let i = 0, len = Math.floor(temp.length / 2); i < len; i++) {
        obj.style[temp[i * 2].trim()] = temp[i * 2 + 1].trim();
      }
    } else {
      obj[item.name] = item.value;
    }
  })
  console.log("attrs: ", obj);
  return JSON.stringify(obj);
}

function generate(obj) {
  const children = genChildren(obj.children);
  return `_c("${obj.tag}",${obj.attrs.length ? genAtrrs(obj.attrs) : 'undefined'}${children ? `,${children}` : ''})`;
}

export {
  generate
}