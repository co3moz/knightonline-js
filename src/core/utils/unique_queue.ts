/**
 * Stores number stack for uuids, sessions etc..
 */
export class UniqueQueue {
  private array: number[];
  private size: number;

  private constructor(size: number, min: number) {
    let data = Array(size);
    let i = size;

    while (i--) data[i] = size - i + min;
    this.array = data;
    this.size = size;
  }

  /**
   * Creates stack
   * @param size how much item hold
   * @param min numbers starts with
   */
  public static from(size: number, min: number = 0) {
    return new UniqueQueue(size, min);
  }

  /**
   * Puts the number back to stack
   * @param i number
   */
  free(i: number) {
    return this.array.push(i);
  }

  /**
   * Gets new number from stack. It might be undefined
   */
  reserve() {
    return this.array.pop();
  }

  /**
   * How much number is available.
   */
  freeSize() {
    return this.array.length;
  }

  /**
   * How much number is used.
   */
  reservedSize() {
    return this.size - this.freeSize();
  }
}
