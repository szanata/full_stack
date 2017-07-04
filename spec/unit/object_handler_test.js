const chai = require('chai');
const ObjectHandler = require('../../lib/object_handler');

const expect = chai.expect;
const assert = chai.assert;

describe('Object handler test', () => {

  it('Should stub original function', () => {
    const bar = { foo: 5 };
    ObjectHandler.stub( bar, 'foo', 3 );
    expect( bar.foo ).to.eql( 3 );
  });

  it('Cant stub non object/functions', () => {
    try {
      ObjectHandler.stub( 1, 'foo', 3 );
      assert( false );
    } catch ( e ) {
      expect( e.message ).to.eql( '[FullStack] Can\'t set property "foo" on "1".' );
    }
  });

  it('Cant stub unwritable + unconfigurable properties', () => {
    const foo = {};
    Object.defineProperty( foo, 'bar', { configurable: false, writable: false, value: 5 } )
    try {
      ObjectHandler.stub( foo, 'bar', 3 );
      assert( false );
    } catch ( e ) {
      expect( e.message ).to.eql( '[FullStack] Can\'t set unwritable, unconfigurable property "bar" on "Object".' );
    }
  });

  it('Should restore original value', () => {
    const bar = { foo: 5 };

    ObjectHandler.stub( bar, 'foo', 3 );
    expect( bar.foo ).to.eql( 3 );

    bar.$restore_foo();
    expect( bar.foo ).to.eql( 5 );
  });

  it('Should remove the restore method afterwards', () => {
    const bar = { foo: 5 };
    ObjectHandler.stub( bar, 'foo', 3 );
    bar.$restore_foo();
    expect( typeof bar.restore$foo ).to.eql( 'undefined' );
  });

});
