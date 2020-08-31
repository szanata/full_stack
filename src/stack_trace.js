const { lineBreak } = require( './strings' );

module.exports = {
  /**
   * Filter stack trace to remove all entries from this file
   *
   * @function removeInternalFrames
   * @param {Callsite[]} frames Array of callsites (stack trace steps object)
   * @param {String} stack String stack trace
   * @return {String} filtered string stack trace
   */
  removeInternalFrames: ( filename, stack ) => stack.split( '\n' ).filter( row => !row.includes( filename ) ).join( '\n' ),

  /**
   * Serialize a stack trace
   *
   * @function createStackTrace
   * @param {Error} error Error object that create this stack trace
   * @param {Callsite[]} frames Array of callsites (stack trace steps object)
   * @return {String} stack trace
   */
  createStackTrace: ( err, frames ) => `Error${err.message ? `: ${err.message}` : ''
  }${frames.length > 0 ? lineBreak + frames.map( f => f.toString() ).join( lineBreak ) : ''}`
};
