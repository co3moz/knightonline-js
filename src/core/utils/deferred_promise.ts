/**
 * Creates Deferred Promise
 */
export function CreateDeferredPromise(timeout?: number): IDeferredPromise {
  let resolve: (value: any) => void;
  let reject: (reason?: any) => void;

  let promise: IDeferredPromise = new Promise((a, b) => {
    resolve = a;
    reject = b;
  });

  if (timeout) {
    let idx = setTimeout(TimeoutRejection, timeout, reject);

    promise.resolve = function () {
      if (idx) {
        clearTimeout(idx);
        idx = null;
      }
      resolve.apply(null, arguments);
    };

    promise.reject = function () {
      if (idx) {
        clearTimeout(idx);
        idx = null;
      }
      reject.apply(null, arguments);
    };
  } else {
    promise.resolve = resolve;
    promise.reject = reject;
  }

  return promise;
}

export interface IDeferredPromise extends Promise<any> {
  resolve?: (data?: any) => void;
  reject?: (error: Error) => void;
}

function TimeoutRejection(reject) {
  reject(new Error("Timeout occurred."));
}
