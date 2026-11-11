# JavaScript Trap Collection

These exercises use Node.js and no third-party packages. Run commands from this folder:

```bash
node part-a.js
node utils.js
node part-c.js
```

`part-a.js` puts a prediction beside each example before the runnable expression. Run it to verify the predictions. In the output, `var` callbacks show `3` three times because all callbacks read the same function-scoped binding after the loop. The `let` callbacks show `0`, `1`, and `2` because each loop iteration has its own binding. There are no mismatches between the stated Node.js predictions and the output.

The other notable results are:

- `typeof null` is `"object"` for historical compatibility; arrays also report `"object"`.
- Loose equality converts values in some cases, while strict equality does not; `NaN` is unequal to itself.
- `[]` is truthy, but converts to an empty string during loose comparison, which explains `[] == false`.
- Promise callbacks run after synchronous logs but before timer callbacks; the final asynchronous output is `C`, then `B`.
- `const` prevents rebinding `arr`, not mutation of the array it references.
- Object spread is shallow, so `a.x` and `b.x` refer to the same nested object.
- Default sorting compares string representations; a numeric comparator gives numeric order.
- `forEach` returns `undefined`; it does not collect callback results.

## Utility notes

`utils.js` implements array traversal with loops. `myReduce` also handles omitted initial values and sparse arrays. `memoize` uses nested `Map` instances keyed by the receiver and each argument, so repeated calls with the same argument values (including object identity) return the cached result. Its demonstration prints an execution count of `1` after two identical calls. The language feature that makes the cache persist is a **closure**.

`deepClone` recursively clones arrays, objects, own properties, and `Date` instances; a `WeakMap` preserves cycles and shared references. As usual for a focused exercise, it does not preserve custom object prototypes. `JSON.parse(JSON.stringify(value))` is not a general deep clone: it drops or transforms `undefined`, functions, and symbols; turns dates into strings; changes `NaN` and infinities to `null`; loses prototypes and non-JSON object details; and throws for cyclic structures.

## Async notes

`part-c.js` starts a local HTTP server with short, controlled delays, so the timing comparison runs without external services or network access. The sequential and `Promise.all` runs use three successful endpoints; `Promise.allSettled` uses two successful endpoints and one intentional HTTP 500. Durations are measured at runtime and vary by machine. `fetch` resolves normally for HTTP 404 and 500 responses, so `fetchChecked` checks `response.ok` and throws an informative error for non-success status codes.

## Written answers

See [answers.md](./answers.md) for the three interview answers.
