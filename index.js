const MyPromise = require('./MyPromise');

let promise1 = new MyPromise((resolve, reject) => {
  resolve('Promise1');
  // reject('Error');
});

let promise2 = promise1.then(() => {
  return '1234';
}, (reson) => {
  return reson;
});

promise2.then(value => {
  console.log('调用');
  console.log(value);
}, reason => {
  console.log(reason);
})