# Full Stack

Stop losing stack trace on Node event loop callbacks.

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

This implantation allows all or some event loop callbacks to be intercepted and have its trace stored.

The algorithm is based on **long-stack-traces** (https://github.com/tlrobinson/long-stack-traces) - which I thank!

## 1. Install & import

```bash
npm install -S full_stack
```

```js
const fullStack = require('full_stack');
```

## 2. Setup the traps

```js
fullStack.setDefaultTraps();
```

*You should do this right in the beginning of you code.*

This will setup trap on most functions that create event loop tasks.

The default list of traps are:
- Promise.prototype.catch
- Promise.prototype.then
- setTimeout
- setInterval
- setImmediate
- process.nextTick
- EventEmitter.prototypeon (includes http/https/request)
- fs.readFile
- fs.writeFile

But you can set your own trap:

```js
// Eg:
fullStack.trap( Promise.prototype, 'then' );
fullStack.trap( global, 'setInterval' );
fullStack.trap( EventEmmiter.prototype, 'on' );
```

The function `trap` take two argument:
- **object** *{Object}*: The object that have the target function/method
- **prop** *{String}*: The name of the function/method

## 3. Enjoy
That's it.

## Compatibility
- Node 14.x
- Node 12.x
- Node 10.x
- Node 8.x
