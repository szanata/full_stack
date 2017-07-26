const FullStack = require('./lib/full_stack');
const events = require('events');
const fs = require('fs');

module.exports = {
  setDefaultTraps() {
    FullStack.prepare( Promise.prototype, 'then' );
    FullStack.prepare( Promise.prototype, 'catch' );
    FullStack.prepare( global, 'setTimeout' );
    FullStack.prepare( global, 'setInterval' );
    FullStack.prepare( global, 'setImmediate' );
    FullStack.prepare( process, 'nextTick' );
    FullStack.prepare( events.EventEmitter.prototype, 'on' );
    FullStack.prepare( fs, 'readFile' );
  },

  prepare(...args) {
    return FullStack.prepare(...args);
  }
}
