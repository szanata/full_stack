const trapStack = require( './trap_stack' );
const events = require( 'events' );
const fs = require( 'fs' );

module.exports = {
  setDefaultTraps() {
    trapStack( Promise.prototype, 'then' );
    trapStack( Promise.prototype, 'catch' );
    trapStack( global, 'setTimeout' );
    trapStack( global, 'setInterval' );
    trapStack( global, 'setImmediate' );
    trapStack( process, 'nextTick' );
    trapStack( events.EventEmitter.prototype, 'on' );
    trapStack( fs, 'readFile' );
    trapStack( fs, 'writeFile' );
  },

  trap( ...args ) {
    return trapStack( ...args );
  }
};
