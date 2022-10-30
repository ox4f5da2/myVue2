function proxyData(vm) {
  // 代理$data，能通过this.xxx直接访问属性
  const $data = vm.$data;
  for (let key in $data) {
    Object.defineProperty(vm, key, {
      get() {
        return $data[key];
      },
      set(newVal) {
        $data[key] = newVal;
      }
    })
  }
}

export {
  proxyData
}