# Full Stack

Stop losing stack trace on Node event loop callbacks.

This is implantation allows the user to set what event loop callbacks he wants to keep the trace.


The algorithm was based on **long-stack-traces** (https://github.com/tlrobinson/long-stack-traces) - which I thank!

That was somehow improved and have a nice test coverage.

### 1. Install & import

`npm install full_stack`

```js
const Fullstack = require('full_stack');
```

### 2. Set which micro/macrotasks callbacks you want to keep the stack trace

```js
// Eg:
Fullstack.prepare( Promise.prototype, 'then' );
Fullstack.prepare( global, 'setInterval' );
Fullstack.prepare( EventEmmiter.prototype, 'on' );
```

The function prepare take two argument:
- **object** *{Object}*: The object that have the target function/method
- **prop** *{String}*: The name of the function/method

### 3. Enjoy

Now every time you get the stack trace inside callbacks of the prepared function, you will get the full **stack trace** from before it was called as well, eg.:

**BEFORE**
```bash
Error
    at Promise.then.x (/home/stefano/repo/full_stack/x.js:8:16)
    at <anonymous>
    at process._tickCallback (internal/process/next_tick.js:169:7)
    at Function.Module.runMain (module.js:607:11)
    at startup (bootstrap_node.js:158:16)
    at bootstrap_node.js:575:3
```

**AFTER**
```bash
Error
    at Promise.then.x (/home/stefano/repo/full_stack/x.js:8:16)
    at <anonymous>
    at process._tickCallback (internal/process/next_tick.js:169:7)
    at Function.Module.runMain (module.js:607:11)
    at startup (bootstrap_node.js:158:16)
    at bootstrap_node.js:575:3
----------------------------------------
    at Promise.then
    at Array.forEach (native)
    at Object.<anonymous> (/home/stefano/repo/full_stack/x.js:7:4)
    at Module._compile (module.js:569:30)
    at Object.Module._extensions..js (module.js:580:10)
    at Module.load (module.js:503:32)
    at tryModuleLoad (module.js:466:12)
    at Function.Module._load (module.js:458:3)
    at Function.Module.runMain (module.js:605:10)
    at startup (bootstrap_node.js:158:16)
    at bootstrap_node.js:575:3
```
