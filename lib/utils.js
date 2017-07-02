/**
 * @module Utils
 * Some tools to used along creating long stack traces
 */

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
  createStackTrace: ( error, frames ) => error + breakLn + frames.map( f => f.toString() ).join( breakLn )
};
