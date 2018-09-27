module.exports = function (width) {
  let data = Array(width);
  let i = width;

  while (i--) data[i] = width - i;

  return {
    free: i => data.push(i),
    reserve: () => data.pop()
  }
}