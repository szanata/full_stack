const { getMethodName, getObjectName } = require( './stringifiers' );
const { createStackTrace, removeInternalFrames } = require( './stack_trace' );
const stub = require( './stub' );
const { stackSplit, lineBreak } = require( './strings' );

Error.stackTraceLimit = 50;

/**
 * @const {String} filename
 * @description The file from where this is being executed so its entries can be excluded from the long stack
 */
const filename = new Error().stack.split( '\n' )[1].split( '(' )[1].replace( /(?::\d+)+\)$/, '' );

/**
 * @var currentTraceError Stores the unatached stack error from before
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

  const stackTrace = createStackTrace( error, structuredStackTrace );
  error.__cachedTrace = removeInternalFrames( filename, stackTrace );

  if ( !error.__previous ) {
    let previousTraceError = currentTraceError;
    while ( previousTraceError ) {
      const previousTrace = removeInternalFrames( filename, previousTraceError.stack );
      // append old stack trace to the "cachedTrace"
      error.__cachedTrace += `${stackSplit}${lineBreak}${previousTraceError.__location}\n`;
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

/**
 * Trap given method to use long callback
 *
 * @function trapStack
 * @param {Object} obj Method owner (eg.: global)
 * @param {String} prop Method name
 */
module.exports = ( obj, prop ) => {
  // load the prepareStackTrace for the first time (if needed)
  if ( !Error.prepareStackTrace ) {
    Error.prepareStackTrace = prepareStackTrace;
  }

  if ( obj === null || obj === undefined ) {
    throw new Error( `[FullStack] Object can't be ${obj}.` );
  }

  if ( !obj || typeof obj[prop] !== 'function' ) {
    throw new Error( `[FullStack] "${getObjectName( obj )}.${prop}" is not a function` );
  }

  const origin = getMethodName( obj, prop );
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
  stub( obj, prop, $wrapped );
};
