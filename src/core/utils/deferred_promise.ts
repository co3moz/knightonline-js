export function CreateDeferredPromise(): IDeferredPromise {
  let resolve: { (value?: any): void; (): void; }, reject: { (reason?: any): void; (error: Error): void; };
  let promise: IDeferredPromise = new Promise((a, b) => {
    resolve = a;
    reject = b;
  });

  promise.resolve = resolve;
  promise.reject = reject;

  return promise;
}

export interface IDeferredPromise extends Promise<any> {
  resolve?: (data?: any) => void
  reject?: (error: Error) => void
}