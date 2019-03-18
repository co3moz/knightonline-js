/**
 * Average time calculator
 */
export class AverageTime {
  private array: number[]
  private size: number;
  private total: number;

  private constructor(size) {
    this.array = [];
    this.size = size;
    this.total = 0;
  }


  /**
   * Creates an instance for calculations
   * @param size How much data will be stored
   */
  public static instance(size: number) {
    return new AverageTime(size);
  }


  /**
   * Pushes new data to instance
   * @param time Time information in milliseconds
   */
  public push(time: number) {
    if (this.array.length >= this.size) {
      let item = this.array.pop();
      this.total -= item;
    }

    this.array.unshift(time);
    this.total += time;
  }


  /**
   * Calculates average time.
   */
  public avg() {
    return (this.total / this.array.length * 100 | 0) / 100;
  }


  /**
   * Fetches the stack
   */
  public values() {
    return this.array;
  }
}