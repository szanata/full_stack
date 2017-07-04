const chai = require('chai');
const Fullstack = require('../../full_stack');
const events = require('events');

const expect = chai.expect;
const assert = chai.assert;

describe('Fullstack test', function () {

  afterEach( () => {
    if ( Promise.prototype.$restore_then ) {
      Promise.prototype.$restore_then();
    }
    if ( global.$restore_setTimeout ) {
      global.$restore_setTimeout();
    }
    if ( process.$restore_nextTick ) {
      process.$restore_nextTick();
    }
    if ( events.EventEmitter.prototype.$restore_on ) {
      events.EventEmitter.prototype.$restore_on();
    }
  });

  it('Should have the stack from before the Promise.then', () => {
    Fullstack.prepare( Promise.prototype, 'then' );

    const promise = new Promise( resolve => resolve( 10 ) );

    return promise.then( value => {
      const stack = new Error().stack;
      assert( stack.includes( 'at Promise.then' ) );
      assert( stack.includes( '----------------------------------------' ) );
      assert( stack.includes( 'at promise.then.value' ) );
      assert( stack.includes( 'at Test.Runnable.run' ) );
    }, () => {
      assert( false );
    });
  });

  it('Should keep the first part of the stack trace intact', async () => {
    let originalTrace = '';
    let promise = new Promise( resolve => resolve( 10 ) );

    await promise.then( value => {
      originalTrace = new Error().stack.replace(/:\d+:\d+\)/g,''); // remove line numbers
    });

    Fullstack.prepare( Promise.prototype, 'then' );

    promise = new Promise( resolve => resolve( 20 ) );

    return promise.then( value => {
      const stack = new Error().stack;
      expect( stack.indexOf( originalTrace ) ).to.eql( 0 ); // first position
    });
  });

  it('Should keep multiple old stacks', done => {
    Fullstack.prepare( Promise.prototype, 'then' );
    Fullstack.prepare( global, 'setImmediate' );

    const promise = new Promise( resolve => resolve( 10 ) );

    promise.then( value => {
      setImmediate( () => {
        const stack = new Error().stack;
        assert( stack.includes('at Immediate.setImmediate') );
        assert( stack.includes('at global.setImmediate') );
        assert( stack.includes('at Promise.then') );
        assert( stack.includes('at Test.Runnable.run') );
        done();
      });
    });
  });

  it('Should not mix different stack traces', done => {
    Fullstack.prepare( Promise.prototype, 'then' );
    Fullstack.prepare( global, 'setTimeout' );
    Fullstack.prepare( process, 'nextTick' );

    let immediateStack;
    let promise1Stack;
    let promise2Stack;
    let promise3Stack;
    let nextTickStack;

    setImmediate( () => { immediateStack = new Error().stack; } );

    const p1 = new Promise( resolve => resolve( 10 ) );
    const p2 = new Promise( resolve => resolve( 20 ) );
    const p3 = new Promise( resolve => resolve( 30 ) );

    p1.then( value => { promise1Stack = new Error().stack; }, 'A');
    process.nextTick( () => { nextTickStack = new Error().stack } )
    p2.then( value => { promise2Stack = new Error().stack; }, 'B');
    p3.then( value => { promise3Stack = new Error().stack; }, 'C');

    setTimeout( () => {
      assert( nextTickStack.includes('process.nextTick') );
      assert( !nextTickStack.includes('Promise.then') );

      assert( promise2Stack.includes('p2.then.value') );
      assert( promise2Stack.includes('Promise.then') );
      assert( !promise2Stack.includes('p1.then.value') );

      assert( promise3Stack.includes('p3.then.value') );
      assert( promise3Stack.includes('Promise.then') );
      assert( !promise3Stack.includes('p2.then.value') );

      assert( immediateStack.includes('Immediate.setImmediate') );
      assert( immediateStack.includes('global.setImmediate') );

      done();
    }, 10 );
  });

  it('Should get stack from EventEmitter', done => {
    Fullstack.prepare( events.EventEmitter.prototype, 'on' );

    const emitter = new events.EventEmitter();
    let stack;
    emitter.on('foo', function () {
      stack = new Error().stack;
      assert( stack.includes('EventEmitter.on') );
      assert( stack.includes('EventEmitter.emit') );
      done();
    });

    emitter.emit('foo');
  });
});
