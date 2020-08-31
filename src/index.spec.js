const index = require( './' );
const trapStack = require( './trap_stack' );
const fs = require( 'fs' );
const events = require( 'events' );

jest.mock( './trap_stack', () => jest.fn() );

describe( 'Index Spec', () => {

  afterEach( () => {
    trapStack.mockReset();
  } );

  it( 'Should expose a prepare method which is a wrapper to trapStack.prepare', () => {
    trapStack.mockReturnValue( true );

    const prop = 'bar';
    const FakeObj = {
      [prop]: 1
    };
    index.trap( FakeObj, prop );

    expect( trapStack ).toHaveBeenCalledTimes( 1 );
    expect( trapStack ).toHaveBeenCalledWith( FakeObj, prop );
  } );

  it( 'Should trap all default functions on setDefaultTraps', () => {
    index.setDefaultTraps();

    expect( trapStack ).toHaveBeenCalledWith( Promise.prototype, 'then' );
    expect( trapStack ).toHaveBeenCalledWith( Promise.prototype, 'catch' );
    expect( trapStack ).toHaveBeenCalledWith( global, 'setTimeout' );
    expect( trapStack ).toHaveBeenCalledWith( global, 'setInterval' );
    expect( trapStack ).toHaveBeenCalledWith( global, 'setImmediate' );
    expect( trapStack ).toHaveBeenCalledWith( process, 'nextTick' );
    expect( trapStack ).toHaveBeenCalledWith( events.EventEmitter.prototype, 'on' );
    expect( trapStack ).toHaveBeenCalledWith( fs, 'readFile' );
    expect( trapStack ).toHaveBeenCalledWith( fs, 'writeFile' );
    expect( trapStack ).toHaveBeenCalledTimes( 9 );
  } );
} );
