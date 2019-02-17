const unit = require('../../core/utils/unit');
const { getDrop, removeDrop } = require('../functions/dropHandler');
const region = require('../region');
const sendNoahChange = require('../functions/sendNoahChange');
const sendNoahEvent = require('../functions/sendNoahEvent');
const findSlotForItem = require('../functions/findSlotForItem');
const sendWeightChange = require('../functions/sendWeightChange');
const { INVENTORY_START } = require('../var/item_slot');

module.exports = async function ({ body, socket, opcode }) {
  let dropIndex = body.int();
  let item = body.int();

  try {
    let drop = getDrop(dropIndex);
    if (!drop) throw 1;
    if (drop.session != socket.session) throw 1;

    // TODO: Check drop distance controls  etc..

    let idx = drop.items.findIndex(x => x && x.item == item);
    if (idx == -1) throw 1; // probably already picked

    let dropItem = drop.items[idx];
    drop.items.splice(idx, 1); // take the item from drop

    if (dropItem.item == 900000000) { // Money drop
      sendNoahChange(socket, dropItem.amount, false); // no need to send noah change, we will send with drop_take packet

      socket.send([
        opcode, 1, // success
        ...unit.int(dropIndex),
        0xFF, // item position in inventory (nowhere :D)
        ...unit.int(dropItem.item),
        ...unit.short(dropItem.amount),
        ...unit.int(socket.character.money) // see, we sent the current money
      ]);

      sendNoahEvent(socket, dropItem.amount); // randomly showing 2x, 5x, 50x.. event
    } else {
      let c = socket.character;
      let v = socket.variables;
      let { maxWeight, itemWeight } = v;

      // this part of code has to be sync, we load items when npc dies. calculation all of this can work flawless 
      if (!drop.specs) throw 1; // has to be
      let itemDetailIndex = drop.specs.findIndex(x => x.id == dropItem.item);
      if (itemDetailIndex == -1) throw 1; // has to be
      let itemDetail = drop.specs[itemDetailIndex];

      let newTotalWeight = itemWeight + (itemDetail.weight || 0) * dropItem.amount;
      if (newTotalWeight > maxWeight) {
        return socket.send([
          opcode,
          6 // Weight limit reached..
        ]);
      }

      let slot = findSlotForItem(socket, itemDetail, dropItem.amount);
      if (slot < 0) throw 1;

      if (c.items[slot]) {
        c.items[slot].amount = Math.min(9999, c.items[slot].amount + dropItem.amount);
      } else {
        c.items[slot] = {
          id: itemDetail.id,
          durability: itemDetail.durability,
          amount: dropItem.amount || 1,
          serial: serialGenerate(),
          flag: 0,
          detail: itemDetail
        }
      }

      let outputItem = c.items[slot];
      if (drop.items.findIndex(x => x && x.item == item) == -1) {
        drop.specs.splice(itemDetailIndex, 1); // remove item from specs, no need to store anymore
      }

      socket.send([
        opcode, 1, // success
        ...unit.int(dropIndex),
        slot - INVENTORY_START, // item position in inventory (nowhere :D)
        ...unit.int(outputItem.id),
        ...unit.short(outputItem.amount),
        ...unit.int(c.money) // see, we sent the current money
      ]);

      socket.variables.itemWeight = newTotalWeight;
      sendWeightChange(socket);

      if (itemDetail.itemType == 4 && itemDetail.id != 900144023) {
        region.allSend(socket, [
          0x7D, // LOGOS SHOUT,
          2,
          4,
          ...unit.byte_string(c.name),
          ...unit.int(itemDetail.id)
        ]);
      }
    }

    if (drop.items.length == 0) {
      removeDrop(dropIndex);
    }

  } catch (e) {

    socket.send([
      opcode,
      0 // Loot Error
    ]);
  }
}

function serialGenerate() {
  return Date.now().toString(16) + (Math.random() * 0xFFFFFF | 0).toString(16).padStart(6, '0')
}