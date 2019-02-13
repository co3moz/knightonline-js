const drops = {}
let dropIndex = 1;

exports.wrapDrop = (ownerSession, drop) => {
  let index = dropIndex++;
  drops[index] = {
    session: ownerSession,
    items: drop
  };

  return index;
}

exports.getDrop = dropIndex => {
  return drops[dropIndex];
}