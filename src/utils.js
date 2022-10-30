function def(obj, key, value, enumerable) {
  Object.defineProperty(obj, key, {
    writable: true,
    configurable: true,
    value,
    enumerable
  }) 
}

export {
  def
}