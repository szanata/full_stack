/**
 * @module Utils
 * Some tools to used along creating long stack traces
 */

function getObjectName( obj ) {
  if ( obj === null || obj === undefined ) { return obj; }
  const method1 = obj.constructor.name;
  const method2 = obj.toString().replace( /^\[\w+ |\]$/g, '' );
  return method1 !== 'Object' ? method1 : method2;
}

const breakLn = '\n    at ';
const separator = '\n----------------------------------------';

module.exports = {

  /**
   * @property {String} breakLn - Sequence to break stack trace lines
   */
  breakLn,

  /**
   * @property {String} separator - Sequence to separate stacks
   */
  separator,

  /**
   * Filter stack trace to remove all entries from this file
   *
   * @function module:removeInternalFrames
   * @param {Callsite[]} frames Array of callsites (stack trace steps object)
   * @param {String} stack String stack trace
   * @return {String} filtered string stack trace
   */
  removeInternalFrames: ( filename, stack ) => stack.split( '\n' ).filter( row => !row.includes( filename ) ).join( '\n' ),

  /**
   * Serialize a stack trace
   *
   * @function module:createStackTrace
   * @param {Error} error Error object that create this stack trace
   * @param {Callsite[]} frames Array of callsites (stack trace steps object)
   * @return {String} stack trace
   */
  createStackTrace: ( err, frames ) => `Error${err.message ? `: ${err.message}` : ''
      }${frames.length > 0 ? breakLn + frames.map( f => f.toString() ).join( breakLn ) : ''}`,

  /**
   * Get some stringified name for given object
   *
   * @param {Object} obj
   * @return {String} Object name
   */
  getObjectName: obj => getObjectName( obj ),

  /**
   * Return how a given prop of a object will look like stringified on the stack
   *
   * @param {Object} obj Owner opf the property, can be anything
   * @param {String} prop Property name
   * @return {String} Stringified object.property
   */
  // getMethodName: ( obj, prop ) => `${obj.constructor.name || Object.prototype.toString.call( obj )}.${prop}`
  getMethodName: ( obj, prop ) => `${getObjectName( obj )}.${prop}`
};
