const { getObjectName, getMethodName } = require( './stringifiers' );
const events = require( 'events' );

describe( 'Stringifiers Spec', function () {
  describe( 'Get Method Name', () => {
    it( 'Should serialize Promise.then', () => {
      expect( getMethodName( Promise.prototype, 'then' ) ).toBe( 'Promise.then' );
      expect( getMethodName( global, 'setTimeout' ) ).toBe( 'global.setTimeout' );
      expect( getMethodName( events.EventEmitter.prototype, 'on' ) ).toBe( 'EventEmitter.on' );
    } );
  } );

  describe( 'Get Object Name', () => {
    it( 'Should serialize Promise.then', () => {
      expect( getObjectName( Promise.prototype ) ).toBe( 'Promise' );
      expect( getObjectName( global ) ).toBe( 'global' );
      expect( getObjectName( events.EventEmitter.prototype ) ).toBe( 'EventEmitter' );
      expect( getObjectName( { } ) ).toBe( 'Object' );
      expect( getObjectName( undefined ) ).toBe( 'undefined' );
      expect( getObjectName( 1 ) ).toBe( 'Number' );
    } );
  } );
} );
