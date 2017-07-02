const fullStack = require('../../full_stack');

fullStack.prepare( Promise.prototype, 'then', 0, 1 );

const printStack = function ( prefix, stack ) {
  const fStack = stack.split('\n    ').splice(1).join('\n    ');
  console.log(prefix, fStack)
};


function superfunc() {
  printStack( 'superfunc', new Error().stack );
  const p = new Promise( (resolve, reject) =>{
    printStack( 'inside promise', new Error().stack );
    resolve();
  });

  p.then(function () {
    printStack( 'Promise.then.ok', new Error().stack );
  }).catch( e => {
    console.log(e);
  });

  p.then(function () {
    printStack( 'Promise.then.ok 2', new Error().stack );
  }).catch( e => {
    console.log(e);
  });
}

superfunc();
