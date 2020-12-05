const MyPromise = require('./MyPromise.js');

const promise1 = new MyPromise((resolve, reject) => {
  resolve('Promise1');
});
const promise2 = promise1.then(() => {
  // return new MyPromise((resolve, reject) => {
  // resolve('12345');
  // reject('54321');
  // return new Error('Error');
  // return Promise.resolve('Promise resolve');
  // });
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve(new Promise((resolve, reject) => {
        reject('hahahahhahaha');
      }));
    });
  });
}, reason => {
  return reason;
});
promise2.then().then().then(value => {
  console.log('成功');
  console.log(value);
}).catch(err => {
  console.log('失败');
  console.log(err);
  return '1234';
}).then((value) => {
  console.log(value);
});