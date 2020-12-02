const PENDING = 'PENDING',
  FULFILLED = 'FULFILLED',
  REJECTED = 'REJECTED';

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise #<MyPromise>'));
  }
  let called = false;
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    try {
      let then = x.then;  //这里的取属性操作有可能被劫持，所以要try一下
      if (typeof then === 'function') {  //认为它是一个Promise的then
        then.call(x, v => {
          if (called) return;
          called = true;
          resolvePromise(promise2, v, resolve, reject);
        }, r => {
          if (called) return;
          called = true;
          reject(r);
        });
      } else {  //否则就是一个普通的对象
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {  //那么就是一个普通值
    resolve(x);
  }
}
class MyPromise {
  constructor(executor) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;

    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    const resolve = (value) => {
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
        // 发布（这是初始化promise时异步回调函数的收集器）
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    }
    const reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        // 发布（这是初始化promise时异步回调函数的收集器）
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    }
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
  then(onFulfilled, onRejected) {
    // 解决then()传空值时的穿透问题
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };
    let promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // setTimeout不仅仅是为了实现.then方法要是异步的标准，同时也解决了promise2没有初始化的问题
        setTimeout(() => {
          try {
            // 获取then方法中onFulfilled回调函数return的值
            let x = onFulfilled(this.value);  //this.value是new MyPromise时resovle的值
            //promise2就是then()方法要返回的新的promise，就是外层的let promise2，resolve,reject就是这个新的promise中的resolve，reject方法
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        })
      }
      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        })
      }
      // 说明是异步的程序
      if (this.status === PENDING) {
        // 订阅者模式
        this.onFulfilledCallbacks.push(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
        this.onRejectedCallbacks.push(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }
    });
    return promise2;
  }
  catch(errorCallback) {
    return this.then.call(null, errorCallback);
  }
}
module.exports = MyPromise;