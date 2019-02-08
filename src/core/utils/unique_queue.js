module.exports = function (width, min = 0) {
  let data = Array(width);
  let i = width;

  while (i--) data[i] = width - i + min;

  return {
    free: i => data.push(i),
    reserve: () => data.pop()
  }
}