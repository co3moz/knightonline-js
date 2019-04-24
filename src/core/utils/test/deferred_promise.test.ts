import { Spec } from "nole";
import { assert } from "chai";
import { CreateDeferredPromise } from "../deferred_promise";

export class DeferredPromiseTest {
  @Spec(10)
  async BasicCase() {
    let promise = CreateDeferredPromise();

    promise.resolve(1);

    assert.equal(await promise, 1);
  }

  @Spec(10)
  async ErrorCase() {
    let promise = CreateDeferredPromise();
    promise.reject(<any> 1);

    try {
      await promise;
    } catch(e) {

    }
  }
}