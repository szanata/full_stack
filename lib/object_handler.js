
const utils = require( './utils' );

const backupDescriptor = { writable: false, configurable: true, enumerable: false };

module.exports = {

  /**
   * Stub given prop of some object with some new value
   * Also create a restorable value of this property in the object, as "$restore_[prop]"
   *
   * @param {Object} obj Some object
   * @param {String} prop Property name
   * @param {Object} value The new value
   */
  stub( obj, prop, value ) {
    if ( ![ 'function', 'object' ].includes( typeof obj ) ) {
      throw new Error( `[FullStack] Can't set property "${prop}" on "${obj}".` );
    }

    const descriptor = Reflect.getOwnPropertyDescriptor( obj, prop );

    if ( descriptor && !descriptor.writable && !descriptor.configurable ) {
      throw new Error( `[FullStack] Can't set unwritable, unconfigurable property "${prop}" on "${utils.getObjectName( obj )}".` );
    }

    const originalValue = obj[prop];

    // make the original value restirable
    const restoreMethod = `$restore_${prop}`;
    Object.defineProperty( obj, restoreMethod, Object.assign( { }, backupDescriptor, {
      value: function restore() {
        Reflect.defineProperty( obj, prop, Object.assign( { }, descriptor, { value: originalValue } ) );
        Reflect.deleteProperty( obj, restoreMethod );
      }
    } ) );

    Reflect.defineProperty( obj, prop, Object.assign( { }, descriptor, { value } ) );
  }
};
