const drops = {}
let dropIndex = 1;


exports.wrapDrop = function (ownerSession, drop, itemSpecs, dropOrigin) {
  let index = dropIndex++;
  drops[index] = {
    session: ownerSession,
    items: drop,
    specs: itemSpecs,
    origin: dropOrigin,
    timeout: Date.now() + 1000 * 60 * 5
  };

  return index;
}

exports.getDrop = dropIndex => {
  return drops[dropIndex];
}

exports.removeDrop = dropIndex => {
  if (drops[dropIndex]) {
    delete drops[dropIndex];
  }
}
