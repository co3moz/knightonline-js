import { Spec } from "nole";
import { AverageTime } from "../average_time.js";
import { assert } from "chai";

export class AverageTimeTest {
  averageTime: AverageTime;

  @Spec()
  CreateInstance() {
    this.averageTime = AverageTime.instance(10);
  }

  @Spec()
  PushSomeData() {
    for (let i = 0; i <= 10; i++) {
      this.averageTime.push(i);
    }
  }

  @Spec()
  ExpectValueToBeValid() {
    assert.equal(this.averageTime.avg(), 5.5);
    assert.equal(this.averageTime.values().length, 10);
  }
}
