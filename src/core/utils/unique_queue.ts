export function UniqueQueue(width: number, min = 0) {
  let data: number[] = Array(width);
  let i = width;

  while (i--) data[i] = width - i + min;

  return {
    free: (i: number) => data.push(i),
    reserve: () => data.pop()
  }
}