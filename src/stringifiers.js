const getObjectName = o => {
  if ( o === null || o === undefined ) { return '' + o; }
  if ( o === global ) { return 'global'; }
  const method1 = o.constructor.name;
  const method2 = o.toString().replace( /^\[\w+ |\]$/g, '' );
  return method1 !== 'Object' ? method1 : method2;
};

/**
 * @module Stringifiers
 * Functions to convert objects to a friendly notation
 */
module.exports = {
  /**
   * Get some stringified name for given object
   *
   * @function getObjectName
   * @param {Object} obj
   * @return {String} Object name
   */
  getObjectName,

  /**
   * Return how a given prop of a object will look like stringified on the stack
   *
   * @function getMethodName
   * @param {Object} obj Owner opf the property, can be anything
   * @param {String} prop Property name
   * @return {String} Stringified object.property
   */
  getMethodName: ( obj, prop ) => `${getObjectName( obj )}.${prop}`
};
