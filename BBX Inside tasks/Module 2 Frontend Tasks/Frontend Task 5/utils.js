function assertArrayAndCallback(array, callback, name) {
  if (!Array.isArray(array)) {
    throw new TypeError(`${name} expects an array`);
  }
  if (typeof callback !== 'function') {
    throw new TypeError(`${name} expects a callback`);
  }
}

function myMap(array, callback, thisArg) {
  assertArrayAndCallback(array, callback, 'myMap');
  const result = new Array(array.length);
  for (let index = 0; index < array.length; index++) {
    if (index in array) {
      result[index] = callback.call(thisArg, array[index], index, array);
    }
  }
  return result;
}

function myFilter(array, callback, thisArg) {
  assertArrayAndCallback(array, callback, 'myFilter');
  const result = [];
  for (let index = 0; index < array.length; index++) {
    if (index in array && callback.call(thisArg, array[index], index, array)) {
      result.push(array[index]);
    }
  }
  return result;
}

function myReduce(array, callback, initialValue) {
  assertArrayAndCallback(array, callback, 'myReduce');
  const hasInitialValue = arguments.length >= 3;
  let index = 0;
  let accumulator = initialValue;

  if (!hasInitialValue) {
    while (index < array.length && !(index in array)) {
      index++;
    }
    if (index === array.length) {
      throw new TypeError('myReduce of empty array with no initial value');
    }
    accumulator = array[index];
    index++;
  }

  for (; index < array.length; index++) {
    if (index in array) {
      accumulator = callback(accumulator, array[index], index, array);
    }
  }
  return accumulator;
}

function memoize(fn) {
  if (typeof fn !== 'function') {
    throw new TypeError('memoize expects a function');
  }

  const cachedValue = Symbol('cachedValue');
  const cache = new Map();

  return function memoized(...args) {
    let node = cache;
    const keys = [this, ...args];

    for (const key of keys) {
      if (!node.has(key)) {
        node.set(key, new Map());
      }
      node = node.get(key);
    }

    if (node.has(cachedValue)) {
      return node.get(cachedValue);
    }

    const result = fn.apply(this, args);
    node.set(cachedValue, result);
    return result;
  };
}

function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (seen.has(value)) {
    return seen.get(value);
  }
  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  const clone = Array.isArray(value) ? [] : {};
  seen.set(value, clone);

  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor && 'value' in descriptor) {
      descriptor.value = deepClone(descriptor.value, seen);
      Object.defineProperty(clone, key, descriptor);
    } else if (descriptor) {
      Object.defineProperty(clone, key, descriptor);
    }
  }
  return clone;
}

function once(fn) {
  if (typeof fn !== 'function') {
    throw new TypeError('once expects a function');
  }

  let called = false;
  let result;

  return function onceOnly(...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

module.exports = { myMap, myFilter, myReduce, memoize, deepClone, once };

if (require.main === module) {
  const numbers = [1, 2, 3];
  console.log('myMap:', myMap(numbers, value => value * 2));
  console.log('myFilter:', myFilter(numbers, value => value > 1));
  console.log('myReduce:', myReduce(numbers, (total, value) => total + value, 0));

  let calculations = 0;
  const expensiveSquare = memoize(value => {
    calculations++;
    return value * value;
  });
  console.log('memoize:', expensiveSquare(5), expensiveSquare(5));
  console.log('fn executions:', calculations);

  const original = { nested: [{ date: new Date('2024-01-01T00:00:00Z') }] };
  const cloned = deepClone(original);
  cloned.nested[0].date.setUTCFullYear(2030);
  console.log('deepClone dates are independent:', original.nested[0].date.getUTCFullYear() === 2024);

  let runs = 0;
  const initializeOnce = once(() => ++runs);
  console.log('once:', initializeOnce(), initializeOnce(), 'fn executions:', runs);
}
