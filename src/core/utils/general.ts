export class TimeDifference {
  private startAt: [number, number]
  private constructor() {
    this.startAt = process.hrtime();
  }

  public static begin() {
    return new TimeDifference();
  }

  end(): number {
    let diff = process.hrtime(this.startAt);

    return diff[0] * 1000 + diff[1] / 1e6;
  }
}

export function WaitNextTick(): Promise<void> {
  return new Promise(resolve => setImmediate(resolve))
}