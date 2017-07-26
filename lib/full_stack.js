/**
 * @module full_stack
 * Print a complete stack trace even atfer calback is loop in the vent loop
 */

const utils = require( './utils' );
const ObjectHandler = require( './object_handler' );

Error.stackTraceLimit = 50;

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
  // happens on true errors most
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

  return function $wrappedCallback( ...args ) {
    currentTraceError = traceError;
    try {
      return fn.call( this, ...args );
    } catch ( e ) {
      throw e; // we just need the the 'finally'
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
   */
  prepare( obj, prop ) {
    // load the prepareStackTrace for the first time (if needed)
    if ( !Error.prepareStackTrace ) {
      Error.prepareStackTrace = prepareStackTrace;
    }

    if ( obj === null || obj === undefined ) {
      throw new Error( `[FullStack] Object can't be ${obj}.` );
    }

    if ( !obj || typeof obj[prop] !== 'function' ) {
      throw new Error( `[FullStack] "${utils.getObjectName( obj )}.${prop}" is not a function` );
    }

    const origin = utils.getMethodName( obj, prop );
    const method = obj[prop];

    // return a wrapped version of given object method
    function $wrapped( ...args ) {
      const wrappedArgs = args.slice();

      args.forEach( ( arg, i ) => {
        if ( typeof arg === 'function' ) {
          wrappedArgs[i] = wrapCallback( args[i], origin );
        }
      } );

      return method.call( this, ...wrappedArgs );
    }

    // insert that on the original object
    ObjectHandler.stub( obj, prop, $wrapped );
  }
};
