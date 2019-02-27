/**
 * Stores number stack for uuids, sessions etc..
 */
export class UniqueQueue {
  private array: number[];
  private constructor(width: number, min: number) {
    let data = Array(width);
    let i = width;

    while (i--) data[i] = width - i + min;
    this.array = data;
  }

  /**
   * Creates stack
   * @param width how much item hold
   * @param min numbers starts with
   */
  public static from(width: number, min: number = 0) {
    return new UniqueQueue(width, min);
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
}