/**
 * @module full_stack
 * Print a complete stack trace even atfer calback is loop in the vent loop
 */

Error.stackTraceLimit = 50;

const utils = require( './lib/utils' );

/**
 * @const {String} filename
 * @description The file from where this is being executed so its entries can be excluded from the long stack
 */
const filename = new Error().stack.split( '\n' )[1].split( '(' )[1].replace( /(?::\d+)+\)$/, '' );

/**
 * @var currentTraceError Stores the untached stack error from before
 */
let currentTraceError;

/**
 * Custom prepareStackTrace preparation, to be used on place o of the native
 *
 * @param {Error} error Error being used as start point for the stack
 * @param {Callsite[]} structuredStackTrace Array of Callsites, which are previous stests from a stack trace, in a native object format
 */
function prepareStackTrace( error, structuredStackTrace ) {
  // If error already have a cached trace inside, just return that
  if ( error.__cachedTrace ) { return error.__cachedTrace; }

  const stackTrace = utils.createStackTrace( error, structuredStackTrace );
  error.__cachedTrace = utils.removeInternalFrames( filename, stackTrace );

  if ( !error.__previous ) {
    let previousTraceError = currentTraceError;
    while ( previousTraceError ) {
      const previousTrace = utils.removeInternalFrames( filename, previousTraceError.stack );
      // append old stack trace to the "cachedTrace"
      error.__cachedTrace += `${utils.separator}${utils.breakLn}${previousTraceError.__location}\n`;
      error.__cachedTrace += previousTrace.substring( previousTrace.indexOf( '\n' ) + 1 );

      previousTraceError = previousTraceError.__previous;
    }
  }
  return error.__cachedTrace;
}

/**
 * Wrap given callback access its original trace
 *
 * @param {function} fn Callback function
 * @param {String} frameLocation Code point where this callback was called. Eg. "MyClass.method"
 */
function wrapCallback( fn, frameLocation ) {
  const traceError = new Error();
  traceError.__location = frameLocation;
  traceError.__previous = currentTraceError;

  return function ( ...args ) {
    currentTraceError = traceError;
    try {
      return fn.call( this, ...args );
    } catch ( e ) {
      console.error( `FullStack Exception: Can't wrap given callback.\n    Function: ${fn}\n    Location: ${frameLocation}\n    Error: ${e}` );
    } finally {
      currentTraceError = null;
    }
  };
}

module.exports = {

  /**
   * Prepare given method to use long callback
   *
   * @function module:prepare
   * @param {Object} obj Method owner (eg.: global)
   * @param {String} prop Method name
   * @param {...Number} cbIds Within this method parameters, which of those are callback functions (just the id - zero padded)
   */
  prepare( obj, prop, ...cbs ) {

    // load the prepareStackTrace for the first time (if needed)
    if (!Error.prepareStackTrace) {
      Error.prepareStackTrace = prepareStackTrace;
    }

    if ( typeof obj[prop] !== 'function' ) {
      console.error( `FullStack Exception: ${obj} don't have member function ${prop}.` );
      return;
    }

    const sourcePosition = `${obj.constructor.name || Object.prototype.toString.call( obj )}.${prop}`;
    const fn = obj[prop];

    obj[prop] = function ( ...args ) {
      cbs.filter( cb => args[cb] ).forEach( cb => {
        args[cb] = wrapCallback( args[cb], sourcePosition );
      } );

      return fn.call( this, ...args );
    };
  }
};
