const trapStack = require( './trap_stack' );
const events = require( 'events' );
const http = require( 'http' );
const request = require( 'request' );
const fs = require( 'fs' );
const assert = require( 'assert' ).strict;

const { stackSplit } = require( './strings' );
const tests = [];

const restore = () => {
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
};

tests.push( async () => {
  console.info( 'Should keep the stack from before the http.get' );
  restore();
  trapStack( events.EventEmitter.prototype, 'on' );

  return new Promise( ( rs, rj ) => {
    http.get( { host: 'www.google.com', port: 80 }, () => {
      const stack = new Error().stack;
      assert.ok( stack.includes( stackSplit ) );
      const [ after, before ] = stack.split( stackSplit );
      assert.ok( before.includes( 'at EventEmitter.on' ) );
      assert.ok( after.includes( 'at TCP' ) || after.includes( 'at TCP' ) );
      rs();
    } ).on( 'error', error => rj( error ) );
  } );
} );

tests.push( async () => {
  console.info( 'Should keep the stack from before the request.get' );
  restore();
  trapStack( events.EventEmitter.prototype, 'on' );

  return new Promise( ( rs, rj ) => {
    request( 'www.google.com', () => {
      const stack = new Error().stack;
      assert.ok( stack.includes( stackSplit ) );
      const [ after, before ] = stack.split( stackSplit );
      assert.ok( before.includes( 'at EventEmitter.on' ) );
      assert.ok( after.includes( 'at new Request' ) );
      rs();
    } ).on( 'error', error => rj( error ) );
  } );
} );

tests.push( async () => {
  console.info( 'Should keep the stack from before the Promise.then' );
  restore();
  trapStack( Promise.prototype, 'then' );

  return Promise.resolve().then( () => {
    const stack = new Error().stack;
    assert.ok( stack.includes( stackSplit ) );
    const [ after, before ] = stack.split( stackSplit );

    assert.ok( before.includes( 'at Promise.then' ) );
    // assert for node 12+, assert for node 10-
    assert.ok( after.includes( 'at processTicksAndRejections' ) || after.includes( 'at process._tickCallback' ) );
  } );
} );

tests.push( async () => {
  console.info( 'Should keep the stack from before a file IO (read)' );
  restore();
  trapStack( fs, 'readFile' );

  return new Promise( rs => {
    fs.readFile( 'README.md', error => {
      if ( error ) { throw error; }
      const stack = new Error().stack;
      assert.ok( stack.includes( stackSplit ) );
      const [ after, before ] = stack.split( stackSplit );
      assert.ok( before.includes( 'at Object.readFile' ) );
      assert.ok( after.includes( 'readFileAfterClose' ) );
      rs();
    } );
  } );
} );

tests.push( async () => {
  console.info( 'Should keep the stack from before EventEmitter.on' );
  restore();
  trapStack( events.EventEmitter.prototype, 'on' );

  return new Promise( rs => {
    const emitter = new events.EventEmitter();

    emitter.on( 'foo', function () {
      const stack = new Error().stack;
      assert.ok( stack.includes( stackSplit ) );
      const [ after, before ] = stack.split( stackSplit );
      assert.ok( before.includes( 'at EventEmitter.on' ) );
      assert.ok( after.includes( 'at EventEmitter.emit' ) );
      rs();
    } );

    emitter.emit( 'foo' );
  } );
} );

tests.push( async () => {
  console.info( 'Should keep the first part of the stack trace intact' );
  restore();
  trapStack( Promise.prototype, 'then' );

  const originalStack = new Error().stack
    .replace( /:\d+:\d+/g, '' ) // remove line numbers
    .replace( /.*\n/, '' ); // remove first line

  return Promise.resolve().then( () => {
    const stack = new Error().stack
      .replace( /:\d+:\d+/g, '' ); // remove line numbers

    const [ , before ] = stack.split( stackSplit );
    assert.ok( before.includes( originalStack ) );
  } );
} );

tests.push( async () => {
  console.info( 'Should keep multiple stack from various events loops' );
  restore();
  trapStack( Promise.prototype, 'then' );
  trapStack( global, 'setImmediate' );

  return Promise.resolve().then( () => {
    setImmediate( () => {
      const stack = new Error().stack;
      assert.ok( stack.includes( stackSplit ) );
      const [ first, second, thrid ] = stack.split( stackSplit );
      assert.ok( first.includes( 'at Immediate' ) );
      assert.ok( second.includes( 'at global.setImmediate' ) );
      assert.ok( thrid.includes( 'at Promise.then' ) );
    } );
  } );
} );

tests.push( async () => {
  console.info( 'Should not mix different stack traces' );
  restore();

  trapStack( Promise.prototype, 'then' );
  trapStack( global, 'setTimeout' );
  trapStack( process, 'nextTick' );

  let immediateStack;
  let promise1Stack;
  let promise2Stack;
  let nextTickStack;

  setImmediate( () => immediateStack = new Error().stack );

  Promise.resolve().then( () => promise1Stack = new Error().stack );
  process.nextTick( () => nextTickStack = new Error().stack );
  Promise.resolve().then( () => promise2Stack = new Error().stack );

  return new Promise( r => {
    setTimeout( () => {
      assert.ok( nextTickStack.includes( 'at process.nextTick' ) );
      assert.ok( !nextTickStack.includes( 'at Promise.then' ) );
      assert.ok( !nextTickStack.includes( 'at global.setImmediate' ) );

      assert.ok( promise1Stack.includes( 'at Promise.then' ) );
      assert.ok( !promise1Stack.includes( 'at process.nextTick' ) );

      assert.ok( promise2Stack.includes( 'at Promise.then' ) );
      assert.ok( !promise2Stack.includes( 'at process.nextTick' ) );

      assert.ok( immediateStack.includes( 'at Immediate' ) );
      assert.ok( immediateStack.includes( 'at global.setImmediate' ) );
      assert.ok( !immediateStack.includes( 'at Promise.then' ) );
      assert.ok( !immediateStack.includes( 'at process.nextTick' ) );
      r();
    }, 10 );
  } );
} );

( async () => {
  console.log( '\n\x1b[1mRunning Trap Stack Tests!\x1b[0m\n' );

  for ( const test of tests ) {
    await test();
  }
  console.log( '\x1b[32m\nAll tests done!\x1b[0m' );
} )();
