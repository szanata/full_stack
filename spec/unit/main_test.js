const chai = require('chai');
const FullStack = require('../../lib/full_stack');
const main = require('../../main');
const sinon = require('sinon');
const fs = require('fs');
const events = require('events');

const expect = chai.expect;
const assert = chai.assert;

describe('main.js test', () => {

  afterEach( () => {
    if ( FullStack.prepare.restore ) {
      FullStack.prepare.restore();
    }
  });

  it('Should expose a prepare method which is a wrapper to FullStacks\'s prepare', () => {
    const prepareStub = sinon.stub(FullStack, 'prepare').returns(true);

    const FakeObj = {};
    const fakeProp = 'bar'
    main.prepare( FakeObj, fakeProp );

    assert( prepareStub.calledOnce );
    assert( prepareStub.calledWith( FakeObj, fakeProp ) );
  });

  it('Should trap well now functions on setDefaultTraps', () => {
    main.setDefaultTraps();

    expect( Promise.prototype.then.name ).to.eql('$wrapped');
    expect( Promise.prototype.catch.name ).to.eql('$wrapped');
    expect( global.setTimeout.name ).to.eql('$wrapped');
    expect( global.setInterval.name ).to.eql('$wrapped');
    expect( global.setImmediate.name ).to.eql('$wrapped');
    expect( process.nextTick.name ).to.eql('$wrapped');
    expect( events.EventEmitter.prototype.on.name ).to.eql('$wrapped');
    expect( fs.readFile.name ).to.eql('$wrapped');

  });
});
