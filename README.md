# Full Stack

Keep stack trace from objects after its callback is executed on another event on js event loop.
Works nice with promise, setTimeouts nad eventemiter.

### 1. Install & import

`npm install full_stack`

```js
const Fullstack = require('full_stack');
```

### 2. Set which type of async events you want to keep track

```js
Fullstack.prepare( Promise.prototype, 'then', 0, 1 );
```

The function prepare take two fixed arguments, and a rest argument:
- **object** *{Object}*: The object that have the target function/method
- **prop** *{String}*: The name of the func/method
- **cbIndexes** *{...Number}*: Which parameters of the function are callbacks (zero padded indexes), so for the Promise.prototype.then, that takes two arguments: callbackOk and callbackError, your indexes are 0 and 1.

### 3. Enjoy

Now every time you get the stacktrece inside callbacks of the *then* function, you will get the full stacktrace from before it was called as well:

```bash
Promise.then.ok at /home/stefano/repo/full_stack/spec/unit/full_stack_test.js:19:36
    at <anonymous>
    at process._tickCallback (internal/process/next_tick.js:169:7)
    at Function.Module.runMain (module.js:607:11)
    at startup (bootstrap_node.js:158:16)
    at bootstrap_node.js:575:3
----------------------------------------
    at Promise.then
    at Array.forEach (native)
    at superfunc (/home/stefano/repo/full_stack/spec/unit/full_stack_test.js:18:5)
    at Object.<anonymous> (/home/stefano/repo/full_stack/spec/unit/full_stack_test.js:31:1)
    at Module._compile (module.js:569:30)
    at Object.Module._extensions..js (module.js:580:10)
    at Module.load (module.js:503:32)
    at tryModuleLoad (module.js:466:12)
    at Function.Module._load (module.js:458:3)
    at Function.Module.runMain (module.js:605:10)
    at startup (bootstrap_node.js:158:16)
```
