const chai = require('chai');
const utils = require('../../lib/utils');

const expect = chai.expect;

describe('Utils test', function () {

  describe('Remove Internal Frames', function () {

    it('Should split a text and remove all lines that contains given string', () => {
      const text = 'Some line\n' +
        'foo\n' +
        'more line\n' +
        'bar (foo)\n' +
        'more line\n';

      const expected = 'Some line\n' +
        'more line\n' +
        'more line\n';

      const result = utils.removeInternalFrames( 'foo', text );

      expect( result ).to.eql( expected );
    });
  });

  describe('Create Stack Trace', () => {

    it('Should create a stack strace using and error and a CallSite Array', () => {
      const err = new Error('Foo');
      const callsites = [
        { toString: () => 'bar.js:1' }, { toString: () => 'zoo.js:34'  }
      ];
      const errAtPrefix = err.stack.split('\n')[1].match(/\s\s\s\sat\s/)[0];
      const expected = err.stack.split('\n')[0] + '\n' +
        `${errAtPrefix}bar.js:1\n` +
        `${errAtPrefix}zoo.js:34`;
      const result = utils.createStackTrace( err, callsites );

      expect( result ).to.eql( expected );
    });

    it('Should well format event if its first parameter is a empty error', () => {
      const err = new Error();
      const callsites = [ { toString: () => 'bar.js:1' } ];
      const errAtPrefix = err.stack.split('\n')[1].match(/\s\s\s\sat\s/)[0];
      const expected = err.stack.split('\n')[0] + '\n' +
        `${errAtPrefix}bar.js:1`;
      const result = utils.createStackTrace( err, callsites );

      expect( result ).to.eql( expected );
    });

    it('Should well format event if there are no CallSite Array', () => {
      const err = new Error('Foo');
      const callsites = [];
      const expected = err.stack.split('\n')[0];
      const result = utils.createStackTrace( err, callsites );

      expect( result ).to.eql( expected );
    });
  });

  describe('Get Method Name', () => {

    it('Should serialize Promise.then', () => {
      const ev = require("events");
      expect( utils.getMethodName( Promise.prototype, 'then' ) ).to.eql( 'Promise.then' );
      expect( utils.getMethodName( global, 'setTimeout' ) ).to.eql( 'global.setTimeout' );
      expect( utils.getMethodName( ev.EventEmitter.prototype, 'on' ) ).to.eql( 'EventEmitter.on' );
    })
  });

  describe('Get Object Name', () => {

    it('Should serialize Promise.then', () => {
      const ev = require("events");
      expect( utils.getObjectName( Promise.prototype ) ).to.eql( 'Promise' );
      expect( utils.getObjectName( global ) ).to.eql( 'global' );
      expect( utils.getObjectName( ev.EventEmitter.prototype ) ).to.eql( 'EventEmitter' );
      expect( utils.getObjectName( { } ) ).to.eql( 'Object' );
      expect( utils.getObjectName( undefined ) ).to.eql( undefined );
      expect( utils.getObjectName( 1 ) ).to.eql( 'Number' );
    })
  });
});
