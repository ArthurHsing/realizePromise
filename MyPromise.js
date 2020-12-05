const PENDING = 'PENDING',
  FULFILLED = 'FULFILLED',
  REJECTED = 'REJECTED';

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise #<MyPromise>'));
  }
  let called = false; //这个called的作用我看得有点蒙
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    try {
      let then = x.then;  //这里的取属性操作有可能被劫持，所以要try一下
      if (typeof then === 'function') {  //认为它是一个Promise的then
        then.call(x, y => { //调用新的返回的promise(即x)的then方法
          //其作用就是把promise2的状态改为onFULFILLED，并把创建x时resolve的值作为promise2的value
          // promise2.then方法的调用是同步的，而且那时候promise2的状态还是pending状态，说明在那时候调用的时候，promise.then方法的成功和失败的
          // 回调就已经被添加到promise2中了，这时再在这里添加resolve方法，实际上不仅改了promise2的状态，还将promise2.then的回调（回调的添加是同步的）也顺带执行了
          // resolve(y);
          if (called) return;
          called = true;
          // 要进行递归调用来判断y是不是一个promise
          resolvePromise(promise2, y, resolve, reject);
        }, r => { //当构建x时选择了了reject()或者构建x时同步的出错时（捕获了也会调用reject()），就会进入这个回调
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
  catch(onRejected) {
    return this.then(null, onRejected);
  }
}
module.exports = MyPromise;