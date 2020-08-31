const { removeInternalFrames, createStackTrace } = require( './stack_trace' );

describe( 'Stack Trace Fns Spec', () => {
  describe( 'Remove Internal Frames', function () {

    it( 'Should split a text and remove all lines that contains given string', () => {
      const text = 'Some line\n' +
        'foo\n' +
        'more line\n' +
        'bar (foo)\n' +
        'more line\n';

      const result = removeInternalFrames( 'foo', text );

      expect( result ).toBe( 'Some line\nmore line\nmore line\n' );
    } );
  } );

  describe( 'Create Stack Trace', () => {

    it( 'Should create a stack strace using and error and a CallSite Array', () => {
      const error = new Error( 'Foo' );
      const callsites = [
        { toString: () => 'bar.js:1' }, { toString: () => 'zoo.js:34' }
      ];

      const result = createStackTrace( error, callsites );

      expect( result ).toBe( 'Error: Foo\n\
    at bar.js:1\n\
    at zoo.js:34' );
    } );

    it( 'Should well format event if its first parameter is a empty error', () => {
      const error = new Error();
      const callsites = [ { toString: () => 'bar.js:1' } ];
      const result = createStackTrace( error, callsites );

      expect( result ).toBe( 'Error\n    at bar.js:1' );
    } );

    it( 'Should well format event if there are no CallSite Array', () => {
      const error = new Error( 'Foo' );
      const result = createStackTrace( error, [] );

      expect( result ).toBe( 'Error: Foo' );
    } );
  } );
} );
