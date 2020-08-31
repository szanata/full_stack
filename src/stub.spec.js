const stub = require( './stub' );

describe( 'Object handler test', () => {

  it( 'Should stub original function', () => {
    const bar = { foo: 5 };
    stub( bar, 'foo', 3 );
    expect( bar.foo ).toBe( 3 );
  } );

  it( 'Cant stub non object/functions', () => {
    const error = new Error( '[FullStack] Can\'t set property "foo" on "1".' );
    expect( () => stub( 1, 'foo', 3 ) ).toThrow( error );
  } );

  it( 'Cant stub unwritable + unconfigurable properties', () => {
    const error = new Error( '[FullStack] Can\'t set unwritable, unconfigurable property "bar" on "Object".' );
    const foo = {};
    Object.defineProperty( foo, 'bar', { configurable: false, writable: false, value: 5 } );
    expect( () => stub( foo, 'bar', 3 ) ).toThrow( error );
  } );

  it( 'Should restore original value', () => {
    const bar = { foo: 5 };

    stub( bar, 'foo', 3 );
    expect( bar.foo ).toBe( 3 );

    bar.$restore_foo();
    expect( bar.foo ).toBe( 5 );
  } );

  it( 'Should remove the restore method afterwards', () => {
    const bar = { foo: 5 };
    stub( bar, 'foo', 3 );
    bar.$restore_foo();
    expect( typeof bar.restore$foo ).toBe( 'undefined' );
  } );
} );
