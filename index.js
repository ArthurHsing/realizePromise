const MyPromise = require('./MyPromise');

let promise = new MyPromise((resolve, reject) => {
  resolve('success');
  // reject('Error');
  // throw new Error('HaHaHa Error!');
  // setTimeout(() => {
  //   resolve('success');
  // }, 2000)
});
promise.then((value) => {
  console.log('FulFilled:' + value);
}, (reason) => {
  console.log('Rejected:' + reason);
})
promise.then((value) => {
  console.log('FulFilled:' + value);
}, (reason) => {
  console.log('Rejected:' + reason);
})