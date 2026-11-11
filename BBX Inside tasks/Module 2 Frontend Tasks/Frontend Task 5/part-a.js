// 1. Prediction: object undefined number object
console.log(typeof null, typeof undefined, typeof NaN, typeof []);

// 2. Prediction: true false true false false
console.log(0 == '0', 0 === '0', null == undefined, null === undefined, NaN == NaN);

// 3. Prediction: true truthy
console.log([] == false, [] ? 'truthy' : 'falsy');

// 4. Prediction: the three var callbacks print 3; the let callbacks print 0, 1, 2.
for (var i = 0; i < 3; i++) setTimeout(() => console.log('var', i), 0);
for (let j = 0; j < 3; j++) setTimeout(() => console.log('let', j), 0);

// 5. Prediction: A, D, C, B
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');

// 6. Prediction: [1, 2, 3, 4]
const arr = [1, 2, 3];
arr.push(4);
console.log(arr);

// 7. Prediction: 99
const a = { x: { y: 1 } };
const b = { ...a };
b.x.y = 99;
console.log(a.x.y);

// 8. Prediction: [1, 10, 9] and [1, 9, 10]
console.log([10, 9, 1].sort(), [10, 9, 1].sort((p, q) => p - q));

// 9. Prediction in Node.js: x undefined
const o = { n: 'x', reg() { return this.n; }, arrow: () => this?.n };
console.log(o.reg(), o.arrow());

// 10. Prediction: [2, 4, 6] and undefined
console.log([1, 2, 3].map(n => n * 2), [1, 2, 3].forEach(n => n * 2));