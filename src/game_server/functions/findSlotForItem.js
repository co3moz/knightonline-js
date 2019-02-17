const { INVENTORY_START, INVENTORY_END } = require('../var/item_slot');

module.exports = (socket, itemDetail, count = 1) => {
  if (!itemDetail) return -1;

  let c = socket.character;
  let items = c.items;
  if (itemDetail.countable) { // can item stack together like pots, buses, or quest stuff..
    let emptySlot = -1;

    for (let i = INVENTORY_START; i < INVENTORY_END; i++) {
      let at = items[i];
      if (!at && emptySlot < 0) emptySlot = i;
      else if (at && at.id == itemDetail.id && at.amount + count <= 9999) return i;
    }

    return emptySlot;
  } else {
    for (let i = INVENTORY_START; i < INVENTORY_END; i++) {
      if (!items[i]) return i;
    }

    return -1;
  }
}